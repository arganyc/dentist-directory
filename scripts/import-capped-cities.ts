/**
 * One-off: paginate past the 200-record cap for cities that hit it during
 * the original import. Identifies capped cities from the local dataset
 * (>= 150 LOCATION-matched records is the heuristic for "was likely capped")
 * and fetches additional pages from the NPI Registry via skip=200, 400, ...
 *
 * - 1500ms per-request delay, exponential backoff (1s → 2s → 4s → 8s) on
 *   transient failures (timeouts / 429 / 5xx), up to 5 attempts.
 * - The NPI API limits result_count to ~1200, so per-city additional fetches
 *   max out at ~5 pages (1000 more records).
 * - Skips a city after exhausted retries rather than aborting the whole run.
 *
 * Run: node scripts/import-capped-cities.ts
 *      node scripts/import-capped-cities.ts --threshold 180   (stricter)
 *      node scripts/import-capped-cities.ts --dry-run         (no writes)
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
const MAX_PAGES_PER_CITY = 6; // skip=200, 400, 600, 800, 1000, 1200 — NPI caps at 1200

const args = process.argv.slice(2);
const DRY_RUN = args.includes("--dry-run");
const thresholdIdx = args.indexOf("--threshold");
const THRESHOLD = thresholdIdx >= 0 ? parseInt(args[thresholdIdx + 1], 10) : 150;

const SOURCE = path.resolve(process.cwd(), "dentists-data.json");

/**
 * Copy of CITIES_BY_STATE from scripts/import-dentists.ts. Kept inline to
 * avoid coupling this one-off to the main importer. If you edit the master
 * list, sync this one (or just delete this file — it has served its purpose).
 */
