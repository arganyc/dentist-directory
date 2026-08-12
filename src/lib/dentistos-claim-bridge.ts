import type { DentistOSUser } from "./dentistos-auth";
import type { DentistOSPracticeContext } from "./dentistos-practices";

export type DentistOSClaimBridgeClaim = {
  id: number;
  name: string;
  email: string;
  phone: string;
  npi: string;
  practice_name: string;
  address: string;
  website: string | null;
  status: string;
  dentistos_user_id: string | null;
  dentistos_practice_id: string | null;
};

export type DentistOSClaimBridgeRepository = {
  getClaimByAccessToken(token: string): Promise<DentistOSClaimBridgeClaim | null>;
  dentistExists(dentistId: string): Promise<boolean>;
  getPracticeContextForUser(userId: string): Promise<DentistOSPracticeContext | null>;
  getPracticeContextByIdForUser(
    userId: string,
    practiceId: string
  ): Promise<DentistOSPracticeContext | null>;
  createPracticeFromClaim(claim: DentistOSClaimBridgeClaim): Promise<string>;
  createPracticeMembership(input: {
    practiceId: string;
    userId: string;
    role: "OWNER";
  }): Promise<void>;
  upsertPracticeListingLink(input: {
    practiceId: string;
    dentistId: string;
    claimId: number;
    status: "PENDING" | "VERIFIED" | "REJECTED";
    verifiedAt: Date | null;
  }): Promise<void>;
  markClaimLinked(input: {
    claimId: number;
    userId: string;
    practiceId: string;
    linkedAt: Date;
  }): Promise<void>;
};

export type DentistOSClaimBridgeResult = {
  success: boolean;
  status:
    | "LINKED"
    | "ALREADY_LINKED"
    | "INVALID_CLAIM_TOKEN"
    | "LISTING_NOT_FOUND"
    | "WRONG_LISTING"
    | "CLAIM_EMAIL_MISMATCH"
    | "CLAIM_ALREADY_LINKED_TO_ANOTHER_USER"
    | "UNAUTHORIZED_PRACTICE";
  practiceId: string | null;
  dentistId: string | null;
  listingStatus: "PENDING" | "VERIFIED" | "REJECTED" | null;
};

export async function linkClaimToDentistOS(input: {
  user: DentistOSUser;
  token: string;
  repository: DentistOSClaimBridgeRepository;
  expectedDentistId?: string;
  requestedPracticeId?: string;
  now?: Date;
}): Promise<DentistOSClaimBridgeResult> {
  const token = input.token.trim();
  if (!token) return failure("INVALID_CLAIM_TOKEN");

  const claim = await input.repository.getClaimByAccessToken(token);
  if (!claim) return failure("INVALID_CLAIM_TOKEN");

  const dentistId = claim.npi.trim();
  if (claim.email.trim().toLowerCase() !== input.user.email.trim().toLowerCase()) {
    return failure("CLAIM_EMAIL_MISMATCH", null, dentistId);
  }

  if (input.expectedDentistId && input.expectedDentistId !== dentistId) {
    return failure("WRONG_LISTING", null, dentistId);
  }

  if (claim.dentistos_user_id && claim.dentistos_user_id !== input.user.id) {
    return failure("CLAIM_ALREADY_LINKED_TO_ANOTHER_USER", claim.dentistos_practice_id, dentistId);
  }

  const listingStatus = listingStatusFromClaimStatus(claim.status);
  const verifiedAt = listingStatus === "VERIFIED" ? input.now ?? new Date() : null;

  if (claim.dentistos_practice_id) {
    const existingPracticeContext = await input.repository.getPracticeContextByIdForUser(
      input.user.id,
      claim.dentistos_practice_id
    );
    if (!existingPracticeContext) {
      return failure("UNAUTHORIZED_PRACTICE", claim.dentistos_practice_id, dentistId, listingStatus);
    }
    if (!(await input.repository.dentistExists(dentistId))) {
      return failure("LISTING_NOT_FOUND", claim.dentistos_practice_id, dentistId, listingStatus);
    }
    await input.repository.upsertPracticeListingLink({
      practiceId: claim.dentistos_practice_id,
      dentistId,
      claimId: claim.id,
      status: listingStatus,
      verifiedAt,
    });
    return {
      success: true,
      status: "ALREADY_LINKED",
      practiceId: claim.dentistos_practice_id,
      dentistId,
      listingStatus,
    };
  }

  if (!(await input.repository.dentistExists(dentistId))) {
    return failure("LISTING_NOT_FOUND", null, dentistId, listingStatus);
  }

  let practiceId: string;
  if (input.requestedPracticeId) {
    const requestedContext = await input.repository.getPracticeContextByIdForUser(
      input.user.id,
      input.requestedPracticeId
    );
    if (!requestedContext) {
      return failure("UNAUTHORIZED_PRACTICE", input.requestedPracticeId, dentistId, listingStatus);
    }
    practiceId = requestedContext.practice.id;
  } else {
    practiceId =
      (await input.repository.getPracticeContextForUser(input.user.id))?.practice.id ??
      (await input.repository.createPracticeFromClaim(claim));
  }

  await input.repository.createPracticeMembership({
    practiceId,
    userId: input.user.id,
    role: "OWNER",
  });
  await input.repository.upsertPracticeListingLink({
    practiceId,
    dentistId,
    claimId: claim.id,
    status: listingStatus,
    verifiedAt,
  });
  await input.repository.markClaimLinked({
    claimId: claim.id,
    userId: input.user.id,
    practiceId,
    linkedAt: input.now ?? new Date(),
  });

  return {
    success: true,
    status: "LINKED",
    practiceId,
    dentistId,
    listingStatus,
  };
}

export function listingStatusFromClaimStatus(
  claimStatus: string
): "PENDING" | "VERIFIED" | "REJECTED" {
  switch (claimStatus.trim().toLowerCase()) {
    case "approved":
    case "verified":
      return "VERIFIED";
    case "rejected":
      return "REJECTED";
    default:
      return "PENDING";
  }
}

function failure(
  status: DentistOSClaimBridgeResult["status"],
  practiceId: string | null = null,
  dentistId: string | null = null,
  listingStatus: DentistOSClaimBridgeResult["listingStatus"] = null
): DentistOSClaimBridgeResult {
  return {
    success: false,
    status,
    practiceId,
    dentistId,
    listingStatus,
  };
}
