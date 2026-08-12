import {
  dentistExternalUrl,
  DuplicateDentistListingError,
  mapDentistOSPayloadToListingRow,
  type DentistOSListingAction,
  type DentistOSPublishOutcome,
  type DentistOSPublishPayload,
  type ExistingDentistListing,
} from "./dentistos-listings";

export type DentistOSSqlClient = {
  query: (text: string, params?: unknown[]) => Promise<Record<string, unknown>[]>;
};

const DENTISTOS_LISTING_COLUMNS = `
  id,
  slug,
  name,
  credentials,
  specialty,
  practice_name,
  street,
  city,
  state,
  state_code,
  zip,
  phone,
  rating,
  review_count,
  accepting_new_patients,
  years_experience,
  is_premium
`;

export async function upsertDentistOSListingWithSql(
  payload: DentistOSPublishPayload,
  sql: DentistOSSqlClient
): Promise<DentistOSPublishOutcome> {
  const id = String(payload.candidate_id);
  const existingById = await findListingById(sql, id);
  const existingBySlug = await findListingBySlug(sql, payload.slug);

  if (existingBySlug && existingBySlug.id !== id) {
    throw new DuplicateDentistListingError();
  }

  const action: DentistOSListingAction = existingById ? "updated" : "created";
  const row = mapDentistOSPayloadToListingRow(payload, existingById);
  const rows = (await sql.query(
    `
      INSERT INTO dentists (
        id,
        slug,
        name,
        credentials,
        specialty,
        practice_name,
        street,
        city,
        state,
        state_code,
        zip,
        phone,
        rating,
        review_count,
        accepting_new_patients,
        years_experience,
        is_premium
      )
      VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9,
        $10, $11, $12, $13, $14, $15, $16, $17
      )
      ON CONFLICT (id) DO UPDATE SET
        slug = EXCLUDED.slug,
        name = EXCLUDED.name,
        credentials = EXCLUDED.credentials,
        specialty = EXCLUDED.specialty,
        practice_name = EXCLUDED.practice_name,
        street = EXCLUDED.street,
        city = EXCLUDED.city,
        state = EXCLUDED.state,
        state_code = EXCLUDED.state_code,
        zip = EXCLUDED.zip,
        phone = EXCLUDED.phone,
        rating = EXCLUDED.rating,
        review_count = EXCLUDED.review_count,
        accepting_new_patients = EXCLUDED.accepting_new_patients,
        years_experience = EXCLUDED.years_experience,
        is_premium = EXCLUDED.is_premium
      RETURNING id, slug
    `,
    [
      row.id,
      row.slug,
      row.name,
      row.credentials,
      row.specialty,
      row.practice_name,
      row.street,
      row.city,
      row.state,
      row.state_code,
      row.zip,
      row.phone,
      row.rating,
      row.review_count,
      row.accepting_new_patients,
      row.years_experience,
      row.is_premium,
    ]
  )) as { id: string; slug: string }[];

  const saved = rows[0] ?? { id: row.id, slug: row.slug };
  return {
    success: true,
    external_id: saved.id,
    external_url: dentistExternalUrl(saved.slug),
    action,
  };
}

async function findListingById(
  sql: DentistOSSqlClient,
  id: string
): Promise<ExistingDentistListing | null> {
  const rows = (await sql.query(
    `SELECT ${DENTISTOS_LISTING_COLUMNS} FROM dentists WHERE id = $1 LIMIT 1`,
    [id]
  )) as ExistingDentistListing[];
  return rows[0] ?? null;
}

async function findListingBySlug(
  sql: DentistOSSqlClient,
  slug: string
): Promise<ExistingDentistListing | null> {
  const rows = (await sql.query(
    `SELECT ${DENTISTOS_LISTING_COLUMNS} FROM dentists WHERE slug = $1 LIMIT 1`,
    [slug]
  )) as ExistingDentistListing[];
  return rows[0] ?? null;
}
