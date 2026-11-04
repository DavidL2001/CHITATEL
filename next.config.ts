import path from 'node:path';
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  poweredByHeader: false,
  turbopack: { root: process.cwd() },
  images: {
    remotePatterns: [{ protocol: 'https', hostname: 'covers.openlibrary.org', pathname: '/b/**' }],
  },
  sassOptions: {
    // Lets SCSS modules write `@use 'styles/tools' as *;` from any depth.
    loadPaths: [path.join(process.cwd(), 'src')],
  },
  async headers() {
    return [
      {
        source: '/sw.js',
        headers: [
          { key: 'Cache-Control', value: 'no-cache, no-store, must-revalidate' },
          { key: 'Content-Type', value: 'application/javascript; charset=utf-8' },
        ],
      },
    ];
  },
};

export default nextConfig;
