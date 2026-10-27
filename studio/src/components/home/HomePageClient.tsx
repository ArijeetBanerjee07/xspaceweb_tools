"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
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
  LuMaximize2,
  LuGlobe,
  LuImage,
} from "react-icons/lu";
import {
  FaXTwitter,
  FaLinkedinIn,
  FaYoutube,
  FaInstagram,
  FaFacebookF,
  FaFilePdf,
} from "react-icons/fa6";
import { Navbar } from "@/components/navigation/Navbar";

// Studios Data matching the PDF specifications
const STUDIOS_DATA = [
  {
    id: "pdf",
    name: "PDF Studio",
    tagline: "High-Performance Vector PDF Processing & OCR",
    desc: "Complete online PDF toolbox: merge multi-page documents, split pages, compress file size up to 85%, stamp watermarks, and extract editable text with neural OCR.",
    href: "/app/studios/pdf",
    previewImage: "/studios/pdf.jpg",
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
    previewImage: "/studios/ai-document.jpg",
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
    previewImage: "/studios/background.jpg",
    icon: LuScissors,
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
    previewImage: "/studios/document-hub.jpg",
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
    previewImage: "/studios/office.jpg",
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
    previewImage: "/studios/security.jpg",
    icon: LuShieldCheck,
    badge: "AES-256 Safe",
    badgeColor: "bg-emerald-50 text-emerald-600 border-emerald-200",
    colorHex: "#059669",
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
    previewImage: "/studios/compress.jpg",
    icon: LuMinimize2,
    badge: "Up to -85%",
    badgeColor: "bg-amber-50 text-amber-600 border-amber-200",
    colorHex: "#d97706",
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
    previewImage: "/studios/qr-link.jpg",
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
    previewImage: "/studios/trendrank.jpg",
    icon: LuTrendingUp,
    badge: "SEO Insights",
    badgeColor: "bg-purple-50 text-purple-600 border-purple-200",
    colorHex: "#9333ea",
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

// 5 Persona groups from the design
const PERSONAS_DATA = [
  {
    name: "Individuals",
    desc: "Personal productivity",
    icon: LuUser,
    bg: "bg-blue-50/70 border-blue-100/80 text-blue-600",
  },
  {
    name: "Students",
    desc: "Learn and create",
    icon: LuGraduationCap,
    bg: "bg-emerald-50/70 border-emerald-100/80 text-emerald-600",
  },
  {
    name: "Creators",
    desc: "Design and content",
    icon: LuPalette,
    bg: "bg-amber-50/70 border-amber-100/80 text-amber-600",
  },
  {
    name: "Teams",
    desc: "Collaborate and share",
    icon: LuUsers,
    bg: "bg-purple-50/70 border-purple-100/80 text-purple-600",
  },
  {
    name: "Businesses",
    desc: "Scale your workflow",
    icon: LuBuilding2,
    bg: "bg-sky-50/70 border-sky-100/80 text-sky-600",
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
    badgeBg: "bg-purple-600 text-white",
    cardBg: "bg-purple-50/50",
  },
  {
    id: "bg-remover",
    name: "Image Background Remover",
    desc: "Remove and replace backgrounds with AI.",
    href: "/app/studios/background",
    badge: "Image",
    badgeBg: "bg-emerald-600 text-white",
    cardBg: "bg-emerald-50/50",
  },
  {
    id: "secure-pdf",
    name: "Secure PDF",
    desc: "Protect, encrypt and lock your PDF files.",
    href: "/app/studios/security",
    badge: "Security",
    badgeBg: "bg-blue-600 text-white",
    cardBg: "bg-blue-50/50",
  },
  {
    id: "qr-analytics",
    name: "QR Code with Analytics",
    desc: "Create QR codes and track engagement.",
    href: "/app/studios/qr-link",
    badge: "QR",
    badgeBg: "bg-rose-500 text-white",
    cardBg: "bg-rose-50/50",
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
        tool.studioName.toLowerCase().includes(selectedCategory.toLowerCase());
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
                  src="/logo-spheres.png?v=5"
                  alt="XSW Tools"
                  className="w-24 h-24 sm:w-32 sm:h-32 object-contain drop-shadow-[0_12px_28px_rgba(59,130,246,0.32)] group-hover:scale-105 transition-transform duration-300"
                />
              </div>

              {/* Orbiting Floating Cards matching the design */}
              {/* 1. PDF Card (Top Left - ~11 o'clock) */}
              <div className="absolute top-2 left-12 sm:top-4 sm:left-20 z-10 w-16 h-16 sm:w-20 sm:h-20 rounded-2xl sm:rounded-3xl bg-white shadow-[0_12px_28px_rgba(0,0,0,0.08)] border border-slate-100 flex items-center justify-center hover:scale-110 hover:shadow-xl transition-all duration-300 cursor-pointer">
                <FaFilePdf className="w-8 h-8 sm:w-10 sm:h-10 text-[#ef4444]" />
              </div>

              {/* 2. AI Card (Top Right - ~1 o'clock) */}
              <div className="absolute top-0 right-12 sm:top-2 sm:right-20 z-10 w-16 h-16 sm:w-20 sm:h-20 rounded-2xl sm:rounded-3xl bg-white shadow-[0_12px_28px_rgba(0,0,0,0.08)] border border-slate-100 flex items-center justify-center hover:scale-110 hover:shadow-xl transition-all duration-300 cursor-pointer">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-gradient-to-tr from-[#0066ff] to-[#3b82f6] shadow-sm flex items-center justify-center text-white font-extrabold text-sm sm:text-base tracking-tight">
                  AI
                </div>
              </div>

              {/* 3. Image Card (Center Right - ~3 o'clock) */}
              <div className="absolute top-36 -right-2 sm:top-48 sm:-right-4 z-10 w-16 h-16 sm:w-20 sm:h-20 rounded-2xl sm:rounded-3xl bg-white shadow-[0_12px_28px_rgba(0,0,0,0.08)] border border-slate-100 flex items-center justify-center hover:scale-110 hover:shadow-xl transition-all duration-300 cursor-pointer">
                <LuImage className="w-8 h-8 sm:w-10 sm:h-10 text-[#10b981]" strokeWidth={2.2} />
              </div>

              {/* 4. Security Shield (Bottom Right - ~4:30 o'clock) */}
              <div className="absolute bottom-3 right-10 sm:bottom-6 sm:right-16 z-10 w-16 h-16 sm:w-20 sm:h-20 rounded-2xl sm:rounded-3xl bg-white shadow-[0_12px_28px_rgba(0,0,0,0.08)] border border-slate-100 flex items-center justify-center hover:scale-110 hover:shadow-xl transition-all duration-300 cursor-pointer">
                <LuShieldCheck className="w-8 h-8 sm:w-10 sm:h-10 text-[#a855f7]" strokeWidth={2.2} />
              </div>

              {/* 5. Document Card (Bottom Center - ~6 o'clock) */}
              <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 sm:-bottom-4 z-10 w-16 h-16 sm:w-20 sm:h-20 rounded-2xl sm:rounded-3xl bg-white shadow-[0_12px_28px_rgba(0,0,0,0.08)] border border-slate-100 flex items-center justify-center hover:scale-110 hover:shadow-xl transition-all duration-300 cursor-pointer">
                <LuFileText className="w-8 h-8 sm:w-10 sm:h-10 text-[#0ea5e9]" strokeWidth={2.2} />
              </div>

              {/* 6. Office / Spreadsheet Card (Lower Left - marked position on outer ring - ~8 o'clock) */}
              <div className="absolute bottom-16 left-2 sm:bottom-24 sm:left-4 lg:bottom-28 lg:left-5 z-10 w-16 h-16 sm:w-20 sm:h-20 rounded-2xl sm:rounded-3xl bg-white shadow-[0_12px_28px_rgba(0,0,0,0.08)] border border-slate-100 flex items-center justify-center hover:scale-110 hover:shadow-xl transition-all duration-300 cursor-pointer">
                <LuFileSpreadsheet className="w-8 h-8 sm:w-10 sm:h-10 text-[#f59e0b]" strokeWidth={2.2} />
              </div>

              {/* 7. QR Code Card (Center Left - ~9 o'clock) */}
              <div className="absolute top-36 -left-2 sm:top-48 sm:-left-4 z-10 w-16 h-16 sm:w-20 sm:h-20 rounded-2xl sm:rounded-3xl bg-white shadow-[0_12px_28px_rgba(0,0,0,0.08)] border border-slate-100 flex items-center justify-center hover:scale-110 hover:shadow-xl transition-all duration-300 cursor-pointer">
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

        {/* 9 Studio Tabs - Wrapped & Centered to never cut off */}
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-2.5 max-w-5xl mx-auto pb-4">
          {STUDIOS_DATA.map((s) => {
            const Icon = s.icon;
            const isActive = s.id === activeStudioId;
            return (
              <button
                key={s.id}
                onClick={() => setActiveStudioId(s.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition border ${
                  isActive
                    ? "bg-[#0066ff] text-white border-[#0066ff] shadow-md font-bold"
                    : "bg-white text-slate-700 border-slate-200/90 hover:bg-slate-50 shadow-2xs"
                }`}
              >
                <Icon
                  className={`w-4 h-4 ${isActive ? "text-white" : ""}`}
                  style={{ color: isActive ? "#ffffff" : s.colorHex }}
                />
                <span>{s.name}</span>
              </button>
            );
          })}
        </div>

        {/* Active Studio Detail Container */}
        <div className="mt-6 rounded-3xl border border-slate-200/90 bg-white shadow-xl overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 items-stretch">
            {/* Left Column: Details, Capabilities, and Operations */}
            <div className="lg:col-span-6 p-6 sm:p-10 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-slate-100">
              <div className="space-y-5">
                <div className="flex items-center gap-2.5">
                  <span className={`px-2.5 py-1 rounded-md text-xs font-mono font-bold border ${activeStudio.badgeColor}`}>
                    {activeStudio.badge}
                  </span>
                  <span className="text-xs text-slate-500 font-mono">
                    Workspace Route: {activeStudio.href}
                  </span>
                </div>

                <div>
                  <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                    {activeStudio.name}
                  </h3>
                  <p className="text-sm sm:text-base font-semibold text-[#0066ff] mt-1">
                    {activeStudio.tagline}
                  </p>
                </div>

                <p className="text-sm text-slate-600 leading-relaxed">
                  {activeStudio.desc}
                </p>

                {/* Specs Box */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-medium">Input Formats:</span>
                    <span className="font-semibold text-slate-800">{activeStudio.inputFormats}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-medium">Output Formats:</span>
                    <span className="font-semibold text-slate-800">{activeStudio.outputFormats}</span>
                  </div>
                </div>

                {/* Featured Operations in Studio */}
                <div className="pt-2 space-y-2">
                  <div className="text-xs font-mono uppercase tracking-wider text-slate-400 font-bold">
                    FEATURED OPERATIONS IN STUDIO
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                    {activeStudio.featuredOps.map((op) => {
                      const OpIcon = op.icon;
                      return (
                        <div
                          key={op.name}
                          className="flex items-center gap-2.5 text-xs sm:text-sm text-slate-700 bg-white border border-slate-200 px-3 py-2 rounded-xl shadow-2xs"
                        >
                          <OpIcon className="w-3.5 h-3.5 text-[#0066ff] shrink-0" />
                          <span className="truncate">{op.name}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-8 flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5">
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

            {/* Right Column: Visual Mockup Showcase matching the PDF */}
            <div className="lg:col-span-6 bg-gradient-to-br from-blue-50/50 via-slate-50 to-indigo-50/40 p-5 sm:p-8 flex flex-col justify-between">
              <div className="relative w-full rounded-2xl border border-slate-200/90 overflow-hidden shadow-xl bg-white flex flex-col group">
                {/* Mac/Browser style title bar */}
                <div className="w-full bg-slate-100/90 border-b border-slate-200 px-4 py-2.5 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-400 border border-red-500/40" />
                    <div className="w-2.5 h-2.5 rounded-full bg-amber-400 border border-amber-500/40" />
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 border border-emerald-500/40" />
                    <span className="text-xs font-semibold text-slate-600 ml-2 font-mono truncate max-w-[180px] sm:max-w-none">
                      {activeStudio.name} — Studio Engine
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[11px] font-bold font-mono">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Live Studio
                  </div>
                </div>

                {/* Studio Interactive Graphic / Screenshot */}
                <div className="relative w-full aspect-[4/3] bg-slate-50 overflow-hidden flex items-center justify-center">
                  <img
                    key={activeStudio.id}
                    src={activeStudio.previewImage}
                    alt={`${activeStudio.name} Interface Preview`}
                    className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
                  />
                  {/* Floating Pill Overlay */}
                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between px-3.5 py-2 rounded-xl bg-white/95 backdrop-blur-md border border-slate-200/80 shadow-md text-xs">
                    <span className="font-semibold text-slate-800 truncate mr-2">
                      {activeStudio.tagline}
                    </span>
                    <span className="font-mono text-[#0066ff] font-bold shrink-0 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                      Vector / 300 DPI
                    </span>
                  </div>
                </div>
              </div>

              {/* Hardware stats */}
              <div className="mt-4 flex flex-wrap items-center justify-between w-full text-xs text-slate-500 font-mono gap-2 pt-2">
                <span className="flex items-center gap-1">
                  <LuZap className="w-3.5 h-3.5 text-blue-600" />
                  Hardware Accelerated
                </span>
                <span className="flex items-center gap-1">
                  <LuLock className="w-3.5 h-3.5 text-emerald-600" />
                  Zero Telemetry
                </span>
                <span className="flex items-center gap-1">
                  <LuCpu className="w-3.5 h-3.5 text-purple-600" />
                  Sub-150ms Processing
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= SECTION 3: ALL TOOLS DIRECTORY ================= */}
      <section id="tools" className="relative z-10 py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-10">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-blue-50 border border-blue-200/80 text-xs font-bold text-[#0066ff] mb-3">
            <LuSearch className="w-3.5 h-3.5" />
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
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-20 py-3.5 bg-white border border-slate-200 rounded-2xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#0066ff] focus:ring-2 focus:ring-[#0066ff]/20 shadow-sm transition"
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
                  Ctrl + K
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Category Filter Pills with Horizontal Scroll */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 scrollbar-none justify-start lg:justify-center max-w-5xl mx-auto mb-10">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition border ${
                selectedCategory === cat
                  ? "bg-[#0066ff] text-white border-[#0066ff] shadow-sm font-bold"
                  : "bg-white text-slate-600 hover:text-slate-900 border-slate-200 hover:bg-slate-50"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* 3-Column Tool Cards Grid matching the PDF */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredTools.slice(0, 18).map((tool) => (
            <div
              key={tool.id}
              className="p-6 rounded-2xl bg-white border border-slate-200/90 hover:border-blue-400 hover:shadow-lg transition-all flex flex-col justify-between group"
            >
              <div>
                {/* Header row: Icon, Studio Badge, Tier Badge */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 text-[#0066ff] flex items-center justify-center font-bold">
                      <LuFileText className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
                      {tool.studioName}
                    </span>
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                      tool.tier === "Free"
                        ? "bg-emerald-50 text-emerald-600 border-emerald-200"
                        : tool.tier === "Starter"
                        ? "bg-blue-50 text-blue-600 border-blue-200"
                        : "bg-purple-50 text-purple-600 border-purple-200"
                    }`}
                  >
                    {tool.tier}
                  </span>
                </div>

                <h4 className="text-base sm:text-lg font-bold text-slate-900 group-hover:text-[#0066ff] transition">
                  {tool.name}
                </h4>
                <p className="text-xs text-slate-600 mt-1.5 line-clamp-2 leading-relaxed">
                  {tool.description}
                </p>
              </div>

              {/* Bottom row: Format & Use Tool */}
              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] text-slate-500 font-mono">
                  Format: {tool.inputFormat.split(",")[0] || ".pdf"}
                </span>
                <Link
                  href={getStudioHref(tool.studioHref)}
                  className="inline-flex items-center gap-1 text-xs font-bold text-[#0066ff] group-hover:translate-x-0.5 transition"
                >
                  <span>Use Tool</span>
                  <LuArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
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
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-xs font-bold text-[#0066ff] mb-3">
            <LuTrendingUp className="w-3.5 h-3.5" />
            <span>SMARTER CHOICE</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
            Why Consolidate on <span className="text-[#0066ff]">XSW Tools?</span>
          </h2>
          <p className="mt-3 text-sm sm:text-base text-slate-600">
            Compare the fragmented cost of buying isolated SaaS apps against our unified studio.
          </p>
        </div>

        {/* Side-by-side comparison container with center VS circle */}
        <div className="relative max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
          {/* Left Card: Fragmented Subscriptions */}
          <div className="p-7 sm:p-9 rounded-3xl bg-white border border-rose-200 shadow-sm flex flex-col justify-between">
            <div className="space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-rose-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
                    <LuLayers className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900">Fragmented Subscriptions</h3>
                    <p className="text-xs text-slate-500">Multiple tools, multiple logins, higher cost.</p>
                  </div>
                </div>
                <span className="px-3 py-1 rounded-full bg-rose-50 text-rose-600 text-xs font-extrabold border border-rose-200">
                  ~$90 / month <span className="font-normal text-[10px]">(Estimated)</span>
                </span>
              </div>

              {/* List of Apps */}
              <div className="space-y-3 text-xs sm:text-sm text-slate-700">
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="flex items-center gap-2.5">
                    <span className="w-6 h-6 rounded-md bg-red-600 text-white text-[11px] font-bold flex items-center justify-center">
                      A
                    </span>
                    <div>
                      <span className="font-semibold text-slate-900">Adobe Acrobat Pro</span>
                      <p className="text-[10px] text-slate-500">PDF operations</p>
                    </div>
                  </div>
                  <span className="font-mono font-semibold text-slate-600">$23.99 / mo</span>
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="flex items-center gap-2.5">
                    <span className="w-6 h-6 rounded-md bg-slate-800 text-white text-[11px] font-bold flex items-center justify-center">
                      R
                    </span>
                    <div>
                      <span className="font-semibold text-slate-900">Remove.bg</span>
                      <p className="text-[10px] text-slate-500">Background cutouts</p>
                    </div>
                  </div>
                  <span className="font-mono font-semibold text-slate-600">$9.00 / mo</span>
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="flex items-center gap-2.5">
                    <span className="w-6 h-6 rounded-md bg-emerald-600 text-white text-[11px] font-bold flex items-center justify-center">
                      C
                    </span>
                    <div>
                      <span className="font-semibold text-slate-900">ChatPDF / AI Reader</span>
                      <p className="text-[10px] text-slate-500">Document analysis</p>
                    </div>
                  </div>
                  <span className="font-mono font-semibold text-slate-600">$15.00 / mo</span>
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="flex items-center gap-2.5">
                    <span className="w-6 h-6 rounded-md bg-purple-600 text-white text-[11px] font-bold flex items-center justify-center">
                      D
                    </span>
                    <div>
                      <span className="font-semibold text-slate-900">DocuSign</span>
                      <p className="text-[10px] text-slate-500">Digital signatures</p>
                    </div>
                  </div>
                  <span className="font-mono font-semibold text-slate-600">$10.00 / mo</span>
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="flex items-center gap-2.5">
                    <span className="w-6 h-6 rounded-md bg-orange-600 text-white text-[11px] font-bold flex items-center justify-center">
                      S
                    </span>
                    <div>
                      <span className="font-semibold text-slate-900">Ahrefs / Semrush Lite</span>
                      <p className="text-[10px] text-slate-500">Keyword search data</p>
                    </div>
                  </div>
                  <span className="font-mono font-semibold text-slate-600">$29.00 / mo</span>
                </div>
              </div>
            </div>

            {/* Red Callout Box at Bottom */}
            <div className="mt-6 p-4 rounded-2xl bg-rose-50 border border-rose-200/80 flex items-center gap-3 text-rose-700">
              <div className="w-7 h-7 rounded-full bg-rose-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
                &times;
              </div>
              <div className="text-xs">
                <span className="font-extrabold text-sm block">Total: ~$90 / month</span>
                <span className="text-rose-600/90">Fragmented tools, separate logins, higher overhead.</span>
              </div>
            </div>
          </div>

          {/* Center VS Badge */}
          <div className="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white border-2 border-slate-200 shadow-md items-center justify-center text-xs font-black text-slate-700 z-20">
            VS
          </div>

          {/* Right Card: XSW Tools */}
          <div className="p-7 sm:p-9 rounded-3xl bg-white border-2 border-[#0066ff] shadow-xl flex flex-col justify-between relative overflow-hidden">
            <div className="space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-blue-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#0066ff] text-white flex items-center justify-center font-bold">
                    <img src="/logo.png" alt="XSW Tools" className="w-6 h-6 object-contain" />
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900">XSW Tools</h3>
                    <p className="text-xs text-[#0066ff] font-medium">All 9 Studios, One Powerful Platform.</p>
                  </div>
                </div>
                <span className="px-3.5 py-1 rounded-full bg-blue-50 text-[#0066ff] text-xs font-extrabold border border-blue-200">
                  ₹299 / month <span className="font-normal text-[10px]">(~$3.5)</span>
                </span>
              </div>

              {/* Benefits with Checked Circles */}
              <div className="space-y-3.5 text-xs sm:text-sm text-slate-800 font-medium">
                <div className="flex items-center gap-3 p-2.5 rounded-xl bg-blue-50/50">
                  <div className="w-5 h-5 rounded-full bg-[#0066ff] text-white flex items-center justify-center shrink-0">
                    <LuCheck className="w-3 h-3" />
                  </div>
                  <span>All 9 Studios unified under 1 single login</span>
                </div>

                <div className="flex items-center gap-3 p-2.5 rounded-xl bg-blue-50/50">
                  <div className="w-5 h-5 rounded-full bg-[#0066ff] text-white flex items-center justify-center shrink-0">
                    <LuCheck className="w-3 h-3" />
                  </div>
                  <span>Zero telemetry client-side processing</span>
                </div>

                <div className="flex items-center gap-3 p-2.5 rounded-xl bg-blue-50/50">
                  <div className="w-5 h-5 rounded-full bg-[#0066ff] text-white flex items-center justify-center shrink-0">
                    <LuCheck className="w-3 h-3" />
                  </div>
                  <span>40+ production tools with unlimited conversions</span>
                </div>

                <div className="flex items-center gap-3 p-2.5 rounded-xl bg-blue-50/50">
                  <div className="w-5 h-5 rounded-full bg-[#0066ff] text-white flex items-center justify-center shrink-0">
                    <LuCheck className="w-3 h-3" />
                  </div>
                  <span>25 GB cloud storage &amp; priority compute queue</span>
                </div>

                <div className="flex items-center gap-3 p-2.5 rounded-xl bg-blue-50/50">
                  <div className="w-5 h-5 rounded-full bg-[#0066ff] text-white flex items-center justify-center shrink-0">
                    <LuCheck className="w-3 h-3" />
                  </div>
                  <span>Save over 90% in monthly software overhead</span>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-4">
              <Link
                href={isAuthenticated ? "/app" : "/signup"}
                className="w-full py-4 rounded-xl bg-[#0066ff] hover:bg-blue-700 text-white font-extrabold text-sm shadow-md transition flex items-center justify-center gap-2 active:scale-[0.98]"
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
          <p className="mt-2 text-sm sm:text-base text-slate-600">
            From daily tasks to professional projects — XSPACEWEB Studio helps everyone work smarter.
          </p>
        </div>

        {/* 5 Persona Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {PERSONAS_DATA.map((p) => {
            const Icon = p.icon;
            return (
              <div
                key={p.name}
                className={`p-5 rounded-2xl border ${p.bg} transition-all hover:scale-102 flex flex-col justify-between`}
              >
                <div className="w-9 h-9 rounded-xl bg-white shadow-xs flex items-center justify-center mb-3">
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-slate-900">{p.name}</h4>
                  <p className="text-xs text-slate-500 mt-0.5">{p.desc}</p>
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
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
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
          {LATEST_TOOLS_DATA.map((tool) => (
            <div
              key={tool.id}
              className={`p-6 rounded-2xl border border-slate-200/90 ${tool.cardBg} bg-white shadow-2xs hover:shadow-md transition flex flex-col justify-between`}
            >
              <div>
                <span className={`inline-block px-2.5 py-0.5 rounded-md text-[11px] font-bold ${tool.badgeBg} mb-3`}>
                  {tool.badge}
                </span>
                <h4 className="text-base font-bold text-slate-900">{tool.name}</h4>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">{tool.desc}</p>
              </div>

              <div className="mt-5 text-right">
                <Link
                  href={tool.href}
                  className="w-8 h-8 rounded-full bg-white border border-slate-200 shadow-xs inline-flex items-center justify-center text-slate-600 hover:text-[#0066ff] hover:border-blue-400 transition"
                >
                  <LuArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ================= SECTION 8: IMAGE EDITING MADE SIMPLE ================= */}
      <section className="relative z-10 py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="rounded-3xl border border-slate-200/90 bg-white shadow-sm p-8 sm:p-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left side: Interactive Image Editing Canvas */}
            <div className="lg:col-span-6 flex items-center justify-center">
              <div className="relative w-full max-w-md aspect-[4/3] rounded-2xl border border-slate-200 bg-slate-50 p-4 overflow-hidden flex items-center justify-center">
                {/* Simulated bounding box canvas */}
                <div className="relative w-4/5 h-4/5 rounded-xl border-2 border-dashed border-[#0066ff] bg-gradient-to-tr from-sky-100 to-indigo-100 flex items-center justify-center shadow-md">
                  <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-[#0066ff] text-white text-[10px] font-bold">
                    AI
                  </div>
                  {/* Selection handles */}
                  <div className="absolute -top-1.5 -left-1.5 w-3 h-3 bg-white border-2 border-[#0066ff] rounded-xs" />
                  <div className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-white border-2 border-[#0066ff] rounded-xs" />
                  <div className="absolute -bottom-1.5 -left-1.5 w-3 h-3 bg-white border-2 border-[#0066ff] rounded-xs" />
                  <div className="absolute -bottom-1.5 -right-1.5 w-3 h-3 bg-white border-2 border-[#0066ff] rounded-xs" />

                  <img
                    src="/logo.png"
                    alt="Image editor"
                    className="w-16 h-16 object-contain drop-shadow"
                  />
                </div>
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

      {/* ================= SECTION 9: TRUST BAR ================= */}
      <section className="relative z-10 py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center">
        <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          The online tools platform trusted by millions
        </h3>
        <p className="text-sm text-slate-600 mt-2">
          Join millions of users who rely on XSPACEWEB Studio to simplify their work.
        </p>

        {/* 4 Trust Items */}
        <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-6 max-w-4xl mx-auto">
          <div className="flex items-center justify-center gap-2.5 text-sm font-bold text-slate-800">
            <LuShieldCheck className="w-5 h-5 text-slate-600" />
            <span>100% Secure</span>
          </div>
          <div className="flex items-center justify-center gap-2.5 text-sm font-bold text-slate-800">
            <LuZap className="w-5 h-5 text-slate-600" />
            <span>Blazing Fast</span>
          </div>
          <div className="flex items-center justify-center gap-2.5 text-sm font-bold text-slate-800">
            <LuLayers className="w-5 h-5 text-slate-600" />
            <span>40+ Tools</span>
          </div>
          <div className="flex items-center justify-center gap-2.5 text-sm font-bold text-slate-800">
            <LuUsers className="w-5 h-5 text-slate-600" />
            <span>Trusted Worldwide</span>
          </div>
        </div>
      </section>

      {/* ================= SECTION 10: SIMPLE, HONEST PRICING ================= */}
      <section id="pricing" className="relative z-10 py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto items-stretch">
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

        {/* 3 Architecture Cards with illustrations */}
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
            <div className="mt-6 pt-6 border-t border-slate-100 flex items-center justify-center">
              <span className="px-3 py-1 rounded-full bg-blue-50 text-[#0066ff] font-mono text-xs font-bold">
                150ms WASM
              </span>
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
            <div className="mt-6 pt-6 border-t border-slate-100 flex items-center justify-center">
              <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 font-mono text-xs font-bold">
                Zero Data Retention
              </span>
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
            <div className="mt-6 pt-6 border-t border-slate-100 flex items-center justify-center">
              <span className="px-3 py-1 rounded-full bg-purple-50 text-purple-600 font-mono text-xs font-bold">
                Cross-Studio Pipe
              </span>
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
                      <div className="px-5 pb-5 pt-0 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-50">
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

      {/* ================= SECTION 14: FOOTER ================= */}
      <footer className="relative z-10 py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="rounded-3xl border border-slate-200/90 bg-white p-8 sm:p-12 shadow-sm relative overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mb-10">
            {/* Left Column: Logo & Newsletter */}
            <div className="lg:col-span-6 space-y-4">
              <Link href="/" className="inline-flex items-center group py-1">
                <img
                  src="/logo-full.png?v=10"
                  alt="XSWTOOLS - Every Tool. One Workspace."
                  className="h-12 sm:h-14 w-auto object-contain group-hover:opacity-95 transition-opacity"
                />
              </Link>

              <p className="text-xs sm:text-sm text-slate-600 max-w-md">
                Get the latest tools, AI features and guides delivered to your inbox.
              </p>

              {/* Newsletter Form */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  alert("Thank you for subscribing!");
                }}
                className="flex flex-col xs:flex-row items-stretch xs:items-center gap-2 max-w-md"
              >
                <input
                  type="email"
                  placeholder="Enter your email"
                  required
                  className="flex-1 px-4 py-2.5 rounded-full bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#0066ff]"
                />
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-full bg-[#1c1d22] hover:bg-black text-white text-xs font-bold transition shadow-xs text-center"
                >
                  Subscribe
                </button>
              </form>
            </div>

            {/* Right Column: Links */}
            <div className="lg:col-span-6 grid grid-cols-2 gap-8">
              <div>
                <h5 className="font-bold text-slate-900 text-xs uppercase tracking-wider mb-3">
                  Navigation
                </h5>
                <ul className="space-y-2 text-xs text-slate-600">
                  <li>
                    <Link href="/" className="hover:text-[#0066ff] transition">
                      Home
                    </Link>
                  </li>
                  <li>
                    <a href="#tools" className="hover:text-[#0066ff] transition">
                      All Tools
                    </a>
                  </li>
                  <li>
                    <a href="#studios" className="hover:text-[#0066ff] transition">
                      Studios
                    </a>
                  </li>
                  <li>
                    <Link href="/app/help" className="hover:text-[#0066ff] transition">
                      Guides
                    </Link>
                  </li>
                  <li>
                    <Link href="/contact" className="hover:text-[#0066ff] transition">
                      Blog
                    </Link>
                  </li>
                </ul>
              </div>

              <div>
                <h5 className="font-bold text-slate-900 text-xs uppercase tracking-wider mb-3">
                  Tools
                </h5>
                <ul className="space-y-2 text-xs text-slate-600">
                  <li>
                    <Link href={getStudioHref("/app/studios/pdf")} className="hover:text-[#0066ff] transition">
                      PDF Studio
                    </Link>
                  </li>
                  <li>
                    <Link href={getStudioHref("/app/studios/ai-document")} className="hover:text-[#0066ff] transition">
                      AI Tools
                    </Link>
                  </li>
                  <li>
                    <Link href={getStudioHref("/app/studios/office")} className="hover:text-[#0066ff] transition">
                      Productivity
                    </Link>
                  </li>
                  <li>
                    <Link href={getStudioHref("/app/studios/security")} className="hover:text-[#0066ff] transition">
                      Security
                    </Link>
                  </li>
                  <li>
                    <Link href={getStudioHref("/app/studios/qr-link")} className="hover:text-[#0066ff] transition">
                      QR &amp; Link Studio
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
            <div>&copy; 2026 XSPACEWEB Studio. All rights reserved.</div>

            <div className="flex items-center gap-4">
              <Link href="/privacy" className="hover:text-slate-900 transition">
                Privacy Policy
              </Link>
              <span>•</span>
              <Link href="/terms" className="hover:text-slate-900 transition">
                Terms of Service
              </Link>
            </div>

            {/* Social Icons */}
            <div className="flex items-center gap-3 text-slate-600">
              <a href="https://youtube.com" target="_blank" rel="noreferrer" className="hover:text-red-600 transition">
                <FaYoutube className="w-4 h-4" />
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noreferrer" className="hover:text-blue-700 transition">
                <FaLinkedinIn className="w-4 h-4" />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noreferrer" className="hover:text-slate-900 transition">
                <FaXTwitter className="w-4 h-4" />
              </a>
              <a href="https://instagram.com" target="_blank" rel="noreferrer" className="hover:text-pink-600 transition">
                <FaInstagram className="w-4 h-4" />
              </a>
              <a href="https://facebook.com" target="_blank" rel="noreferrer" className="hover:text-blue-600 transition">
                <FaFacebookF className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* Faint Watermark at bottom matching the PDF */}
          <div className="pointer-events-none select-none text-center font-black text-6xl sm:text-8xl text-slate-900/[0.03] tracking-widest pt-6 uppercase">
            XSWTOOLS
          </div>
        </div>
      </footer>
    </div>
  );
}
