import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.shopify.com',
        pathname: '/**',
      },
    ],
  },
  turbopack: {
    root: path.resolve("."),
  },
  async rewrites() {
    const domain = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN || "colinguest-2.myshopify.com";
    return [
      {
        source: "/checkouts/:path*",
        destination: `https://${domain}/checkouts/:path*`,
      },
    ];
  },
};

export default nextConfig;
