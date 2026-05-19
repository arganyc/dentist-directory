import type { MetadataRoute } from "next";
import { getSql } from "@/lib/db";
import { blogPosts } from "@/lib/blog";

const SITE_URL = "https://usdentistsdirectory.com";
const CHUNK_SIZE = 50_000;

// Re-generate the sitemap once a day. Vercel's sitemap routes are dynamic by
// default, so a per-request rebuild would hammer Neon. Daily is plenty for
// search engines.
export const revalidate = 86400;

type DentistRow = { slug: string };
type CityRow = { state_code: string; city: string };

async function getDentistCount(): Promise<number> {
  const sql = getSql();
  const rows = (await sql`SELECT COUNT(*)::int AS n FROM dentists`) as { n: number }[];
  return rows[0]?.n ?? 0;
}

export async function generateSitemaps(): Promise<{ id: number }[]> {
  const total = await getDentistCount();
  const dentistChunks = Math.max(1, Math.ceil(total / CHUNK_SIZE));
  // id=0 → static pages + blog + state + city URLs (small chunk).
  // id=1..N → dentist profile chunks, each up to 50k URLs.
  return Array.from({ length: dentistChunks + 1 }, (_, i) => ({ id: i }));
}

async function buildStaticAndLocationSitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticPages: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, lastModified: now, changeFrequency: "daily", priority: 1.0 },
    { url: `${SITE_URL}/dentists`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${SITE_URL}/for-dentists`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${SITE_URL}/pricing`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${SITE_URL}/claim`, lastModified: now, changeFrequency: "monthly", priority: 0.4 },
    { url: `${SITE_URL}/blog`, lastModified: now, changeFrequency: "weekly", priority: 0.6 },
  ];

  const blogUrls: MetadataRoute.Sitemap = blogPosts.map((p) => ({
    url: `${SITE_URL}/blog/${p.slug}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  const sql = getSql();
  const cityRows = (await sql`
    SELECT DISTINCT state_code, city
    FROM dentists
    WHERE state_code <> '' AND city <> ''
    ORDER BY state_code, city
  `) as CityRow[];

  const cityUrls: MetadataRoute.Sitemap = cityRows.map((r) => ({
    url: `${SITE_URL}/dentists?state=${encodeURIComponent(r.state_code)}&city=${encodeURIComponent(r.city)}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  const stateCodes = Array.from(new Set(cityRows.map((r) => r.state_code))).sort();
  const stateUrls: MetadataRoute.Sitemap = stateCodes.map((code) => ({
    url: `${SITE_URL}/dentists?state=${encodeURIComponent(code)}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  return [...staticPages, ...blogUrls, ...stateUrls, ...cityUrls];
}

async function buildDentistChunk(chunkIndex: number): Promise<MetadataRoute.Sitemap> {
  const sql = getSql();
  const offset = chunkIndex * CHUNK_SIZE;
  const rows = (await sql.query(
    `SELECT slug FROM dentists ORDER BY id LIMIT $1 OFFSET $2`,
    [CHUNK_SIZE, offset]
  )) as DentistRow[];
  return rows.map((r) => ({
    url: `${SITE_URL}/dentists/${r.slug}`,
    changeFrequency: "monthly",
    priority: 0.6,
  }));
}

export default async function sitemap(props: { id: Promise<string> }): Promise<MetadataRoute.Sitemap> {
  const idStr = await props.id;
  const id = parseInt(idStr, 10);
  if (id === 0) return buildStaticAndLocationSitemap();
  return buildDentistChunk(id - 1);
}
