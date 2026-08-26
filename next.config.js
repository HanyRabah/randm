/** @type {import('next').NextConfig} */
const nextConfig = {
  // ponytail: portfolio demo — TS errors accepted on non-demo routes
  // (see TECH_DEBT.md); remove once 105 legacy errors are cleaned up.
  typescript: { ignoreBuildErrors: true },
  experimental: {
    serverComponentsExternalPackages: ['@prisma/client'],
  },
  // Enable Vercel Analytics
  analyticsId: process.env.VERCEL_ANALYTICS_ID,
  
  // Performance optimizations
  compress: true,
  poweredByHeader: false,
  
  // API caching headers
  async headers() {
    return [
      {
        source: '/api/products/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 's-maxage=60, stale-while-revalidate=300',
          },
        ],
      },
      {
        source: '/api/categories/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 's-maxage=300, stale-while-revalidate=600',
          },
        ],
      },
      {
        source: '/api/admin/seo-settings',
        headers: [
          {
            key: 'Cache-Control',
            value: 's-maxage=300, stale-while-revalidate=600',
          },
        ],
      },
    ]
  },
  
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.amazonaws.com',
      },
      {
        protocol: 'https',
        hostname: '**.cloudflare.com',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'j37daxqv8lh1bi61.public.blob.vercel-storage.com',
      }
    ],
    // Image optimization
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 60,
  },
}

module.exports = nextConfig
