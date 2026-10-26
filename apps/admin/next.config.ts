import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  // Monorepo root: pnpm links dependencies from the root node_modules/.pnpm
  turbopack: {
    root: path.join(__dirname, "../.."),
  },
};

export default nextConfig;
