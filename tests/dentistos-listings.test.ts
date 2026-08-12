import assert from "node:assert/strict";
import test from "node:test";

import { createDentistOSListingsPostHandler } from "../src/lib/dentistos-listings-route.ts";
import {
  validateDentistOSPublishPayload,
  verifyDentistOSBearerToken,
  type DentistOSPublishPayload,
  type ExistingDentistListing,
} from "../src/lib/dentistos-listings.ts";
import {
  upsertDentistOSListingWithSql,
  type DentistOSSqlClient,
} from "../src/lib/dentistos-listings-repository.ts";

test("POST handler publishes a valid DentistOS payload", async () => {
  let receivedPayload: DentistOSPublishPayload | null = null;
  const handler = createDentistOSListingsPostHandler({
    expectedToken: () => "test-token",
    upsert: async (payload) => {
      receivedPayload = payload;
      return {
        success: true,
        external_id: "123",
        external_url: "/dentists/example-dental",
        action: "created",
      };
    },
  });

  const response = await handler(request(validPayload(), "test-token"));
  const body = await response.json();

  assert.equal(response.status, 200);
  assert.deepEqual(body, {
    success: true,
    external_id: "123",
    external_url: "/dentists/example-dental",
    action: "created",
  });
  assert.equal(receivedPayload?.candidate_id, 123);
  assert.equal(receivedPayload?.slug, "example-dental");
});

test("upsert creates a new dentist row keyed by candidate_id", async () => {
  const fake = fakeSql();

  const result = await upsertDentistOSListingWithSql(validPayload(), fake.sql);

  assert.deepEqual(result, {
    success: true,
    external_id: "123",
    external_url: "/dentists/example-dental",
    action: "created",
  });
  assert.equal(fake.insertCalls.length, 1);
  assert.equal(fake.insertCalls[0].params[0], "123");
  assert.equal(fake.insertCalls[0].params[1], "example-dental");
  assert.equal(fake.insertCalls[0].params[4], "General Dentistry");
  assert.equal(fake.insertCalls[0].params[9], "VA");
});

test("upsert updates an existing dentist row and preserves existing fields when payload omits them", async () => {
  const fake = fakeSql({
    byId: {
      id: "123",
      slug: "old-example-dental",
      credentials: "DDS",
      specialty: "Orthodontics",
      street: "10 Old St",
      zip: "22202",
      phone: "703-555-9999",
      rating: "4.8",
      review_count: 12,
      accepting_new_patients: false,
      years_experience: 9,
      is_premium: true,
    },
  });
  const payload = validPayload({
    address: null,
    phone: null,
    practice_category: null,
    zip_code: null,
  });

  const result = await upsertDentistOSListingWithSql(payload, fake.sql);

  assert.equal(result.action, "updated");
  assert.equal(fake.insertCalls.length, 1);
  assert.equal(fake.insertCalls[0].params[3], "DDS");
  assert.equal(fake.insertCalls[0].params[4], "Orthodontics");
  assert.equal(fake.insertCalls[0].params[6], "10 Old St");
  assert.equal(fake.insertCalls[0].params[10], "22202");
  assert.equal(fake.insertCalls[0].params[11], "703-555-9999");
  assert.equal(fake.insertCalls[0].params[12], 4.8);
  assert.equal(fake.insertCalls[0].params[14], false);
  assert.equal(fake.insertCalls[0].params[16], true);
});

test("handler rejects missing bearer token", async () => {
  const handler = createDentistOSListingsPostHandler({
    expectedToken: () => "test-token",
    upsert: async () => {
      throw new Error("upsert should not run");
    },
  });

  const response = await handler(request(validPayload(), null));
  const body = await response.json();

  assert.equal(response.status, 401);
  assert.deepEqual(body, { success: false, error: "unauthorized" });
});

