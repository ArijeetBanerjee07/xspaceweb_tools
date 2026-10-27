import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  compress: true,
  poweredByHeader: false,
  serverExternalPackages: ["pdf-parse", "@napi-rs/canvas"],
  experimental: {
    optimizePackageImports: [
      "lucide-react",
      "react-icons",
      "react-icons/lu",
      "react-icons/fa6",
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
        source: "/:path*\\.(ico|png|jpg|jpeg|svg|webp|woff|woff2|ttf)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        source: "/studios/:path*",
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
