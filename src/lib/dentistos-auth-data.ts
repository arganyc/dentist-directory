import "server-only";
import { getSql, type SqlClient } from "./db";
import type {
  ConsumedMagicLink,
  DentistOSAuthRepository,
  DentistOSUser,
} from "./dentistos-auth";

export class PostgresDentistOSAuthRepository implements DentistOSAuthRepository {
  constructor(private readonly sql: SqlClient = getSql()) {}

  async upsertUserByEmail(email: string, name: string | null): Promise<DentistOSUser> {
    const rows = (await this.sql.query(
      `
        INSERT INTO users (email, name)
        VALUES ($1, $2)
        ON CONFLICT (email) DO UPDATE SET
          name = COALESCE(EXCLUDED.name, users.name),
          updated_at = NOW()
        RETURNING id, email, name, created_at, updated_at
      `,
      [email, name]
    )) as DentistOSUser[];
    return rows[0];
  }

  async createMagicLink(input: {
    userId: string;
    email: string;
    tokenHash: string;
    expiresAt: Date;
  }): Promise<void> {
    await this.sql.query(
      `
        INSERT INTO auth_magic_links (user_id, email, token_hash, expires_at)
        VALUES ($1, $2, $3, $4)
      `,
      [input.userId, input.email, input.tokenHash, input.expiresAt]
    );
  }

  async consumeMagicLink(tokenHash: string, now: Date): Promise<ConsumedMagicLink | null> {
    const rows = (await this.sql.query(
      `
        UPDATE auth_magic_links
        SET consumed_at = $2
        WHERE token_hash = $1
          AND consumed_at IS NULL
          AND expires_at > $2
        RETURNING user_id, email
      `,
      [tokenHash, now]
    )) as { user_id: string; email: string }[];
    const row = rows[0];
    return row ? { userId: row.user_id, email: row.email } : null;
  }

  async createSession(input: {
    userId: string;
    sessionTokenHash: string;
    expiresAt: Date;
  }): Promise<void> {
    await this.sql.query(
      `
        INSERT INTO user_sessions (user_id, session_token_hash, expires_at)
        VALUES ($1, $2, $3)
      `,
      [input.userId, input.sessionTokenHash, input.expiresAt]
    );
  }

  async getUserBySessionTokenHash(
    sessionTokenHash: string,
    now: Date
  ): Promise<DentistOSUser | null> {
    const rows = (await this.sql.query(
      `
        SELECT users.id, users.email, users.name, users.created_at, users.updated_at
        FROM user_sessions
        JOIN users ON users.id = user_sessions.user_id
        WHERE user_sessions.session_token_hash = $1
          AND user_sessions.expires_at > $2
        LIMIT 1
      `,
      [sessionTokenHash, now]
    )) as DentistOSUser[];
    return rows[0] ?? null;
  }

  async deleteSessionByTokenHash(sessionTokenHash: string): Promise<void> {
    await this.sql.query(`DELETE FROM user_sessions WHERE session_token_hash = $1`, [
      sessionTokenHash,
    ]);
  }
}
