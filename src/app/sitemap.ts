import type { MetadataRoute } from "next";
import { getSql } from "@/lib/db";
import { blogPosts } from "@/lib/blog";

const SITE_URL = "https://usdentistsdirectory.com";

// Re-generate at most once a day so Neon isn't queried on every fetch.
export const revalidate = 86400;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticUrls: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, lastModified: now, changeFrequency: "daily", priority: 1.0 },
    { url: `${SITE_URL}/dentists`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${SITE_URL}/for-dentists`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${SITE_URL}/pricing`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${SITE_URL}/claim`, lastModified: now, changeFrequency: "monthly", priority: 0.4 },
    { url: `${SITE_URL}/blog`, lastModified: now, changeFrequency: "weekly", priority: 0.6 },
  ];

  const blogUrls: MetadataRoute.Sitemap = blogPosts.map((p) => ({
    url: `${SITE_URL}/blog/${p.slug}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.5,
  }));

  // Same direct getSql() pattern used elsewhere in src/app (api/claim/route.ts).
  const sql = getSql();
  const rows = (await sql`SELECT slug FROM dentists ORDER BY id`) as { slug: string }[];

  const dentistUrls: MetadataRoute.Sitemap = rows.map((r) => ({
    url: `${SITE_URL}/dentists/${r.slug}`,
    changeFrequency: "monthly",
    priority: 0.5,
  }));

  return [...staticUrls, ...blogUrls, ...dentistUrls];
}
