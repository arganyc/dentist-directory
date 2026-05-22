import type { NextConfig } from 'next'
import { US_STATES } from './src/lib/dentists'

function slugify(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

const nextConfig: NextConfig = {
  images: {
    unoptimized: true,
  },
  async rewrites() {
    return [
      { source: '/sitemap-static.xml', destination: '/api/sitemap-static' },
      { source: '/sitemap-dentists-1.xml', destination: '/api/sitemap-dentists-1' },
      { source: '/sitemap-dentists-2.xml', destination: '/api/sitemap-dentists-2' },
      { source: '/sitemap-dentists-3.xml', destination: '/api/sitemap-dentists-3' },
    ]
  },
  async redirects() {
    const redirects: {
      source: string;
      has: { type: 'query'; key: string; value?: string }[];
      destination: string;
      permanent: boolean;
    }[] = [];

    for (const state of US_STATES) {
      const stateSlug = slugify(state.name);

      redirects.push({
        source: '/dentists',
        has: [{ type: 'query', key: 'state', value: state.code }],
        destination: `/dentists/${stateSlug}`,
        permanent: true,
      });

      redirects.push({
        source: '/dentists',
        has: [
          { type: 'query', key: 'state', value: state.code },
          { type: 'query', key: 'city' },
        ],
        destination: `/dentists/${stateSlug}/:city`,
        permanent: true,
      });
    }

    return redirects;
  },
}

export default nextConfig