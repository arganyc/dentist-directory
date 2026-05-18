/**
 * Builds a curated ~5k-dentist subset from dentists-data.json for production
 * deployment. The full 105 MB dataset is too large for Vercel serverless
 * functions (50 MB Hobby tier limit, slow cold starts). This subset preserves
 * representation across all 50 states.
 *
 * Strategy:
 *   - Target ~5000 total records
 *   - Per-state quota proportional to that state's dentist count
 *   - Floor: 25 per state (so small states stay visible)
 *   - Ceiling: 200 per state (so CA/TX don't dominate)
 *   - Sorted by NPI within state for deterministic selection
 *
 * Run:  npm run build:subset
 * Out:  ./data/dentists-subset.json (commit this file)
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync, statSync } from "node:fs";
import path from "node:path";

const SOURCE = path.resolve(process.cwd(), "dentists-data.json");
const OUT_DIR = path.resolve(process.cwd(), "data");
const OUT_FILE = path.resolve(OUT_DIR, "dentists-subset.json");

const TARGET_TOTAL = 5000;
const MIN_PER_STATE = 25;
const MAX_PER_STATE = 200;

type NPIRecord = {
  number?: string;
  addresses?: { address_purpose?: string; state?: string }[];
};

function pickLocationState(record: NPIRecord): string {
  const loc = record.addresses?.find((a) => a.address_purpose === "LOCATION");
  const state = (loc?.state ?? record.addresses?.[0]?.state ?? "").toUpperCase();
  return state;
}

function main(): void {
  if (!existsSync(SOURCE)) {
    console.error(`Source file not found: ${SOURCE}`);
    console.error(`Run 'npm run import-dentists' first.`);
    process.exit(1);
  }

  const sizeBytes = statSync(SOURCE).size;
  const sizeMb = (sizeBytes / 1024 / 1024).toFixed(1);
  console.log(`Loading source dataset (${sizeMb} MB)...`);
  const records: NPIRecord[] = JSON.parse(readFileSync(SOURCE, "utf8"));
  console.log(`  ${records.length.toLocaleString()} records loaded`);

  const byState = new Map<string, NPIRecord[]>();
  for (const r of records) {
    const state = pickLocationState(r);
    if (!state) continue;
    let bucket = byState.get(state);
    if (!bucket) {
      bucket = [];
      byState.set(state, bucket);
    }
    bucket.push(r);
  }

  console.log(`  ${byState.size} states represented`);

  const totalAvailable = Array.from(byState.values()).reduce((sum, arr) => sum + arr.length, 0);
  const ratio = TARGET_TOTAL / totalAvailable;

  const selected: NPIRecord[] = [];
  const perStateCounts: { state: string; quota: number; selected: number }[] = [];

  const sortedStates = Array.from(byState.entries()).sort(([a], [b]) => a.localeCompare(b));

  for (const [state, bucket] of sortedStates) {
    const proportional = Math.round(bucket.length * ratio);
    const quota = Math.min(MAX_PER_STATE, Math.max(MIN_PER_STATE, proportional));
    bucket.sort((a, b) => (a.number ?? "").localeCompare(b.number ?? ""));
    const slice = bucket.slice(0, Math.min(quota, bucket.length));
    selected.push(...slice);
    perStateCounts.push({ state, quota, selected: slice.length });
  }

  mkdirSync(OUT_DIR, { recursive: true });
  const json = JSON.stringify(selected);
  writeFileSync(OUT_FILE, json, "utf8");
  const outSize = statSync(OUT_FILE).size;
  const outMb = (outSize / 1024 / 1024).toFixed(2);

  console.log("");
  console.log("Per-state selection:");
  for (const { state, quota, selected: n } of perStateCounts) {
    const note = n < quota ? ` (only ${n} available)` : "";
    console.log(`  ${state}  quota=${String(quota).padStart(3)}  selected=${String(n).padStart(3)}${note}`);
  }

  console.log("");
  console.log(`Done`);
  console.log(`  Selected: ${selected.length.toLocaleString()} of ${records.length.toLocaleString()}`);
  console.log(`  Output:   ${OUT_FILE}`);
  console.log(`  Size:     ${outMb} MB (${outSize.toLocaleString()} bytes)`);
}

main();
