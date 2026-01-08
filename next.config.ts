import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.clashroyale.com',
      },
    ],
  },
};

export default nextConfig;
