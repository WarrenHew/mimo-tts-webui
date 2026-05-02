import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  devIndicators: false,
  // Proxy API calls to backend during development
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:3001/api/:path*',
      },
    ];
  },
};

export default nextConfig;
