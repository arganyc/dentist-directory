import { NextResponse } from "next/server";

export function GET() {
  const body = [
    "User-agent: *",
    "Allow: /",
    "Disallow: /api/",
    "Disallow: /*?*accepting=*",
    "Disallow: /*?*city=*",
    "Disallow: /*?*location=*",
    "Disallow: /*?*name=*",
    "Disallow: /*?*specialty=*",
    "Disallow: /*?*state=*",
    "",
    "Sitemap: https://www.usdentistsdirectory.com/sitemap.xml",
    "",
  ].join("\n");

  return new NextResponse(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
