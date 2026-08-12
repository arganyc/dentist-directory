import "server-only";
import { getSql, type SqlClient } from "./db";
import {
  type DentistOSClaimBridgeClaim,
  type DentistOSClaimBridgeRepository,
} from "./dentistos-claim-bridge";
import {
  type DentistOSPracticeContext,
  type DentistOSPracticeListingLink,
} from "./dentistos-practices";
import { PostgresDentistOSPracticeRepository } from "./dentistos-practices-data";

export class PostgresDentistOSClaimBridgeRepository
  implements DentistOSClaimBridgeRepository
{
  private readonly sql: SqlClient;
  private readonly practiceRepository: PostgresDentistOSPracticeRepository;

  constructor(sql: SqlClient = getSql()) {
    this.sql = sql;
    this.practiceRepository = new PostgresDentistOSPracticeRepository(sql);
  }

  async getClaimByAccessToken(token: string): Promise<DentistOSClaimBridgeClaim | null> {
    const rows = (await this.sql.query(
      `
        SELECT
          id,
          name,
          email,
          phone,
          npi,
          practice_name,
          address,
          website,
          status,
          dentistos_user_id,
          dentistos_practice_id
        FROM claims
        WHERE access_token = $1
        LIMIT 1
      `,
      [token]
    )) as DentistOSClaimBridgeClaim[];
    return rows[0] ?? null;
  }

  async dentistExists(dentistId: string): Promise<boolean> {
    const rows = (await this.sql.query(`SELECT id FROM dentists WHERE id = $1 LIMIT 1`, [
      dentistId,
    ])) as { id: string }[];
    return rows.length > 0;
  }

  async getPracticeContextForUser(userId: string): Promise<DentistOSPracticeContext | null> {
    return this.practiceRepository.getPracticeContextForUser(userId);
  }

  async getPracticeContextByIdForUser(
    userId: string,
    practiceId: string
  ): Promise<DentistOSPracticeContext | null> {
    return this.practiceRepository.getPracticeContextForUser(userId, practiceId);
  }

  async createPracticeFromClaim(claim: DentistOSClaimBridgeClaim): Promise<string> {
    const rows = (await this.sql.query(
      `
        INSERT INTO practices (name, website, phone, address)
        VALUES ($1, $2, $3, $4)
        RETURNING id
      `,
      [claim.practice_name, claim.website, claim.phone, claim.address]
    )) as { id: string }[];
    return rows[0].id;
  }

  async createPracticeMembership(input: {
    practiceId: string;
    userId: string;
    role: "OWNER";
  }): Promise<void> {
    await this.sql.query(
      `
        INSERT INTO practice_memberships (practice_id, user_id, role)
        VALUES ($1, $2, $3)
        ON CONFLICT (practice_id, user_id) DO NOTHING
      `,
      [input.practiceId, input.userId, input.role]
    );
  }

  async upsertPracticeListingLink(input: {
    practiceId: string;
    dentistId: string;
    claimId: number;
    status: DentistOSPracticeListingLink["status"];
    verifiedAt: Date | null;
  }): Promise<void> {
    await this.sql.query(
      `
        INSERT INTO practice_listing_links (
          practice_id,
          dentist_id,
          claim_id,
          status,
          verified_at
        )
        VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT (practice_id, dentist_id) DO UPDATE SET
          claim_id = EXCLUDED.claim_id,
          status = EXCLUDED.status,
          verified_at = EXCLUDED.verified_at
      `,
      [input.practiceId, input.dentistId, input.claimId, input.status, input.verifiedAt]
    );
  }

  async markClaimLinked(input: {
    claimId: number;
    userId: string;
    practiceId: string;
    linkedAt: Date;
  }): Promise<void> {
    await this.sql.query(
      `
        UPDATE claims
        SET
          dentistos_user_id = $2,
          dentistos_practice_id = $3,
          dentistos_linked_at = $4
        WHERE id = $1
          AND (
            dentistos_user_id IS NULL
            OR dentistos_user_id = $2
          )
      `,
      [input.claimId, input.userId, input.practiceId, input.linkedAt]
    );
  }
}
