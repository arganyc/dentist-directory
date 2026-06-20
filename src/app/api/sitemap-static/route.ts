import { NextResponse } from 'next/server'

const blogSlugs = [
  // Original articles
  'how-often-should-you-see-a-dentist',
  'invisalign-vs-braces',
  'what-to-do-dental-emergency',
  // Wave 1 – DMV + national topics
  'best-dentists-washington-dc',
  'dentists-northern-virginia',
  'dental-care-maryland',
  'dental-implants-vs-dentures',
  'how-to-choose-a-dentist',
  'what-is-a-root-canal',
  'teeth-whitening-professional-vs-home',
  'dental-insurance-explained',
  'wisdom-teeth-removal-guide',
  'gum-disease-signs-treatment',
  // Wave 1 – major cities + high-value topics
  'best-dentists-baltimore',
  'best-dentists-philadelphia',
  'best-dentists-new-york-city',
  'best-dentists-boston',
  'best-dentists-chicago',
  'best-dentists-los-angeles',
  'best-dentists-houston',
  'best-dentists-atlanta',
  'best-dentists-miami',
  'best-dentists-dallas',
  'affordable-dentist-no-insurance',
  'dental-anxiety-tips',
  'children-first-dental-visit',
  'veneers-vs-bonding',
  'cost-of-dental-implants-us',
  // Wave 2 – more cities
  'best-dentists-seattle',
  'best-dentists-phoenix',
  'best-dentists-denver',
  'best-dentists-san-francisco',
  'best-dentists-las-vegas',
  'best-dentists-charlotte',
  'best-dentists-nashville',
  'best-dentists-orlando',
  // Wave 2 – DMV neighborhood guides
  'dentist-bethesda-md',
  'dentist-arlington-va',
  'dentist-alexandria-va',
  'dentist-rockville-md',
  'dentist-silver-spring-md',
  'dentist-fairfax-va',
  'dentist-reston-va',
  // Wave 2 – procedure articles
  'dental-crowns-complete-guide',
  'tooth-extraction-what-to-expect',
  'invisalign-cost-and-process',
  'teeth-grinding-bruxism',
  'dental-sealants-guide',
  'tmj-jaw-pain-treatment',
  'sleep-apnea-dental-treatment',
  'dental-bridges-explained',
  // Wave 3 – DMV neighborhood guides
  'dentist-mclean-va',
  'dentist-tysons-va',
  'dentist-chevy-chase-md',
  'dentist-potomac-md',
  'dentist-gaithersburg-md',
  'dentist-columbia-md',
  'dentist-annapolis-md',
  'dentist-falls-church-va',
  'dentist-vienna-va',
  'dentist-woodbridge-va',
  // Wave 3 – city guides
  'best-dentists-san-diego',
  'best-dentists-portland',
  'best-dentists-minneapolis',
  'best-dentists-tampa',
  'best-dentists-austin',
  'best-dentists-raleigh',
  'best-dentists-pittsburgh',
  'best-dentists-richmond-va',
  'best-dentists-san-antonio',
  'best-dentists-columbus-ohio',
  // Wave 3 – topic articles
  'dental-care-during-pregnancy',
  'seniors-dental-care-guide',
  'porcelain-veneers-complete-guide',
  'fluoride-treatment-adults',
  'how-to-read-your-dental-xrays',
  // Wave 4 – DMV neighborhood guides
  'dentist-germantown-md',
  'dentist-herndon-va',
  'dentist-manassas-va',
  'dentist-leesburg-va',
  'dentist-laurel-md',
  'dentist-bowie-md',
  'dentist-college-park-md',
  'dentist-upper-marlboro-md',
  // Wave 4 – city guides
  'best-dentists-sacramento',
  'best-dentists-detroit',
  'best-dentists-st-louis',
  'best-dentists-san-jose',
  'best-dentists-indianapolis',
  'best-dentists-jacksonville',
  'best-dentists-salt-lake-city',
  'best-dentists-kansas-city',
  // Wave 4 – topic articles
  'emergency-tooth-pain-at-night',
  'cost-of-braces-complete-guide',
  'tooth-sensitivity-complete-guide',
  'bad-breath-causes-and-treatment',
  'dental-care-for-diabetics',
  'how-long-does-a-filling-take',
]

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