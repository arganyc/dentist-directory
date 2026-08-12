import type { DentistOSUser } from "./dentistos-auth";

export const DENTISTOS_PRACTICE_ROLES = ["OWNER", "STAFF", "ADMIN"] as const;
export type DentistOSPracticeRole = (typeof DENTISTOS_PRACTICE_ROLES)[number];

export type DentistOSPractice = {
  id: string;
  name: string;
  website: string | null;
  phone: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  zip_code: string | null;
  created_at?: Date | string;
  updated_at?: Date | string;
};

export type DentistOSPracticeMembership = {
  id: string;
  practice_id: string;
  user_id: string;
  role: DentistOSPracticeRole;
  created_at?: Date | string;
};

export type DentistOSPracticeListingLink = {
  id: string;
  practice_id: string;
  dentist_id: string;
  claim_id: number | null;
  status: "PENDING" | "VERIFIED" | "REJECTED" | "UNLINKED";
  verified_at: Date | string | null;
  created_at?: Date | string;
};

export type DentistOSPracticeContext = {
  practice: DentistOSPractice;
  membership: DentistOSPracticeMembership;
  listingLink: DentistOSPracticeListingLink | null;
};

export type DentistOSPracticeAuthorizationRepository = {
  getPracticeContextForUser(
    userId: string,
    practiceId?: string
  ): Promise<DentistOSPracticeContext | null>;
};

export class PracticeAuthorizationError extends Error {
  readonly code: "USER_REQUIRED" | "MEMBERSHIP_REQUIRED" | "PRACTICE_MISMATCH" | "INVALID_ROLE";

  constructor(code: "USER_REQUIRED" | "MEMBERSHIP_REQUIRED" | "PRACTICE_MISMATCH" | "INVALID_ROLE") {
    super(code);
    this.name = "PracticeAuthorizationError";
    this.code = code;
  }
}

export function isDentistOSPracticeRole(value: string): value is DentistOSPracticeRole {
  return DENTISTOS_PRACTICE_ROLES.includes(value as DentistOSPracticeRole);
}

export function assertValidPracticeMembership(
  user: DentistOSUser | null,
  context: DentistOSPracticeContext | null,
  requestedPracticeId?: string
): DentistOSPracticeContext {
  if (!user) {
    throw new PracticeAuthorizationError("USER_REQUIRED");
  }
  if (!context) {
    throw new PracticeAuthorizationError("MEMBERSHIP_REQUIRED");
  }
  if (context.membership.user_id !== user.id) {
    throw new PracticeAuthorizationError("MEMBERSHIP_REQUIRED");
  }
  if (context.membership.practice_id !== context.practice.id) {
    throw new PracticeAuthorizationError("PRACTICE_MISMATCH");
  }
  if (requestedPracticeId && context.practice.id !== requestedPracticeId) {
    throw new PracticeAuthorizationError("PRACTICE_MISMATCH");
  }
  if (!isDentistOSPracticeRole(context.membership.role)) {
    throw new PracticeAuthorizationError("INVALID_ROLE");
  }
  return context;
}

export async function getAuthorizedPracticeContext(input: {
  user: DentistOSUser | null;
  repository: DentistOSPracticeAuthorizationRepository;
  practiceId?: string;
}): Promise<DentistOSPracticeContext | null> {
  if (!input.user) return null;
  const context = await input.repository.getPracticeContextForUser(
    input.user.id,
    input.practiceId
  );
  if (!context && !input.practiceId) return null;
  return assertValidPracticeMembership(input.user, context, input.practiceId);
}
