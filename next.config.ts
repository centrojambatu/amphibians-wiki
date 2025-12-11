/**
 * @type {import('next').NextConfig}
 */

import type {NextConfig} from "next";

const nextConfig: NextConfig = {
  experimental: {
    reactCompiler: true,
    // cacheComponents: false,
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
  // Excluir directorios de Python del monitoreo de Turbopack
  watchOptions: {
    ignored: [
      "**/venv/**",
      "**/__pycache__/**",
      "**/*.pyc",
      "**/node_modules/**",
    ],
  },
};

export default nextConfig;