const CITIES_BY_STATE: Record<string, string[]> = {
  AL: ["Birmingham", "Montgomery", "Mobile", "Huntsville", "Tuscaloosa", "Hoover", "Auburn", "Dothan", "Decatur", "Madison"],
  AK: ["Anchorage", "Fairbanks", "Juneau", "Wasilla", "Sitka", "Ketchikan", "Kenai", "Kodiak", "Bethel", "Palmer"],
  AZ: ["Phoenix", "Tucson", "Mesa", "Chandler", "Scottsdale", "Glendale", "Gilbert", "Tempe", "Peoria", "Surprise"],
  AR: ["Little Rock", "Fort Smith", "Fayetteville", "Springdale", "Jonesboro", "Rogers", "Conway", "Bentonville", "Pine Bluff", "North Little Rock"],
  CA: ["Los Angeles", "San Diego", "San Jose", "San Francisco", "Fresno", "Sacramento", "Long Beach", "Oakland", "Bakersfield", "Anaheim"],
  CO: ["Denver", "Colorado Springs", "Aurora", "Fort Collins", "Lakewood", "Thornton", "Arvada", "Westminster", "Pueblo", "Centennial"],
  CT: ["Bridgeport", "New Haven", "Stamford", "Hartford", "Waterbury", "Norwalk", "Danbury", "New Britain", "Meriden", "Bristol"],
  DE: ["Wilmington", "Dover", "Newark", "Middletown", "Smyrna", "Milford", "Seaford", "Georgetown", "Elsmere", "New Castle"],
  FL: ["Jacksonville", "Miami", "Tampa", "Orlando", "Saint Petersburg", "Hialeah", "Tallahassee", "Fort Lauderdale", "Port Saint Lucie", "Cape Coral"],
  GA: ["Atlanta", "Augusta", "Columbus", "Macon", "Savannah", "Athens", "Sandy Springs", "Roswell", "Johns Creek", "Albany"],
  HI: ["Honolulu", "Pearl City", "Hilo", "Kailua", "Waipahu", "Kaneohe", "Mililani", "Kahului", "Aiea", "Ewa Beach"],
  ID: ["Boise", "Meridian", "Nampa", "Idaho Falls", "Pocatello", "Caldwell", "Coeur d'Alene", "Twin Falls", "Lewiston", "Post Falls"],
  IL: ["Chicago", "Aurora", "Rockford", "Joliet", "Naperville", "Springfield", "Peoria", "Elgin", "Waukegan", "Cicero"],
  IN: ["Indianapolis", "Fort Wayne", "Evansville", "South Bend", "Carmel", "Fishers", "Bloomington", "Hammond", "Gary", "Lafayette"],
  IA: ["Des Moines", "Cedar Rapids", "Davenport", "Sioux City", "Iowa City", "Waterloo", "Council Bluffs", "Ames", "West Des Moines", "Dubuque"],
  KS: ["Wichita", "Overland Park", "Kansas City", "Olathe", "Topeka", "Lawrence", "Shawnee", "Manhattan", "Lenexa", "Salina"],
  KY: ["Louisville", "Lexington", "Bowling Green", "Owensboro", "Covington", "Hopkinsville", "Richmond", "Florence", "Georgetown", "Henderson"],
  LA: ["New Orleans", "Baton Rouge", "Shreveport", "Lafayette", "Lake Charles", "Kenner", "Bossier City", "Monroe", "Alexandria", "Houma"],
  ME: ["Portland", "Lewiston", "Bangor", "South Portland", "Auburn", "Biddeford", "Sanford", "Saco", "Augusta", "Westbrook"],
  MD: ["Baltimore", "Columbia", "Germantown", "Silver Spring", "Waldorf", "Glen Burnie", "Ellicott City", "Frederick", "Dundalk", "Rockville"],
  MA: ["Boston", "Worcester", "Springfield", "Cambridge", "Lowell", "Brockton", "Quincy", "Lynn", "New Bedford", "Fall River"],
  MI: ["Detroit", "Grand Rapids", "Warren", "Sterling Heights", "Ann Arbor", "Lansing", "Flint", "Dearborn", "Livonia", "Westland"],
  MN: ["Minneapolis", "Saint Paul", "Rochester", "Duluth", "Bloomington", "Brooklyn Park", "Plymouth", "Maple Grove", "Woodbury", "Saint Cloud"],
  MS: ["Jackson", "Gulfport", "Southaven", "Hattiesburg", "Biloxi", "Meridian", "Tupelo", "Greenville", "Olive Branch", "Horn Lake"],
  MO: ["Kansas City", "Saint Louis", "Springfield", "Columbia", "Independence", "Lee's Summit", "O'Fallon", "Saint Joseph", "Saint Charles", "Blue Springs"],
  MT: ["Billings", "Missoula", "Great Falls", "Bozeman", "Butte", "Helena", "Kalispell", "Havre", "Anaconda", "Belgrade"],
  NE: ["Omaha", "Lincoln", "Bellevue", "Grand Island", "Kearney", "Fremont", "Hastings", "Norfolk", "North Platte", "Columbus"],
  NV: ["Las Vegas", "Henderson", "Reno", "North Las Vegas", "Sparks", "Carson City", "Fernley", "Elko", "Mesquite", "Boulder City"],
  NH: ["Manchester", "Nashua", "Concord", "Derry", "Dover", "Rochester", "Salem", "Merrimack", "Hudson", "Londonderry"],
  NJ: ["Newark", "Jersey City", "Paterson", "Elizabeth", "Edison", "Woodbridge", "Lakewood", "Toms River", "Hamilton", "Trenton"],
  NM: ["Albuquerque", "Las Cruces", "Rio Rancho", "Santa Fe", "Roswell", "Farmington", "Clovis", "Hobbs", "Alamogordo", "Carlsbad"],
  NY: ["New York", "Buffalo", "Yonkers", "Rochester", "Syracuse", "Albany", "New Rochelle", "Mount Vernon", "Schenectady", "Utica"],
  NC: ["Charlotte", "Raleigh", "Greensboro", "Durham", "Winston-Salem", "Fayetteville", "Cary", "Wilmington", "High Point", "Greenville"],
  ND: ["Fargo", "Bismarck", "Grand Forks", "Minot", "West Fargo", "Williston", "Dickinson", "Mandan", "Jamestown", "Wahpeton"],
  OH: ["Columbus", "Cleveland", "Cincinnati", "Toledo", "Akron", "Dayton", "Parma", "Canton", "Youngstown", "Lorain"],
  OK: ["Oklahoma City", "Tulsa", "Norman", "Broken Arrow", "Lawton", "Edmond", "Moore", "Midwest City", "Enid", "Stillwater"],
  OR: ["Portland", "Salem", "Eugene", "Gresham", "Hillsboro", "Beaverton", "Bend", "Medford", "Springfield", "Corvallis"],
  PA: ["Philadelphia", "Pittsburgh", "Allentown", "Erie", "Reading", "Scranton", "Bethlehem", "Lancaster", "Harrisburg", "Altoona"],
  RI: ["Providence", "Warwick", "Cranston", "Pawtucket", "East Providence", "Woonsocket", "Coventry", "Cumberland", "North Providence", "West Warwick"],
  SC: ["Charleston", "Columbia", "North Charleston", "Mount Pleasant", "Rock Hill", "Greenville", "Summerville", "Goose Creek", "Sumter", "Hilton Head Island"],
  SD: ["Sioux Falls", "Rapid City", "Aberdeen", "Brookings", "Watertown", "Mitchell", "Yankton", "Pierre", "Huron", "Spearfish"],
  TN: ["Memphis", "Nashville", "Knoxville", "Chattanooga", "Clarksville", "Murfreesboro", "Franklin", "Jackson", "Johnson City", "Bartlett"],
  TX: ["Houston", "San Antonio", "Dallas", "Austin", "Fort Worth", "El Paso", "Arlington", "Corpus Christi", "Plano", "Lubbock"],
  UT: ["Salt Lake City", "West Valley City", "West Jordan", "Provo", "Orem", "Sandy", "Ogden", "Saint George", "Layton", "South Jordan"],
  VT: ["Burlington", "South Burlington", "Rutland", "Essex Junction", "Barre", "Montpelier", "Winooski", "Saint Albans", "Newport", "Vergennes"],
  VA: [
    "Virginia Beach", "Norfolk", "Chesapeake", "Richmond", "Newport News", "Alexandria", "Hampton", "Roanoke", "Portsmouth", "Suffolk",
    "Arlington", "Ashburn", "McLean", "Reston", "Woodbridge", "Centreville", "Chantilly", "Sterling",
    "Manassas", "Manassas Park", "Leesburg", "Vienna", "Herndon", "Purcellville", "Dumfries",
  ],
  WA: ["Seattle", "Spokane", "Tacoma", "Vancouver", "Bellevue", "Kent", "Everett", "Renton", "Federal Way", "Yakima"],
  WV: ["Charleston", "Huntington", "Morgantown", "Parkersburg", "Wheeling", "Weirton", "Fairmont", "Martinsburg", "Beckley", "Clarksburg"],
  WI: ["Milwaukee", "Madison", "Green Bay", "Kenosha", "Racine", "Appleton", "Waukesha", "Eau Claire", "Oshkosh", "Janesville"],
  WY: ["Cheyenne", "Casper", "Laramie", "Gillette", "Rock Springs", "Sheridan", "Green River", "Evanston", "Riverton", "Jackson"],
};

