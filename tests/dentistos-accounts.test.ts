import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import {
  createSessionTokenPair,
  DENTISTOS_ACCOUNT_ROLES,
  hashSessionToken,
  isDentistOSAccountRole,
} from "../src/lib/dentistos-accounts.ts";

const migrationSource = readFileSync(new URL("../scripts/migrate.ts", import.meta.url), "utf8");

test("session tokens are generated separately from their persisted hash", () => {
  const pair = createSessionTokenPair();

  assert.ok(pair.rawToken.length >= 32);
  assert.match(pair.sessionTokenHash, /^[a-f0-9]{64}$/);
  assert.notEqual(pair.rawToken, pair.sessionTokenHash);
  assert.equal(hashSessionToken(pair.rawToken), pair.sessionTokenHash);
});

test("session token hashing is deterministic and rejects empty raw tokens", () => {
  assert.equal(hashSessionToken("same-token"), hashSessionToken("same-token"));
  assert.notEqual(hashSessionToken("same-token"), hashSessionToken("other-token"));
  assert.throws(() => hashSessionToken(""), /Session token is required/);
});

test("account roles are limited to owner staff and admin", () => {
  assert.deepEqual([...DENTISTOS_ACCOUNT_ROLES], ["OWNER", "STAFF", "ADMIN"]);
  assert.equal(isDentistOSAccountRole("OWNER"), true);
  assert.equal(isDentistOSAccountRole("STAFF"), true);
  assert.equal(isDentistOSAccountRole("ADMIN"), true);
  assert.equal(isDentistOSAccountRole("VIEWER"), false);
});

test("migration creates DentistOS account foundation tables without altering existing dentist data", () => {
  for (const table of [
    "users",
    "user_sessions",
    "auth_magic_links",
    "practices",
    "practice_memberships",
    "practice_listing_links",
  ]) {
    assert.match(migrationSource, new RegExp(`CREATE TABLE IF NOT EXISTS ${table}\\s+\\(`));
  }

  assert.doesNotMatch(migrationSource, /ALTER TABLE dentists DROP|DELETE FROM dentists/i);
  assert.doesNotMatch(migrationSource, /ALTER TABLE claims DROP|DELETE FROM claims/i);
});

test("migration stores only hashed session tokens with expiration", () => {
  assert.match(migrationSource, /session_token_hash\s+TEXT UNIQUE NOT NULL/);
  assert.match(migrationSource, /expires_at\s+TIMESTAMPTZ NOT NULL/);
  assert.match(migrationSource, /token_hash\s+TEXT UNIQUE NOT NULL/);
  assert.match(migrationSource, /consumed_at\s+TIMESTAMPTZ/);
  assert.doesNotMatch(migrationSource, /raw_session_token|raw_magic_token|session_token\s+TEXT/i);
});

test("migration keeps claim-token member tools bridge and adds DentistOS link metadata", () => {
  assert.match(migrationSource, /access_token TEXT UNIQUE/);
  assert.match(migrationSource, /dentist_id\s+TEXT REFERENCES dentists\(id\) ON DELETE SET NULL/);
  assert.match(migrationSource, /ALTER TABLE claims ADD COLUMN IF NOT EXISTS dentist_id TEXT/);
  assert.match(migrationSource, /claims_dentist_id_fkey/);
  assert.match(migrationSource, /dentistos_user_id UUID/);
  assert.match(migrationSource, /dentistos_practice_id UUID/);
  assert.match(migrationSource, /dentistos_linked_at TIMESTAMPTZ/);
});

test("migration defines relationship constraints for account and practice tables", () => {
  assert.match(migrationSource, /user_id\s+UUID NOT NULL REFERENCES users\(id\) ON DELETE CASCADE/);
  assert.match(migrationSource, /practice_id\s+UUID NOT NULL REFERENCES practices\(id\) ON DELETE CASCADE/);
  assert.match(migrationSource, /dentist_id\s+TEXT NOT NULL REFERENCES dentists\(id\) ON DELETE CASCADE/);
  assert.match(migrationSource, /claim_id\s+INTEGER REFERENCES claims\(id\) ON DELETE SET NULL/);
});

test("migration defines unique constraints for memberships and listing links", () => {
  assert.match(migrationSource, /email\s+TEXT UNIQUE NOT NULL/);
  assert.match(migrationSource, /session_token_hash\s+TEXT UNIQUE NOT NULL/);
  assert.match(migrationSource, /UNIQUE \(practice_id, user_id\)/);
  assert.match(migrationSource, /UNIQUE \(practice_id, dentist_id\)/);
  assert.match(migrationSource, /idx_practice_listing_links_active_dentist/);
});

test("practice listing links do not assume dentist_id is an NPI", () => {
  assert.match(migrationSource, /dentist_id\s+TEXT NOT NULL REFERENCES dentists\(id\)/);
  assert.doesNotMatch(migrationSource, /dentist_id\s+.*CHECK.*\\d\{10\}|npi_id/i);
});
