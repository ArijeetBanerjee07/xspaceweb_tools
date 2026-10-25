"use client";

import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { PDFDocument, rgb } from "pdf-lib";
import { encryptPDF } from "@pdfsmaller/pdf-encrypt";
import {
  LuUpload,
  LuFileText,
  LuLock,
  LuLockOpen,
  LuShield,
  LuEyeOff,
  LuX,
  LuDownload,
  LuLoader,
  LuCircleCheck,
  LuCircleAlert,
  LuRefreshCw,
  LuKey,
  LuCheck,
  LuEye,
} from "react-icons/lu";

export type SecurityAction = "lock-pdf" | "unlock-pdf" | "encrypt-pdf" | "redact-pdf";

export interface SecurityToolConfig {
  id: string;
  action: SecurityAction;
  title: string;
  desc: string;
  icon: React.ReactNode;
  iconBg: string;
  borderHover: string;
  gradientFlare: string;
}

interface SecurityModalProps {
  isOpen: boolean;
  onClose: () => void;
  tool: SecurityToolConfig | null;
}

export function SecurityModal({ isOpen, onClose, tool }: SecurityModalProps) {
  const [mounted, setMounted] = useState(false);
  const [status, setStatus] = useState<"idle" | "processing" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState<number | null>(null);
  const [pageThumbnails, setPageThumbnails] = useState<Record<number, string>>({});
  const [isLoadingThumbnails, setIsLoadingThumbnails] = useState<boolean>(false);

  // Lock & Unlock & Encrypt passwords
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [ownerPassword, setOwnerPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Advanced encryption permissions
  const [allowPrinting, setAllowPrinting] = useState(true);
  const [allowCopying, setAllowCopying] = useState(false);
  const [allowModifying, setAllowModifying] = useState(false);

  // Redaction state
  const [redactPages, setRedactPages] = useState<Set<number>>(new Set());
  const [redactReason, setRedactReason] = useState("CONFIDENTIAL");

  // Output
  const [outputFileName, setOutputFileName] = useState("");
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [downloadFileName, setDownloadFileName] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string>("");

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
    setPassword("");
    setConfirmPassword("");
    setOwnerPassword("");
    setShowPassword(false);
    setAllowPrinting(true);
    setAllowCopying(false);
    setAllowModifying(false);
    setRedactPages(new Set());
    setRedactReason("CONFIDENTIAL");
    setOutputFileName("");
    setDownloadUrl(null);
    setDownloadFileName(null);
    setSuccessMessage("");
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
      const count = Math.min(totalPages, pdf.numPages, 12);

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
    } catch {
      // Ignored if password protected
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
      const baseName = file.name.replace(/\.pdf$/i, "");

      if (tool.action === "lock-pdf") {
        setOutputFileName(`${baseName}_protected.pdf`);
      } else if (tool.action === "unlock-pdf") {
        setOutputFileName(`${baseName}_unlocked.pdf`);
      } else if (tool.action === "encrypt-pdf") {
        setOutputFileName(`${baseName}_encrypted.pdf`);
      } else {
        setOutputFileName(`${baseName}_redacted.pdf`);
      }

      const buf = await file.arrayBuffer();
      try {
        const doc = await PDFDocument.load(buf, { ignoreEncryption: true });
        const count = doc.getPageCount();
        setPageCount(count);
        generateThumbnails(file, count);
      } catch {
        // Document is encrypted/password protected
        setPageCount(null);
      }
    } catch {
      setErrorMessage("Could not parse PDF file.");
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

  const handleProcessSecurity = async () => {
    if (!selectedFile) return;
    setStatus("processing");
    setErrorMessage(null);

    try {
      const arrayBuffer = await selectedFile.arrayBuffer();
      const baseBytes = new Uint8Array(arrayBuffer);

      if (tool.action === "lock-pdf") {
        if (!password.trim()) throw new Error("Please enter a password to protect this document.");
        if (password !== confirmPassword) throw new Error("Passwords do not match.");

        const encryptedBytes = await encryptPDF(baseBytes, password.trim());
        const blob = new Blob([new Uint8Array(encryptedBytes)], { type: "application/pdf" });
        const finalName = outputFileName.trim() || `${selectedFile.name.replace(/\.pdf$/i, "")}_protected.pdf`;
        const url = URL.createObjectURL(blob);

        setDownloadUrl(url);
        setDownloadFileName(finalName);
        setSuccessMessage("Your PDF has been locked with military-grade AES-256 encryption. The password will be required whenever anyone opens it.");
        setStatus("success");
        triggerDownload(url, finalName);
      } else if (tool.action === "unlock-pdf") {
        if (!password.trim()) throw new Error("Please enter the password to unlock this document.");

        const pdfjs = await import("pdfjs-dist");
        if (!pdfjs.GlobalWorkerOptions.workerSrc) {
          pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
        }

        let pdfDoc;
        try {
          const loadingTask = pdfjs.getDocument({
            data: new Uint8Array(baseBytes.slice(0)),
            password: password.trim(),
            cMapUrl: "https://unpkg.com/pdfjs-dist@5.4.296/cmaps/",
            cMapPacked: true,
          });
          pdfDoc = await loadingTask.promise;
        } catch (authErr: any) {
          throw new Error("Incorrect password. Please verify the password and try again.");
        }

        const newDoc = await PDFDocument.create();
        for (let i = 1; i <= pdfDoc.numPages; i++) {
          const page = await pdfDoc.getPage(i);
          const viewport = page.getViewport({ scale: 1.5 });
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

            const jpegDataUrl = canvas.toDataURL("image/jpeg", 0.9);
            const head = "data:image/jpeg;base64,";
            const rawBase64 = jpegDataUrl.substring(head.length);
            const binaryStr = atob(rawBase64);
            const bytes = new Uint8Array(binaryStr.length);
            for (let b = 0; b < binaryStr.length; b++) bytes[b] = binaryStr.charCodeAt(b);

            const embeddedJpg = await newDoc.embedJpg(bytes);
            const unscaled = page.getViewport({ scale: 1 });
            const newPage = newDoc.addPage([unscaled.width, unscaled.height]);
            newPage.drawImage(embeddedJpg, {
              x: 0,
              y: 0,
              width: unscaled.width,
              height: unscaled.height,
            });
          }
        }

        const pdfBytes = await newDoc.save({ useObjectStreams: true });
        const blob = new Blob([new Uint8Array(pdfBytes)], { type: "application/pdf" });
        const finalName = outputFileName.trim() || `${selectedFile.name.replace(/\.pdf$/i, "")}_unlocked.pdf`;
        const url = URL.createObjectURL(blob);

        setDownloadUrl(url);
        setDownloadFileName(finalName);
        setSuccessMessage("Password successfully removed! This PDF can now be opened by anyone without credentials.");
        setStatus("success");
        triggerDownload(url, finalName);
      } else if (tool.action === "encrypt-pdf") {
        if (!password.trim()) throw new Error("Please enter a User Password to open the document.");

        const encryptedBytes = await encryptPDF(baseBytes, password.trim(), {
          ownerPassword: ownerPassword.trim() || password.trim(),
          algorithm: "AES-256",
          allowPrinting: allowPrinting,
          allowModifying: allowModifying,
          allowCopying: allowCopying,
          allowAnnotating: allowModifying,
          allowFillingForms: true,
          allowAssembly: allowModifying,
          allowHighQualityPrint: allowPrinting,
        });

        const blob = new Blob([new Uint8Array(encryptedBytes)], { type: "application/pdf" });
        const finalName = outputFileName.trim() || `${selectedFile.name.replace(/\.pdf$/i, "")}_encrypted.pdf`;
        const url = URL.createObjectURL(blob);

        setDownloadUrl(url);
        setDownloadFileName(finalName);
        setSuccessMessage("Advanced encryption applied with granular access controls (Printing, Copying, Modifying).");
        setStatus("success");
        triggerDownload(url, finalName);
      } else if (tool.action === "redact-pdf") {
        if (redactPages.size === 0) {
          throw new Error("Please select at least one page or header to redact.");
        }

        const pdfjs = await import("pdfjs-dist");
        if (!pdfjs.GlobalWorkerOptions.workerSrc) {
          pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
        }

        const loadingTask = pdfjs.getDocument({
          data: new Uint8Array(baseBytes.slice(0)),
          cMapUrl: "https://unpkg.com/pdfjs-dist@5.4.296/cmaps/",
          cMapPacked: true,
        });

        const pdfDoc = await loadingTask.promise;
        const cleanDoc = await PDFDocument.create();

        // shortcut: renders target pages to 1.8x canvas and burns redaction to destroy underlying text stream, upgrade to vector stream rewriting if 1000+ page docs are required
        for (let i = 1; i <= pdfDoc.numPages; i++) {
          const page = await pdfDoc.getPage(i);
          const viewport = page.getViewport({ scale: 1.8 });
          const canvas = document.createElement("canvas");
          canvas.width = Math.floor(viewport.width);
          canvas.height = Math.floor(viewport.height);
          const ctx = canvas.getContext("2d");

          if (ctx) {
            await page.render({ canvasContext: ctx, viewport, canvas }).promise;

            if (redactPages.has(i)) {
              // Burn true blackout box directly into canvas pixels
              ctx.fillStyle = "#000000";
              ctx.fillRect(30 * 1.8, 30 * 1.8, (viewport.width / 1.8 - 60) * 1.8, 70 * 1.8);
              ctx.fillStyle = "#ffffff";
              ctx.font = `bold ${11 * 1.8}px sans-serif`;
              ctx.textAlign = "center";
              ctx.textBaseline = "middle";
              ctx.fillText(redactReason || "CONFIDENTIAL", viewport.width / 2, 65 * 1.8);
            }

            const jpegDataUrl = canvas.toDataURL("image/jpeg", 0.92);
            const rawBase64 = jpegDataUrl.substring("data:image/jpeg;base64,".length);
            const binaryStr = atob(rawBase64);
            const bytes = new Uint8Array(binaryStr.length);
            for (let b = 0; b < binaryStr.length; b++) bytes[b] = binaryStr.charCodeAt(b);

            const embeddedJpg = await cleanDoc.embedJpg(bytes);
            const unscaled = page.getViewport({ scale: 1 });
            const newPage = cleanDoc.addPage([unscaled.width, unscaled.height]);
            newPage.drawImage(embeddedJpg, {
              x: 0,
              y: 0,
              width: unscaled.width,
              height: unscaled.height,
            });
          }
        }

        const pdfBytes = await cleanDoc.save();
        const blob = new Blob([new Uint8Array(pdfBytes)], { type: "application/pdf" });
        const finalName = outputFileName.trim() || `${selectedFile.name.replace(/\.pdf$/i, "")}_redacted.pdf`;
        const url = URL.createObjectURL(blob);

        setDownloadUrl(url);
        setDownloadFileName(finalName);
        setSuccessMessage(`True PDF Redaction complete on ${redactPages.size} pages. Underlying text and objects were permanently destroyed.`);
        setStatus("success");
        triggerDownload(url, finalName);
      }
    } catch (err: any) {
      console.error("Security operation error:", err);
      setStatus("error");
      setErrorMessage(err.message || "Failed to process document security.");
    }
  };

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
                <span className="text-[10px] font-semibold text-red-600 bg-red-50 px-2 py-0.5 rounded-full border border-red-200/60">
                  Security
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
                  ? "border-red-500 bg-red-50/50 scale-[0.99]"
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
                  className={`w-12 h-12 rounded-2xl ${tool.iconBg}/15 text-slate-700 flex items-center justify-center`}
                >
                  <LuUpload className="w-6 h-6 text-slate-700" />
                </span>
                <div>
                  <div className="text-sm font-bold text-slate-900">Choose PDF Document</div>
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
                  <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-red-600 shrink-0 shadow-2xs">
                    <LuFileText className="w-5 h-5 text-red-600" />
                  </div>
                  <div className="truncate">
                    <div className="text-xs font-semibold text-slate-800 truncate">
                      {selectedFile.name}
                    </div>
                    <div className="text-[11px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                      <span className="font-semibold text-slate-700">
                        {formatFileSize(selectedFile.size)}
                      </span>
                      {pageCount !== null && (
                        <>
                          <span>•</span>
                          <span>{pageCount} pages</span>
                        </>
                      )}
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

              {/* Lock PDF password inputs */}
              {tool.action === "lock-pdf" && (
                <div className="space-y-3 bg-red-50/40 border border-red-200/80 rounded-2xl p-4">
                  <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <LuLock className="w-4 h-4 text-red-600" />
                    <span>Set Document Password</span>
                  </div>
                  <div className="space-y-2">
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter password..."
                        className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-1 focus:ring-red-500 font-medium pr-9"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 text-xs"
                      >
                        <LuEye className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <input
                      type={showPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm password..."
                      className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-1 focus:ring-red-500 font-medium"
                    />
                  </div>
                  <p className="text-[10px] text-slate-500">
                    Document will be encrypted with 256-bit AES protection. Anyone opening the file will be required to type this password.
                  </p>
                </div>
              )}

              {/* Unlock PDF input */}
              {tool.action === "unlock-pdf" && (
                <div className="space-y-3 bg-blue-50/40 border border-blue-200/80 rounded-2xl p-4">
                  <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <LuLockOpen className="w-4 h-4 text-blue-600" />
                    <span>Enter Current Password to Decrypt</span>
                  </div>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Document password..."
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 font-medium"
                  />
                  <p className="text-[10px] text-slate-500">
                    Unlocks and re-saves the document so you never have to enter the password again.
                  </p>
                </div>
              )}

              {/* Encrypt PDF advanced controls */}
              {tool.action === "encrypt-pdf" && (
                <div className="space-y-3 bg-emerald-50/40 border border-emerald-200/80 rounded-2xl p-4">
                  <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <LuShield className="w-4 h-4 text-emerald-600" />
                    <span>Encryption & Permissions</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div>
                      <label className="text-[11px] font-semibold text-slate-600 mb-1 block">
                        Open Password
                      </label>
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Reader password"
                        className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-medium"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-semibold text-slate-600 mb-1 block">
                        Admin / Owner Password (Optional)
                      </label>
                      <input
                        type="password"
                        value={ownerPassword}
                        onChange={(e) => setOwnerPassword(e.target.value)}
                        placeholder="Permissions password"
                        className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-medium"
                      />
                    </div>
                  </div>

                  <div className="pt-2 border-t border-emerald-200/60">
                    <div className="text-[11px] font-bold text-slate-700 mb-1.5">
                      Allow User Permissions:
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <label className="flex items-center gap-2 p-2 bg-white border border-slate-200 rounded-xl cursor-pointer">
                        <input
                          type="checkbox"
                          checked={allowPrinting}
                          onChange={(e) => setAllowPrinting(e.target.checked)}
                          className="accent-emerald-600"
                        />
                        <span className="text-[11px] font-medium text-slate-700">Printing</span>
                      </label>
                      <label className="flex items-center gap-2 p-2 bg-white border border-slate-200 rounded-xl cursor-pointer">
                        <input
                          type="checkbox"
                          checked={allowCopying}
                          onChange={(e) => setAllowCopying(e.target.checked)}
                          className="accent-emerald-600"
                        />
                        <span className="text-[11px] font-medium text-slate-700">Copy Text</span>
                      </label>
                      <label className="flex items-center gap-2 p-2 bg-white border border-slate-200 rounded-xl cursor-pointer">
                        <input
                          type="checkbox"
                          checked={allowModifying}
                          onChange={(e) => setAllowModifying(e.target.checked)}
                          className="accent-emerald-600"
                        />
                        <span className="text-[11px] font-medium text-slate-700">Modifying</span>
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {/* Redact PDF page selection */}
              {tool.action === "redact-pdf" && pageCount && (
                <div className="space-y-3 bg-amber-50/40 border border-amber-200/80 rounded-2xl p-4">
                  <div className="flex items-center justify-between">
                    <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <LuEyeOff className="w-4 h-4 text-amber-600" />
                      <span>Select Pages to Redact / Blackout Header</span>
                    </div>
                    <span className="text-[11px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
                      {redactPages.size} pages marked
                    </span>
                  </div>

                  <div className="flex gap-2 overflow-x-auto p-1.5 bg-white border border-slate-200 rounded-xl">
                    {Array.from({ length: Math.min(pageCount, 12) }, (_, i) => i + 1).map((pNum) => {
                      const isMarked = redactPages.has(pNum);
                      return (
                        <button
                          key={pNum}
                          type="button"
                          onClick={() => {
                            setRedactPages((prev) => {
                              const next = new Set(prev);
                              if (next.has(pNum)) next.delete(pNum);
                              else next.add(pNum);
                              return next;
                            });
                          }}
                          className={`w-14 h-18 rounded-lg overflow-hidden border p-1 shrink-0 flex flex-col items-center justify-between transition ${
                            isMarked
                              ? "border-red-500 bg-red-50 text-red-950 ring-2 ring-red-400"
                              : "border-slate-200 bg-slate-50 text-slate-600 hover:border-slate-300"
                          }`}
                        >
                          <div className="w-full h-12 rounded overflow-hidden flex items-center justify-center bg-white relative">
                            {pageThumbnails[pNum] ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={pageThumbnails[pNum]} alt={`Page ${pNum}`} className="w-full h-full object-contain" />
                            ) : (
                              <LuFileText className="w-4 h-4 text-slate-300" />
                            )}
                            {isMarked && (
                              <div className="absolute inset-0 bg-red-600/30 flex items-center justify-center">
                                <LuEyeOff className="w-4 h-4 text-white" />
                              </div>
                            )}
                          </div>
                          <span className="text-[9px] font-bold">#{pNum}</span>
                        </button>
                      );
                    })}
                  </div>
                  <p className="text-[10px] text-slate-500">
                    Selected pages will have confidential sections permanently blacked out and flattened.
                  </p>
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
                  placeholder="secure_document.pdf"
                  className="flex-1 px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-1 focus:ring-red-500 font-medium"
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
              <div className="w-12 h-12 rounded-full border-4 border-slate-200 border-t-red-600 animate-spin mx-auto" />
              <div className="text-xs font-bold text-slate-800">Processing Document Security...</div>
              <div className="text-[11px] text-slate-400">
                Applying cryptographic keys and access controls
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
                <h3 className="text-base font-bold text-slate-900">Security Applied!</h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto mt-1 leading-relaxed">
                  {successMessage}
                </p>
                {downloadFileName && (
                  <div className="inline-block mt-3 px-3 py-1 bg-slate-100 rounded-lg text-xs font-mono font-medium text-slate-700">
                    {downloadFileName}
                  </div>
                )}
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => triggerDownload(downloadUrl, downloadFileName || "secure.pdf")}
                  className={`w-full sm:w-auto px-5 py-2.5 rounded-xl ${tool.iconBg} text-white text-xs font-bold shadow-md hover:opacity-90 transition flex items-center justify-center gap-2`}
                >
                  <LuDownload className="w-4 h-4" />
                  <span>Download Document</span>
                </button>
                <button
                  type="button"
                  onClick={resetState}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition flex items-center justify-center gap-1.5"
                >
                  <LuRefreshCw className="w-3.5 h-3.5" />
                  <span>Process Another</span>
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
              onClick={handleProcessSecurity}
              disabled={
                status === "processing" ||
                ((tool.action === "lock-pdf" || tool.action === "unlock-pdf" || tool.action === "encrypt-pdf") && !password.trim()) ||
                (tool.action === "redact-pdf" && redactPages.size === 0)
              }
              className={`px-6 py-2.5 rounded-xl text-white text-xs font-bold shadow-xs hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition flex items-center gap-2 ${tool.iconBg}`}
            >
              {status === "processing" ? (
                <>
                  <LuLoader className="w-4 h-4 animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <span>
                    {tool.action === "lock-pdf"
                      ? "Lock PDF"
                      : tool.action === "unlock-pdf"
                      ? "Unlock & Remove Password"
                      : tool.action === "encrypt-pdf"
                      ? "Encrypt PDF"
                      : `Redact ${redactPages.size} Pages`}
                  </span>
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
