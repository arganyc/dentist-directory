import { NextRequest } from "next/server";
import { dentists } from "@/lib/dentists";

export async function GET(request: NextRequest) {
  const sp = request.nextUrl.searchParams;
  const state = sp.get("state") ?? "";
  const city = sp.get("city") ?? "";
  const specialty = sp.get("specialty") ?? "";
  const accepting = sp.get("accepting") === "true";

  const filtered = dentists.filter((d) => {
    if (state && d.address.stateCode.toLowerCase() !== state.toLowerCase()) return false;
    if (city && d.address.city.toLowerCase() !== city.toLowerCase()) return false;
    if (specialty && d.specialty.toLowerCase() !== specialty.toLowerCase()) return false;
    if (accepting && !d.acceptingNewPatients) return false;
    return true;
  });

  return Response.json(
    {
      count: filtered.length,
      total: dentists.length,
      data: filtered,
    },
    {
      headers: {
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
        "Access-Control-Allow-Origin": "*",
      },
    }
  );
}
