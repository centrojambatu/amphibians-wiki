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
    remotePatterns: [
      {
        protocol: "https",
        hostname: "via.placeholder.com",
      },
      {
        protocol: "https",
        hostname: "multimedia20stg.blob.core.windows.net",
      },
      {
        protocol: "https",
        hostname: "img.youtube.com",
      },
      {
        protocol: "https",
        hostname: "i.ytimg.com",
      },
      {
        protocol: "https",
        hostname: "inaturalist-open-data.s3.amazonaws.com",
      },
      {
        protocol: "https",
        hostname: "static.inaturalist.org",
      },
    ],
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
