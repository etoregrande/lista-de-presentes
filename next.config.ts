import "dotenv/config";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: "5mb",
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: process.env.BUCKET_DOMAIN!,
        pathname: "/**", // This allows all paths within the bucket
      },
    ],
  },
};

export default nextConfig;
