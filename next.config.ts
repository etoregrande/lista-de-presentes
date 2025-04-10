import 'dotenv/config'
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: '5mb',
    },
  },
  redirects: async () => {
    return [
      {
        source: '/:path*',
        has: [{ type: 'header', key: 'host', value: 'www.presenteio.app' }],
        destination: 'https://presenteio.app/:path*',
        permanent: true,
      },
    ];
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
};

export default nextConfig;
