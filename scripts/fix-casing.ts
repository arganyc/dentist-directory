/**
 * One-off cleanup: re-normalize existing DB rows whose city/name/practice_name/
 * street were title-cased before the Mc/O' fix landed in migrate.ts.
 *
 *   Mclean   → McLean
 *   Mccarthy → McCarthy
 *   O'brien  → O'Brien
 *
 * Idempotent — re-running is a no-op if everything's already clean.
 *
 * Run: npm run db:fix-casing
 */

import { neon } from "@neondatabase/serverless";

function titleCase(str: string): string {
  if (!str) return "";
  return str
    .toLowerCase()
    .split(/(\s|[-,.\/'"])/)
    .map((part) => {
      if (part.length === 0) return part;
      if (/^mc[a-z]/.test(part)) {
        return "Mc" + part.charAt(2).toUpperCase() + part.slice(3);
      }
      if (/[a-z]/.test(part[0])) {
        return part[0].toUpperCase() + part.slice(1);
      }
      return part;
    })
    .join("");
}

type Row = {
  id: string;
  city: string;
  name: string;
  practice_name: string;
  street: string;
};

const BATCH_SIZE = 200;

async function main(): Promise<void> {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error("DATABASE_URL is not set. Add it to .env.local.");
    process.exit(1);
  }
  const sql = neon(url);

  // Postgres POSIX regex: Mc followed by a lowercase letter (the broken form)
  // OR O' followed by a lowercase letter.
  const filter = `city ~ 'Mc[a-z]' OR name ~ 'Mc[a-z]' OR practice_name ~ 'Mc[a-z]' OR street ~ 'Mc[a-z]'
                OR city ~ E'O''[a-z]' OR name ~ E'O''[a-z]' OR practice_name ~ E'O''[a-z]' OR street ~ E'O''[a-z]'`;

  console.log("Scanning for rows that need re-casing...");
  const candidates = (await sql.query(
    `SELECT id, city, name, practice_name, street FROM dentists WHERE ${filter}`
  )) as Row[];
  console.log(`  ${candidates.length.toLocaleString()} candidate rows`);

  const updates: { id: string; city?: string; name?: string; practice_name?: string; street?: string }[] = [];
  for (const row of candidates) {
    const newCity = titleCase(row.city);
    const newName = titleCase(row.name);
    const newPractice = titleCase(row.practice_name);
    const newStreet = titleCase(row.street);
    const changed: typeof updates[number] = { id: row.id };
    let anyChange = false;
    if (newCity !== row.city) { changed.city = newCity; anyChange = true; }
    if (newName !== row.name) { changed.name = newName; anyChange = true; }
    if (newPractice !== row.practice_name) { changed.practice_name = newPractice; anyChange = true; }
    if (newStreet !== row.street) { changed.street = newStreet; anyChange = true; }
    if (anyChange) updates.push(changed);
  }

  console.log(`  ${updates.length.toLocaleString()} rows actually need updating`);
  if (updates.length === 0) {
    console.log("Nothing to do.");
    return;
  }

  // Sample preview
  console.log("");
  console.log("Sample of changes (up to 5):");
  for (const u of updates.slice(0, 5)) {
    const orig = candidates.find((c) => c.id === u.id)!;
    if (u.city) console.log(`  city:          '${orig.city}' → '${u.city}'`);
    if (u.name) console.log(`  name:          '${orig.name}' → '${u.name}'`);
    if (u.practice_name) console.log(`  practice_name: '${orig.practice_name}' → '${u.practice_name}'`);
    if (u.street) console.log(`  street:        '${orig.street}' → '${u.street}'`);
    console.log("  ---");
  }

  console.log("");
  console.log("Applying updates...");
  const startTime = Date.now();
  let applied = 0;

  for (let i = 0; i < updates.length; i += BATCH_SIZE) {
    const batch = updates.slice(i, i + BATCH_SIZE);
    // Run each UPDATE individually; @neondatabase/serverless doesn't have
    // multi-statement support, so we do BATCH_SIZE small parameterized updates.
    await Promise.all(
      batch.map((u) => {
        const setParts: string[] = [];
        const params: string[] = [];
        let idx = 1;
        if (u.city !== undefined) { setParts.push(`city = $${idx++}`); params.push(u.city); }
        if (u.name !== undefined) { setParts.push(`name = $${idx++}`); params.push(u.name); }
        if (u.practice_name !== undefined) { setParts.push(`practice_name = $${idx++}`); params.push(u.practice_name); }
        if (u.street !== undefined) { setParts.push(`street = $${idx++}`); params.push(u.street); }
        params.push(u.id);
        return sql.query(`UPDATE dentists SET ${setParts.join(", ")} WHERE id = $${idx}`, params);
      })
    );
    applied += batch.length;
    if (i / BATCH_SIZE % 5 === 0 || i + BATCH_SIZE >= updates.length) {
      const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
      console.log(`  ${applied.toLocaleString()} / ${updates.length.toLocaleString()} (${elapsed}s)`);
    }
  }

  console.log("");
  console.log(`Done in ${((Date.now() - startTime) / 1000).toFixed(1)}s`);

  // Spot-check
  const [check] = (await sql`SELECT COUNT(*)::int AS n FROM dentists WHERE city = 'McLean'`) as { n: number }[];
  console.log(`  McLean city rows now: ${check.n}`);
}

main().catch((err) => {
  console.error("\nFailed:", err);
  process.exit(1);
});
