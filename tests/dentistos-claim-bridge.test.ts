import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import type { DentistOSUser } from "../src/lib/dentistos-auth.ts";
import {
  linkClaimToDentistOS,
  listingStatusFromClaimStatus,
  resolveClaimDentistId,
  type DentistOSClaimBridgeClaim,
  type DentistOSClaimBridgeRepository,
} from "../src/lib/dentistos-claim-bridge.ts";
import { createDentistOSClaimLinkHandler } from "../src/lib/dentistos-claim-bridge-route.ts";
import type { DentistOSPracticeContext } from "../src/lib/dentistos-practices.ts";

const NOW = new Date("2026-08-12T12:00:00Z");

const user: DentistOSUser = {
  id: "user-1",
  email: "owner@example.com",
  name: "Owner",
};

test("valid claim link creates practice membership listing link and claim bridge metadata", async () => {
  const repo = new MemoryClaimBridgeRepository({
    claim: validClaim({ status: "verified" }),
    dentistExists: true,
  });

  const result = await linkClaimToDentistOS({
    user,
    token: "claim-token",
    repository: repo,
    now: NOW,
  });

  assert.equal(result.success, true);
  assert.equal(result.status, "LINKED");
  assert.equal(result.dentistId, "1234567890");
  assert.equal(result.listingStatus, "VERIFIED");
  assert.equal(repo.createdPractices.length, 1);
  assert.equal(repo.memberships.length, 1);
  assert.equal(repo.listingLinks.length, 1);
  assert.equal(repo.listingLinks[0].status, "VERIFIED");
  assert.equal(repo.markedClaims.length, 1);
  assert.equal(repo.markedClaims[0].userId, "user-1");
});

test("claim with explicit dentist_id links a non-NPI public listing", async () => {
  const repo = new MemoryClaimBridgeRepository({
    claim: validClaim({ dentist_id: "3", npi: "1234567890", status: "verified" }),
    dentistExists: true,
  });

  const result = await linkClaimToDentistOS({
    user,
    token: "claim-token",
    repository: repo,
    now: NOW,
  });

  assert.equal(result.success, true);
  assert.equal(result.status, "LINKED");
  assert.equal(result.dentistId, "3");
  assert.equal(repo.listingLinks[0].dentistId, "3");
  assert.equal(repo.listingLinks[0].status, "VERIFIED");
});

test("DentistOS-created dentist id 3 can be claimed through canonical dentist_id", async () => {
  const repo = new MemoryClaimBridgeRepository({
    claim: validClaim({ dentist_id: "3" }),
    dentistExists: true,
  });

  const result = await linkClaimToDentistOS({
    user,
    token: "claim-token",
    expectedDentistId: "3",
    repository: repo,
  });

  assert.equal(result.success, true);
  assert.equal(result.dentistId, "3");
  assert.equal(repo.listingLinks[0].dentistId, "3");
});

test("invalid claim token is blocked", async () => {
  const repo = new MemoryClaimBridgeRepository({ claim: null, dentistExists: true });

  const result = await linkClaimToDentistOS({
    user,
    token: "bad-token",
    repository: repo,
  });

  assert.equal(result.success, false);
  assert.equal(result.status, "INVALID_CLAIM_TOKEN");
  assert.equal(repo.listingLinks.length, 0);
});

test("expired claim token is not applicable to the current legacy claim model", () => {
  const toolsAccessSource = readFileSync(
    new URL("../src/lib/toolsAccess.ts", import.meta.url),
    "utf8"
  );
  const migrationSource = readFileSync(new URL("../scripts/migrate.ts", import.meta.url), "utf8");

  assert.doesNotMatch(toolsAccessSource, /expires_at/i);
  assert.match(migrationSource, /access_token TEXT UNIQUE/);
});

test("legacy claim with null dentist_id uses valid 10-digit NPI fallback", () => {
  assert.equal(
    resolveClaimDentistId(validClaim({ dentist_id: null, npi: "1234567890" })),
    "1234567890"
  );
});

test("invalid non-10-digit npi with null dentist_id is rejected", async () => {
  const repo = new MemoryClaimBridgeRepository({
    claim: validClaim({ dentist_id: null, npi: "3" }),
    dentistExists: true,
  });

  const result = await linkClaimToDentistOS({
    user,
    token: "claim-token",
    repository: repo,
  });

  assert.equal(result.success, false);
  assert.equal(result.status, "LISTING_NOT_FOUND");
  assert.equal(result.dentistId, null);
  assert.equal(repo.listingLinks.length, 0);
});

test("wrong-listing attempt is blocked", async () => {
  const repo = new MemoryClaimBridgeRepository({
    claim: validClaim({ dentist_id: "3" }),
    dentistExists: true,
  });

  const result = await linkClaimToDentistOS({
    user,
    token: "claim-token",
    expectedDentistId: "0000000000",
    repository: repo,
  });

  assert.equal(result.success, false);
  assert.equal(result.status, "WRONG_LISTING");
  assert.equal(repo.listingLinks.length, 0);
});

