import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  compress: true,
  poweredByHeader: false,
  serverExternalPackages: ["pdf-parse", "@napi-rs/canvas"],
  experimental: {
    optimizePackageImports: [
      "lucide-react",
      "react-icons",
      "pdf-lib",
      "exceljs",
      "docx",
    ],
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  async headers() {
    return [
      {
        source: "/:all*(svg|jpg|png|webp|ico|woff|woff2)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  },
  async rewrites() {
    return [
      {
        source:
          "/:slug(jpg-to-pdf|merge-pdf|split-pdf|compress-pdf|pdf-to-word|word-to-pdf|pdf-to-excel|excel-to-pdf|pdf-to-powerpoint|powerpoint-to-pdf|pdf-to-jpg|rotate-pdf|protect-pdf|unlock-pdf|add-watermark|add-page-numbers|remove-pages|extract-pages|organize-pdf)",
        destination: "/tools/:slug",
      },
    ];
  },
};

export default nextConfig;
