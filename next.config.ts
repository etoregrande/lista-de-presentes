import 'dotenv/config'
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: '/:path*',
        has: [{ type: 'host', value: 'www.presenteio.app' }],
        destination: 'https://presenteio.app/:path*',
        permanent: true,
      },
    ]
  },
  experimental: {
    serverActions: {
      // Allow multipart overhead for an image of up to 5 MiB.
      bodySizeLimit: '6mb',
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: process.env.BUCKET_DOMAIN!,
        pathname: '/**', // This allows all paths within the bucket
      },
    ],
  },
}

export default nextConfig
