/**
 * Fetches real dentist data from the NPI Registry API.
 *
 * Run: node scripts/import-dentists.ts
 *      (Node 22.6+ / 24+ support native .ts via type-stripping)
 *
 * Or:  npm run import-dentists
 *
 * Output: ./dentists-data.json  (deduped by NPI number)
 *
 * The NPI Registry is a public CMS API. Docs:
 *   https://npiregistry.cms.hhs.gov/api-page
 *
 * Strategy: query top-10 cities × 50 states with taxonomy_description=Dentist.
 * Each request returns up to 200 providers (API max). Total requests: 500.
 * 500ms delay between requests → ~4–5 minutes total.
 */

import { writeFile } from "node:fs/promises";
import path from "node:path";

const API_BASE = "https://npiregistry.cms.hhs.gov/api/";
const API_VERSION = "2.1";
const LIMIT_PER_REQUEST = 200;
const DELAY_MS = 500;
const REQUEST_TIMEOUT_MS = 30_000;
const OUTPUT_PATH = path.resolve(process.cwd(), "dentists-data.json");

type NPITaxonomy = {
  code: string;
  desc: string;
  primary: boolean;
  state?: string;
  license?: string;
};

type NPIAddress = {
  address_purpose: string;
  address_type: string;
  address_1?: string;
  address_2?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  telephone_number?: string;
  fax_number?: string;
  country_code?: string;
};

type NPIProvider = {
  number: string;
  enumeration_type: string;
  basic: {
    first_name?: string;
    last_name?: string;
    middle_name?: string;
    credential?: string;
    sole_proprietor?: string;
    gender?: string;
    enumeration_date?: string;
    last_updated?: string;
    status?: string;
    organization_name?: string;
  };
  addresses: NPIAddress[];
  taxonomies: NPITaxonomy[];
};

type NPIResponse = {
  result_count: number;
  results?: NPIProvider[];
  Errors?: { description: string }[];
};

const CITIES_BY_STATE: Record<string, string[]> = {
  AL: ["Birmingham", "Montgomery", "Mobile", "Huntsville", "Tuscaloosa", "Hoover", "Auburn", "Dothan", "Decatur", "Madison"],
  AK: ["Anchorage", "Fairbanks", "Juneau", "Wasilla", "Sitka", "Ketchikan", "Kenai", "Kodiak", "Bethel", "Palmer"],
  AZ: ["Phoenix", "Tucson", "Mesa", "Chandler", "Scottsdale", "Glendale", "Gilbert", "Tempe", "Peoria", "Surprise"],
  AR: ["Little Rock", "Fort Smith", "Fayetteville", "Springdale", "Jonesboro", "Rogers", "Conway", "North Little Rock", "Bentonville", "Pine Bluff"],
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
    // Northern Virginia
    "Arlington", "Ashburn", "McLean", "Reston", "Woodbridge", "Centreville", "Chantilly", "Sterling",
    "Manassas", "Manassas Park", "Leesburg", "Vienna", "Herndon", "Purcellville", "Dumfries",
  ],
  WA: ["Seattle", "Spokane", "Tacoma", "Vancouver", "Bellevue", "Kent", "Everett", "Renton", "Federal Way", "Yakima"],
  WV: ["Charleston", "Huntington", "Morgantown", "Parkersburg", "Wheeling", "Weirton", "Fairmont", "Martinsburg", "Beckley", "Clarksburg"],
  WI: ["Milwaukee", "Madison", "Green Bay", "Kenosha", "Racine", "Appleton", "Waukesha", "Eau Claire", "Oshkosh", "Janesville"],
  WY: ["Cheyenne", "Casper", "Laramie", "Gillette", "Rock Springs", "Sheridan", "Green River", "Evanston", "Riverton", "Jackson"],
};

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function pad(n: number, width: number): string {
  return String(n).padStart(width, " ");
}

function formatDuration(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}m${pad(s, 2).replace(" ", "0")}s`;
}

async function fetchDentistsForCity(
  state: string,
  city: string
): Promise<NPIProvider[]> {
  const url = new URL(API_BASE);
  url.searchParams.set("version", API_VERSION);
  url.searchParams.set("taxonomy_description", "Dentist");
  url.searchParams.set("state", state);
  url.searchParams.set("city", city);
  url.searchParams.set("limit", String(LIMIT_PER_REQUEST));
  url.searchParams.set("skip", "0");

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const res = await fetch(url.toString(), { signal: controller.signal });
    if (!res.ok) {
      throw new Error(`HTTP ${res.status} ${res.statusText}`);
    }
    const data = (await res.json()) as NPIResponse;
    if (data.Errors && data.Errors.length > 0) {
      throw new Error(`API error: ${data.Errors.map((e) => e.description).join("; ")}`);
    }
    return data.results ?? [];
  } finally {
    clearTimeout(timeout);
  }
}

async function main(): Promise<void> {
  const states = Object.keys(CITIES_BY_STATE).sort();
  const totalCities = states.reduce((sum, s) => sum + CITIES_BY_STATE[s].length, 0);
  const byNpi = new Map<string, NPIProvider>();
  const errors: { state: string; city: string; error: string }[] = [];
  const startTime = Date.now();
  let cityIndex = 0;
  let totalFetched = 0;

  console.log(`NPI Registry import starting`);
  console.log(`  States:        ${states.length}`);
  console.log(`  Cities:        ${totalCities}`);
  console.log(`  Per-city cap:  ${LIMIT_PER_REQUEST}`);
  console.log(`  Delay:         ${DELAY_MS}ms`);
  console.log(`  Estimated:     ~${formatDuration(totalCities * DELAY_MS)}`);
  console.log(`  Output:        ${OUTPUT_PATH}`);
  console.log("");

  for (const state of states) {
    for (const city of CITIES_BY_STATE[state]) {
      cityIndex++;
      const prefix = `[${pad(cityIndex, 3)}/${totalCities}]`;
      try {
        const results = await fetchDentistsForCity(state, city);
        totalFetched += results.length;
        let added = 0;
        for (const provider of results) {
          if (provider.number && !byNpi.has(provider.number)) {
            byNpi.set(provider.number, provider);
            added++;
          }
        }
        const elapsed = formatDuration(Date.now() - startTime);
        const cityLabel = `${city}, ${state}`.padEnd(36, " ");
        console.log(
          `${prefix} ${cityLabel} ${pad(results.length, 3)} fetched  +${pad(added, 3)} new  ${pad(byNpi.size, 5)} total  (${elapsed})`
        );
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        errors.push({ state, city, error: message });
        console.error(`${prefix} ${city}, ${state} — ERROR: ${message}`);
      }
      await sleep(DELAY_MS);
    }
  }

  const output = Array.from(byNpi.values());
  await writeFile(OUTPUT_PATH, JSON.stringify(output, null, 2), "utf8");

  const elapsedFinal = formatDuration(Date.now() - startTime);
  console.log("");
  console.log(`Done in ${elapsedFinal}`);
  console.log(`  Fetched:    ${totalFetched} provider records`);
  console.log(`  Unique:     ${output.length} dentists (deduped by NPI)`);
  console.log(`  Duplicates: ${totalFetched - output.length}`);
  console.log(`  Errors:     ${errors.length}`);
  console.log(`  Saved to:   ${OUTPUT_PATH}`);

  if (errors.length > 0) {
    console.log("");
    console.log("Failed cities:");
    for (const e of errors) {
      console.log(`  - ${e.city}, ${e.state}: ${e.error}`);
    }
  }
}

main().catch((err) => {
  console.error("\nFatal error:", err);
  process.exit(1);
});
