"use client";

import { useState } from "react";
import Link from "next/link";
import { UpgradeCheckoutModal } from "@/components/studio/UpgradeCheckoutModal";
import { ConvertModal, ConvertToolConfig } from "@/components/studio/ConvertModal";
import { OrganizeModal, OrganizeToolConfig } from "@/components/studio/OrganizeModal";
import { CompressModal, CompressToolConfig } from "@/components/studio/CompressModal";
import { SecurityModal, SecurityToolConfig } from "@/components/studio/SecurityModal";
import { EditModal, EditToolConfig } from "@/components/studio/EditModal";
import {
  LuPencil,
  LuImage,
  LuDroplets,
  LuRotateCw,
  LuScissors,
  LuRuler,
  LuFiles,
  LuFileText,
  LuTrash2,
  LuArrowLeftRight,
  LuCopy,
  LuFolderTree,
  LuMinimize2,
  LuLock,
  LuLockOpen,
  LuShield,
  LuEyeOff,
  LuSearch,
  LuPlus,
  LuCrown,
} from "react-icons/lu";
import { useProStatus, checkClientFeatureAccess } from "@/lib/gating";

export default function PDFStudioPage() {
  const isPro = useProStatus();
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isUpgradeOpen, setIsUpgradeOpen] = useState(false);
  const [highlightFeature, setHighlightFeature] = useState("PDF Studio Pro");
  const [selectedConvertTool, setSelectedConvertTool] = useState<ConvertToolConfig | null>(null);
  const [selectedOrganizeTool, setSelectedOrganizeTool] = useState<OrganizeToolConfig | null>(null);
  const [selectedCompressTool, setSelectedCompressTool] = useState<CompressToolConfig | null>(null);
  const [selectedSecurityTool, setSelectedSecurityTool] = useState<SecurityToolConfig | null>(null);
  const [selectedEditTool, setSelectedEditTool] = useState<EditToolConfig | null>(null);

  const categories = [
    { id: "all", label: "All Tools (25)" },
    { id: "convert", label: "Convert (8)" },
    { id: "edit", label: "Edit (8)" },
    { id: "organize", label: "Organize (8)" },
    { id: "compress", label: "Compress (4)" },
    { id: "security", label: "Security (4)" },
    { id: "ai", label: "AI Tools (3)" },
    { id: "read", label: "View & Read (3)" },
  ];

  const convertTools: ConvertToolConfig[] = [
    {
      id: "pdf-to-word",
      action: "pdf-to-word",
      title: "PDF to Word",
      desc: "Convert PDF to a editable Word file",
      badge: "W",
      iconBg: "bg-blue-600",
      borderHover: "hover:border-blue-400 group-hover:border-blue-300",
      gradientFlare: "from-blue-500/25 via-blue-400/10 to-transparent",
      accept: ".pdf,application/pdf",
      acceptLabel: "PDF (.pdf)",
    },
    {
      id: "word-to-pdf",
      action: "word-to-pdf",
      title: "Word to PDF",
      desc: "Convert Word to PDF",
      badge: "PDF",
      iconBg: "bg-red-500",
      borderHover: "hover:border-red-400 group-hover:border-red-300",
      gradientFlare: "from-red-500/25 via-red-400/10 to-transparent",
      accept: ".docx,.doc,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/msword",
      acceptLabel: "Word (.docx, .doc)",
    },
    {
      id: "pdf-to-excel",
      action: "pdf-to-excel",
      title: "PDF to Excel",
      desc: "Convert PDF to Excel file",
      badge: "X",
      iconBg: "bg-emerald-600",
      borderHover: "hover:border-emerald-400 group-hover:border-emerald-300",
      gradientFlare: "from-emerald-500/25 via-emerald-400/10 to-transparent",
      accept: ".pdf,application/pdf",
      acceptLabel: "PDF (.pdf)",
    },
    {
      id: "excel-to-pdf",
      action: "excel-to-pdf",
      title: "Excel to PDF",
      desc: "Convert Excel to PDF",
      badge: "PDF",
      iconBg: "bg-teal-600",
      borderHover: "hover:border-teal-400 group-hover:border-teal-300",
      gradientFlare: "from-teal-500/25 via-teal-400/10 to-transparent",
      accept: ".xlsx,.xls,.csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel",
      acceptLabel: "Excel (.xlsx, .xls, .csv)",
    },
    {
      id: "pdf-to-ppt",
      action: "pdf-to-ppt",
      title: "PDF to PPT",
      desc: "Convert PDF to PowerPoint",
      badge: "P",
      iconBg: "bg-amber-600",
      borderHover: "hover:border-amber-400 group-hover:border-amber-300",
      gradientFlare: "from-amber-500/25 via-amber-400/10 to-transparent",
      accept: ".pdf,application/pdf",
      acceptLabel: "PDF (.pdf)",
    },
    {
      id: "ppt-to-pdf",
      action: "ppt-to-pdf",
      title: "PPT to PDF",
      desc: "Convert PowerPoint to PDF",
      badge: "PDF",
      iconBg: "bg-orange-500",
      borderHover: "hover:border-orange-400 group-hover:border-orange-300",
      gradientFlare: "from-orange-500/25 via-orange-400/10 to-transparent",
      accept: ".pptx,.ppt,application/vnd.openxmlformats-officedocument.presentationml.presentation,application/vnd.ms-powerpoint",
      acceptLabel: "PowerPoint (.pptx, .ppt)",
    },
    {
      id: "pdf-to-images",
      action: "pdf-to-images",
      title: "PDF to Images",
      desc: "Convert PDF to JPG, PNG, etc.",
      badge: "IMG",
      iconBg: "bg-purple-600",
      borderHover: "hover:border-purple-400 group-hover:border-purple-300",
      gradientFlare: "from-purple-500/25 via-purple-400/10 to-transparent",
      accept: ".pdf,application/pdf",
      acceptLabel: "PDF (.pdf)",
    },
    {
      id: "images-to-pdf",
      action: "images-to-pdf",
      title: "Images to PDF",
      desc: "Convert images to PDF",
      badge: "PDF",
      iconBg: "bg-rose-500",
      borderHover: "hover:border-rose-400 group-hover:border-rose-300",
      gradientFlare: "from-rose-500/25 via-rose-400/10 to-transparent",
      accept: "image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp",
      acceptLabel: "Images (.jpg, .png, .webp)",
    },
  ];

  const editTools: EditToolConfig[] = [
    {
      id: "edit-pdf",
      action: "edit-pdf",
      title: "Edit PDF",
      desc: "Add text stamps, markings, callout badges, and annotations",
      icon: <LuPencil className="w-4 h-4" />,
      iconBg: "bg-red-500",
      borderHover: "hover:border-red-400 group-hover:border-red-300",
      gradientFlare: "from-red-500/25 via-red-400/10 to-transparent",
    },
    {
      id: "add-text",
      action: "add-text",
      title: "Add Text",
      desc: "Add text to PDF",
      icon: "T",
      iconBg: "bg-blue-500",
      borderHover: "hover:border-blue-400 group-hover:border-blue-300",
      gradientFlare: "from-blue-500/25 via-blue-400/10 to-transparent",
    },
    {
      id: "add-image",
      action: "add-image",
      title: "Add Image",
      desc: "Insert image into PDF",
      icon: <LuImage className="w-4 h-4" />,
      iconBg: "bg-purple-600",
      borderHover: "hover:border-purple-400 group-hover:border-purple-300",
      gradientFlare: "from-purple-500/25 via-purple-400/10 to-transparent",
    },
    {
      id: "add-watermark",
      action: "add-watermark",
      title: "Add Watermark",
      desc: "Add text or image watermark",
      icon: <LuDroplets className="w-4 h-4" />,
      iconBg: "bg-amber-500",
      borderHover: "hover:border-amber-400 group-hover:border-amber-300",
      gradientFlare: "from-amber-500/25 via-amber-400/10 to-transparent",
    },
    {
      id: "rotate-pdf",
      action: "rotate-pdf",
      title: "Rotate PDF",
      desc: "Rotate pages left or right",
      icon: <LuRotateCw className="w-4 h-4" />,
      iconBg: "bg-sky-500",
      borderHover: "hover:border-sky-400 group-hover:border-sky-300",
      gradientFlare: "from-sky-500/25 via-sky-400/10 to-transparent",
    },
    {
      id: "crop-pdf",
      action: "crop-pdf",
      title: "Crop PDF",
      desc: "Crop PDF pages",
      icon: <LuScissors className="w-4 h-4" />,
      iconBg: "bg-teal-500",
      borderHover: "hover:border-teal-400 group-hover:border-teal-300",
      gradientFlare: "from-teal-500/25 via-teal-400/10 to-transparent",
    },
    {
      id: "resize-pdf",
      action: "resize-pdf",
      title: "Resize PDF",
      desc: "Resize PDF page size",
      icon: <LuRuler className="w-4 h-4" />,
      iconBg: "bg-pink-500",
      borderHover: "hover:border-pink-400 group-hover:border-pink-300",
      gradientFlare: "from-pink-500/25 via-pink-400/10 to-transparent",
    },
    {
      id: "page-numbers",
      action: "page-numbers",
      title: "Page Numbers",
      desc: "Add page numbers to PDF",
      icon: "#",
      iconBg: "bg-indigo-600",
      borderHover: "hover:border-indigo-400 group-hover:border-indigo-300",
      gradientFlare: "from-indigo-500/25 via-indigo-400/10 to-transparent",
    },
  ];

  const organizeTools: OrganizeToolConfig[] = [
    {
      id: "merge-pdf",
      action: "merge-pdf",
      title: "Merge PDF",
      desc: "Combine multiple PDF files",
      icon: <LuFiles className="w-4 h-4" />,
      iconBg: "bg-red-500",
      borderHover: "hover:border-red-400 group-hover:border-red-300",
      gradientFlare: "from-red-500/25 via-red-400/10 to-transparent",
    },
    {
      id: "split-pdf",
      action: "split-pdf",
      title: "Split PDF",
      desc: "Split PDF into multiple files",
      icon: <LuScissors className="w-4 h-4" />,
      iconBg: "bg-blue-500",
      borderHover: "hover:border-blue-400 group-hover:border-blue-300",
      gradientFlare: "from-blue-500/25 via-blue-400/10 to-transparent",
    },
    {
      id: "extract-pages",
      action: "extract-pages",
      title: "Extract Pages",
      desc: "Extract specific pages",
      icon: <LuFileText className="w-4 h-4" />,
      iconBg: "bg-emerald-500",
      borderHover: "hover:border-emerald-400 group-hover:border-emerald-300",
      gradientFlare: "from-emerald-500/25 via-emerald-400/10 to-transparent",
    },
    {
      id: "delete-pages",
      action: "delete-pages",
      title: "Delete Pages",
      desc: "Remove unwanted pages",
      icon: <LuTrash2 className="w-4 h-4" />,
      iconBg: "bg-red-500",
      borderHover: "hover:border-red-400 group-hover:border-red-300",
      gradientFlare: "from-red-500/25 via-red-400/10 to-transparent",
    },
    {
      id: "reorder-pages",
      action: "reorder-pages",
      title: "Reorder Pages",
      desc: "Rearrange PDF pages",
      icon: <LuArrowLeftRight className="w-4 h-4" />,
      iconBg: "bg-purple-500",
      borderHover: "hover:border-purple-400 group-hover:border-purple-300",
      gradientFlare: "from-purple-500/25 via-purple-400/10 to-transparent",
    },
    {
      id: "insert-pages",
      action: "insert-pages",
      title: "Insert Pages",
      desc: "Insert pages into PDF",
      icon: <LuPlus className="w-4 h-4" />,
      iconBg: "bg-amber-500",
      borderHover: "hover:border-amber-400 group-hover:border-amber-300",
      gradientFlare: "from-amber-500/25 via-amber-400/10 to-transparent",
    },
    {
      id: "duplicate-pages",
      action: "duplicate-pages",
      title: "Duplicate Pages",
      desc: "Duplicate selected pages",
      icon: <LuCopy className="w-4 h-4" />,
      iconBg: "bg-blue-600",
      borderHover: "hover:border-blue-400 group-hover:border-blue-300",
      gradientFlare: "from-blue-600/25 via-blue-500/10 to-transparent",
    },
    {
      id: "organize-pdf",
      action: "organize-pdf",
      title: "PDF Organizer",
      desc: "Manage PDF pages easily",
      icon: <LuFolderTree className="w-4 h-4" />,
      iconBg: "bg-rose-600",
      borderHover: "hover:border-rose-400 group-hover:border-rose-300",
      gradientFlare: "from-rose-500/25 via-rose-400/10 to-transparent",
    },
  ];

  const compressTools: CompressToolConfig[] = [
    {
      id: "compress-pdf",
      action: "compress-pdf",
      title: "Compress PDF",
      desc: "Reduce PDF file size",
      icon: <LuMinimize2 className="w-4 h-4" />,
      iconBg: "bg-purple-600",
      borderHover: "hover:border-purple-400 group-hover:border-purple-300",
      gradientFlare: "from-purple-500/25 via-purple-400/10 to-transparent",
    },
    {
      id: "compress-to-100kb",
      action: "compress-to-100kb",
      title: "Compress to 100KB",
      desc: "Make PDF under 100KB",
      icon: "100K",
      iconBg: "bg-blue-500",
      borderHover: "hover:border-blue-400 group-hover:border-blue-300",
      gradientFlare: "from-blue-500/25 via-blue-400/10 to-transparent",
    },
    {
      id: "compress-to-1mb",
      action: "compress-to-1mb",
      title: "Compress to 1MB",
      desc: "Make PDF under 1MB",
      icon: "1M",
      iconBg: "bg-emerald-500",
      borderHover: "hover:border-emerald-400 group-hover:border-emerald-300",
      gradientFlare: "from-emerald-500/25 via-emerald-400/10 to-transparent",
    },
    {
      id: "high-quality-compress",
      action: "high-quality-compress",
      title: "High Quality Compress",
      desc: "Compress without losing quality",
      icon: "HQ",
      iconBg: "bg-amber-500",
      borderHover: "hover:border-amber-400 group-hover:border-amber-300",
      gradientFlare: "from-amber-500/25 via-amber-400/10 to-transparent",
    },
  ];

  const securityTools: SecurityToolConfig[] = [
    {
      id: "lock-pdf",
      action: "lock-pdf",
      title: "Lock PDF",
      desc: "Password protect PDF",
      icon: <LuLock className="w-4 h-4" />,
      iconBg: "bg-red-500",
      borderHover: "hover:border-red-400 group-hover:border-red-300",
      gradientFlare: "from-red-500/25 via-red-400/10 to-transparent",
    },
    {
      id: "unlock-pdf",
      action: "unlock-pdf",
      title: "Unlock PDF",
      desc: "Remove password from PDF",
      icon: <LuLockOpen className="w-4 h-4" />,
      iconBg: "bg-blue-500",
      borderHover: "hover:border-blue-400 group-hover:border-blue-300",
      gradientFlare: "from-blue-500/25 via-blue-400/10 to-transparent",
    },
    {
      id: "encrypt-pdf",
      action: "encrypt-pdf",
      title: "Encrypt PDF",
      desc: "Encrypt PDF with advanced security",
      icon: <LuShield className="w-4 h-4" />,
      iconBg: "bg-emerald-500",
      borderHover: "hover:border-emerald-400 group-hover:border-emerald-300",
      gradientFlare: "from-emerald-500/25 via-emerald-400/10 to-transparent",
    },
    {
      id: "redact-pdf",
      action: "redact-pdf",
      title: "Redact PDF",
      desc: "Hide sensitive information",
      icon: <LuEyeOff className="w-4 h-4" />,
      iconBg: "bg-amber-500",
      borderHover: "hover:border-amber-400 group-hover:border-amber-300",
      gradientFlare: "from-amber-500/25 via-amber-400/10 to-transparent",
    },
  ];

  return (
    <div className="space-y-6">
      <UpgradeCheckoutModal
        isOpen={isUpgradeOpen}
        onClose={() => setIsUpgradeOpen(false)}
        highlightFeature={highlightFeature}
      />
      <ConvertModal
        isOpen={Boolean(selectedConvertTool)}
        onClose={() => setSelectedConvertTool(null)}
        tool={selectedConvertTool}
      />
      <OrganizeModal
        isOpen={Boolean(selectedOrganizeTool)}
        onClose={() => setSelectedOrganizeTool(null)}
        tool={selectedOrganizeTool}
      />
      <CompressModal
        isOpen={Boolean(selectedCompressTool)}
        onClose={() => setSelectedCompressTool(null)}
        tool={selectedCompressTool}
      />
      <SecurityModal
        isOpen={Boolean(selectedSecurityTool)}
        onClose={() => setSelectedSecurityTool(null)}
        tool={selectedSecurityTool}
      />
      <EditModal
        isOpen={Boolean(selectedEditTool)}
        onClose={() => setSelectedEditTool(null)}
        tool={selectedEditTool}
      />

      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
        <Link href="/app" className="hover:text-blue-600 transition">Home</Link>
        <span>&rsaquo;</span>
        <span className="text-slate-800 font-semibold">PDF Studio</span>
      </div>

      {/* Hero Banner matching PDF Studio Dashboard Interface.png */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-rose-50 via-red-50/70 to-pink-100/50 border border-rose-100 p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="max-w-xl space-y-3 z-10">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            <span className="text-red-600">PDF</span> Studio
          </h1>
          <p className="text-sm text-slate-600 leading-relaxed">
            All PDF tools you need. Convert, edit, merge, split, compress, secure and do more &mdash; fast, easy and free.
          </p>

          {/* Search Bar */}
          <div className="flex items-center max-w-md bg-white rounded-2xl border border-rose-200/80 p-1.5 shadow-sm">
            <span className="pl-3 text-slate-400">
              <LuSearch className="w-4 h-4" />
            </span>
            <input
              type="text"
              placeholder="Search PDF tools... (e.g. merge, compress, edit)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 px-3 py-1.5 text-xs text-slate-800 focus:outline-none placeholder-slate-400"
            />
            <button className="px-3.5 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition">
              &rarr;
            </button>
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap gap-1.5 pt-2">
            {categories.map((c) => (
              <button
                key={c.id}
                onClick={() => setActiveCategory(c.id)}
                className={`px-3 py-1 rounded-xl text-xs font-medium transition ${
                  activeCategory === c.id
                    ? "bg-red-600 text-white shadow-xs font-semibold"
                    : "bg-white text-slate-600 border border-slate-200/80 hover:bg-slate-50"
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>

        {/* 3D PDF Document Illustration with quote underneath */}
        <div className="relative z-10 self-center md:self-auto shrink-0 flex flex-col items-center">
          <div className="relative group">
            <div className="absolute -inset-2 bg-gradient-to-tr from-red-500/20 to-rose-400/20 rounded-full blur-2xl group-hover:blur-3xl transition" />
            <img
              src="/banners/pdf_document.png"
              alt="3D PDF Document"
              className="relative w-36 sm:w-44 lg:w-48 h-auto drop-shadow-xl transform hover:scale-105 transition-transform duration-300 pointer-events-none select-none"
            />
          </div>
          <div className="text-center font-serif italic text-red-950 font-bold text-xs mt-2 max-w-[220px]">
            &ldquo;Edit Convert Compress Secure and More...&rdquo;
          </div>
        </div>
      </div>

      {/* Tool sections */}
      <div className="w-full space-y-8">
        {/* Convert PDF */}
        {(activeCategory === "all" || activeCategory === "convert") && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-sm">Convert PDF</h3>
              <Link href="/app/tools" className="text-xs text-blue-600 hover:text-blue-700 font-semibold">View All &rarr;</Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              {convertTools.map((t) => (
                <div
                  key={t.title}
                  onClick={() => setSelectedConvertTool(t)}
                  className={`group relative overflow-hidden backdrop-blur-xl bg-white/70 hover:bg-white/95 border border-slate-200/80 ${t.borderHover} rounded-2xl p-4 shadow-xs hover:shadow-lg transition-all duration-300 cursor-pointer flex flex-col justify-between space-y-3`}
                >
                  {/* Thematic Corner Gradient Flare */}
                  <div
                    className={`absolute -top-10 -right-10 w-24 h-24 rounded-full bg-gradient-to-br ${t.gradientFlare} blur-xl pointer-events-none group-hover:scale-150 transition-transform duration-500`}
                  />

                  <div className="flex items-center justify-between z-10">
                    <span className={`w-8 h-8 rounded-lg ${t.iconBg} text-white font-bold text-xs flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform duration-200`}>
                      {t.badge}
                    </span>
                    <span className="text-[10px] font-semibold text-slate-400 group-hover:text-slate-600 transition tracking-wide">
                      Convert
                    </span>
                  </div>

                  <div className="z-10">
                    <div className="font-bold text-slate-900 text-xs group-hover:text-blue-600 transition-colors">{t.title}</div>
                    <div className="text-[11px] text-slate-400 mt-0.5">{t.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Edit PDF */}
        {(activeCategory === "all" || activeCategory === "edit") && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-sm">Edit PDF</h3>
              <Link href="/app/tools" className="text-xs text-blue-600 hover:text-blue-700 font-semibold">View All &rarr;</Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              {editTools.map((t) => {
                const isProOnly = t.id === "add-text" || t.id === "add-image" || t.id === "page-numbers";
                const isWatermark = t.id === "watermark";
                const watermarkAccess = isWatermark ? checkClientFeatureAccess("pdf:watermark", isPro) : null;
                return (
                <div
                  key={t.title}
                  onClick={() => {
                    if (isProOnly && !isPro) {
                      setHighlightFeature(t.title);
                      setIsUpgradeOpen(true);
                      return;
                    }
                    if (isWatermark && watermarkAccess && !watermarkAccess.allowed) {
                      setHighlightFeature("PDF Watermark Quota");
                      setIsUpgradeOpen(true);
                      return;
                    }
                    setSelectedEditTool(t);
                  }}
                  className={`group relative overflow-hidden backdrop-blur-xl bg-white/70 hover:bg-white/95 border border-slate-200/80 ${t.borderHover} rounded-2xl p-4 shadow-xs hover:shadow-lg transition-all duration-300 cursor-pointer flex flex-col justify-between space-y-3`}
                >
                  {/* Thematic Corner Gradient Flare */}
                  <div
                    className={`absolute -top-10 -right-10 w-24 h-24 rounded-full bg-gradient-to-br ${t.gradientFlare} blur-xl pointer-events-none group-hover:scale-150 transition-transform duration-500`}
                  />

                  <div className="flex items-center justify-between z-10">
                    <span className={`w-8 h-8 rounded-lg ${t.iconBg} text-white font-bold text-xs flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform duration-200`}>
                      {t.icon}
                    </span>
                    {isProOnly ? (
                      isPro ? (
                        <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200 flex items-center gap-1">
                          <LuCrown className="w-2.5 h-2.5" /> PRO
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200 flex items-center gap-1">
                          <LuCrown className="w-2.5 h-2.5 text-amber-600" /> PRO
                        </span>
                      )
                    ) : isWatermark ? (
                      watermarkAccess?.allowed ? (
                        <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                          {watermarkAccess.remaining} / 5 free
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200 flex items-center gap-1">
                          <LuCrown className="w-2.5 h-2.5 text-amber-600" /> PRO
                        </span>
                      )
                    ) : (
                      <span className="text-[10px] font-semibold text-slate-400 group-hover:text-slate-600 transition tracking-wide">
                        Edit
                      </span>
                    )}
                  </div>

                  <div className="z-10">
                    <div className="font-bold text-slate-900 text-xs group-hover:text-red-600 transition-colors">{t.title}</div>
                    <div className="text-[11px] text-slate-400 mt-0.5">{t.desc}</div>
                  </div>
                </div>
              );
              })}
            </div>
          </div>
        )}

        {/* Organize PDF */}
        {(activeCategory === "all" || activeCategory === "organize") && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-sm">Organize PDF</h3>
              <Link href="/app/tools" className="text-xs text-blue-600 hover:text-blue-700 font-semibold">View All &rarr;</Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              {organizeTools.map((t) => {
                const isOrganizerPro = false;
                return (
                <div
                  key={t.title}
                  onClick={() => {
                    setSelectedOrganizeTool(t);
                  }}
                  className={`group relative overflow-hidden backdrop-blur-xl bg-white/70 hover:bg-white/95 border border-slate-200/80 ${t.borderHover} rounded-2xl p-4 shadow-xs hover:shadow-lg transition-all duration-300 cursor-pointer flex flex-col justify-between space-y-3`}
                >
                  {/* Thematic Corner Gradient Flare */}
                  <div
                    className={`absolute -top-10 -right-10 w-24 h-24 rounded-full bg-gradient-to-br ${t.gradientFlare} blur-xl pointer-events-none group-hover:scale-150 transition-transform duration-500`}
                  />

                  <div className="flex items-center justify-between z-10">
                    <span className={`w-8 h-8 rounded-lg ${t.iconBg} text-white font-bold text-xs flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform duration-200`}>
                      {t.icon}
                    </span>
                    {isOrganizerPro ? (
                      isPro ? (
                        <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200 flex items-center gap-1">
                          <LuCrown className="w-2.5 h-2.5" /> PRO
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200 flex items-center gap-1">
                          <LuCrown className="w-2.5 h-2.5 text-amber-600" /> PRO
                        </span>
                      )
                    ) : (
                      <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        Free
                      </span>
                    )}
                  </div>

                  <div className="z-10">
                    <div className="font-bold text-slate-900 text-xs group-hover:text-blue-600 transition-colors">{t.title}</div>
                    <div className="text-[11px] text-slate-400 mt-0.5">{t.desc}</div>
                  </div>
                </div>
              );
              })}
            </div>
          </div>
        )}

        {/* Compress & Security */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {(activeCategory === "all" || activeCategory === "compress") && (
            <div className="space-y-3">
              <h3 className="font-bold text-slate-900 text-sm">Compress PDF</h3>
              <div className="grid grid-cols-2 gap-3">
                {compressTools.map((t) => (
                  <div
                    key={t.title}
                    onClick={() => setSelectedCompressTool(t)}
                    className={`group relative overflow-hidden backdrop-blur-xl bg-white/70 hover:bg-white/95 border border-slate-200/80 ${t.borderHover} rounded-2xl p-4 shadow-xs hover:shadow-lg transition-all duration-300 cursor-pointer flex flex-col justify-between space-y-3`}
                  >
                    {/* Thematic Corner Gradient Flare */}
                    <div
                      className={`absolute -top-10 -right-10 w-24 h-24 rounded-full bg-gradient-to-br ${t.gradientFlare} blur-xl pointer-events-none group-hover:scale-150 transition-transform duration-500`}
                    />

                    <div className="flex items-center justify-between z-10">
                      <span className={`w-8 h-8 rounded-lg ${t.iconBg} text-white font-bold text-xs flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform duration-200`}>
                        {t.icon}
                      </span>
                      <span className="text-[10px] font-semibold text-slate-400 group-hover:text-slate-600 transition tracking-wide">
                        Compress
                      </span>
                    </div>

                    <div className="z-10">
                      <div className="font-bold text-slate-900 text-xs group-hover:text-purple-600 transition-colors">{t.title}</div>
                      <div className="text-[11px] text-slate-400 mt-0.5">{t.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {(activeCategory === "all" || activeCategory === "security") && (
            <div className="space-y-3">
              <h3 className="font-bold text-slate-900 text-sm">Security & Protect</h3>
              <div className="grid grid-cols-2 gap-3">
                {securityTools.map((t) => {
                  const isRedact = t.id === "redact-pdf";
                  const lockAccess = !isRedact ? checkClientFeatureAccess("pdf:encrypt", isPro) : null;
                  return (
                  <div
                    key={t.title}
                    onClick={() => {
                      if (isRedact && !isPro) {
                        setHighlightFeature("True PDF Redaction");
                        setIsUpgradeOpen(true);
                        return;
                      }
                      if (lockAccess && !lockAccess.allowed) {
                        setHighlightFeature("PDF Encryption Quota");
                        setIsUpgradeOpen(true);
                        return;
                      }
                      setSelectedSecurityTool(t);
                    }}
                    className={`group relative overflow-hidden backdrop-blur-xl bg-white/70 hover:bg-white/95 border border-slate-200/80 ${t.borderHover} rounded-2xl p-4 shadow-xs hover:shadow-lg transition-all duration-300 cursor-pointer flex flex-col justify-between space-y-3`}
                  >
                    {/* Thematic Corner Gradient Flare */}
                    <div
                      className={`absolute -top-10 -right-10 w-24 h-24 rounded-full bg-gradient-to-br ${t.gradientFlare} blur-xl pointer-events-none group-hover:scale-150 transition-transform duration-500`}
                    />

                    <div className="flex items-center justify-between z-10">
                      <span className={`w-8 h-8 rounded-lg ${t.iconBg} text-white font-bold text-xs flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform duration-200`}>
                        {t.icon}
                      </span>
                      {isRedact ? (
                        isPro ? (
                          <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200 flex items-center gap-1">
                            <LuCrown className="w-2.5 h-2.5" /> PRO
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200 flex items-center gap-1">
                            <LuCrown className="w-2.5 h-2.5 text-amber-600" /> PRO
                          </span>
                        )
                      ) : (
                        lockAccess?.allowed ? (
                          <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                            {lockAccess.remaining} / 3 free
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200 flex items-center gap-1">
                            <LuCrown className="w-2.5 h-2.5 text-amber-600" /> PRO
                          </span>
                        )
                      )}
                    </div>

                    <div className="z-10">
                      <div className="font-bold text-slate-900 text-xs group-hover:text-red-600 transition-colors">{t.title}</div>
                      <div className="text-[11px] text-slate-400 mt-0.5">{t.desc}</div>
                    </div>
                  </div>
                );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
