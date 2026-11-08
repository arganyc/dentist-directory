import assert from "node:assert/strict";
import test from "node:test";

import {
  createDentistOSListingsGetHandler,
  getDentistOSListingPreflightWithSql,
  type DentistOSPreflightSqlClient,
} from "../src/lib/dentistos-listings-preflight.ts";

test("GET preflight returns live profile and claim state", async () => {
  const handler = createDentistOSListingsGetHandler({
    expectedToken: () => "test-token",
    preflight: async (npi) => ({
      success: true,
      npi,
      profile_exists: true,
      profile_url: "/dentists/dr-example-1234567890",
      claimed: false,
    }),
  });

  const response = await handler(request("1234567890", "test-token"));
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), {
    success: true,
    npi: "1234567890",
    profile_exists: true,
    profile_url: "/dentists/dr-example-1234567890",
    claimed: false,
  });
  assert.equal(response.headers.get("cache-control"), "no-store");
});

test("GET preflight requires bearer authentication", async () => {
  const handler = createDentistOSListingsGetHandler({
    expectedToken: () => "test-token",
    preflight: async () => {
      throw new Error("must not run");
    },
  });

  const response = await handler(request("1234567890", null));
  assert.equal(response.status, 401);
  assert.deepEqual(await response.json(), { success: false, error: "unauthorized" });
});

test("GET preflight rejects invalid NPI", async () => {
  const handler = createDentistOSListingsGetHandler({
    expectedToken: () => "test-token",
    preflight: async () => {
      throw new Error("must not run");
    },
  });

  const response = await handler(request("123", "test-token"));
  assert.equal(response.status, 400);
  assert.deepEqual(await response.json(), { success: false, error: "invalid_npi" });
});

test("repository resolves missing, live, and claimed state in one query", async () => {
  const sql: DentistOSPreflightSqlClient = {
    query: async (_text, params) => {
      assert.deepEqual(params, ["1234567890"]);
      return [{ profile_exists: true, slug: "dr-example-1234567890", claimed: true }];
    },
  };

  assert.deepEqual(await getDentistOSListingPreflightWithSql("1234567890", sql), {
    success: true,
    npi: "1234567890",
    profile_exists: true,
    profile_url: "/dentists/dr-example-1234567890",
    claimed: true,
  });
});

function request(npi: string, token: string | null): Request {
  const headers = new Headers();
  if (token) headers.set("authorization", `Bearer ${token}`);
  return new Request(`https://local.test/api/dentistos/listings?npi=${npi}`, { headers });
}
