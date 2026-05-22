import { NextResponse, type NextRequest } from "next/server";
import { stateNameByCode, US_STATES } from "./src/lib/dentists";

function slugify(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/\+/g, " ")
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function codeFromParam(stateParam: string): string | undefined {
  const param = stateParam.trim();
  if (!param) return undefined;
  if (param.length === 2) return param.toUpperCase();
  const normalized = param.replace(/-/g, " ").toLowerCase();
  const found = US_STATES.find((s) => s.name.toLowerCase() === normalized);
  return found?.code;
}

function stateSlugFromCode(code: string): string {
  return slugify(stateNameByCode(code));
}

export function middleware(request: NextRequest) {
  const url = request.nextUrl.clone();
  const { pathname, searchParams } = url;
  const hasStateQuery = searchParams.has("state");
  const hasCityQuery = searchParams.has("city");
  const stateQuery = searchParams.get("state") ?? "";
  const cityQuery = searchParams.get("city") ?? "";
  const pathSegments = pathname.split("/").filter(Boolean);

  if (pathname === "/dentists" && hasStateQuery) {
    const stateCode = codeFromParam(stateQuery) ?? stateQuery.toUpperCase();
    const stateSlug = stateSlugFromCode(stateCode);
    if (hasCityQuery && cityQuery) {
      const citySlug = slugify(cityQuery);
      const dest = new URL(`/dentists/${stateSlug}/${citySlug}`, request.url);
      if (searchParams.has("page")) {
        dest.searchParams.set("page", searchParams.get("page") ?? "1");
      }
      return NextResponse.redirect(dest);
    }
    const dest = new URL(`/dentists/${stateSlug}`, request.url);
    if (searchParams.has("page")) {
      dest.searchParams.set("page", searchParams.get("page") ?? "1");
    }
    return NextResponse.redirect(dest);
  }

  if (pathSegments[0] === "dentists" && pathSegments.length >= 2) {
    const stateSegment = pathSegments[1];
    if (stateSegment === "state") {
      return NextResponse.next();
    }

    const stateCode = codeFromParam(stateSegment) ?? stateSegment.toUpperCase();
    const canonicalStateSlug = stateSlugFromCode(stateCode);

    if (pathSegments.length === 2) {
      if (hasCityQuery && cityQuery) {
        const citySlug = slugify(cityQuery);
        const dest = new URL(`/dentists/${canonicalStateSlug}/${citySlug}`, request.url);
        if (searchParams.has("page")) dest.searchParams.set("page", searchParams.get("page") ?? "1");
        return NextResponse.redirect(dest);
      }

      const internalUrl = url.clone();
      internalUrl.pathname = `/dentists/state/${canonicalStateSlug}`;
      return NextResponse.rewrite(internalUrl);
    }

    if (pathSegments.length === 3) {
      const citySegment = pathSegments[2];
      const canonicalCitySlug = slugify(citySegment);
      if (stateSegment !== canonicalStateSlug || citySegment !== canonicalCitySlug) {
        const dest = new URL(`/dentists/${canonicalStateSlug}/${canonicalCitySlug}`, request.url);
        if (searchParams.has("page")) dest.searchParams.set("page", searchParams.get("page") ?? "1");
        return NextResponse.redirect(dest);
      }
      const internalUrl = url.clone();
      internalUrl.pathname = `/dentists/state/${canonicalStateSlug}/${canonicalCitySlug}`;
      return NextResponse.rewrite(internalUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dentists", "/dentists/:path*"],
};
