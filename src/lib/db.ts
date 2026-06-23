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
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error(
      "DATABASE_URL is not set. Add your Postgres connection string to .env.local for development and to your Vercel project's environment variables for deploys."
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
