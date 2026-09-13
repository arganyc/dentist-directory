import "server-only";

import type { DentistOSUser } from "./dentistos-auth";
import type {
  DentistOSClaimBridgeClaim,
  DentistOSClaimBridgeResult,
} from "./dentistos-claim-bridge";

export type DentOSSyncStatus =
  | "SYNCED"
  | "VERIFICATION_PENDING"
  | "ACTIVATED"
  | "DEFERRED";

export type DentOSClaimSyncResult = {
  status: DentOSSyncStatus;
  dentosPracticeId?: number;
};

type DentOSClaimHandoffResponse = {
  practice_id: number;
  verification_status: string;
};

type DentOSOwnershipResponse = {
  practice_id: number;
  verification_status: string;
  verified_owner: boolean;
};

const API_BASE_URL = process.env.DENTOS_API_BASE_URL?.replace(/\/$/, "");
const SERVICE_TOKEN = process.env.DENTOS_API_SERVICE_TOKEN;

/**
 * Mirrors a successfully linked US Dentists Directory claim into DentOS.
 *
 * This is intentionally server-to-server only. A directory claim never grants
 * DentOS ownership by itself. DentOS applies its own multi-signal ownership
 * policy and activation gate.
 */
export async function syncDirectoryClaimToDentOS(input: {
  user: DentistOSUser;
  claim: DentistOSClaimBridgeClaim;
  linkResult: DentistOSClaimBridgeResult;
}): Promise<DentOSClaimSyncResult> {
  if (!API_BASE_URL || !SERVICE_TOKEN) {
    console.warn("[dentos-handoff] DentOS API is not configured; sync deferred");
    return { status: "DEFERRED" };
  }

  if (!input.linkResult.success || !input.linkResult.dentistId) {
    return { status: "DEFERRED" };
  }

  try {
    const handoff = await dentosRequest<DentOSClaimHandoffResponse>(
      "/api/v1/directory-claims/handoff",
      {
        source: "USDENTISTSDIRECTORY",
        external_practice_id: input.linkResult.practiceId ?? input.linkResult.dentistId,
        directory_listing_id: input.linkResult.dentistId,
        directory_claim_id: String(input.claim.id),
        practice_name: input.claim.practice_name || input.claim.name,
        claimant_user_id: input.user.id,
        claimant_name: input.claim.name || undefined,
        claimant_role: "OWNER",
        phone: input.claim.phone || undefined,
        website: input.claim.website || undefined,
        address: input.claim.address || undefined,
        emails: [
          {
            email: input.claim.email,
            kind: "ACCOUNT",
            source: "CLAIMANT",
            // The directory account reached this route through a verified
            // magic-link session for the same claim email.
            verified: true,
          },
        ],
      }
    );

    // A verified directory listing is trusted evidence, but DentOS still
    // requires its own ownership threshold. Generic email + claim alone is
    // deliberately insufficient under the current policy.
    if (input.linkResult.listingStatus !== "VERIFIED") {
      return { status: "SYNCED", dentosPracticeId: handoff.practice_id };
    }

    const ownership = await dentosRequest<DentOSOwnershipResponse>(
      `/api/v1/directory-claims/${handoff.practice_id}/ownership-verification/evaluate`,
      {
        directory_claim_verified: true,
        business_phone_verified: false,
        manual_review_approved: false,
      }
    );

    if (!ownership.verified_owner) {
      return {
        status: "VERIFICATION_PENDING",
        dentosPracticeId: handoff.practice_id,
      };
    }

    await dentosRequest(
      `/api/v1/directory-claims/${handoff.practice_id}/activate`,
      {}
    );

    return { status: "ACTIVATED", dentosPracticeId: handoff.practice_id };
  } catch (error) {
    // Preserve the already-completed local claim link. The handoff can be
    // retried later without forcing the dentist through claim linking again.
    console.error(
      "[dentos-handoff] DentOS sync failed; local directory claim remains linked",
      error instanceof Error ? error.message : "unknown error"
    );
    return { status: "DEFERRED" };
  }
}

async function dentosRequest<T = unknown>(path: string, body: unknown): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${SERVICE_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`DentOS API request failed with status ${response.status}`);
  }

  return (await response.json()) as T;
}
