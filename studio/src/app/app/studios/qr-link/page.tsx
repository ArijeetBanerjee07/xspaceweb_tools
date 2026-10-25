"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import QRCode from "qrcode";
import JSZip from "jszip";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import {
  LuQrCode,
  LuLink,
  LuWifi,
  LuUser,
  LuMail,
  LuCalendar,
  LuShare2,
  LuSlidersHorizontal,
  LuPalette,
  LuImage,
  LuFileText,
  LuLayers,
  LuDownload,
  LuUpload,
  LuCopy,
  LuCheck,
  LuRefreshCw,
  LuLock,
  LuClock,
  LuSparkles,
  LuTrash2,
  LuExternalLink,
  LuEye,
  LuCrown,
} from "react-icons/lu";
import { UpgradeCheckoutModal } from "@/components/studio/UpgradeCheckoutModal";
import { useProStatus, checkClientFeatureAccess, incrementClientUsage } from "@/lib/gating";

// -------------------------------------------------------------
// TYPES & DEFINITIONS
// -------------------------------------------------------------
type MainSection = "generator" | "design" | "dynamic" | "tools";

type QRContentType = "url" | "wifi" | "vcard" | "email" | "event" | "social";

interface DynamicQRRecord {
  id: string;
  slug: string;
  shortUrl: string;
  destinationUrl: string;
  title: string;
  scans: number;
  hasPassword: boolean;
  expiresAt: string;
  status: "active" | "paused";
  createdAt: string;
}

