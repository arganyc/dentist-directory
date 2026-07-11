import "server-only";
import { randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import { getSql } from "@/lib/db";

export const TOOLS_ACCESS_COOKIE = "sf_tools_access";

export function generateAccessToken(): string {
  return randomBytes(24).toString("base64url");
}

export type ClaimAccess = {
  id: number;
  name: string;
  practiceName: string;
  npi: string;
};

export async function getClaimByToken(token: string): Promise<ClaimAccess | null> {
  if (!token) return null;
  const sql = getSql();
  const rows = (await sql.query(
    `SELECT id, name, practice_name, npi FROM claims WHERE access_token = $1 LIMIT 1`,
    [token]
  )) as { id: number; name: string; practice_name: string; npi: string }[];
  const row = rows[0];
  if (!row) return null;
  return { id: row.id, name: row.name, practiceName: row.practice_name, npi: row.npi };
}

/** Server-side helper for gated pages/layouts: reads the access cookie and resolves it against the DB. */
export async function getToolsAccess(): Promise<ClaimAccess | null> {
  const store = await cookies();
  const token = store.get(TOOLS_ACCESS_COOKIE)?.value;
  if (!token) return null;
  return getClaimByToken(token);
}
