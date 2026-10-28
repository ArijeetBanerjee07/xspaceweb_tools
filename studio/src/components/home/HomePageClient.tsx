"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import Link from "next/link";
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
  LuChartColumn,
  LuArrowRight,
  LuSearch,
  LuCheck,
  LuZap,
  LuLock,
  LuDatabase,
  LuChevronRight,
  LuChevronDown,
  LuCrown,
  LuCircleHelp,
  LuArrowUpRight,
  LuSlidersHorizontal,
  LuExternalLink,
  LuCpu,
  LuMail,
  LuUser,
  LuGraduationCap,
  LuPalette,
  LuUsers,
  LuBuilding2,
  LuWifi,
  LuCreditCard,
  LuDownload,
  LuLink,
  LuFileCheck,
  LuFiles,
  LuGitCompare,
  LuLanguages,
  LuLockOpen,
  LuMaximize2,
  LuMessageSquareText,
  LuReceipt,
  LuScanText,
  LuStamp,
  LuGlobe,
  LuImage,
  LuBox,
  LuX,
  LuPenLine,
} from "react-icons/lu";
import {
  FaFilePdf,
} from "react-icons/fa6";
import { Navbar } from "@/components/navigation/Navbar";
import { SiteFooter } from "@/components/site/SiteFooter";

// Studios Data matching the PDF specifications
const STUDIOS_DATA = [
  {
    id: "pdf",
    name: "PDF Studio",
    tagline: "High-Performance Vector PDF Processing & OCR",
    desc: "Complete online PDF toolbox: merge multi-page documents, split pages, compress file size up to 85%, stamp watermarks, and extract editable text with neural OCR.",
    href: "/app/studios/pdf",
    previewImage: "/studios/pdf.webp",
    icon: LuFileText,
    badge: "10 Tools",
    badgeColor: "bg-red-50 text-red-600 border-red-200",
    colorHex: "#ef4444",
    inputFormats: "PDF, DOC, DOCX",
    outputFormats: "PDF, DOCX, TXT, ZIP",
    featuredOps: [
      { name: "Merge Multiple PDFs", icon: LuLayers },
      { name: "Split & Extract Pages", icon: LuScissors },
      { name: "Compress PDF File Size", icon: LuMinimize2 },
      { name: "Convert PDF to Word DOCX", icon: LuFileText },
      { name: "Watermark & Page Stamp", icon: LuShieldCheck },
    ],
  },
  {
    id: "ai-document",
    name: "AI Document Studio",
    tagline: "Neural Reading, Instant Briefs & Invoice Extraction",
    desc: "Analyze and query complex contracts, technical papers, and spreadsheets. Generate executive summaries and extract key information.",
    href: "/app/studios/ai-document",
    previewImage: "/studios/ai-document.webp",
    icon: LuSparkles,
    badge: "AI Powered",
    badgeColor: "bg-purple-50 text-purple-600 border-purple-200",
    colorHex: "#8b5cf6",
    inputFormats: "PDF, DOCX, TXT",
    outputFormats: "Structured JSON, Markdown, Executive Brief",
    featuredOps: [
      { name: "Document Summarizer", icon: LuSparkles },
      { name: "Clause-by-Clause Auditor", icon: LuFileCheck },
      { name: "Invoice & Receipt Data Extraction", icon: LuCreditCard },
      { name: "Document Q&A Assistant", icon: LuFileText },
      { name: "Action Checklist Generator", icon: LuCheck },
    ],
  },
  {
    id: "background",
    name: "Background Studio",
    tagline: "Sub-Pixel AI Background Matting & Subject Cutout",
    desc: "Remove photo backgrounds automatically in 2 seconds. Replace with clean studio backgrounds and solid colors.",
    href: "/app/studios/background",
    previewImage: "/studios/background.webp",
    icon: LuImage,
    badge: "Neural Matting",
    badgeColor: "bg-emerald-50 text-emerald-600 border-emerald-200",
    colorHex: "#10b981",
    inputFormats: "PNG, JPG, JPEG, WEBP",
    outputFormats: "Transparent PNG, High-Res WebP, JPG",
    featuredOps: [
      { name: "Automatic Background Remover", icon: LuScissors },
      { name: "Solid Color Studio Backdrop", icon: LuPalette },
      { name: "Transparent PNG Cutout", icon: LuLayers },
      { name: "Edge Smoothing & Hair Matting", icon: LuSparkles },
      { name: "Product Commercial Resizer", icon: LuMaximize2 },
    ],
  },
  {
    id: "document-hub",
    name: "Document Hub",
    tagline: "Universal 20+ Format Transcoder & File Bridge",
    desc: "Convert effortlessly between Word, PowerPoint, Excel, PDF, Markdown, HTML, and high-resolution raster formats while preserving quality.",
    href: "/app/studios/document-hub",
    previewImage: "/studios/document-hub.webp",
    icon: LuLayers,
    badge: "20+ Formats",
    badgeColor: "bg-blue-50 text-blue-600 border-blue-200",
    colorHex: "#2563eb",
    inputFormats: "DOCX, PPTX, XLSX, PDF, MD, HTML",
    outputFormats: "PDF, DOCX, XLSX, PPTX, HTML, MD",
    featuredOps: [
      { name: "DOCX to PDF Transcoder", icon: LuFileText },
      { name: "PPTX Slide to PDF", icon: LuLayers },
      { name: "HTML & Markdown to DOCX", icon: LuGlobe },
      { name: "Universal File Normalizer", icon: LuCpu },
      { name: "Batch Conversion Queue", icon: LuDownload },
    ],
  },
  {
    id: "office",
    name: "Office Studio",
    tagline: "Programmatic Word, Presentation & Spreadsheet Suite",
    desc: "Create and edit DOCX, PPTX, XLSX and CSV files online with powerful and easy-to-use tools.",
    href: "/app/studios/office",
    previewImage: "/studios/office.webp",
    icon: LuFileSpreadsheet,
    badge: "Office Suite",
    badgeColor: "bg-amber-50 text-amber-600 border-amber-200",
    colorHex: "#f59e0b",
    inputFormats: "DOCX, PPTX, XLSX, CSV",
    outputFormats: "DOCX, PPTX, XLSX, PDF",
    featuredOps: [
      { name: "DOCX Document Generator", icon: LuFileText },
      { name: "PPTX Pitch Deck Builder", icon: LuLayers },
      { name: "Excel Financial Model Creator", icon: LuFileSpreadsheet },
      { name: "Spreadsheet CSV Normalizer", icon: LuCheck },
      { name: "Templates & Formatting", icon: LuPalette },
    ],
  },
  {
    id: "security",
    name: "Security & E-Signature",
    tagline: "Cryptographic Protection, PII Redaction & Legal E-Signs",
    desc: "Encrypt, redact and sign documents securely with AES-256 encryption and advanced security tools.",
    href: "/app/studios/security",
    previewImage: "/studios/security.webp",
    icon: LuShieldCheck,
    badge: "AES-256 Safe",
    badgeColor: "bg-emerald-50 text-emerald-600 border-emerald-200",
    colorHex: "#10b981",
    inputFormats: "PDF",
    outputFormats: "Encrypted PDF, Signed PDF with Audit Log",
    featuredOps: [
      { name: "AES-256 PDF Password Lock", icon: LuLock },
      { name: "Confidential PII Blackout Redactor", icon: LuScissors },
      { name: "Legally Binding Digital E-Signature", icon: LuFileCheck },
      { name: "Permissions Stripper & Unlocker", icon: LuShieldCheck },
      { name: "Audit Trail Verification", icon: LuCheck },
    ],
  },
  {
    id: "compress",
    name: "Compress & Enhance",
    tagline: "Smart Density Reduction & Lossless Optimization",
    desc: "Reduce PDF and image file sizes without losing quality and enhance with AI-powered tools.",
    href: "/app/studios/compress",
    previewImage: "/studios/compress.webp",
    icon: LuSparkles,
    badge: "Up to -85%",
    badgeColor: "bg-amber-50 text-amber-600 border-amber-200",
    colorHex: "#8b5cf6",
    inputFormats: "PDF, PNG, JPG, WEBP",
    outputFormats: "Optimized PDF, WebP, Compressed PNG/JPG",
    featuredOps: [
      { name: "Smart PDF File Compressor", icon: LuMinimize2 },
      { name: "Lossless PNG & JPG Shrinker", icon: LuLayers },
      { name: "WebP Fast Next-Gen Converter", icon: LuZap },
      { name: "Raster Image Upscaler & Denoiser", icon: LuSparkles },
      { name: "Multi-Density Export Queue", icon: LuDownload },
    ],
  },
  {
    id: "qr-link",
    name: "QR & Link Studio",
    tagline: "Custom Vector QR Generator & Dynamic Route Engine",
    desc: "Design sharp, customized vector QR codes for websites, WiFi network logins, vCard digital business cards, and social profiles with downloadable SVG and high-DPI PNGs.",
    href: "/app/studios/qr-link",
    previewImage: "/studios/qr-link.webp",
    icon: LuQrCode,
    badge: "Vector SVG",
    badgeColor: "bg-blue-50 text-blue-600 border-blue-200",
    colorHex: "#0066ff",
    inputFormats: "Text, URL, vCard, WiFi credentials",
    outputFormats: "Scalable Vector SVG, High-Res PNG, Print PDF",
    featuredOps: [
      { name: "URL Website QR Generator", icon: LuLink },
      { name: "WiFi One-Tap Connect QR", icon: LuWifi },
      { name: "vCard Virtual Business Card", icon: LuCreditCard },
      { name: "Custom Hex Matrix Colorizer", icon: LuPalette },
      { name: "Scalable Vector SVG Export", icon: LuDownload },
    ],
  },
  {
    id: "trendrank",
    name: "TrendRank AI",
    tagline: "Search Volume Intelligence & Commercial Intent Radar",
    desc: "Explore search queries, keyword gaps and monitor topic momentum with AI.",
    href: "/app/studios/trendrank",
    previewImage: "/studios/trendrank.webp",
    icon: LuChartColumn,
    badge: "SEO Insights",
    badgeColor: "bg-purple-50 text-purple-600 border-purple-200",
    colorHex: "#f97316",
    inputFormats: "Keywords, domain queries, search prompts",
    outputFormats: "Exportable CSV, Strategic Keyword Tables",
    featuredOps: [
      { name: "Search Demand Explorer", icon: LuSearch },
      { name: "Commercial Intent Matrix", icon: LuTrendingUp },
      { name: "Keyword Difficulty Estimator", icon: LuCpu },
      { name: "SERP Gap Opportunity Finder", icon: LuGlobe },
      { name: "Real-Time Trend Monitor", icon: LuZap },
    ],
  },
];

