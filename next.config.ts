import type { NextConfig } from "next";

/** @type {import('next').NextConfig} */
const nextConfig: NextConfig = {
  devIndicators: false,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'uploadthing.com',
      },
      {
        protocol: 'https',
        hostname: 'utfs.io',
      },
    ],
  },
  webpack: (config) => {
    config.externals.push({
      "utf-8-validate": "commonjs utf-8-validate",
      bufferutil: "commonjs bufferutil"
    });
    return config;
  },
  async rewrites() {
    return [
      {
        source: '/api/socket/io',
        destination: '/api/socket/io',
      },
    ];
  },
  // Add this section to ignore ESLint errors during builds
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;