  import { NextResponse } from 'next/server'
import { getSql } from '@/lib/db'

export const revalidate = 86400

export async function GET() {
  const base = 'https://www.usdentistsdirectory.com'
  const sql = getSql()

  const dentists = await sql`
    SELECT slug FROM dentists
    ORDER BY id
    LIMIT 50000 OFFSET 50000
  `

  const urls = dentists.map((d: { slug: string }) => `
  <url>
    <loc>${base}/dentists/${d.slug}</loc>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
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