type NPIAddress = { address_purpose?: string; state?: string; city?: string };
type NPIProvider = { number: string; addresses?: NPIAddress[]; [k: string]: unknown };
type NPIResponse = { result_count?: number; results?: NPIProvider[]; Errors?: { description: string }[] };

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

function pad(n: number, w: number): string {
  return String(n).padStart(w, " ");
}

async function fetchPage(state: string, city: string, skip: number): Promise<{ results: NPIProvider[]; total: number }> {
  const url = new URL(API_BASE);
  url.searchParams.set("version", API_VERSION);
  url.searchParams.set("taxonomy_description", "Dentist");
  url.searchParams.set("state", state);
  url.searchParams.set("city", city);
  url.searchParams.set("limit", String(LIMIT_PER_REQUEST));
  url.searchParams.set("skip", String(skip));

  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), REQUEST_TIMEOUT_MS);
  try {
    const res = await fetch(url.toString(), { signal: ctrl.signal });
    if (!res.ok) {
      const transient = res.status === 429 || res.status >= 500;
      const err = new Error(`HTTP ${res.status} ${res.statusText}`) as Error & { transient?: boolean };
      err.transient = transient;
      throw err;
    }
    const data = (await res.json()) as NPIResponse;
    if (data.Errors?.length) {
      const message = data.Errors.map((e) => e.description).join("; ");
      // NPI returns "Skip is too large" when we paginate past the API's hard cap (~1200).
      // Treat that as end-of-data, not an error.
      if (/skip is too large|over the limit/i.test(message)) {
        return { results: [], total: 0 };
      }
      throw new Error(`API error: ${message}`);
    }
    return { results: data.results ?? [], total: data.result_count ?? 0 };
  } finally {
    clearTimeout(timer);
  }
}

function isRetryable(err: unknown): boolean {
  if (!(err instanceof Error)) return false;
  if (err.name === "AbortError") return true;
  if (err.name === "TypeError" && /fetch failed|network/i.test(err.message)) return true;
  if ((err as { transient?: boolean }).transient) return true;
  if (/ECONNRESET|ETIMEDOUT|EAI_AGAIN|UND_ERR_/i.test(err.message)) return true;
  return false;
}

async function fetchWithRetry(state: string, city: string, skip: number): Promise<{ results: NPIProvider[]; total: number }> {
  let lastError: unknown;
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      return await fetchPage(state, city, skip);
    } catch (err) {
      lastError = err;
      const message = err instanceof Error ? err.message : String(err);
      if (attempt === MAX_ATTEMPTS || !isRetryable(err)) {
        throw new Error(`${message} (after ${attempt} attempt${attempt > 1 ? "s" : ""})`);
      }
      const delay = BACKOFF_BASE_MS * 2 ** (attempt - 1) + Math.floor(Math.random() * 250);
      console.log(`      retry ${attempt}/${MAX_ATTEMPTS - 1} after: ${message} — waiting ${delay}ms`);
      await sleep(delay);
    }
  }
  throw lastError ?? new Error("unreachable");
}