// Rotating accent colors for featured operation icons, matching the design
const OP_ACCENTS = ["text-blue-600", "text-violet-600", "text-emerald-600", "text-amber-500", "text-rose-500"];

// Per-tool tile color and glyph for the All Tools Directory cards
interface ToolTile {
  bg: string;
  icon?: typeof LuFileText;
  glyph?: string;
}

const DEFAULT_TOOL_TILE: ToolTile = { bg: "#0066ff", icon: LuFileText };

const TOOL_TILES: Record<string, ToolTile> = {
  "merge-pdf": { bg: "#e11d48", icon: LuFiles },
  "split-pdf": { bg: "#f97316", icon: LuScissors },
  "compress-pdf": { bg: "#16a34a", icon: LuMinimize2 },
  "pdf-to-word": { bg: "#2563eb", glyph: "W" },
  "word-to-pdf": { bg: "#dc2626", icon: FaFilePdf },
  "pdf-to-excel": { bg: "#12805c", glyph: "X" },
  "protect-pdf": { bg: "#7c3aed", icon: LuLock },
  "unlock-pdf": { bg: "#0d9488", icon: LuLockOpen },
  "watermark-pdf": { bg: "#8b5cf6", icon: LuStamp },
  "ocr-pdf": { bg: "#0891b2", icon: LuScanText },
  "chat-pdf": { bg: "#8b5cf6", icon: LuMessageSquareText },
  "summarize-pdf": { bg: "#a855f7", icon: LuSparkles },
  "compare-docs": { bg: "#6366f1", icon: LuGitCompare },
  "invoice-extract": { bg: "#0d9488", icon: LuReceipt },
  "doc-translate": { bg: "#ec4899", icon: LuLanguages },
};

// 5 Persona groups from the design
const PERSONAS_DATA = [
  {
    name: "Individuals",
    desc: "Personal productivity",
    icon: LuUser,
    bg: "bg-[#eff6ff] border-blue-100/90 text-[#0066ff]",
  },
  {
    name: "Students",
    desc: "Learn and create",
    icon: LuGraduationCap,
    bg: "bg-[#ecfdf5] border-emerald-100/90 text-emerald-600",
  },
  {
    name: "Creators",
    desc: "Design and content",
    icon: LuPalette,
    bg: "bg-[#fffbeb] border-amber-100/90 text-amber-600",
  },
  {
    name: "Teams",
    desc: "Collaborate and share",
    icon: LuUsers,
    bg: "bg-[#f5f3ff] border-purple-100/90 text-purple-600",
  },
  {
    name: "Businesses",
    desc: "Scale your workflow",
    icon: LuBuilding2,
    bg: "bg-[#f0f9ff] border-sky-100/90 text-sky-600",
  },
];

// Latest Tools from the design
const LATEST_TOOLS_DATA = [
  {
    id: "ai-chat",
    name: "AI Document Chat",
    desc: "Chat with your documents and get instant answers.",
    href: "/app/studios/ai-document",
    badge: "AI",
    badgeBg: "bg-[#9333ea] text-white",
    illustration: "/banners/tool_ill_ai_doc.png",
  },
  {
    id: "bg-remover",
    name: "Image Background Remover",
    desc: "Remove and replace backgrounds with AI.",
    href: "/app/studios/background",
    badge: "Image",
    badgeIcon: LuImage,
    badgeBg: "bg-[#10b981] text-white",
    illustration: "/banners/tool_ill_bg_remove.png",
  },
  {
    id: "secure-pdf",
    name: "Secure PDF",
    desc: "Protect, encrypt and lock your PDF files.",
    href: "/app/studios/security",
    badge: "Security",
    badgeIcon: LuLock,
    badgeBg: "bg-[#3b82f6] text-white",
    illustration: "/banners/tool_ill_secure_pdf.png",
  },
  {
    id: "qr-analytics",
    name: "QR Code with Analytics",
    desc: "Create QR codes and track engagement.",
    href: "/app/studios/qr-link",
    badge: "QR",
    badgeIcon: LuQrCode,
    badgeBg: "bg-[#f43f5e] text-white",
    illustration: "/banners/tool_ill_qr_code.png",
  },
];

// Frequently Asked Questions from the design
const FAQ_ITEMS = [
  {
    id: "q1",
    question: "How does XSW Tools compare to standalone tools like 10015.io or Adobe?",
    answer:
      "Unlike simple static utility pages, XSW Tools integrates 9 full-fledged software studios into a synchronized, cloud-synced workspace. You get persistent file queues, AI-assisted summaries, neural background matting, e-signatures, and cross-studio pipelines for just ₹299/month.",
  },
  {
    id: "q2",
    question: "Is the Free tier truly free forever?",
    answer:
      "Yes, our Free plan costs ₹0 forever. It gives you immediate access to all 9 studio interfaces, 5 free AI document operations, 5 background matting cutouts, 20 vector QR codes, and 1 GB cloud storage without requiring a credit card.",
  },
  {
    id: "q3",
    question: "Are my confidential business files safe and protected?",
    answer:
      "100% We employ zero-telemetry architectures and AES-256 cryptographic standards. Scratch files generated during tool sessions are strictly held in private, ephemeral containers and automatically destroyed after your session finishes or after 24 hours.",
  },
  {
    id: "q4",
    question: "Where is the main studio workspace located?",
    answer:
      "The full workspace is available at /app. Once inside, you can access your recent jobs, inspect available quotas, search 40+ tools with Ctrl+K, and run all 9 studios.",
  },
];

interface HomePageClientProps {
  isAuthenticated?: boolean;
}

