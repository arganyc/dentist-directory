import assert from "node:assert/strict";
import test from "node:test";

import {
  getDentistBySlugWithSql,
  type DentistLookupSqlClient,
} from "../src/lib/dentist-profile-lookup.ts";
import { stateListingPathForDentistsSegment } from "../src/lib/dentists-route-resolution.ts";

test("getDentistBySlug resolves direct DentistOS-created slug first", async () => {
  const fake = fakeSql({
    bySlug: row({
      id: "3",
      slug: "arlington-family-dentistry",
      name: "Arlington Family Dentistry",
      practice_name: "Arlington Family Dentistry",
    }),
  });

  const dentist = await getDentistBySlugWithSql("arlington-family-dentistry", fake.sql);

  assert.equal(dentist?.id, "3");
  assert.equal(dentist?.slug, "arlington-family-dentistry");
  assert.equal(dentist?.name, "Arlington Family Dentistry");
  assert.deepEqual(fake.calls.map((call) => call.params), [["arlington-family-dentistry"]]);
});

test("getDentistBySlug preserves legacy NPI slug fallback", async () => {
  const fake = fakeSql({
    byId: row({
      id: "1234567890",
      slug: "legacy-dentist-1234567890",
      name: "Legacy Dentist",
    }),
  });

  const dentist = await getDentistBySlugWithSql("legacy-dentist-1234567890", fake.sql);

  assert.equal(dentist?.id, "1234567890");
  assert.equal(dentist?.slug, "legacy-dentist-1234567890");
  assert.deepEqual(fake.calls.map((call) => call.params), [
    ["legacy-dentist-1234567890"],
    ["1234567890"],
  ]);
});

test("getDentistBySlug returns undefined for unknown direct and legacy slugs", async () => {
  const fake = fakeSql();

  const direct = await getDentistBySlugWithSql("unknown-dentist", fake.sql);
  const legacy = await getDentistBySlugWithSql("unknown-dentist-9999999999", fake.sql);

  assert.equal(direct, undefined);
  assert.equal(legacy, undefined);
});

test("route resolution lets Arlington Family Dentistry-style slug reach dentist profile route", () => {
  assert.equal(stateListingPathForDentistsSegment("arlington-family-dentistry"), undefined);
});

test("route resolution still rewrites recognized state slugs to state listing routes", () => {
  assert.equal(stateListingPathForDentistsSegment("virginia"), "/dentists/state/virginia");
});

function fakeSql(options: { bySlug?: Row; byId?: Row } = {}): {
  sql: DentistLookupSqlClient;
  calls: { text: string; params: unknown[] }[];
} {
  const calls: { text: string; params: unknown[] }[] = [];
  const sql = Object.assign(
    async () => {
      throw new Error("tagged SQL should not be used in this test");
    },
    {
      query: async (text: string, params: unknown[] = []) => {
        calls.push({ text, params });
        if (text.includes("WHERE slug = $1")) {
          return options.bySlug ? [options.bySlug] : [];
        }
        if (text.includes("WHERE id = $1")) {
          return options.byId ? [options.byId] : [];
        }
        throw new Error(`Unexpected SQL in test: ${text}`);
      },
    }
  ) as DentistLookupSqlClient;

  return { sql, calls };
}

type Row = {
  id: string;
  slug: string;
  name: string;
  credentials: string;
  specialty: string;
  practice_name: string;
  street: string;
  city: string;
  state: string;
  state_code: string;
  zip: string;
  phone: string;
  rating: number | string;
  review_count: number;
  accepting_new_patients: boolean;
  years_experience: number;
  is_premium: boolean;
};

function row(overrides: Partial<Row> = {}): Row {
  return {
    id: "1",
    slug: "example-dental",
    name: "Example Dental",
    credentials: "",
    specialty: "General Dentistry",
    practice_name: "Example Dental",
    street: "123 Main St",
    city: "Arlington",
    state: "Virginia",
    state_code: "VA",
    zip: "22201",
    phone: "703-555-0100",
    rating: 0,
    review_count: 0,
    accepting_new_patients: false,
    years_experience: 0,
    is_premium: false,
    ...overrides,
  };
}
