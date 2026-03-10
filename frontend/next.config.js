/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: process.env.STATIC_EXPORT === 'true' ? 'export' : undefined,
  images: process.env.STATIC_EXPORT === 'true' ? { unoptimized: true } : undefined,
  async rewrites() {
    if (process.env.STATIC_EXPORT === 'true') return [];
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:4000/api/:path*',
      },
    ];
  },
};

module.exports = nextConfig;
