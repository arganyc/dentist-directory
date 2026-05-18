import { NextRequest } from "next/server";
import { searchDentists, getTotalDentistCount } from "@/lib/dentists-data";

export async function GET(request: NextRequest) {
  const sp = request.nextUrl.searchParams;

  const page = Math.max(1, parseInt(sp.get("page") ?? "1", 10) || 1);
  const perPageRaw = parseInt(sp.get("perPage") ?? sp.get("limit") ?? "20", 10);
  const perPage = Math.min(100, Math.max(1, Number.isFinite(perPageRaw) ? perPageRaw : 20));

  const {
    results,
    total,
    page: currentPage,
    perPage: appliedPerPage,
    totalPages,
  } = searchDentists({
    state: sp.get("state") ?? "",
    city: sp.get("city") ?? "",
    specialty: sp.get("specialty") ?? "",
    acceptingOnly: sp.get("accepting") === "true",
    location: sp.get("location") ?? "",
    page,
    perPage,
  });

  return Response.json(
    {
      page: currentPage,
      perPage: appliedPerPage,
      total,
      totalPages,
      datasetSize: getTotalDentistCount(),
      data: results,
    },
    {
      headers: {
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
        "Access-Control-Allow-Origin": "*",
      },
    }
  );
}
