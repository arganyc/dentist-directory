import assert from "node:assert/strict";
import test from "node:test";

import {
  hasReviewAggregate,
  profileAboutText,
  providerIdentityForDentist,
  validNpi,
  visibleProfileReviews,
} from "../src/lib/dentist-profile-ui.ts";
import { getReviewsForDentist, type Review } from "../src/lib/reviews.ts";
import type { Dentist } from "../src/lib/dentists.ts";

test("DentistOS-created profile with no valid NPI does not expose fake NPI identity", () => {
  const dentist = dentistFixture({
    id: "3",
    slug: "arlington-family-dentistry",
    name: "Arlington Family Dentistry",
    practiceName: "Arlington Family Dentistry",
    rating: 0,
    reviewCount: 0,
  });
  const identity = providerIdentityForDentist(dentist);
  const about = profileAboutText(dentist);

  assert.equal(validNpi(dentist.id), undefined);
  assert.equal(identity.npiVerified, false);
  assert.equal(identity.label, "Directory Listing ID");
  assert.equal(identity.value, "3");
  assert.doesNotMatch(about, /National Provider Identifier|NPI registry/i);
});

test("legacy profile with valid 10-digit NPI still displays NPI identity", () => {
  const dentist = dentistFixture({ id: "1234567890" });
  const identity = providerIdentityForDentist(dentist);
  const about = profileAboutText(dentist);

  assert.equal(validNpi(dentist.id), "1234567890");
  assert.equal(identity.npiVerified, true);
  assert.equal(identity.label, "NPI Number");
  assert.equal(identity.value, "1234567890");
  assert.match(about, /National Provider Identifier \(NPI\) registry/);
});

test("reviewCount zero renders no placeholder patient review cards", () => {
  const dentist = dentistFixture({ id: "3", rating: 0, reviewCount: 0 });

  assert.equal(hasReviewAggregate(dentist), false);
  assert.deepEqual(getReviewsForDentist(dentist.id), []);
  assert.deepEqual(visibleProfileReviews(dentist, sampleReviews()), []);
});

test("genuine reviews remain consistent with nonzero aggregate review count", () => {
  const dentist = dentistFixture({ rating: 4.5, reviewCount: 2 });
  const visibleReviews = visibleProfileReviews(dentist, sampleReviews());

  assert.equal(hasReviewAggregate(dentist), true);
  assert.equal(visibleReviews.length, 2);
  assert.deepEqual(
    visibleReviews.map((review) => review.title),
    ["Professional care", "Clear communication"]
  );
});

function dentistFixture(overrides: Partial<Dentist> = {}): Dentist {
  return {
    id: "1234567890",
    slug: "legacy-dentist-1234567890",
    name: "Example Dentist",
    credentials: "DDS",
    specialty: "General Dentistry",
    practiceName: "Example Dental",
    address: {
      street: "123 Main St",
      city: "Arlington",
      state: "Virginia",
      stateCode: "VA",
      zip: "22201",
    },
    phone: "703-555-0100",
    email: "",
    website: "",
    rating: 4.5,
    reviewCount: 2,
    acceptingNewPatients: false,
    yearsExperience: 0,
    bio: "",
    education: [],
    languages: [],
    insurance: [],
    hours: [],
    isPremium: false,
    ...overrides,
  };
}

function sampleReviews(): Review[] {
  return [
    {
      author: "Patient A",
      rating: 5,
      date: "2026-08-01",
      title: "Professional care",
      body: "The visit was professional and clear.",
    },
    {
      author: "Patient B",
      rating: 4,
      date: "2026-08-02",
      title: "Clear communication",
      body: "The office explained the appointment well.",
    },
    {
      author: "Patient C",
      rating: 5,
      date: "2026-08-03",
      title: "Helpful team",
      body: "The team was helpful.",
    },
  ];
}
