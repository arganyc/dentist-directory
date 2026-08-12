import { createHash, randomBytes } from "node:crypto";

export const DENTISTOS_SESSION_TOKEN_BYTES = 32;

export const DENTISTOS_ACCOUNT_ROLES = ["OWNER", "STAFF", "ADMIN"] as const;
export type DentistOSAccountRole = (typeof DENTISTOS_ACCOUNT_ROLES)[number];

export type DentistOSSessionTokenPair = {
  rawToken: string;
  sessionTokenHash: string;
};

export function generateSessionToken(): string {
  return randomBytes(DENTISTOS_SESSION_TOKEN_BYTES).toString("base64url");
}

export function hashSessionToken(rawToken: string): string {
  if (!rawToken) {
    throw new Error("Session token is required.");
  }
  return createHash("sha256").update(rawToken).digest("hex");
}

export function createSessionTokenPair(): DentistOSSessionTokenPair {
  const rawToken = generateSessionToken();
  return {
    rawToken,
    sessionTokenHash: hashSessionToken(rawToken),
  };
}

export function isDentistOSAccountRole(value: string): value is DentistOSAccountRole {
  return DENTISTOS_ACCOUNT_ROLES.includes(value as DentistOSAccountRole);
}
