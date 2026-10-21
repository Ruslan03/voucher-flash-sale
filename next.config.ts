import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Local LAN host used to open the demo; enables dev assets and HMR on this host.
  allowedDevOrigins: ['localhost'],
  /* config options here */
  experimental: {
    agentFeedback: true,
  },
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "globals.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
