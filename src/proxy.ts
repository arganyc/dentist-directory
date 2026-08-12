import { NextResponse, type NextRequest } from "next/server";
import { slugify } from "./lib/dentists";
import {
  codeFromDentistsPathParam,
  stateListingPathForDentistsSegment,
  stateSlugFromDentistsCode,
} from "./lib/dentists-route-resolution";

export function proxy(request: NextRequest) {
  const url = request.nextUrl.clone();
  const { pathname, searchParams } = url;
  const hasStateQuery = searchParams.has("state");
  const hasCityQuery = searchParams.has("city");
  const stateQuery = searchParams.get("state") ?? "";
  const cityQuery = searchParams.get("city") ?? "";
  const pathSegments = pathname.split("/").filter(Boolean);

  if (pathname === "/dentists" && hasStateQuery) {
    const stateCode = codeFromDentistsPathParam(stateQuery) ?? stateQuery.toUpperCase();
    const stateSlug = stateSlugFromDentistsCode(stateCode);
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
    if (stateSegment === "state" || /^[a-z0-9-]+-\d{10}$/i.test(stateSegment)) {
      return NextResponse.next();
    }

    const internalStatePath = stateListingPathForDentistsSegment(stateSegment);
    if (!internalStatePath) {
      return NextResponse.next();
    }
    const canonicalStateSlug = internalStatePath.split("/").at(-1) ?? "";

    if (pathSegments.length === 2) {
      if (hasCityQuery && cityQuery) {
        const citySlug = slugify(cityQuery);
        const dest = new URL(`/dentists/${canonicalStateSlug}/${citySlug}`, request.url);
        if (searchParams.has("page")) dest.searchParams.set("page", searchParams.get("page") ?? "1");
        return NextResponse.redirect(dest);
      }

      const internalUrl = url.clone();
      internalUrl.pathname = internalStatePath;
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
