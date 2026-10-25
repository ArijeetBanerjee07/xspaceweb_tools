"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  LuArrowLeft,
  LuFileText,
  LuFileSpreadsheet,
  LuPresentation,
  LuImage,
  LuFile,
  LuDownload,
  LuExternalLink,
  LuShieldCheck,
  LuHardDrive,
  LuClock,
  LuFolder,
  LuTag,
  LuCopy,
  LuCheck,
  LuRefreshCw,
  LuZoomIn,
  LuZoomOut,
  LuMaximize,
  LuSparkles,
} from "react-icons/lu";

interface DocumentFile {
  id: string;
  name: string;
  sizeBytes: number;
  mimeType: string;
  secureUrl?: string;
  publicId?: string;
  previewUrl?: string;
  previewText?: string;
  folderId?: string | null;
  folderName?: string | null;
  tags?: string[];
  status?: string;
  createdAt: string;
  expiresAt?: string;
  retentionPolicy?: string;
}

export default function DocumentPreviewPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const fileId = resolvedParams.id;
  const router = useRouter();

  const [file, setFile] = useState<DocumentFile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(100);
  const [showMetadata, setShowMetadata] = useState(true);
  const [blobUrl, setBlobUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!file) return;
    const rawUrl = file.previewUrl || file.secureUrl || "";
    if (rawUrl.startsWith("data:")) {
      try {
        const parts = rawUrl.split(",");
        const mime = parts[0].match(/:(.*?);/)?.[1] || file.mimeType || "application/pdf";
        const binary = atob(parts[1]);
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) {
          bytes[i] = binary.charCodeAt(i);
        }
        const b = new Blob([bytes], { type: mime });
        const bUrl = URL.createObjectURL(b);
        setBlobUrl(bUrl);
        return () => {
          URL.revokeObjectURL(bUrl);
        };
      } catch (e) {
        setBlobUrl(rawUrl);
      }
    } else {
      setBlobUrl(rawUrl || null);
    }
  }, [file]);

  useEffect(() => {
    async function fetchFile() {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch(`/api/document-hub?fileId=${fileId}`);
        if (!res.ok) {
          throw new Error("Document not found or inaccessible");
        }
        const data = await res.json();
        if (!data.file) {
          throw new Error("Document record missing");
        }
        setFile(data.file);
      } catch (err: any) {
        setError(err.message || "Failed to load document");
      } finally {
        setLoading(false);
      }
    }
    fetchFile();
  }, [fileId]);

  const formatBytes = (bytes: number) => {
    if (!bytes || bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  };

  const formatDate = (iso: string) => {
    try {
      const d = new Date(iso);
      return d.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return iso;
    }
  };

  const getFileIcon = (mimeType: string, name: string) => {
    const ext = name.split(".").pop()?.toLowerCase();
    if (mimeType.includes("pdf") || ext === "pdf") {
      return <LuFileText className="w-5 h-5 text-red-500" />;
    }
    if (mimeType.includes("word") || ext === "docx" || ext === "doc") {
      return <LuFileText className="w-5 h-5 text-blue-500" />;
    }
    if (mimeType.includes("sheet") || ext === "xlsx" || ext === "csv") {
      return <LuFileSpreadsheet className="w-5 h-5 text-emerald-500" />;
    }
    if (mimeType.includes("presentation") || ext === "pptx" || ext === "ppt") {
      return <LuPresentation className="w-5 h-5 text-amber-500" />;
    }
    if (mimeType.startsWith("image/") || ["png", "jpg", "jpeg", "webp", "svg"].includes(ext || "")) {
      return <LuImage className="w-5 h-5 text-purple-500" />;
    }
    return <LuFile className="w-5 h-5 text-cyan-600" />;
  };

  const handleCopyLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[75vh] flex flex-col items-center justify-center space-y-3">
        <LuRefreshCw className="w-8 h-8 text-cyan-600 animate-spin" />
        <p className="text-sm font-semibold text-slate-700">Loading document preview from Cloudinary...</p>
        <p className="text-xs text-slate-400">Rendering entire high-fidelity document asset</p>
      </div>
    );
  }

  if (error || !file) {
    return (
      <div className="min-h-[75vh] flex flex-col items-center justify-center space-y-4 max-w-md mx-auto text-center p-6">
        <div className="w-14 h-14 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto border border-red-200">
          <LuFile className="w-7 h-7" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-slate-900">Document Unavailable</h2>
          <p className="text-xs text-slate-500 mt-1">{error || "Could not retrieve the requested file"}</p>
        </div>
        <Link
          href="/app/studios/document-hub"
          className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl text-xs font-semibold shadow-xs transition"
        >
          Return to Document Hub
        </Link>
      </div>
    );
  }

  const activeUrl = blobUrl || file.previewUrl || file.secureUrl || "";
  const isImage = file.mimeType.startsWith("image/") || /\.(jpe?g|png|webp|gif|svg)$/i.test(file.name);
  const isPdf = file.mimeType.includes("pdf") || file.name.toLowerCase().endsWith(".pdf");
  const isText =
    file.mimeType.includes("text") ||
    file.mimeType.includes("csv") ||
    file.mimeType.includes("json") ||
    /\.(txt|csv|json|md|log)$/i.test(file.name);

  return (
    <div className="space-y-4 pb-10">
      {/* Top Navigation & Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs">
        <div className="flex items-center gap-3 min-w-0">
          <Link
            href="/app/studios/document-hub"
            className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:text-cyan-600 hover:bg-cyan-50 transition shrink-0"
            title="Back to Document Hub"
          >
            <LuArrowLeft className="w-4 h-4" />
          </Link>

          <span className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0">
            {getFileIcon(file.mimeType, file.name)}
          </span>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="text-sm sm:text-base font-bold text-slate-900 truncate" title={file.name}>
                {file.name}
              </h1>
              {file.folderName ? (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-cyan-50 text-cyan-700 border border-cyan-100 shrink-0">
                  <LuFolder className="w-3 h-3 text-cyan-600" />
                  {file.folderName}
                </span>
              ) : (
                <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 shrink-0">
                  Unorganized
                </span>
              )}
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-2">
              <span>{formatBytes(file.sizeBytes)}</span>
              <span>&bull;</span>
              <span>{formatDate(file.createdAt)}</span>
              <span>&bull;</span>
              <span className="inline-flex items-center gap-1 text-cyan-600 font-medium">
                <LuHardDrive className="w-3 h-3" />
                Cloudinary Storage CDN
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Zoom controls for images */}
          {isImage && (
            <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-xl p-1">
              <button
                type="button"
                onClick={() => setZoomLevel((z) => Math.max(50, z - 25))}
                className="p-1 rounded text-slate-500 hover:text-slate-800"
                title="Zoom Out"
              >
                <LuZoomOut className="w-3.5 h-3.5" />
              </button>
              <span className="text-[11px] font-mono px-1 text-slate-600">{zoomLevel}%</span>
              <button
                type="button"
                onClick={() => setZoomLevel((z) => Math.min(200, z + 25))}
                className="p-1 rounded text-slate-500 hover:text-slate-800"
                title="Zoom In"
              >
                <LuZoomIn className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          <button
            type="button"
            onClick={handleCopyLink}
            className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition flex items-center gap-1.5"
          >
            {copied ? <LuCheck className="w-3.5 h-3.5 text-emerald-600" /> : <LuCopy className="w-3.5 h-3.5" />}
            <span>{copied ? "Copied!" : "Share Link"}</span>
          </button>

          {activeUrl && (
            <a
              href={activeUrl}
              target="_blank"
              rel="noreferrer"
              download={file.name}
              className="px-3 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-semibold shadow-xs transition flex items-center gap-1.5"
            >
              <LuDownload className="w-3.5 h-3.5" />
              <span>Download</span>
            </a>
          )}

          <button
            type="button"
            onClick={() => setShowMetadata(!showMetadata)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition ${
              showMetadata
                ? "bg-slate-100 border-slate-300 text-slate-800"
                : "border-slate-200 text-slate-600 hover:bg-slate-50"
            }`}
          >
            {showMetadata ? "Hide Details" : "Show Details"}
          </button>
        </div>
      </div>

      {/* Main Full Document Viewport & Sidebar Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        {/* Document Full Viewport (Col 1-9 or 12) */}
        <div
          className={`${
            showMetadata ? "lg:col-span-9" : "lg:col-span-12"
          } bg-white border border-slate-200/90 rounded-3xl shadow-sm overflow-hidden flex flex-col min-h-[75vh]`}
        >
          {/* Viewer Toolbar */}
          <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs text-slate-600">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-semibold text-slate-800">High-Resolution Document Preview</span>
              <span className="text-slate-400">&bull;</span>
              <span className="text-[11px] text-slate-500">{file.mimeType}</span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[11px] text-cyan-700 font-medium">Cloudinary CDN Accelerated</span>
              {activeUrl && (
                <a
                  href={activeUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="p-1 text-slate-400 hover:text-slate-700"
                  title="Open Raw File in New Window"
                >
                  <LuExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </div>
          </div>

          {/* Document Content Rendering */}
          <div className="flex-1 bg-slate-900/5 p-4 sm:p-6 flex items-center justify-center overflow-auto min-h-[70vh]">
            {isImage && activeUrl ? (
              <div className="w-full h-full flex items-center justify-center overflow-auto">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={activeUrl}
                  alt={file.name}
                  style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: "center center" }}
                  className="max-h-[72vh] max-w-full object-contain rounded-xl shadow-2xl transition-transform duration-200"
                  loading="eager"
                />
              </div>
            ) : isPdf && !activeUrl && (file.previewUrl || file.secureUrl) ? (
              <div className="flex flex-col items-center justify-center p-12 text-slate-500 space-y-2">
                <LuRefreshCw className="w-6 h-6 animate-spin text-cyan-600" />
                <span className="text-xs font-medium">Preparing document viewer...</span>
              </div>
            ) : isPdf && activeUrl ? (
              <iframe
                src={`${activeUrl}#toolbar=1&navpanes=0`}
                title={file.name}
                className="w-full h-[75vh] rounded-2xl shadow-xl border border-slate-200 bg-white"
              />
            ) : isText && (file.previewText || activeUrl) ? (
              <div className="w-full h-[75vh] overflow-auto bg-slate-950 text-slate-100 p-6 rounded-2xl font-mono text-xs whitespace-pre-wrap leading-relaxed shadow-2xl border border-slate-800">
                <div className="pb-3 mb-3 border-b border-slate-800 flex items-center justify-between text-slate-400 text-[11px]">
                  <span>Plain Text / Document Buffer</span>
                  <span>{file.name}</span>
                </div>
                {file.previewText ||
                  (activeUrl.startsWith("data:")
                    ? decodeURIComponent(activeUrl.split(",")[1] || "")
                    : "Loading text...")}
              </div>
            ) : (
              /* Fallback Viewer for Office / Rich Assets */
              <div className="text-center space-y-4 py-16 max-w-md mx-auto">
                <div className="w-16 h-16 rounded-3xl bg-cyan-100 text-cyan-600 flex items-center justify-center mx-auto shadow-md">
                  {getFileIcon(file.mimeType, file.name)}
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">{file.name}</h3>
                  <p className="text-xs text-slate-500 mt-1">
                    This document is stored securely in your Cloudinary repository. You can download the asset or send it directly to Studio processing tools.
                  </p>
                </div>
                <div className="flex items-center justify-center gap-2 pt-2">
                  {activeUrl && (
                    <a
                      href={activeUrl}
                      target="_blank"
                      rel="noreferrer"
                      download={file.name}
                      className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl text-xs font-semibold shadow-xs transition inline-flex items-center gap-1.5"
                    >
                      <LuDownload className="w-3.5 h-3.5" />
                      <span>Download File</span>
                    </a>
                  )}
                  <Link
                    href="/app/studios/pdf"
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition inline-flex items-center gap-1.5"
                  >
                    <span>Send to Studio</span>
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Details & Cloudinary USP Sidebar (Col 10-12) */}
        {showMetadata && (
          <div className="lg:col-span-3 space-y-4">
            {/* Cloudinary USP Asset Details Card */}
            <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <LuHardDrive className="w-4 h-4 text-cyan-600" />
                  <span className="font-bold text-slate-900 text-xs uppercase tracking-wider">
                    Cloudinary Storage Asset
                  </span>
                </div>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">
                    Cloudinary Public ID
                  </span>
                  <div className="font-mono text-slate-700 text-[11px] bg-slate-50 p-2 rounded-lg mt-1 break-all select-all border border-slate-100">
                    {file.publicId || `dochub_${file.id.slice(0, 16)}`}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-100">
                  <div>
                    <span className="text-slate-400 text-[10px] block">File Size</span>
                    <span className="font-semibold text-slate-800">{formatBytes(file.sizeBytes)}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] block">Status</span>
                    <span className="font-semibold text-emerald-600 capitalize">{file.status || "Ready"}</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100">
                  <span className="text-slate-400 text-[10px] block">Retention Guarantee</span>
                  <div className="flex items-center gap-1.5 mt-0.5 text-slate-700 font-medium">
                    <LuShieldCheck className="w-3.5 h-3.5 text-cyan-600" />
                    <span>{file.retentionPolicy === "permanent" ? "Permanent Archival" : "30-Day Guaranteed Retention"}</span>
                  </div>
                </div>

                {file.tags && file.tags.length > 0 && (
                  <div className="pt-2 border-t border-slate-100">
                    <span className="text-slate-400 text-[10px] block mb-1">Tags</span>
                    <div className="flex flex-wrap gap-1">
                      {file.tags.map((t) => (
                        <span key={t} className="text-[10px] px-2 py-0.5 rounded bg-cyan-50 text-cyan-700 font-medium">
                          #{t}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Studio Integration Shortcuts */}
            <div className="bg-gradient-to-br from-slate-50 to-cyan-50/50 border border-cyan-100 rounded-2xl p-5 shadow-xs space-y-3">
              <div className="flex items-center gap-2">
                <LuSparkles className="w-4 h-4 text-cyan-600" />
                <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
                  Open In Studio
                </h3>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                Send this asset directly into any connected AI workspace or editor:
              </p>

              <div className="space-y-1.5 text-xs">
                <Link
                  href="/app/studios/pdf"
                  className="w-full flex items-center justify-between p-2 rounded-xl bg-white border border-slate-200/80 hover:border-red-300 hover:bg-red-50/40 text-slate-700 font-semibold transition"
                >
                  <span>PDF Studio</span>
                  <LuExternalLink className="w-3.5 h-3.5 text-slate-400" />
                </Link>
                <Link
                  href="/app/studios/ai-document"
                  className="w-full flex items-center justify-between p-2 rounded-xl bg-white border border-slate-200/80 hover:border-sky-300 hover:bg-sky-50/40 text-slate-700 font-semibold transition"
                >
                  <span>AI Document Studio</span>
                  <LuExternalLink className="w-3.5 h-3.5 text-slate-400" />
                </Link>
                <Link
                  href="/app/studios/office"
                  className="w-full flex items-center justify-between p-2 rounded-xl bg-white border border-slate-200/80 hover:border-teal-300 hover:bg-teal-50/40 text-slate-700 font-semibold transition"
                >
                  <span>Office Studio</span>
                  <LuExternalLink className="w-3.5 h-3.5 text-slate-400" />
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
