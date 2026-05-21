import { NextResponse } from 'next/server'

export async function GET() {
  const base = 'https://www.usdentistsdirectory.com'
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>${base}</loc><changefreq>daily</changefreq><priority>1.0</priority></url>
  <url><loc>${base}/dentists</loc><changefreq>daily</changefreq><priority>0.9</priority></url>
  <url><loc>${base}/for-dentists</loc><changefreq>monthly</changefreq><priority>0.8</priority></url>
  <url><loc>${base}/pricing</loc><changefreq>monthly</changefreq><priority>0.7</priority></url>
  <url><loc>${base}/claim</loc><changefreq>monthly</changefreq><priority>0.8</priority></url>
  <url><loc>${base}/blog</loc><changefreq>weekly</changefreq><priority>0.6</priority></url>
</urlset>`
  return new NextResponse(xml, {
    headers: { 'Content-Type': 'application/xml' },
  })
}