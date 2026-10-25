"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { EchoToolTester } from "./EchoToolTester";
import {
  LuSearch,
  LuSparkles,
  LuZap,
  LuFileText,
  LuImage,
  LuQrCode,
  LuShieldCheck,
  LuTable,
  LuLayers,
  LuTrendingUp,
  LuArrowUpRight,
  LuTerminal,
  LuSlidersHorizontal,
  LuCheck,
} from "react-icons/lu";

interface ToolItem {
  id: string;
  name: string;
  description: string;
  studioId: string;
  studioName: string;
  category: "pdf" | "ai-doc" | "background" | "security" | "qr" | "office" | "compress" | "trendrank";
  badge: string;
  badgeBg: string;
  iconBg: string;
  flare: string;
  borderHover: string;
  href: string;
  tier: "Free" | "Pro" | "Neural AI";
}

const ALL_STUDIO_TOOLS: ToolItem[] = [
  // PDF Studio (Convert)
  {
    id: "pdf-to-word",
    name: "PDF to Word",
    description: "Convert PDF documents to editable Microsoft Word (.docx) files preserving formatting.",
    studioId: "pdf",
    studioName: "PDF Studio",
    category: "pdf",
    badge: "W",
    badgeBg: "bg-blue-600",
    iconBg: "bg-blue-600",
    flare: "from-blue-500/20 to-transparent",
    borderHover: "hover:border-blue-400",
    href: "/app/studios/pdf",
    tier: "Free",
  },
  {
    id: "word-to-pdf",
    name: "Word to PDF",
    description: "Transform Word (.docx) files into clean, professional PDF documents instantly.",
    studioId: "pdf",
    studioName: "PDF Studio",
    category: "pdf",
    badge: "PDF",
    badgeBg: "bg-red-600",
    iconBg: "bg-red-600",
    flare: "from-red-500/20 to-transparent",
    borderHover: "hover:border-red-400",
    href: "/app/studios/pdf",
    tier: "Free",
  },
  {
    id: "pdf-to-excel",
    name: "PDF to Excel",
    description: "Extract spreadsheet tables and numbers from PDF into editable XLSX sheets.",
    studioId: "pdf",
    studioName: "PDF Studio",
    category: "pdf",
    badge: "X",
    badgeBg: "bg-emerald-600",
    iconBg: "bg-emerald-600",
    flare: "from-emerald-500/20 to-transparent",
    borderHover: "hover:border-emerald-400",
    href: "/app/studios/pdf",
    tier: "Free",
  },
  {
    id: "excel-to-pdf",
    name: "Excel to PDF",
    description: "Render complex workbooks, charts, and financial tables into standard PDF format.",
    studioId: "pdf",
    studioName: "PDF Studio",
    category: "pdf",
    badge: "PDF",
    badgeBg: "bg-emerald-700",
    iconBg: "bg-emerald-700",
    flare: "from-emerald-500/20 to-transparent",
    borderHover: "hover:border-emerald-400",
    href: "/app/studios/pdf",
    tier: "Free",
  },
  {
    id: "pdf-to-ppt",
    name: "PDF to PPT",
    description: "Convert presentation slides from PDF to editable Microsoft PowerPoint (.pptx).",
    studioId: "pdf",
    studioName: "PDF Studio",
    category: "pdf",
    badge: "P",
    badgeBg: "bg-amber-600",
    iconBg: "bg-amber-600",
    flare: "from-amber-500/20 to-transparent",
    borderHover: "hover:border-amber-400",
    href: "/app/studios/pdf",
    tier: "Free",
  },
  {
    id: "ppt-to-pdf",
    name: "PPT to PDF",
    description: "Convert pitch decks and lecture slides into universal PDF documents.",
    studioId: "pdf",
    studioName: "PDF Studio",
    category: "pdf",
    badge: "PDF",
    badgeBg: "bg-amber-700",
    iconBg: "bg-amber-700",
    flare: "from-amber-500/20 to-transparent",
    borderHover: "hover:border-amber-400",
    href: "/app/studios/pdf",
    tier: "Free",
  },
  {
    id: "pdf-to-images",
    name: "PDF to Images",
    description: "Export each page of your PDF into high-res JPG or lossless PNG images.",
    studioId: "pdf",
    studioName: "PDF Studio",
    category: "pdf",
    badge: "IMG",
    badgeBg: "bg-purple-600",
    iconBg: "bg-purple-600",
    flare: "from-purple-500/20 to-transparent",
    borderHover: "hover:border-purple-400",
    href: "/app/studios/pdf",
    tier: "Free",
  },
  {
    id: "images-to-pdf",
    name: "Images to PDF",
    description: "Combine multiple photos, screenshots, and scans into a single consolidated PDF.",
    studioId: "pdf",
    studioName: "PDF Studio",
    category: "pdf",
    badge: "PDF",
    badgeBg: "bg-rose-600",
    iconBg: "bg-rose-600",
    flare: "from-rose-500/20 to-transparent",
    borderHover: "hover:border-rose-400",
    href: "/app/studios/pdf",
    tier: "Free",
  },

  // PDF Studio (Edit & Organize)
  {
    id: "edit-pdf",
    name: "Full PDF Editor",
    description: "Direct visual page editor to add text annotations, shapes, drawings, and highlights.",
    studioId: "pdf",
    studioName: "PDF Studio",
    category: "pdf",
    badge: "EDIT",
    badgeBg: "bg-red-600",
    iconBg: "bg-red-600",
    flare: "from-red-500/20 to-transparent",
    borderHover: "hover:border-red-400",
    href: "/app/studios/pdf",
    tier: "Free",
  },
  {
    id: "merge-pdf",
    name: "Merge PDF",
    description: "Combine multiple PDF documents into a unified file with drag & drop page ordering.",
    studioId: "pdf",
    studioName: "PDF Studio",
    category: "pdf",
    badge: "MRG",
    badgeBg: "bg-indigo-600",
    iconBg: "bg-indigo-600",
    flare: "from-indigo-500/20 to-transparent",
    borderHover: "hover:border-indigo-400",
    href: "/app/studios/pdf",
    tier: "Free",
  },
  {
    id: "split-pdf",
    name: "Split & Extract Pages",
    description: "Separate pages into standalone files or extract custom page ranges with 1 click.",
    studioId: "pdf",
    studioName: "PDF Studio",
    category: "pdf",
    badge: "SPL",
    badgeBg: "bg-sky-600",
    iconBg: "bg-sky-600",
    flare: "from-sky-500/20 to-transparent",
    borderHover: "hover:border-sky-400",
    href: "/app/studios/pdf",
    tier: "Free",
  },
  {
    id: "compress-pdf",
    name: "Compress PDF",
    description: "Reduce file sizes up to 80% while preserving crisp typography and vector imagery.",
    studioId: "pdf",
    studioName: "PDF Studio",
    category: "pdf",
    badge: "ZIP",
    badgeBg: "bg-purple-600",
    iconBg: "bg-purple-600",
    flare: "from-purple-500/20 to-transparent",
    borderHover: "hover:border-purple-400",
    href: "/app/studios/pdf",
    tier: "Free",
  },
  {
    id: "watermark-pdf",
    name: "Add Watermark",
    description: "Stamp customized text or image watermarks across every page with opacity controls.",
    studioId: "pdf",
    studioName: "PDF Studio",
    category: "pdf",
    badge: "WTR",
    badgeBg: "bg-amber-600",
    iconBg: "bg-amber-600",
    flare: "from-amber-500/20 to-transparent",
    borderHover: "hover:border-amber-400",
    href: "/app/studios/pdf",
    tier: "Free",
  },

  // AI Document Studio
  {
    id: "ai-doc-chat",
    name: "AI Document Chat & Q&A",
    description: "Chat with multi-page PDFs, ask complex questions, and cite referenced source pages.",
    studioId: "ai-doc",
    studioName: "AI Document Studio",
    category: "ai-doc",
    badge: "AI",
    badgeBg: "bg-indigo-600",
    iconBg: "bg-indigo-600",
    flare: "from-indigo-500/20 to-transparent",
    borderHover: "hover:border-indigo-400",
    href: "/app/studios/ai-document",
    tier: "Neural AI",
  },
  {
    id: "ai-doc-summary",
    name: "Executive Summary Generator",
    description: "Condense 100+ page contracts and research papers into crisp executive bullet points.",
    studioId: "ai-doc",
    studioName: "AI Document Studio",
    category: "ai-doc",
    badge: "SUM",
    badgeBg: "bg-blue-600",
    iconBg: "bg-blue-600",
    flare: "from-blue-500/20 to-transparent",
    borderHover: "hover:border-blue-400",
    href: "/app/studios/ai-document",
    tier: "Neural AI",
  },
  {
    id: "ai-doc-actions",
    name: "Action Items & Tasks Extractor",
    description: "Automatically parse deliverables, deadlines, assignees, and key milestones.",
    studioId: "ai-doc",
    studioName: "AI Document Studio",
    category: "ai-doc",
    badge: "ACT",
    badgeBg: "bg-violet-600",
    iconBg: "bg-violet-600",
    flare: "from-violet-500/20 to-transparent",
    borderHover: "hover:border-violet-400",
    href: "/app/studios/ai-document",
    tier: "Neural AI",
  },
  {
    id: "ai-doc-risk",
    name: "Contract Risk & Clause Scanner",
    description: "Highlight indemnities, liability traps, termination penalties, and unusual terms.",
    studioId: "ai-doc",
    studioName: "AI Document Studio",
    category: "ai-doc",
    badge: "RSK",
    badgeBg: "bg-rose-600",
    iconBg: "bg-rose-600",
    flare: "from-rose-500/20 to-transparent",
    borderHover: "hover:border-rose-400",
    href: "/app/studios/ai-document",
    tier: "Pro",
  },
  {
    id: "ai-doc-translate",
    name: "Multilingual Document Translator",
    description: "Translate entire documents across 50+ languages maintaining original document layout.",
    studioId: "ai-doc",
    studioName: "AI Document Studio",
    category: "ai-doc",
    badge: "TRN",
    badgeBg: "bg-cyan-600",
    iconBg: "bg-cyan-600",
    flare: "from-cyan-500/20 to-transparent",
    borderHover: "hover:border-cyan-400",
    href: "/app/studios/ai-document",
    tier: "Pro",
  },

  // Background Studio
  {
    id: "bg-remover",
    name: "AI Background Remover",
    description: "Sub-second client-side neural matting to extract subjects with hair-level alpha precision.",
    studioId: "background",
    studioName: "Background Studio",
    category: "background",
    badge: "BG",
    badgeBg: "bg-blue-600",
    iconBg: "bg-blue-600",
    flare: "from-blue-500/20 to-transparent",
    borderHover: "hover:border-blue-400",
    href: "/app/studios/background",
    tier: "Neural AI",
  },
  {
    id: "bg-product",
    name: "Product Showcase Studio",
    description: "Position catalog products onto realistic studio pedestals with soft shadows.",
    studioId: "background",
    studioName: "Background Studio",
    category: "background",
    badge: "PRD",
    badgeBg: "bg-indigo-600",
    iconBg: "bg-indigo-600",
    flare: "from-indigo-500/20 to-transparent",
    borderHover: "hover:border-indigo-400",
    href: "/app/studios/background",
    tier: "Pro",
  },
  {
    id: "bg-passport",
    name: "Passport & Visa Photo Maker",
    description: "Format compliant biometric passport photos for US, UK, Schengen, and India standards.",
    studioId: "background",
    studioName: "Background Studio",
    category: "background",
    badge: "ID",
    badgeBg: "bg-teal-600",
    iconBg: "bg-teal-600",
    flare: "from-teal-500/20 to-transparent",
    borderHover: "hover:border-teal-400",
    href: "/app/studios/background",
    tier: "Free",
  },
  {
    id: "bg-signature",
    name: "Signature & Stamp Extractor",
    description: "Extract handwritten signatures or corporate ink stamps cleanly onto transparent PNGs.",
    studioId: "background",
    studioName: "Background Studio",
    category: "background",
    badge: "SIG",
    badgeBg: "bg-purple-600",
    iconBg: "bg-purple-600",
    flare: "from-purple-500/20 to-transparent",
    borderHover: "hover:border-purple-400",
    href: "/app/studios/background",
    tier: "Free",
  },
  {
    id: "bg-batch",
    name: "Batch Queue Processing",
    description: "Queue up to 100 images simultaneously for unattended background removal and export.",
    studioId: "background",
    studioName: "Background Studio",
    category: "background",
    badge: "BAT",
    badgeBg: "bg-blue-700",
    iconBg: "bg-blue-700",
    flare: "from-blue-500/20 to-transparent",
    borderHover: "hover:border-blue-400",
    href: "/app/studios/background",
    tier: "Pro",
  },

  // Security & E-Signature
  {
    id: "sec-sign",
    name: "Digital Signature Studio",
    description: "Sign contracts with draw, type, or saved signature certificates and cryptographic hashes.",
    studioId: "security",
    studioName: "Security Studio",
    category: "security",
    badge: "SEC",
    badgeBg: "bg-emerald-600",
    iconBg: "bg-emerald-600",
    flare: "from-emerald-500/20 to-transparent",
    borderHover: "hover:border-emerald-400",
    href: "/app/studios/security",
    tier: "Free",
  },
  {
    id: "sec-encrypt",
    name: "Password Encrypt PDF",
    description: "Lock PDF documents with AES-256 military-grade encryption and permission flags.",
    studioId: "security",
    studioName: "Security Studio",
    category: "security",
    badge: "LCK",
    badgeBg: "bg-emerald-700",
    iconBg: "bg-emerald-700",
    flare: "from-emerald-500/20 to-transparent",
    borderHover: "hover:border-emerald-400",
    href: "/app/studios/security",
    tier: "Free",
  },
  {
    id: "sec-redact",
    name: "Sanitize & Redact PII",
    description: "Black out and permanently scrub sensitive credentials, phone numbers, and SSNs.",
    studioId: "security",
    studioName: "Security Studio",
    category: "security",
    badge: "RDX",
    badgeBg: "bg-amber-600",
    iconBg: "bg-amber-600",
    flare: "from-amber-500/20 to-transparent",
    borderHover: "hover:border-amber-400",
    href: "/app/studios/security",
    tier: "Pro",
  },

  // QR & Link Studio
  {
    id: "qr-url",
    name: "Dynamic Branded QR Code",
    description: "Generate stylish vector QR codes with embedded center logos, dot patterns, and gradients.",
    studioId: "qr",
    studioName: "QR & Link Studio",
    category: "qr",
    badge: "QR",
    badgeBg: "bg-pink-600",
    iconBg: "bg-pink-600",
    flare: "from-pink-500/20 to-transparent",
    borderHover: "hover:border-pink-400",
    href: "/app/studios/qr",
    tier: "Free",
  },
  {
    id: "qr-wifi",
    name: "Instant WiFi Connect QR",
    description: "Create quick-scan QR codes for guests to connect to secure WPA2/WPA3 networks.",
    studioId: "qr",
    studioName: "QR & Link Studio",
    category: "qr",
    badge: "WFI",
    badgeBg: "bg-rose-600",
    iconBg: "bg-rose-600",
    flare: "from-rose-500/20 to-transparent",
    borderHover: "hover:border-rose-400",
    href: "/app/studios/qr",
    tier: "Free",
  },
  {
    id: "qr-vcard",
    name: "Digital Business Card (vCard)",
    description: "Share phone, email, and social profiles instantly with a scannable contact card.",
    studioId: "qr",
    studioName: "QR & Link Studio",
    category: "qr",
    badge: "VCD",
    badgeBg: "bg-fuchsia-600",
    iconBg: "bg-fuchsia-600",
    flare: "from-fuchsia-500/20 to-transparent",
    borderHover: "hover:border-fuchsia-400",
    href: "/app/studios/qr",
    tier: "Free",
  },

  // Office & Compression
  {
    id: "office-csv-xlsx",
    name: "CSV to Formatted Excel",
    description: "Convert raw CSV dumps into styled, filterable Excel sheets with auto-width columns.",
    studioId: "office",
    studioName: "Office Studio",
    category: "office",
    badge: "XLS",
    badgeBg: "bg-teal-600",
    iconBg: "bg-teal-600",
    flare: "from-teal-500/20 to-transparent",
    borderHover: "hover:border-teal-400",
    href: "/app/studios/office",
    tier: "Free",
  },
  {
    id: "compress-smart",
    name: "Smart Image Compressor",
    description: "Shrink PNG, JPG, and WebP images up to 90% without visible loss in sharpness.",
    studioId: "compress",
    studioName: "Compress & Enhance",
    category: "compress",
    badge: "CMP",
    badgeBg: "bg-violet-600",
    iconBg: "bg-violet-600",
    flare: "from-violet-500/20 to-transparent",
    borderHover: "hover:border-violet-400",
    href: "/app/studios/compress",
    tier: "Free",
  },
  {
    id: "trendrank-seo",
    name: "SERP & SEO Content Scorer",
    description: "Analyze keyword coverage, readability scores, and ranking factors for digital copy.",
    studioId: "trendrank",
    studioName: "TrendRank AI",
    category: "trendrank",
    badge: "SEO",
    badgeBg: "bg-purple-600",
    iconBg: "bg-purple-600",
    flare: "from-purple-500/20 to-transparent",
    borderHover: "hover:border-purple-400",
    href: "/app/studios/trendrank",
    tier: "Pro",
  },
];

