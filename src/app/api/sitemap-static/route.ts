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
  // Wave 5 – city guides
  'best-dentists-milwaukee',
  'best-dentists-memphis',
  'best-dentists-louisville',
  'best-dentists-cincinnati',
  'best-dentists-new-orleans',
  'best-dentists-cleveland',
  'best-dentists-oklahoma-city',
  'best-dentists-tucson',
  // Wave 5 – procedure articles
  'veneers-vs-crowns',
  'cost-of-root-canal',
  'dental-implant-recovery-timeline',
  'composite-vs-amalgam-fillings',
  'dental-crown-cost-guide',
  'what-is-a-deep-cleaning-dental',
  'wisdom-teeth-removal-cost',
  'dental-bonding-vs-veneers',
  // Wave 6 – city guides
  'best-dentists-el-paso',
  'best-dentists-birmingham',
  'best-dentists-baton-rouge',
  'best-dentists-knoxville',
  'best-dentists-albuquerque',
  'best-dentists-omaha',
  'best-dentists-buffalo',
  'best-dentists-hartford',
  'best-dentists-fresno',
  'best-dentists-little-rock',
  // Wave 6 – procedure & topic articles
  'what-causes-cavities',
  'can-you-reverse-gum-disease',
  'tooth-extraction-cost-guide',
  'oral-cancer-early-signs',
  'electric-vs-manual-toothbrush',
  'waterpik-vs-flossing',
  'zoom-teeth-whitening-guide',
  'types-of-braces-comparison',
  'oil-pulling-dental-truth',
  'how-to-choose-toothpaste',
  // Wave 7 – "near me" articles
  'find-a-dentist-near-me',
  'emergency-dentist-near-me',
  // Wave 7 – NYC neighborhood guides
  'best-dentists-manhattan-nyc',
  'best-dentists-brooklyn-nyc',
  'best-dentists-queens-nyc',
  // Wave 7 – LA neighborhood guides
  'best-dentists-beverly-hills-ca',
  'best-dentists-santa-monica-ca',
  'best-dentists-pasadena-ca',
  // Wave 7 – Chicago suburb guides
  'best-dentists-evanston-il',
  'best-dentists-naperville-il',
  'best-dentists-oak-park-il',
  // Wave 7 – Houston suburb guides
  'best-dentists-the-woodlands-tx',
  'best-dentists-sugar-land-tx',
  'best-dentists-katy-tx',
  // Wave 7 – Dallas suburb guides
  'best-dentists-plano-tx',
  'best-dentists-frisco-tx',
  // Wave 7 – Phoenix suburb guides
  'best-dentists-scottsdale-az',
  'best-dentists-chandler-gilbert-az',
  // Wave 7 – Atlanta suburb guides
  'best-dentists-alpharetta-ga',
  'best-dentists-marietta-ga',
  // Wave 7 – Boston neighborhood guides
  'best-dentists-cambridge-ma',
  'best-dentists-brookline-ma',
  'best-dentists-newton-ma',
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