export default function QRLinkStudioPage() {
  const isPro = useProStatus();
  const [isUpgradeOpen, setIsUpgradeOpen] = useState(false);
  const [highlightFeature, setHighlightFeature] = useState("QR Studio Pro");
  const [activeSection, setActiveSection] = useState<MainSection>("generator");
  const [contentType, setContentType] = useState<QRContentType>("url");

  // Output QR State
  const [qrDataString, setQrDataString] = useState<string>("https://xspace.tools");
  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const [qrSvgString, setQrSvgString] = useState<string>("");
  const [statusMessage, setStatusMessage] = useState<string>("");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // -----------------------------------------------------------
  // 1. CONTENT FIELDS STATE
  // -----------------------------------------------------------
  // URL
  const [inputUrl, setInputUrl] = useState("");

  // Wi-Fi
  const [wifiSsid, setWifiSsid] = useState("");
  const [wifiPassword, setWifiPassword] = useState("");
  const [wifiEncryption, setWifiEncryption] = useState<"WPA" | "WEP" | "nopass">("WPA");
  const [wifiHidden, setWifiHidden] = useState(false);

  // vCard
  const [vcardFirst, setVcardFirst] = useState("");
  const [vcardLast, setVcardLast] = useState("");
  const [vcardCompany, setVcardCompany] = useState("");
  const [vcardTitle, setVcardTitle] = useState("");
  const [vcardPhone, setVcardPhone] = useState("");
  const [vcardEmail, setVcardEmail] = useState("");
  const [vcardWebsite, setVcardWebsite] = useState("");

  // Email
  const [emailRecipient, setEmailRecipient] = useState("");
  const [emailSubject, setEmailSubject] = useState("");
  const [emailBody, setEmailBody] = useState("");

  // Event
  const [eventTitle, setEventTitle] = useState("");
  const [eventLocation, setEventLocation] = useState("");
  const [eventStart, setEventStart] = useState("");
  const [eventEnd, setEventEnd] = useState("");

  // Social Profile
  const [socialHandle, setSocialHandle] = useState("");
  const [socialPlatform, setSocialPlatform] = useState<"instagram" | "youtube" | "tiktok" | "x" | "linkedin">("instagram");

  // -----------------------------------------------------------
  // 2. DESIGN & STYLING STATE
  // -----------------------------------------------------------
  const [dotColor, setDotColor] = useState("#0f172a");
  const [bgColor, setBgColor] = useState("#ffffff");
  const [transparentBg, setTransparentBg] = useState(false);
  const [errorCorrection, setErrorCorrection] = useState<"L" | "M" | "Q" | "H">("M");
  const [qrSize, setQrSize] = useState<number>(400); // 200 - 1000 px
  const [frameText, setFrameText] = useState("SCAN WITH CAMERA");
  const [hasFrame, setHasFrame] = useState(true);
  const [frameBgColor, setFrameBgColor] = useState("#0f172a");
  const [logoImageSrc, setLogoImageSrc] = useState<string | null>(null);

  // -----------------------------------------------------------
  // 3. DYNAMIC QR CODES & SHORT LINKS STATE
  // -----------------------------------------------------------
  const [dynamicRecords, setDynamicRecords] = useState<DynamicQRRecord[]>([]);

  const [newSlug, setNewSlug] = useState("");
  const [newDestUrl, setNewDestUrl] = useState("");
  const [newTitle, setNewTitle] = useState("");
  const [editingRecordId, setEditingRecordId] = useState<string | null>(null);
  const [editDestUrl, setEditDestUrl] = useState("");

  // -----------------------------------------------------------
  // 4. BULK & PDF TOOLS STATE
  // -----------------------------------------------------------
  const [bulkTextInput, setBulkTextInput] = useState("");
  const [isBulkProcessing, setIsBulkProcessing] = useState(false);

  // PDF-to-QR Placement state
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfPageCount, setPdfPageCount] = useState<number>(1);
  const [pdfPlacement, setPdfPlacement] = useState<{ xPercent: number; yPercent: number }>({
    xPercent: 82,
    yPercent: 88,
  });
  const [pdfDownloadedUrl, setPdfDownloadedUrl] = useState<string | null>(null);

  const pdfInputRef = useRef<HTMLInputElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);

  // -----------------------------------------------------------
  // SYNCHRONIZE DATA STRING FROM ACTIVE CONTENT TYPE
  // -----------------------------------------------------------
  useEffect(() => {
    let payload = "";

    if (contentType === "url") {
      payload = inputUrl.trim();
    } else if (contentType === "wifi") {
      if (wifiSsid.trim()) {
        payload = `WIFI:S:${wifiSsid};T:${wifiEncryption};P:${wifiPassword};H:${wifiHidden ? "true" : "false"};;`;
      }
    } else if (contentType === "vcard") {
      if (vcardFirst.trim() || vcardLast.trim() || vcardPhone.trim() || vcardEmail.trim()) {
        payload = [
          "BEGIN:VCARD",
          "VERSION:3.0",
          `N:${vcardLast};${vcardFirst};;;`,
          `FN:${vcardFirst} ${vcardLast}`.trim(),
          vcardCompany ? `ORG:${vcardCompany}` : "",
          vcardTitle ? `TITLE:${vcardTitle}` : "",
          vcardPhone ? `TEL;TYPE=CELL:${vcardPhone}` : "",
          vcardEmail ? `EMAIL:${vcardEmail}` : "",
          vcardWebsite ? `URL:${vcardWebsite}` : "",
          "END:VCARD",
        ]
          .filter(Boolean)
          .join("\n");
      }
    } else if (contentType === "email") {
      if (emailRecipient.trim()) {
        const subjectEnc = encodeURIComponent(emailSubject);
        const bodyEnc = encodeURIComponent(emailBody);
        payload = `mailto:${emailRecipient}?subject=${subjectEnc}&body=${bodyEnc}`;
      }
    } else if (contentType === "event") {
      if (eventTitle.trim()) {
        const s = eventStart ? eventStart.replace(/[-:]/g, "") + "00Z" : "";
        const e = eventEnd ? eventEnd.replace(/[-:]/g, "") + "00Z" : "";
        payload = [
          "BEGIN:VCALENDAR",
          "VERSION:2.0",
          "BEGIN:VEVENT",
          `SUMMARY:${eventTitle}`,
          eventLocation ? `LOCATION:${eventLocation}` : "",
          s ? `DTSTART:${s}` : "",
          e ? `DTEND:${e}` : "",
          "END:VEVENT",
          "END:VCALENDAR",
        ]
          .filter(Boolean)
          .join("\n");
      }
    } else if (contentType === "social") {
      const cleanHandle = socialHandle.replace(/^@/, "").trim();
      if (cleanHandle) {
        const urls: Record<string, string> = {
          instagram: `https://instagram.com/${cleanHandle}`,
          youtube: `https://youtube.com/@${cleanHandle}`,
          tiktok: `https://tiktok.com/@${cleanHandle}`,
          x: `https://x.com/${cleanHandle}`,
          linkedin: `https://linkedin.com/in/${cleanHandle}`,
        };
        payload = urls[socialPlatform] || `https://instagram.com/${cleanHandle}`;
      }
    }

    setQrDataString(payload);
  }, [
    contentType,
    inputUrl,
    wifiSsid,
    wifiPassword,
    wifiEncryption,
    wifiHidden,
    vcardFirst,
    vcardLast,
    vcardCompany,
    vcardTitle,
    vcardPhone,
    vcardEmail,
    vcardWebsite,
    emailRecipient,
    emailSubject,
    emailBody,
    eventTitle,
    eventLocation,
    eventStart,
    eventEnd,
    socialHandle,
    socialPlatform,
  ]);

  // -----------------------------------------------------------
  // GENERATE QR CODE PREVIEWS (CANVAS & SVG)
  // -----------------------------------------------------------
  const generateQRCode = useCallback(async () => {
    if (!qrDataString) {
      setQrDataUrl("");
      return;
    }

    try {
      const actualBg = transparentBg ? "#00000000" : bgColor;
      const opts = {
        errorCorrectionLevel: errorCorrection,
        margin: 1.5,
        width: qrSize,
        color: {
          dark: dotColor,
          light: actualBg,
        },
      };

      // Generate base QR Data URL
      const dataUrl = await QRCode.toDataURL(qrDataString, opts);

      // If user uploaded a logo or has a frame, composite it onto a canvas
      if (logoImageSrc || hasFrame) {
        const canvas = document.createElement("canvas");
        const extraBottom = hasFrame ? 64 : 0;
        canvas.width = qrSize;
        canvas.height = qrSize + extraBottom;
        const ctx = canvas.getContext("2d");

        if (ctx) {
          // Fill background
          if (!transparentBg) {
            ctx.fillStyle = bgColor;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
          }

          // Draw QR
          const qrImg = new Image();
          await new Promise((res) => {
            qrImg.onload = res;
            qrImg.src = dataUrl;
          });
          ctx.drawImage(qrImg, 0, 0, qrSize, qrSize);

          // Draw Frame / Banner if enabled
          if (hasFrame) {
            ctx.fillStyle = frameBgColor;
            ctx.roundRect(16, qrSize + 4, qrSize - 32, 46, 12);
            ctx.fill();

            ctx.fillStyle = "#ffffff";
            ctx.font = "bold 15px -apple-system, BlinkMacSystemFont, sans-serif";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText(frameText.toUpperCase(), qrSize / 2, qrSize + 27);
          }

          // Draw Center Logo if enabled
          if (logoImageSrc) {
            const logo = new Image();
            await new Promise((res) => {
              logo.onload = res;
              logo.src = logoImageSrc;
            });

            const logoSize = Math.floor(qrSize * 0.22);
            const logoX = (qrSize - logoSize) / 2;
            const logoY = (qrSize - logoSize) / 2;

            // White rounded backing badge
            ctx.fillStyle = "#ffffff";
            ctx.roundRect(logoX - 6, logoY - 6, logoSize + 12, logoSize + 12, 10);
            ctx.fill();

            ctx.drawImage(logo, logoX, logoY, logoSize, logoSize);
          }

          setQrDataUrl(canvas.toDataURL("image/png"));
        }
      } else {
        setQrDataUrl(dataUrl);
      }

      // Generate pure SVG string
      const svg = await QRCode.toString(qrDataString, {
        ...opts,
        type: "svg",
      });
      setQrSvgString(svg);
    } catch (err: any) {
      console.error(err);
    }
  }, [
    qrDataString,
    dotColor,
    bgColor,
    transparentBg,
    errorCorrection,
    qrSize,
    hasFrame,
    frameText,
    frameBgColor,
    logoImageSrc,
  ]);

  useEffect(() => {
    generateQRCode();
  }, [generateQRCode]);

  // -----------------------------------------------------------
  // EXPORT HANDLERS (PNG / SVG / PDF FLYER)
  // -----------------------------------------------------------
  const exportPNG = () => {
    if (!qrDataUrl) {
      setStatusMessage("Please enter content to generate a QR code before exporting.");
      return;
    }
    const a = document.createElement("a");
    a.href = qrDataUrl;
    a.download = `qrcode_${contentType}_${Date.now()}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const exportSVG = () => {
    if (!qrSvgString) {
      setStatusMessage("Please enter content to generate a QR code before exporting.");
      return;
    }
    const blob = new Blob([qrSvgString], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `qrcode_${contentType}_${Date.now()}.svg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const exportPrintablePDF = async () => {
    if (!qrDataUrl) {
      setStatusMessage("Please enter content to generate a QR code before exporting.");
      return;
    }

    try {
      const doc = await PDFDocument.create();
      const page = doc.addPage([595, 842]); // A4
      const { width, height } = page.getSize();
      const boldFont = await doc.embedFont(StandardFonts.HelveticaBold);
      const font = await doc.embedFont(StandardFonts.Helvetica);

      // Gradient Header
      page.drawRectangle({
        x: 40,
        y: height - 120,
        width: width - 80,
        height: 70,
        color: rgb(0.06, 0.09, 0.16),
      });

      page.drawText("SCAN WITH YOUR SMARTPHONE", {
        x: 60,
        y: height - 85,
        size: 16,
        font: boldFont,
        color: rgb(1, 1, 1),
      });

      page.drawText("Quickly connect, visit URL, or save contact details instantly.", {
        x: 60,
        y: height - 105,
        size: 9.5,
        font,
        color: rgb(0.8, 0.85, 0.95),
      });

      // Embed QR Image
      const base64Data = qrDataUrl.split(",")[1];
      const binaryStr = atob(base64Data);
      const imgBytes = new Uint8Array(binaryStr.length);
      for (let i = 0; i < binaryStr.length; i++) imgBytes[i] = binaryStr.charCodeAt(i);

      const embeddedQr = await doc.embedPng(imgBytes);
      const qrDim = 280;
      const qrX = (width - qrDim) / 2;
      const qrY = (height - qrDim) / 2 - 20;

      // Card border
      page.drawRectangle({
        x: qrX - 20,
        y: qrY - 40,
        width: qrDim + 40,
        height: qrDim + 70,
        borderWidth: 1.5,
        borderColor: rgb(0.85, 0.88, 0.92),
        color: rgb(0.98, 0.99, 1),
      });

      page.drawImage(embeddedQr, {
        x: qrX,
        y: qrY,
        width: qrDim,
        height: qrDim,
      });

      // CTA under QR
      page.drawText(frameText.toUpperCase(), {
        x: width / 2 - 80,
        y: qrY - 24,
        size: 12,
        font: boldFont,
        color: rgb(0.1, 0.45, 0.9),
      });

      // Footer notice
      page.drawText("Generated with XSpace QR & Link Studio &bull; High Resolution Vector Print Ready", {
        x: 100,
        y: 40,
        size: 8,
        font,
        color: rgb(0.5, 0.5, 0.6),
      });

      const pdfBytes = await doc.save();
      const blob = new Blob([pdfBytes as Uint8Array<ArrayBuffer>], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `qr_flyer_${contentType}_${Date.now()}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (err: any) {
      console.error(err);
    }
  };

  // -----------------------------------------------------------
  // DYNAMIC QR CODES & SHORT LINKS ACTIONS
  // -----------------------------------------------------------
  const handleCreateDynamicQR = () => {
    if (!newDestUrl.trim()) return;
    const generatedSlug = newSlug.trim() || Math.random().toString(36).substring(2, 9);
    const newRecord: DynamicQRRecord = {
      id: `dyn_${Date.now()}`,
      slug: generatedSlug,
      shortUrl: `https://xspace.tools/r/${generatedSlug}`,
      destinationUrl: newDestUrl.trim(),
      title: newTitle.trim() || `Campaign ${generatedSlug}`,
      scans: 0,
      hasPassword: false,
      expiresAt: "Dec 31, 2026",
      status: "active",
      createdAt: "Today",
    };

    setDynamicRecords([newRecord, ...dynamicRecords]);
    setNewSlug("");
    setNewTitle("");
    setStatusMessage(`Dynamic QR Code created! Destination: ${newRecord.destinationUrl}`);
  };

  const handleUpdateDestination = (id: string) => {
    if (!editDestUrl.trim()) return;
    setDynamicRecords((prev) =>
      prev.map((r) => (r.id === id ? { ...r, destinationUrl: editDestUrl.trim() } : r))
    );
    setEditingRecordId(null);
    setEditDestUrl("");
    setStatusMessage("Destination URL updated! All printed QR codes will now redirect to the new URL.");
  };

  const handleSimulateScan = (id: string) => {
    setDynamicRecords((prev) =>
      prev.map((r) => (r.id === id ? { ...r, scans: r.scans + 1 } : r))
    );
    setStatusMessage(`Scan recorded! Total scans updated.`);
  };

  // -----------------------------------------------------------
  // BULK QR GENERATION & ZIP EXPORT
  // -----------------------------------------------------------
  const handleGenerateBulkZip = async () => {
    const lines = bulkTextInput
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);

    if (lines.length === 0) return;
    setIsBulkProcessing(true);

    try {
      const zip = new JSZip();

      for (let i = 0; i < lines.length; i++) {
        const parts = lines[i].split(",");
        const url = parts[0].trim();
        const label = parts[1] ? parts[1].trim() : `qr_item_${i + 1}`;
        const cleanName = label.replace(/[^a-zA-Z0-9_-]/g, "_");

        const dataUrl = await QRCode.toDataURL(url, {
          width: 400,
          margin: 1.5,
          color: { dark: dotColor, light: bgColor },
        });

        const base64Data = dataUrl.split(",")[1];
        zip.file(`${cleanName}.png`, base64Data, { base64: true });
      }

      const zipBlob = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(zipBlob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `bulk_qr_codes_${lines.length}_items.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      setStatusMessage(`Bulk export complete! Generated ${lines.length} QR codes in ZIP archive.`);
    } catch (e: any) {
      console.error(e);
    } finally {
      setIsBulkProcessing(false);
    }
  };

  // -----------------------------------------------------------
  // PDF-TO-QR: INSERT QR CODE INTO PDF
  // -----------------------------------------------------------
  const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const file = files[0];
    setPdfFile(file);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const doc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
      setPdfPageCount(doc.getPageCount());
      setStatusMessage(`PDF "${file.name}" loaded (${doc.getPageCount()} pages). Click to stamp QR!`);
    } catch {
      setStatusMessage("Could not parse PDF document.");
    }
  };

  const handleInsertQRIntoPdf = async () => {
    if (!pdfFile || !qrDataUrl) return;

    try {
      const arrayBuffer = await pdfFile.arrayBuffer();
      const doc = await PDFDocument.load(arrayBuffer);

      // Embed QR Image
      const base64Data = qrDataUrl.split(",")[1];
      const binaryStr = atob(base64Data);
      const imgBytes = new Uint8Array(binaryStr.length);
      for (let i = 0; i < binaryStr.length; i++) imgBytes[i] = binaryStr.charCodeAt(i);

      const embeddedQr = await doc.embedPng(imgBytes);
      const page = doc.getPages()[0];
      const { width, height } = page.getSize();

      const stampDim = 90;
      const posX = (pdfPlacement.xPercent / 100) * width - stampDim / 2;
      const posY = height - (pdfPlacement.yPercent / 100) * height - stampDim / 2;

      // Draw subtle white background behind QR
      page.drawRectangle({
        x: posX - 4,
        y: posY - 4,
        width: stampDim + 8,
        height: stampDim + 8,
        color: rgb(1, 1, 1),
        borderColor: rgb(0.8, 0.8, 0.8),
        borderWidth: 0.5,
      });

      page.drawImage(embeddedQr, {
        x: posX,
        y: posY,
        width: stampDim,
        height: stampDim,
      });

      const pdfBytes = await doc.save();
      const blob = new Blob([pdfBytes as Uint8Array<ArrayBuffer>], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      setPdfDownloadedUrl(url);

      const a = document.createElement("a");
      a.href = url;
      a.download = `${pdfFile.name.replace(/\.pdf$/i, "")}_with_qr.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      setStatusMessage("QR Code successfully stamped onto PDF document!");
    } catch (err: any) {
      console.error(err);
      setStatusMessage("Failed to insert QR into PDF.");
    }
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
        <Link href="/app" className="hover:text-rose-600 transition">
          Home
        </Link>
        <span>&rsaquo;</span>
        <span className="text-slate-800 font-semibold">QR &amp; Link Studio</span>
      </div>

      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-rose-950 via-slate-900 to-pink-950 text-white p-6 sm:p-8 border border-rose-900/60 shadow-xl flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
        <div className="absolute top-0 right-0 w-96 h-96 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/20 border border-rose-400/30 text-rose-300 text-xs font-semibold">
            <LuSparkles className="w-4 h-4" />
            <span>Multi-Format QR &bull; Dynamic Tracking &bull; PDF Placement Engine</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
            QR &amp; <span className="text-rose-400">Link</span> Studio
          </h1>
          <p className="text-sm text-slate-300 leading-relaxed max-w-xl">
            Convert URLs, Wi-Fi keys, vCards, emails, and events into custom-styled QR codes. Manage dynamic
            redirect destinations without reprinting, generate bulk batches, and stamp QR codes into PDF documents.
          </p>
        </div>

        {/* 3D QR Code Illustration */}
        <div className="relative z-10 self-center lg:self-auto shrink-0 flex flex-col items-center">
          <div className="relative group">
            <div className="absolute -inset-2 bg-gradient-to-tr from-rose-600/30 to-pink-500/20 rounded-full blur-2xl group-hover:blur-3xl transition" />
            <img
              src="/banners/qr_code.png"
              alt="3D QR Code Device"
              className="relative w-32 sm:w-40 lg:w-48 h-auto drop-shadow-2xl transform hover:scale-105 transition-transform duration-300 pointer-events-none select-none"
            />
          </div>
        </div>
      </div>

      {/* Studio Primary Navigation Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 border-b border-slate-200">
        {(() => {
          const customFramesAccess = checkClientFeatureAccess("qr:custom-frames", isPro);
          return [
            { id: "generator", label: "Convert into QR Code", icon: LuQrCode, badge: "Free" },
            {
              id: "design",
              label: "Custom Design & Frames",
              icon: LuPalette,
              badge: isPro ? "PRO" : customFramesAccess.allowed ? `${customFramesAccess.remaining}/5 free` : "PRO",
              isProRequired: !isPro && !customFramesAccess.allowed,
            },
            { id: "dynamic", label: "Dynamic QRs & Short Links", icon: LuLink, badge: "PRO", isProRequired: !isPro },
            { id: "tools", label: "Bulk CSV & PDF Stamper", icon: LuLayers, badge: "PRO", isProRequired: !isPro },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeSection === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  if (tab.isProRequired) {
                    setHighlightFeature(tab.label);
                    setIsUpgradeOpen(true);
                    return;
                  }
                  setActiveSection(tab.id as MainSection);
                  setStatusMessage("");
                }}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all ${
                  isActive
                    ? "bg-rose-600 text-white shadow-md shadow-rose-600/20"
                    : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
                {tab.badge && (
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
              </button>
            );
          });
        })()}
      </div>

      {/* Status Bar */}
      {statusMessage && (
        <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-900 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <LuCheck className="w-4 h-4 text-rose-600" />
            <span>{statusMessage}</span>
          </div>
          <button onClick={() => setStatusMessage("")} className="text-rose-400 hover:text-rose-600">
            &times;
          </button>
        </div>
      )}

      {/* Main Studio Interactive Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Interactive Controls Panel */}
        <div className="lg:col-span-7 space-y-6">
          {/* SECTION 1: CONVERT INTO QR CODE */}
          {activeSection === "generator" && (
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-5">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Select Content Type</h3>
                <p className="text-xs text-slate-500">Choose what information will be encoded into the QR code.</p>
              </div>

              {/* Sub-type Grid */}
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                {[
                  { id: "url", label: "URL", icon: LuLink },
                  { id: "wifi", label: "Wi-Fi", icon: LuWifi },
                  { id: "vcard", label: "vCard", icon: LuUser },
                  { id: "email", label: "Email", icon: LuMail },
                  { id: "event", label: "Event", icon: LuCalendar },
                  { id: "social", label: "Social", icon: LuShare2 },
                ].map((type) => {
                  const Icon = type.icon;
                  const isCur = contentType === type.id;
                  return (
                    <button
                      key={type.id}
                      onClick={() => setContentType(type.id as QRContentType)}
                      className={`p-3 rounded-2xl border text-center transition flex flex-col items-center gap-1.5 ${
                        isCur
                          ? "bg-rose-50 border-rose-500 text-rose-700 font-bold shadow-xs"
                          : "border-slate-200 text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span className="text-[11px]">{type.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Input Forms */}
              <div className="pt-2 border-t border-slate-100">
                {/* 1. URL */}
                {contentType === "url" && (
                  <div className="space-y-3">
                    <label className="text-xs font-semibold text-slate-700">Destination Website URL</label>
                    <div className="relative">
                      <LuLink className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                      <input
                        type="url"
                        value={inputUrl}
                        onChange={(e) => setInputUrl(e.target.value)}
                        placeholder="https://example.com"
                        className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-rose-500"
                      />
                    </div>
                  </div>
                )}

                {/* 2. Wi-Fi */}
                {contentType === "wifi" && (
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs font-semibold text-slate-700">Network Name (SSID)</label>
                      <input
                        type="text"
                        value={wifiSsid}
                        onChange={(e) => setWifiSsid(e.target.value)}
                        placeholder="e.g. MyWiFiNetwork"
                        className="w-full mt-1 px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-rose-500"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-semibold text-slate-700">Password</label>
                        <input
                          type="text"
                          value={wifiPassword}
                          onChange={(e) => setWifiPassword(e.target.value)}
                          placeholder="e.g. WiFiSecretPass"
                          className="w-full mt-1 px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-rose-500"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-slate-700">Security Encryption</label>
                        <select
                          value={wifiEncryption}
                          onChange={(e) => setWifiEncryption(e.target.value as any)}
                          className="w-full mt-1 px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-rose-500"
                        >
                          <option value="WPA">WPA / WPA2 / WPA3</option>
                          <option value="WEP">WEP</option>
                          <option value="nopass">None (Open)</option>
                        </select>
                      </div>
                    </div>

                    <label className="flex items-center gap-2 text-xs cursor-pointer">
                      <input
                        type="checkbox"
                        checked={wifiHidden}
                        onChange={(e) => setWifiHidden(e.target.checked)}
                        className="rounded text-rose-600 focus:ring-rose-500"
                      />
                      <span className="text-slate-700">Hidden Wi-Fi Network</span>
                    </label>
                  </div>
                )}

                {/* 3. vCard / Contact */}
                {contentType === "vcard" && (
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[11px] font-semibold text-slate-600">First Name</label>
                        <input
                          type="text"
                          value={vcardFirst}
                          onChange={(e) => setVcardFirst(e.target.value)}
                          placeholder="Jane"
                          className="w-full mt-1 px-3 py-1.5 text-xs rounded-xl border border-slate-300 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-semibold text-slate-600">Last Name</label>
                        <input
                          type="text"
                          value={vcardLast}
                          onChange={(e) => setVcardLast(e.target.value)}
                          placeholder="Doe"
                          className="w-full mt-1 px-3 py-1.5 text-xs rounded-xl border border-slate-300 focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[11px] font-semibold text-slate-600">Company / Organization</label>
                        <input
                          type="text"
                          value={vcardCompany}
                          onChange={(e) => setVcardCompany(e.target.value)}
                          placeholder="Acme Corp"
                          className="w-full mt-1 px-3 py-1.5 text-xs rounded-xl border border-slate-300 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-semibold text-slate-600">Job Title</label>
                        <input
                          type="text"
                          value={vcardTitle}
                          onChange={(e) => setVcardTitle(e.target.value)}
                          placeholder="Design Director"
                          className="w-full mt-1 px-3 py-1.5 text-xs rounded-xl border border-slate-300 focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[11px] font-semibold text-slate-600">Phone Number</label>
                        <input
                          type="tel"
                          value={vcardPhone}
                          onChange={(e) => setVcardPhone(e.target.value)}
                          placeholder="+1 (555) 000-0000"
                          className="w-full mt-1 px-3 py-1.5 text-xs rounded-xl border border-slate-300 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-semibold text-slate-600">Email Address</label>
                        <input
                          type="email"
                          value={vcardEmail}
                          onChange={(e) => setVcardEmail(e.target.value)}
                          placeholder="jane@example.com"
                          className="w-full mt-1 px-3 py-1.5 text-xs rounded-xl border border-slate-300 focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* 4. Email */}
                {contentType === "email" && (
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs font-semibold text-slate-700">Recipient Email Address</label>
                      <input
                        type="email"
                        value={emailRecipient}
                        onChange={(e) => setEmailRecipient(e.target.value)}
                        placeholder="contact@business.com"
                        className="w-full mt-1 px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-700">Pre-filled Subject</label>
                      <input
                        type="text"
                        value={emailSubject}
                        onChange={(e) => setEmailSubject(e.target.value)}
                        placeholder="e.g. Partnership Inquiry"
                        className="w-full mt-1 px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-700">Body Message</label>
                      <textarea
                        rows={2}
                        value={emailBody}
                        onChange={(e) => setEmailBody(e.target.value)}
                        placeholder="Enter your pre-filled message here..."
                        className="w-full mt-1 px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none"
                      />
                    </div>
                  </div>
                )}

                {/* 5. Event */}
                {contentType === "event" && (
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs font-semibold text-slate-700">Event Title</label>
                      <input
                        type="text"
                        value={eventTitle}
                        onChange={(e) => setEventTitle(e.target.value)}
                        placeholder="e.g. Annual Design Summit"
                        className="w-full mt-1 px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-700">Location</label>
                      <input
                        type="text"
                        value={eventLocation}
                        onChange={(e) => setEventLocation(e.target.value)}
                        placeholder="e.g. Conference Room B or Online"
                        className="w-full mt-1 px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[11px] font-semibold text-slate-600">Start Time</label>
                        <input
                          type="datetime-local"
                          value={eventStart}
                          onChange={(e) => setEventStart(e.target.value)}
                          className="w-full mt-1 px-3 py-1.5 text-xs rounded-xl border border-slate-300 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-semibold text-slate-600">End Time</label>
                        <input
                          type="datetime-local"
                          value={eventEnd}
                          onChange={(e) => setEventEnd(e.target.value)}
                          className="w-full mt-1 px-3 py-1.5 text-xs rounded-xl border border-slate-300 focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* 6. Social */}
                {contentType === "social" && (
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-semibold text-slate-700">Social Platform</label>
                        <select
                          value={socialPlatform}
                          onChange={(e) => setSocialPlatform(e.target.value as any)}
                          className="w-full mt-1 px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white focus:outline-none"
                        >
                          <option value="instagram">Instagram</option>
                          <option value="youtube">YouTube</option>
                          <option value="tiktok">TikTok</option>
                          <option value="x">X (Twitter)</option>
                          <option value="linkedin">LinkedIn</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-slate-700">Profile Username / Handle</label>
                        <input
                          type="text"
                          value={socialHandle}
                          onChange={(e) => setSocialHandle(e.target.value)}
                          placeholder="@username"
                          className="w-full mt-1 px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* SECTION 2: CUSTOM DESIGN & FRAMES */}
          {activeSection === "design" && (
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-5">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Custom Colors, Frames &amp; Logos</h3>
                <p className="text-xs text-slate-500">Style your QR code for brand recognition and high contrast.</p>
              </div>

              <div className="space-y-4">
                {/* Color Palettes */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-700">QR Dots Color</label>
                    <div className="flex items-center gap-2 mt-1">
                      <input
                        type="color"
                        value={dotColor}
                        onChange={(e) => setDotColor(e.target.value)}
                        className="w-8 h-8 rounded-lg cursor-pointer border-0 p-0"
                      />
                      <input
                        type="text"
                        value={dotColor}
                        onChange={(e) => setDotColor(e.target.value)}
                        className="flex-1 px-2.5 py-1 text-xs rounded-xl border border-slate-300"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-700">Background Color</label>
                    <div className="flex items-center gap-2 mt-1">
                      <input
                        type="color"
                        value={bgColor}
                        disabled={transparentBg}
                        onChange={(e) => setBgColor(e.target.value)}
                        className="w-8 h-8 rounded-lg cursor-pointer border-0 p-0 disabled:opacity-30"
                      />
                      <input
                        type="text"
                        value={bgColor}
                        disabled={transparentBg}
                        onChange={(e) => setBgColor(e.target.value)}
                        className="flex-1 px-2.5 py-1 text-xs rounded-xl border border-slate-300 disabled:opacity-30"
                      />
                    </div>
                  </div>
                </div>

                {/* Color Presets */}
                <div>
                  <div className="text-[11px] font-semibold text-slate-600 mb-1.5">Curated Color Themes:</div>
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      { name: "Classic Slate", dark: "#0f172a", light: "#ffffff" },
                      { name: "Emerald Tech", dark: "#065f46", light: "#f0fdf4" },
                      { name: "Crimson Rose", dark: "#9f1239", light: "#fff1f2" },
                      { name: "Royal Indigo", dark: "#312e81", light: "#eef2ff" },
                      { name: "Midnight Gold", dark: "#18181b", light: "#fef9c3" },
                    ].map((preset) => (
                      <button
                        key={preset.name}
                        onClick={() => {
                          setDotColor(preset.dark);
                          setBgColor(preset.light);
                          setTransparentBg(false);
                        }}
                        className="px-2.5 py-1 rounded-xl text-[11px] font-semibold border border-slate-200 hover:bg-slate-50 flex items-center gap-1.5"
                      >
                        <span className="w-3 h-3 rounded-full border border-black/10" style={{ backgroundColor: preset.dark }} />
                        <span>{preset.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <label className="flex items-center gap-2 text-xs cursor-pointer">
                  <input
                    type="checkbox"
                    checked={transparentBg}
                    onChange={(e) => setTransparentBg(e.target.checked)}
                    className="rounded text-rose-600 focus:ring-rose-500"
                  />
                  <span className="text-slate-700">Transparent Background (PNG/SVG)</span>
                </label>

                {/* Call-to-action Frame */}
                <div className="pt-2 border-t border-slate-100 space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-slate-700 flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={hasFrame}
                        onChange={(e) => setHasFrame(e.target.checked)}
                        className="rounded text-rose-600 focus:ring-rose-500"
                      />
                      <span>Add Call-to-Action Bottom Frame Banner</span>
                    </label>
                  </div>

                  {hasFrame && (
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[11px] font-semibold text-slate-600">Frame Text</label>
                        <input
                          type="text"
                          value={frameText}
                          onChange={(e) => setFrameText(e.target.value)}
                          placeholder="e.g. SCAN ME"
                          className="w-full mt-1 px-3 py-1.5 text-xs rounded-xl border border-slate-300 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-semibold text-slate-600">Frame Color</label>
                        <div className="flex items-center gap-2 mt-1">
                          <input
                            type="color"
                            value={frameBgColor}
                            onChange={(e) => setFrameBgColor(e.target.value)}
                            className="w-7 h-7 rounded-lg cursor-pointer border-0 p-0"
                          />
                          <input
                            type="text"
                            value={frameBgColor}
                            onChange={(e) => setFrameBgColor(e.target.value)}
                            className="flex-1 px-2 py-1 text-xs rounded-xl border border-slate-300"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Center Logo Upload */}
                <div className="pt-2 border-t border-slate-100 space-y-2">
                  <label className="text-xs font-semibold text-slate-700">Center Logo Badge</label>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => logoInputRef.current?.click()}
                      className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition flex items-center gap-1.5"
                    >
                      <LuUpload className="w-3.5 h-3.5" />
                      <span>{logoImageSrc ? "Replace Logo" : "Upload Logo"}</span>
                    </button>
                    {logoImageSrc && (
                      <button
                        onClick={() => setLogoImageSrc(null)}
                        className="text-xs text-rose-600 font-bold hover:underline"
                      >
                        Remove Logo
                      </button>
                    )}
                    <input
                      ref={logoInputRef}
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = () => setLogoImageSrc(reader.result as string);
                          reader.readAsDataURL(file);
                        }
                      }}
                      className="hidden"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SECTION 3: DYNAMIC QR CODES & SHORT LINKS */}
          {activeSection === "dynamic" && (
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-5">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Dynamic QR Codes &amp; Branded Short Links</h3>
                <p className="text-xs text-slate-500">
                  Print once, change destination anytime. Track scans and update redirect links on the fly.
                </p>
              </div>

              {/* Create new dynamic link */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="text-xs font-bold text-slate-900">Create New Dynamic QR:</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <label className="text-[11px] font-semibold text-slate-600">Campaign Title</label>
                    <input
                      type="text"
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      placeholder="e.g. Summer Festival Banner"
                      className="w-full mt-1 px-3 py-1.5 text-xs rounded-xl border border-slate-300 bg-white"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-slate-600">Custom Branded Slug</label>
                    <div className="flex items-center mt-1">
                      <span className="text-[11px] text-slate-400 bg-slate-200/60 px-2.5 py-1.5 rounded-l-xl border border-r-0 border-slate-300">
                        /r/
                      </span>
                      <input
                        type="text"
                        value={newSlug}
                        onChange={(e) => setNewSlug(e.target.value)}
                        placeholder="my-link"
                        className="flex-1 px-2.5 py-1.5 text-xs rounded-r-xl border border-slate-300 bg-white focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-600">Destination URL (Editable Later)</label>
                  <input
                    type="url"
                    value={newDestUrl}
                    onChange={(e) => setNewDestUrl(e.target.value)}
                    placeholder="https://mywebsite.com/landing"
                    className="w-full mt-1 px-3 py-1.5 text-xs rounded-xl border border-slate-300 bg-white"
                  />
                </div>

                <button
                  onClick={handleCreateDynamicQR}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold transition shadow-xs flex items-center gap-1.5"
                >
                  <LuLink className="w-3.5 h-3.5" />
                  Generate Dynamic QR Code
                </button>
              </div>

              {/* Dynamic QR List Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-100 text-slate-400 font-medium">
                      <th className="pb-2">Campaign</th>
                      <th className="pb-2">Short URL</th>
                      <th className="pb-2">Destination Target</th>
                      <th className="pb-2">Scans</th>
                      <th className="pb-2 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {dynamicRecords.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-8 text-center text-slate-400 text-xs">
                          No dynamic QR codes generated yet. Enter a campaign title, slug, and destination URL above to generate an editable short link.
                        </td>
                      </tr>
                    ) : (
                      dynamicRecords.map((item) => (
                      <tr key={item.id} className="text-slate-700">
                        <td className="py-2.5 font-bold text-slate-900">{item.title}</td>
                        <td className="py-2.5 text-rose-600 font-semibold">{item.shortUrl}</td>
                        <td className="py-2.5 truncate max-w-[140px] text-slate-500">{item.destinationUrl}</td>
                        <td className="py-2.5">
                          <span className="font-bold text-slate-800">{item.scans}</span> scans
                        </td>
                        <td className="py-2.5 text-right space-x-2">
                          <button
                            onClick={() => {
                              setInputUrl(item.shortUrl);
                              setContentType("url");
                              setStatusMessage(`QR preview updated to dynamic link: ${item.shortUrl}`);
                            }}
                            className="text-xs font-bold text-rose-600 hover:underline"
                          >
                            Preview
                          </button>
                          <button
                            onClick={() => handleSimulateScan(item.id)}
                            className="text-xs font-bold text-emerald-600 hover:underline"
                          >
                            +Scan
                          </button>
                          <button
                            onClick={() => {
                              setEditingRecordId(item.id);
                              setEditDestUrl(item.destinationUrl);
                            }}
                            className="text-xs font-bold text-slate-600 hover:underline"
                          >
                            Edit
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                  </tbody>
                </table>
              </div>

              {/* Edit destination modal drawer */}
              {editingRecordId && (
                <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 space-y-2">
                  <div className="text-xs font-bold text-amber-900">Change Printed QR Destination URL:</div>
                  <input
                    type="url"
                    value={editDestUrl}
                    onChange={(e) => setEditDestUrl(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs rounded-xl border border-amber-300 bg-white"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleUpdateDestination(editingRecordId)}
                      className="px-3 py-1.5 bg-amber-600 text-white rounded-xl text-xs font-bold hover:bg-amber-700 transition"
                    >
                      Save New Destination
                    </button>
                    <button
                      onClick={() => setEditingRecordId(null)}
                      className="px-3 py-1.5 bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* SECTION 4: BULK GENERATOR & PDF STAMPER */}
          {activeSection === "tools" && (
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-6">
              {/* Bulk QR Generator */}
              <div className="space-y-3">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Bulk QR Generator (CSV / Multiple URLs)</h3>
                  <p className="text-xs text-slate-500">
                    Enter one URL per line with an optional label (e.g. <code>https://link.com, Product A</code>).
                  </p>
                </div>

                <textarea
                  rows={4}
                  value={bulkTextInput}
                  onChange={(e) => setBulkTextInput(e.target.value)}
                  placeholder="https://example.com/page-1, Link Label 1&#10;https://example.com/page-2, Link Label 2"
                  className="w-full px-3 py-2 text-xs font-mono rounded-xl border border-slate-300 focus:outline-none"
                />

                <button
                  onClick={handleGenerateBulkZip}
                  disabled={isBulkProcessing}
                  className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition flex items-center gap-2"
                >
                  <LuDownload className="w-4 h-4 text-rose-400" />
                  <span>{isBulkProcessing ? "Generating ZIP..." : "Generate & Download All in ZIP"}</span>
                </button>
              </div>

              {/* PDF-to-QR Stamper */}
              <div className="pt-4 border-t border-slate-200 space-y-3">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">PDF-to-QR: Insert QR Code into PDF Document</h3>
                  <p className="text-xs text-slate-500">
                    Upload an invoice, contract, or flyer PDF, and stamp the active QR code directly onto it.
                  </p>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => pdfInputRef.current?.click()}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition flex items-center gap-1.5"
                  >
                    <LuUpload className="w-4 h-4 text-rose-600" />
                    <span>{pdfFile ? pdfFile.name : "Select PDF Document"}</span>
                  </button>
                  <input
                    ref={pdfInputRef}
                    type="file"
                    accept=".pdf,application/pdf"
                    onChange={handlePdfUpload}
                    className="hidden"
                  />

                  {pdfFile && (
                    <button
                      onClick={handleInsertQRIntoPdf}
                      className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
                    >
                      <LuFileText className="w-4 h-4" />
                      Stamp QR &amp; Download PDF
                    </button>
                  )}
                </div>

                {pdfFile && (
                  <div className="text-[11px] text-slate-500">
                    Placement: Bottom Right corner of Page 1. Clean vector embedding via <code>pdf-lib</code>.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Live QR Preview & Multi-Format Export Card */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Live QR Preview</h3>
                <p className="text-xs text-slate-500">Scannable with all iOS &amp; Android camera apps</p>
              </div>
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 uppercase">
                {contentType}
              </span>
            </div>

            {/* Visual Canvas Display Box */}
            <div className="relative border border-slate-200 rounded-2xl bg-slate-50 overflow-hidden flex flex-col items-center justify-center p-6 min-h-[340px]">
              {qrDataUrl && qrDataString ? (
                <img
                  src={qrDataUrl}
                  alt="Generated QR Code"
                  className="max-w-[260px] h-auto rounded-xl shadow-md bg-white p-2"
                />
              ) : (
                <div className="text-center text-slate-400 p-6 max-w-xs">
                  <LuQrCode className="w-12 h-12 mx-auto mb-2 opacity-30" />
                  <p className="text-xs font-medium text-slate-500">Enter content to preview QR code</p>
                  <p className="text-[11px] text-slate-400 mt-1">Configure your content type on the left to generate a scannable code.</p>
                </div>
              )}

              {/* Data String Preview */}
              {qrDataString ? (
                <div className="mt-4 max-w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-[11px] font-mono text-slate-600 truncate">
                  {qrDataString}
                </div>
              ) : null}
            </div>

            {/* Export Buttons */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <div className="text-xs font-semibold text-slate-700">Export Formats:</div>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={exportPNG}
                  className="py-2.5 px-3 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <LuDownload className="w-3.5 h-3.5" />
                  PNG (Raster)
                </button>
                <button
                  onClick={exportSVG}
                  className="py-2.5 px-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <LuDownload className="w-3.5 h-3.5" />
                  SVG (Vector)
                </button>
                <button
                  onClick={exportPrintablePDF}
                  className="py-2.5 px-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <LuFileText className="w-3.5 h-3.5" />
                  Print PDF
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
              <span>EC Level: {errorCorrection} (Robust)</span>
              <span>Vector Scalable</span>
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
