"use client";

import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import JSZip from "jszip";
import { PDFDocument } from "pdf-lib";
import { recordOperation } from "@/lib/activity";
import {
  LuUpload,
  LuFileText,
  LuCircleCheck,
  LuCircleAlert,
  LuDownload,
  LuX,
  LuLoader,
  LuArrowRight,
  LuRefreshCw,
  LuImage,
  LuEye,
  LuPlus,
  LuTrash2,
  LuChevronLeft,
  LuChevronRight,
} from "react-icons/lu";

export interface ConvertToolConfig {
  id: string;
  action:
    | "pdf-to-word"
    | "word-to-pdf"
    | "pdf-to-excel"
    | "excel-to-pdf"
    | "pdf-to-ppt"
    | "ppt-to-pdf"
    | "pdf-to-images"
    | "images-to-pdf";
  title: string;
  desc: string;
  badge: string;
  iconBg: string;
  borderHover: string;
  gradientFlare: string;
  accept: string;
  acceptLabel: string;
}

interface ConvertModalProps {
  isOpen: boolean;
  onClose: () => void;
  tool: ConvertToolConfig | null;
}

interface GeneratedImageItem {
  name: string;
  url: string;
  pageNumber: number;
  size: number;
}

interface UploadedImageItem {
  id: string;
  file: File;
  previewUrl: string;
  name: string;
  size: number;
}

