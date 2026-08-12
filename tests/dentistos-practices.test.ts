import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import type { DentistOSUser } from "../src/lib/dentistos-auth.ts";
import {
  assertValidPracticeMembership,
  getAuthorizedPracticeContext,
  PracticeAuthorizationError,
  type DentistOSPracticeAuthorizationRepository,
  type DentistOSPracticeContext,
} from "../src/lib/dentistos-practices.ts";

const dashboardPageSource = readFileSync(
  new URL("../src/app/dentistos/dashboard/page.tsx", import.meta.url),
  "utf8"
);
const dentistOSHomePageSource = readFileSync(
  new URL("../src/app/dentistos/page.tsx", import.meta.url),
  "utf8"
);

const user: DentistOSUser = {
  id: "user-1",
  email: "owner@example.com",
  name: "Owner",
};

test("protected DentistOS routes require an authenticated user", () => {
  assert.match(dashboardPageSource, /requireUser\(\)/);
  assert.match(dentistOSHomePageSource, /requireUser\(\)/);
  assert.match(dentistOSHomePageSource, /redirect\(\"\/dentistos\/dashboard\"\)/);
});

test("unauthenticated practice access is blocked", () => {
  assert.throws(
    () => assertValidPracticeMembership(null, validContext()),
    (error) => error instanceof PracticeAuthorizationError && error.code === "USER_REQUIRED"
  );
});

test("authorized member access is allowed", async () => {
  const repo = fakePracticeRepository(validContext());

  const context = await getAuthorizedPracticeContext({
    user,
    repository: repo,
    practiceId: "practice-1",
  });

  assert.equal(context?.practice.id, "practice-1");
  assert.equal(context?.membership.user_id, "user-1");
  assert.equal(context?.membership.role, "OWNER");
});

test("signed-in user with no linked practice receives an empty-state context", async () => {
  const repo = fakePracticeRepository(null);

  const context = await getAuthorizedPracticeContext({
    user,
    repository: repo,
  });

  assert.equal(context, null);
});

test("wrong-practice access is blocked", async () => {
  const repo = fakePracticeRepository(validContext());

  await assert.rejects(
    () =>
      getAuthorizedPracticeContext({
        user,
        repository: repo,
        practiceId: "practice-2",
      }),
    (error) => error instanceof PracticeAuthorizationError && error.code === "PRACTICE_MISMATCH"
  );
});

test("invalid practice membership is blocked", async () => {
  const context = validContext({
    membership: {
      role: "VIEWER",
    },
  });
  const repo = fakePracticeRepository(context);

  await assert.rejects(
    () =>
      getAuthorizedPracticeContext({
        user,
        repository: repo,
        practiceId: "practice-1",
      }),
    (error) => error instanceof PracticeAuthorizationError && error.code === "INVALID_ROLE"
  );
});

test("membership for another user is blocked", async () => {
  const context = validContext({
    membership: {
      user_id: "user-2",
    },
  });
  const repo = fakePracticeRepository(context);

  await assert.rejects(
    () =>
      getAuthorizedPracticeContext({
        user,
        repository: repo,
        practiceId: "practice-1",
      }),
    (error) => error instanceof PracticeAuthorizationError && error.code === "MEMBERSHIP_REQUIRED"
  );
});

test("publishing API contract remains unchanged", () => {
  const routeSource = readFileSync(
    new URL("../src/app/api/dentistos/listings/route.ts", import.meta.url),
    "utf8"
  );
  const contractSource = readFileSync(
    new URL("../src/lib/dentistos-listings.ts", import.meta.url),
    "utf8"
  );

  assert.match(routeSource, /DENTISTOS_PUBLISH_TOKEN/);
  assert.match(contractSource, /candidate_id/);
  assert.match(contractSource, /practice_name/);
  assert.match(contractSource, /source_summary/);
  assert.match(contractSource, /prepared_at/);
});

function fakePracticeRepository(
  context: DentistOSPracticeContext | null
): DentistOSPracticeAuthorizationRepository {
  return {
    async getPracticeContextForUser(_userId: string, practiceId?: string) {
      if (!context) return null;
      if (practiceId && context.practice.id !== practiceId) {
        return {
          ...context,
          practice: {
            ...context.practice,
            id: practiceId,
          },
        };
      }
      return context;
    },
  };
}

function validContext(
  overrides: {
    membership?: Partial<DentistOSPracticeContext["membership"]>;
    practice?: Partial<DentistOSPracticeContext["practice"]>;
  } = {}
): DentistOSPracticeContext {
  const practice = {
    id: "practice-1",
    name: "Example Dental",
    website: null,
    phone: null,
    address: null,
    city: null,
    state: null,
    zip_code: null,
    ...overrides.practice,
  };

  const membership = {
    id: "membership-1",
    practice_id: practice.id,
    user_id: "user-1",
    role: "OWNER",
    ...overrides.membership,
  } as DentistOSPracticeContext["membership"];

  return {
    practice,
    membership,
    listingLink: null,
  };
}
