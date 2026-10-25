"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { AbstractAnimationCanvas } from "./AbstractAnimationCanvas";
import { TOOLS_CATALOG, CatalogTool } from "@/config/toolsCatalog";
import {
  LuSparkles,
  LuFileText,
  LuLayers,
  LuShieldCheck,
  LuQrCode,
  LuScissors,
  LuFileSpreadsheet,
  LuMinimize2,
  LuTrendingUp,
  LuArrowRight,
  LuSearch,
  LuCheck,
  LuZap,
  LuLock,
  LuDatabase,
  LuChevronRight,
  LuCrown,
  LuCircleHelp,
  LuArrowUpRight,
  LuFolder,
  LuSlidersHorizontal,
  LuExternalLink,
  LuGlobe,
  LuCpu,
  LuMail,
} from "react-icons/lu";
import {
  FaXTwitter,
  FaGithub,
  FaLinkedinIn,
  FaDiscord,
  FaYoutube,
} from "react-icons/fa6";

// SEO-structured Studios Information with 100% Verified, Relevant Images
const STUDIOS_DATA = [
  {
    id: "pdf",
    name: "PDF Studio",
    tagline: "High-Performance Vector PDF Processing & OCR",
    desc: "Complete online PDF toolbox: merge multi-page documents, split pages, compress file size up to 85%, stamp watermarks, and extract editable text with neural OCR.",
    href: "/app/studios/pdf",
    icon: LuFileText,
    badge: "10 Tools",
    accent: "bg-red-50 text-red-700 border-red-200",
    colorHex: "#ef4444",
    image: "/dashboards/pdf-studio-dashboard.png",
    keyTools: ["Merge Multiple PDFs", "Split & Extract Pages", "Compress PDF File Size", "Convert PDF to Word DOCX", "Neural OCR Text Scanner", "Watermark & Page Stamp"],
    inputFormats: ".pdf, .doc, .docx",
    outputFormats: ".pdf, .docx, .txt, .zip",
  },
  {
    id: "ai-document",
    name: "AI Document Studio",
    tagline: "Neural Reading, Instant Briefs & Invoice Extraction",
    desc: "Analyze and query complex contracts, technical papers, and spreadsheets. Generate executive summaries, extract structured tax invoices, and chat directly with your files.",
    href: "/app/studios/ai-document",
    icon: LuSparkles,
    badge: "AI Powered",
    accent: "bg-sky-50 text-sky-700 border-sky-200",
    colorHex: "#0284c7",
    image: "/dashboards/ai-document-dashboard.png",
    keyTools: ["Document Summarizer", "Clause-by-Clause Auditor", "Invoice & Receipt Data Extraction", "Document Q&A Assistant", "Action Checklist Generator"],
    inputFormats: ".pdf, .docx, .txt",
    outputFormats: "Structured JSON, Markdown, Executive Brief",
  },
  {
    id: "background",
    name: "Background Studio",
    tagline: "Sub-Pixel AI Background Matting & Subject Cutout",
    desc: "Remove photo backgrounds automatically in 2 seconds. Replace with clean white studio backgrounds, solid ecommerce palettes, or transparent PNGs with crisp hair edge detail.",
    href: "/app/studios/background",
    icon: LuScissors,
    badge: "Neural Matting",
    accent: "bg-indigo-50 text-indigo-700 border-indigo-200",
    colorHex: "#3bb1df",
    image: "/dashboards/background-studio-dashboard.png",
    keyTools: ["Automatic Background Remover", "Solid Color Studio Backdrop", "Transparent PNG Cutout", "Edge Smoothing & Hair Matting", "Product Commercial Resizer"],
    inputFormats: ".png, .jpg, .jpeg, .webp",
    outputFormats: "Transparent PNG, High-Res WebP, JPG",
  },
  {
    id: "document-hub",
    name: "Document Hub",
    tagline: "Universal 20+ Format Transcoder & File Bridge",
    desc: "Convert effortlessly between Word, PowerPoint, Excel, PDF, Markdown, HTML, and high-resolution raster formats while preserving nested formatting, vector fonts, and tables.",
    href: "/app/studios/document-hub",
    icon: LuLayers,
    badge: "20+ Formats",
    accent: "bg-cyan-50 text-cyan-700 border-cyan-200",
    colorHex: "#0891b2",
    image: "/dashboards/file-manager-dashboard.png",
    keyTools: ["DOCX to PDF Transcoder", "PPTX Slide to PDF", "HTML & Markdown to DOCX", "Universal File Normalizer", "Batch Conversion Queue"],
    inputFormats: "20+ supported document & media extensions",
    outputFormats: ".pdf, .docx, .xlsx, .pptx, .html, .md",
  },
  {
    id: "office",
    name: "Office Studio",
    tagline: "Programmatic Word, Presentation & Spreadsheet Suite",
    desc: "Generate professional business memos in DOCX format, compile pitch presentation decks in PPTX, clean Excel balance sheets, and convert messy tabular data into CSVs.",
    href: "/app/studios/office",
    icon: LuFileSpreadsheet,
    badge: "Office Suite",
    accent: "bg-teal-50 text-teal-700 border-teal-200",
    colorHex: "#0d9488",
    image: "/dashboards/office-studio-dashboard.png",
    keyTools: ["DOCX Document Generator", "PPTX Pitch Deck Builder", "Excel Financial Model Creator", "Spreadsheet CSV Normalizer"],
    inputFormats: ".docx, .pptx, .xlsx, .csv",
    outputFormats: ".docx, .pptx, .xlsx, .pdf",
  },
  {
    id: "security",
    name: "Security & E-Signature",
    tagline: "Cryptographic Protection, PII Redaction & Legal E-Signs",
    desc: "Secure confidential business documents with AES-256 bit encryption, permanently redact sensitive social security and bank numbers, and apply cryptographically verifiable e-signatures.",
    href: "/app/studios/security",
    icon: LuShieldCheck,
    badge: "AES-256 Safe",
    accent: "bg-emerald-50 text-emerald-700 border-emerald-200",
    colorHex: "#059669",
    image: "https://assets.lummi.ai/assets/QmWVgNeSjKDXzgXjCvEa5FhXhA8UFZqZoeeiX9Q87QTTnH?auto=format&w=1200&h=800",
    keyTools: ["AES-256 PDF Password Lock", "Confidential PII Blackout Redactor", "Legally Binding Digital E-Signature", "Permissions Stripper & Unlocker"],
    inputFormats: ".pdf",
    outputFormats: "Encrypted PDF, Signed PDF with Audit Log",
  },
  {
    id: "compress",
    name: "Compress & Enhance",
    tagline: "Smart Density Reduction & Lossless Optimization",
    desc: "Reduce heavy PDF attachments and high-resolution JPEG, PNG, and WebP images by up to 85% without noticeable loss in visual clarity or text sharpness.",
    href: "/app/studios/compress",
    icon: LuMinimize2,
    badge: "Up to -85%",
    accent: "bg-amber-50 text-amber-700 border-amber-200",
    colorHex: "#d97706",
    image: "https://assets.lummi.ai/assets/QmUSFZjFhuGYJd4rAc7xv3DdZsxBR1iPpdVnmLsNtyKo4t?auto=format&w=1200&h=800",
    keyTools: ["Smart PDF File Compressor", "Lossless PNG & JPG Shrinker", "WebP Fast Next-Gen Converter", "Raster Image Upscaler & Denoiser"],
    inputFormats: ".pdf, .png, .jpg, .webp",
    outputFormats: "Optimized PDF, WebP, Compressed PNG/JPG",
  },
  {
    id: "qr-link",
    name: "QR & Link Studio",
    tagline: "Custom Vector QR Generator & Dynamic Route Engine",
    desc: "Design sharp, customized vector QR codes for websites, WiFi network logins, vCard digital business cards, and social profiles with downloadable SVG and high-DPI PNGs.",
    href: "/app/studios/qr-link",
    icon: LuQrCode,
    badge: "Vector SVG",
    accent: "bg-rose-50 text-rose-700 border-rose-200",
    colorHex: "#e11d48",
    image: "https://assets.lummi.ai/assets/Qmbb7arkGDEK7Rjw1aQrwQqm6ueT4sbn4dE4TV3HcE2E1B?auto=format&w=1200&h=800",
    keyTools: ["URL Website QR Generator", "WiFi One-Tap Connect QR", "vCard Virtual Business Card", "Custom Hex Matrix Colorizer", "Scalable Vector SVG Export"],
    inputFormats: "Text, URL, vCard, WiFi credentials",
    outputFormats: "Scalable Vector SVG, High-Res PNG, Print PDF",
  },
  {
    id: "trendrank",
    name: "TrendRank AI",
    tagline: "Search Volume Intelligence & Commercial Intent Radar",
    desc: "Explore search queries, uncover high-intent commercial keyword gaps, monitor organic topic momentum, and outrank competitors with AI keyword discovery.",
    href: "/app/studios/trendrank",
    icon: LuTrendingUp,
    badge: "SEO Insights",
    accent: "bg-purple-50 text-purple-700 border-purple-200",
    colorHex: "#9333ea",
    image: "https://assets.lummi.ai/assets/QmReQLLkK4SHWqU4p4iE5ErqHHfKWo1gTL9ryeBuTfxcEL?auto=format&w=1200&h=800",
    keyTools: ["Search Demand Explorer", "Commercial Intent Matrix", "Keyword Difficulty Estimator", "SERP Gap Opportunity Finder"],
    inputFormats: "Keywords, domain queries, search prompts",
    outputFormats: "Exportable CSV, Strategic Keyword Tables",
  },
];