test("handler rejects invalid bearer token", async () => {
  const handler = createDentistOSListingsPostHandler({
    expectedToken: () => "test-token",
    upsert: async () => {
      throw new Error("upsert should not run");
    },
  });

  const response = await handler(request(validPayload(), "wrong-token"));
  const body = await response.json();

  assert.equal(response.status, 401);
  assert.deepEqual(body, { success: false, error: "unauthorized" });
});

test("handler rejects malformed payload", async () => {
  const handler = createDentistOSListingsPostHandler({
    expectedToken: () => "test-token",
    upsert: async () => {
      throw new Error("upsert should not run");
    },
  });

  const response = await handler(request({ candidate_id: 0 }, "test-token"));
  const body = await response.json();

  assert.equal(response.status, 400);
  assert.equal(body.success, false);
  assert.equal(body.error, "invalid_payload");
  assert.ok(body.details.includes("candidate_id must be a positive integer"));
});

test("upsert prevents duplicate dentist rows when slug belongs to another id", async () => {
  const fake = fakeSql({
    bySlug: {
      id: "999",
      slug: "example-dental",
    },
  });

  await assert.rejects(
    () => upsertDentistOSListingWithSql(validPayload(), fake.sql),
    /A dentist listing already exists for this slug/
  );
  assert.equal(fake.insertCalls.length, 0);
});

test("token verification requires the configured bearer token", () => {
  assert.equal(verifyDentistOSBearerToken("Bearer test-token", "test-token"), true);
  assert.equal(verifyDentistOSBearerToken("Bearer test-token", "other-token"), false);
  assert.equal(verifyDentistOSBearerToken(null, "test-token"), false);
  assert.equal(verifyDentistOSBearerToken("Basic test-token", "test-token"), false);
});

test("payload validator accepts the exact DentistOS publish payload contract", () => {
  const payload = validateDentistOSPublishPayload(validPayload());

  assert.deepEqual(Object.keys(payload).sort(), [
    "address",
    "candidate_id",
    "city",
    "description",
    "phone",
    "practice_category",
    "practice_name",
    "prepared_at",
    "public_email",
    "slug",
    "source_summary",
    "state",
    "website",
    "zip_code",
  ]);
});

function request(payload: unknown, token: string | null): Request {
  const headers = new Headers({ "content-type": "application/json" });
  if (token) {
    headers.set("authorization", `Bearer ${token}`);
  }
  return new Request("https://local.test/api/dentistos/listings", {
    method: "POST",
    headers,
    body: JSON.stringify(payload),
  });
}

function validPayload(overrides: Partial<DentistOSPublishPayload> = {}): DentistOSPublishPayload {
  return {
    candidate_id: 123,
    practice_name: "Example Dental",
    slug: "example-dental",
    website: "https://example.com",
    phone: "703-555-0100",
    public_email: "hello@example.com",
    address: "123 Main St",
    city: "Arlington",
    state: "VA",
    zip_code: "22201",
    practice_category: "GENERAL_DENTISTRY",
    description: null,
    source_summary: "mixed",
    prepared_at: "2026-08-11T12:00:00Z",
    ...overrides,
  };
}

function fakeSql(options: {
  byId?: ExistingDentistListing;
  bySlug?: ExistingDentistListing;
} = {}): {
  sql: DentistOSSqlClient;
  insertCalls: { text: string; params: unknown[] }[];
} {
  const insertCalls: { text: string; params: unknown[] }[] = [];
  const sql: DentistOSSqlClient = {
    query: async (text: string, params: unknown[] = []) => {
    if (text.includes("WHERE id = $1")) {
      return options.byId ? [options.byId] : [];
    }

    if (text.includes("WHERE slug = $1")) {
      return options.bySlug ? [options.bySlug] : [];
    }

    if (text.includes("INSERT INTO dentists")) {
      insertCalls.push({ text, params });
      return [{ id: String(params[0]), slug: String(params[1]) }];
    }

    throw new Error(`Unexpected SQL in test: ${text}`);
    },
  };

  return { sql, insertCalls };
}