test("claim email mismatch is blocked", async () => {
  const repo = new MemoryClaimBridgeRepository({
    claim: validClaim({ email: "someone@example.com" }),
    dentistExists: true,
  });

  const result = await linkClaimToDentistOS({
    user,
    token: "claim-token",
    repository: repo,
  });

  assert.equal(result.success, false);
  assert.equal(result.status, "CLAIM_EMAIL_MISMATCH");
  assert.equal(repo.listingLinks.length, 0);
});

test("claim-token reuse by another user is blocked", async () => {
  const repo = new MemoryClaimBridgeRepository({
    claim: validClaim({
      dentistos_user_id: "user-2",
      dentistos_practice_id: "practice-2",
    }),
    dentistExists: true,
  });

  const result = await linkClaimToDentistOS({
    user,
    token: "claim-token",
    repository: repo,
  });

  assert.equal(result.success, false);
  assert.equal(result.status, "CLAIM_ALREADY_LINKED_TO_ANOTHER_USER");
  assert.equal(repo.listingLinks.length, 0);
});

test("duplicate linking by the same user is safely idempotent", async () => {
  const repo = new MemoryClaimBridgeRepository({
    claim: validClaim({
      dentistos_user_id: "user-1",
      dentistos_practice_id: "practice-1",
    }),
    dentistExists: true,
    context: validPracticeContext(),
  });

  const result = await linkClaimToDentistOS({
    user,
    token: "claim-token",
    repository: repo,
  });

  assert.equal(result.success, true);
  assert.equal(result.status, "ALREADY_LINKED");
  assert.equal(result.practiceId, "practice-1");
  assert.equal(repo.createdPractices.length, 0);
  assert.equal(repo.listingLinks.length, 1);
  assert.equal(repo.markedClaims.length, 0);
});

test("user cannot link another practice without authorization", async () => {
  const repo = new MemoryClaimBridgeRepository({
    claim: validClaim(),
    dentistExists: true,
    context: null,
  });

  const result = await linkClaimToDentistOS({
    user,
    token: "claim-token",
    requestedPracticeId: "practice-2",
    repository: repo,
  });

  assert.equal(result.success, false);
  assert.equal(result.status, "UNAUTHORIZED_PRACTICE");
  assert.equal(repo.listingLinks.length, 0);
});

test("missing public dentist listing blocks bridge", async () => {
  const repo = new MemoryClaimBridgeRepository({
    claim: validClaim(),
    dentistExists: false,
  });

  const result = await linkClaimToDentistOS({
    user,
    token: "claim-token",
    repository: repo,
  });

  assert.equal(result.success, false);
  assert.equal(result.status, "LISTING_NOT_FOUND");
  assert.equal(repo.createdPractices.length, 0);
});

test("claim status maps to actual listing verification state", () => {
  assert.equal(listingStatusFromClaimStatus("pending"), "PENDING");
  assert.equal(listingStatusFromClaimStatus("approved"), "VERIFIED");
  assert.equal(listingStatusFromClaimStatus("verified"), "VERIFIED");
  assert.equal(listingStatusFromClaimStatus("rejected"), "REJECTED");
  assert.equal(listingStatusFromClaimStatus("anything-else"), "PENDING");
});

test("claim creation stores canonical dentist_id without changing member tools access", () => {
  const claimRouteSource = readFileSync(
    new URL("../src/app/api/claim/route.ts", import.meta.url),
    "utf8"
  );
  const claimPageSource = readFileSync(new URL("../src/app/claim/page.tsx", import.meta.url), "utf8");
  const claimFormSource = readFileSync(
    new URL("../src/app/claim/ClaimForm.tsx", import.meta.url),
    "utf8"
  );
  const profileSource = readFileSync(
    new URL("../src/app/dentists/[slug]/page.tsx", import.meta.url),
    "utf8"
  );

  assert.match(claimRouteSource, /dentistId: pickString\(obj\.dentistId\)/);
  assert.match(claimRouteSource, /SELECT id FROM dentists WHERE id = \$1 LIMIT 1/);
  assert.match(claimRouteSource, /INSERT INTO claims \(name, email, phone, npi, dentist_id/);
  assert.match(claimRouteSource, /toolsUrl: "\/tools\/member"/);
  assert.match(claimPageSource, /getDentistBySlug\(practiceSlug\)/);
  assert.match(claimFormSource, /dentistId,/);
  assert.match(profileSource, /\/claim\?practice=/);
});

test("claim link endpoint uses authenticated user and preserves old member-tools access", async () => {
  const repo = new MemoryClaimBridgeRepository({
    claim: validClaim({ status: "pending" }),
    dentistExists: true,
  });
  const handler = createDentistOSClaimLinkHandler({
    currentUser: async () => user,
    repository: repo,
  });

  const response = await handler(
    new Request("https://www.usdentistsdirectory.com/api/dentistos/claims/link", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ token: "claim-token" }),
    })
  );
  const body = await response.json();

  assert.equal(response.status, 200);
  assert.equal(body.success, true);
  assert.equal(body.listingStatus, "PENDING");

  const toolsAccessRouteSource = readFileSync(
    new URL("../src/app/api/tools-access/route.ts", import.meta.url),
    "utf8"
  );
  assert.match(toolsAccessRouteSource, /TOOLS_ACCESS_COOKIE/);
  assert.match(toolsAccessRouteSource, /\/tools\/member/);
});

