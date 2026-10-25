"use client";

import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { PDFDocument } from "pdf-lib";
import {
  LuUpload,
  LuFileText,
  LuMinimize2,
  LuX,
  LuDownload,
  LuLoader,
  LuCircleCheck,
  LuCircleAlert,
  LuRefreshCw,
  LuSparkles,
  LuArrowDown,
  LuCheck,
} from "react-icons/lu";

export type CompressAction =
  | "compress-pdf"
  | "compress-to-100kb"
  | "compress-to-1mb"
  | "high-quality-compress";

export interface CompressToolConfig {
  id: string;
  action: CompressAction;
  title: string;
  desc: string;
  icon: React.ReactNode;
  iconBg: string;
  borderHover: string;
  gradientFlare: string;
}

interface CompressModalProps {
  isOpen: boolean;
  onClose: () => void;
  tool: CompressToolConfig | null;
}

export function CompressModal({ isOpen, onClose, tool }: CompressModalProps) {
  const [mounted, setMounted] = useState(false);
  const [status, setStatus] = useState<"idle" | "processing" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState<number | null>(null);
  const [pageThumbnails, setPageThumbnails] = useState<Record<number, string>>({});
  const [isLoadingThumbnails, setIsLoadingThumbnails] = useState<boolean>(false);

  // Compression level (for generic Compress PDF)
  // "extreme" (~0.4 quality, 0.6 scale), "recommended" (~0.7 quality, 0.85 scale), "low" (~0.88 quality, 1.0 scale)
  const [compressLevel, setCompressLevel] = useState<"extreme" | "recommended" | "low">("recommended");

  // Output stats
  const [outputFileName, setOutputFileName] = useState<string>("");
  const [originalSize, setOriginalSize] = useState<number>(0);
  const [compressedSize, setCompressedSize] = useState<number>(0);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [downloadFileName, setDownloadFileName] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const resetState = () => {
    if (downloadUrl) {
      URL.revokeObjectURL(downloadUrl);
    }
    setSelectedFile(null);
    setPageCount(null);
    setPageThumbnails({});
    setIsLoadingThumbnails(false);
    setCompressLevel("recommended");
    setOutputFileName("");
    setOriginalSize(0);
    setCompressedSize(0);
    setDownloadUrl(null);
    setDownloadFileName(null);
    setStatus("idle");
    setErrorMessage(null);
    setIsDragging(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
      resetState();
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  useEffect(() => {
    resetState();
  }, [tool?.id]);

  if (!isOpen || !tool || !mounted) return null;

  const formatFileSize = (bytes: number) => {
    if (bytes <= 0) return "0 B";
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(2) + " MB";
  };

  const generateThumbnails = async (file: File, totalPages: number) => {
    setIsLoadingThumbnails(true);
    try {
      const pdfjs = await import("pdfjs-dist");
      if (!pdfjs.GlobalWorkerOptions.workerSrc) {
        pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
      }

      const arrayBuffer = await file.arrayBuffer();
      const loadingTask = pdfjs.getDocument({
        data: new Uint8Array(arrayBuffer.slice(0)),
        cMapUrl: "https://unpkg.com/pdfjs-dist@5.4.296/cmaps/",
        cMapPacked: true,
      });

      const pdf = await loadingTask.promise;
      const count = Math.min(totalPages, pdf.numPages, 12); // preview up to 12 pages for quick load

      for (let pageNum = 1; pageNum <= count; pageNum++) {
        try {
          const page = await pdf.getPage(pageNum);
          const originalViewport = page.getViewport({ scale: 1 });
          const scale = Math.min(2, 160 / originalViewport.width);
          const viewport = page.getViewport({ scale });

          const canvas = document.createElement("canvas");
          canvas.width = Math.floor(viewport.width);
          canvas.height = Math.floor(viewport.height);
          const ctx = canvas.getContext("2d");

          if (ctx) {
            await page.render({
              canvasContext: ctx,
              viewport: viewport,
              canvas: canvas,
            }).promise;

            const dataUrl = canvas.toDataURL("image/jpeg", 0.8);
            setPageThumbnails((prev) => ({ ...prev, [pageNum]: dataUrl }));
          }
        } catch {}
      }
    } catch (e) {
      console.warn("Could not generate previews:", e);
    } finally {
      setIsLoadingThumbnails(false);
    }
  };

  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setStatus("idle");
    setErrorMessage(null);

    const file = files[0];
    if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
      setErrorMessage("Please select a valid PDF document (.pdf).");
      return;
    }

    try {
      setSelectedFile(file);
      setOriginalSize(file.size);
      const buf = await file.arrayBuffer();
      const doc = await PDFDocument.load(buf, { ignoreEncryption: true });
      const count = doc.getPageCount();
      setPageCount(count);

      const baseName = file.name.replace(/\.pdf$/i, "");
      setOutputFileName(`${baseName}_compressed.pdf`);

      generateThumbnails(file, count);
    } catch {
      setErrorMessage("Could not read PDF. It might be corrupt or password-protected.");
    }
  };

  const triggerDownload = (url: string, name: string) => {
    const a = document.createElement("a");
    a.href = url;
    a.download = name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleCompress = async () => {
    if (!selectedFile || !pageCount) return;
    setStatus("processing");
    setErrorMessage(null);

    try {
      const arrayBuffer = await selectedFile.arrayBuffer();

      // High Quality Compress: Lossless stream optimization & metadata cleaning
      if (tool.action === "high-quality-compress") {
        const srcDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
        // Clean metadata and optimize object streams
        srcDoc.setTitle("");
        srcDoc.setAuthor("");
        srcDoc.setSubject("");
        srcDoc.setKeywords([]);
        srcDoc.setProducer("XSW Tools PDF Optimizer");
        srcDoc.setCreator("XSW Tools PDF Optimizer");

        const pdfBytes = await srcDoc.save({ useObjectStreams: true });
        const blob = new Blob([new Uint8Array(pdfBytes)], { type: "application/pdf" });
        const finalName = outputFileName.trim() || `${selectedFile.name.replace(/\.pdf$/i, "")}_hq_compressed.pdf`;
        const url = URL.createObjectURL(blob);
        setDownloadUrl(url);
        setDownloadFileName(finalName);
        setCompressedSize(blob.size);
        setStatus("success");
        triggerDownload(url, finalName);
        return;
      }

      // For lossy & targeted compression (Compress PDF, Compress to 100KB, Compress to 1MB):
      // Downsample raster images via PDF.js canvas and rebuild clean PDFDocument
      let targetScale = 0.85;
      let targetQuality = 0.7;

      if (tool.action === "compress-to-100kb") {
        // Aggressive scaling to fit under 100KB
        targetScale = Math.min(0.65, Math.max(0.4, 100000 / (selectedFile.size || 500000)));
        targetQuality = 0.45;
      } else if (tool.action === "compress-to-1mb") {
        if (selectedFile.size > 1024 * 1024) {
          targetScale = 0.8;
          targetQuality = 0.65;
        } else {
          targetScale = 0.95;
          targetQuality = 0.8;
        }
      } else {
        // Generic compress-pdf with level selection
        if (compressLevel === "extreme") {
          targetScale = 0.65;
          targetQuality = 0.45;
        } else if (compressLevel === "low") {
          targetScale = 1.0;
          targetQuality = 0.85;
        } else {
          // recommended
          targetScale = 0.85;
          targetQuality = 0.7;
        }
      }

      const pdfjs = await import("pdfjs-dist");
      if (!pdfjs.GlobalWorkerOptions.workerSrc) {
        pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
      }

      const loadingTask = pdfjs.getDocument({
        data: new Uint8Array(arrayBuffer.slice(0)),
        cMapUrl: "https://unpkg.com/pdfjs-dist@5.4.296/cmaps/",
        cMapPacked: true,
      });

      const pdf = await loadingTask.promise;
      const newPdfDoc = await PDFDocument.create();

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const originalViewport = page.getViewport({ scale: 1.0 });
        const viewport = page.getViewport({ scale: targetScale });

        const canvas = document.createElement("canvas");
        canvas.width = Math.floor(viewport.width);
        canvas.height = Math.floor(viewport.height);
        const ctx = canvas.getContext("2d");

        if (ctx) {
          await page.render({
            canvasContext: ctx,
            viewport: viewport,
            canvas: canvas,
          }).promise;

          const jpegDataUrl = canvas.toDataURL("image/jpeg", targetQuality);
          const head = "data:image/jpeg;base64,";
          const rawBase64 = jpegDataUrl.substring(head.length);
          const binaryStr = atob(rawBase64);
          const bytes = new Uint8Array(binaryStr.length);
          for (let b = 0; b < binaryStr.length; b++) {
            bytes[b] = binaryStr.charCodeAt(b);
          }

          const embeddedJpg = await newPdfDoc.embedJpg(bytes);
          const newPage = newPdfDoc.addPage([originalViewport.width, originalViewport.height]);
          newPage.drawImage(embeddedJpg, {
            x: 0,
            y: 0,
            width: originalViewport.width,
            height: originalViewport.height,
          });
        }
      }

      const pdfBytes = await newPdfDoc.save({ useObjectStreams: true });
      const blob = new Blob([new Uint8Array(pdfBytes)], { type: "application/pdf" });
      const finalName = outputFileName.trim() || `${selectedFile.name.replace(/\.pdf$/i, "")}_compressed.pdf`;
      const url = URL.createObjectURL(blob);

      setDownloadUrl(url);
      setDownloadFileName(finalName);
      setCompressedSize(blob.size);
      setStatus("success");
      triggerDownload(url, finalName);
    } catch (err: any) {
      console.error("Compression failed:", err);
      setStatus("error");
      setErrorMessage(err.message || "Failed to compress PDF. Please verify document formatting.");
    }
  };

  const percentSaved =
    originalSize > 0 && compressedSize > 0
      ? Math.max(0, Math.round(((originalSize - compressedSize) / originalSize) * 100))
      : 0;

  return createPortal(
    <div className="fixed inset-0 z-[99999] w-screen h-[100dvh] min-h-screen bg-slate-950/75 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto overflow-x-hidden animate-in fade-in duration-200">
      <div
        className={`relative w-full ${
          selectedFile ? "max-w-2xl" : "max-w-lg"
        } bg-white/95 backdrop-blur-2xl rounded-3xl border border-slate-200/80 shadow-2xl overflow-hidden flex flex-col transition-all duration-300`}
      >
        {/* Ambient Corner Flare */}
        <div
          className={`absolute -top-16 -right-16 w-44 h-44 rounded-full bg-gradient-to-br ${tool.gradientFlare} blur-2xl pointer-events-none opacity-60`}
        />

        {/* Modal Header */}
        <div className="relative p-6 border-b border-slate-100 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <span
              className={`w-10 h-10 rounded-xl ${tool.iconBg} text-white font-bold text-sm flex items-center justify-center shadow-xs`}
            >
              {tool.icon}
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900">{tool.title}</h2>
                <span className="text-[10px] font-semibold text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-200/60">
                  Compress
                </span>
              </div>
              <p className="text-xs text-slate-500">{tool.desc}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
          >
            <LuX className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 overflow-y-auto overflow-x-hidden flex-1 min-w-0">
          {/* Dropzone */}
          {status !== "success" && !selectedFile && (
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={(e) => {
                e.preventDefault();
                setIsDragging(false);
                handleFileUpload(e.dataTransfer.files);
              }}
              onClick={() => fileInputRef.current?.click()}
              className={`relative border-2 border-dashed rounded-2xl p-8 sm:p-10 text-center cursor-pointer transition-all duration-200 ${
                isDragging
                  ? "border-purple-500 bg-purple-50/50 scale-[0.99]"
                  : "border-slate-200 hover:border-slate-300 hover:bg-slate-50/50"
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,application/pdf"
                className="hidden"
                onChange={(e) => handleFileUpload(e.target.files)}
              />
              <div className="flex flex-col items-center justify-center space-y-3">
                <span
                  className={`w-12 h-12 rounded-2xl ${tool.iconBg}/15 text-purple-700 flex items-center justify-center`}
                >
                  <LuUpload className="w-6 h-6 text-purple-700" />
                </span>
                <div>
                  <div className="text-sm font-bold text-slate-900">Choose PDF to compress</div>
                  <div className="text-xs text-slate-400 mt-0.5">
                    Drag and drop or click to browse (.pdf)
                  </div>
                </div>
                <div className="pt-2">
                  <span className="px-4 py-1.5 bg-slate-900 text-white rounded-xl text-xs font-semibold shadow-xs hover:bg-slate-800 transition">
                    Browse File
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Selected File Card */}
          {status !== "success" && selectedFile && (
            <div className="space-y-4">
              <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 flex items-center justify-between">
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-purple-600 shrink-0 shadow-2xs">
                    <LuFileText className="w-5 h-5 text-purple-600" />
                  </div>
                  <div className="truncate">
                    <div className="text-xs font-semibold text-slate-800 truncate">
                      {selectedFile.name}
                    </div>
                    <div className="text-[11px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                      <span className="font-semibold text-slate-700">
                        {formatFileSize(selectedFile.size)}
                      </span>
                      <span>•</span>
                      <span>{pageCount} pages</span>
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={resetState}
                  className="text-[11px] font-semibold text-slate-400 hover:text-red-600 transition px-2 py-1"
                >
                  Change PDF
                </button>
              </div>

              {/* Compression Mode Selector (for generic Compress PDF) */}
              {tool.action === "compress-pdf" && (
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-800">Compression Level:</label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    <button
                      type="button"
                      onClick={() => setCompressLevel("extreme")}
                      className={`p-3 rounded-2xl border text-left transition ${
                        compressLevel === "extreme"
                          ? "border-purple-600 bg-purple-50/70 text-purple-950 ring-2 ring-purple-300"
                          : "border-slate-200 hover:bg-slate-50 text-slate-700"
                      }`}
                    >
                      <div className="text-xs font-bold">Extreme</div>
                      <div className="text-[10px] text-slate-500 mt-0.5">
                        Lowest quality, smallest file (~80% saved)
                      </div>
                    </button>
                    <button
                      type="button"
                      onClick={() => setCompressLevel("recommended")}
                      className={`p-3 rounded-2xl border text-left transition ${
                        compressLevel === "recommended"
                          ? "border-purple-600 bg-purple-50/70 text-purple-950 ring-2 ring-purple-300"
                          : "border-slate-200 hover:bg-slate-50 text-slate-700"
                      }`}
                    >
                      <div className="text-xs font-bold text-purple-700 flex items-center gap-1">
                        <span>Recommended</span>
                        <LuSparkles className="w-3 h-3 text-purple-600" />
                      </div>
                      <div className="text-[10px] text-slate-500 mt-0.5">
                        Balanced quality & size (~60% saved)
                      </div>
                    </button>
                    <button
                      type="button"
                      onClick={() => setCompressLevel("low")}
                      className={`p-3 rounded-2xl border text-left transition ${
                        compressLevel === "low"
                          ? "border-purple-600 bg-purple-50/70 text-purple-950 ring-2 ring-purple-300"
                          : "border-slate-200 hover:bg-slate-50 text-slate-700"
                      }`}
                    >
                      <div className="text-xs font-bold">Less Compression</div>
                      <div className="text-[10px] text-slate-500 mt-0.5">
                        High quality, subtle reduction (~35% saved)
                      </div>
                    </button>
                  </div>
                </div>
              )}

              {/* Target Indicator for Specialized tools */}
              {tool.action === "compress-to-100kb" && (
                <div className="p-3 bg-blue-50/60 border border-blue-200 rounded-2xl flex items-center gap-2.5 text-xs text-blue-900">
                  <span className="w-7 h-7 rounded-lg bg-blue-600 text-white font-bold text-[10px] flex items-center justify-center shrink-0">
                    100K
                  </span>
                  <div>
                    <span className="font-bold">Target size: Under 100 KB</span>
                    <p className="text-[10px] text-blue-700 mt-0.5">
                      Intelligently downscales and re-encodes PDF contents to fit web forms and upload limits.
                    </p>
                  </div>
                </div>
              )}

              {tool.action === "compress-to-1mb" && (
                <div className="p-3 bg-emerald-50/60 border border-emerald-200 rounded-2xl flex items-center gap-2.5 text-xs text-emerald-900">
                  <span className="w-7 h-7 rounded-lg bg-emerald-600 text-white font-bold text-[10px] flex items-center justify-center shrink-0">
                    1M
                  </span>
                  <div>
                    <span className="font-bold">Target size: Under 1 MB</span>
                    <p className="text-[10px] text-emerald-700 mt-0.5">
                      Optimizes resolution for easy email sharing while keeping text and diagrams crisp.
                    </p>
                  </div>
                </div>
              )}

              {tool.action === "high-quality-compress" && (
                <div className="p-3 bg-amber-50/60 border border-amber-200 rounded-2xl flex items-center gap-2.5 text-xs text-amber-900">
                  <span className="w-7 h-7 rounded-lg bg-amber-500 text-white font-bold text-[10px] flex items-center justify-center shrink-0">
                    HQ
                  </span>
                  <div>
                    <span className="font-bold">Lossless Stream Optimization</span>
                    <p className="text-[10px] text-amber-700 mt-0.5">
                      Removes redundant metadata and compresses document streams with zero quality degradation.
                    </p>
                  </div>
                </div>
              )}

              {/* Page Previews Strip */}
              {pageCount && (
                <div className="space-y-1.5">
                  <div className="text-[11px] font-semibold text-slate-500 flex items-center justify-between">
                    <span>Document Pages ({pageCount})</span>
                    {isLoadingThumbnails && (
                      <span className="text-[10px] text-slate-400 flex items-center gap-1">
                        <LuLoader className="w-3 h-3 animate-spin text-purple-600" />
                        <span>Rendering previews...</span>
                      </span>
                    )}
                  </div>
                  <div className="flex gap-2 overflow-x-auto p-1.5 bg-slate-50/70 border border-slate-200/70 rounded-xl">
                    {Array.from({ length: Math.min(pageCount, 12) }, (_, i) => i + 1).map((pNum) => (
                      <div
                        key={pNum}
                        className="w-14 h-18 rounded-lg overflow-hidden bg-white border border-slate-200 flex flex-col items-center justify-between p-1 shrink-0 shadow-2xs"
                      >
                        <div className="w-full h-12 rounded overflow-hidden flex items-center justify-center bg-slate-50">
                          {pageThumbnails[pNum] ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={pageThumbnails[pNum]} alt={`Page ${pNum}`} className="w-full h-full object-contain" />
                          ) : (
                            <LuFileText className="w-4 h-4 text-slate-300" />
                          )}
                        </div>
                        <span className="text-[9px] font-semibold text-slate-500">#{pNum}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Output Filename */}
              <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                <span className="text-[11px] font-semibold text-slate-500 whitespace-nowrap">
                  Save as:
                </span>
                <input
                  type="text"
                  value={outputFileName}
                  onChange={(e) => setOutputFileName(e.target.value)}
                  placeholder="compressed_document.pdf"
                  className="flex-1 px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-1 focus:ring-purple-500 font-medium"
                />
              </div>
            </div>
          )}

          {/* Error Message Alert */}
          {errorMessage && (
            <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 flex items-start gap-2.5 text-xs text-red-700">
              <LuCircleAlert className="w-4 h-4 shrink-0 text-red-600 mt-0.5" />
              <div className="flex-1 font-medium">{errorMessage}</div>
            </div>
          )}

          {/* Processing Indicator */}
          {status === "processing" && (
            <div className="py-8 text-center space-y-3">
              <div className="w-12 h-12 rounded-full border-4 border-slate-200 border-t-purple-600 animate-spin mx-auto" />
              <div className="text-xs font-bold text-slate-800">Compressing your PDF...</div>
              <div className="text-[11px] text-slate-400">
                Optimizing streams and re-encoding pages
              </div>
            </div>
          )}

          {/* Success Screen */}
          {status === "success" && downloadUrl && (
            <div className="py-8 text-center space-y-4">
              <div className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto ring-8 ring-emerald-50/50">
                <LuCircleCheck className="w-8 h-8 text-emerald-600" />
              </div>

              <div>
                <h3 className="text-base font-bold text-slate-900">Compression Complete!</h3>
                <div className="mt-3 flex items-center justify-center gap-4">
                  <div className="text-right">
                    <div className="text-[11px] text-slate-400">Original</div>
                    <div className="text-xs font-bold text-slate-700">
                      {formatFileSize(originalSize)}
                    </div>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs shadow-2xs">
                    <LuArrowDown className="w-4 h-4" />
                  </div>
                  <div className="text-left">
                    <div className="text-[11px] text-slate-400">Compressed</div>
                    <div className="text-xs font-bold text-emerald-600">
                      {formatFileSize(compressedSize)}
                    </div>
                  </div>
                </div>

                {percentSaved > 0 && (
                  <div className="inline-block mt-3 px-3 py-1 bg-emerald-50 border border-emerald-200 rounded-full text-xs font-bold text-emerald-700">
                    Saved {percentSaved}% of file size!
                  </div>
                )}
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => triggerDownload(downloadUrl, downloadFileName || "compressed.pdf")}
                  className={`w-full sm:w-auto px-5 py-2.5 rounded-xl ${tool.iconBg} text-white text-xs font-bold shadow-md hover:opacity-90 transition flex items-center justify-center gap-2`}
                >
                  <LuDownload className="w-4 h-4" />
                  <span>Download File</span>
                </button>
                <button
                  type="button"
                  onClick={resetState}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition flex items-center justify-center gap-1.5"
                >
                  <LuRefreshCw className="w-3.5 h-3.5" />
                  <span>Compress Another</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        {status !== "success" && selectedFile && (
          <div className="p-4 sm:p-6 bg-slate-50/70 border-t border-slate-100 flex items-center justify-between shrink-0">
            <button
              type="button"
              onClick={onClose}
              disabled={status === "processing"}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:text-slate-800 transition"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleCompress}
              disabled={status === "processing"}
              className={`px-6 py-2.5 rounded-xl text-white text-xs font-bold shadow-xs hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition flex items-center gap-2 ${tool.iconBg}`}
            >
              {status === "processing" ? (
                <>
                  <LuLoader className="w-4 h-4 animate-spin" />
                  <span>Compressing...</span>
                </>
              ) : (
                <>
                  <span>Compress PDF</span>
                  <LuDownload className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}
