  
import { NextResponse } from 'next/server'

export async function GET() {
  const base = 'https://www.usdentistsdirectory.com'
  const pages = [
    { url: base, freq: 'daily', priority: '1.0' },
    { url: `${base}/dentists`, freq: 'daily', priority: '0.9' },
    { url: `${base}/for-dentists`, freq: 'monthly', priority: '0.8' },
    { url: `${base}/pricing`, freq: 'monthly', priority: '0.7' },
    { url: `${base}/claim`, freq: 'monthly', priority: '0.8' },
    { url: `${base}/blog`, freq: 'weekly', priority: '0.6' },
  ]

  const urls = pages.map(p => `
  <url>
    <loc>${p.url}</loc>
    <changefreq>${p.freq}</changefreq>
    <priority>${p.priority}</priority>
    <lastmod>${new Date().toISOString()}</lastmod>
  </url>`).join('')

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`

  return new NextResponse(xml, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 's-maxage=86400',
    },
  })
}
