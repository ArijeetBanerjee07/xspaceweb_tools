"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { TOOLS_CATALOG, CatalogTool } from "@/config/toolsCatalog";
import {
  LuSearch,
  LuSparkles,
  LuCreditCard,
  LuShieldCheck,
  LuCircleHelp,
  LuArrowRight,
  LuCircleCheck,
  LuFileText,
  LuLayers,
  LuExternalLink,
  LuChevronDown,
  LuInfo,
  LuLock,
  LuDatabase,
  LuRefreshCw,
  LuZap,
} from "react-icons/lu";

type HelpCategory =
  | "all"
  | "pdf"
  | "ai-document"
  | "office"
  | "security"
  | "qr-link"
  | "compress"
  | "background"
  | "document-hub"
  | "trendrank"
  | "billing"
  | "security-policy";

interface StudioInfo {
  id: string;
  name: string;
  badge: string;
  color: string;
  summary: string;
  href: string;
}

const STUDIOS_INFO: StudioInfo[] = [
  {
    id: "pdf",
    name: "PDF Studio",
    badge: "PDF",
    color: "bg-red-500 text-white",
    summary: "25+ full-fidelity PDF operations including conversions, merging, splitting, OCR, compression, watermarking, and military-grade password encryption.",
    href: "/app/studios/pdf",
  },
  {
    id: "ai-document",
    name: "AI Document Studio",
    badge: "AI",
    color: "bg-sky-500 text-white",
    summary: "Grounded AI document intelligence with sub-second citations, deep summaries, contract clause comparison, automated invoice extraction, and 12-language translation.",
    href: "/app/studios/ai-document",
  },
  {
    id: "office",
    name: "Office Studio",
    badge: "OFF",
    color: "bg-teal-500 text-white",
    summary: "Professional document drafting, dynamic spreadsheet builders, corporate invoices, pitch decks, resumes, and formula engines with instant DOCX & XLSX binary export.",
    href: "/app/studios/office",
  },
  {
    id: "security",
    name: "Security & E-Signature",
    badge: "SEC",
    color: "bg-emerald-500 text-white",
    summary: "Legal digital e-signatures with audit trails, cryptographic SHA-256 integrity verification, PII redaction, and AES-256 PDF encryption.",
    href: "/app/studios/security",
  },
  {
    id: "qr-link",
    name: "QR & Link Studio",
    badge: "QR",
    color: "bg-rose-500 text-white",
    summary: "Custom gradient QR codes with center logos, bulk CSV batch generators, vanity URL shorteners, and real-time click analytics.",
    href: "/app/studios/qr-link",
  },
  {
    id: "compress",
    name: "Compress & Enhance",
    badge: "ZIP",
    color: "bg-emerald-600 text-white",
    summary: "Multi-profile PDF compressor, lossless image shrinker (PNG/WebP/JPG), vector SVG optimizer, and batch password-protected ZIP packaging.",
    href: "/app/studios/compress",
  },
  {
    id: "background",
    name: "Background Studio",
    badge: "BG",
    color: "bg-blue-600 text-white",
    summary: "Sub-3-second neural background isolation for portraits and e-commerce product photos with transparent PNG and studio gradient backdrops.",
    href: "/app/studios/background",
  },
  {
    id: "document-hub",
    name: "Document Hub",
    badge: "DOC",
    color: "bg-cyan-500 text-white",
    summary: "Enterprise cloud document archive with folder hierarchies, custom tags, full-text semantic search across PDFs, and time-expiring share links.",
    href: "/app/studios/document-hub",
  },
  {
    id: "trendrank",
    name: "TrendRank AI",
    badge: "SEO",
    color: "bg-violet-600 text-white",
    summary: "YouTube and search algorithmic optimization with viral title CTR scoring, retention-engineered script outlining, and competitor keyword discovery.",
    href: "/app/studios/trendrank",
  },
];

