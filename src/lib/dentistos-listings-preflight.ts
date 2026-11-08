import { dentistExternalUrl, verifyDentistOSBearerToken } from "./dentistos-listings";

export type DentistOSListingPreflight = {
  success: true;
  npi: string;
  profile_exists: boolean;
  profile_url: string | null;
  claimed: boolean;
};

export type DentistOSPreflightSqlClient = {
  query: (text: string, params?: unknown[]) => Promise<Record<string, unknown>[]>;
};

export async function getDentistOSListingPreflightWithSql(
  npi: string,
  sql: DentistOSPreflightSqlClient
): Promise<DentistOSListingPreflight> {
  const rows = (await sql.query(
    `
      SELECT
        EXISTS (SELECT 1 FROM dentists WHERE id = $1) AS profile_exists,
        (SELECT slug FROM dentists WHERE id = $1 LIMIT 1) AS slug,
        EXISTS (
          SELECT 1
          FROM claims
          WHERE npi = $1
            AND LOWER(status) NOT IN ('rejected', 'denied')
        ) AS claimed
    `,
    [npi]
  )) as { profile_exists: boolean; slug: string | null; claimed: boolean }[];

  const row = rows[0] ?? { profile_exists: false, slug: null, claimed: false };
  return {
    success: true,
    npi,
    profile_exists: row.profile_exists,
    profile_url: row.slug ? dentistExternalUrl(row.slug) : null,
    claimed: row.claimed,
  };
}

type DentistOSListingsGetHandlerDeps = {
  expectedToken: () => string | undefined;
  preflight: (npi: string) => Promise<DentistOSListingPreflight>;
};

export function createDentistOSListingsGetHandler(deps: DentistOSListingsGetHandlerDeps) {
  return async function GET(request: Request): Promise<Response> {
    if (!verifyDentistOSBearerToken(request.headers.get("authorization"), deps.expectedToken())) {
      return json({ success: false, error: "unauthorized" }, 401);
    }

    const npi = new URL(request.url).searchParams.get("npi")?.trim() ?? "";
    if (!/^\d{10}$/.test(npi)) {
      return json({ success: false, error: "invalid_npi" }, 400);
    }

    try {
      return json(await deps.preflight(npi), 200);
    } catch (error) {
      console.error("[dentistos-listings-preflight] query failed", error);
      return json({ success: false, error: "preflight_failed" }, 500);
    }
  };
}

function json(body: Record<string, unknown>, status: number): Response {
  return Response.json(body, {
    status,
    headers: { "Cache-Control": "no-store" },
  });
}
