import {
  DentistOSPayloadValidationError,
  DuplicateDentistListingError,
  validateDentistOSPublishPayload,
  verifyDentistOSBearerToken,
  type DentistOSPublishOutcome,
  type DentistOSPublishPayload,
} from "./dentistos-listings";

type DentistOSListingsHandlerDeps = {
  expectedToken: () => string | undefined;
  upsert: (payload: DentistOSPublishPayload) => Promise<DentistOSPublishOutcome>;
};

export function createDentistOSListingsPostHandler(deps: DentistOSListingsHandlerDeps) {
  return async function POST(request: Request): Promise<Response> {
    if (!verifyDentistOSBearerToken(request.headers.get("authorization"), deps.expectedToken())) {
      return json({ success: false, error: "unauthorized" }, 401);
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return json({ success: false, error: "malformed_json" }, 400);
    }

    try {
      const payload = validateDentistOSPublishPayload(body);
      const result = await deps.upsert(payload);
      return json(result, 200);
    } catch (error) {
      if (error instanceof DentistOSPayloadValidationError) {
        return json(
          {
            success: false,
            error: "invalid_payload",
            details: error.errors,
          },
          400
        );
      }

      if (error instanceof DuplicateDentistListingError) {
        return json(
          {
            success: false,
            error: "duplicate_listing",
          },
          409
        );
      }

      return json({ success: false, error: "publishing_failed" }, 500);
    }
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
