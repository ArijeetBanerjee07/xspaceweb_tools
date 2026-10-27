import type { Metadata, Viewport } from "next";
import { Geist_Mono, Inter } from "next/font/google";
import "./globals.css";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#ffffff",
};

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "XSW Tools | Every Tool. One Workspace.",
  description: "XSW Tools: 40+ blazing fast, free tools across 9 dedicated studios — PDF tools, AI document analyzer, background remover, format converter, e-signatures, vector QR codes, Office Studio, and TrendRank SEO intelligence.",
  keywords: [
    "XSW Tools",
    "xsw tools",
    "xspaceweb tools",
    "online tools in one box",
    "pdf tools",
    "merge pdf",
    "compress pdf",
    "ocr pdf",
    "ai document summarizer",
    "remove background free",
    "background remover",
    "convert docx to pdf",
    "online file converter",
    "vector qr code generator",
    "e-signature free",
    "trendrank seo keyword explorer",
    "all in one toolbox",
  ],
  icons: {
    icon: [
      { url: "/logo-spheres.png?v=final", type: "image/png" },
    ],
    shortcut: "/logo-spheres.png?v=final",
    apple: "/logo-spheres.png?v=final",
  },
  openGraph: {
    title: "XSW Tools | Every Tool. One Workspace.",
    description: "40+ blazing fast, free digital utilities across 9 dedicated studios. PDF tools, AI summaries, background removal, universal format conversions, and vector QR codes.",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "XSW Tools | Every Tool. One Workspace.",
    description: "40+ online tools you need in one box. Blazing fast, free & modern.",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${geistMono.variable} h-full antialiased font-sans`}
    >
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" type="image/png" href="/logo-spheres.png" />
        <link rel="apple-touch-icon" href="/logo-spheres.png" />
      </head>
      <body className="min-h-full flex flex-col font-sans">{children}</body>
    </html>
  );
}
