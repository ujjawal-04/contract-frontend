import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* keep your existing config options here */
  
  // Add this to ignore ESLint errors during build
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;