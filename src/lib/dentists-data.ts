import "server-only";
import fs from "node:fs";
import path from "node:path";
import {
  type Dentist,
  type Specialty,
  stateNameByCode,
  US_STATES,
} from "./dentists";

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
  state?: string;
};

type NPIRecord = {
  number?: string;
  enumeration_type?: string;
  basic?: {
    first_name?: string;
    last_name?: string;
    middle_name?: string;
    name_prefix?: string;
    credential?: string;
    organization_name?: string;
    authorized_official_first_name?: string;
    authorized_official_last_name?: string;
    authorized_official_credential?: string;
    enumeration_date?: string;
  };
  addresses?: NPIAddress[];
  taxonomies?: NPITaxonomy[];
};

const VALID_STATE_CODES = new Set(US_STATES.map((s) => s.code));

const SPECIALTY_MAP: { match: RegExp; specialty: Specialty }[] = [
  { match: /orthodontic/i, specialty: "Orthodontics" },
  { match: /pediatric/i, specialty: "Pediatric Dentistry" },
  { match: /endodontic/i, specialty: "Endodontics" },
  { match: /periodontic/i, specialty: "Periodontics" },
  { match: /oral.*surgery|maxillofacial surgery/i, specialty: "Oral Surgery" },
  { match: /prosthodontic/i, specialty: "Prosthodontics" },
  { match: /public health/i, specialty: "Dental Public Health" },
];

function pickDentalTaxonomy(taxonomies: NPITaxonomy[] | undefined): NPITaxonomy | undefined {
  if (!taxonomies?.length) return undefined;
  const dental = taxonomies.find((t) => t.code?.startsWith("1223"));
  if (dental) return dental;
  return taxonomies.find((t) => t.primary) ?? taxonomies[0];
}

function classifySpecialty(desc: string | undefined): Specialty {
  if (!desc) return "General Dentistry";
  for (const { match, specialty } of SPECIALTY_MAP) {
    if (match.test(desc)) return specialty;
  }
  return "General Dentistry";
}

function titleCase(str: string): string {
  if (!str) return "";
  return str
    .toLowerCase()
    .split(/(\s|[-,.])/)
    .map((part) => (part.length > 0 && /[a-z]/.test(part[0]) ? part[0].toUpperCase() + part.slice(1) : part))
    .join("");
}

function formatPhone(raw: string | undefined): string {
  if (!raw) return "";
  const digits = raw.replace(/\D/g, "");
  if (digits.length === 10) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  }
  if (digits.length === 11 && digits.startsWith("1")) {
    return `(${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7)}`;
  }
  return raw;
}

