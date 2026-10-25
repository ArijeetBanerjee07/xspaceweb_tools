import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
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
      { url: "/favicon.ico" },
      { url: "/favicon.png", type: "image/png" },
    ],
    shortcut: "/favicon.png",
    apple: "/favicon.png",
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

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
