import assert from "node:assert/strict";
import test from "node:test";

import {
  DENTISTOS_SESSION_COOKIE,
  getCurrentUserFromSessionToken,
  hashToken,
  logoutSession,
  requestMagicLink,
  verifyMagicLink,
  type ConsumedMagicLink,
  type DentistOSAuthRepository,
  type DentistOSUser,
  type MagicLinkEmail,
} from "../src/lib/dentistos-auth.ts";
import {
  createDentistOSLoginRequestHandler,
  createDentistOSLogoutHandler,
  createDentistOSMagicLinkCallbackHandler,
} from "../src/lib/dentistos-auth-route.ts";

const NOW = new Date("2026-08-12T12:00:00Z");

test("valid login request creates a single-use magic link without storing the raw token", async () => {
  const repo = new MemoryAuthRepository();
  const sent: MagicLinkEmail[] = [];

  const result = await requestMagicLink({
    email: " Dentist@Example.com ",
    name: "Dr. Example",
    siteUrl: "https://www.usdentistsdirectory.com",
    repository: repo,
    sendMagicLink: async (message) => {
      sent.push(message);
    },
    now: NOW,
  });

  assert.equal(result.success, true);
  assert.equal(result.email, "dentist@example.com");
  assert.equal(sent.length, 1);
  assert.equal(sent[0].email, "dentist@example.com");

  const rawMagicToken = new URL(sent[0].magicLink).searchParams.get("token") ?? "";
  assert.ok(rawMagicToken);
  assert.equal(repo.magicLinks.length, 1);
  assert.notEqual(repo.magicLinks[0].tokenHash, rawMagicToken);
  assert.equal(repo.magicLinks[0].tokenHash, hashToken(rawMagicToken));
});

test("invalid magic link is rejected", async () => {
  const repo = new MemoryAuthRepository();

  const result = await verifyMagicLink({
    token: "not-real",
    repository: repo,
    now: NOW,
  });

  assert.deepEqual(result, {
    success: false,
    reason: "INVALID_OR_EXPIRED_MAGIC_LINK",
  });
});

test("expired magic link is rejected", async () => {
  const { repo, rawMagicToken } = await requestedMagicLink();

  const result = await verifyMagicLink({
    token: rawMagicToken,
    repository: repo,
    now: new Date("2026-08-12T12:20:01Z"),
  });

  assert.equal(result.success, false);
  assert.equal(repo.sessions.length, 0);
});

test("valid magic link creates a hashed session and cannot be reused", async () => {
  const { repo, rawMagicToken } = await requestedMagicLink();

  const result = await verifyMagicLink({
    token: rawMagicToken,
    repository: repo,
    now: NOW,
  });

  assert.equal(result.success, true);
  assert.equal(repo.sessions.length, 1);
  assert.notEqual(repo.sessions[0].sessionTokenHash, result.success && result.rawSessionToken);
  assert.equal(repo.sessions[0].sessionTokenHash, hashToken(result.success ? result.rawSessionToken : ""));

  const reuse = await verifyMagicLink({
    token: rawMagicToken,
    repository: repo,
    now: NOW,
  });
  assert.equal(reuse.success, false);
});

test("valid session resolves the current user", async () => {
  const { repo, rawMagicToken } = await requestedMagicLink();
  const verified = await verifyMagicLink({ token: rawMagicToken, repository: repo, now: NOW });
  assert.equal(verified.success, true);

  const user = await getCurrentUserFromSessionToken({
    rawSessionToken: verified.success ? verified.rawSessionToken : "",
    repository: repo,
    now: NOW,
  });

  assert.equal(user?.email, "dentist@example.com");
});

test("invalid session returns null", async () => {
  const repo = new MemoryAuthRepository();

  const user = await getCurrentUserFromSessionToken({
    rawSessionToken: "invalid-session",
    repository: repo,
    now: NOW,
  });

  assert.equal(user, null);
});

test("expired session returns null", async () => {
  const { repo, rawMagicToken } = await requestedMagicLink();
  const verified = await verifyMagicLink({ token: rawMagicToken, repository: repo, now: NOW });
  assert.equal(verified.success, true);

  const user = await getCurrentUserFromSessionToken({
    rawSessionToken: verified.success ? verified.rawSessionToken : "",
    repository: repo,
    now: new Date("2026-09-12T12:00:01Z"),
  });

  assert.equal(user, null);
});

test("logout invalidates a persisted session", async () => {
  const { repo, rawMagicToken } = await requestedMagicLink();
  const verified = await verifyMagicLink({ token: rawMagicToken, repository: repo, now: NOW });
  assert.equal(verified.success, true);

  const rawSessionToken = verified.success ? verified.rawSessionToken : "";
  await logoutSession({ rawSessionToken, repository: repo });

  const user = await getCurrentUserFromSessionToken({
    rawSessionToken,
    repository: repo,
    now: NOW,
  });

  assert.equal(user, null);
});