export default function ToolsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [showSandbox, setShowSandbox] = useState(false);

  const categories = [
    { id: "all", label: "All Tools", count: ALL_STUDIO_TOOLS.length },
    { id: "pdf", label: "PDF Studio", count: ALL_STUDIO_TOOLS.filter((t) => t.category === "pdf").length },
    { id: "ai-doc", label: "AI Document", count: ALL_STUDIO_TOOLS.filter((t) => t.category === "ai-doc").length },
    { id: "background", label: "Background", count: ALL_STUDIO_TOOLS.filter((t) => t.category === "background").length },
    { id: "security", label: "Security & Sign", count: ALL_STUDIO_TOOLS.filter((t) => t.category === "security").length },
    { id: "qr", label: "QR & Links", count: ALL_STUDIO_TOOLS.filter((t) => t.category === "qr").length },
    { id: "office", label: "Office & CSV", count: ALL_STUDIO_TOOLS.filter((t) => t.category === "office").length },
    { id: "compress", label: "Compress", count: ALL_STUDIO_TOOLS.filter((t) => t.category === "compress").length },
    { id: "trendrank", label: "TrendRank AI", count: ALL_STUDIO_TOOLS.filter((t) => t.category === "trendrank").length },
  ];

  const filteredTools = useMemo(() => {
    return ALL_STUDIO_TOOLS.filter((tool) => {
      const matchesCategory = selectedCategory === "all" || tool.category === selectedCategory;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        tool.name.toLowerCase().includes(q) ||
        tool.description.toLowerCase().includes(q) ||
        tool.studioName.toLowerCase().includes(q) ||
        tool.tier.toLowerCase().includes(q);
      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

  return (
    <div className="space-y-8 pb-12">
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-50/90 via-indigo-50/70 to-purple-50/80 backdrop-blur-xl border border-blue-200/80 p-6 sm:p-8 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="absolute -top-12 -right-12 w-56 h-56 rounded-full bg-gradient-to-br from-blue-400/20 via-indigo-400/15 to-purple-400/20 blur-2xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-44 h-44 rounded-full bg-gradient-to-tr from-sky-300/20 to-blue-400/15 blur-xl pointer-events-none" />

        <div className="relative z-10 space-y-2.5 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/80 backdrop-blur-md border border-blue-200/60 text-xs font-semibold text-blue-700 shadow-xs">
            <LuSparkles className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
            <span>Universal Tool Registry &bull; 100% Client-Side Engine</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
            <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
              All Tools
            </span>{" "}
            Catalog
          </h1>
          <p className="text-sm text-slate-600 leading-relaxed font-normal">
            Explore and launch 70+ specialized document tools, neural background workflows, PDF converters, and security modules across all studio suites.
          </p>

          {/* Search Bar */}
          <div className="pt-2 flex items-center max-w-md bg-white rounded-2xl border border-blue-200/80 p-1.5 shadow-sm">
            <span className="pl-3 text-slate-400">
              <LuSearch className="w-4 h-4" />
            </span>
            <input
              type="text"
              placeholder="Search tools... (e.g. word, background, encrypt, qr)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 px-3 py-1.5 text-xs text-slate-800 focus:outline-none placeholder-slate-400"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="px-2 text-xs text-slate-400 hover:text-slate-600"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Developer Sandbox Toggle */}
        <div className="relative z-10 shrink-0 flex flex-col gap-2 items-start md:items-end">
          <button
            type="button"
            onClick={() => setShowSandbox(!showSandbox)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 hover:border-slate-300 bg-white/80 hover:bg-white text-xs font-semibold text-slate-700 shadow-xs transition"
          >
            <LuTerminal className="w-4 h-4 text-indigo-600" />
            <span>{showSandbox ? "Hide Pipeline Sandbox" : "Pipeline Test Runner"}</span>
          </button>
          <span className="text-[11px] text-slate-400">
            {filteredTools.length} {filteredTools.length === 1 ? "tool" : "tools"} available
          </span>
        </div>
      </div>

      {/* Developer Sandbox (Collapsible) */}
      {showSandbox && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 text-white shadow-xl space-y-4 animate-in fade-in duration-200">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <LuTerminal className="w-5 h-5 text-indigo-400" />
              <h3 className="text-sm font-bold">Backend Pipeline Execution Sandbox</h3>
            </div>
            <span className="text-xs text-indigo-400 font-mono">Phase 1 &bull; Echo Test</span>
          </div>
          <p className="text-xs text-slate-400">
            Verify end-to-end async job queues, Prisma persistence, and quota deduction with the live Echo pipeline runner.
          </p>
          <EchoToolTester />
        </div>
      )}

      {/* Category Filter Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
        {categories.map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => setSelectedCategory(c.id)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold shrink-0 transition flex items-center gap-1.5 ${
              selectedCategory === c.id
                ? "bg-slate-900 text-white shadow-xs"
                : "bg-white text-slate-600 border border-slate-200/80 hover:bg-slate-50"
            }`}
          >
            <span>{c.label}</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-md ${
                selectedCategory === c.id ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500"
              }`}
            >
              {c.count}
            </span>
          </button>
        ))}
      </div>

      {/* Tools Cards Grid */}
      {filteredTools.length === 0 ? (
        <div className="bg-white border border-slate-200/80 rounded-3xl p-12 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
            <LuSearch className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900">No matching tools found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Try adjusting your search terms or select &ldquo;All Tools&rdquo; to browse all available studio suites.
          </p>
          <button
            type="button"
            onClick={() => {
              setSearchQuery("");
              setSelectedCategory("all");
            }}
            className="px-4 py-2 bg-slate-900 text-white text-xs font-semibold rounded-xl"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredTools.map((t) => (
            <Link
              key={t.id}
              href={t.href}
              className={`group relative overflow-hidden backdrop-blur-xl bg-white/70 hover:bg-white/95 border border-slate-200/80 ${t.borderHover} rounded-3xl p-5 shadow-xs hover:shadow-lg transition-all duration-300 flex flex-col justify-between space-y-4`}
            >
              {/* Corner Gradient Flare */}
              <div
                className={`absolute -top-12 -right-12 w-28 h-28 rounded-full bg-gradient-to-br ${t.flare} blur-xl pointer-events-none group-hover:scale-150 transition-transform duration-500`}
              />

              <div className="flex items-center justify-between z-10">
                <div className="flex items-center gap-2">
                  <span className={`w-9 h-9 rounded-2xl ${t.iconBg} text-white font-black text-xs flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform duration-200`}>
                    {t.badge}
                  </span>
                  <div>
                    <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                      {t.studioName}
                    </span>
                  </div>
                </div>

                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    t.tier === "Neural AI"
                      ? "bg-indigo-50 text-indigo-700 border border-indigo-200"
                      : t.tier === "Pro"
                      ? "bg-amber-50 text-amber-800 border border-amber-200"
                      : "bg-slate-100 text-slate-600"
                  }`}
                >
                  {t.tier}
                </span>
              </div>

              <div className="z-10 space-y-1.5 flex-1">
                <div className="font-bold text-slate-900 text-sm group-hover:text-blue-600 transition-colors flex items-center justify-between">
                  <span>{t.name}</span>
                  <LuArrowUpRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity text-blue-600" />
                </div>
                <p className="text-xs text-slate-500 leading-relaxed font-normal">
                  {t.description}
                </p>
              </div>

              <div className="z-10 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-400 text-[11px] font-mono">100% Client-Side</span>
                <span className="font-semibold text-blue-600 group-hover:translate-x-0.5 transition-transform">
                  Launch &rarr;
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
