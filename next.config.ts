import type { NextConfig } from "next";

import { resolve } from "path";

const nextConfig: NextConfig = {
  output: 'standalone',
  turbopack: {
    root: resolve(".")
  }
};

export default nextConfig;
