import "server-only";
import { type Dentist, US_STATES } from "./dentists";
import { getSql } from "./db";

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
  rating: number | string;
  review_count: number;
  accepting_new_patients: boolean;
  years_experience: number;
  is_premium: boolean;
};

function rowToDentist(r: Row): Dentist {
  return {
    id: r.id,
    slug: r.slug,
    name: r.name,
    credentials: r.credentials,
    specialty: r.specialty as Dentist["specialty"],
    practiceName: r.practice_name,
    address: {
      street: r.street,
      city: r.city,
      state: r.state,
      stateCode: r.state_code,
      zip: r.zip,
    },
    phone: r.phone,
    email: "",
    website: "",
    rating: typeof r.rating === "string" ? parseFloat(r.rating) : r.rating,
    reviewCount: r.review_count,
    acceptingNewPatients: r.accepting_new_patients,
    yearsExperience: r.years_experience,
    bio: "",
    education: [],
    languages: [],
    insurance: [],
    hours: [],
    isPremium: r.is_premium,
  };
}

const ALL_COLS =
  "id, slug, name, credentials, specialty, practice_name, street, city, state, state_code, zip, phone, rating, review_count, accepting_new_patients, years_experience, is_premium";

export async function getTotalDentistCount(): Promise<number> {
  const sql = getSql();
  const rows = (await sql`SELECT COUNT(*)::int AS n FROM dentists`) as { n: number }[];
  return rows[0]?.n ?? 0;
}

export async function getCountsByState(): Promise<{ code: string; name: string; count: number }[]> {
  const sql = getSql();
  const rows = (await sql`SELECT state_code, COUNT(*)::int AS n FROM dentists GROUP BY state_code`) as
    { state_code: string; n: number }[];
  const counts = new Map(rows.map((r) => [r.state_code, r.n]));
  return US_STATES.map((s) => ({ code: s.code, name: s.name, count: counts.get(s.code) ?? 0 }))
    .filter((s) => s.count > 0)
    .sort((a, b) => a.name.localeCompare(b.name));
}

export async function getCitiesForState(stateCode: string): Promise<string[]> {
  if (!stateCode) return [];
  const sql = getSql();
  const rows = (await sql`
    SELECT DISTINCT city
    FROM dentists
    WHERE state_code = ${stateCode.toUpperCase()} AND city <> ''
    ORDER BY city
  `) as { city: string }[];
  return rows.map((r) => r.city);
}

export async function getDentistById(npi: string): Promise<Dentist | undefined> {
  const sql = getSql();
  const rows = (await sql.query(`SELECT ${ALL_COLS} FROM dentists WHERE id = $1 LIMIT 1`, [npi])) as Row[];
  return rows[0] ? rowToDentist(rows[0]) : undefined;
}

export async function getDentistBySlug(slug: string): Promise<Dentist | undefined> {
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
  name?: string;
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

export async function searchDentists(opts: SearchOpts): Promise<SearchResult> {
  const page = Math.max(1, Math.floor(opts.page ?? 1));
  const perPage = Math.min(100, Math.max(1, Math.floor(opts.perPage ?? 20)));
  const offset = (page - 1) * perPage;

  const conditions: string[] = [];
  const params: (string | boolean)[] = [];
  let idx = 1;

  if (opts.state) {
    conditions.push(`state_code = $${idx++}`);
    params.push(opts.state.toUpperCase());
  }
  if (opts.city) {
    conditions.push(`LOWER(city) = $${idx++}`);
    params.push(opts.city.toLowerCase());
  }
  if (opts.specialty) {
    conditions.push(`specialty = $${idx++}`);
    params.push(opts.specialty);
  }
  if (opts.acceptingOnly) {
    conditions.push(`accepting_new_patients = TRUE`);
  }
  if (opts.location && opts.location.trim()) {
    conditions.push(`LOWER(city || ' ' || state || ' ' || state_code) LIKE $${idx++}`);
    params.push(`%${opts.location.trim().toLowerCase()}%`);
  }
  if (opts.name && opts.name.trim()) {
    const pattern = `%${opts.name.trim().toLowerCase()}%`;
    conditions.push(`(LOWER(name) LIKE $${idx} OR LOWER(practice_name) LIKE $${idx})`);
    idx++;
    params.push(pattern);
  }

  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

  const sql = getSql();
  const countStmt = `SELECT COUNT(*)::int AS n FROM dentists ${where}`;
  const countRows = (await sql.query(countStmt, params)) as { n: number }[];
  const total = countRows[0]?.n ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / perPage));

  if (total === 0) {
    return { results: [], total: 0, page, perPage, totalPages: 1 };
  }

  const limitIdx = idx++;
  const offsetIdx = idx++;
  const dataStmt = `SELECT ${ALL_COLS} FROM dentists ${where} ORDER BY id LIMIT $${limitIdx} OFFSET $${offsetIdx}`;
  const dataRows = (await sql.query(dataStmt, [...params, perPage, offset])) as Row[];

  return {
    results: dataRows.map(rowToDentist),
    total,
    page,
    perPage,
    totalPages,
  };
}

export type CityCount = { city: string; stateCode: string; total: number };

export async function getTopCities(count: number): Promise<CityCount[]> {
  const sql = getSql();
  const rows = (await sql.query(
    `SELECT city, state_code, COUNT(*)::int AS total
     FROM dentists
     WHERE city <> ''
     GROUP BY city, state_code
     ORDER BY total DESC, city ASC
     LIMIT $1`,
    [count]
  )) as { city: string; state_code: string; total: number }[];
  return rows.map((r) => ({ city: r.city, stateCode: r.state_code, total: r.total }));
}

export async function getFeaturedDentists(count: number): Promise<Dentist[]> {
  const sql = getSql();
  const rows = (await sql.query(
    `SELECT ${ALL_COLS} FROM dentists ORDER BY rating DESC, review_count DESC, accepting_new_patients DESC LIMIT $1`,
    [count]
  )) as Row[];
  return rows.map(rowToDentist);
}
