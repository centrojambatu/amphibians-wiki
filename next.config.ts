/**
 * @type {import('next').NextConfig}
 */

import type {NextConfig} from "next";

const nextConfig: NextConfig = {
  experimental: {
    reactCompiler: true,
    // cacheComponents: false,
  },
  images: {
    unoptimized: false,
  },
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
  eslint: {
    // Desactivar ESLint durante el build (temporalmente)
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Desactivar verificación de tipos durante el build (temporalmente)
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