async function main(): Promise<void> {
  if (!existsSync(SOURCE)) {
    console.error(`Source file not found: ${SOURCE}`);
    process.exit(1);
  }

  console.log("Loading existing dataset...");
  const existing: NPIProvider[] = JSON.parse(readFileSync(SOURCE, "utf8"));
  const byNpi = new Map<string, NPIProvider>();
  const locationCounts = new Map<string, number>();
  for (const p of existing) {
    if (p?.number) byNpi.set(p.number, p);
    const loc = (p.addresses || []).find((a) => a.address_purpose === "LOCATION") || p.addresses?.[0];
    if (!loc?.state || !loc?.city) continue;
    const key = `${loc.state.toUpperCase()}|${loc.city.toUpperCase()}`;
    locationCounts.set(key, (locationCounts.get(key) || 0) + 1);
  }
  console.log(`  ${byNpi.size.toLocaleString()} records loaded`);

  console.log(`\nIdentifying capped cities (threshold: >= ${THRESHOLD} LOCATION matches)...`);
  const capped: { state: string; city: string; localCount: number }[] = [];
  for (const [state, cities] of Object.entries(CITIES_BY_STATE)) {
    for (const city of cities) {
      const key = `${state.toUpperCase()}|${city.toUpperCase()}`;
      const localCount = locationCounts.get(key) ?? 0;
      if (localCount >= THRESHOLD) {
        capped.push({ state, city, localCount });
      }
    }
  }
  capped.sort((a, b) => b.localCount - a.localCount);
  console.log(`  ${capped.length} cities to re-fetch`);

  if (DRY_RUN) {
    console.log("\nDry-run mode — exiting before any API calls. Cities that would be fetched:");
    capped.slice(0, 20).forEach((c) => console.log(`  ${c.city}, ${c.state}  (local count: ${c.localCount})`));
    if (capped.length > 20) console.log(`  ... and ${capped.length - 20} more`);
    return;
  }

  const errors: { state: string; city: string; error: string }[] = [];
  const startTime = Date.now();
  let totalFetched = 0;
  let totalAdded = 0;
  let cityIndex = 0;

  for (const { state, city } of capped) {
    cityIndex++;
    const prefix = `[${pad(cityIndex, 3)}/${capped.length}]`;
    let fetchedThisCity = 0;
    let addedThisCity = 0;
    let total = -1;

    try {
      for (let page = 1; page <= MAX_PAGES_PER_CITY; page++) {
        const skip = page * LIMIT_PER_REQUEST;
        const { results, total: t } = await fetchWithRetry(state, city, skip);
        if (total === -1) total = t;
        fetchedThisCity += results.length;
        for (const p of results) {
          if (p.number && !byNpi.has(p.number)) {
            byNpi.set(p.number, p);
            addedThisCity++;
          }
        }
        if (results.length < LIMIT_PER_REQUEST) break;
        await sleep(DELAY_MS);
      }
      totalFetched += fetchedThisCity;
      totalAdded += addedThisCity;
      const elapsed = `${((Date.now() - startTime) / 1000).toFixed(0)}s`;
      console.log(
        `${prefix} ${`${city}, ${state}`.padEnd(28)} npi_total=${pad(total === -1 ? 0 : total, 5)}  ${pad(fetchedThisCity, 4)} fetched  +${pad(addedThisCity, 4)} new  ${pad(byNpi.size, 6)} total  (${elapsed})`
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      errors.push({ state, city, error: message });
      console.error(`${prefix} ${city}, ${state} — FAILED: ${message}`);
    }
    await sleep(DELAY_MS);
  }

  console.log("\nWriting merged dataset...");
  writeFileSync(SOURCE, JSON.stringify(Array.from(byNpi.values())), "utf8");

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log("");
  console.log(`Done in ${elapsed}s`);
  console.log(`  Cities re-fetched: ${capped.length - errors.length} / ${capped.length}`);
  console.log(`  Pages fetched:     ${totalFetched.toLocaleString()} provider records`);
  console.log(`  Added:             ${totalAdded.toLocaleString()} new (deduped by NPI)`);
  console.log(`  Total in JSON:     ${byNpi.size.toLocaleString()}`);
  console.log(`  Errors:            ${errors.length}`);
  if (errors.length > 0) {
    console.log("");
    console.log("Failed cities:");
    for (const e of errors) console.log(`  - ${e.city}, ${e.state}: ${e.error}`);
  }
}

main().catch((err) => {
  console.error("\nFatal:", err);
  process.exit(1);
});
