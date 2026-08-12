import { type Dentist } from "./dentists";

export type DentistLookupSqlClient = {
  query: (text: string, params?: unknown[]) => Promise<Record<string, unknown>[]>;
};

export type DentistRow = {
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

export const DENTIST_PROFILE_COLS =
  "id, slug, name, credentials, specialty, practice_name, street, city, state, state_code, zip, phone, rating, review_count, accepting_new_patients, years_experience, is_premium";

export function rowToDentist(r: DentistRow): Dentist {
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

export async function getDentistByIdWithSql(
  npi: string,
  sql: DentistLookupSqlClient
): Promise<Dentist | undefined> {
  const rows = (await sql.query(`SELECT ${DENTIST_PROFILE_COLS} FROM dentists WHERE id = $1 LIMIT 1`, [
    npi,
  ])) as DentistRow[];
  return rows[0] ? rowToDentist(rows[0]) : undefined;
}

export async function getDentistBySlugWithSql(
  slug: string,
  sql: DentistLookupSqlClient
): Promise<Dentist | undefined> {
  const rows = (await sql.query(`SELECT ${DENTIST_PROFILE_COLS} FROM dentists WHERE slug = $1 LIMIT 1`, [
    slug,
  ])) as DentistRow[];
  if (rows[0]) return rowToDentist(rows[0]);

  const match = slug.match(/(\d{10})$/);
  if (!match) return undefined;
  return getDentistByIdWithSql(match[1], sql);
}