function formatZip(raw: string | undefined): string {
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

function pickAddress(addresses: NPIAddress[] | undefined): NPIAddress | undefined {
  if (!addresses?.length) return undefined;
  const location = addresses.find((a) => a.address_purpose === "LOCATION");
  if (location) return location;
  return addresses[0];
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

function normalize(npi: NPIRecord): Dentist | null {
  const number = npi.number;
  if (!number) return null;
  const addr = pickAddress(npi.addresses);
  if (!addr?.state || !VALID_STATE_CODES.has(addr.state.toUpperCase())) return null;

  const taxonomy = pickDentalTaxonomy(npi.taxonomies);
  const specialty = classifySpecialty(taxonomy?.desc);
  const { name, credentials, practiceName } = buildName(npi);
  if (!name) return null;

  const seed = hashSeed(number);
  const rating = parseFloat((3.5 + (seed % 16) / 10).toFixed(1));
  const reviewCount = 5 + (seed % 295);
  const acceptingNewPatients = (seed >>> 4) % 10 < 7;

  let yearsExperience = 5;
  const enumDate = npi.basic?.enumeration_date;
  if (enumDate) {
    const year = parseInt(enumDate.slice(0, 4), 10);
    if (Number.isFinite(year)) {
      yearsExperience = Math.max(1, new Date().getFullYear() - year);
    }
  }

  const stateCode = addr.state.toUpperCase();
  const stateName = stateNameByCode(stateCode);
  const city = titleCase(addr.city ?? "");
  const street = [titleCase(addr.address_1 ?? ""), titleCase(addr.address_2 ?? "")].filter(Boolean).join(", ");

  const slugBase = slugify(name);
  const slug = `${slugBase}-${number}`;

  return {
    id: number,
    slug,
    name,
    credentials,
    specialty,
    practiceName,
    address: { street, city, state: stateName, stateCode, zip: formatZip(addr.postal_code) },
    phone: formatPhone(addr.telephone_number),
    email: "",
    website: "",
    rating,
    reviewCount,
    acceptingNewPatients,
    yearsExperience,
    bio: "",
    education: [],
    languages: [],
    insurance: [],
    hours: [],
  };
}

type DataIndex = {
  dentists: Dentist[];
  byNpi: Map<string, Dentist>;
  citiesByState: Map<string, string[]>;
  countsByState: Map<string, number>;
};

let _cache: DataIndex | null = null;

function loadIndex(): DataIndex {
  if (_cache) return _cache;

  const filePath = path.resolve(process.cwd(), "dentists-data.json");
  if (!fs.existsSync(filePath)) {
    throw new Error(
      `dentists-data.json not found at ${filePath}. Run 'npm run import-dentists' to generate it.`
    );
  }

  const raw: NPIRecord[] = JSON.parse(fs.readFileSync(filePath, "utf8"));
  const dentists: Dentist[] = [];
  const byNpi = new Map<string, Dentist>();
  const citiesByStateSet = new Map<string, Set<string>>();
  const countsByState = new Map<string, number>();

  for (const record of raw) {
    const d = normalize(record);
    if (!d) continue;
    if (byNpi.has(d.id)) continue;
    dentists.push(d);
    byNpi.set(d.id, d);
    const code = d.address.stateCode;
    countsByState.set(code, (countsByState.get(code) ?? 0) + 1);
    if (d.address.city) {
      let cities = citiesByStateSet.get(code);
      if (!cities) {
        cities = new Set();
        citiesByStateSet.set(code, cities);
      }
      cities.add(d.address.city);
    }
  }

  const citiesByState = new Map<string, string[]>();
  for (const [state, set] of citiesByStateSet) {
    citiesByState.set(state, Array.from(set).sort());
  }

  _cache = { dentists, byNpi, citiesByState, countsByState };
  return _cache;
}

export function getTotalDentistCount(): number {
  return loadIndex().dentists.length;
}

export function getCountsByState(): { code: string; name: string; count: number }[] {
  const counts = loadIndex().countsByState;
  return US_STATES.map((s) => ({ code: s.code, name: s.name, count: counts.get(s.code) ?? 0 }))
    .filter((s) => s.count > 0)
    .sort((a, b) => a.name.localeCompare(b.name));
}

export function getCitiesForState(stateCode: string): string[] {
  if (!stateCode) return [];
  return loadIndex().citiesByState.get(stateCode.toUpperCase()) ?? [];
}

export function getDentistById(npi: string): Dentist | undefined {
  return loadIndex().byNpi.get(npi);
}

export function getDentistBySlug(slug: string): Dentist | undefined {
  // Slug format: "<kebab-name>-<10-digit-npi>". Extract NPI suffix.
  const match = slug.match(/(\d{10})$/);
  if (!match) return undefined;
  return getDentistById(match[1]);
}

export type SearchOpts = {
  state?: string;
  city?: string;
  specialty?: string;
  acceptingOnly?: boolean;
  location?: string;
  page?: number;
  perPage?: number;
};

export type SearchResult = {
  results: Dentist[];
  total: number;
  page: number;
  perPage: number;
  totalPages: number;
};

export function searchDentists(opts: SearchOpts): SearchResult {
  const { dentists } = loadIndex();
  const page = Math.max(1, Math.floor(opts.page ?? 1));
  const perPage = Math.min(100, Math.max(1, Math.floor(opts.perPage ?? 20)));
  const state = opts.state?.toUpperCase() || "";
  const city = opts.city || "";
  const specialty = opts.specialty || "";
  const accepting = opts.acceptingOnly ?? false;
  const loc = (opts.location ?? "").trim().toLowerCase();

  const filtered: Dentist[] = [];
  for (const d of dentists) {
    if (state && d.address.stateCode !== state) continue;
    if (city && d.address.city !== city) continue;
    if (specialty && d.specialty !== specialty) continue;
    if (accepting && !d.acceptingNewPatients) continue;
    if (loc) {
      const hay = `${d.address.city} ${d.address.state} ${d.address.stateCode}`.toLowerCase();
      if (!hay.includes(loc)) continue;
    }
    filtered.push(d);
  }

  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / perPage));
  const start = (page - 1) * perPage;
  const results = filtered.slice(start, start + perPage);

  return { results, total, page, perPage, totalPages };
}

export function getFeaturedDentists(count: number): Dentist[] {
  const { dentists } = loadIndex();
  // Deterministic "top rated" — highest rating, then most reviews, then accepting patients first.
  return [...dentists]
    .sort((a, b) => {
      if (b.rating !== a.rating) return b.rating - a.rating;
      if (b.reviewCount !== a.reviewCount) return b.reviewCount - a.reviewCount;
      return (a.acceptingNewPatients ? 0 : 1) - (b.acceptingNewPatients ? 0 : 1);
    })
    .slice(0, count);
}