test("claim link endpoint rejects unauthenticated requests", async () => {
  const handler = createDentistOSClaimLinkHandler({
    currentUser: async () => null,
    repository: new MemoryClaimBridgeRepository({ claim: validClaim(), dentistExists: true }),
  });

  const response = await handler(
    new Request("https://www.usdentistsdirectory.com/api/dentistos/claims/link", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ token: "claim-token" }),
    })
  );

  assert.equal(response.status, 401);
});

function validClaim(
  overrides: Partial<DentistOSClaimBridgeClaim> = {}
): DentistOSClaimBridgeClaim {
  return {
    id: 10,
    name: "Dr. Owner",
    email: "owner@example.com",
    phone: "703-555-0100",
    npi: "1234567890",
    dentist_id: null,
    practice_name: "Example Dental",
    address: "123 Main St",
    website: "https://example.com",
    status: "pending",
    dentistos_user_id: null,
    dentistos_practice_id: null,
    ...overrides,
  };
}

function validPracticeContext(): DentistOSPracticeContext {
  return {
    practice: {
      id: "practice-1",
      name: "Example Dental",
      website: null,
      phone: null,
      address: null,
      city: null,
      state: null,
      zip_code: null,
    },
    membership: {
      id: "membership-1",
      practice_id: "practice-1",
      user_id: "user-1",
      role: "OWNER",
    },
    listingLink: null,
  };
}

class MemoryClaimBridgeRepository implements DentistOSClaimBridgeRepository {
  createdPractices: DentistOSClaimBridgeClaim[] = [];
  memberships: { practiceId: string; userId: string; role: "OWNER" }[] = [];
  listingLinks: {
    practiceId: string;
    dentistId: string;
    claimId: number;
    status: "PENDING" | "VERIFIED" | "REJECTED";
    verifiedAt: Date | null;
  }[] = [];
  markedClaims: { claimId: number; userId: string; practiceId: string; linkedAt: Date }[] = [];

  private readonly options: {
    claim: DentistOSClaimBridgeClaim | null;
    dentistExists: boolean;
    context?: DentistOSPracticeContext | null;
  };

  constructor(options: {
    claim: DentistOSClaimBridgeClaim | null;
    dentistExists: boolean;
    context?: DentistOSPracticeContext | null;
  }) {
    this.options = options;
  }

  async getClaimByAccessToken(token: string): Promise<DentistOSClaimBridgeClaim | null> {
    return token === "claim-token" ? this.options.claim : null;
  }

  async dentistExists(): Promise<boolean> {
    return this.options.dentistExists;
  }

  async getPracticeContextForUser(): Promise<DentistOSPracticeContext | null> {
    return this.options.context ?? null;
  }

  async getPracticeContextByIdForUser(
    _userId: string,
    practiceId: string
  ): Promise<DentistOSPracticeContext | null> {
    const context = this.options.context ?? null;
    return context?.practice.id === practiceId ? context : null;
  }

  async createPracticeFromClaim(claim: DentistOSClaimBridgeClaim): Promise<string> {
    this.createdPractices.push(claim);
    return "practice-created";
  }

  async createPracticeMembership(input: {
    practiceId: string;
    userId: string;
    role: "OWNER";
  }): Promise<void> {
    if (!this.memberships.some((item) => item.practiceId === input.practiceId && item.userId === input.userId)) {
      this.memberships.push(input);
    }
  }

  async upsertPracticeListingLink(input: {
    practiceId: string;
    dentistId: string;
    claimId: number;
    status: "PENDING" | "VERIFIED" | "REJECTED";
    verifiedAt: Date | null;
  }): Promise<void> {
    const index = this.listingLinks.findIndex(
      (item) => item.practiceId === input.practiceId && item.dentistId === input.dentistId
    );
    if (index >= 0) {
      this.listingLinks[index] = input;
    } else {
      this.listingLinks.push(input);
    }
  }

  async markClaimLinked(input: {
    claimId: number;
    userId: string;
    practiceId: string;
    linkedAt: Date;
  }): Promise<void> {
    this.markedClaims.push(input);
    if (this.options.claim) {
      this.options.claim.dentistos_user_id = input.userId;
      this.options.claim.dentistos_practice_id = input.practiceId;
    }
  }
}
