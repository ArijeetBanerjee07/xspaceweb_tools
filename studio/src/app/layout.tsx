import type { Metadata } from "next";
import { Geist_Mono } from "next/font/google";
import "./globals.css";

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

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistMono.variable} h-full antialiased font-sans`}
    >
      <head>
        <link rel="icon" type="image/png" href="/logo-spheres.png?v=final" />
        <link rel="shortcut icon" href="/logo-spheres.png?v=final" />
        <link rel="apple-touch-icon" href="/logo-spheres.png?v=final" />
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var h=document.head;var l=document.createElement('link');l.rel='icon';l.type='image/png';l.href='/logo-spheres.png?v='+Date.now();h.appendChild(l);}catch(e){}})();`,
          }}
        />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Google+Sans+Flex:opsz,wght@1..144,100..1000&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full flex flex-col font-sans">{children}</body>
    </html>
  );
}
