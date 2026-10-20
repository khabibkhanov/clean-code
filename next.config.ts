import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Served as the /clean-code zone of the "courses" hub (Next.js multi-zones).
  // Pages already live under /clean-code, so only assets need a unique prefix.
  assetPrefix: "/clean-code-static",
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