interface HomePageClientProps {
  isAuthenticated?: boolean;
}

export function HomePageClient({ isAuthenticated = false }: HomePageClientProps) {
  const [activeStudioId, setActiveStudioId] = useState("pdf");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Keyboard shortcut Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const activeStudio = useMemo(() => {
    return STUDIOS_DATA.find((s) => s.id === activeStudioId) || STUDIOS_DATA[0];
  }, [activeStudioId]);

  const categories = useMemo(() => {
    const set = new Set<string>();
    TOOLS_CATALOG.forEach((t) => set.add(t.category));
    return ["All", ...Array.from(set)];
  }, []);

  const filteredTools = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return TOOLS_CATALOG.filter((tool) => {
      const matchesCategory = selectedCategory === "All" || tool.category === selectedCategory;
      const matchesQuery =
        !q ||
        tool.name.toLowerCase().includes(q) ||
        tool.description.toLowerCase().includes(q) ||
        tool.studioName.toLowerCase().includes(q) ||
        tool.tags.some((tag) => tag.toLowerCase().includes(q));
      return matchesCategory && matchesQuery;
    });
  }, [searchQuery, selectedCategory]);

  return (
    <div className="relative min-h-screen bg-[#fafbfe] text-slate-900 selection:bg-[#3bb1df] selection:text-white font-sans antialiased">
      {/* JSON-LD Structured Data for High-Ranking SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            name: "XSW Tools",
            operatingSystem: "Web Browser",
            applicationCategory: "BusinessApplication, ProductivitySoftware",
            description:
              "All-in-one online tool suite offering 40+ free tools across 9 studios: PDF tools, AI document analysis, background removal, universal file converter, e-signature, and SEO intelligence.",
            offers: [
              {
                "@type": "Offer",
                price: "0",
                priceCurrency: "INR",
                name: "Free Forever Tier",
              },
              {
                "@type": "Offer",
                price: "299",
                priceCurrency: "INR",
                priceSpecification: {
                  "@type": "UnitPriceSpecification",
                  price: "299",
                  priceCurrency: "INR",
                  unitCode: "MON",
                },
                name: "Pro Studio Plan",
              },
            ],
          }),
        }}
      />

      {/* Abstract Light-Mode Interactive Particle Background */}
      <AbstractAnimationCanvas />

      {/* Modern Light Geometric Grid Pattern */}
      <div
        className="pointer-events-none absolute inset-0 z-0 opacity-[0.4]"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, #cbd5e1 1px, transparent 0)`,
          backgroundSize: "28px 28px",
        }}
      />

      {/* STICKY HEADER (Light Theme with Dynamic Auth Actions) */}
      <header className="sticky top-0 z-50 w-full border-b border-slate-200/90 bg-white/85 backdrop-blur-xl shadow-xs transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo & Clean xswtools Brand Header */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-blue-50/80 border border-blue-200/80 flex items-center justify-center p-1.5 shrink-0 group-hover:scale-105 transition-transform shadow-2xs">
              <img
                src="/brand/xswtools_logo.png"
                alt="xswtools"
                className="w-full h-full object-contain"
              />
            </div>
            <span className="font-black text-xl sm:text-2xl text-slate-900 tracking-tight">
              xsw<span className="text-[#3bb1df]">tools</span>
            </span>
          </Link>

          {/* Nav Links */}
          <nav className="hidden lg:flex items-center gap-7 text-sm font-semibold text-slate-600">
            <a href="#studios" className="hover:text-[#3bb1df] transition">
              Studios Suite
            </a>
            <a href="#tools" className="hover:text-[#3bb1df] transition">
              Tools Directory
            </a>
            <a href="#architecture" className="hover:text-[#3bb1df] transition">
              Privacy &amp; Speed
            </a>
            <a href="#pricing" className="hover:text-[#3bb1df] transition">
              Pricing
            </a>
            <a href="#faq" className="hover:text-[#3bb1df] transition">
              FAQ
            </a>
          </nav>

          {/* Dynamic Auth Header Actions: Launch Studio if signed in, Get Started / Sign In if not */}
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <Link
                href="/app"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#3bb1df] hover:bg-[#2aa3d2] text-white font-bold text-xs sm:text-sm shadow-sm transition active:scale-[0.98]"
              >
                <span>Launch Studio</span>
                <LuArrowRight className="w-3.5 h-3.5" />
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-xs sm:text-sm font-semibold text-slate-700 hover:text-[#3bb1df] px-3 py-2 rounded-lg transition"
                >
                  Sign In
                </Link>
                <Link
                  href="/signup"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#3bb1df] hover:bg-[#2aa3d2] text-white font-bold text-xs sm:text-sm shadow-sm transition active:scale-[0.98]"
                >
                  <span>Get Started</span>
                  <LuArrowRight className="w-3.5 h-3.5" />
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* HERO SECTION */}
      <section className="relative z-10 pt-12 sm:pt-20 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center">
        {/* Release Pill */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-slate-200/90 text-xs text-slate-700 shadow-xs mb-6">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-semibold text-slate-900">40+ Online Tools in One Box</span>
          <span className="text-slate-300">•</span>
          <span className="text-[#3bb1df] font-semibold">9 Dedicated Digital Studios</span>
        </div>

        {/* H1 Primary SEO Title */}
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 max-w-5xl mx-auto leading-[1.12]">
          All Online Tools You Need in One Box. <br className="hidden sm:inline" />
          <span className="text-[#3bb1df]">Blazing Fast, Private &amp; Modern.</span>
        </h1>

        {/* SEO Intent Subtitle */}
        <p className="mt-6 text-base sm:text-lg text-slate-600 max-w-3xl mx-auto font-normal leading-relaxed">
          Say goodbye to paying for 10 separate subscriptions. Merge and OCR PDFs, run neural document extraction, remove photo backgrounds, convert 20+ file formats, sign agreements, and discover SEO search trends — all inside one unified browser studio.
        </p>

        {/* Dynamic CTAs (Signed-in vs Guest) */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3.5">
          {isAuthenticated ? (
            <Link
              href="/app"
              className="px-7 py-3.5 rounded-xl bg-[#3bb1df] hover:bg-[#2aa3d2] text-white font-extrabold text-sm sm:text-base shadow-md shadow-indigo-500/20 transition flex items-center gap-2.5 active:scale-[0.98]"
            >
              <span>Launch Studio Dashboard</span>
              <LuArrowRight className="w-4 h-4" />
            </Link>
          ) : (
            <>
              <Link
                href="/signup"
                className="px-7 py-3.5 rounded-xl bg-[#3bb1df] hover:bg-[#2aa3d2] text-white font-extrabold text-sm sm:text-base shadow-md shadow-indigo-500/20 transition flex items-center gap-2.5 active:scale-[0.98]"
              >
                <span>Get Started Free</span>
                <LuArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/login"
                className="px-6 py-3.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-semibold text-sm sm:text-base shadow-xs transition"
              >
                Sign In to Website
              </Link>
            </>
          )}
          <a
            href="#tools"
            className="px-6 py-3.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-semibold text-sm sm:text-base shadow-xs transition flex items-center gap-2"
          >
            <LuSearch className="w-4 h-4 text-slate-500" />
            <span>Search 40+ Tools</span>
          </a>
          <a
            href="#pricing"
            className="px-5 py-3.5 rounded-xl text-slate-600 hover:text-slate-900 font-semibold text-sm transition"
          >
            View Plans (₹0 Free &bull; ₹299 Pro)
          </a>
        </div>

        {/* Studio Categories Pill Bar */}
        <div className="mt-12 flex flex-wrap items-center justify-center gap-2 max-w-5xl mx-auto">
          {STUDIOS_DATA.map((s) => (
            <button
              key={s.id}
              onClick={() => {
                setActiveStudioId(s.id);
                document.getElementById("studios")?.scrollIntoView({ behavior: "smooth" });
              }}
              className="px-3 py-1.5 rounded-lg bg-white hover:bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-700 shadow-2xs transition flex items-center gap-1.5"
            >
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: s.colorHex }} />
              <span>{s.name}</span>
            </button>
          ))}
        </div>
      </section>

      {/* 9 PRODUCTION STUDIOS SUITE (With Distinct Dashboard & Conceptual Imagery) */}
      <section id="studios" className="relative z-10 py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200/80 text-xs font-bold text-[#3bb1df] mb-3">
            <LuSlidersHorizontal className="w-3.5 h-3.5" />
            <span>STUDIO SUITE EXPLORER</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            9 High-Performance Production Studios
          </h2>
          <p className="mt-2 text-sm sm:text-base text-slate-600">
            Click any studio to view its dedicated workflow, interface, supported formats, and tools.
          </p>
        </div>

        {/* Studio Navigation Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 scrollbar-none justify-start lg:justify-center">
          {STUDIOS_DATA.map((s) => {
            const Icon = s.icon;
            const isActive = s.id === activeStudioId;
            return (
              <button
                key={s.id}
                onClick={() => setActiveStudioId(s.id)}
                className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition border ${
                  isActive
                    ? "bg-white text-[#3bb1df] border-[#3bb1df] shadow-sm font-bold ring-2 ring-[#3bb1df]/10"
                    : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:text-slate-900 shadow-2xs"
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? "text-[#3bb1df]" : "text-slate-400"}`} />
                <span>{s.name}</span>
              </button>
            );
          })}
        </div>

        {/* Active Studio Card Display */}
        <div className="mt-4 rounded-3xl border border-slate-200 bg-white shadow-xl overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 items-stretch">
            {/* Left Column: Details & Capabilities */}
            <div className="lg:col-span-6 p-6 sm:p-10 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-slate-100">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <span className={`px-2.5 py-1 rounded-md text-xs font-mono font-bold border ${activeStudio.accent}`}>
                    {activeStudio.badge}
                  </span>
                  <span className="text-xs text-slate-500 font-mono">Workspace Route: {activeStudio.href}</span>
                </div>

                <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                  {activeStudio.name}
                </h3>
                <p className="text-sm sm:text-base font-semibold text-[#3bb1df]">
                  {activeStudio.tagline}
                </p>
                <p className="text-sm text-slate-600 leading-relaxed">
                  {activeStudio.desc}
                </p>

                {/* File Formats Pill Info */}
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-medium">Input Formats:</span>
                    <span className="font-mono font-semibold text-slate-700">{activeStudio.inputFormats}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-medium">Output Formats:</span>
                    <span className="font-mono font-semibold text-slate-700">{activeStudio.outputFormats}</span>
                  </div>
                </div>

                {/* Core Operations Grid */}
                <div className="pt-2 space-y-2">
                  <div className="text-xs font-mono uppercase tracking-wider text-slate-500 font-bold">
                    Featured Operations in Studio
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                    {activeStudio.keyTools.map((tool) => (
                      <div
                        key={tool}
                        className="flex items-center gap-2 text-xs sm:text-sm text-slate-700 bg-slate-50/80 border border-slate-200/80 px-3 py-2 rounded-lg"
                      >
                        <LuCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span className="truncate">{tool}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-8 flex flex-wrap items-center gap-3">
                <Link
                  href={activeStudio.href}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#3bb1df] hover:bg-[#2aa3d2] text-white font-bold text-sm shadow transition"
                >
                  <span>Open {activeStudio.name}</span>
                  <LuArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/app"
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-semibold text-sm transition"
                >
                  <span>Workspace Overview</span>
                  <LuExternalLink className="w-4 h-4 text-slate-400" />
                </Link>
              </div>
            </div>

            {/* Right Column: Distinct Studio Image Display */}
            <div className="lg:col-span-6 bg-slate-50 p-6 sm:p-8 flex flex-col justify-center items-center">
              <div className="relative w-full aspect-video rounded-2xl border border-slate-200 overflow-hidden shadow-md bg-white">
                <Image
                  src={activeStudio.image}
                  alt={`${activeStudio.name} Interface`}
                  fill
                  className="object-cover object-top hover:scale-102 transition duration-300"
                  sizes="(max-width: 768px) 100vw, 50vw"
                  unoptimized={activeStudio.image.startsWith("http")}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent pointer-events-none" />
                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs text-white">
                  <span className="font-semibold bg-slate-900/80 px-2.5 py-1 rounded backdrop-blur-xs">
                    Production Studio Engine
                  </span>
                  <Link
                    href={activeStudio.href}
                    className="flex items-center gap-1 bg-[#3bb1df] hover:bg-[#2aa3d2] text-white font-bold px-3 py-1 rounded transition shadow-xs"
                  >
                    <span>Launch</span>
                    <LuArrowUpRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between w-full text-xs text-slate-500 px-1 font-mono">
                <span className="flex items-center gap-1">
                  <LuCpu className="w-3.5 h-3.5 text-indigo-500" />
                  Hardware Accelerated
                </span>
                <span>Zero Telemetry</span>
                <span>Sub-150ms Processing</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 9 STUDIOS BENTO GRID */}
      <section className="relative z-10 py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-10">
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Explore All 9 Studios at a Glance
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            Each studio runs natively in your browser with dedicated specialized toolchains.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {STUDIOS_DATA.map((s) => {
            const Icon = s.icon;
            return (
              <div
                key={s.id}
                className="group p-6 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200/90 hover:border-indigo-300 shadow-xs hover:shadow-md transition flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center font-bold"
                      style={{ backgroundColor: `${s.colorHex}15`, color: s.colorHex }}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                      {s.badge}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 group-hover:text-[#3bb1df] transition">
                    {s.name}
                  </h3>
                  <p className="text-xs text-slate-600 mt-2 line-clamp-2 leading-relaxed">
                    {s.desc}
                  </p>
                </div>

                <div className="pt-6 mt-4 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] text-slate-500 font-mono">
                    {s.keyTools.length} Featured Tools
                  </span>
                  <Link
                    href={s.href}
                    className="inline-flex items-center gap-1 text-xs font-bold text-[#3bb1df] hover:text-[#2aa3d2] transition"
                  >
                    <span>Launch Studio</span>
                    <LuChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* LIVE TOOLS DIRECTORY & INSTANT SEARCH */}
      <section id="tools" className="relative z-10 py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="border-t border-slate-200 pt-16">
          <div className="text-center max-w-3xl mx-auto mb-8">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200/80 text-xs font-bold text-[#3bb1df] mb-3">
              <LuSearch className="w-3.5 h-3.5" />
              <span>SEARCH 40+ TOOLS</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              All Tools Directory
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              Search by tool name, file extension, or action (e.g. merge, compress, watermark, ocr, background, qr). Press <kbd className="px-1.5 py-0.5 rounded bg-slate-100 border border-slate-300 text-[10px] font-mono text-slate-700">Ctrl + K</kbd> to focus anytime.
            </p>
          </div>

          {/* Search Box & Category Filter */}
          <div className="max-w-3xl mx-auto mb-8 space-y-4">
            <div className="relative">
              <LuSearch className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search any online tool (e.g., merge pdf, compress, background cutout, ocr text)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-20 py-3.5 bg-white border border-slate-200 rounded-2xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#3bb1df] focus:ring-2 focus:ring-[#3bb1df]/20 shadow-xs transition"
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                {searchQuery ? (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="text-xs text-slate-400 hover:text-slate-700 px-1"
                  >
                    Clear
                  </button>
                ) : (
                  <span className="hidden sm:inline text-[10px] font-mono text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                    ⌘K
                  </span>
                )}
              </div>
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none justify-start sm:justify-center">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition border ${
                    selectedCategory === cat
                      ? "bg-[#3bb1df] text-white border-[#3bb1df] shadow-xs"
                      : "bg-white text-slate-600 hover:text-slate-900 border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Tools Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTools.slice(0, 18).map((tool) => (
              <div
                key={tool.id}
                className="p-5 rounded-2xl bg-white border border-slate-200/90 hover:border-indigo-300 hover:shadow-md transition flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                      {tool.studioName}
                    </span>
                    <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/60">
                      {tool.tier}
                    </span>
                  </div>
                  <h4 className="text-base font-bold text-slate-900 tracking-tight">
                    {tool.name}
                  </h4>
                  <p className="text-xs text-slate-600 mt-1 line-clamp-2 leading-relaxed">
                    {tool.description}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[10px] font-mono text-slate-500">
                    Format: {tool.inputFormat.split(",")[0] || "Universal"}
                  </span>
                  <Link
                    href={tool.studioHref}
                    className="inline-flex items-center gap-1 text-xs font-bold text-[#3bb1df] hover:text-[#2aa3d2] transition"
                  >
                    <span>Use Tool</span>
                    <LuArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {filteredTools.length > 18 && (
            <div className="mt-8 text-center">
              <Link
                href="/app"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 shadow-xs transition"
              >
                <span>View All {filteredTools.length} Tools in Workspace</span>
                <LuArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* WHY XSW TOOLS (Light-Theme Comparison) */}
      <section className="relative z-10 py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="border-t border-slate-200 pt-16">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Why Consolidate on XSW Tools?
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              Compare the fragmented cost of buying isolated SaaS apps against our unified studio.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {/* Fragmented Subscriptions */}
            <div className="p-7 rounded-3xl bg-white border border-rose-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold font-mono uppercase tracking-wider text-rose-600">
                  Fragmented Subscriptions
                </span>
                <span className="text-sm font-bold text-rose-600">~$90 / month</span>
              </div>
              <ul className="space-y-2.5 text-xs sm:text-sm text-slate-600">
                <li className="flex items-center gap-2">
                  <span className="text-rose-500 font-bold">&times;</span>
                  <span>Adobe Acrobat Pro: $23.99/mo for PDF operations</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-rose-500 font-bold">&times;</span>
                  <span>Remove.bg: $9.00/mo for basic background cutouts</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-rose-500 font-bold">&times;</span>
                  <span>ChatPDF / AI Reader: $15.00/mo for document analysis</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-rose-500 font-bold">&times;</span>
                  <span>DocuSign: $10.00/mo for basic e-signatures</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-rose-500 font-bold">&times;</span>
                  <span>Ahrefs / Semrush Lite: $29.00/mo for keyword search data</span>
                </li>
              </ul>
            </div>

            {/* XSW Tools Unified Studio */}
            <div className="p-7 rounded-3xl bg-indigo-50/70 border-2 border-[#3bb1df] shadow-md space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold font-mono uppercase tracking-wider text-[#3bb1df]">
                  XSW Tools
                </span>
                <span className="text-sm font-extrabold text-[#3bb1df]">₹299 / month (~$3.5)</span>
              </div>
              <ul className="space-y-2.5 text-xs sm:text-sm text-slate-800 font-medium">
                <li className="flex items-center gap-2">
                  <LuCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>All 9 Studios unified under 1 single login</span>
                </li>
                <li className="flex items-center gap-2">
                  <LuCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Zero telemetry client-side processing</span>
                </li>
                <li className="flex items-center gap-2">
                  <LuCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>40+ production tools with unlimited conversions</span>
                </li>
                <li className="flex items-center gap-2">
                  <LuCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>25 GB cloud storage &amp; priority compute queue</span>
                </li>
                <li className="flex items-center gap-2">
                  <LuCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Save over 90% in monthly software overhead</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ARCHITECTURE & PRIVACY SECTION */}
      <section id="architecture" className="relative z-10 py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="border-t border-slate-200 pt-16">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200/80 text-xs font-bold text-[#3bb1df] mb-3">
              <LuLock className="w-3.5 h-3.5" />
              <span>PRIVACY &amp; SPEED</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Enterprise Grade Privacy &amp; Sub-150ms Speed
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              Built on WebAssembly and modern zero-telemetry architectures.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-7 rounded-2xl bg-white border border-slate-200 shadow-xs">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-[#3bb1df] mb-4">
                <LuZap className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Sub-150ms Execution</h3>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                Client-side WASM engine processes PDF restructuring, image compressions, and QR renderings right on your device for instant results.
              </p>
            </div>

            <div className="p-7 rounded-2xl bg-white border border-slate-200 shadow-xs">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 mb-4">
                <LuLock className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Zero Model Training</h3>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                Your confidential documents and uploaded images are never stored or used to train third-party AI models. Scratch queues auto-purge within 24 hours.
              </p>
            </div>

            <div className="p-7 rounded-2xl bg-white border border-slate-200 shadow-xs">
              <div className="w-10 h-10 rounded-xl bg-sky-50 border border-sky-200 flex items-center justify-center text-sky-600 mb-4">
                <LuDatabase className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Interconnected Studio State</h3>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                Send an output file from PDF Studio directly into AI Document Summarizer, or from Background Studio into Office Slide Builder with one click.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* PRICING SECTION (₹299/mo Pro and ₹0 Free) */}
      <section id="pricing" className="relative z-10 py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="border-t border-slate-200 pt-16">
          <div className="text-center max-w-3xl mx-auto mb-10">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-xs font-bold text-amber-800 mb-3">
              <LuCrown className="w-3.5 h-3.5 text-amber-500" />
              <span>TRANSPARENT PRICING</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
              Simple, Honest Pricing
            </h2>
            <p className="mt-3 text-sm sm:text-base text-slate-600">
              Start free forever with ₹0, or unlock unlimited potential with Pro for ₹299/month.
            </p>

            {/* Billing Cycle Toggle */}
            <div className="pt-6 flex items-center justify-center gap-2">
              <div className="inline-flex p-1 bg-white rounded-2xl border border-slate-200 shadow-xs text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setBillingCycle("monthly")}
                  className={`px-4 py-2 rounded-xl transition ${
                    billingCycle === "monthly"
                      ? "bg-[#3bb1df] text-white shadow-xs font-bold"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  Monthly
                </button>
                <button
                  type="button"
                  onClick={() => setBillingCycle("yearly")}
                  className={`px-4 py-2 rounded-xl transition flex items-center gap-1.5 ${
                    billingCycle === "yearly"
                      ? "bg-[#3bb1df] text-white shadow-xs font-bold"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <span>Yearly</span>
                  <span className="bg-amber-400 text-amber-950 text-[10px] px-1.5 py-0.2 rounded font-extrabold">
                    SAVE 30%
                  </span>
                </button>
              </div>
            </div>
          </div>

          {/* Pricing Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto items-stretch">
            {/* FREE PLAN */}
            <div className="p-8 rounded-3xl bg-white border border-slate-200/90 shadow-sm hover:shadow-md transition flex flex-col justify-between">
              <div className="space-y-6">
                <div>
                  <span className="text-xs font-mono uppercase tracking-wider text-slate-500 font-bold">
                    Free Forever
                  </span>
                  <div className="flex items-baseline gap-1 mt-2">
                    <span className="text-5xl font-black text-slate-900 tracking-tight">₹0</span>
                    <span className="text-sm text-slate-500 font-medium">/ month</span>
                  </div>
                  <p className="text-xs text-slate-600 mt-2">
                    Everything you need to test all 9 studios and execute everyday document workflows without entering a card.
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-100 space-y-3 text-xs sm:text-sm text-slate-700">
                  <div className="flex items-center gap-2.5">
                    <LuCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Access to all 9 Studio interfaces</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <LuCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>5 Free AI Document Analysis Credits</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <LuCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>5 Free Background Matting Credits</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <LuCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>20 High-Resolution Vector QR Codes</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <LuCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>1 GB Secure Cloud Storage</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <LuCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Max 25 MB file size limit</span>
                  </div>
                </div>
              </div>

              <div className="pt-8">
                <Link
                  href={isAuthenticated ? "/app" : "/signup"}
                  className="w-full py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-900 font-bold rounded-xl text-sm transition flex items-center justify-center gap-2"
                >
                  <span>{isAuthenticated ? "Go to Workspace" : "Start Free Workspace"}</span>
                  <LuArrowRight className="w-4 h-4" />
                </Link>
                <p className="text-[11px] text-center text-slate-400 mt-2">
                  No credit card required &bull; Instant activation
                </p>
              </div>
            </div>

            {/* PRO PLAN (₹299/mo) */}
            <div className="p-8 rounded-3xl bg-white border-2 border-[#3bb1df] shadow-xl flex flex-col justify-between relative overflow-hidden">
              <div className="absolute top-4 right-4">
                <span className="px-3 py-1 rounded-full bg-[#3bb1df] text-white text-xs font-black uppercase tracking-wider">
                  Recommended
                </span>
              </div>

              <div className="space-y-6">
                <div>
                  <span className="text-xs font-mono uppercase tracking-wider text-[#3bb1df] font-bold">
                    Pro Studio Suite
                  </span>
                  <div className="flex items-baseline gap-1 mt-2">
                    <span className="text-5xl font-black text-slate-900 tracking-tight">
                      ₹{billingCycle === "yearly" ? 208 : 299}
                    </span>
                    <span className="text-sm text-slate-500 font-medium">/ month</span>
                  </div>
                  <div className="text-xs text-[#3bb1df] mt-1 font-mono font-semibold">
                    {billingCycle === "yearly" ? "Billed annually at ₹2,499 / year" : "Billed monthly at ₹299"}
                  </div>
                  <p className="text-xs text-slate-600 mt-2">
                    Unrestricted capability for professionals, businesses, and creators needing high volume and fast queues.
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-100 space-y-3 text-xs sm:text-sm text-slate-800">
                  <div className="flex items-center gap-2.5">
                    <LuCheck className="w-4 h-4 text-[#3bb1df] shrink-0" />
                    <span className="font-bold text-slate-900">Priority Compute Processing Queue</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <LuCheck className="w-4 h-4 text-[#3bb1df] shrink-0" />
                    <span>75 Monthly AI Document Intelligence Credits</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <LuCheck className="w-4 h-4 text-[#3bb1df] shrink-0" />
                    <span>75 Monthly AI Background Matting Credits</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <LuCheck className="w-4 h-4 text-[#3bb1df] shrink-0" />
                    <span>500 Dynamic Custom QR Codes &amp; Analytics</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <LuCheck className="w-4 h-4 text-[#3bb1df] shrink-0" />
                    <span>25 GB Cloud Storage &amp; 30-Day File Retention</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <LuCheck className="w-4 h-4 text-[#3bb1df] shrink-0" />
                    <span>100 MB Max File Upload Limit</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <LuCheck className="w-4 h-4 text-[#3bb1df] shrink-0" />
                    <span>Unlimited PDF &amp; Document Format Conversions</span>
                  </div>
                </div>
              </div>

              <div className="pt-8">
                <Link
                  href="/app"
                  className="w-full py-3.5 bg-[#3bb1df] hover:bg-[#2aa3d2] text-white font-extrabold rounded-xl text-sm transition shadow-md shadow-indigo-500/20 flex items-center justify-center gap-2 active:scale-[0.98]"
                >
                  <span>Upgrade to Pro — ₹299/mo</span>
                  <LuArrowRight className="w-4 h-4" />
                </Link>
                <p className="text-[11px] text-center text-slate-400 mt-2">
                  Instant activation &bull; Cancel anytime with 1 click
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FREQUENTLY ASKED QUESTIONS */}
      <section id="faq" className="relative z-10 py-16 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
        <div className="border-t border-slate-200 pt-16">
          <div className="text-center max-w-3xl mx-auto mb-10">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200/80 text-xs font-bold text-[#3bb1df] mb-3">
              <LuCircleHelp className="w-3.5 h-3.5" />
              <span>FREQUENT QUESTIONS</span>
            </div>
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-4">
            <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-2xs">
              <h4 className="text-base font-bold text-slate-900">
                How does XSW Tools compare to standalone tools like 10015.io or Adobe?
              </h4>
              <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
                Unlike simple static utility pages, XSW Tools integrates 9 full-fledged software studios into a synchronized, cloud-synced workspace. You get persistent file queues, AI-assisted summaries, neural background matting, e-signatures, and cross-studio pipelines for just ₹299/month.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-2xs">
              <h4 className="text-base font-bold text-slate-900">
                Is the Free tier truly free forever?
              </h4>
              <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
                Yes, our Free plan costs ₹0 forever. It gives you immediate access to all 9 studio interfaces, 5 free AI document operations, 5 background matting cutouts, 20 vector QR codes, and 1 GB cloud storage without requiring a credit card.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-2xs">
              <h4 className="text-base font-bold text-slate-900">
                Are my confidential business files safe and protected?
              </h4>
              <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
                100%. We employ zero-telemetry architectures and AES-256 cryptographic standards. Scratch files generated during tool sessions are strictly held in private, ephemeral containers and automatically destroyed after your session finishes or after 24 hours.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-2xs">
              <h4 className="text-base font-bold text-slate-900">
                Where is the main studio workspace located?
              </h4>
              <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
                The full workspace is available at <code className="text-[#3bb1df] font-mono font-semibold">/app</code>. Once inside, you can access your recent jobs, inspect available quotas, search 40+ tools with Ctrl+K, and run all 9 studios.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FINAL CALL TO ACTION */}
      <section className="relative z-10 py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="rounded-3xl border border-slate-200 bg-white p-8 sm:p-14 text-center shadow-lg">
          <div className="max-w-2xl mx-auto space-y-4">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Start Building with 40+ Online Tools Today
            </h2>
            <p className="text-sm sm:text-base text-slate-600">
              Zero software setup, instant in-browser execution, and complete workflow consolidation.
            </p>
            <div className="pt-4 flex flex-wrap items-center justify-center gap-4">
              {isAuthenticated ? (
                <Link
                  href="/app"
                  className="px-8 py-3.5 rounded-xl bg-[#3bb1df] hover:bg-[#2aa3d2] text-white font-extrabold text-sm shadow-md transition flex items-center gap-2 active:scale-[0.98]"
                >
                  <span>Launch Studio Workspace</span>
                  <LuArrowRight className="w-4 h-4" />
                </Link>
              ) : (
                <>
                  <Link
                    href="/signup"
                    className="px-8 py-3.5 rounded-xl bg-[#3bb1df] hover:bg-[#2aa3d2] text-white font-extrabold text-sm shadow-md transition flex items-center gap-2 active:scale-[0.98]"
                  >
                    <span>Get Started Free</span>
                    <LuArrowRight className="w-4 h-4" />
                  </Link>
                  <Link
                    href="/login"
                    className="px-6 py-3.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-sm transition"
                  >
                    Sign In to Account
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER & OFFICIAL ALIVE CHANNELS */}
      <footer className="relative z-10 border-t border-slate-200 bg-white py-12 px-4 sm:px-6 lg:px-8 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-8 mb-10">
          <div className="col-span-2">
            <Link href="/" className="inline-flex items-center gap-2.5 mb-3 group">
              <div className="w-9 h-9 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center p-1.5 shrink-0 group-hover:scale-105 transition-transform">
                <img
                  src="/brand/xswtools_logo.png"
                  alt="xswtools"
                  className="w-full h-full object-contain"
                />
              </div>
              <span className="font-black text-xl text-slate-900 tracking-tight">
                xsw<span className="text-[#3bb1df]">tools</span>
              </span>
            </Link>
            <p className="text-xs text-slate-600 max-w-sm leading-relaxed">
              Every tool you need in one workspace. Fast, privacy-first, zero-install processing across 9 production studios and 40+ digital utilities.
            </p>
            <div className="mt-4 text-[11px] text-slate-400">
              &copy; {new Date().getFullYear()} xswtools. All rights reserved.
            </div>
          </div>

          <div>
            <h5 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] mb-3">
              Document Studios
            </h5>
            <ul className="space-y-2">
              <li>
                <Link href="/app/studios/pdf" className="hover:text-[#3bb1df] transition">
                  PDF Studio
                </Link>
              </li>
              <li>
                <Link href="/app/studios/ai-document" className="hover:text-[#3bb1df] transition">
                  AI Document Studio
                </Link>
              </li>
              <li>
                <Link href="/app/studios/document-hub" className="hover:text-[#3bb1df] transition">
                  Document Hub
                </Link>
              </li>
              <li>
                <Link href="/app/studios/security" className="hover:text-[#3bb1df] transition">
                  Security &amp; E-Sign
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h5 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] mb-3">
              Media &amp; SEO Studios
            </h5>
            <ul className="space-y-2">
              <li>
                <Link href="/app/studios/background" className="hover:text-[#3bb1df] transition">
                  Background Studio
                </Link>
              </li>
              <li>
                <Link href="/app/studios/office" className="hover:text-[#3bb1df] transition">
                  Office Studio
                </Link>
              </li>
              <li>
                <Link href="/app/studios/compress" className="hover:text-[#3bb1df] transition">
                  Compress &amp; Enhance
                </Link>
              </li>
              <li>
                <Link href="/app/studios/qr-link" className="hover:text-[#3bb1df] transition">
                  QR &amp; Link Studio
                </Link>
              </li>
              <li>
                <Link href="/app/studios/trendrank" className="hover:text-[#3bb1df] transition">
                  TrendRank AI
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h5 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] mb-3">
              Company &amp; Legal
            </h5>
            <ul className="space-y-2">
              <li>
                <Link href="/privacy" className="hover:text-[#3bb1df] font-semibold text-slate-700 transition">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-[#3bb1df] font-semibold text-slate-700 transition">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link href="/app/help" className="hover:text-[#3bb1df] transition">
                  Help Center &amp; Docs
                </Link>
              </li>
              <li>
                <Link href="/app" className="hover:text-[#3bb1df] transition">
                  Workspace Dashboard
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-[#3bb1df] transition">
                  User Sign In
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* ALIVE SOCIAL & PLATFORM ACCOUNTS BAR UNDERNEATH THE FOOTER */}
        <div className="max-w-7xl mx-auto pt-8 border-t border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider font-mono">
              Live Channels:
            </span>
            <div className="flex items-center gap-2">
              <a
                href="https://x.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="XSW Tools on X"
                className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-[#3bb1df] hover:text-white text-slate-700 flex items-center justify-center transition shadow-2xs"
              >
                <FaXTwitter className="w-3.5 h-3.5" />
              </a>
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="XSW Tools on GitHub"
                className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-900 hover:text-white text-slate-700 flex items-center justify-center transition shadow-2xs"
              >
                <FaGithub className="w-3.5 h-3.5" />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="XSW Tools on LinkedIn"
                className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-[#0077b5] hover:text-white text-slate-700 flex items-center justify-center transition shadow-2xs"
              >
                <FaLinkedinIn className="w-3.5 h-3.5" />
              </a>
              <a
                href="https://discord.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="XSW Tools Discord Community"
                className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-[#5865f2] hover:text-white text-slate-700 flex items-center justify-center transition shadow-2xs"
              >
                <FaDiscord className="w-3.5 h-3.5" />
              </a>
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="XSW Tools on YouTube"
                className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-[#ff0000] hover:text-white text-slate-700 flex items-center justify-center transition shadow-2xs"
              >
                <FaYoutube className="w-3.5 h-3.5" />
              </a>
              <a
                href="mailto:support@xspaceweb.com"
                aria-label="Email Support"
                className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-emerald-600 hover:text-white text-slate-700 flex items-center justify-center transition shadow-2xs"
              >
                <LuMail className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              All Production Engines Active
            </span>
            <span>&bull;</span>
            <span>AES-256 SSL Verified</span>
            <span>&bull;</span>
            <Link href="/app/help" className="hover:text-slate-900 transition">
              Status &amp; Uptime
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
