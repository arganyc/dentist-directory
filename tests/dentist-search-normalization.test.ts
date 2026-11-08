import assert from "node:assert/strict";
import test from "node:test";

import { normalizeDentistSearchQuery } from "../src/lib/dentists.ts";

test("normalizes dentist titles, punctuation, capitalization, and spaces", () => {
  assert.equal(
    normalizeDentistSearchQuery("  DR.   Maqsood A. Chaudhry  "),
    "maqsood a chaudhry"
  );
  assert.equal(
    normalizeDentistSearchQuery("Doctor Maqsood A Chaudhry"),
    "maqsood a chaudhry"
  );
});

test("removes common dentist credentials without changing the name", () => {
  assert.equal(
    normalizeDentistSearchQuery("Dr. Maqsood A. Chaudhry, DDS"),
    "maqsood a chaudhry"
  );
  assert.equal(
    normalizeDentistSearchQuery("MAQSOOD A CHAUDHRY DMD"),
    "maqsood a chaudhry"
  );
});

test("normalizes punctuation in practice names and preserves useful words", () => {
  assert.equal(
    normalizeDentistSearchQuery("Smith & Jones Dental, P.C."),
    "smith jones dental p c"
  );
});

test("returns an empty query when only a title is entered", () => {
  assert.equal(normalizeDentistSearchQuery("Dr."), "");
  assert.equal(normalizeDentistSearchQuery("Doctor"), "");
});