const BILLING_FAQS = [
  {
    q: "What is the pricing for XSW Tools Pro and what plans are available?",
    a: "XSW Tools Pro is priced at ₹299 per month for monthly billing, or ₹2,499 per year for annual billing (saving over 30% compared to monthly). The Free plan is permanently ₹0 with zero card required. You can upgrade, downgrade, or cancel your subscription at any time with one click.",
  },
  {
    q: "How are payments processed and is my transaction safe with Razorpay?",
    a: "All transactions on XSW Tools are securely processed through Razorpay, India's leading RBI-authorized payment aggregator. We adhere to PCI-DSS Level 1 compliance, the highest security certification in the global payments industry. All card numbers, net banking credentials, and UPI pins are encrypted via 256-bit bank-grade SSL and tokenized directly inside Razorpay's vaults. XSW Tools never stores or handles your sensitive payment credentials.",
  },
  {
    q: "What payment methods are supported via Razorpay?",
    a: "We support all major payment modes across India and internationally: UPI (Google Pay, PhonePe, Paytm, BHIM, Cred), Credit and Debit Cards (Visa, Mastercard, RuPay, American Express), NetBanking across 50+ Indian banks, and digital wallets. Subscriptions support RBI-compliant recurring e-mandates.",
  },
  {
    q: "How do AI credits and tool quotas work across the 9 studios?",
    a: "Every workspace receives a pool of monthly credits based on their subscription tier (Free: 5 AI/Image credits, Pro: 75 AI & 75 Image credits, 500 QR codes). Standard PDF manipulations (Merge, Split, Watermark, Unlock) are 100% free with unlimited execution. AI Document Studio queries consume 1 AI Credit per run. Complex multi-page extractions (Invoices, OCR, Tables) consume 2 credits per page. Background removal consumes 1 Image Credit per cutout.",
  },
  {
    q: "What is your refund and cancellation policy?",
    a: "You can cancel your subscription at any time with one click from your Workspace Usage & Settings page with no cancellation fees or lock-ins. We offer a no-questions-asked 14-day money-back guarantee on all subscription upgrades if you have consumed fewer than 20% of your plan's allocated credits. Contact billing@xspaceweb.com for instant processing.",
  },
  {
    q: "Do I receive a GST-compliant tax invoice?",
    a: "Yes! Automated GST-compliant tax invoices with complete HSN/SAC codes and company details are instantly dispatched to your registered account email after every successful transaction via Razorpay.",
  },
  {
    q: "Do unused credits roll over to the next billing cycle?",
    a: "Yes! On all paid plans (Pro, Growth, Business), up to 100% of your unused monthly credits roll over into the subsequent month, up to a maximum cap of 3x your plan's monthly allowance.",
  },
  {
    q: "What are the file size and upload limits?",
    a: "Free accounts support files up to 25 MB and 50 pages per document. Pro accounts support heavy documents up to 100 MB with priority compute queue processing. Growth and Enterprise support up to 500 MB with batch parallel processing.",
  },
];

const SECURITY_POLICIES = [
  {
    icon: LuLock,
    title: "Zero LLM Model Training",
    desc: "Your uploaded documents, agreements, and prompt inputs are never stored, indexed, or used to train public or proprietary AI models. Requests are processed statelessly in-memory.",
  },
  {
    icon: LuDatabase,
    title: "Ephemeral File Storage & Auto-Purge",
    desc: "Temporary files generated during conversions and merges are stored in memory buffers and purged immediately following download. For free tiers, workspace files are automatically scrubbed after 24 hours.",
  },
  {
    icon: LuShieldCheck,
    title: "TLS 1.3 & AES-256 Encryption",
    desc: "All network traffic is encrypted end-to-end via TLS 1.3. Documents protected with our Security Studio use military-grade AES-256 encryption compliant with ISO 27001 standards.",
  },
  {
    icon: LuZap,
    title: "Isolated Tenant Sandboxing",
    desc: "Each workspace maintains strict cryptographic data boundaries. File IDs and database records are partitioned per workspace with zero cross-tenant leakage.",
  },
];

