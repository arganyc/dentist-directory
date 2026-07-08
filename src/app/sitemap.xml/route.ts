import { NextResponse } from 'next/server'

const SITE_LAST_UPDATED = '2026-06-20'
const SITEMAP_CACHE_SECONDS = 604800 // 7 days

export async function GET() {
  const base = 'https://www.usdentistsdirectory.com'
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>${base}/sitemap-static.xml</loc>
    <lastmod>${SITE_LAST_UPDATED}</lastmod>
  </sitemap>
  <sitemap>
    <loc>${base}/sitemap-dentists-1.xml</loc>
    <lastmod>${SITE_LAST_UPDATED}</lastmod>
  </sitemap>
  <sitemap>
    <loc>${base}/sitemap-dentists-2.xml</loc>
    <lastmod>${SITE_LAST_UPDATED}</lastmod>
  </sitemap>
  <sitemap>
    <loc>${base}/sitemap-dentists-3.xml</loc>
    <lastmod>${SITE_LAST_UPDATED}</lastmod>
  </sitemap>
</sitemapindex>`

  return new NextResponse(xml, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': `public, s-maxage=${SITEMAP_CACHE_SECONDS}, stale-while-revalidate=86400`,
    },
  })
}
