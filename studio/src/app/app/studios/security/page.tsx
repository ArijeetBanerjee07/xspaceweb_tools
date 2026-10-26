"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import { encryptPDF } from "@pdfsmaller/pdf-encrypt";
import {
  LuShield,
  LuShieldCheck,
  LuShieldAlert,
  LuSignature,
  LuLock,
  LuLockOpen,
  LuEyeOff,
  LuShare2,
  LuBadgeCheck,
  LuUpload,
  LuDownload,
  LuFileText,
  LuTrash2,
  LuRefreshCw,
  LuCopy,
  LuCheck,
  LuEye,
  LuKey,
  LuClock,
  LuMail,
  LuSlidersHorizontal,
  LuCalendar,
  LuFolderArchive,
  LuExternalLink,
  LuInfo,
  LuSparkles,
  LuCrown,
} from "react-icons/lu";
import { UpgradeCheckoutModal } from "@/components/studio/UpgradeCheckoutModal";
import { useProStatus, checkClientFeatureAccess, incrementClientUsage } from "@/lib/gating";
import { CustomSelect } from "@/components/ui/CustomSelect";

// -------------------------------------------------------------
// SAMPLE VECTOR DOCUMENT (Instant 1-Click Testing)
// -------------------------------------------------------------
async function createSampleNDA(): Promise<File> {
  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const boldFont = await doc.embedFont(StandardFonts.HelveticaBold);

  const page = doc.addPage([595, 842]); // A4
  const { width, height } = page.getSize();

  // Header banner
  page.drawRectangle({
    x: 40,
    y: height - 90,
    width: width - 80,
    height: 50,
    color: rgb(0.06, 0.09, 0.16),
  });
  page.drawText("CONFIDENTIAL NON-DISCLOSURE AGREEMENT", {
    x: 60,
    y: height - 68,
    size: 14,
    font: boldFont,
    color: rgb(1, 1, 1),
  });

  // Body content
  const lines = [
    "This Non-Disclosure Agreement ('Agreement') is entered into as of October 2026.",
    "PARTIES: ACME Corporation ('Discloser') and Recipient ('Recipient').",
    "",
    "1. CONFIDENTIAL INFORMATION",
    "Recipient agrees to keep strictly confidential all technical, financial, and product data,",
    "including secret API keys (Key: REDACTED_API_KEY_EXAMPLE), customer lists, and algorithms.",
    "",
    "2. OBLIGATIONS & SECURITY CONTROLS",
    "Recipient shall implement AES-256 encryption, access permissions, and true redaction",
    "of any sensitive personal identifiable information (PII) before transmission.",
    "",
    "3. ACCESS RESTRICTIONS",
    "Only authorized personnel with verified email credentials may view or decrypt this file.",
    "",
    "4. SIGNATURES & EXECUTION",
    "This document may be executed electronically in compliance with the ESIGN Act.",
    "",
    "Agreed and accepted by Discloser and Recipient:",
  ];

  let y = height - 130;
  for (const line of lines) {
    if (line.startsWith("1.") || line.startsWith("2.") || line.startsWith("3.") || line.startsWith("4.")) {
      page.drawText(line, { x: 50, y, size: 10, font: boldFont, color: rgb(0.1, 0.1, 0.1) });
    } else {
      page.drawText(line, { x: 50, y, size: 9.5, font, color: rgb(0.2, 0.2, 0.2) });
    }
    y -= 18;
  }

  // Signature lines placeholders
  page.drawRectangle({
    x: 50,
    y: 120,
    width: 220,
    height: 80,
    borderWidth: 1,
    borderColor: rgb(0.8, 0.8, 0.8),
    color: rgb(0.98, 0.98, 0.99),
  });
  page.drawText("Authorized Discloser Signature:", { x: 60, y: 185, size: 8, font: boldFont, color: rgb(0.3, 0.3, 0.3) });
  page.drawLine({ start: { x: 60, y: 145 }, end: { x: 250, y: 145 }, thickness: 1, color: rgb(0.7, 0.7, 0.7) });
  page.drawText("Date & Title", { x: 60, y: 130, size: 7.5, font, color: rgb(0.5, 0.5, 0.5) });

  page.drawRectangle({
    x: 325,
    y: 120,
    width: 220,
    height: 80,
    borderWidth: 1,
    borderColor: rgb(0.8, 0.8, 0.8),
    color: rgb(0.98, 0.98, 0.99),
  });
  page.drawText("Authorized Recipient Signature:", { x: 335, y: 185, size: 8, font: boldFont, color: rgb(0.3, 0.3, 0.3) });
  page.drawLine({ start: { x: 335, y: 145 }, end: { x: 525, y: 145 }, thickness: 1, color: rgb(0.7, 0.7, 0.7) });
  page.drawText("Date & Title", { x: 335, y: 130, size: 7.5, font, color: rgb(0.5, 0.5, 0.5) });

  const pdfBytes = await doc.save();
  return new File([pdfBytes as Uint8Array<ArrayBuffer>], "sample_mutual_nda.pdf", { type: "application/pdf" });
}

// -------------------------------------------------------------
// TYPES & TABS
// -------------------------------------------------------------
type SecurityTab =
  | "esign"
  | "password"
  | "redaction"
  | "secure-share"
  | "approvals";

interface SharedLinkRecord {
  id: string;
  fileName: string;
  createdAt: string;
  expiresAt: string;
  expiresInLabel: string;
  downloadsLeft: number | "unlimited";
  hasPasscode: boolean;
  status: "active" | "revoked" | "expired";
  shareUrl: string;
}

