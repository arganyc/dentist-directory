import "server-only";
import { Pool } from "pg";

/**
 * Database client (standard node-postgres).
 *
 * Migrated off @neondatabase/serverless so the app can talk to any standard
 * Postgres (Supabase, self-hosted, etc.). This thin adapter preserves the exact
 * surface the rest of the codebase already uses, so no call sites changed:
 *   - tagged template:  sql`SELECT ... WHERE x = ${v}`     -> Promise<rows[]>
 *   - parameterized:    sql.query("SELECT ... $1", [v])    -> Promise<rows[]>
 * Both resolve to the array of rows directly (matching the old Neon driver).
 */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Row = Record<string, any>;

export type SqlClient = {
  (strings: TemplateStringsArray, ...values: unknown[]): Promise<Row[]>;
  query: (text: string, params?: unknown[]) => Promise<Row[]>;
};

let _pool: Pool | null = null;
let _sql: SqlClient | null = null;

function getPool(): Pool {
  if (_pool) return _pool;
  // On Vercel the legacy Neon integration owns (and locks) DATABASE_URL, which
  // still points at the retired Neon database. Prefer SUPABASE_DATABASE_URL
  // there; fall back to DATABASE_URL for local dev (.env.local) and scripts.
  const url = process.env.SUPABASE_DATABASE_URL ?? process.env.DATABASE_URL;
  if (!url) {
    throw new Error(
      "No database connection string set. Set SUPABASE_DATABASE_URL (Vercel) or DATABASE_URL (.env.local for local development)."
    );
  }
  _pool = new Pool({
    connectionString: url,
    // Managed Postgres (Supabase, etc.) requires TLS; the pooler's certificate
    // isn't in Node's default CA bundle, so don't reject the chain.
    ssl: { rejectUnauthorized: false },
    // Pages are cached (ISR), so DB hits are rare — keep the serverless
    // connection footprint tiny to stay well within pooler limits.
    max: 1,
    idleTimeoutMillis: 10_000,
    connectionTimeoutMillis: 10_000,
  });
  return _pool;
}

export function getSql(): SqlClient {
  if (_sql) return _sql;
  const pool = getPool();

  const sql = (async (
    strings: TemplateStringsArray,
    ...values: unknown[]
  ): Promise<Row[]> => {
    let text = "";
    strings.forEach((part, i) => {
      text += part + (i < values.length ? `$${i + 1}` : "");
    });
    const result = await pool.query(text, values as unknown[]);
    return result.rows;
  }) as SqlClient;

  sql.query = async (text: string, params: unknown[] = []): Promise<Row[]> => {
    const result = await pool.query(text, params);
    return result.rows;
  };

  _sql = sql;
  return _sql;
}
