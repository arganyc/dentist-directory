import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    unoptimized: true,
  },
  trailingSlash: true,
  async rewrites() {
    return [
      { source: '/sitemap-static.xml', destination: '/sitemap-static.xml/route' },
      { source: '/sitemap-dentists-1.xml', destination: '/sitemap-dentists-1.xml/route' },
      { source: '/sitemap-dentists-2.xml', destination: '/sitemap-dentists-2.xml/route' },
      { source: '/sitemap-dentists-3.xml', destination: '/sitemap-dentists-3.xml/route' },
    ]
  },
}

export default nextConfig