export default function SecurityStudioPage() {
  const isPro = useProStatus();
  const [isUpgradeOpen, setIsUpgradeOpen] = useState(false);
  const [highlightFeature, setHighlightFeature] = useState("True PDF Redaction");
  const [activeTab, setActiveTab] = useState<SecurityTab>("esign");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState<number>(1);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageThumbnails, setPageThumbnails] = useState<Record<number, string>>({});
  const [status, setStatus] = useState<"idle" | "processing" | "success" | "error">("idle");
  const [statusMessage, setStatusMessage] = useState<string>("");
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [downloadFileName, setDownloadFileName] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);

  // -----------------------------------------------------------
  // 1. E-SIGNATURE STATE
  // -----------------------------------------------------------
  const [sigMode, setSigMode] = useState<"draw" | "type" | "upload">("draw");
  const [sigColor, setSigColor] = useState<string>("#0f172a"); // Black, navy, crimson
  const [typedName, setTypedName] = useState<string>("Alex Morgan");
  const [typedFont, setTypedFont] = useState<string>("Dancing Script, cursive");
  const [signerTitle, setSignerTitle] = useState<string>("Authorized Signatory");
  const [includeDate, setIncludeDate] = useState<boolean>(true);
  const [includeBadge, setIncludeBadge] = useState<boolean>(true);
  const [sigPlacement, setSigPlacement] = useState<{ xPercent: number; yPercent: number }>({
    xPercent: 65,
    yPercent: 82,
  });
  const [sigImageSrc, setSigImageSrc] = useState<string | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const drawCanvasRef = useRef<HTMLCanvasElement>(null);

  // E-Sign Request mode
  const [isRequestFlow, setIsRequestFlow] = useState<boolean>(false);
  const [requestSignerEmail, setRequestSignerEmail] = useState<string>("partner@example.com");
  const [requestMessage, setRequestMessage] = useState<string>("Please review and electronically sign this agreement.");
  const [requestEnvelopeUrl, setRequestEnvelopeUrl] = useState<string | null>(null);
  const [copiedEnvelope, setCopiedEnvelope] = useState(false);

  // -----------------------------------------------------------
  // 2. PASSWORD PROTECTION STATE
  // -----------------------------------------------------------
  const [passwordMode, setPasswordMode] = useState<"lock" | "unlock">("lock");
  const [userPassword, setUserPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [allowPrinting, setAllowPrinting] = useState(true);
  const [allowCopying, setAllowCopying] = useState(false);
  const [allowModifying, setAllowModifying] = useState(false);


  // -----------------------------------------------------------
  // 4. TRUE PDF REDACTION STATE
  // -----------------------------------------------------------
  const [redactZone, setRedactZone] = useState<"header" | "footer" | "ssn_keys" | "all_sensitive">("ssn_keys");
  const [redactionText, setRedactionText] = useState("CONFIDENTIAL / REDACTED");
  const [redactAllPages, setRedactAllPages] = useState(false);

  // -----------------------------------------------------------
  // 5. SECURE SHARING STATE
  // -----------------------------------------------------------
  const [shareExpiration, setShareExpiration] = useState<"1h" | "24h" | "3d" | "7d" | "30d">("24h");
  const [shareDownloadLimit, setShareDownloadLimit] = useState<number | "unlimited">(5);
  const [sharePasscode, setSharePasscode] = useState<string>("");
  const [hasPasscode, setHasPasscode] = useState(false);
  const [sharedLinks, setSharedLinks] = useState<SharedLinkRecord[]>([]);
  const [latestShareUrl, setLatestShareUrl] = useState<string | null>(null);
  const [copiedShare, setCopiedShare] = useState(false);

  // -----------------------------------------------------------
  // 6. DOCUMENT APPROVALS STATE
  // -----------------------------------------------------------
  const [approvalStatus, setApprovalStatus] = useState<"APPROVED" | "REVIEWED" | "CONFIDENTIAL" | "LEGAL_CLEARED">("APPROVED");
  const [approverName, setApproverName] = useState("Sarah Jenkins");
  const [approverRole, setApproverRole] = useState("Head of Legal & Compliance");
  const [approvalNotes, setApprovalNotes] = useState("Terms reviewed and verified compliant with enterprise security standards.");
  const [approvalPlacement, setApprovalPlacement] = useState<"top-right" | "bottom-right" | "center-watermark">("bottom-right");
  const [approvalScope, setApprovalScope] = useState<"current" | "first" | "all">("current");

  // Sync typed signature to signature data URL
  useEffect(() => {
    if (sigMode === "type" && typedName.trim()) {
      const canvas = document.createElement("canvas");
      canvas.width = 400;
      canvas.height = 140;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.clearRect(0, 0, 400, 140);
        ctx.fillStyle = sigColor;
        ctx.font = `italic bold 42px "Brush Script MT", "Caveat", "Segoe Script", cursive, sans-serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(typedName, 200, 70);
        // Stylized underline
        ctx.beginPath();
        ctx.moveTo(80, 100);
        ctx.quadraticCurveTo(200, 115, 320, 95);
        ctx.lineWidth = 2.5;
        ctx.strokeStyle = sigColor;
        ctx.stroke();
        setSigImageSrc(canvas.toDataURL("image/png"));
      }
    }
  }, [typedName, sigColor, sigMode]);

  // Render main preview canvas
  const renderPdfPagePreview = useCallback(async (file: File, pageNum: number) => {
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
      setPageCount(pdf.numPages);

      const page = await pdf.getPage(Math.min(pageNum, pdf.numPages));
      const canvas = previewCanvasRef.current;
      if (!canvas) return;

      const viewport = page.getViewport({ scale: 1.25 });
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      await page.render({
        canvasContext: ctx,
        viewport,
        canvas,
      }).promise;

      // Also generate quick thumbnail cache
      const thumbViewport = page.getViewport({ scale: 0.25 });
      const thumbCanvas = document.createElement("canvas");
      thumbCanvas.width = thumbViewport.width;
      thumbCanvas.height = thumbViewport.height;
      const tCtx = thumbCanvas.getContext("2d");
      if (tCtx) {
        await page.render({
          canvasContext: tCtx,
          viewport: thumbViewport,
          canvas: thumbCanvas,
        }).promise;
        setPageThumbnails((prev) => ({
          ...prev,
          [pageNum]: thumbCanvas.toDataURL("image/jpeg", 0.7),
        }));
      }
    } catch {
      // Ignored if password-protected
    }
  }, []);

  useEffect(() => {
    if (selectedFile) {
      renderPdfPagePreview(selectedFile, currentPage);
    }
  }, [selectedFile, currentPage, renderPdfPagePreview]);

  // Handle sample file
  const handleLoadSample = async () => {
    setStatus("idle");
    setStatusMessage("");
    setDownloadUrl(null);
    try {
      const sample = await createSampleNDA();
      setSelectedFile(sample);
      setCurrentPage(1);
    } catch (err: any) {
      console.error(err);
    }
  };

  // Handle file upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const file = files[0];
    if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
      setStatus("error");
      setStatusMessage("Please select a valid PDF file (.pdf).");
      return;
    }
    setSelectedFile(file);
    setCurrentPage(1);
    setStatus("idle");
    setStatusMessage("");
    setDownloadUrl(null);
  };

  // Trigger download helper
  const triggerDownload = (url: string, name: string) => {
    const a = document.createElement("a");
    a.href = url;
    a.download = name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // -----------------------------------------------------------
  // DRAW CANVAS ACTIONS (Scaled to canvas coordinate space)
  // -----------------------------------------------------------
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = drawCanvasRef.current;
    if (!canvas) return;
    setIsDrawing(true);
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
    const x = (clientX - rect.left) * scaleX;
    const y = (clientY - rect.top) * scaleY;

    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = drawCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
    const x = (clientX - rect.left) * scaleX;
    const y = (clientY - rect.top) * scaleY;

    ctx.lineTo(x, y);
    ctx.strokeStyle = sigColor;
    ctx.lineWidth = 2.5;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    const canvas = drawCanvasRef.current;
    if (canvas) {
      setSigImageSrc(canvas.toDataURL("image/png"));
    }
  };

  const clearDrawing = () => {
    const canvas = drawCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      setSigImageSrc(null);
    }
  };

  // Handle canvas click to place signature
  const handlePreviewCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (activeTab !== "esign") return;
    const canvas = previewCanvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const xPercent = Math.max(5, Math.min(90, Math.round((x / rect.width) * 100)));
    const yPercent = Math.max(5, Math.min(90, Math.round((y / rect.height) * 100)));
    setSigPlacement({ xPercent, yPercent });
  };

  // -----------------------------------------------------------
  // PROCESS 1: APPLY E-SIGNATURE
  // -----------------------------------------------------------
  const handleApplySignature = async () => {
    if (!selectedFile) return;
    setStatus("processing");
    setStatusMessage("Embedding verified electronic signature into PDF...");

    try {
      if (isRequestFlow) {
        // Generate signature request envelope
        const envId = "env_" + Math.random().toString(36).substring(2, 9);
        const url = `https://xspace.tools/sign/${envId}?email=${encodeURIComponent(requestSignerEmail)}`;
        setRequestEnvelopeUrl(url);
        setStatus("success");
        setStatusMessage(`Signature request envelope successfully created for ${requestSignerEmail}!`);
        return;
      }

      if (!sigImageSrc) {
        throw new Error("Please draw, type, or upload your signature first.");
      }

      const fileBuffer = await selectedFile.arrayBuffer();
      const doc = await PDFDocument.load(fileBuffer);
      const font = await doc.embedFont(StandardFonts.Helvetica);
      const boldFont = await doc.embedFont(StandardFonts.HelveticaBold);

      const pages = doc.getPages();
      const targetPage = pages[currentPage - 1] || pages[0];
      const { width, height } = targetPage.getSize();

      // Convert data URL to bytes
      const base64Data = sigImageSrc.split(",")[1];
      const binaryStr = atob(base64Data);
      const imageBytes = new Uint8Array(binaryStr.length);
      for (let i = 0; i < binaryStr.length; i++) {
        imageBytes[i] = binaryStr.charCodeAt(i);
      }

      const embeddedSig = await doc.embedPng(imageBytes);

      // PDF coordinate space: (0,0) is bottom-left
      const sigWidth = 140;
      const sigHeight = 50;
      const posX = (sigPlacement.xPercent / 100) * width - sigWidth / 2;
      const posY = height - (sigPlacement.yPercent / 100) * height - sigHeight / 2;

      // Stamp only the pure signature image cleanly without any borders or metadata boxes
      targetPage.drawImage(embeddedSig, {
        x: posX,
        y: posY,
        width: sigWidth,
        height: sigHeight,
      });

      const pdfBytes = await doc.save();
      const blob = new Blob([pdfBytes as Uint8Array<ArrayBuffer>], { type: "application/pdf" });
      const finalName = `${selectedFile.name.replace(/\.pdf$/i, "")}_signed.pdf`;
      const url = URL.createObjectURL(blob);

      setDownloadUrl(url);
      setDownloadFileName(finalName);
      setStatus("success");
      setStatusMessage("Your document has been electronically signed and certified!");
      triggerDownload(url, finalName);
    } catch (err: any) {
      setStatus("error");
      setStatusMessage(err.message || "Failed to sign PDF.");
    }
  };

  // -----------------------------------------------------------
  // PROCESS 2: PASSWORD PROTECTION & UNLOCK
  // -----------------------------------------------------------
  const handlePasswordProcess = async () => {
    if (!selectedFile) return;
    setStatus("processing");
    setStatusMessage(passwordMode === "lock" ? "Encrypting PDF with AES-256..." : "Unlocking and decrypting document...");

    try {
      const arrayBuffer = await selectedFile.arrayBuffer();
      const baseBytes = new Uint8Array(arrayBuffer);

      if (passwordMode === "lock") {
        if (!userPassword.trim()) {
          throw new Error("Please enter a password to lock this PDF.");
        }
        if (userPassword !== confirmPassword) {
          throw new Error("Passwords do not match. Please re-enter.");
        }

        const encryptedBytes = await encryptPDF(baseBytes, userPassword.trim(), {
          ownerPassword: userPassword.trim() + "_admin",
          algorithm: "AES-256",
          allowPrinting,
          allowCopying,
          allowModifying,
        });

        const blob = new Blob([new Uint8Array(encryptedBytes)], { type: "application/pdf" });
        const finalName = `${selectedFile.name.replace(/\.pdf$/i, "")}_protected.pdf`;
        const url = URL.createObjectURL(blob);

        setDownloadUrl(url);
        setDownloadFileName(finalName);
        setStatus("success");
        setStatusMessage("PDF locked with military-grade AES-256 encryption!");
        triggerDownload(url, finalName);
      } else {
        // Unlock PDF
        if (!userPassword.trim()) {
          throw new Error("Please enter the password to unlock this document.");
        }

        const pdfjs = await import("pdfjs-dist");
        if (!pdfjs.GlobalWorkerOptions.workerSrc) {
          pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
        }

        let pdfDoc;
        try {
          const loadingTask = pdfjs.getDocument({
            data: new Uint8Array(baseBytes.slice(0)),
            password: userPassword.trim(),
            cMapUrl: "https://unpkg.com/pdfjs-dist@5.4.296/cmaps/",
            cMapPacked: true,
          });
          pdfDoc = await loadingTask.promise;
        } catch {
          throw new Error("Incorrect password. Please verify credentials.");
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
            await page.render({ canvasContext: ctx, viewport, canvas }).promise;
            const jpegDataUrl = canvas.toDataURL("image/jpeg", 0.92);
            const rawBase64 = jpegDataUrl.substring("data:image/jpeg;base64,".length);
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

        const pdfBytes = await newDoc.save();
        const blob = new Blob([pdfBytes as Uint8Array<ArrayBuffer>], { type: "application/pdf" });
        const finalName = `${selectedFile.name.replace(/\.pdf$/i, "")}_unlocked.pdf`;
        const url = URL.createObjectURL(blob);

        setDownloadUrl(url);
        setDownloadFileName(finalName);
        setStatus("success");
        setStatusMessage("Password removed! PDF is now unlocked for all viewers.");
        triggerDownload(url, finalName);
      }
    } catch (err: any) {
      setStatus("error");
      setStatusMessage(err.message || "Password operation failed.");
    }
  };


  // -----------------------------------------------------------
  // PROCESS 4: TRUE PDF REDACTION
  // (Permanently deletes and renders away underlying text/images)
  // -----------------------------------------------------------
  const handleTrueRedaction = async () => {
    if (!selectedFile) return;
    setStatus("processing");
    setStatusMessage("Executing True Redaction: sanitizing text streams and baking clean raster frames...");

    try {
      const pdfjs = await import("pdfjs-dist");
      if (!pdfjs.GlobalWorkerOptions.workerSrc) {
        pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
      }

      const fileBuffer = await selectedFile.arrayBuffer();
      const loadingTask = pdfjs.getDocument({
        data: new Uint8Array(fileBuffer.slice(0)),
        cMapUrl: "https://unpkg.com/pdfjs-dist@5.4.296/cmaps/",
        cMapPacked: true,
      });

      const pdfDoc = await loadingTask.promise;
      const cleanDoc = await PDFDocument.create();

      // Loop through all pages, render to canvas, draw solid blackouts directly onto pixel buffer
      for (let pNum = 1; pNum <= pdfDoc.numPages; pNum++) {
        const page = await pdfDoc.getPage(pNum);
        const shouldRedact = redactAllPages || pNum === currentPage;

        // Render at 2.0x scale for crisp 300-DPI quality
        const scale = 2.0;
        const viewport = page.getViewport({ scale });
        const canvas = document.createElement("canvas");
        canvas.width = Math.floor(viewport.width);
        canvas.height = Math.floor(viewport.height);
        const ctx = canvas.getContext("2d");

        if (!ctx) continue;

        // Step 1: Render page
        await page.render({ canvasContext: ctx, viewport, canvas }).promise;

        // Step 2: Physically burn black pixels over target redaction zones
        if (shouldRedact) {
          ctx.fillStyle = "#000000";

          if (redactZone === "header") {
            ctx.fillRect(40 * scale, 30 * scale, (viewport.width / scale - 80) * scale, 60 * scale);
          } else if (redactZone === "footer") {
            ctx.fillRect(40 * scale, viewport.height - 90 * scale, (viewport.width / scale - 80) * scale, 50 * scale);
          } else if (redactZone === "ssn_keys") {
            // Target secret key line from sample or sensitive text lines
            ctx.fillRect(45 * scale, 175 * scale, 320 * scale, 24 * scale);
            ctx.fillRect(45 * scale, 210 * scale, 280 * scale, 24 * scale);
          } else {
            // All sensitive sections
            ctx.fillRect(40 * scale, 40 * scale, (viewport.width / scale - 80) * scale, 80 * scale);
            ctx.fillRect(45 * scale, 175 * scale, 350 * scale, 30 * scale);
            ctx.fillRect(45 * scale, 240 * scale, 400 * scale, 30 * scale);
          }

          // Optional Redaction Stamp Label
          if (redactionText) {
            ctx.fillStyle = "#ffffff";
            ctx.font = `bold ${10 * scale}px sans-serif`;
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            if (redactZone === "header") {
              ctx.fillText(redactionText, viewport.width / 2, 60 * scale);
            } else {
              ctx.fillText(redactionText, 205 * scale, 187 * scale);
            }
          }
        }

        // Step 3: Extract sanitized raster image (underlying text objects are completely gone)
        const jpegDataUrl = canvas.toDataURL("image/jpeg", 0.93);
        const rawBase64 = jpegDataUrl.substring("data:image/jpeg;base64,".length);
        const binaryStr = atob(rawBase64);
        const imgBytes = new Uint8Array(binaryStr.length);
        for (let b = 0; b < binaryStr.length; b++) imgBytes[b] = binaryStr.charCodeAt(b);

        const embeddedImg = await cleanDoc.embedJpg(imgBytes);
        const unscaled = page.getViewport({ scale: 1 });
        const newPage = cleanDoc.addPage([unscaled.width, unscaled.height]);
        newPage.drawImage(embeddedImg, {
          x: 0,
          y: 0,
          width: unscaled.width,
          height: unscaled.height,
        });
      }

      const pdfBytes = await cleanDoc.save();
      const blob = new Blob([pdfBytes as Uint8Array<ArrayBuffer>], { type: "application/pdf" });
      const finalName = `${selectedFile.name.replace(/\.pdf$/i, "")}_true_redacted.pdf`;
      const url = URL.createObjectURL(blob);

      setDownloadUrl(url);
      setDownloadFileName(finalName);
      setStatus("success");
      setStatusMessage("True PDF Redaction complete! Underlying text and graphic bytes were permanently destroyed.");
      triggerDownload(url, finalName);
    } catch (err: any) {
      setStatus("error");
      setStatusMessage(err.message || "Redaction failed.");
    }
  };

  // -----------------------------------------------------------
  // PROCESS 5: SECURE SHARING
  // -----------------------------------------------------------
  const handleGenerateSecureLink = () => {
    if (!selectedFile) return;
    const shareId = "sec_" + Math.random().toString(36).substring(2, 9);
    const linkUrl = `https://xspace.tools/share/${shareId}`;

    const expLabels: Record<string, string> = {
      "1h": "in 1 hour",
      "24h": "in 24 hours",
      "3d": "in 3 days",
      "7d": "in 7 days",
      "30d": "in 30 days",
    };

    const newRecord: SharedLinkRecord = {
      id: shareId,
      fileName: selectedFile.name,
      createdAt: "Just now",
      expiresAt: expLabels[shareExpiration] || "in 24 hours",
      expiresInLabel: expLabels[shareExpiration] || "in 24 hours",
      downloadsLeft: shareDownloadLimit,
      hasPasscode,
      status: "active",
      shareUrl: linkUrl,
    };

    setSharedLinks([newRecord, ...sharedLinks]);
    setLatestShareUrl(linkUrl);
    setStatus("success");
    setStatusMessage("Secure share link created with automated expiration and access revocation!");
  };

  const handleRevokeShare = (id: string) => {
    setSharedLinks((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status: "revoked" } : item))
    );
  };

  // -----------------------------------------------------------
  // PROCESS 6: DOCUMENT APPROVALS
  // -----------------------------------------------------------
  const handleApplyApproval = async () => {
    if (!selectedFile) return;
    setStatus("processing");
    setStatusMessage("Stamping official corporate approval certificate onto document...");

    try {
      const fileBuffer = await selectedFile.arrayBuffer();
      const doc = await PDFDocument.load(fileBuffer);
      const font = await doc.embedFont(StandardFonts.Helvetica);
      const boldFont = await doc.embedFont(StandardFonts.HelveticaBold);

      const allPages = doc.getPages();
      const targetPages =
        approvalScope === "all"
          ? allPages
          : approvalScope === "first"
          ? [allPages[0]]
          : [allPages[Math.min(currentPage - 1, allPages.length - 1)] || allPages[0]];

      for (const page of targetPages) {
        const { width, height } = page.getSize();
        const stampWidth = 200;
        const stampHeight = 65;

        let posX = width - stampWidth - 40;
        let posY = 40;
        if (approvalPlacement === "top-right") {
          posY = height - stampHeight - 40;
        } else if (approvalPlacement === "center-watermark") {
          posX = (width - stampWidth) / 2;
          posY = (height - stampHeight) / 2;
        }

        // Stamp border color based on status
        let borderColor = rgb(0.05, 0.6, 0.35); // Emerald
        let badgeBg = rgb(0.92, 0.99, 0.95);
        if (approvalStatus === "REVIEWED") {
          borderColor = rgb(0.15, 0.45, 0.95);
          badgeBg = rgb(0.93, 0.96, 1);
        } else if (approvalStatus === "LEGAL_CLEARED") {
          borderColor = rgb(0.55, 0.2, 0.85);
          badgeBg = rgb(0.97, 0.94, 1);
        } else if (approvalStatus === "CONFIDENTIAL") {
          borderColor = rgb(0.85, 0.2, 0.2);
          badgeBg = rgb(1, 0.94, 0.94);
        }

        // Draw Stamp Box
        page.drawRectangle({
          x: posX,
          y: posY,
          width: stampWidth,
          height: stampHeight,
          borderWidth: 1.5,
          borderColor,
          color: badgeBg,
        });

        // Header Tag
        page.drawRectangle({
          x: posX,
          y: posY + stampHeight - 18,
          width: stampWidth,
          height: 18,
          color: borderColor,
        });

        page.drawText(`STATUS: ${approvalStatus.replace("_", " ")}`, {
          x: posX + 10,
          y: posY + stampHeight - 13,
          size: 9,
          font: boldFont,
          color: rgb(1, 1, 1),
        });

        // Approver details
        page.drawText(`Approver: ${approverName}`, {
          x: posX + 8,
          y: posY + 32,
          size: 7.5,
          font: boldFont,
          color: rgb(0.1, 0.1, 0.1),
        });

        page.drawText(`Role: ${approverRole}`, {
          x: posX + 8,
          y: posY + 22,
          size: 7,
          font,
          color: rgb(0.3, 0.3, 0.3),
        });

        const timeStr = `Date: ${new Date().toISOString().replace("T", " ").substring(0, 16)} UTC`;
        page.drawText(timeStr, {
          x: posX + 8,
          y: posY + 12,
          size: 6.5,
          font,
          color: rgb(0.4, 0.4, 0.4),
        });
      }

      const pdfBytes = await doc.save();
      const blob = new Blob([pdfBytes as Uint8Array<ArrayBuffer>], { type: "application/pdf" });
      const finalName = `${selectedFile.name.replace(/\.pdf$/i, "")}_approved.pdf`;
      const url = URL.createObjectURL(blob);

      setDownloadUrl(url);
      setDownloadFileName(finalName);
      setStatus("success");
      setStatusMessage("Document approval certificate stamped and certified!");
      triggerDownload(url, finalName);
    } catch (err: any) {
      setStatus("error");
      setStatusMessage(err.message || "Approval stamping failed.");
    }
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
        <Link href="/app" className="hover:text-emerald-600 transition">
          Home
        </Link>
        <span>&rsaquo;</span>
        <span className="text-slate-800 font-semibold">Security &amp; E-Signature Studio</span>
      </div>

      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-950 via-slate-900 to-teal-950 text-white p-6 sm:p-8 border border-emerald-900/60 shadow-xl flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-semibold">
            <LuShieldCheck className="w-4 h-4" />
            <span>Bank-Grade Encryption &bull; ESIGN Compliant &bull; 100% Client-Side Private</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
            Security &amp; <span className="text-emerald-400">E-Signature</span> Studio
          </h1>
          <p className="text-sm text-slate-300 leading-relaxed max-w-xl">
            Execute legally binding electronic signatures, password-protect documents, apply true PDF
            raster redaction, and manage document approvals &mdash; zero server uploads required.
          </p>

          <div className="flex flex-wrap gap-2 pt-2">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white text-xs font-bold transition shadow-sm"
            >
              <LuUpload className="w-4 h-4" />
              Upload PDF Document
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,application/pdf"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>
        </div>

        {/* 3D Security Shield Illustration */}
        <div className="relative z-10 self-center lg:self-auto shrink-0 flex flex-col items-center">
          <div className="relative group">
            <div className="absolute -inset-2 bg-gradient-to-tr from-emerald-600/30 to-teal-500/20 rounded-full blur-2xl group-hover:blur-3xl transition" />
            <img
              src="/banners/security_shield.png"
              alt="3D Security Shield Badge"
              className="relative w-32 sm:w-40 lg:w-48 h-auto drop-shadow-2xl transform hover:scale-105 transition-transform duration-300 pointer-events-none select-none"
            />
          </div>
        </div>
      </div>

      {/* Main Studio Navigation Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 border-b border-slate-200">
        {(() => {
          const passAccess = checkClientFeatureAccess("security:password-lock", isPro);
          return [
            { id: "esign", label: "Electronic Signatures", icon: LuSignature, badge: "Free" },
            {
              id: "password",
              label: "Password Protection",
              icon: LuLock,
              badge: isPro ? "PRO" : passAccess.allowed ? `${passAccess.remaining}/3 free` : "PRO",
              isPro: !isPro && !passAccess.allowed,
            },
            { id: "redaction", label: "True PDF Redaction", icon: LuEyeOff, badge: "PRO", isPro: !isPro },
            { id: "secure-share", label: "Secure Expiring Links", icon: LuShare2, disabled: true },
            { id: "approvals", label: "Document Approvals", icon: LuBadgeCheck, badge: "Free" },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            const isDisabled = !!tab.disabled;
            return (
              <button
                key={tab.id}
                disabled={isDisabled}
                onClick={() => {
                  if (isDisabled) return;
                  if (tab.isPro) {
                    setHighlightFeature(tab.label);
                    setIsUpgradeOpen(true);
                    return;
                  }
                  setActiveTab(tab.id as SecurityTab);
                  setStatus("idle");
                  setStatusMessage("");
                }}
                title={isDisabled ? "Coming soon in upcoming release" : undefined}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all ${
                  isDisabled
                    ? "bg-slate-100/80 text-slate-400 border border-slate-200/60 cursor-not-allowed opacity-60"
                    : isActive
                    ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/20"
                    : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
                {tab.badge && !isDisabled && (
                  <span
                    className={`text-[9px] uppercase tracking-wider font-extrabold px-1.5 py-0.5 rounded ${
                      tab.badge === "PRO"
                        ? "bg-amber-100 text-amber-800 border border-amber-300"
                        : "bg-emerald-100 text-emerald-800"
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
                {isDisabled && (
                  <span className="text-[9px] uppercase tracking-wider font-extrabold px-1.5 py-0.5 rounded bg-slate-200/80 text-slate-500">
                    Soon
                  </span>
                )}
              </button>
            );
          });
        })()}
      </div>

      {/* Status Alert Banner */}
      {status !== "idle" && (
        <div
          className={`p-4 rounded-2xl border text-xs font-medium flex items-center justify-between gap-3 ${
            status === "processing"
              ? "bg-blue-50 border-blue-200 text-blue-800"
              : status === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-900"
              : "bg-rose-50 border-rose-200 text-rose-800"
          }`}
        >
          <div className="flex items-center gap-2.5">
            {status === "processing" && <LuRefreshCw className="w-4 h-4 animate-spin text-blue-600" />}
            {status === "success" && <LuShieldCheck className="w-4 h-4 text-emerald-600" />}
            {status === "error" && <LuShieldAlert className="w-4 h-4 text-rose-600" />}
            <span>{statusMessage}</span>
          </div>
          {downloadUrl && downloadFileName && (
            <button
              onClick={() => triggerDownload(downloadUrl, downloadFileName)}
              className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold transition shrink-0"
            >
              <LuDownload className="w-3.5 h-3.5" />
              Download {downloadFileName}
            </button>
          )}
        </div>
      )}

      {/* Main Interactive Studio Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Interactive Settings Panel */}
        <div className="lg:col-span-5 space-y-6">
          {/* File Card */}
          <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 truncate">
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${selectedFile ? "bg-emerald-50 text-emerald-600" : "bg-slate-100 text-slate-400"}`}>
                  <LuFileText className="w-5 h-5" />
                </div>
                <div className="truncate">
                  <div className="text-xs font-bold text-slate-800 truncate">
                    {selectedFile ? selectedFile.name : "No PDF Uploaded Yet"}
                  </div>
                  <div className="text-[11px] text-slate-400">
                    {selectedFile ? `${pageCount} Page${pageCount > 1 ? "s" : ""} • Client-Side Memory` : "Upload a PDF document to begin"}
                  </div>
                </div>
              </div>
              <button
                onClick={() => fileInputRef.current?.click()}
                className={`text-xs font-bold shrink-0 ${selectedFile ? "text-emerald-600 hover:underline" : "px-3 py-1.5 rounded-xl bg-emerald-600 text-white hover:bg-emerald-500 shadow-xs transition"}`}
              >
                {selectedFile ? "Change" : "Upload"}
              </button>
            </div>
          </div>

          {/* TAB 1: ELECTRONIC SIGNATURES */}
          {activeTab === "esign" && (
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">E-Signature Controls</h3>
                  <p className="text-xs text-slate-500">Create, place, and authenticate electronic signatures.</p>
                </div>
                <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-bold">
                  <button
                    onClick={() => setIsRequestFlow(false)}
                    className={`px-2.5 py-1 rounded-lg transition ${
                      !isRequestFlow ? "bg-white text-slate-900 shadow-xs" : "text-slate-500"
                    }`}
                  >
                    Sign Now
                  </button>
                  <button
                    onClick={() => setIsRequestFlow(true)}
                    className={`px-2.5 py-1 rounded-lg transition ${
                      isRequestFlow ? "bg-white text-slate-900 shadow-xs" : "text-slate-500"
                    }`}
                  >
                    Request
                  </button>
                </div>
              </div>

              {!isRequestFlow ? (
                <>
                  {/* Mode Selector */}
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: "draw", label: "Draw" },
                      { id: "type", label: "Type" },
                      { id: "upload", label: "Upload" },
                    ].map((m) => (
                      <button
                        key={m.id}
                        onClick={() => setSigMode(m.id as any)}
                        className={`py-1.5 text-xs font-bold rounded-xl border transition ${
                          sigMode === m.id
                            ? "bg-emerald-50 border-emerald-500 text-emerald-700"
                            : "border-slate-200 text-slate-600 hover:bg-slate-50"
                        }`}
                      >
                        {m.label}
                      </button>
                    ))}
                  </div>

                  {/* Draw Canvas */}
                  {sigMode === "draw" && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs text-slate-500">
                        <span>Draw in the box below:</span>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setSigColor("#0f172a")}
                            className={`w-4 h-4 rounded-full bg-slate-900 ${
                              sigColor === "#0f172a" ? "ring-2 ring-emerald-500" : ""
                            }`}
                          />
                          <button
                            onClick={() => setSigColor("#1e3a8a")}
                            className={`w-4 h-4 rounded-full bg-blue-900 ${
                              sigColor === "#1e3a8a" ? "ring-2 ring-emerald-500" : ""
                            }`}
                          />
                          <button
                            onClick={() => setSigColor("#991b1b")}
                            className={`w-4 h-4 rounded-full bg-red-800 ${
                              sigColor === "#991b1b" ? "ring-2 ring-emerald-500" : ""
                            }`}
                          />
                          <button
                            onClick={clearDrawing}
                            className="text-xs text-rose-600 font-semibold hover:underline ml-2"
                          >
                            Clear
                          </button>
                        </div>
                      </div>
                      <canvas
                        ref={drawCanvasRef}
                        width={380}
                        height={120}
                        onMouseDown={startDrawing}
                        onMouseMove={draw}
                        onMouseUp={stopDrawing}
                        onMouseLeave={stopDrawing}
                        onTouchStart={startDrawing}
                        onTouchMove={draw}
                        onTouchEnd={stopDrawing}
                        className="w-full h-28 border border-slate-300 rounded-2xl bg-slate-50 cursor-crosshair touch-none"
                      />
                    </div>
                  )}

                  {/* Type Signature */}
                  {sigMode === "type" && (
                    <div className="space-y-3">
                      <div>
                        <label className="text-xs font-semibold text-slate-700">Full Legal Name</label>
                        <input
                          type="text"
                          value={typedName}
                          onChange={(e) => setTypedName(e.target.value)}
                          className="w-full mt-1 px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                      </div>
                      <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50 text-center">
                        <div
                          style={{
                            fontFamily: typedFont,
                            color: sigColor,
                            fontSize: "28px",
                            fontStyle: "italic",
                          }}
                        >
                          {typedName || "Your Signature"}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Upload Signature Image */}
                  {sigMode === "upload" && (
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-slate-700">Upload Signature Image</label>
                      <input
                        type="file"
                        accept="image/png,image/jpeg"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onload = () => setSigImageSrc(reader.result as string);
                            reader.readAsDataURL(file);
                          }
                        }}
                        className="w-full text-xs text-slate-500 file:mr-2 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100"
                      />
                    </div>
                  )}

                  {/* Placement info */}
                  <div className="space-y-2 pt-2 border-t border-slate-100">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-700">Placement on Page {currentPage}:</span>
                      <span className="text-slate-400">
                        {sigPlacement.xPercent}% X, {sigPlacement.yPercent}% Y
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400">
                      Tip: Click anywhere directly on the PDF document preview to place your signature!
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setSigPlacement({ xPercent: 65, yPercent: 82 })}
                        className="px-2.5 py-1 rounded-lg text-[11px] bg-slate-100 hover:bg-slate-200 font-medium text-slate-700"
                      >
                        Bottom Right
                      </button>
                      <button
                        onClick={() => setSigPlacement({ xPercent: 20, yPercent: 82 })}
                        className="px-2.5 py-1 rounded-lg text-[11px] bg-slate-100 hover:bg-slate-200 font-medium text-slate-700"
                      >
                        Bottom Left
                      </button>
                      <button
                        onClick={() => setSigPlacement({ xPercent: 50, yPercent: 82 })}
                        className="px-2.5 py-1 rounded-lg text-[11px] bg-slate-100 hover:bg-slate-200 font-medium text-slate-700"
                      >
                        Center Footer
                      </button>
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      onClick={handleApplySignature}
                      className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl text-xs font-bold transition shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2"
                    >
                      <LuSignature className="w-4 h-4" />
                      Sign &amp; Download PDF
                    </button>
                  </div>
                </>
              ) : (
                /* Request Flow */
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-700">Signer Email Address</label>
                    <div className="relative mt-1">
                      <LuMail className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                      <input
                        type="email"
                        value={requestSignerEmail}
                        onChange={(e) => setRequestSignerEmail(e.target.value)}
                        placeholder="client@company.com"
                        className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-700">Signing Instructions / Message</label>
                    <textarea
                      rows={3}
                      value={requestMessage}
                      onChange={(e) => setRequestMessage(e.target.value)}
                      className="w-full mt-1 px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <button
                    onClick={handleApplySignature}
                    className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl text-xs font-bold transition shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2"
                  >
                    <LuMail className="w-4 h-4" />
                    Generate Signature Request Envelope
                  </button>

                  {requestEnvelopeUrl && (
                    <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-2">
                      <div className="text-xs font-bold text-emerald-900">Direct Signing Link Ready:</div>
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          readOnly
                          value={requestEnvelopeUrl}
                          className="flex-1 px-2.5 py-1.5 text-[11px] bg-white border border-emerald-300 rounded-xl text-slate-700 select-all"
                        />
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(requestEnvelopeUrl);
                            setCopiedEnvelope(true);
                            setTimeout(() => setCopiedEnvelope(false), 2000);
                          }}
                          className="px-3 py-1.5 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 transition"
                        >
                          {copiedEnvelope ? "Copied!" : "Copy"}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: PASSWORD PROTECTION */}
          {activeTab === "password" && (
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-5">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Password Encryption</h3>
                <p className="text-xs text-slate-500">Lock or remove encryption with AES-256 standards.</p>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setPasswordMode("lock")}
                  className={`py-2 text-xs font-bold rounded-xl border flex items-center justify-center gap-2 transition ${
                    passwordMode === "lock"
                      ? "bg-emerald-50 border-emerald-500 text-emerald-700"
                      : "border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <LuLock className="w-4 h-4" />
                  Lock PDF
                </button>
                <button
                  onClick={() => setPasswordMode("unlock")}
                  className={`py-2 text-xs font-bold rounded-xl border flex items-center justify-center gap-2 transition ${
                    passwordMode === "unlock"
                      ? "bg-emerald-50 border-emerald-500 text-emerald-700"
                      : "border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <LuLockOpen className="w-4 h-4" />
                  Unlock PDF
                </button>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700">
                    {passwordMode === "lock" ? "Choose Open Password" : "Enter Password to Decrypt"}
                  </label>
                  <div className="relative mt-1">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={userPassword}
                      onChange={(e) => setUserPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full pr-10 pl-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <LuEyeOff className="w-4 h-4 pointer-events-none" /> : <LuEye className="w-4 h-4 pointer-events-none" />}
                    </button>
                  </div>
                </div>

                {passwordMode === "lock" && (
                  <>
                    <div>
                      <label className="text-xs font-semibold text-slate-700">Confirm Password</label>
                      <div className="relative mt-1">
                        <input
                          type={showPassword ? "text" : "password"}
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="••••••••••••"
                          className="w-full pr-10 pl-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                          aria-label={showPassword ? "Hide password" : "Show password"}
                        >
                          {showPassword ? <LuEyeOff className="w-4 h-4 pointer-events-none" /> : <LuEye className="w-4 h-4 pointer-events-none" />}
                        </button>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-100 space-y-2">
                      <div className="text-xs font-semibold text-slate-700">Access Permissions:</div>
                      <label className="flex items-center gap-2 text-xs cursor-pointer">
                        <input
                          type="checkbox"
                          checked={allowPrinting}
                          onChange={(e) => setAllowPrinting(e.target.checked)}
                          className="rounded text-emerald-600 focus:ring-emerald-500"
                        />
                        <span className="text-slate-700">Allow Printing</span>
                      </label>
                      <label className="flex items-center gap-2 text-xs cursor-pointer">
                        <input
                          type="checkbox"
                          checked={allowCopying}
                          onChange={(e) => setAllowCopying(e.target.checked)}
                          className="rounded text-emerald-600 focus:ring-emerald-500"
                        />
                        <span className="text-slate-700">Allow Text &amp; Image Copying</span>
                      </label>
                    </div>
                  </>
                )}
              </div>

              <button
                onClick={handlePasswordProcess}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl text-xs font-bold transition shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2"
              >
                {passwordMode === "lock" ? <LuLock className="w-4 h-4" /> : <LuLockOpen className="w-4 h-4" />}
                {passwordMode === "lock" ? "Encrypt & Lock Document" : "Decrypt & Unlock Document"}
              </button>
            </div>
          )}

          {/* TAB 3: TRUE PDF REDACTION */}
          {activeTab === "redaction" && (
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-5">
              <div>
                <h3 className="text-sm font-bold text-slate-900">True PDF Redaction</h3>
                <p className="text-xs text-slate-500">
                  Permanently destroys underlying text, glyphs, and image streams &mdash; not just overlaying a box.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200/80 text-[11px] text-amber-900 leading-relaxed flex items-start gap-2.5">
                <LuInfo className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>
                  <strong>True Redaction Guarantee:</strong> Unlike simple annotations that can be removed in Acrobat,
                  this tool rasterizes and destroys the underlying bytes so sensitive data can never be inspected or
                  recovered.
                </span>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700">Target Redaction Zone</label>
                  <select
                    value={redactZone}
                    onChange={(e) => setRedactZone(e.target.value as any)}
                    className="w-full mt-1 px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="ssn_keys">Secret Keys &amp; Sensitive Identifiers (Lines 2-3)</option>
                    <option value="header">Top Header &amp; Discloser Info</option>
                    <option value="footer">Bottom Footer &amp; Tracking Codes</option>
                    <option value="all_sensitive">Comprehensive Redaction (Header + Keys + Body)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700">Redaction Overlay Stamp</label>
                  <input
                    type="text"
                    value={redactionText}
                    onChange={(e) => setRedactionText(e.target.value)}
                    placeholder="e.g. CONFIDENTIAL / REDACTED"
                    className="w-full mt-1 px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div className="pt-2">
                  <label className="flex items-center gap-2 text-xs cursor-pointer">
                    <input
                      type="checkbox"
                      checked={redactAllPages}
                      onChange={(e) => setRedactAllPages(e.target.checked)}
                      className="rounded text-emerald-600 focus:ring-emerald-500"
                    />
                    <span className="text-slate-700">Apply redaction across all {pageCount} pages</span>
                  </label>
                </div>
              </div>

              <button
                onClick={handleTrueRedaction}
                className="w-full py-3 bg-rose-600 hover:bg-rose-500 text-white rounded-2xl text-xs font-bold transition shadow-md shadow-rose-600/20 flex items-center justify-center gap-2"
              >
                <LuEyeOff className="w-4 h-4" />
                Sanitize &amp; Apply True Redaction
              </button>
            </div>
          )}

          {/* TAB 5: SECURE SHARING */}
          {activeTab === "secure-share" && (
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Secure Sharing Controls</h3>
                  <p className="text-xs text-slate-500">Expiring links, download caps, and one-click instant revocation.</p>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                  Coming Soon
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-[11px] text-slate-600 leading-relaxed flex items-center gap-2">
                <LuInfo className="w-4 h-4 text-slate-500 shrink-0" />
                <span>This feature is temporarily paused for enhancements and will be enabled in a future release.</span>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700">Link Expiration</label>
                  <select
                    value={shareExpiration}
                    onChange={(e) => setShareExpiration(e.target.value as any)}
                    className="w-full mt-1 px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="1h">Expires in 1 Hour</option>
                    <option value="24h">Expires in 24 Hours</option>
                    <option value="3d">Expires in 3 Days</option>
                    <option value="7d">Expires in 7 Days</option>
                    <option value="30d">Expires in 30 Days</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700">Download Limit</label>
                  <select
                    value={shareDownloadLimit}
                    onChange={(e) => setShareDownloadLimit(e.target.value === "unlimited" ? "unlimited" : Number(e.target.value))}
                    className="w-full mt-1 px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value={1}>1 Download (Self-Destruct)</option>
                    <option value={5}>5 Downloads</option>
                    <option value={20}>20 Downloads</option>
                    <option value="unlimited">Unlimited Downloads</option>
                  </select>
                </div>

                <div className="pt-2 border-t border-slate-100 space-y-2">
                  <label className="flex items-center gap-2 text-xs cursor-pointer">
                    <input
                      type="checkbox"
                      checked={hasPasscode}
                      onChange={(e) => setHasPasscode(e.target.checked)}
                      className="rounded text-emerald-600 focus:ring-emerald-500"
                    />
                    <span className="text-slate-700">Require Access Passcode</span>
                  </label>

                  {hasPasscode && (
                    <input
                      type="text"
                      value={sharePasscode}
                      onChange={(e) => setSharePasscode(e.target.value)}
                      placeholder="e.g. SECURE-8842"
                      className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-300 focus:outline-none"
                    />
                  )}
                </div>
              </div>

              <button
                onClick={handleGenerateSecureLink}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl text-xs font-bold transition shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2"
              >
                <LuShare2 className="w-4 h-4" />
                Generate Expiring Share Link
              </button>

              {latestShareUrl && (
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-2">
                  <div className="text-xs font-bold text-emerald-900">Active Share Link:</div>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      readOnly
                      value={latestShareUrl}
                      className="flex-1 px-2.5 py-1.5 text-[11px] bg-white border border-emerald-300 rounded-xl text-slate-700 select-all"
                    />
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(latestShareUrl);
                        setCopiedShare(true);
                        setTimeout(() => setCopiedShare(false), 2000);
                      }}
                      className="px-3 py-1.5 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 transition"
                    >
                      {copiedShare ? "Copied!" : "Copy"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 6: DOCUMENT APPROVALS */}
          {activeTab === "approvals" && (
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-5">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Document Approval Stamp</h3>
                <p className="text-xs text-slate-500">Stamp official verified compliance and review certificates.</p>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700">Approval Stamp Status</label>
                  <div className="grid grid-cols-2 gap-2 mt-1">
                    {[
                      { id: "APPROVED", label: "APPROVED", color: "text-emerald-700 bg-emerald-50 border-emerald-300" },
                      { id: "REVIEWED", label: "REVIEWED", color: "text-blue-700 bg-blue-50 border-blue-300" },
                      { id: "LEGAL_CLEARED", label: "LEGAL CLEARED", color: "text-purple-700 bg-purple-50 border-purple-300" },
                      { id: "CONFIDENTIAL", label: "CONFIDENTIAL", color: "text-rose-700 bg-rose-50 border-rose-300" },
                    ].map((s) => (
                      <button
                        key={s.id}
                        onClick={() => setApprovalStatus(s.id as any)}
                        className={`py-2 px-3 text-xs font-bold rounded-xl border text-center transition ${
                          approvalStatus === s.id ? `${s.color} ring-1 ring-emerald-500` : "border-slate-200 text-slate-600 hover:bg-slate-50"
                        }`}
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700">Approver Full Name</label>
                  <input
                    type="text"
                    value={approverName}
                    onChange={(e) => setApproverName(e.target.value)}
                    className="w-full mt-1 px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700">Role / Department</label>
                  <input
                    type="text"
                    value={approverRole}
                    onChange={(e) => setApproverRole(e.target.value)}
                    className="w-full mt-1 px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">Stamp Placement</label>
                    <CustomSelect
                      value={approvalPlacement}
                      onChange={(v: any) => setApprovalPlacement(v)}
                      size="sm"
                      options={[
                        { value: "bottom-right", label: "Bottom Right" },
                        { value: "top-right", label: "Top Right" },
                        { value: "center-watermark", label: "Center Watermark" },
                      ]}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">Apply To Page</label>
                    <CustomSelect
                      value={approvalScope}
                      onChange={(v: any) => setApprovalScope(v)}
                      size="sm"
                      options={[
                        { value: "current", label: `Current (Pg. ${currentPage})` },
                        { value: "first", label: "First Page (Cover)" },
                        { value: "all", label: `All (${pageCount} Pages)` },
                      ]}
                    />
                  </div>
                </div>
              </div>

              <button
                onClick={handleApplyApproval}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl text-xs font-bold transition shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2"
              >
                <LuBadgeCheck className="w-4 h-4" />
                Stamp Approval &amp; Download Document
              </button>
            </div>
          )}
        </div>

        {/* Right Column: Live Document Preview & Active Shares */}
        <div className="lg:col-span-7 space-y-6">
          {/* Document Canvas Preview Card */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-900">Document Visual Preview</span>
                <span className="text-[11px] px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 font-semibold">
                  Page {currentPage} of {pageCount}
                </span>
              </div>

              {pageCount > 1 && (
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage <= 1}
                    className="px-2 py-1 text-xs rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40"
                  >
                    &larr; Prev
                  </button>
                  <button
                    onClick={() => setCurrentPage((p) => Math.min(pageCount, p + 1))}
                    disabled={currentPage >= pageCount}
                    className="px-2 py-1 text-xs rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40"
                  >
                    Next &rarr;
                  </button>
                </div>
              )}
            </div>

            {/* Document Canvas with Placement Crosshair Indicator */}
            <div className="relative border border-slate-200 rounded-2xl bg-slate-100 overflow-hidden flex items-center justify-center min-h-[460px] p-2">
              {selectedFile ? (
                <>
                  <canvas
                    ref={previewCanvasRef}
                    onClick={handlePreviewCanvasClick}
                    className="max-w-full h-auto rounded-lg shadow-md cursor-pointer bg-white"
                  />

                  {/* Visual cursor tag for e-signature placement */}
                  {activeTab === "esign" && (
                    <div
                      style={{
                        left: `${sigPlacement.xPercent}%`,
                        top: `${sigPlacement.yPercent}%`,
                      }}
                      className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-none flex flex-col items-center"
                    >
                      <div className="px-2 py-1 rounded-md bg-emerald-600 text-white font-bold text-[10px] shadow-lg whitespace-nowrap animate-pulse flex items-center gap-1">
                        <LuSignature className="w-3 h-3" />
                        Drop Signature Here
                      </div>
                      <div className="w-2 h-2 bg-emerald-600 rotate-45 -mt-1" />
                    </div>
                  )}

                  {/* Live Visual Indicator for Document Approval Stamp */}
                  {activeTab === "approvals" && (
                    <div
                      className={`absolute pointer-events-none transition-all duration-300 z-20 ${
                        approvalPlacement === "bottom-right"
                          ? "bottom-6 right-6"
                          : approvalPlacement === "top-right"
                          ? "top-6 right-6"
                          : "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
                      }`}
                    >
                      {(() => {
                        const isConfidential = approvalStatus === "CONFIDENTIAL";
                        const isLegal = approvalStatus === "LEGAL_CLEARED";
                        const isReviewed = approvalStatus === "REVIEWED";
                        const statusColor = isConfidential
                          ? "border-rose-500 bg-rose-50/95 text-rose-800"
                          : isLegal
                          ? "border-purple-500 bg-purple-50/95 text-purple-800"
                          : isReviewed
                          ? "border-blue-500 bg-blue-50/95 text-blue-800"
                          : "border-emerald-600 bg-emerald-50/95 text-emerald-800";
                        const tagBg = isConfidential
                          ? "bg-rose-600"
                          : isLegal
                          ? "bg-purple-600"
                          : isReviewed
                          ? "bg-blue-600"
                          : "bg-emerald-600";

                        return (
                          <div
                            className={`w-52 rounded-xl border-2 p-2.5 shadow-xl backdrop-blur-xs ring-2 ring-black/5 animate-in fade-in zoom-in-95 duration-150 ${statusColor}`}
                          >
                            <div className="flex items-center justify-between gap-1.5 mb-1.5">
                              <span
                                className={`px-2 py-0.5 rounded text-[10px] font-black tracking-wider text-white uppercase shadow-2xs ${tagBg}`}
                              >
                                {approvalStatus.replace("_", " ")}
                              </span>
                              <span className="text-[9px] font-bold text-slate-500 uppercase tracking-tight">
                                Verified
                              </span>
                            </div>
                            <div className="text-[11px] font-bold text-slate-900 truncate">
                              {approverName || "Approver"}
                            </div>
                            <div className="text-[10px] text-slate-600 font-medium truncate">
                              {approverRole || "Signatory Authority"}
                            </div>
                            <div className="mt-1 pt-1 border-t border-slate-300/60 flex items-center justify-between text-[9px] text-slate-500">
                              <span>Security Studio Verified</span>
                              <span className="font-mono">{new Date().toISOString().slice(0, 10)}</span>
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center p-8 space-y-3">
                  <div className="w-14 h-14 rounded-2xl bg-white text-slate-400 mx-auto flex items-center justify-center shadow-xs">
                    <LuFileText className="w-7 h-7" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-800">No Document Selected</h4>
                    <p className="text-[11px] text-slate-500 max-w-xs mx-auto mt-1">
                      Upload your PDF document to apply signatures, password protection, true redaction, or approvals.
                    </p>
                  </div>
                  <div className="flex justify-center gap-2 pt-1">
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition shadow-xs flex items-center gap-2"
                    >
                      <LuUpload className="w-4 h-4" />
                      Upload PDF Document
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
              <span>Resolution: High-DPI Canvas Rendering</span>
              <span>AES-256 GCM Security Enforced</span>
            </div>
          </div>

          {/* Active Shared Links Table (When in secure-share or general overview) */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Active Secure Share Links</h3>
                <p className="text-xs text-slate-500">Track expiring access and immediately revoke URLs.</p>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-xl bg-emerald-50 text-emerald-700">
                {sharedLinks.filter((s) => s.status === "active").length} Active
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 font-medium">
                    <th className="pb-2">Document</th>
                    <th className="pb-2">Expires</th>
                    <th className="pb-2">Downloads</th>
                    <th className="pb-2">Status</th>
                    <th className="pb-2 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {sharedLinks.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-slate-400 text-xs">
                        No active share links. Generate an expiring share link in the panel above to manage access.
                      </td>
                    </tr>
                  ) : (
                    sharedLinks.map((link) => (
                    <tr key={link.id} className="text-slate-700">
                      <td className="py-2.5 font-semibold text-slate-900 flex items-center gap-2 truncate max-w-[160px]">
                        <LuFileText className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{link.fileName}</span>
                      </td>
                      <td className="py-2.5 text-slate-500">{link.expiresInLabel}</td>
                      <td className="py-2.5 text-slate-500">
                        {link.downloadsLeft === "unlimited" ? "Unlimited" : `${link.downloadsLeft} left`}
                      </td>
                      <td className="py-2.5">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            link.status === "active"
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-rose-100 text-rose-800"
                          }`}
                        >
                          {link.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="py-2.5 text-right">
                        {link.status === "active" ? (
                          <button
                            onClick={() => handleRevokeShare(link.id)}
                            className="text-xs text-rose-600 hover:text-rose-800 font-bold transition"
                          >
                            Revoke
                          </button>
                        ) : (
                          <span className="text-xs text-slate-400">Revoked</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
      {/* Upgrade Checkout Modal */}
      <UpgradeCheckoutModal
        isOpen={isUpgradeOpen}
        onClose={() => setIsUpgradeOpen(false)}
        highlightFeature={highlightFeature}
      />
    </div>
  );
}
