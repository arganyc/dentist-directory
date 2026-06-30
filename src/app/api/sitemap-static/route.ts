import { NextResponse } from 'next/server'

import { blogPosts } from '@/lib/blog'

const blogSlugs = blogPosts.map((post) => post.slug)

export async function GET() {
  const base = 'https://www.usdentistsdirectory.com'
  const today = new Date().toISOString().split('T')[0]

  const staticUrls = [
    { loc: base, priority: '1.0', changefreq: 'daily' },
    { loc: `${base}/dentists`, priority: '0.9', changefreq: 'daily' },
    { loc: `${base}/for-dentists`, priority: '0.8', changefreq: 'monthly' },
    { loc: `${base}/pricing`, priority: '0.7', changefreq: 'monthly' },
    { loc: `${base}/claim`, priority: '0.8', changefreq: 'monthly' },
    { loc: `${base}/blog`, priority: '0.8', changefreq: 'weekly' },
  ]

  const blogUrls = blogSlugs.map((slug) => ({
    loc: `${base}/blog/${slug}`,
    priority: '0.7',
    changefreq: 'monthly',
    lastmod: today,
  }))

  const allUrls = [...staticUrls, ...blogUrls]

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allUrls
  .map(
    (u) => `  <url>
    <loc>${u.loc}</loc>
    <lastmod>${'lastmod' in u ? u.lastmod : today}</lastmod>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`
  )
  .join('\n')}
</urlset>`

  return new NextResponse(xml, {
    headers: { 'Content-Type': 'application/xml' },
  })
}