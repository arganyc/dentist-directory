/**
 * One-off: fetch the 15 Northern Virginia cities that weren't in the original
 * import script, merge into the existing dentists-data.json by NPI.
 *
 * - Longer per-request delay (1500ms) to be polite under timeout conditions
 * - Exponential backoff retry on timeouts / 5xx / 429 (up to 5 attempts)
 * - Skips a city after exhausting retries instead of aborting the whole run
 *
 * Run: node scripts/import-va-cities.ts
 */

import { existsSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

const API_BASE = "https://npiregistry.cms.hhs.gov/api/";
const API_VERSION = "2.1";
const LIMIT_PER_REQUEST = 200;
const DELAY_MS = 1500;
const REQUEST_TIMEOUT_MS = 45_000;
const MAX_ATTEMPTS = 5;
const BACKOFF_BASE_MS = 1000;
const STATE = "VA";
const NEW_CITIES = [
  "Arlington", "Ashburn", "McLean", "Reston", "Woodbridge",
  "Centreville", "Chantilly", "Sterling", "Manassas", "Manassas Park",
  "Leesburg", "Vienna", "Herndon", "Purcellville", "Dumfries",
];

const SOURCE = path.resolve(process.cwd(), "dentists-data.json");

type NPIProvider = { number: string; [k: string]: unknown };
type NPIResponse = { result_count?: number; results?: NPIProvider[]; Errors?: { description: string }[] };

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

function pad(n: number, w: number): string {
  return String(n).padStart(w, " ");
}

async function fetchOnce(city: string): Promise<NPIProvider[]> {
  const url = new URL(API_BASE);
  url.searchParams.set("version", API_VERSION);
  url.searchParams.set("taxonomy_description", "Dentist");
  url.searchParams.set("state", STATE);
  url.searchParams.set("city", city);
  url.searchParams.set("limit", String(LIMIT_PER_REQUEST));
  url.searchParams.set("skip", "0");

  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), REQUEST_TIMEOUT_MS);
  try {
    const res = await fetch(url.toString(), { signal: ctrl.signal });
    if (!res.ok) {
      // 429/5xx are transient — surface as retryable
      const transient = res.status === 429 || res.status >= 500;
      const err = new Error(`HTTP ${res.status} ${res.statusText}`) as Error & { transient?: boolean };
      err.transient = transient;
      throw err;
    }
    const data = (await res.json()) as NPIResponse;
    if (data.Errors?.length) {
      throw new Error(`API error: ${data.Errors.map((e) => e.description).join("; ")}`);
    }
    return data.results ?? [];
  } finally {
    clearTimeout(timer);
  }
}

function isRetryable(err: unknown): boolean {
  if (!(err instanceof Error)) return false;
  // Network/fetch errors and AbortError are transient
  if (err.name === "AbortError") return true;
  if (err.name === "TypeError" && /fetch failed|network/i.test(err.message)) return true;
  if ((err as { transient?: boolean }).transient) return true;
  if (/ECONNRESET|ETIMEDOUT|EAI_AGAIN|UND_ERR_/i.test(err.message)) return true;
  return false;
}

async function fetchWithRetry(city: string): Promise<NPIProvider[]> {
  let lastError: unknown;
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      return await fetchOnce(city);
    } catch (err) {
      lastError = err;
      const message = err instanceof Error ? err.message : String(err);
      if (attempt === MAX_ATTEMPTS || !isRetryable(err)) {
        throw new Error(`${message} (after ${attempt} attempt${attempt > 1 ? "s" : ""})`);
      }
      // Exponential backoff: 1s, 2s, 4s, 8s, plus small jitter
      const delay = BACKOFF_BASE_MS * 2 ** (attempt - 1) + Math.floor(Math.random() * 250);
      console.log(`    retry ${attempt}/${MAX_ATTEMPTS - 1} after ${message} — waiting ${delay}ms`);
      await sleep(delay);
    }
  }
  throw lastError ?? new Error("unreachable");
}

async function main(): Promise<void> {
  if (!existsSync(SOURCE)) {
    console.error(`Source file not found: ${SOURCE}`);
    console.error("Run 'npm run import-dentists' first.");
    process.exit(1);
  }

  console.log("Loading existing dataset...");
  const existing: NPIProvider[] = JSON.parse(readFileSync(SOURCE, "utf8"));
  const byNpi = new Map<string, NPIProvider>();
  for (const p of existing) {
    if (p?.number) byNpi.set(p.number, p);
  }
  console.log(`  ${byNpi.size.toLocaleString()} records loaded`);

  const errors: { city: string; error: string }[] = [];
  const startTime = Date.now();
  let totalFetched = 0;
  let totalAdded = 0;

  for (let i = 0; i < NEW_CITIES.length; i++) {
    const city = NEW_CITIES[i];
    const prefix = `[${pad(i + 1, 2)}/${NEW_CITIES.length}]`;
    try {
      const results = await fetchWithRetry(city);
      totalFetched += results.length;
      let added = 0;
      for (const p of results) {
        if (p.number && !byNpi.has(p.number)) {
          byNpi.set(p.number, p);
          added++;
        }
      }
      totalAdded += added;
      const elapsed = `${((Date.now() - startTime) / 1000).toFixed(1)}s`;
      console.log(
        `${prefix} ${`${city}, ${STATE}`.padEnd(28)} ${pad(results.length, 3)} fetched  +${pad(added, 3)} new  ${pad(byNpi.size, 6)} total  (${elapsed})`
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      errors.push({ city, error: message });
      console.error(`${prefix} ${city}, ${STATE} — FAILED: ${message}`);
    }
    if (i < NEW_CITIES.length - 1) {
      await sleep(DELAY_MS);
    }
  }

  console.log("");
  console.log("Writing merged dataset...");
  writeFileSync(SOURCE, JSON.stringify(Array.from(byNpi.values())), "utf8");

  console.log("");
  console.log(`Done in ${((Date.now() - startTime) / 1000).toFixed(1)}s`);
  console.log(`  Fetched:  ${totalFetched.toLocaleString()} provider records`);
  console.log(`  Added:    ${totalAdded.toLocaleString()} new (deduped by NPI)`);
  console.log(`  Total:    ${byNpi.size.toLocaleString()} records in dentists-data.json`);
  console.log(`  Errors:   ${errors.length}`);
  if (errors.length > 0) {
    console.log("");
    console.log("Failed cities:");
    for (const e of errors) console.log(`  - ${e.city}: ${e.error}`);
  }
}

main().catch((err) => {
  console.error("\nFatal:", err);
  process.exit(1);
});