export function ConvertModal({ isOpen, onClose, tool }: ConvertModalProps) {
  const [mounted, setMounted] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadedImages, setUploadedImages] = useState<UploadedImageItem[]>([]);
  const [draggedImageIdx, setDraggedImageIdx] = useState<number | null>(null);
  const [detectedPages, setDetectedPages] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [status, setStatus] = useState<"idle" | "converting" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [downloadFileName, setDownloadFileName] = useState<string | null>(null);
  const [customPdfName, setCustomPdfName] = useState<string>("converted_images.pdf");
  const [generatedImages, setGeneratedImages] = useState<GeneratedImageItem[]>([]);
  const [previewImage, setPreviewImage] = useState<GeneratedImageItem | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const addMoreInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const resetState = () => {
    if (downloadUrl) {
      URL.revokeObjectURL(downloadUrl);
    }
    uploadedImages.forEach((img) => URL.revokeObjectURL(img.previewUrl));
    generatedImages.forEach((img) => URL.revokeObjectURL(img.url));
    setSelectedFile(null);
    setSelectedFiles([]);
    setUploadedImages([]);
    setDetectedPages(null);
    setGeneratedImages([]);
    setPreviewImage(null);
    setStatus("idle");
    setErrorMessage(null);
    setDownloadUrl(null);
    setDownloadFileName(null);
    setCustomPdfName("converted_images.pdf");
    if (fileInputRef.current) fileInputRef.current.value = "";
    if (addMoreInputRef.current) addMoreInputRef.current.value = "";
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

  // Cleanly reset state if tool is changed
  useEffect(() => {
    resetState();
  }, [tool?.id]);

  if (!isOpen || !tool || !mounted) return null;

  const isMultiFile = tool.action === "images-to-pdf";

  const handleFiles = (files: FileList | null, isAppend: boolean = false) => {
    if (!files || files.length === 0) return;
    setStatus("idle");
    setErrorMessage(null);
    setDetectedPages(null);
    setGeneratedImages([]);
    setPreviewImage(null);

    if (isMultiFile) {
      const validImages = Array.from(files).filter((f) =>
        f.type.startsWith("image/") || /\.(jpe?g|png|webp|gif|bmp|tiff)$/i.test(f.name)
      );
      if (validImages.length === 0) {
        setErrorMessage("Please select valid image files (JPG, PNG, WebP).");
        return;
      }
      const newItems: UploadedImageItem[] = validImages.map((f, i) => ({
        id: `${Date.now()}_${Math.random()}_${i}`,
        file: f,
        previewUrl: URL.createObjectURL(f),
        name: f.name,
        size: f.size,
      }));

      if (isAppend) {
        setUploadedImages((prev) => [...prev, ...newItems]);
        setSelectedFiles((prev) => [...prev, ...validImages]);
      } else {
        uploadedImages.forEach((img) => URL.revokeObjectURL(img.previewUrl));
        setUploadedImages(newItems);
        setSelectedFiles(validImages);
        setSelectedFile(validImages[0]);
        if (validImages.length > 0) {
          const firstBase = validImages[0].name.replace(/\.[^/.]+$/, "");
          setCustomPdfName(`${firstBase}_converted.pdf`);
        }
      }
    } else {
      const file = files[0];
      setSelectedFile(file);

      // Detect PDF page count
      if (file.name.toLowerCase().endsWith(".pdf")) {
        file
          .arrayBuffer()
          .then((buf) => PDFDocument.load(buf, { ignoreEncryption: true }))
          .then((doc) => setDetectedPages(doc.getPageCount()))
          .catch(() => setDetectedPages(null));
      }
    }
    if (fileInputRef.current) fileInputRef.current.value = "";
    if (addMoreInputRef.current) addMoreInputRef.current.value = "";
  };

  const moveImage = (from: number, to: number) => {
    if (to < 0 || to >= uploadedImages.length) return;
    setUploadedImages((prev) => {
      const copy = [...prev];
      const [item] = copy.splice(from, 1);
      copy.splice(to, 0, item);
      return copy;
    });
  };

  const removeUploadedImage = (index: number) => {
    setUploadedImages((prev) => {
      const removed = prev[index];
      if (removed) URL.revokeObjectURL(removed.previewUrl);
      const next = prev.filter((_, i) => i !== index);
      if (next.length === 0) {
        setSelectedFile(null);
        setSelectedFiles([]);
      } else {
        setSelectedFile(next[0].file);
        setSelectedFiles(next.map((n) => n.file));
      }
      return next;
    });
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files, false);
  };

  const triggerDownload = (url: string, name: string) => {
    const a = document.createElement("a");
    a.href = url;
    a.download = name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleConvert = async () => {
    if (!selectedFile && selectedFiles.length === 0 && uploadedImages.length === 0) return;

    setStatus("converting");
    setErrorMessage(null);
    setGeneratedImages([]);
    setPreviewImage(null);

    try {
      const formData = new FormData();
      formData.append("action", tool.action);

      if (isMultiFile && uploadedImages.length > 0) {
        uploadedImages.forEach((img) => formData.append("files", img.file));
        formData.append("file", uploadedImages[0].file);
        const safeName = customPdfName.trim()
          ? (customPdfName.trim().toLowerCase().endsWith(".pdf") ? customPdfName.trim() : `${customPdfName.trim()}.pdf`)
          : "converted_images.pdf";
        formData.append("outputFileName", safeName);
      } else if (selectedFile) {
        formData.append("file", selectedFile);
      }

      const res = await fetch("/api/convert", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const errorJson = await res.json().catch(() => null);
        throw new Error(errorJson?.error || `Conversion failed with status ${res.status}`);
      }

      const headerFilename = res.headers.get("x-filename");
      let resolvedFileName = headerFilename ? decodeURIComponent(headerFilename) : null;

      if (!resolvedFileName) {
        const disposition = res.headers.get("content-disposition");
        if (disposition && disposition.includes("filename=")) {
          const match = disposition.match(/filename="?([^";]+)"?/);
          if (match && match[1]) resolvedFileName = decodeURIComponent(match[1]);
        }
      }

      if (!resolvedFileName) {
        const rawName = (selectedFile?.name || "converted").replace(/\.[^/.]+$/, "");
        const fallbackExt =
          tool.action === "pdf-to-word"
            ? "docx"
            : tool.action === "pdf-to-excel"
            ? "xlsx"
            : tool.action === "pdf-to-ppt"
            ? "pptx"
            : tool.action === "pdf-to-images"
            ? "zip"
            : "pdf";
        resolvedFileName = `${rawName}_converted.${fallbackExt}`;
      }

      const blob = await res.blob();
      const objectUrl = URL.createObjectURL(blob);

      setDownloadUrl(objectUrl);
      setDownloadFileName(resolvedFileName);

      // Handle PDF to Images previews
      if (tool.action === "pdf-to-images") {
        if (resolvedFileName.endsWith(".zip") || blob.type.includes("zip")) {
          try {
            const zip = await JSZip.loadAsync(blob);
            const imageEntries: GeneratedImageItem[] = [];
            const names = Object.keys(zip.files).filter(
              (n) => /\.(png|jpe?g)$/i.test(n) && !zip.files[n].dir
            );
            names.sort((a, b) => {
              const numA = parseInt(a.match(/\d+/)?.[0] || "0", 10);
              const numB = parseInt(b.match(/\d+/)?.[0] || "0", 10);
              return numA - numB;
            });

            for (let i = 0; i < names.length; i++) {
              const fn = names[i];
              const fileBlob = await zip.files[fn].async("blob");
              const imgUrl = URL.createObjectURL(fileBlob);
              imageEntries.push({
                name: fn,
                url: imgUrl,
                pageNumber: i + 1,
                size: fileBlob.size,
              });
            }
            setGeneratedImages(imageEntries);
          } catch (zipErr) {
            console.error("Error unpacking images zip:", zipErr);
          }
        } else {
          setGeneratedImages([
            {
              name: resolvedFileName,
              url: objectUrl,
              pageNumber: 1,
              size: blob.size,
            },
          ]);
          triggerDownload(objectUrl, resolvedFileName);
        }
        setStatus("success");
      } else {
        setStatus("success");
        triggerDownload(objectUrl, resolvedFileName);
      }

      recordOperation({
        toolId: tool.action,
        toolName: tool.title,
        studioName: "PDF Studio",
        studioCategory: "pdf",
        sizeBytes: selectedFile?.size || blob.size,
        href: "/app/studios/pdf",
      });
    } catch (err: any) {
      console.error("Conversion error:", err);
      setStatus("error");
      setErrorMessage(err.message || "An unexpected error occurred during conversion.");
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  const isWideModal =
    (isMultiFile && uploadedImages.length > 0) ||
    (tool.action === "pdf-to-images" && generatedImages.length > 1);

  return createPortal(
    <div className="fixed inset-0 z-[99999] w-screen h-[100dvh] min-h-screen bg-slate-950/75 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto overflow-x-hidden animate-in fade-in duration-200">
      <div
        className={`relative w-full ${
          isWideModal ? "max-w-4xl max-h-[90vh]" : "max-w-lg"
        } bg-white/95 backdrop-blur-2xl rounded-3xl border border-slate-200/80 shadow-2xl overflow-hidden overflow-x-hidden flex flex-col transition-all duration-300`}
      >
        {/* Ambient Corner Flare */}
        <div
          className={`absolute -top-16 -right-16 w-44 h-44 rounded-full bg-gradient-to-br ${tool.gradientFlare} blur-2xl pointer-events-none opacity-60`}
        />

        {/* Header */}
        <div className="relative p-6 border-b border-slate-100 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <span
              className={`w-10 h-10 rounded-xl ${tool.iconBg} text-white font-bold text-xs flex items-center justify-center shadow-sm`}
            >
              {tool.badge}
            </span>
            <div>
              <h2 className="text-base font-bold text-slate-900">{tool.title}</h2>
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

        {/* Content Body */}
        <div className="p-6 space-y-5 overflow-y-auto overflow-x-hidden flex-1 min-w-0">
          {/* File Upload Dropzone */}
          {status !== "success" && (!isMultiFile || uploadedImages.length === 0) && (
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`relative border-2 border-dashed rounded-2xl p-6 sm:p-8 text-center cursor-pointer transition-all duration-200 ${
                isDragging
                  ? "border-blue-500 bg-blue-50/50 scale-[0.99]"
                  : "border-slate-200 hover:border-slate-300 bg-slate-50/50 hover:bg-slate-50"
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept={tool.accept}
                multiple={isMultiFile}
                onChange={(e) => handleFiles(e.target.files)}
                className="hidden"
              />

              <div className="flex flex-col items-center justify-center space-y-2">
                <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center justify-center text-slate-600">
                  <LuUpload className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <span className="text-sm font-semibold text-slate-800">Click to upload</span>{" "}
                  <span className="text-sm text-slate-500">or drag and drop</span>
                </div>
                <p className="text-xs text-slate-400">
                  Supported formats:{" "}
                  <span className="font-medium text-slate-600">{tool.acceptLabel}</span>
                </p>
              </div>
            </div>
          )}

          {/* Hidden file input when images are already selected to allow adding more */}
          {isMultiFile && uploadedImages.length > 0 && (
            <input
              ref={addMoreInputRef}
              type="file"
              accept={tool.accept}
              multiple={true}
              onChange={(e) => handleFiles(e.target.files, true)}
              className="hidden"
            />
          )}

          {/* Multi-Image Reorder Board for Images to PDF */}
          {isMultiFile && uploadedImages.length > 0 && status !== "success" && (
            <div className="space-y-3">
              {/* Output File Name Field */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 bg-slate-50 border border-slate-200/80 rounded-2xl">
                <div className="flex items-center gap-2">
                  <LuFileText className="w-4 h-4 text-rose-500 shrink-0" />
                  <span className="text-xs font-semibold text-slate-700">Output PDF Name:</span>
                </div>
                <input
                  type="text"
                  value={customPdfName}
                  onChange={(e) => setCustomPdfName(e.target.value)}
                  placeholder="converted_images.pdf"
                  className="px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-1 focus:ring-rose-500 max-w-xs w-full font-medium"
                />
              </div>

              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <div>
                  <h3 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <span>Page Order</span>
                    <span className="text-[11px] font-semibold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200/60">
                      {uploadedImages.length} {uploadedImages.length === 1 ? "page" : "pages"}
                    </span>
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Drag cards or click arrows to arrange the exact page sequence in your PDF
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => addMoreInputRef.current?.click()}
                    className="px-2.5 py-1 text-[11px] font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-lg border border-rose-200/60 transition flex items-center gap-1"
                  >
                    <LuPlus className="w-3.5 h-3.5" />
                    <span>Add More</span>
                  </button>
                  <button
                    type="button"
                    onClick={resetState}
                    className="px-2 py-1 text-[11px] font-semibold text-slate-400 hover:text-red-600 transition"
                  >
                    Clear All
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 max-h-[380px] overflow-y-auto p-1 border border-slate-100 rounded-2xl bg-slate-50/50">
                {uploadedImages.map((img, idx) => (
                  <div
                    key={img.id}
                    draggable={status !== "converting"}
                    onDragStart={() => setDraggedImageIdx(idx)}
                    onDragOver={(e) => {
                      e.preventDefault();
                      if (draggedImageIdx !== null && draggedImageIdx !== idx) {
                        moveImage(draggedImageIdx, idx);
                        setDraggedImageIdx(idx);
                      }
                    }}
                    onDragEnd={() => setDraggedImageIdx(null)}
                    className={`relative bg-white border rounded-xl p-2 flex flex-col justify-between shadow-2xs hover:shadow-md transition-all duration-150 cursor-grab active:cursor-grabbing ${
                      draggedImageIdx === idx
                        ? "border-blue-500 scale-[0.98] ring-2 ring-blue-300"
                        : "border-slate-200/80 hover:border-blue-300"
                    }`}
                  >
                    <div className="relative aspect-[16/10] bg-slate-900/5 rounded-lg overflow-hidden flex items-center justify-center">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={img.previewUrl}
                        alt={img.name}
                        className="w-full h-full object-contain pointer-events-none"
                      />
                      <span className="absolute top-1.5 left-1.5 bg-slate-900/80 backdrop-blur-xs text-white text-[10px] font-bold px-1.5 py-0.5 rounded shadow-xs">
                        Page {idx + 1}
                      </span>
                    </div>

                    <div className="mt-2 flex items-center justify-between gap-1 pt-1 border-t border-slate-100">
                      <span
                        className="text-[10px] text-slate-500 font-medium truncate max-w-[85px]"
                        title={img.name}
                      >
                        {img.name}
                      </span>
                      <div className="flex items-center gap-0.5">
                        <button
                          type="button"
                          onClick={() => moveImage(idx, idx - 1)}
                          disabled={idx === 0 || status === "converting"}
                          className="w-5 h-5 rounded flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 disabled:opacity-30 disabled:hover:bg-transparent"
                          title="Move left"
                        >
                          <LuChevronLeft className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => moveImage(idx, idx + 1)}
                          disabled={idx === uploadedImages.length - 1 || status === "converting"}
                          className="w-5 h-5 rounded flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 disabled:opacity-30 disabled:hover:bg-transparent"
                          title="Move right"
                        >
                          <LuChevronRight className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => removeUploadedImage(idx)}
                          disabled={status === "converting"}
                          className="w-5 h-5 rounded flex items-center justify-center text-slate-400 hover:text-red-600 hover:bg-red-50"
                          title="Remove image"
                        >
                          <LuTrash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Selected File Card (for non-multi-image single document tools) */}
          {!isMultiFile && selectedFile && status !== "success" && (
            <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3.5 flex items-center justify-between">
              <div className="flex items-center gap-3 overflow-hidden">
                <div className="w-9 h-9 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-600 shrink-0">
                  {tool.action === "pdf-to-images" ? (
                    <LuImage className="w-5 h-5 text-blue-600" />
                  ) : (
                    <LuFileText className="w-5 h-5 text-blue-600" />
                  )}
                </div>
                <div className="truncate">
                  <div className="text-xs font-semibold text-slate-800 truncate">
                    {selectedFile.name}
                  </div>
                  <div className="text-[11px] text-slate-400 flex items-center gap-1.5 flex-wrap mt-0.5">
                    <span>{formatFileSize(selectedFile.size)}</span>
                    {detectedPages !== null && (
                      <>
                        <span>•</span>
                        <span className="font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200/60">
                          {detectedPages} {detectedPages === 1 ? "page" : "pages"} detected
                          {tool.action === "pdf-to-images" ? ` (will generate ${detectedPages} images)` : ""}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>
              {status !== "converting" && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedFile(null);
                    setSelectedFiles([]);
                    setDetectedPages(null);
                  }}
                  className="text-xs text-slate-400 hover:text-red-600 font-medium px-2 py-1 transition"
                >
                  Remove
                </button>
              )}
            </div>
          )}

          {/* Converting State */}
          {status === "converting" && (
            <div className="py-6 flex flex-col items-center justify-center space-y-3">
              <LuLoader className="w-8 h-8 text-blue-600 animate-spin" />
              <div className="text-center">
                <p className="text-sm font-semibold text-slate-800">Converting your file...</p>
                <p className="text-xs text-slate-400 mt-0.5">
                  {tool.action === "pdf-to-images"
                    ? "Rendering high-resolution page images..."
                    : "Parsing structure and generating output document"}
                </p>
              </div>
            </div>
          )}

          {/* Success State */}
          {status === "success" && (
            <div className="space-y-4 animate-in fade-in duration-200">
              {/* Centered Success Hero */}
              <div className="flex flex-col items-center text-center pt-2 pb-1 space-y-2">
                <div className="w-13 h-13 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200/80 flex items-center justify-center shadow-xs">
                  <LuCircleCheck className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 tracking-tight">
                    {tool.action === "pdf-to-images" && generatedImages.length > 1
                      ? `${generatedImages.length} Images Ready for Download`
                      : "Conversion Successful"}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Your file has been converted and is ready for download.
                  </p>
                </div>
              </div>

              {/* Ready File Card */}
              {downloadFileName && (
                <div className="bg-slate-50/90 border border-slate-200/80 rounded-2xl p-3.5 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-10 h-10 rounded-xl ${tool.iconBg} text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-xs`}
                    >
                      {tool.badge}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-slate-800 truncate" title={downloadFileName}>
                        {downloadFileName}
                      </p>
                      <p className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1.5">
                        <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                        <span className="text-emerald-700 font-medium">Ready</span>
                        {detectedPages ? <span>• {detectedPages} pages</span> : null}
                      </p>
                    </div>
                  </div>

                  {downloadUrl && downloadFileName.toLowerCase().endsWith(".pdf") && (
                    <a
                      href={downloadUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2.5 py-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700 hover:bg-blue-50/80 rounded-lg border border-blue-200/60 transition flex items-center gap-1 shrink-0"
                    >
                      <LuEye className="w-3.5 h-3.5" />
                      <span>Preview</span>
                    </a>
                  )}
                </div>
              )}

              {/* Action Buttons: Unified, Clean, Aligned */}
              <div className="space-y-2 pt-1">
                {downloadUrl && downloadFileName && (
                  <button
                    type="button"
                    onClick={() => triggerDownload(downloadUrl, downloadFileName)}
                    className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs rounded-xl shadow-xs hover:shadow transition flex items-center justify-center gap-2 active:scale-[0.99]"
                  >
                    <LuDownload className="w-4 h-4" />
                    <span>Download Converted File</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={resetState}
                  className="w-full py-2.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200/90 font-semibold text-xs rounded-xl transition flex items-center justify-center gap-1.5 shadow-2xs hover:border-slate-300"
                >
                  <LuRefreshCw className="w-3.5 h-3.5 text-slate-500" />
                  <span>Convert Another File</span>
                </button>
              </div>

              {/* Multi-Image Preview Gallery for PDF to Images */}
              {tool.action === "pdf-to-images" && generatedImages.length > 0 && (
                <div className="space-y-3 pt-2 border-t border-slate-100">
                  <div className="flex items-center justify-between text-xs text-slate-600 px-1">
                    <span className="font-semibold text-slate-800">
                      Page Previews ({generatedImages.length})
                    </span>
                    <span className="text-[11px] text-slate-400">
                      Click image to enlarge or save
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 max-h-[360px] overflow-y-auto p-1.5 border border-slate-100 rounded-2xl bg-slate-50/50">
                    {generatedImages.map((img) => (
                      <div
                        key={img.name}
                        className="group relative bg-white border border-slate-200/80 hover:border-blue-400 rounded-xl p-2 flex flex-col justify-between shadow-2xs hover:shadow-md transition-all duration-200"
                      >
                        <div
                          onClick={() => setPreviewImage(img)}
                          className="relative aspect-[16/10] bg-slate-900/5 rounded-lg overflow-hidden cursor-pointer flex items-center justify-center group-hover:opacity-95"
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={img.url}
                            alt={img.name}
                            className="w-full h-full object-contain"
                          />
                          <span className="absolute top-1.5 left-1.5 bg-slate-900/75 backdrop-blur-xs text-white text-[10px] font-semibold px-1.5 py-0.5 rounded shadow-xs">
                            Page {img.pageNumber}
                          </span>
                          <div className="absolute inset-0 bg-slate-900/30 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white">
                            <LuEye className="w-5 h-5 drop-shadow" />
                          </div>
                        </div>

                        <div className="mt-2 flex items-center justify-between gap-1 pt-1 border-t border-slate-100">
                          <span className="text-[10px] text-slate-500 font-medium truncate">
                            {formatFileSize(img.size)}
                          </span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              triggerDownload(img.url, img.name);
                            }}
                            className="px-2 py-1 bg-slate-100 hover:bg-blue-600 hover:text-white text-slate-700 font-semibold text-[11px] rounded-lg transition flex items-center gap-1"
                            title={`Download ${img.name}`}
                          >
                            <LuDownload className="w-3 h-3" />
                            <span>Save</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Images to PDF Visual Verification Gallery */}
              {tool.action === "images-to-pdf" && uploadedImages.length > 0 && (
                <div className="space-y-3 pt-2 border-t border-slate-100">
                  <div className="flex items-center justify-between text-xs text-slate-600 px-1">
                    <span className="font-semibold text-slate-800 flex items-center gap-1.5">
                      <span>Pages in Created PDF ({uploadedImages.length})</span>
                      <span className="text-[10px] text-emerald-700 bg-emerald-100 font-bold px-2 py-0.5 rounded-full">
                        Ready
                      </span>
                    </span>
                    {downloadUrl && (
                      <a
                        href={downloadUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[11px] font-semibold text-rose-600 hover:text-rose-700 flex items-center gap-1 hover:underline"
                      >
                        <LuEye className="w-3.5 h-3.5" />
                        <span>Preview PDF in New Tab</span>
                      </a>
                    )}
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 max-h-[300px] overflow-y-auto p-1.5 border border-slate-100 rounded-2xl bg-slate-50/50">
                    {uploadedImages.map((img, idx) => (
                      <div
                        key={img.id}
                        className="relative bg-white border border-slate-200/80 rounded-xl p-2 flex flex-col justify-between shadow-2xs"
                      >
                        <div className="relative aspect-[16/10] bg-slate-900/5 rounded-lg overflow-hidden flex items-center justify-center">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={img.previewUrl}
                            alt={img.name}
                            className="w-full h-full object-contain pointer-events-none"
                          />
                          <span className="absolute top-1.5 left-1.5 bg-slate-900/80 backdrop-blur-xs text-white text-[10px] font-bold px-1.5 py-0.5 rounded shadow-xs">
                            Page {idx + 1}
                          </span>
                        </div>
                        <div className="mt-1.5 flex items-center justify-between text-[10px] text-slate-500 pt-1 border-t border-slate-100">
                          <span className="truncate max-w-[100px]" title={img.name}>
                            {img.name}
                          </span>
                          <span>{formatFileSize(img.size)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Error State */}
          {status === "error" && errorMessage && (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-start gap-3">
              <LuCircleAlert className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              <div className="text-xs text-red-700">
                <span className="font-semibold">Error: </span>
                {errorMessage}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions (Only when idle/converting) */}
        {status !== "success" && (
          <div className="px-6 py-4 bg-slate-50/80 border-t border-slate-100 flex items-center justify-end gap-3 shrink-0">
            <button
              onClick={onClose}
              disabled={status === "converting"}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 transition disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleConvert}
              disabled={
                (isMultiFile ? uploadedImages.length === 0 : !selectedFile) ||
                status === "converting"
              }
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-sm hover:shadow transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {status === "converting" ? (
                <>
                  <LuLoader className="w-3.5 h-3.5 animate-spin" />
                  Converting...
                </>
              ) : (
                <>
                  {isMultiFile && uploadedImages.length > 0
                    ? `Convert ${uploadedImages.length} Image${uploadedImages.length > 1 ? "s" : ""} to PDF`
                    : tool.action === "pdf-to-images" && detectedPages
                    ? `Convert ${detectedPages} Pages to Images`
                    : "Convert Now"}
                  <LuArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Enlarged Image Lightbox Modal */}
      {previewImage && (
        <div
          onClick={() => setPreviewImage(null)}
          className="fixed inset-0 z-[100000] bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-150"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-4xl max-h-[90vh] bg-white rounded-2xl p-4 shadow-2xl flex flex-col items-center gap-3 overflow-hidden"
          >
            <div className="w-full flex items-center justify-between border-b border-slate-100 pb-2">
              <span className="text-xs font-bold text-slate-800">
                Page {previewImage.pageNumber} • {previewImage.name}
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => triggerDownload(previewImage.url, previewImage.name)}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition"
                >
                  <LuDownload className="w-3.5 h-3.5" />
                  Download Image
                </button>
                <button
                  onClick={() => setPreviewImage(null)}
                  className="w-7 h-7 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                >
                  <LuX className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="overflow-auto max-h-[75vh] flex items-center justify-center bg-slate-50 rounded-xl p-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={previewImage.url}
                alt={previewImage.name}
                className="max-h-[70vh] object-contain rounded-lg shadow-xs"
              />
            </div>
          </div>
        </div>
      )}
    </div>,
    document.body
  );
}
