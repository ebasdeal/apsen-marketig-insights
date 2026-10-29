import type { NextConfig } from 'next';
import { DEFAULT_API_URL } from './src/infrastructure/config/env';
import { buildSecurityHeaders } from './src/main/securityHeaders';

const nextConfig: NextConfig = {
  typedRoutes: true,
  reactStrictMode: true,
  poweredByHeader: false,
  experimental: {
    optimizePackageImports: ['@tanstack/react-query', 'zustand', 'chart.js'],
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: buildSecurityHeaders({
          apiUrl: process.env.NEXT_PUBLIC_API_URL ?? DEFAULT_API_URL,
          dev: process.env.NODE_ENV !== 'production',
        }),
      },
    ];
  },
};

export default nextConfig;