test("login request endpoint sends a magic link without exposing it in the response", async () => {
  const repo = new MemoryAuthRepository();
  const sent: MagicLinkEmail[] = [];
  const handler = createDentistOSLoginRequestHandler({
    repository: repo,
    siteUrl: () => "https://www.usdentistsdirectory.com",
    sendMagicLink: async (message) => {
      sent.push(message);
    },
  });

  const response = await handler(
    new Request("https://www.usdentistsdirectory.com/api/dentistos/auth/login", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email: "dentist@example.com" }),
    })
  );
  const body = await response.json();

  assert.equal(response.status, 200);
  assert.deepEqual(body, { success: true });
  assert.equal(sent.length, 1);
});

test("magic-link callback sets an HttpOnly session cookie", async () => {
  const { repo, rawMagicToken } = await requestedMagicLink();
  const handler = createDentistOSMagicLinkCallbackHandler({
    repository: repo,
    production: () => true,
    now: () => NOW,
  });

  const response = await handler(
    new Request(`https://www.usdentistsdirectory.com/api/dentistos/auth/callback?token=${rawMagicToken}`)
  );
  const cookie = response.headers.get("set-cookie") ?? "";

  assert.equal(response.status, 303);
  assert.match(response.headers.get("location") ?? "", /\/login\?verified=1$/);
  assert.match(cookie, new RegExp(`${DENTISTOS_SESSION_COOKIE}=`));
  assert.match(cookie, /HttpOnly/);
  assert.match(cookie, /Secure/);
  assert.match(cookie, /SameSite=Lax/);
});

test("logout endpoint deletes the session and clears the cookie", async () => {
  const { repo, rawMagicToken } = await requestedMagicLink();
  const verified = await verifyMagicLink({ token: rawMagicToken, repository: repo, now: NOW });
  assert.equal(verified.success, true);
  const rawSessionToken = verified.success ? verified.rawSessionToken : "";
  const handler = createDentistOSLogoutHandler({
    repository: repo,
    production: () => true,
  });

  const response = await handler(
    new Request("https://www.usdentistsdirectory.com/api/dentistos/auth/logout", {
      method: "POST",
      headers: { cookie: `${DENTISTOS_SESSION_COOKIE}=${encodeURIComponent(rawSessionToken)}` },
    })
  );

  assert.equal(response.status, 200);
  assert.match(response.headers.get("set-cookie") ?? "", /Max-Age=0/);
  assert.equal(repo.sessions.length, 0);
});

async function requestedMagicLink(): Promise<{
  repo: MemoryAuthRepository;
  rawMagicToken: string;
}> {
  const repo = new MemoryAuthRepository();
  const sent: MagicLinkEmail[] = [];
  await requestMagicLink({
    email: "dentist@example.com",
    siteUrl: "https://www.usdentistsdirectory.com",
    repository: repo,
    sendMagicLink: async (message) => {
      sent.push(message);
    },
    now: NOW,
  });
  const rawMagicToken = new URL(sent[0].magicLink).searchParams.get("token") ?? "";
  return { repo, rawMagicToken };
}

type StoredMagicLink = {
  userId: string;
  email: string;
  tokenHash: string;
  expiresAt: Date;
  consumedAt: Date | null;
};

type StoredSession = {
  userId: string;
  sessionTokenHash: string;
  expiresAt: Date;
};

class MemoryAuthRepository implements DentistOSAuthRepository {
  users: DentistOSUser[] = [];
  magicLinks: StoredMagicLink[] = [];
  sessions: StoredSession[] = [];

  async upsertUserByEmail(email: string, name: string | null): Promise<DentistOSUser> {
    const existing = this.users.find((user) => user.email === email);
    if (existing) {
      existing.name = name ?? existing.name;
      return existing;
    }

    const user = {
      id: `user-${this.users.length + 1}`,
      email,
      name,
    };
    this.users.push(user);
    return user;
  }

  async createMagicLink(input: {
    userId: string;
    email: string;
    tokenHash: string;
    expiresAt: Date;
  }): Promise<void> {
    this.magicLinks.push({
      userId: input.userId,
      email: input.email,
      tokenHash: input.tokenHash,
      expiresAt: input.expiresAt,
      consumedAt: null,
    });
  }

  async consumeMagicLink(tokenHash: string, now: Date): Promise<ConsumedMagicLink | null> {
    const link = this.magicLinks.find(
      (item) => item.tokenHash === tokenHash && !item.consumedAt && item.expiresAt > now
    );
    if (!link) return null;
    link.consumedAt = now;
    return { userId: link.userId, email: link.email };
  }

  async createSession(input: {
    userId: string;
    sessionTokenHash: string;
    expiresAt: Date;
  }): Promise<void> {
    this.sessions.push({
      userId: input.userId,
      sessionTokenHash: input.sessionTokenHash,
      expiresAt: input.expiresAt,
    });
  }

  async getUserBySessionTokenHash(
    sessionTokenHash: string,
    now: Date
  ): Promise<DentistOSUser | null> {
    const session = this.sessions.find(
      (item) => item.sessionTokenHash === sessionTokenHash && item.expiresAt > now
    );
    if (!session) return null;
    return this.users.find((user) => user.id === session.userId) ?? null;
  }

  async deleteSessionByTokenHash(sessionTokenHash: string): Promise<void> {
    this.sessions = this.sessions.filter((item) => item.sessionTokenHash !== sessionTokenHash);
  }
}
