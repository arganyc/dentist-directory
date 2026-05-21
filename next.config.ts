async rewrites() {
  return [
    { source: '/sitemap-static.xml', destination: '/api/sitemap-static' },
    { source: '/sitemap-dentists-1.xml', destination: '/api/sitemap-dentists-1' },
    { source: '/sitemap-dentists-2.xml', destination: '/api/sitemap-dentists-2' },
    { source: '/sitemap-dentists-3.xml', destination: '/api/sitemap-dentists-3' },
  ]
},
