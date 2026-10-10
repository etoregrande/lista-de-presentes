import 'dotenv/config'
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
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