export function HomePageClient({ isAuthenticated = false }: HomePageClientProps) {
  const [activeStudioId, setActiveStudioId] = useState("qr-link");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");
  const [expandedFaq, setExpandedFaq] = useState<string | null>("q1");
  const [isLoggedIn, setIsLoggedIn] = useState(isAuthenticated);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const categoryScrollRef = useRef<HTMLDivElement>(null);

  // Sync session client-side
  useEffect(() => {
    setIsLoggedIn(isAuthenticated);
  }, [isAuthenticated]);

  useEffect(() => {
    fetch("/api/auth/session")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.user?.id || data?.user?.email) {
          setIsLoggedIn(true);
        }
      })
      .catch(() => {});
  }, []);

  // Helper for dynamic auth routing: if not signed in, route to signup with redirect back
  const getStudioHref = (targetHref: string) => {
    return isLoggedIn ? targetHref : `/signup?redirect=${encodeURIComponent(targetHref)}`;
  };

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
    return STUDIOS_DATA.find((s) => s.id === activeStudioId) || STUDIOS_DATA[7];
  }, [activeStudioId]);
  const ActiveStudioIcon = activeStudio.icon;

  const categories = useMemo(() => {
    return [
      "All",
      "PDF",
      "Convert",
      "Edit",
      "Organize",
      "AI Tools",
      "Security",
      "Images",
      "Documents",
      "Spreadsheets",
      "QR & Links",
    ];
  }, []);

  const filteredTools = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return TOOLS_CATALOG.filter((tool) => {
      const matchesCategory =
        selectedCategory === "All" ||
        tool.category.toLowerCase().includes(selectedCategory.toLowerCase()) ||
        tool.studioName.toLowerCase().includes(selectedCategory.toLowerCase()) ||
        (selectedCategory === "AI Tools" && tool.studioId === "ai-document");
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
    <div className="relative min-h-screen bg-[#fafbfe] text-slate-900 selection:bg-blue-600 selection:text-white font-sans antialiased">
      {/* Modern Light Geometric Grid Pattern */}
      <div
        className="pointer-events-none absolute inset-0 z-0 opacity-[0.25]"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, #cbd5e1 1px, transparent 0)`,
          backgroundSize: "32px 32px",
        }}
      />

      {/* NAVBAR */}
      <Navbar isAuthenticated={isAuthenticated} />

      {/* ================= SECTION 1: HERO SECTION ================= */}
      <section className="relative z-10 pt-16 sm:pt-24 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Column: Headline & Subtitle */}
          <div className="lg:col-span-6 text-left space-y-6">
            <h1 className="text-4xl sm:text-6xl xl:text-7xl font-extrabold tracking-tight text-slate-900 leading-[1.08]">
              Tools worth using.
            </h1>

            <p className="text-base sm:text-xl text-slate-600 max-w-lg font-normal leading-relaxed">
              A curated workspace of tools to create, convert, secure and optimize files, powered by AI.
            </p>

            <div className="pt-2">
              <a
                href="#tools"
                className="inline-flex items-center gap-3 px-8 py-4 rounded-full bg-[#1c1d22] hover:bg-black text-white text-base font-semibold shadow-lg hover:shadow-xl transition-all active:scale-[0.98]"
              >
                <span>Browse all</span>
                <LuArrowRight className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Right Column: Interactive Circular Orbit Illustration matching the design */}
          <div className="lg:col-span-6 flex items-center justify-center relative select-none overflow-hidden sm:overflow-visible py-4">
            <div className="relative w-[360px] h-[360px] sm:w-[480px] sm:h-[480px] lg:w-[540px] lg:h-[540px] flex items-center justify-center scale-[0.78] xs:scale-[0.9] sm:scale-100 origin-center transition-transform">
              {/* Broad Concentric Orbit Rings (darkened slightly for clarity) */}
              <div className="absolute w-[340px] h-[340px] sm:w-[460px] sm:h-[460px] lg:w-[510px] lg:h-[510px] rounded-full border border-slate-300" />
              <div className="absolute w-[240px] h-[240px] sm:w-[330px] sm:h-[330px] lg:w-[370px] lg:h-[370px] rounded-full border border-slate-300" />
              <div className="absolute w-[150px] h-[150px] sm:w-[210px] sm:h-[210px] lg:w-[230px] lg:h-[230px] rounded-full border border-blue-200 bg-gradient-to-b from-blue-100/40 to-transparent" />

              {/* Center 4-Sphere Glossy Cluster Logo */}
              <div className="relative z-20 w-28 h-28 sm:w-36 sm:h-36 flex items-center justify-center group">
                <img
                  src="/logo-spheres.webp"
                  alt="XSW Tools"
                  width={128}
                  height={128}
                  fetchPriority="high"
                  className="w-24 h-24 sm:w-32 sm:h-32 object-contain drop-shadow-[0_12px_28px_rgba(59,130,246,0.32)] group-hover:scale-105 transition-transform duration-300"
                />
              </div>

              {/* Orbiting Floating Cards matching the design */}
              {/* 1. PDF Card (Top Left - ~11 o'clock) */}
              <div aria-hidden="true" className="absolute top-2 left-12 sm:top-4 sm:left-20 z-10 w-16 h-16 sm:w-20 sm:h-20 rounded-2xl sm:rounded-3xl bg-white shadow-[0_12px_28px_rgba(0,0,0,0.08)] border border-slate-100 flex items-center justify-center hover:scale-110 hover:shadow-xl transition-all duration-300">
                <FaFilePdf className="w-8 h-8 sm:w-10 sm:h-10 text-[#ef4444]" />
              </div>

              {/* 2. AI Card (Top Right - ~1 o'clock) */}
              <div aria-hidden="true" className="absolute top-0 right-12 sm:top-2 sm:right-20 z-10 w-16 h-16 sm:w-20 sm:h-20 rounded-2xl sm:rounded-3xl bg-white shadow-[0_12px_28px_rgba(0,0,0,0.08)] border border-slate-100 flex items-center justify-center hover:scale-110 hover:shadow-xl transition-all duration-300">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-gradient-to-tr from-[#0066ff] to-[#3b82f6] shadow-sm flex items-center justify-center text-white font-extrabold text-sm sm:text-base tracking-tight">
                  AI
                </div>
              </div>

              {/* 3. Image Card (Center Right - ~3 o'clock) */}
              <div aria-hidden="true" className="absolute top-36 -right-2 sm:top-48 sm:-right-4 z-10 w-16 h-16 sm:w-20 sm:h-20 rounded-2xl sm:rounded-3xl bg-white shadow-[0_12px_28px_rgba(0,0,0,0.08)] border border-slate-100 flex items-center justify-center hover:scale-110 hover:shadow-xl transition-all duration-300">
                <LuImage className="w-8 h-8 sm:w-10 sm:h-10 text-[#10b981]" strokeWidth={2.2} />
              </div>

              {/* 4. Security Shield (Bottom Right - ~4:30 o'clock) */}
              <div aria-hidden="true" className="absolute bottom-3 right-10 sm:bottom-6 sm:right-16 z-10 w-16 h-16 sm:w-20 sm:h-20 rounded-2xl sm:rounded-3xl bg-white shadow-[0_12px_28px_rgba(0,0,0,0.08)] border border-slate-100 flex items-center justify-center hover:scale-110 hover:shadow-xl transition-all duration-300">
                <LuShieldCheck className="w-8 h-8 sm:w-10 sm:h-10 text-[#a855f7]" strokeWidth={2.2} />
              </div>

              {/* 5. Document Card (Bottom Center - ~6 o'clock) */}
              <div aria-hidden="true" className="absolute -bottom-3 left-1/2 -translate-x-1/2 sm:-bottom-4 z-10 w-16 h-16 sm:w-20 sm:h-20 rounded-2xl sm:rounded-3xl bg-white shadow-[0_12px_28px_rgba(0,0,0,0.08)] border border-slate-100 flex items-center justify-center hover:scale-110 hover:shadow-xl transition-all duration-300">
                <LuFileText className="w-8 h-8 sm:w-10 sm:h-10 text-[#0ea5e9]" strokeWidth={2.2} />
              </div>

              {/* 6. Office / Spreadsheet Card (Lower Left - marked position on outer ring - ~8 o'clock) */}
              <div aria-hidden="true" className="absolute bottom-16 left-2 sm:bottom-24 sm:left-4 lg:bottom-28 lg:left-5 z-10 w-16 h-16 sm:w-20 sm:h-20 rounded-2xl sm:rounded-3xl bg-white shadow-[0_12px_28px_rgba(0,0,0,0.08)] border border-slate-100 flex items-center justify-center hover:scale-110 hover:shadow-xl transition-all duration-300">
                <LuFileSpreadsheet className="w-8 h-8 sm:w-10 sm:h-10 text-[#f59e0b]" strokeWidth={2.2} />
              </div>

              {/* 7. QR Code Card (Center Left - ~9 o'clock) */}
              <div aria-hidden="true" className="absolute top-36 -left-2 sm:top-48 sm:-left-4 z-10 w-16 h-16 sm:w-20 sm:h-20 rounded-2xl sm:rounded-3xl bg-white shadow-[0_12px_28px_rgba(0,0,0,0.08)] border border-slate-100 flex items-center justify-center hover:scale-110 hover:shadow-xl transition-all duration-300">
                <LuQrCode className="w-8 h-8 sm:w-10 sm:h-10 text-slate-900" strokeWidth={2.2} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= SECTION 2: STUDIO SUITE EXPLORER ================= */}
      <section id="studios" className="relative z-10 py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-10">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-blue-50 border border-blue-200/80 text-xs font-bold text-blue-600 mb-3">
            <LuSlidersHorizontal className="w-3.5 h-3.5" />
            <span>STUDIO SUITE EXPLORER</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
            9 High-Performance <span className="text-[#0066ff]">Production Studios</span>
          </h2>
          <p className="mt-3 text-base sm:text-lg text-slate-600">
            Click any studio to view its dedicated workflow, interface, supported formats, and tools.
          </p>
        </div>

        {/* 9 Studio Tabs - colored icon chips */}
        <div role="tablist" aria-label="Production Studios" className="flex flex-wrap items-center justify-center gap-2 max-w-6xl mx-auto pb-4">
          {STUDIOS_DATA.map((s) => {
            const Icon = s.icon;
            const isActive = s.id === activeStudioId;
            return (
              <button
                key={s.id}
                role="tab"
                aria-selected={isActive}
                onClick={() => setActiveStudioId(s.id)}
                className={`flex items-center gap-2 pl-1.5 pr-3.5 py-1.5 rounded-xl border text-xs font-semibold whitespace-nowrap transition ${
                  isActive
                    ? "bg-[#0066ff] text-white border-[#0066ff] shadow-[0_8px_18px_-8px_rgba(0,102,255,0.7)]"
                    : "bg-white text-slate-800 border-slate-200 hover:border-slate-300 hover:bg-slate-50 shadow-2xs"
                }`}
              >
                <span
                  aria-hidden="true"
                  className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 text-white ${
                    isActive ? "bg-white/20" : ""
                  }`}
                  style={isActive ? undefined : { backgroundColor: s.colorHex }}
                >
                  {s.id === "ai-document" ? (
                    <span className="text-[10px] font-extrabold tracking-tight">AI</span>
                  ) : (
                    <Icon className="w-3.5 h-3.5" strokeWidth={2.4} />
                  )}
                </span>
                <span>{s.name}</span>
              </button>
            );
          })}
        </div>

        {/* Active Studio Detail Container */}
        <div className="mt-6 rounded-[28px] border border-slate-200/80 bg-white shadow-[0_30px_80px_-40px_rgba(15,23,42,0.35)] p-4 sm:p-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 items-stretch">
            {/* Left Column: Studio Visual */}
            <div className="lg:col-span-5 relative overflow-hidden rounded-3xl bg-slate-100 aspect-[4/3] sm:aspect-[16/10] lg:aspect-auto lg:min-h-[500px] group">
              <img
                key={activeStudio.id}
                src={activeStudio.previewImage}
                alt={`${activeStudio.name} Interface Preview`}
                width={640}
                height={800}
                loading="lazy"
                decoding="async"
                className="absolute inset-0 w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-[1.03]"
              />
            </div>

            {/* Right Column: Details, Capabilities, and Operations */}
            <div className="lg:col-span-7 flex flex-col justify-center lg:py-2 lg:pr-2">
              <div className="flex flex-wrap items-center gap-3">
                <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-bold border ${activeStudio.badgeColor}`}>
                  <ActiveStudioIcon className="w-3 h-3" strokeWidth={2.6} />
                  {activeStudio.badge}
                </span>
                <span className="text-xs text-slate-400">
                  Workspace Route: <span className="font-mono text-slate-600">{activeStudio.href}</span>
                </span>
              </div>

              <h3 className="mt-4 text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                {activeStudio.name}
              </h3>
              <p className="mt-1.5 text-sm sm:text-base font-semibold text-[#0066ff]">
                {activeStudio.tagline}
              </p>
              <p className="mt-3 text-sm text-slate-600 leading-relaxed">
                {activeStudio.desc}
              </p>

              {/* Specs Box */}
              <div className="mt-5 rounded-xl border border-slate-200 px-4 py-3 text-xs">
                <div className="grid grid-cols-[104px_1fr] gap-x-3 gap-y-2">
                  <span className="text-slate-500">Input Formats:</span>
                  <span className="font-medium text-slate-700">{activeStudio.inputFormats}</span>
                  <span className="text-slate-500">Output Formats:</span>
                  <span className="font-medium text-slate-700">{activeStudio.outputFormats}</span>
                </div>
              </div>

              {/* Featured Operations in Studio */}
              <div className="mt-5">
                <div className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-400">
                  Featured Operations in Studio
                </div>
                <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {activeStudio.featuredOps.map((op, index) => {
                    const OpIcon = op.icon;
                    return (
                      <div
                        key={op.name}
                        className="flex items-center gap-2.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700"
                      >
                        <OpIcon className={`w-4 h-4 shrink-0 ${OP_ACCENTS[index % OP_ACCENTS.length]}`} />
                        <span className="truncate">{op.name}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-6 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <Link
                  href={getStudioHref(activeStudio.href)}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-[#0066ff] hover:bg-blue-700 text-white font-bold text-sm shadow-md transition text-center"
                >
                  <span>Open {activeStudio.name}</span>
                  <LuArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href={getStudioHref("/app")}
                  className="inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-semibold text-sm transition text-center"
                >
                  <LuExternalLink className="w-4 h-4 text-slate-500" />
                  <span>Workspace Overview</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= SECTION 3: ALL TOOLS DIRECTORY ================= */}
      <section id="tools" className="relative z-10 py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-10">
          <div className="inline-flex items-center px-3.5 py-1 rounded-full bg-blue-50 text-xs font-bold text-[#0066ff] mb-3">
            <span>40+ Powerful Online Tools</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
            All Tools <span className="text-[#0066ff]">Directory</span>
          </h2>
          <p className="mt-3 text-sm sm:text-base text-slate-600 max-w-2xl mx-auto">
            Search by tool name, file extension, or action (e.g. merge, compress, watermark, ocr, background, qr). Press{" "}
            <kbd className="px-1.5 py-0.5 rounded bg-slate-100 border border-slate-300 text-[10px] font-mono text-slate-700">
              Ctrl + K
            </kbd>{" "}
            to focus anytime.
          </p>
        </div>

        {/* Search Input */}
        <div className="max-w-2xl mx-auto mb-6">
          <div className="relative">
            <LuSearch className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search any online tool (e.g., merge pdf, compress, background cutout, ocr text)..."
              aria-label="Search all online tools"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-20 py-3.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#0066ff] focus:ring-2 focus:ring-[#0066ff]/20 shadow-sm transition"
            />
            <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
              {searchQuery ? (
                <button
                  onClick={() => setSearchQuery("")}
                  aria-label="Clear tool search"
                  className="text-xs text-slate-400 hover:text-slate-700 px-1 cursor-pointer"
                >
                  Clear
                </button>
              ) : (
                <span className="hidden sm:inline text-[10px] font-mono text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                  Ctrl + K
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Category Filter Pills with Horizontal Scroll */}
        <div className="flex items-center gap-3 max-w-6xl mx-auto mb-10">
          <div
            ref={categoryScrollRef}
            role="group"
            aria-label="Tool categories"
            className="flex flex-1 items-center gap-2 overflow-x-auto scrollbar-none pb-1 justify-start lg:justify-center"
          >
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                aria-pressed={selectedCategory === cat}
                className={`px-4 py-1.5 rounded-lg text-[13px] font-semibold whitespace-nowrap transition border cursor-pointer ${
                  selectedCategory === cat
                    ? "bg-[#0066ff] text-white border-[#0066ff]"
                    : "bg-white text-slate-700 border-slate-200 shadow-2xs hover:border-slate-300 hover:bg-slate-50"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
          <button
            onClick={() => categoryScrollRef.current?.scrollBy({ left: 220, behavior: "smooth" })}
            aria-label="Scroll categories right"
            className="w-9 h-9 shrink-0 rounded-full bg-white border border-slate-200 shadow-sm flex items-center justify-center text-slate-500 hover:text-slate-900 hover:border-slate-300 transition cursor-pointer"
          >
            <LuChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* 3-Column Tool Cards Grid matching the PDF */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredTools.slice(0, 18).map((tool) => {
            const tile = TOOL_TILES[tool.id] ?? DEFAULT_TOOL_TILE;
            const TileIcon = tile.icon;
            return (
              <div
                key={tool.id}
                className="p-5 rounded-xl bg-white border border-slate-200/80 shadow-sm hover:border-blue-300 hover:shadow-md transition-all flex flex-col justify-between group"
              >
                <div>
                  {/* Header row: Icon, Studio Badge, Tier Badge */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2.5">
                      <div
                        className="w-9 h-9 rounded-lg flex items-center justify-center text-white shrink-0"
                        style={{ backgroundColor: tile.bg }}
                      >
                        {tile.glyph ? (
                          <span className="text-base font-extrabold leading-none">{tile.glyph}</span>
                        ) : TileIcon ? (
                          <TileIcon className="w-5 h-5" strokeWidth={2.2} />
                        ) : null}
                      </div>
                      <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-md bg-[#eef1fa] text-slate-600">
                        {tool.studioName}
                      </span>
                    </div>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                        tool.tier === "Free"
                          ? "bg-emerald-50 text-emerald-600"
                          : tool.tier === "Starter"
                          ? "bg-blue-50 text-blue-600"
                          : "bg-purple-50 text-purple-600"
                      }`}
                    >
                      {tool.tier}
                    </span>
                  </div>

                  <h4 className="text-base font-bold text-slate-900 group-hover:text-[#0066ff] transition">
                    {tool.name}
                  </h4>
                  <p className="text-[13px] text-slate-500 mt-1.5 line-clamp-2 leading-relaxed">
                    {tool.description}
                  </p>
                </div>

                {/* Bottom row: Format & Use Tool */}
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-xs text-slate-500">
                    Format: {tool.inputFormat.split(",")[0] || ".pdf"}
                  </span>
                  <Link
                    href={getStudioHref(tool.studioHref)}
                    prefetch={false}
                    className="inline-flex items-center gap-1 text-xs font-bold text-[#0066ff] group-hover:translate-x-0.5 transition"
                  >
                    <span>Use Tool</span>
                    <LuArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>

        {/* View All Tools CTA Button */}
        <div className="mt-10 text-center">
          <Link
            href={getStudioHref("/app")}
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-[#0066ff] hover:bg-blue-700 text-white font-bold text-sm shadow-md transition active:scale-[0.98]"
          >
            <span>View All 40+ Tools in Workspace</span>
            <LuArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* ================= SECTION 4: EXPLORE ALL 9 STUDIOS AT A GLANCE ================= */}
      <section className="relative z-10 py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200/80 text-xs font-bold text-[#0066ff] mb-3">
            <LuSlidersHorizontal className="w-3.5 h-3.5" />
            <span>Explore Studios</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
            Explore All 9 Studios <span className="text-[#0066ff]">at a Glance</span>
          </h2>
          <p className="mt-3 text-sm sm:text-base text-slate-600">
            Each studio runs natively in your browser with dedicated specialized toolchains.
          </p>
        </div>

        {/* Bento Grid Layout from the PDF Design */}
        <div className="space-y-6">
          {/* Row 1: 3 equal cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Card 1: PDF Studio */}
            <div className="p-6 sm:p-7 rounded-3xl bg-white border border-slate-200/90 shadow-sm hover:shadow-md transition flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center font-bold">
                    <LuFileText className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-red-50 text-red-600 border border-red-200">
                    10 Tools
                  </span>
                </div>
                <h3 className="text-xl font-bold text-slate-900">PDF Studio</h3>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                  Complete online PDF toolbox: merge multi-page documents, split pages, compress file size up to 85%, stamp watermarks and more.
                </p>
              </div>
              <div className="pt-6 mt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-500 font-medium">6 Featured Tools</span>
                <Link href={getStudioHref("/app/studios/pdf")} className="font-bold text-[#0066ff] hover:underline flex items-center gap-1">
                  Launch Studio <LuChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* Card 2: AI Document Studio */}
            <div className="p-6 sm:p-7 rounded-3xl bg-white border border-slate-200/90 shadow-sm hover:shadow-md transition flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
                    <LuSparkles className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-600 border border-purple-200">
                    AI Powered
                  </span>
                </div>
                <h3 className="text-xl font-bold text-slate-900">AI Document Studio</h3>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                  Analyze and query complex contracts, technical papers, and spreadsheets. Generate executive summaries and extract key information.
                </p>
              </div>
              <div className="pt-6 mt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-500 font-medium">5 Featured Tools</span>
                <Link href={getStudioHref("/app/studios/ai-document")} className="font-bold text-[#0066ff] hover:underline flex items-center gap-1">
                  Launch Studio <LuChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* Card 3: Background Studio */}
            <div className="p-6 sm:p-7 rounded-3xl bg-white border border-slate-200/90 shadow-sm hover:shadow-md transition flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                    <LuScissors className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200">
                    Neural Matting
                  </span>
                </div>
                <h3 className="text-xl font-bold text-slate-900">Background Studio</h3>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                  Remove photo backgrounds automatically in 2 seconds. Replace with clean studio backgrounds and solid colors.
                </p>
              </div>
              <div className="pt-6 mt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-500 font-medium">5 Featured Tools</span>
                <Link href={getStudioHref("/app/studios/background")} className="font-bold text-[#0066ff] hover:underline flex items-center gap-1">
                  Launch Studio <LuChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>

          {/* Row 2: 2 wide cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Card 4: Document Hub */}
            <div className="p-6 sm:p-7 rounded-3xl bg-white border border-slate-200/90 shadow-sm hover:shadow-md transition flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#0066ff] flex items-center justify-center font-bold">
                    <LuLayers className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-blue-50 text-[#0066ff] border border-blue-200">
                    20+ Formats
                  </span>
                </div>
                <h3 className="text-xl font-bold text-slate-900">Document Hub</h3>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                  Convert effortlessly between Word, PowerPoint, Excel, PDF, Markdown, HTML, and high-resolution raster formats while preserving quality.
                </p>
              </div>
              <div className="pt-6 mt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-500 font-medium">5 Featured Tools</span>
                <Link href={getStudioHref("/app/studios/document-hub")} className="font-bold text-[#0066ff] hover:underline flex items-center gap-1">
                  Launch Studio <LuChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* Card 5: QR & Link Studio */}
            <div className="p-6 sm:p-7 rounded-3xl bg-white border border-slate-200/90 shadow-sm hover:shadow-md transition flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center font-bold">
                    <LuQrCode className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-orange-50 text-orange-600 border border-orange-200">
                    Vector SVG
                  </span>
                </div>
                <h3 className="text-xl font-bold text-slate-900">QR & Link Studio</h3>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                  Design sharp, customized vector QR codes for websites, WiFi network logins, vCard digital business cards, and social profiles with downloadable SVG and high-DPI PNGs.
                </p>
              </div>
              <div className="pt-6 mt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-500 font-medium">5 Featured Tools</span>
                <Link href={getStudioHref("/app/studios/qr-link")} className="font-bold text-[#0066ff] hover:underline flex items-center gap-1">
                  Launch Studio <LuChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>

          {/* Row 3: Office Studio on Left + 3 subcards on Right */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            {/* Card 6: Office Studio (Tall Left Card) */}
            <div className="lg:col-span-4 p-6 sm:p-8 rounded-3xl bg-white border border-slate-200/90 shadow-sm hover:shadow-md transition flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                    <LuFileSpreadsheet className="w-5 h-5" />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                      Office Suite
                    </span>
                    <span className="text-xs text-slate-500 font-mono">4 Tools</span>
                  </div>
                </div>

                <h3 className="text-2xl font-bold text-slate-900">Office Studio</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Create and edit DOCX, PPTX, XLSX and CSV files online with powerful and easy-to-use tools.
                </p>

                <div className="space-y-2.5 pt-2 text-xs text-slate-700 font-medium">
                  <div className="flex items-center gap-2">
                    <LuCheck className="w-4 h-4 text-[#0066ff] shrink-0" />
                    <span>Edit & Convert Files</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <LuCheck className="w-4 h-4 text-[#0066ff] shrink-0" />
                    <span>Templates & Formatting</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <LuCheck className="w-4 h-4 text-[#0066ff] shrink-0" />
                    <span>Work Online, No Installation</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <LuCheck className="w-4 h-4 text-[#0066ff] shrink-0" />
                    <span>Export in Multiple Formats</span>
                  </div>
                </div>
              </div>

              <div className="pt-6">
                <Link
                  href={getStudioHref("/app/studios/office")}
                  className="w-full py-3 rounded-xl bg-[#0066ff] hover:bg-blue-700 text-white font-bold text-xs sm:text-sm text-center shadow transition flex items-center justify-center gap-2"
                >
                  <span>Launch Studio</span>
                  <LuArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* Right Container: Security Studio (top) + TrendRank & Compress (bottom) */}
            <div className="lg:col-span-8 flex flex-col justify-between gap-6">
              {/* Card 7: Security & E-Signature */}
              <div className="p-6 sm:p-7 rounded-3xl bg-white border border-slate-200/90 shadow-sm hover:shadow-md transition flex flex-col justify-between flex-1">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                      <LuShieldCheck className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200">
                      AES-256 Safe
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-slate-900">Security & E-Signature</h3>
                  <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                    Encrypt, redact and sign documents securely with AES-256 encryption and advanced security tools.
                  </p>
                </div>
                <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-500 font-medium">4 Featured Tools</span>
                  <Link href={getStudioHref("/app/studios/security")} className="font-bold text-[#0066ff] hover:underline flex items-center gap-1">
                    Launch Studio <LuChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>

              {/* Bottom 2 subcards: TrendRank AI & Compress & Enhance */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Card 8: TrendRank AI */}
                <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-sm hover:shadow-md transition flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
                        <LuTrendingUp className="w-4 h-4" />
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-purple-50 text-purple-600 border border-purple-200">
                          SEO Insights
                        </span>
                        <span className="text-[11px] text-slate-400 font-mono">4 Tools</span>
                      </div>
                    </div>
                    <h4 className="text-lg font-bold text-slate-900">TrendRank AI</h4>
                    <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                      Explore search queries, keyword gaps and monitor topic momentum with AI.
                    </p>
                  </div>
                  <div className="pt-4 mt-3 border-t border-slate-100 text-right">
                    <Link href={getStudioHref("/app/studios/trendrank")} className="text-xs font-bold text-[#0066ff] hover:underline inline-flex items-center gap-1">
                      Launch Studio <LuChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>

                {/* Card 9: Compress & Enhance */}
                <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-sm hover:shadow-md transition flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                        <LuMinimize2 className="w-4 h-4" />
                      </div>
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-600 border border-amber-200">
                        Up to -85%
                      </span>
                    </div>
                    <h4 className="text-lg font-bold text-slate-900">Compress & Enhance</h4>
                    <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                      Reduce PDF and image file sizes without losing quality and enhance with AI-powered tools.
                    </p>
                  </div>
                  <div className="pt-4 mt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-slate-500 font-medium">4 Featured Tools</span>
                    <Link href={getStudioHref("/app/studios/compress")} className="font-bold text-[#0066ff] hover:underline flex items-center gap-1">
                      Launch Studio <LuChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= SECTION 5: WHY CONSOLIDATE ON XSW TOOLS? ================= */}
      <section className="relative z-10 py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200/80 text-xs font-bold text-[#0066ff] mb-3">
            <LuChartColumn className="w-3.5 h-3.5" />
            <span>SMARTER CHOICE</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
            Why Consolidate on <span className="text-[#0066ff]">XSW Tools?</span>
          </h2>
          <p className="mt-3 text-sm sm:text-base text-slate-500">
            Compare the fragmented cost of buying isolated SaaS apps against our unified studio.
          </p>
        </div>

        {/* Side-by-side comparison container with center VS circle */}
        <div className="relative max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
          {/* Left Card: Fragmented Subscriptions */}
          <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200/90 shadow-[0_4px_24px_rgba(0,0,0,0.03)] flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-3 mb-5">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-rose-100 to-rose-50 border border-rose-200/60 text-rose-500 flex items-center justify-center font-bold shadow-xs shrink-0">
                    <LuLayers className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-tight">Fragmented Subscriptions</h3>
                    <p className="text-xs text-slate-500 mt-1 leading-snug">Multiple tools, multiple logins, higher cost.</p>
                  </div>
                </div>
                <div className="px-3.5 py-2 rounded-2xl bg-[#fff1f2] border border-rose-200/60 text-right shrink-0 shadow-2xs">
                  <div className="text-sm sm:text-base font-extrabold text-[#e11d48] whitespace-nowrap leading-tight">~$90 / month</div>
                  <div className="text-[11px] text-slate-400 font-normal leading-tight mt-0.5 whitespace-nowrap text-center sm:text-right">(Estimated)</div>
                </div>
              </div>

              {/* List of Apps */}
              <div className="space-y-3 text-xs sm:text-sm text-slate-700">
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50/80 border border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-[#e11d48] text-white flex items-center justify-center font-black text-sm shrink-0 shadow-xs">
                      A
                    </div>
                    <div>
                      <span className="font-bold text-slate-900">Adobe Acrobat Pro</span>
                      <p className="text-[11px] text-slate-500">PDF operations</p>
                    </div>
                  </div>
                  <span className="font-semibold text-slate-600 text-xs sm:text-sm">$23.99 / mo</span>
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50/80 border border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden relative flex items-center justify-center shrink-0 shadow-xs" style={{ backgroundImage: "linear-gradient(45deg, #cbd5e1 25%, transparent 25%), linear-gradient(-45deg, #cbd5e1 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #cbd5e1 75%), linear-gradient(-45deg, transparent 75%, #cbd5e1 75%)", backgroundSize: "6px 6px", backgroundPosition: "0 0, 0 3px, 3px -3px, -3px 0px" }}>
                      <LuImage className="w-4 h-4 text-slate-700" />
                    </div>
                    <div>
                      <span className="font-bold text-slate-900">Remove.bg</span>
                      <p className="text-[11px] text-slate-500">Background cutouts</p>
                    </div>
                  </div>
                  <span className="font-semibold text-slate-600 text-xs sm:text-sm">$9.00 / mo</span>
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50/80 border border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-[#10a37f] text-white flex items-center justify-center shrink-0 shadow-xs">
                      <LuSparkles className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="font-bold text-slate-900">ChatPDF / AI Reader</span>
                      <p className="text-[11px] text-slate-500">Document analysis</p>
                    </div>
                  </div>
                  <span className="font-semibold text-slate-600 text-xs sm:text-sm">$15.00 / mo</span>
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50/80 border border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-[#7c3aed] text-white flex items-center justify-center shrink-0 shadow-xs">
                      <LuPenLine className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="font-bold text-slate-900">DocuSign</span>
                      <p className="text-[11px] text-slate-500">Digital signatures</p>
                    </div>
                  </div>
                  <span className="font-semibold text-slate-600 text-xs sm:text-sm">$10.00 / mo</span>
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50/80 border border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-[#ff5a00] text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
                      St
                    </div>
                    <div>
                      <span className="font-bold text-slate-900">Ahrefs / Semrush Lite</span>
                      <p className="text-[11px] text-slate-500">Keyword search data</p>
                    </div>
                  </div>
                  <span className="font-semibold text-slate-600 text-xs sm:text-sm">$29.00 / mo</span>
                </div>
              </div>
            </div>

            {/* Red Callout Box at Bottom */}
            <div className="mt-6 p-4 rounded-2xl bg-[#fff1f2] border border-rose-200/70 flex items-center gap-3 text-rose-700">
              <div className="w-7 h-7 rounded-full bg-rose-500 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
                <LuX className="w-4 h-4 stroke-[3]" />
              </div>
              <div className="text-xs">
                <span className="font-extrabold text-sm text-rose-600 block">Total: ~$90 / month</span>
                <span className="text-slate-500 mt-0.5 block">Fragmented tools, separate logins, higher overhead.</span>
              </div>
            </div>
          </div>

          {/* Center VS Badge */}
          <div className="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white border border-slate-200 shadow-md items-center justify-center text-xs font-black text-[#0066ff] z-20">
            VS
          </div>

          {/* Right Card: XSW Tools */}
          <div className="p-6 sm:p-8 rounded-3xl bg-white border border-blue-200/90 shadow-[0_4px_30px_rgba(0,102,255,0.06)] flex flex-col justify-between relative overflow-hidden">
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-3 mb-5">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="w-11 h-11 rounded-2xl bg-[#0066ff] text-white flex items-center justify-center font-bold shadow-sm shadow-blue-500/25 shrink-0">
                    <LuBox className="w-5 h-5 stroke-[2.2]" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-tight">XSW Tools</h3>
                    <p className="text-xs text-[#0066ff] font-medium mt-1 leading-snug">All 9 Studios, One Powerful Platform.</p>
                  </div>
                </div>
                <div className="px-4 py-2 rounded-2xl bg-[#e0edff] border border-blue-200/70 text-center shrink-0 shadow-2xs">
                  <div className="text-sm sm:text-base font-extrabold text-[#0066ff] whitespace-nowrap leading-tight">₹299 / month</div>
                  <div className="text-[11px] text-[#0066ff]/80 font-medium leading-tight mt-0.5 whitespace-nowrap">(~$3.5)</div>
                </div>
              </div>

              {/* Benefits with Checked Circles */}
              <div className="space-y-3.5 text-xs sm:text-sm text-slate-700 font-medium">
                <div className="flex items-center gap-3 p-2.5 rounded-xl bg-blue-50/40">
                  <div className="w-5 h-5 rounded-full bg-[#0066ff] text-white flex items-center justify-center shrink-0 shadow-2xs">
                    <LuCheck className="w-3 h-3 stroke-[3]" />
                  </div>
                  <span>All 9 Studios unified under 1 single login</span>
                </div>

                <div className="flex items-center gap-3 p-2.5 rounded-xl bg-blue-50/40">
                  <div className="w-5 h-5 rounded-full bg-[#0066ff] text-white flex items-center justify-center shrink-0 shadow-2xs">
                    <LuCheck className="w-3 h-3 stroke-[3]" />
                  </div>
                  <span>Zero telemetry client-side processing</span>
                </div>

                <div className="flex items-center gap-3 p-2.5 rounded-xl bg-blue-50/40">
                  <div className="w-5 h-5 rounded-full bg-[#0066ff] text-white flex items-center justify-center shrink-0 shadow-2xs">
                    <LuCheck className="w-3 h-3 stroke-[3]" />
                  </div>
                  <span>40+ production tools with unlimited conversions</span>
                </div>

                <div className="flex items-center gap-3 p-2.5 rounded-xl bg-blue-50/40">
                  <div className="w-5 h-5 rounded-full bg-[#0066ff] text-white flex items-center justify-center shrink-0 shadow-2xs">
                    <LuCheck className="w-3 h-3 stroke-[3]" />
                  </div>
                  <span>25 GB cloud storage &amp; priority compute queue</span>
                </div>

                <div className="flex items-center gap-3 p-2.5 rounded-xl bg-blue-50/40">
                  <div className="w-5 h-5 rounded-full bg-[#0066ff] text-white flex items-center justify-center shrink-0 shadow-2xs">
                    <LuCheck className="w-3 h-3 stroke-[3]" />
                  </div>
                  <span>Save over 90% in monthly software overhead</span>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-4">
              <Link
                href={isAuthenticated ? "/app" : "/signup"}
                className="w-full py-4 rounded-xl bg-[#0066ff] hover:bg-blue-700 text-white font-extrabold text-sm shadow-md shadow-blue-500/25 transition flex items-center justify-center gap-2 active:scale-[0.98]"
              >
                <span>Get Started with XSW Tools</span>
                <LuArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ================= SECTION 6: MADE FOR EVERY CREATOR, TEAM AND BUSINESS ================= */}
      <section className="relative z-10 py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-10">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Made for Every Creator, Team and Business
          </h2>
          <p className="mt-2 text-sm sm:text-base text-slate-500">
            From daily tasks to professional projects — XSPACEWEB Studio helps everyone work smarter.
          </p>
        </div>

        {/* 5 Persona Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
          {PERSONAS_DATA.map((p) => {
            const Icon = p.icon;
            return (
              <div
                key={p.name}
                className={`p-3.5 sm:p-4 rounded-2xl border ${p.bg} transition-all hover:scale-102 flex items-center gap-3 shadow-2xs`}
              >
                <div className="w-10 h-10 rounded-full bg-white shadow-xs flex items-center justify-center shrink-0">
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 leading-snug">{p.name}</h4>
                  <p className="text-xs text-slate-500 mt-0.5 leading-snug">{p.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ================= SECTION 7: LATEST TOOLS ================= */}
      <section className="relative z-10 py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Latest Tools
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Discover our newest and most powerful tools.
            </p>
          </div>
          <Link
            href="/app"
            className="text-xs sm:text-sm font-bold text-[#0066ff] hover:underline inline-flex items-center gap-1"
          >
            <span>View All Tools</span>
            <LuArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* 4 Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {LATEST_TOOLS_DATA.map((tool) => {
            const BadgeIcon = tool.badgeIcon;
            return (
              <div
                key={tool.id}
                className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:shadow-md hover:border-blue-300 transition-all flex flex-col justify-between group h-[225px]"
              >
                <div className="flex items-start justify-between">
                  <div className={`w-9 h-9 rounded-xl ${tool.badgeBg} flex items-center justify-center font-black text-xs shadow-xs shrink-0`}>
                    {BadgeIcon ? <BadgeIcon className="w-5 h-5 text-white" /> : tool.badge}
                  </div>
                  <img
                    src={tool.illustration}
                    alt={tool.name}
                    className="w-24 h-20 object-contain object-right-top pointer-events-none select-none -mt-1 -mr-1"
                  />
                </div>

                <div className="flex items-end justify-between mt-3">
                  <div>
                    <h4 className="text-sm sm:text-base font-bold text-slate-900 group-hover:text-[#0066ff] transition">
                      {tool.name}
                    </h4>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                      {tool.desc}
                    </p>
                  </div>

                  <Link
                    href={getStudioHref(tool.href)}
                    className="w-8 h-8 rounded-full border border-blue-200 bg-white text-[#0066ff] flex items-center justify-center shadow-2xs group-hover:bg-[#0066ff] group-hover:text-white transition shrink-0 ml-3"
                  >
                    <LuArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ================= SECTION 8: IMAGE EDITING MADE SIMPLE ================= */}
      <section className="relative z-10 py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="rounded-3xl border border-slate-200/90 bg-white shadow-sm p-8 sm:p-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left side: Exact Background Removal Graphic */}
            <div className="lg:col-span-6 flex items-center justify-center">
              <div className="relative w-full max-w-md rounded-2xl overflow-hidden flex items-center justify-center">
                <img
                  src="/banners/image_editing_preview.png"
                  alt="Image editing made simple"
                  className="w-full h-auto object-contain max-h-[380px] drop-shadow-sm select-none"
                />
              </div>
            </div>

            {/* Right side: Copy & Button */}
            <div className="lg:col-span-6 space-y-4">
              <span className="inline-block px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-xs font-bold text-[#0066ff]">
                AI Powered
              </span>
              <h3 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                Image editing made simple
              </h3>
              <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                Remove backgrounds, enhance images, resize, compress and more — all powered by AI.
              </p>
              <div className="pt-2">
                <Link
                  href={getStudioHref("/app/studios/background")}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-[#0066ff] text-[#0066ff] hover:bg-blue-50 font-bold text-xs sm:text-sm transition"
                >
                  <span>Explore Image Tools</span>
                  <LuArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= SECTION 9 & 10: TRUST BAR & SIMPLE, HONEST PRICING ================= */}
      <section id="pricing" className="relative z-10 py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {/* Top Trust Bar from PDF */}
        <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-12 text-slate-700 font-bold text-xs sm:text-sm pb-12 mb-6 border-b border-slate-200/60 max-w-4xl mx-auto">
          <div className="flex items-center gap-2.5">
            <LuShieldCheck className="w-5 h-5 text-slate-800" />
            <span>100% Secure</span>
          </div>
          <div className="flex items-center gap-2.5">
            <LuZap className="w-5 h-5 text-slate-800" />
            <span>Blazing Fast</span>
          </div>
          <div className="flex items-center gap-2.5">
            <LuLayers className="w-5 h-5 text-slate-800" />
            <span>40+ Tools</span>
          </div>
          <div className="flex items-center gap-2.5">
            <LuUsers className="w-5 h-5 text-slate-800" />
            <span>Trusted Worldwide</span>
          </div>
        </div>

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

          {/* Monthly / Yearly Toggle */}
          <div className="pt-6 flex items-center justify-center gap-2">
            <div className="inline-flex p-1 bg-white rounded-2xl border border-slate-200 shadow-xs text-xs font-semibold">
              <button
                type="button"
                onClick={() => setBillingCycle("monthly")}
                className={`px-4 py-2 rounded-xl transition ${
                  billingCycle === "monthly"
                    ? "bg-[#0066ff] text-white shadow-xs font-bold"
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
                    ? "bg-[#0066ff] text-white shadow-xs font-bold"
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

        {/* 2 Pricing Cards */}
        <div className="relative max-w-4xl mx-auto">
          {/* Subtle decorative layered backdrops matching the PDF design */}
          <div className="hidden md:block absolute -inset-4 bg-gradient-to-r from-blue-100/40 via-sky-50/20 to-blue-100/40 rounded-[2.5rem] -z-10 blur-xs" />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
            {/* Card 1: FREE FOREVER */}
            <div className="p-8 rounded-3xl bg-white border border-slate-200/90 shadow-sm flex flex-col justify-between">
              <div className="space-y-6">
                <div>
                  <span className="text-xs font-mono uppercase tracking-wider text-slate-500 font-bold">
                    FREE FOREVER
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
                    <LuCheck className="w-4 h-4 text-[#0066ff] shrink-0" />
                    <span>Access to all 9 Studio interfaces</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <LuCheck className="w-4 h-4 text-[#0066ff] shrink-0" />
                    <span>5 Free AI Document Analysis Credits</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <LuCheck className="w-4 h-4 text-[#0066ff] shrink-0" />
                    <span>5 Free Background Matting Credits</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <LuCheck className="w-4 h-4 text-[#0066ff] shrink-0" />
                    <span>20 High-Resolution Vector QR Codes</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <LuCheck className="w-4 h-4 text-[#0066ff] shrink-0" />
                    <span>1 GB Secure Cloud Storage</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <LuCheck className="w-4 h-4 text-[#0066ff] shrink-0" />
                    <span>Max 25 MB file size limit</span>
                  </div>
                </div>
              </div>

              <div className="pt-8">
                <Link
                  href={isAuthenticated ? "/app" : "/signup"}
                  className="w-full py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-900 font-bold rounded-xl text-sm transition flex items-center justify-center gap-2"
                >
                  <span>Start Free Workspace</span>
                  <LuArrowRight className="w-4 h-4" />
                </Link>
                <p className="text-[11px] text-center text-slate-400 mt-2">
                  No credit card required &bull; Instant activation
                </p>
              </div>
            </div>

            {/* Card 2: PRO STUDIO SUITE */}
            <div className="p-8 rounded-3xl bg-white border-2 border-[#0066ff] shadow-xl flex flex-col justify-between relative overflow-hidden">
              <div className="absolute top-4 right-4">
                <span className="px-3 py-1 rounded-full bg-[#0066ff] text-white text-xs font-black uppercase tracking-wider">
                  RECOMMENDED
                </span>
              </div>

              <div className="space-y-6">
                <div>
                  <span className="text-xs font-mono uppercase tracking-wider text-[#0066ff] font-bold">
                    PRO STUDIO SUITE
                  </span>
                  <div className="flex items-baseline gap-1 mt-2">
                    <span className="text-5xl font-black text-slate-900 tracking-tight">
                      ₹{billingCycle === "yearly" ? 208 : 299}
                    </span>
                    <span className="text-sm text-slate-500 font-medium">/ month</span>
                  </div>
                  <div className="text-xs text-[#0066ff] mt-1 font-mono font-semibold">
                    {billingCycle === "yearly" ? "Billed annually at ₹2,499 / year" : "Billed monthly at ₹299"}
                  </div>
                  <p className="text-xs text-slate-600 mt-2">
                    Unrestricted capability for professionals, businesses, and creators needing high volume and fast queues.
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-100 space-y-3 text-xs sm:text-sm text-slate-800">
                  <div className="flex items-center gap-2.5">
                    <LuCheck className="w-4 h-4 text-[#0066ff] shrink-0" />
                    <span className="font-bold text-slate-900">Priority Compute Processing Queue</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <LuCheck className="w-4 h-4 text-[#0066ff] shrink-0" />
                    <span>75 Monthly AI Document Intelligence Credits</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <LuCheck className="w-4 h-4 text-[#0066ff] shrink-0" />
                    <span>75 Monthly AI Background Matting Credits</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <LuCheck className="w-4 h-4 text-[#0066ff] shrink-0" />
                    <span>500 Dynamic Custom QR Codes &amp; Analytics</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <LuCheck className="w-4 h-4 text-[#0066ff] shrink-0" />
                    <span>25 GB Cloud Storage &amp; 30-Day File Retention</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <LuCheck className="w-4 h-4 text-[#0066ff] shrink-0" />
                    <span>100 MB Max File Upload Limit</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <LuCheck className="w-4 h-4 text-[#0066ff] shrink-0" />
                    <span>Unlimited PDF &amp; Document Format Conversions</span>
                  </div>
                </div>
              </div>

              <div className="pt-8">
                <Link
                  href="/app"
                  className="w-full py-3.5 bg-[#0066ff] hover:bg-blue-700 text-white font-extrabold rounded-xl text-sm transition shadow-md flex items-center justify-center gap-2 active:scale-[0.98]"
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

      {/* ================= SECTION 11: PRIVACY & SPEED ================= */}
      <section id="architecture" className="relative z-10 py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-xs font-bold text-[#0066ff] mb-3">
            <LuLock className="w-3.5 h-3.5" />
            <span>PRIVACY &amp; SPEED</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
            Enterprise Grade Privacy &amp; Sub-150ms Speed
          </h2>
          <p className="mt-3 text-sm sm:text-base text-slate-600">
            Built on WebAssembly and modern zero-telemetry architectures.
          </p>
        </div>

        {/* Architecture cards use interface-style icon illustrations, not cropped screenshots. */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-7 sm:p-8 rounded-3xl bg-white border border-slate-200/90 shadow-sm hover:shadow-md transition flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#0066ff] flex items-center justify-center font-bold mb-4">
                <LuZap className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Sub-150ms Execution</h3>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                Client-side WASM engine processes PDF restructuring, image compressions, and QR renderings right on your device for instant results.
              </p>
            </div>
            <div aria-hidden="true" className="relative mt-6 flex h-36 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-blue-50 via-white to-indigo-50">
              <div className="absolute h-28 w-28 rounded-full bg-blue-100/70 blur-2xl" />
              <div className="relative flex -translate-x-5 -rotate-6 items-center gap-3 rounded-2xl border border-blue-100 bg-white/95 p-4 shadow-lg shadow-blue-900/10">
                <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <LuFileText className="h-6 w-6" />
                </span>
                <span className="space-y-2">
                  <span className="block h-2 w-24 rounded-full bg-slate-200" />
                  <span className="block h-2 w-16 rounded-full bg-slate-100" />
                  <span className="block h-2 w-20 rounded-full bg-slate-100" />
                </span>
              </div>
              <div className="absolute right-[18%] top-5 flex h-12 w-12 items-center justify-center rounded-2xl border border-indigo-100 bg-white text-indigo-600 shadow-md shadow-indigo-900/10">
                <LuCpu className="h-6 w-6" />
              </div>
              <div className="absolute bottom-4 right-[22%] flex h-10 w-10 items-center justify-center rounded-full border border-amber-100 bg-white text-amber-500 shadow-md shadow-amber-900/10">
                <LuZap className="h-5 w-5" />
              </div>
            </div>
          </div>

          <div className="p-7 sm:p-8 rounded-3xl bg-white border border-slate-200/90 shadow-sm hover:shadow-md transition flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#0066ff] flex items-center justify-center font-bold mb-4">
                <LuLock className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Zero Model Training</h3>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                Your confidential documents and uploaded images are never stored or used to train third-party AI models. Scratch queues auto-purge within 24 hours.
              </p>
            </div>
            <div aria-hidden="true" className="relative mt-6 flex h-36 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-sky-50 via-white to-blue-50">
              <div className="absolute h-28 w-28 rounded-full bg-sky-100/70 blur-2xl" />
              <div className="relative -translate-x-6 -rotate-6 rounded-2xl border border-sky-100 bg-white p-3 shadow-lg shadow-blue-900/10">
                <LuFileText className="h-12 w-12 text-sky-600" strokeWidth={1.7} />
              </div>
              <div className="relative z-10 -ml-4 translate-y-2 rounded-2xl border border-blue-100 bg-white p-3 shadow-lg shadow-blue-900/10">
                <LuDatabase className="h-12 w-12 text-blue-600" strokeWidth={1.7} />
              </div>
              <div className="absolute bottom-4 right-[20%] flex h-11 w-11 items-center justify-center rounded-full border border-emerald-100 bg-white text-emerald-600 shadow-md shadow-emerald-900/10">
                <LuShieldCheck className="h-6 w-6" />
              </div>
            </div>
          </div>

          <div className="p-7 sm:p-8 rounded-3xl bg-white border border-slate-200/90 shadow-sm hover:shadow-md transition flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#0066ff] flex items-center justify-center font-bold mb-4">
                <LuLayers className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Interconnected Studio State</h3>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                Send an output file from PDF Studio directly into AI Document Summarizer, or from Background Studio into Office Slide Builder with one click.
              </p>
            </div>
            <div aria-hidden="true" className="relative mt-6 flex h-36 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-violet-50 via-white to-orange-50">
              <div className="absolute left-[22%] right-[22%] top-1/2 h-px -translate-y-1/2 bg-gradient-to-r from-blue-200 via-violet-300 to-orange-200" />
              <div className="relative z-10 flex h-14 w-14 -translate-x-3 items-center justify-center rounded-2xl border border-blue-100 bg-white text-blue-600 shadow-md shadow-blue-900/10">
                <LuFileText className="h-7 w-7" />
              </div>
              <div className="relative z-20 -mx-2 flex h-16 w-16 items-center justify-center rounded-2xl border border-violet-100 bg-white text-violet-600 shadow-lg shadow-violet-900/10">
                <LuSparkles className="h-7 w-7" />
              </div>
              <div className="relative z-10 flex h-14 w-14 translate-x-3 items-center justify-center rounded-2xl border border-orange-100 bg-white text-orange-500 shadow-md shadow-orange-900/10">
                <LuFileSpreadsheet className="h-7 w-7" />
              </div>
              <div className="absolute left-[31%] top-8 flex h-8 w-8 items-center justify-center rounded-full border border-blue-100 bg-white text-blue-500 shadow-sm">
                <LuArrowRight className="h-4 w-4" />
              </div>
              <div className="absolute right-[29%] bottom-7 flex h-8 w-8 items-center justify-center rounded-full border border-violet-100 bg-white text-violet-500 shadow-sm">
                <LuArrowRight className="h-4 w-4" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= SECTION 12: FREQUENTLY ASKED QUESTIONS ================= */}
      <section id="faq" className="relative z-10 py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="rounded-3xl border border-blue-200/60 bg-gradient-to-br from-blue-50/70 via-sky-50/40 to-indigo-50/50 p-8 sm:p-12 shadow-sm">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left side: Heading & Still Have Questions Card */}
            <div className="lg:col-span-5 space-y-6">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-blue-200 text-xs font-bold text-[#0066ff]">
                <LuCircleHelp className="w-3.5 h-3.5" />
                <span>Your Questions, Answered</span>
              </div>

              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                Frequently Asked <span className="text-[#0066ff]">Questions</span>
              </h2>

              <p className="text-sm text-slate-600 leading-relaxed">
                Get clear answers about XSW Tools features, pricing, security and usage. If you still have questions, we&apos;re here to help.
              </p>

              {/* Still Have Questions Box */}
              <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3">
                <h4 className="text-base font-bold text-slate-900">Still Have Questions?</h4>
                <p className="text-xs text-slate-500">
                  Can&apos;t find what you&apos;re looking for? Our team is always here to help.
                </p>
                <div className="pt-1">
                  <Link
                    href="/contact"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0066ff] hover:bg-blue-700 text-white font-bold text-xs shadow transition"
                  >
                    <span>Book a Demo</span>
                    <LuArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>

            {/* Right side: Accordion Cards */}
            <div className="lg:col-span-7 space-y-3.5">
              {FAQ_ITEMS.map((item) => {
                const isOpen = expandedFaq === item.id;
                return (
                  <div
                    key={item.id}
                    className="rounded-2xl bg-white border border-slate-200 shadow-2xs overflow-hidden transition"
                  >
                    <button
                      type="button"
                      onClick={() => setExpandedFaq(isOpen ? null : item.id)}
                      aria-expanded={isOpen}
                      aria-controls={`faq-answer-${item.id}`}
                      className="w-full p-5 text-left flex items-center justify-between gap-4 font-bold text-slate-900 text-sm sm:text-base hover:text-[#0066ff] transition cursor-pointer"
                    >
                      <span>{item.question}</span>
                      <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 shrink-0">
                        <LuChevronDown
                          className={`w-4 h-4 transition-transform duration-200 ${
                            isOpen ? "rotate-180 text-[#0066ff]" : ""
                          }`}
                        />
                      </div>
                    </button>
                    {isOpen && (
                      <div
                        id={`faq-answer-${item.id}`}
                        className="px-5 pb-5 pt-0 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-50"
                      >
                        {item.answer}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ================= SECTION 13: BIG CALL TO ACTION BANNER ================= */}
      <section className="relative z-10 py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="relative rounded-3xl bg-[#0066ff] text-white p-10 sm:p-16 text-center shadow-xl overflow-hidden">
          {/* Vertical stripe graphic overlay */}
          <div
            className="absolute inset-0 opacity-15 pointer-events-none"
            style={{
              backgroundImage:
                "repeating-linear-gradient(90deg, transparent, transparent 40px, rgba(255,255,255,0.4) 40px, rgba(255,255,255,0.4) 80px)",
            }}
          />

          <div className="relative z-10 max-w-2xl mx-auto space-y-5">
            <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight">
              Get started today and unlock the power of our solutions.
            </h2>
            <p className="text-sm sm:text-base text-blue-100 leading-relaxed">
              Experience the all-in-one workspace designed for creators, teams, and fast-growing businesses.
            </p>
            <div className="pt-4">
              <Link
                href={isAuthenticated ? "/app" : "/signup"}
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-white hover:bg-slate-100 text-slate-900 font-extrabold text-sm sm:text-base shadow-lg transition active:scale-[0.98]"
              >
                <span>Start 14 Days Free Trial</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