export default function HelpCenterPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<HelpCategory>("all");
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  // Filter tools based on search and active tab
  const filteredTools = useMemo(() => {
    return TOOLS_CATALOG.filter((tool) => {
      const matchesCategory =
        activeCategory === "all" ||
        activeCategory === "billing" ||
        activeCategory === "security-policy" ||
        tool.studioId === activeCategory;

      if (!matchesCategory) return false;

      if (!searchQuery.trim()) return true;

      const q = searchQuery.toLowerCase();
      return (
        tool.name.toLowerCase().includes(q) ||
        tool.description.toLowerCase().includes(q) ||
        tool.studioName.toLowerCase().includes(q) ||
        tool.howItWorks.toLowerCase().includes(q) ||
        tool.category.toLowerCase().includes(q) ||
        tool.tags.some((tag) => tag.toLowerCase().includes(q))
      );
    });
  }, [searchQuery, activeCategory]);

  return (
    <div className="space-y-10 pb-16">
      {/* Hero Header */}
      <div className="relative rounded-3xl bg-gradient-to-br from-[#0b1021] via-[#131b3b] to-[#1e2a5a] text-white p-8 md:p-12 overflow-hidden shadow-xl border border-slate-800">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-semibold">
            <LuCircleHelp className="w-3.5 h-3.5" />
            <span>Help Center &amp; Documentation</span>
          </div>

          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white leading-tight">
            How can we assist you today?
          </h1>
          <p className="text-slate-300 text-sm md:text-base leading-relaxed">
            Search our comprehensive guides covering all 9 Studios, 40+ specialized tools, credit models, billing policies, and zero-retention security protocols.
          </p>

          {/* Search Input */}
          <div className="pt-2">
            <div className="relative max-w-2xl">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                <LuSearch className="w-5 h-5" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search tools, billing rules, OCR, compression, API quotas, or security policies..."
                className="w-full pl-12 pr-4 py-3.5 bg-white/10 hover:bg-white/15 focus:bg-white text-white focus:text-slate-900 border border-white/20 focus:border-blue-400 rounded-2xl text-sm placeholder-slate-400 transition focus:outline-none shadow-lg backdrop-blur-md"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-white"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Navigation Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {[
          { id: "all", label: "All Help Topics" },
          { id: "pdf", label: "PDF Studio" },
          { id: "ai-document", label: "AI Document Studio" },
          { id: "office", label: "Office Studio" },
          { id: "security", label: "Security & Sign" },
          { id: "qr-link", label: "QR & Links" },
          { id: "compress", label: "Compress" },
          { id: "background", label: "Background" },
          { id: "document-hub", label: "Document Hub" },
          { id: "trendrank", label: "TrendRank AI" },
          { id: "billing", label: "Billing & Plans" },
          { id: "security-policy", label: "Security & Privacy" },
        ].map((cat) => (
          <button
            key={cat.id}
            type="button"
            onClick={() => setActiveCategory(cat.id as HelpCategory)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition border shadow-2xs ${
              activeCategory === cat.id
                ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                : "bg-white text-slate-700 border-slate-200/90 hover:bg-slate-50 hover:text-slate-900"
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* SECTION 1: STUDIO OVERVIEWS & TOOL DIRECTORY */}
      {(activeCategory === "all" ||
        (!["billing", "security-policy"].includes(activeCategory))) && (
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-slate-200/80 pb-3">
            <div>
              <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
                <LuLayers className="w-5 h-5 text-blue-600" />
                <span>Studio Tool Guides &amp; How-To</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Detailed breakdowns of what each tool does, supported inputs, output deliverables, and step-by-step usage instructions.
              </p>
            </div>
            <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg">
              {filteredTools.length} tools indexed
            </span>
          </div>

          {/* Tools Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredTools.map((tool) => (
              <div
                key={tool.id}
                className="bg-white border border-slate-200/90 hover:border-blue-300 rounded-2xl p-5 shadow-xs hover:shadow-md transition flex flex-col justify-between space-y-4 group"
              >
                <div className="space-y-3">
                  {/* Header Badge */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-bold shadow-2xs ${tool.studioColor}`}>
                        {tool.studioBadge}
                      </span>
                      <span className="text-xs font-semibold text-slate-500">{tool.studioName}</span>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                      {tool.tier} Tier
                    </span>
                  </div>

                  {/* Title & Desc */}
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm group-hover:text-blue-600 transition">
                      {tool.name}
                    </h3>
                    <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                      {tool.description}
                    </p>
                  </div>

                  {/* How it works */}
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-slate-700 text-[11px] space-y-1">
                    <div className="font-bold text-slate-800 flex items-center gap-1.5">
                      <LuSparkles className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                      <span>How it works</span>
                    </div>
                    <p className="leading-relaxed text-slate-600">{tool.howItWorks}</p>
                  </div>

                  {/* Input / Output Tags */}
                  <div className="grid grid-cols-2 gap-2 text-[10px]">
                    <div className="p-2 bg-blue-50/50 border border-blue-100/80 rounded-lg">
                      <span className="font-bold text-blue-800 block">Input:</span>
                      <span className="text-blue-700 truncate block mt-0.5">{tool.inputFormat}</span>
                    </div>
                    <div className="p-2 bg-emerald-50/50 border border-emerald-100/80 rounded-lg">
                      <span className="font-bold text-emerald-800 block">Output:</span>
                      <span className="text-emerald-700 truncate block mt-0.5">{tool.outputFormat}</span>
                    </div>
                  </div>
                </div>

                {/* Footer Action */}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[10px] text-slate-400 capitalize">
                    Category: <strong className="text-slate-600">{tool.category}</strong>
                  </span>
                  <Link
                    href={tool.studioHref}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700 transition group-hover:translate-x-0.5"
                  >
                    <span>Open in Studio</span>
                    <LuArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {filteredTools.length === 0 && (
            <div className="p-12 text-center bg-white rounded-3xl border border-slate-200/80 space-y-3">
              <LuSearch className="w-8 h-8 text-slate-300 mx-auto" />
              <p className="font-bold text-slate-800 text-sm">No matching tools found</p>
              <p className="text-xs text-slate-500">
                Try searching for terms like &ldquo;PDF&rdquo;, &ldquo;Word&rdquo;, &ldquo;Invoice&rdquo;, &ldquo;QR&rdquo;, or &ldquo;Compress&rdquo;.
              </p>
            </div>
          )}
        </div>
      )}

      {/* SECTION 2: BILLING, PLANS & USAGE POLICIES */}
      {(activeCategory === "all" || activeCategory === "billing") && (
        <div className="space-y-6 pt-4">
          <div className="border-b border-slate-200/80 pb-3">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <LuCreditCard className="w-5 h-5 text-purple-600" />
              <span>Billing, Credits &amp; Subscription Policies</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Transparent breakdown of how tool quotas, plan upgrades, and credit pools operate across your workspace.
            </p>
          </div>

          {/* Pricing Tier Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-5 bg-white border border-slate-200/90 rounded-2xl space-y-2 shadow-xs">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Free Forever</span>
              <div className="text-2xl font-black text-slate-900">₹0<span className="text-xs text-slate-400 font-normal">/mo</span></div>
              <p className="text-xs text-slate-500 leading-relaxed">
                Access to all 9 Studio interfaces, 5 free AI analysis credits, 5 background matting credits, 25MB file limit, and 1 GB cloud storage.
              </p>
            </div>

            <div className="p-5 bg-gradient-to-b from-blue-50/40 to-white border-2 border-blue-600 rounded-2xl space-y-2 shadow-sm relative">
              <span className="absolute top-3 right-3 text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-600 text-white">
                Recommended
              </span>
              <span className="text-[11px] font-bold text-blue-600 uppercase tracking-wider">Pro Studio</span>
              <div className="text-2xl font-black text-slate-900">₹299<span className="text-xs text-slate-400 font-normal">/mo</span></div>
              <div className="text-[11px] font-semibold text-blue-700">or ₹2,499 / year (Save 30%)</div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Priority processing queue, 75 monthly AI document intelligence credits, 75 background matting credits, 500 dynamic QR codes, and 25 GB cloud storage.
              </p>
            </div>

            <div className="p-5 bg-white border border-slate-200/90 rounded-2xl space-y-2 shadow-xs">
              <span className="text-[11px] font-bold text-purple-600 uppercase tracking-wider">Growth</span>
              <div className="text-2xl font-black text-slate-900">₹1,499<span className="text-xs text-slate-400 font-normal">/mo</span></div>
              <div className="text-[11px] font-semibold text-purple-700">or ₹14,990 / year</div>
              <p className="text-xs text-slate-500 leading-relaxed">
                500 AI credits, 500 image credits, 2,500 custom QR codes, 100 GB storage, 500MB upload limit, and 5 team collaboration seats.
              </p>
            </div>

            <div className="p-5 bg-white border border-slate-200/90 rounded-2xl space-y-2 shadow-xs">
              <span className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider">Enterprise</span>
              <div className="text-2xl font-black text-slate-900">Custom<span className="text-xs text-slate-400 font-normal">/yr</span></div>
              <div className="text-[11px] font-semibold text-emerald-700">Tailored Quotas &amp; SLAs</div>
              <p className="text-xs text-slate-500 leading-relaxed">
                Custom compute pools, dedicated VPC / on-premise document processing, custom data retention, and dedicated 24/7 priority SLA support.
              </p>
            </div>
          </div>

          {/* Razorpay Payment Security & Policies Banner */}
          <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-md border border-slate-800 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center border border-blue-500/30">
                  <LuLock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm sm:text-base text-white tracking-tight flex items-center gap-2">
                    <span>100% Secure Payments via Razorpay</span>
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/30">
                      PCI-DSS Level 1
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    Industry-grade end-to-end encryption with zero local financial credential storage.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-300 bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700">
                <LuShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>RBI e-Mandate Compliant</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs pt-1">
              <div className="space-y-1">
                <div className="font-bold text-slate-200 flex items-center gap-1.5">
                  <LuCircleCheck className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                  <span>256-Bit SSL Encryption</span>
                </div>
                <p className="text-slate-400 leading-relaxed text-[11px]">
                  All transactions route directly via Razorpay&apos;s TLS 1.3 encrypted checkout vault.
                </p>
              </div>

              <div className="space-y-1">
                <div className="font-bold text-slate-200 flex items-center gap-1.5">
                  <LuCircleCheck className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                  <span>Zero Stored Card Data</span>
                </div>
                <p className="text-slate-400 leading-relaxed text-[11px]">
                  XSW Tools never saves or sees card numbers or CVVs. All methods use RBI-approved network tokenization.
                </p>
              </div>

              <div className="space-y-1">
                <div className="font-bold text-slate-200 flex items-center gap-1.5">
                  <LuCircleCheck className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                  <span>Instant GST Invoices</span>
                </div>
                <p className="text-slate-400 leading-relaxed text-[11px]">
                  Tax-compliant digital invoices with your company GSTIN are generated and sent automatically upon checkout.
                </p>
              </div>

              <div className="space-y-1">
                <div className="font-bold text-slate-200 flex items-center gap-1.5">
                  <LuCircleCheck className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                  <span>Cancel Anytime &amp; Refund Policy</span>
                </div>
                <p className="text-slate-400 leading-relaxed text-[11px]">
                  1-click self-serve cancellation at any time with full prorated 14-day refund guarantee for new subscribers.
                </p>
              </div>
            </div>
          </div>

          {/* Billing FAQs Accordion */}
          <div className="bg-white border border-slate-200/90 rounded-2xl divide-y divide-slate-100 overflow-hidden shadow-xs">
            {BILLING_FAQS.map((faq, idx) => {
              const isOpen = expandedFaq === idx;
              return (
                <div key={idx} className="p-5 hover:bg-slate-50/50 transition">
                  <button
                    type="button"
                    onClick={() => setExpandedFaq(isOpen ? null : idx)}
                    className="w-full flex items-center justify-between text-left gap-4"
                  >
                    <span className="font-bold text-slate-900 text-sm">{faq.q}</span>
                    <LuChevronDown
                      className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? "rotate-180" : ""}`}
                    />
                  </button>
                  {isOpen && (
                    <p className="text-xs text-slate-600 mt-3 leading-relaxed animate-in fade-in duration-150">
                      {faq.a}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SECTION 3: SECURITY, PRIVACY & COMPLIANCE ARCHITECTURE */}
      {(activeCategory === "all" || activeCategory === "security-policy") && (
        <div className="space-y-6 pt-4">
          <div className="border-b border-slate-200/80 pb-3">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <LuShieldCheck className="w-5 h-5 text-emerald-600" />
              <span>Security, Privacy &amp; Data Retention Architecture</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              How XSW Tools isolates, processes, and protects your private confidential documents.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {SECURITY_POLICIES.map((policy, idx) => {
              const Icon = policy.icon;
              return (
                <div
                  key={idx}
                  className="p-5 bg-white border border-slate-200/90 rounded-2xl flex items-start gap-4 shadow-xs"
                >
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 border border-emerald-100">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">{policy.title}</h3>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">{policy.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SECTION 4: CONTACT & ENTERPRISE SUPPORT CARD */}
      <div className="rounded-2xl bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 border border-blue-200/80 p-6 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-1 text-center md:text-left">
          <h3 className="font-bold text-slate-900 text-base">Still need assistance?</h3>
          <p className="text-xs text-slate-600">
            Our engineering support team is available 24/7 to help resolve workflow bottlenecks, custom format conversions, or enterprise seat configurations.
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <Link
            href="/app/settings"
            className="px-4 py-2.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition shadow-2xs"
          >
            Manage Settings
          </Link>
          <a
            href="mailto:support@xspaceweb.com"
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl transition shadow-xs flex items-center gap-1.5"
          >
            <span>Contact Support</span>
            <LuExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </div>
  );
}
