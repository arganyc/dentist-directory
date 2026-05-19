import { getSql } from "@/lib/db";

const SITE_URL = "https://usdentistsdirectory.com";
const CHUNK_SIZE = 50_000;

// Mirror the daily revalidation of the chunks themselves.
export const revalidate = 86400;

// Sitemap INDEX. The actual URL chunks live at /sitemap/[id].xml — generated
// by app/sitemap.ts via generateSitemaps. Search engines read this index and
// fan out to each chunk. Submit this URL to Google Search Console.
export async function GET(): Promise<Response> {
  const sql = getSql();
  const rows = (await sql`SELECT COUNT(*)::int AS n FROM dentists`) as { n: number }[];
  const total = rows[0]?.n ?? 0;
  // id=0 is static/state/city; ids 1..N cover dentist chunks of CHUNK_SIZE each.
  const dentistChunks = Math.max(1, Math.ceil(total / CHUNK_SIZE));
  const ids = Array.from({ length: dentistChunks + 1 }, (_, i) => i);

  const now = new Date().toISOString();
  const body =
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    ids
      .map(
        (id) =>
          `  <sitemap><loc>${SITE_URL}/sitemap/${id}.xml</loc><lastmod>${now}</lastmod></sitemap>`
      )
      .join("\n") +
    `\n</sitemapindex>\n`;

  return new Response(body, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=0, s-maxage=86400, stale-while-revalidate=86400",
    },
  });
}
