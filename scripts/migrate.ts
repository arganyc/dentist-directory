/**
 * One-time migration: load dentists-data.json into Vercel Postgres.
 *
 * Run: npm run db:migrate
 *   (uses --env-file=.env.local for DATABASE_URL)
 *
 * Safe to re-run: schema is created IF NOT EXISTS, rows are inserted with
 * ON CONFLICT (id) DO NOTHING so existing records are preserved.
 *
 * To start completely fresh, pass --reset:
 *   npm run db:migrate -- --reset
 */

import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { neon } from "@neondatabase/serverless";

const SOURCE = path.resolve(process.cwd(), "dentists-data.json");
const BATCH_SIZE = 500;

const RESET = process.argv.includes("--reset");

type NPIAddress = {
  address_purpose?: string;
  address_1?: string;
  address_2?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  telephone_number?: string;
};

type NPITaxonomy = {
  code?: string;
  desc?: string;
  primary?: boolean;
};

type NPIRecord = {
  number?: string;
  enumeration_type?: string;
  basic?: {
    first_name?: string;
    last_name?: string;
    name_prefix?: string;
    credential?: string;
    organization_name?: string;
    authorized_official_credential?: string;
    enumeration_date?: string;
  };
  addresses?: NPIAddress[];
  taxonomies?: NPITaxonomy[];
};

type Row = {
  id: string;
  slug: string;
  name: string;
  credentials: string;
  specialty: string;
  practice_name: string;
  street: string;
  city: string;
  state: string;
  state_code: string;
  zip: string;
  phone: string;
  rating: number;
  review_count: number;
  accepting_new_patients: boolean;
  years_experience: number;
};

const US_STATES: { code: string; name: string }[] = [
  { code: "AL", name: "Alabama" }, { code: "AK", name: "Alaska" },
  { code: "AZ", name: "Arizona" }, { code: "AR", name: "Arkansas" },
  { code: "CA", name: "California" }, { code: "CO", name: "Colorado" },
  { code: "CT", name: "Connecticut" }, { code: "DE", name: "Delaware" },
  { code: "DC", name: "District of Columbia" }, { code: "FL", name: "Florida" },
  { code: "GA", name: "Georgia" }, { code: "HI", name: "Hawaii" },
  { code: "ID", name: "Idaho" }, { code: "IL", name: "Illinois" },
  { code: "IN", name: "Indiana" }, { code: "IA", name: "Iowa" },
  { code: "KS", name: "Kansas" }, { code: "KY", name: "Kentucky" },
  { code: "LA", name: "Louisiana" }, { code: "ME", name: "Maine" },
  { code: "MD", name: "Maryland" }, { code: "MA", name: "Massachusetts" },
  { code: "MI", name: "Michigan" }, { code: "MN", name: "Minnesota" },
  { code: "MS", name: "Mississippi" }, { code: "MO", name: "Missouri" },
  { code: "MT", name: "Montana" }, { code: "NE", name: "Nebraska" },
  { code: "NV", name: "Nevada" }, { code: "NH", name: "New Hampshire" },
  { code: "NJ", name: "New Jersey" }, { code: "NM", name: "New Mexico" },
  { code: "NY", name: "New York" }, { code: "NC", name: "North Carolina" },
  { code: "ND", name: "North Dakota" }, { code: "OH", name: "Ohio" },
  { code: "OK", name: "Oklahoma" }, { code: "OR", name: "Oregon" },
  { code: "PA", name: "Pennsylvania" }, { code: "RI", name: "Rhode Island" },
  { code: "SC", name: "South Carolina" }, { code: "SD", name: "South Dakota" },
  { code: "TN", name: "Tennessee" }, { code: "TX", name: "Texas" },
  { code: "UT", name: "Utah" }, { code: "VT", name: "Vermont" },
  { code: "VA", name: "Virginia" }, { code: "WA", name: "Washington" },
  { code: "WV", name: "West Virginia" }, { code: "WI", name: "Wisconsin" },
  { code: "WY", name: "Wyoming" },
];
const STATE_NAME = new Map(US_STATES.map((s) => [s.code, s.name]));
const VALID_STATES = new Set(US_STATES.map((s) => s.code));

const SPECIALTY_MAP: { match: RegExp; specialty: string }[] = [
  { match: /orthodontic/i, specialty: "Orthodontics" },
  { match: /pediatric/i, specialty: "Pediatric Dentistry" },
  { match: /endodontic/i, specialty: "Endodontics" },
  { match: /periodontic/i, specialty: "Periodontics" },
  { match: /oral.*surgery|maxillofacial surgery/i, specialty: "Oral Surgery" },
  { match: /prosthodontic/i, specialty: "Prosthodontics" },
  { match: /public health/i, specialty: "Dental Public Health" },
];

