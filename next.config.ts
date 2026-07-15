import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  turbopack: {
    root: process.cwd(),
  },
  async redirects() {
    return [
      ...["contact", "privacy", "terms", "copyright", "acceptable-use"].map((page) => ({
        source: `/:locale(zh-cn|es)/${page}`,
        destination: `/${page}`,
        permanent: true,
      })),
    ];
  },
};

export default nextConfig;
