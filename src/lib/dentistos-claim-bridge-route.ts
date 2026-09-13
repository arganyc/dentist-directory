import type { DentistOSUser } from "./dentistos-auth";
import {
  linkClaimToDentistOS,
  type DentistOSClaimBridgeClaim,
  type DentistOSClaimBridgeRepository,
  type DentistOSClaimBridgeResult,
} from "./dentistos-claim-bridge";
import type { DentOSClaimSyncResult } from "./dentos-api-client";

type ClaimLinkHandlerDeps = {
  currentUser: () => Promise<DentistOSUser | null>;
  repository: DentistOSClaimBridgeRepository;
  syncDentOSClaim?: (input: {
    user: DentistOSUser;
    claim: DentistOSClaimBridgeClaim;
    linkResult: DentistOSClaimBridgeResult;
  }) => Promise<DentOSClaimSyncResult>;
};

export function createDentistOSClaimLinkHandler(deps: ClaimLinkHandlerDeps) {
  return async function POST(request: Request): Promise<Response> {
    const user = await deps.currentUser();
    if (!user) {
      return json({ success: false, error: "unauthorized" }, 401);
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return json({ success: false, error: "malformed_json" }, 400);
    }

    const obj = (body ?? {}) as Record<string, unknown>;
    const token = typeof obj.token === "string" ? obj.token : "";
    const expectedDentistId = typeof obj.dentist_id === "string" ? obj.dentist_id : undefined;
    const result = await linkClaimToDentistOS({
      user,
      token,
      expectedDentistId,
      repository: deps.repository,
    });

    if (!result.success) {
      const status = result.status === "INVALID_CLAIM_TOKEN" ? 404 : 409;
      return json({ success: false, error: result.status }, status);
    }

    let dentosSync: DentOSClaimSyncResult = { status: "DEFERRED" };
    if (deps.syncDentOSClaim) {
      const claim = await deps.repository.getClaimByAccessToken(token);
      if (claim) {
        dentosSync = await deps.syncDentOSClaim({
          user,
          claim,
          linkResult: result,
        });
      }
    }

    return json({ ...result, dentosSync }, 200);
  };
}

function json(body: Record<string, unknown>, status: number): Response {
  return Response.json(body, {
    status,
    headers: {
      "Cache-Control": "no-store",
    },
  });
}
