import "server-only";
import { getSql, type SqlClient } from "./db";
import {
  type DentistOSPracticeAuthorizationRepository,
  type DentistOSPracticeContext,
  type DentistOSPracticeListingLink,
  type DentistOSPracticeMembership,
  type DentistOSPractice,
} from "./dentistos-practices";

type PracticeContextRow = {
  practice_id: string;
  name: string;
  website: string | null;
  phone: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  zip_code: string | null;
  practice_created_at: Date | string;
  practice_updated_at: Date | string;
  membership_id: string;
  user_id: string;
  role: DentistOSPracticeMembership["role"];
  membership_created_at: Date | string;
  link_id: string | null;
  dentist_id: string | null;
  claim_id: number | null;
  link_status: DentistOSPracticeListingLink["status"] | null;
  verified_at: Date | string | null;
  link_created_at: Date | string | null;
};

export class PostgresDentistOSPracticeRepository
  implements DentistOSPracticeAuthorizationRepository
{
  constructor(private readonly sql: SqlClient = getSql()) {}

  async getPracticeContextForUser(
    userId: string,
    practiceId?: string
  ): Promise<DentistOSPracticeContext | null> {
    const params: unknown[] = [userId];
    const practiceFilter = practiceId ? "AND practices.id = $2" : "";
    if (practiceId) params.push(practiceId);

    const rows = (await this.sql.query(
      `
        SELECT
          practices.id AS practice_id,
          practices.name,
          practices.website,
          practices.phone,
          practices.address,
          practices.city,
          practices.state,
          practices.zip_code,
          practices.created_at AS practice_created_at,
          practices.updated_at AS practice_updated_at,
          practice_memberships.id AS membership_id,
          practice_memberships.user_id,
          practice_memberships.role,
          practice_memberships.created_at AS membership_created_at,
          practice_listing_links.id AS link_id,
          practice_listing_links.dentist_id,
          practice_listing_links.claim_id,
          practice_listing_links.status AS link_status,
          practice_listing_links.verified_at,
          practice_listing_links.created_at AS link_created_at
        FROM practice_memberships
        JOIN practices ON practices.id = practice_memberships.practice_id
        LEFT JOIN practice_listing_links ON practice_listing_links.practice_id = practices.id
        WHERE practice_memberships.user_id = $1
          ${practiceFilter}
        ORDER BY practice_memberships.created_at ASC, practice_listing_links.created_at ASC
        LIMIT 1
      `,
      params
    )) as PracticeContextRow[];

    const row = rows[0];
    if (!row) return null;
    return rowToPracticeContext(row);
  }
}

function rowToPracticeContext(row: PracticeContextRow): DentistOSPracticeContext {
  const practice: DentistOSPractice = {
    id: row.practice_id,
    name: row.name,
    website: row.website,
    phone: row.phone,
    address: row.address,
    city: row.city,
    state: row.state,
    zip_code: row.zip_code,
    created_at: row.practice_created_at,
    updated_at: row.practice_updated_at,
  };

  const membership: DentistOSPracticeMembership = {
    id: row.membership_id,
    practice_id: row.practice_id,
    user_id: row.user_id,
    role: row.role,
    created_at: row.membership_created_at,
  };

  const listingLink: DentistOSPracticeListingLink | null =
    row.link_id && row.dentist_id && row.link_status
      ? {
          id: row.link_id,
          practice_id: row.practice_id,
          dentist_id: row.dentist_id,
          claim_id: row.claim_id,
          status: row.link_status,
          verified_at: row.verified_at,
          created_at: row.link_created_at ?? undefined,
        }
      : null;

  return { practice, membership, listingLink };
}
