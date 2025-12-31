import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  images: {
    unoptimized: true,
  },
  experimental: {
    // Evita el build worker (puede fallar en entornos con sandbox/puertos restringidos)
    webpackBuildWorker: false,
  },
};

export default nextConfig;