function classifySpecialty(desc?: string): string {
  if (!desc) return "General Dentistry";
  for (const { match, specialty } of SPECIALTY_MAP) {
    if (match.test(desc)) return specialty;
  }
  return "General Dentistry";
}

function pickDental(taxonomies?: NPITaxonomy[]): NPITaxonomy | undefined {
  if (!taxonomies?.length) return undefined;
  return taxonomies.find((t) => t.code?.startsWith("1223"))
    ?? taxonomies.find((t) => t.primary)
    ?? taxonomies[0];
}

function pickAddress(addresses?: NPIAddress[]): NPIAddress | undefined {
  if (!addresses?.length) return undefined;
  return addresses.find((a) => a.address_purpose === "LOCATION") ?? addresses[0];
}

function titleCase(str: string): string {
  if (!str) return "";
  // Split on whitespace, punctuation, AND apostrophe (so O'Brien tokenizes
  // as "o" + "'" + "brien" and we can capitalize the letter after the apostrophe).
  return str
    .toLowerCase()
    .split(/(\s|[-,.\/'"])/)
    .map((part) => {
      if (part.length === 0) return part;
      // "Mc" + lowercase letter → capitalize both M and the letter after Mc
      // (McLean, McCarthy, McAllen, McKinney, ...).
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

function formatPhone(raw?: string): string {
  if (!raw) return "";
  const digits = raw.replace(/\D/g, "");
  if (digits.length === 10) return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  if (digits.length === 11 && digits.startsWith("1")) return `(${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7)}`;
  return raw;
}

function formatZip(raw?: string): string {
  if (!raw) return "";
  const digits = raw.replace(/\D/g, "");
  if (digits.length === 9) return `${digits.slice(0, 5)}-${digits.slice(5)}`;
  return digits.slice(0, 5);
}

function hashSeed(input: string): number {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

function buildName(npi: NPIRecord): { name: string; credentials: string; practiceName: string } {
  if (npi.enumeration_type === "NPI-2") {
    const org = titleCase(npi.basic?.organization_name ?? "");
    const credRaw = npi.basic?.authorized_official_credential ?? "";
    const credentials = credRaw && credRaw !== "--" ? credRaw.toUpperCase() : "";
    return { name: org, credentials, practiceName: org };
  }
  const first = titleCase(npi.basic?.first_name ?? "");
  const last = titleCase(npi.basic?.last_name ?? "");
  const rawPrefix = npi.basic?.name_prefix;
  const prefix = rawPrefix && rawPrefix !== "--" ? rawPrefix : "Dr.";
  const name = `${prefix} ${first} ${last}`.replace(/\s+/g, " ").trim();
  const credRaw = npi.basic?.credential ?? "";
  const credentials = credRaw && credRaw !== "--" ? credRaw.toUpperCase().replace(/,?\s+/g, ", ").replace(/\.$/, "") : "DDS";
  const practiceName = last ? `${last} Dental` : "Dental Practice";
  return { name, credentials, practiceName };
}

function normalize(npi: NPIRecord): Row | null {
  const number = npi.number;
  if (!number) return null;
  const addr = pickAddress(npi.addresses);
  if (!addr?.state) return null;
  const stateCode = addr.state.toUpperCase();
  if (!VALID_STATES.has(stateCode)) return null;

  const taxonomy = pickDental(npi.taxonomies);
  const specialty = classifySpecialty(taxonomy?.desc);
  const { name, credentials, practiceName } = buildName(npi);
  if (!name) return null;

  const seed = hashSeed(number);
  const rating = parseFloat((3.5 + (seed % 16) / 10).toFixed(1));
  const reviewCount = 5 + (seed % 295);
  const accepting = (seed >>> 4) % 10 < 7;

  let years = 5;
  const enumDate = npi.basic?.enumeration_date;
  if (enumDate) {
    const year = parseInt(enumDate.slice(0, 4), 10);
    if (Number.isFinite(year)) years = Math.max(1, new Date().getFullYear() - year);
  }

  const street = [titleCase(addr.address_1 ?? ""), titleCase(addr.address_2 ?? "")].filter(Boolean).join(", ");
  const city = titleCase(addr.city ?? "");
  const state = STATE_NAME.get(stateCode) ?? stateCode;

  return {
    id: number,
    slug: `${slugify(name)}-${number}`,
    name,
    credentials,
    specialty,
    practice_name: practiceName,
    street,
    city,
    state,
    state_code: stateCode,
    zip: formatZip(addr.postal_code),
    phone: formatPhone(addr.telephone_number),
    rating,
    review_count: reviewCount,
    accepting_new_patients: accepting,
    years_experience: years,
  };
}

async function main(): Promise<void> {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error("DATABASE_URL is not set. Add it to .env.local first.");
    process.exit(1);
  }
  if (!existsSync(SOURCE)) {
    console.error(`Source file not found: ${SOURCE}`);
    console.error(`Run 'npm run import-dentists' first to fetch the NPI data.`);
    process.exit(1);
  }

  const sql = neon(url);

  if (RESET) {
    console.log("Dropping existing schema (--reset)...");
    await sql`DROP TABLE IF EXISTS dentists`;
  }

  console.log("Creating schema...");
  await sql`
    CREATE TABLE IF NOT EXISTS dentists (
      id                      TEXT PRIMARY KEY,
      slug                    TEXT UNIQUE NOT NULL,
      name                    TEXT NOT NULL,
      credentials             TEXT NOT NULL DEFAULT '',
      specialty               TEXT NOT NULL,
      practice_name           TEXT NOT NULL,
      street                  TEXT NOT NULL DEFAULT '',
      city                    TEXT NOT NULL DEFAULT '',
      state                   TEXT NOT NULL,
      state_code              TEXT NOT NULL,
      zip                     TEXT NOT NULL DEFAULT '',
      phone                   TEXT NOT NULL DEFAULT '',
      rating                  NUMERIC(2,1) NOT NULL,
      review_count            INT NOT NULL,
      accepting_new_patients  BOOLEAN NOT NULL,
      years_experience        INT NOT NULL
    )
  `;
  await sql`CREATE INDEX IF NOT EXISTS idx_dentists_state_code ON dentists(state_code)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_dentists_state_city ON dentists(state_code, city)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_dentists_specialty ON dentists(specialty)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_dentists_accepting ON dentists(accepting_new_patients) WHERE accepting_new_patients`;
  await sql`CREATE INDEX IF NOT EXISTS idx_dentists_featured ON dentists(rating DESC, review_count DESC)`;

  console.log("Reading source dataset...");
  const raw: NPIRecord[] = JSON.parse(readFileSync(SOURCE, "utf8"));
  console.log(`  ${raw.length.toLocaleString()} records loaded`);

  const rows: Row[] = [];
  const seenSlugs = new Set<string>();
  let dropped = 0;
  for (const r of raw) {
    const row = normalize(r);
    if (!row) { dropped++; continue; }
    if (seenSlugs.has(row.slug)) { dropped++; continue; }
    seenSlugs.add(row.slug);
    rows.push(row);
  }
  console.log(`  ${rows.length.toLocaleString()} normalized (${dropped.toLocaleString()} dropped: invalid state, missing name, or duplicate slug)`);

  console.log("Inserting rows...");
  const startInsert = Date.now();
  let inserted = 0;

  for (let i = 0; i < rows.length; i += BATCH_SIZE) {
    const batch = rows.slice(i, i + BATCH_SIZE);
    const cols = [
      "id", "slug", "name", "credentials", "specialty", "practice_name",
      "street", "city", "state", "state_code", "zip", "phone",
      "rating", "review_count", "accepting_new_patients", "years_experience",
    ];
    const params: (string | number | boolean)[] = [];
    const placeholders: string[] = [];
    batch.forEach((row, j) => {
      const offset = j * cols.length;
      placeholders.push(`(${cols.map((_, k) => `$${offset + k + 1}`).join(", ")})`);
      params.push(
        row.id, row.slug, row.name, row.credentials, row.specialty, row.practice_name,
        row.street, row.city, row.state, row.state_code, row.zip, row.phone,
        row.rating, row.review_count, row.accepting_new_patients, row.years_experience,
      );
    });
    const stmt = `INSERT INTO dentists (${cols.join(", ")}) VALUES ${placeholders.join(", ")} ON CONFLICT (id) DO NOTHING`;
    await sql.query(stmt, params);
    inserted += batch.length;
    if (((i / BATCH_SIZE) | 0) % 5 === 0 || i + BATCH_SIZE >= rows.length) {
      const elapsed = ((Date.now() - startInsert) / 1000).toFixed(1);
      console.log(`  ${inserted.toLocaleString()} / ${rows.length.toLocaleString()}  (${elapsed}s)`);
    }
  }

  const elapsed = ((Date.now() - startInsert) / 1000).toFixed(1);
  console.log("");
  console.log(`Done in ${elapsed}s. Verifying...`);

  const [countRow] = (await sql`SELECT COUNT(*)::int AS n FROM dentists`) as { n: number }[];
  const [caRow] = (await sql`SELECT COUNT(*)::int AS n FROM dentists WHERE state_code = 'CA'`) as { n: number }[];
  console.log(`  Total rows:     ${countRow.n.toLocaleString()}`);
  console.log(`  CA dentists:    ${caRow.n.toLocaleString()}`);
}

main().catch((err) => {
  console.error("\nMigration failed:", err);
  process.exit(1);
});
