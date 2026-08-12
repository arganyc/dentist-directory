import { createHash, randomBytes } from "node:crypto";

export const DENTISTOS_SESSION_COOKIE = "dentistos_session";
export const DENTISTOS_MAGIC_LINK_TOKEN_BYTES = 32;
export const DENTISTOS_SESSION_TOKEN_BYTES = 32;
export const MAGIC_LINK_TTL_MINUTES = 15;
export const SESSION_TTL_DAYS = 30;

export type DentistOSUser = {
  id: string;
  email: string;
  name: string | null;
  created_at?: Date | string;
  updated_at?: Date | string;
};

export type MagicLinkEmail = {
  email: string;
  magicLink: string;
  expiresAt: Date;
};

export type ConsumedMagicLink = {
  userId: string;
  email: string;
};

export type DentistOSAuthRepository = {
  upsertUserByEmail(email: string, name: string | null): Promise<DentistOSUser>;
  createMagicLink(input: {
    userId: string;
    email: string;
    tokenHash: string;
    expiresAt: Date;
  }): Promise<void>;
  consumeMagicLink(tokenHash: string, now: Date): Promise<ConsumedMagicLink | null>;
  createSession(input: {
    userId: string;
    sessionTokenHash: string;
    expiresAt: Date;
  }): Promise<void>;
  getUserBySessionTokenHash(sessionTokenHash: string, now: Date): Promise<DentistOSUser | null>;
  deleteSessionByTokenHash(sessionTokenHash: string): Promise<void>;
};

export type MagicLinkRequestResult = {
  success: true;
  email: string;
  expiresAt: Date;
};

export type MagicLinkVerificationResult =
  | {
      success: true;
      user: DentistOSUser;
      rawSessionToken: string;
      sessionExpiresAt: Date;
    }
  | {
      success: false;
      reason: "INVALID_OR_EXPIRED_MAGIC_LINK";
    };

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function isValidEmail(email: string): boolean {
  return /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email);
}

export function generateSecureToken(bytes: number): string {
  return randomBytes(bytes).toString("base64url");
}

export function hashToken(rawToken: string): string {
  if (!rawToken) {
    throw new Error("Token is required.");
  }
  return createHash("sha256").update(rawToken).digest("hex");
}

export function addMinutes(date: Date, minutes: number): Date {
  return new Date(date.getTime() + minutes * 60 * 1000);
}

export function addDays(date: Date, days: number): Date {
  return new Date(date.getTime() + days * 24 * 60 * 60 * 1000);
}

export function buildMagicLinkUrl(siteUrl: string, rawToken: string): string {
  const url = new URL("/api/dentistos/auth/callback", siteUrl);
  url.searchParams.set("token", rawToken);
  return url.toString();
}

export async function requestMagicLink(input: {
  email: string;
  name?: string | null;
  siteUrl: string;
  repository: DentistOSAuthRepository;
  sendMagicLink: (message: MagicLinkEmail) => Promise<void>;
  now?: Date;
}): Promise<MagicLinkRequestResult> {
  const email = normalizeEmail(input.email);
  if (!isValidEmail(email)) {
    throw new Error("Valid email is required.");
  }

  const now = input.now ?? new Date();
  const expiresAt = addMinutes(now, MAGIC_LINK_TTL_MINUTES);
  const rawToken = generateSecureToken(DENTISTOS_MAGIC_LINK_TOKEN_BYTES);
  const tokenHash = hashToken(rawToken);
  const user = await input.repository.upsertUserByEmail(email, input.name?.trim() || null);

  await input.repository.createMagicLink({
    userId: user.id,
    email,
    tokenHash,
    expiresAt,
  });

  await input.sendMagicLink({
    email,
    magicLink: buildMagicLinkUrl(input.siteUrl, rawToken),
    expiresAt,
  });

  return { success: true, email, expiresAt };
}

export async function verifyMagicLink(input: {
  token: string;
  repository: DentistOSAuthRepository;
  now?: Date;
}): Promise<MagicLinkVerificationResult> {
  if (!input.token) {
    return { success: false, reason: "INVALID_OR_EXPIRED_MAGIC_LINK" };
  }

  const now = input.now ?? new Date();
  const consumed = await input.repository.consumeMagicLink(hashToken(input.token), now);
  if (!consumed) {
    return { success: false, reason: "INVALID_OR_EXPIRED_MAGIC_LINK" };
  }

  const rawSessionToken = generateSecureToken(DENTISTOS_SESSION_TOKEN_BYTES);
  const sessionTokenHash = hashToken(rawSessionToken);
  const sessionExpiresAt = addDays(now, SESSION_TTL_DAYS);

  await input.repository.createSession({
    userId: consumed.userId,
    sessionTokenHash,
    expiresAt: sessionExpiresAt,
  });

  const user = await input.repository.getUserBySessionTokenHash(sessionTokenHash, now);
  if (!user) {
    return { success: false, reason: "INVALID_OR_EXPIRED_MAGIC_LINK" };
  }

  return {
    success: true,
    user,
    rawSessionToken,
    sessionExpiresAt,
  };
}

export async function getCurrentUserFromSessionToken(input: {
  rawSessionToken: string;
  repository: DentistOSAuthRepository;
  now?: Date;
}): Promise<DentistOSUser | null> {
  if (!input.rawSessionToken) return null;
  return input.repository.getUserBySessionTokenHash(
    hashToken(input.rawSessionToken),
    input.now ?? new Date()
  );
}

export async function logoutSession(input: {
  rawSessionToken: string;
  repository: DentistOSAuthRepository;
}): Promise<void> {
  if (!input.rawSessionToken) return;
  await input.repository.deleteSessionByTokenHash(hashToken(input.rawSessionToken));
}

export function buildSessionCookie(
  rawSessionToken: string,
  expiresAt: Date,
  production: boolean
): string {
  return [
    `${DENTISTOS_SESSION_COOKIE}=${encodeURIComponent(rawSessionToken)}`,
    "Path=/",
    `Expires=${expiresAt.toUTCString()}`,
    "HttpOnly",
    "SameSite=Lax",
    production ? "Secure" : "",
  ]
    .filter(Boolean)
    .join("; ");
}

export function buildExpiredSessionCookie(production: boolean): string {
  return [
    `${DENTISTOS_SESSION_COOKIE}=`,
    "Path=/",
    "Max-Age=0",
    "HttpOnly",
    "SameSite=Lax",
    production ? "Secure" : "",
  ]
    .filter(Boolean)
    .join("; ");
}
