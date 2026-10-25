"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import JSZip from "jszip";
import {
  LuScissors,
  LuImage,
  LuSparkles,
  LuLayers,
  LuUpload,
  LuZap,
  LuArrowLeftRight,
  LuDownload,
  LuFileCheck,
  LuSignature,
  LuUserCheck,
  LuShoppingBag,
  LuCopy,
  LuRefreshCw,
  LuSlidersHorizontal,
  LuCheck,
  LuFolderArchive,
  LuTag,
  LuRotateCcw,
  LuInfo,
  LuTrash2,
  LuCrown,
} from "react-icons/lu";
import { UpgradeCheckoutModal } from "@/components/studio/UpgradeCheckoutModal";
import { useProStatus, checkClientFeatureAccess, incrementClientUsage } from "@/lib/gating";

// -------------------------------------------------------------
// VECTOR SAMPLE ASSETS (Embedded Data URLs for instant testing)
// -------------------------------------------------------------
const SAMPLE_REMOVER_WATCH = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" width="600" height="600" viewBox="0 0 600 600">
  <rect width="600" height="600" fill="#e2e8f0"/>
  <g transform="translate(180, 60)">
    <rect x="70" y="20" width="100" height="150" rx="12" fill="#334155"/>
    <line x1="80" y1="50" x2="160" y2="50" stroke="#475569" stroke-width="2"/>
    <line x1="80" y1="80" x2="160" y2="80" stroke="#475569" stroke-width="2"/>
    <rect x="70" y="310" width="100" height="150" rx="12" fill="#334155"/>
    <circle cx="120" cy="360" r="4" fill="#1e293b"/>
    <circle cx="120" cy="390" r="4" fill="#1e293b"/>
    <circle cx="120" cy="420" r="4" fill="#1e293b"/>
    <circle cx="120" cy="240" r="95" fill="#e2e8f0" stroke="#0f172a" stroke-width="8"/>
    <circle cx="120" cy="240" r="80" fill="#0f172a"/>
    <circle cx="120" cy="240" r="76" fill="#1e293b"/>
    <circle cx="120" cy="175" r="4" fill="#f59e0b"/>
    <circle cx="185" cy="240" r="4" fill="#f59e0b"/>
    <circle cx="120" cy="305" r="4" fill="#f59e0b"/>
    <circle cx="55" cy="240" r="4" fill="#f59e0b"/>
    <line x1="120" y1="240" x2="155" y2="205" stroke="#ffffff" stroke-width="4" stroke-linecap="round"/>
    <line x1="120" y1="240" x2="120" y2="185" stroke="#ffffff" stroke-width="3" stroke-linecap="round"/>
    <line x1="120" y1="240" x2="100" y2="270" stroke="#ef4444" stroke-width="2" stroke-linecap="round"/>
    <circle cx="120" cy="240" r="6" fill="#ef4444"/>
    <rect x="215" y="230" width="12" height="20" rx="3" fill="#cbd5e1"/>
  </g>
</svg>
`)}`;

const SAMPLE_PRODUCT_SNEAKER = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" width="600" height="600" viewBox="0 0 600 600">
  <rect width="600" height="600" fill="#f1f5f9"/>
  <g transform="translate(60, 160)">
    <ellipse cx="240" cy="270" rx="210" ry="16" fill="#cbd5e1" opacity="0.6"/>
    <path d="M 60 250 C 100 250, 160 255, 230 255 C 310 255, 390 250, 440 230 C 445 220, 420 200, 390 195 C 330 215, 180 215, 60 210 Z" fill="#ffffff" stroke="#94a3b8" stroke-width="3"/>
    <path d="M 70 210 C 90 160, 150 100, 220 90 C 270 85, 310 110, 350 150 C 390 165, 430 190, 435 220 C 400 225, 340 215, 270 215 C 190 215, 120 215, 70 210 Z" fill="#2563eb"/>
    <path d="M 120 190 C 180 180, 260 140, 340 170 C 280 195, 210 210, 120 190 Z" fill="#f59e0b"/>
    <path d="M 230 110 C 260 135, 280 160, 300 185" stroke="#ffffff" stroke-width="4" stroke-linecap="round"/>
    <path d="M 210 120 C 240 145, 260 170, 280 195" stroke="#ffffff" stroke-width="4" stroke-linecap="round"/>
    <path d="M 190 130 C 220 155, 240 180, 260 205" stroke="#ffffff" stroke-width="4" stroke-linecap="round"/>
    <path d="M 70 210 C 65 180, 80 150, 95 140 L 105 160 C 95 170, 85 190, 80 210 Z" fill="#1e3a8a"/>
  </g>
</svg>
`)}`;

const SAMPLE_PASSPORT_PORTRAIT = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" width="600" height="600" viewBox="0 0 600 600">
  <rect width="600" height="600" fill="#cbd5e1"/>
  <g transform="translate(150, 70)">
    <path d="M -50 490 C -40 370, 50 340, 150 340 C 250 340, 340 370, 350 490 Z" fill="#1e293b"/>
    <polygon points="120,340 150,410 180,340" fill="#ffffff"/>
    <polygon points="140,360 150,430 160,360" fill="#dc2626"/>
    <rect x="125" y="270" width="50" height="80" rx="10" fill="#fcd34d"/>
    <ellipse cx="150" cy="200" rx="80" ry="100" fill="#fcd34d"/>
    <path d="M 65 190 C 60 110, 100 80, 150 80 C 200 80, 240 110, 235 190 C 220 150, 180 140, 150 140 C 110 140, 80 160, 65 190 Z" fill="#334155"/>
    <circle cx="120" cy="195" r="7" fill="#0f172a"/>
    <circle cx="180" cy="195" r="7" fill="#0f172a"/>
    <path d="M 125 245 Q 150 265 175 245" fill="none" stroke="#b45309" stroke-width="4" stroke-linecap="round"/>
  </g>
</svg>
`)}`;

const SAMPLE_HANDWRITTEN_SIGNATURE = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" width="600" height="320" viewBox="0 0 600 320">
  <rect width="600" height="320" fill="#fcf8ed"/>
  <line x1="30" y1="260" x2="570" y2="260" stroke="#cbd5e1" stroke-width="1.5" stroke-dasharray="5 5"/>
  <text x="40" y="285" font-family="sans-serif" font-size="11" fill="#94a3b8">AUTHORIZED SIGNATURE &bull; VERIFY CREDENTIALS</text>
  <path d="M 60 220 C 100 140, 120 70, 140 60 C 155 55, 165 120, 170 210 C 180 180, 200 170, 220 175 C 250 180, 260 220, 280 190 C 300 160, 310 140, 330 130 C 350 120, 355 200, 380 195 C 400 190, 430 150, 470 160 C 500 170, 520 200, 550 190" fill="none" stroke="#1e3a8a" stroke-width="5.5" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M 120 140 C 200 130, 310 120, 400 125" fill="none" stroke="#1e3a8a" stroke-width="3.5" stroke-linecap="round"/>
  <path d="M 150 230 C 230 220, 360 215, 490 218" fill="none" stroke="#1e3a8a" stroke-width="3" stroke-linecap="round"/>
</svg>
`)}`;

const SAMPLE_OFFICIAL_STAMP = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400">
  <rect width="400" height="400" fill="#fbfaf6"/>
  <g transform="translate(200,200) rotate(-8)">
    <circle cx="0" cy="0" r="140" fill="none" stroke="#dc2626" stroke-width="6" stroke-dasharray="12 4"/>
    <circle cx="0" cy="0" r="125" fill="none" stroke="#dc2626" stroke-width="2"/>
    <text x="0" y="-70" font-family="sans-serif" font-weight="900" font-size="18" fill="#dc2626" text-anchor="middle" letter-spacing="4">OFFICIALLY VERIFIED</text>
    <rect x="-110" y="-30" width="220" height="60" fill="none" stroke="#dc2626" stroke-width="4"/>
    <text x="0" y="10" font-family="sans-serif" font-weight="900" font-size="28" fill="#dc2626" text-anchor="middle" letter-spacing="2">APPROVED</text>
    <text x="0" y="80" font-family="sans-serif" font-weight="bold" font-size="14" fill="#dc2626" text-anchor="middle">DEPARTMENT OF COMMERCE</text>
    <text x="0" y="105" font-family="sans-serif" font-size="11" fill="#dc2626" text-anchor="middle">REG. NO #4992-81A</text>
  </g>
</svg>
`)}`;

// Batch item interface
interface BatchItem {
  id: string;
  name: string;
  originalUrl: string;
  processedBlob: Blob | null;
  processedUrl: string | null;
  status: "pending" | "processing" | "done" | "error";
  error?: string;
}

export default function BackgroundStudioPage() {
  const isPro = useProStatus();
  const [isUpgradeOpen, setIsUpgradeOpen] = useState(false);
  const [highlightFeature, setHighlightFeature] = useState("Background Studio Pro");
  // Navigation
  const [activeTab, setActiveTab] = useState<
    "remove" | "product" | "passport" | "signature" | "batch"
  >("remove");

  // =========================================================
  // TAB 1: AI REMOVER & REPLACER STATE (Independent)
  // =========================================================
  const [removerImage, setRemoverImage] = useState<string | null>(null);
  const [removerCutout, setRemoverCutout] = useState<string | null>(null);
  const [removerProcessing, setRemoverProcessing] = useState(false);
  const [removerSliderPos, setRemoverSliderPos] = useState(50);
  const [removerTolerance, setRemoverTolerance] = useState(32);
  const [removerFeather, setRemoverFeather] = useState(2);
  const [removerBgType, setRemoverBgType] = useState<
    "transparent" | "solid" | "gradient" | "ai-marble" | "ai-wood" | "ai-studio" | "custom"
  >("transparent");
  const [removerSolidColor, setRemoverSolidColor] = useState("#ffffff");
  const [removerCustomBg, setRemoverCustomBg] = useState<string | null>(null);
  const [removerExportFormat, setRemoverExportFormat] = useState<"png" | "jpg" | "webp">("png");

  // =========================================================
  // TAB 2: PRODUCT SHOWCASE STATE (Independent)
  // =========================================================
  const [productImage, setProductImage] = useState<string | null>(null);
  const [productCutout, setProductCutout] = useState<string | null>(null);
  const [productProcessing, setProductProcessing] = useState(false);
  const [productPreset, setProductPreset] = useState<
    "amazon-white" | "shopify-clean" | "marble-counter" | "oak-table" | "podium-glow" | "dark-room"
  >("amazon-white");
  const [productAspectRatio, setProductAspectRatio] = useState<"1:1" | "3:4" | "4:5" | "16:9">("1:1");
  const [productScale, setProductScale] = useState(82); // 50 - 95%
  const [productShadowType, setProductShadowType] = useState<"contact" | "reflection" | "directional" | "none">("contact");
  const [productShadowIntensity, setProductShadowIntensity] = useState(0.4);
  const [productBadge, setProductBadge] = useState<"none" | "SALE -20%" | "BESTSELLER" | "NEW ARRIVAL">("none");

  // =========================================================
  // TAB 3: PASSPORT PHOTO MAKER STATE (Independent)
  // =========================================================
  const [passportImage, setPassportImage] = useState<string | null>(null);
  const [passportCutout, setPassportCutout] = useState<string | null>(null);
  const [passportProcessing, setPassportProcessing] = useState(false);
  const [passportStandard, setPassportStandard] = useState<"us" | "schengen" | "india" | "canada">("us");
  const [passportBgTone, setPassportBgTone] = useState<"#ffffff" | "#c8e0f4" | "#e2e8f0">("#ffffff");
  const [passportSheetMode, setPassportSheetMode] = useState<"single" | "sheet6" | "sheet8" | "a4">("sheet6");
  const [passportHeadScale, setPassportHeadScale] = useState(78); // Face scale adjustment
  const [passportYOffset, setPassportYOffset] = useState(0); // Face vertical alignment
  const [showBiometricLines, setShowBiometricLines] = useState(true);

  // =========================================================
  // TAB 4: SIGNATURE & STAMP CLEANUP STATE (Independent)
  // =========================================================
  const [sigImage, setSigImage] = useState<string | null>(null);
  const [sigCutout, setSigCutout] = useState<string | null>(null);
  const [sigProcessing, setSigProcessing] = useState(false);
  const [sigThreshold, setSigThreshold] = useState(185);
  const [sigInkColor, setSigInkColor] = useState<"original" | "black" | "navy" | "royal" | "red">("black");
  const [sigCopied, setSigCopied] = useState(false);

  // =========================================================
  // TAB 5: BATCH PROCESSING STATE (Independent)
  // =========================================================
  const [batchItems, setBatchItems] = useState<BatchItem[]>([]);
  const [isBatchRunning, setIsBatchRunning] = useState(false);
  const [batchProgress, setBatchProgress] = useState(0);

  // Canvas Refs
  const removerCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const productCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const passportCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const signatureCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Input Refs
  const removerInputRef = useRef<HTMLInputElement | null>(null);
  const removerCustomBgRef = useRef<HTMLInputElement | null>(null);
  const productInputRef = useRef<HTMLInputElement | null>(null);
  const passportInputRef = useRef<HTMLInputElement | null>(null);
  const signatureInputRef = useRef<HTMLInputElement | null>(null);
  const batchInputRef = useRef<HTMLInputElement | null>(null);

  // -------------------------------------------------------------
  // REUSABLE CANVAS BACKGROUND REMOVAL (Flood-fill edge sampling)
  // -------------------------------------------------------------
  const removeBackgroundFromImg = useCallback(
    (img: HTMLImageElement, tol: number, feather: number): Promise<string> => {
      return new Promise((resolve) => {
        const canvas = document.createElement("canvas");
        const w = img.naturalWidth || img.width || 600;
        const h = img.naturalHeight || img.height || 600;
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d", { willReadFrequently: true });
        if (!ctx) return resolve("");

        ctx.drawImage(img, 0, 0, w, h);
        const imgData = ctx.getImageData(0, 0, w, h);
        const data = imgData.data;

        // Sample boundary
        let rSum = 0,
          gSum = 0,
          bSum = 0,
          cnt = 0;
        const step = Math.max(1, Math.floor(Math.min(w, h) / 30));
        for (let x = 0; x < w; x += step) {
          const tIdx = x * 4;
          const bIdx = ((h - 1) * w + x) * 4;
          rSum += data[tIdx] + data[bIdx];
          gSum += data[tIdx + 1] + data[bIdx + 1];
          bSum += data[tIdx + 2] + data[bIdx + 2];
          cnt += 2;
        }
        for (let y = 0; y < h; y += step) {
          const lIdx = (y * w) * 4;
          const rIdx = (y * w + (w - 1)) * 4;
          rSum += data[lIdx] + data[rIdx];
          gSum += data[lIdx + 1] + data[rIdx + 1];
          bSum += data[lIdx + 2] + data[rIdx + 2];
          cnt += 2;
        }

        const bgR = rSum / cnt;
        const bgG = gSum / cnt;
        const bgB = bSum / cnt;

        const visited = new Uint8Array(w * h);
        const queue: number[] = [];

        for (let x = 0; x < w; x++) {
          queue.push(x);
          queue.push((h - 1) * w + x);
        }
        for (let y = 0; y < h; y++) {
          queue.push(y * w);
          queue.push(y * w + (w - 1));
        }

        const getDist = (idx: number) => {
          const r = data[idx * 4];
          const g = data[idx * 4 + 1];
          const b = data[idx * 4 + 2];
          return Math.sqrt((r - bgR) ** 2 + (g - bgG) ** 2 + (b - bgB) ** 2);
        };

        const maxDist = tol * 2.5;
        let head = 0;

        while (head < queue.length) {
          const curr = queue[head++];
          if (visited[curr]) continue;

          if (getDist(curr) <= maxDist) {
            visited[curr] = 1;
            const cx = curr % w;
            const cy = Math.floor(curr / w);

            if (cx > 0 && !visited[curr - 1]) queue.push(curr - 1);
            if (cx < w - 1 && !visited[curr + 1]) queue.push(curr + 1);
            if (cy > 0 && !visited[curr - w]) queue.push(curr - w);
            if (cy < h - 1 && !visited[curr + w]) queue.push(curr + w);
          }
        }

        for (let i = 0; i < w * h; i++) {
          const pxIdx = i * 4;
          if (visited[i] === 1) {
            const dist = getDist(i);
            if (feather > 0 && dist > maxDist - feather * 6) {
              const alphaFraction = (dist - (maxDist - feather * 6)) / (feather * 6);
              data[pxIdx + 3] = Math.floor(Math.min(255, Math.max(0, alphaFraction * 255)));
            } else {
              data[pxIdx + 3] = 0;
            }
          }
        }

        ctx.putImageData(imgData, 0, 0);
        resolve(canvas.toDataURL("image/png"));
      });
    },
    []
  );

  // -------------------------------------------------------------
  // REUSABLE SIGNATURE CLEANUP
  // -------------------------------------------------------------
  const cleanSignatureFromImg = useCallback(
    (img: HTMLImageElement, thresh: number, inkMode: string): Promise<string> => {
      return new Promise((resolve) => {
        const canvas = document.createElement("canvas");
        const w = img.naturalWidth || img.width || 600;
        const h = img.naturalHeight || img.height || 300;
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d", { willReadFrequently: true });
        if (!ctx) return resolve("");

        ctx.drawImage(img, 0, 0, w, h);
        const imgData = ctx.getImageData(0, 0, w, h);
        const data = imgData.data;

        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          const lum = 0.299 * r + 0.587 * g + 0.114 * b;

          if (lum >= thresh) {
            data[i + 3] = 0; // Paper transparent
          } else {
            const alpha = Math.min(255, Math.max(0, Math.floor(((thresh - lum) / thresh) * 280)));
            data[i + 3] = alpha;

            if (inkMode === "black") {
              data[i] = 18;
              data[i + 1] = 18;
              data[i + 2] = 20;
            } else if (inkMode === "navy") {
              data[i] = 26;
              data[i + 1] = 54;
              data[i + 2] = 138;
            } else if (inkMode === "royal") {
              data[i] = 37;
              data[i + 1] = 99;
              data[i + 2] = 235;
            } else if (inkMode === "red") {
              data[i] = 220;
              data[i + 1] = 38;
              data[i + 2] = 38;
            }
          }
        }

        ctx.putImageData(imgData, 0, 0);
        resolve(canvas.toDataURL("image/png"));
      });
    },
    []
  );

  // -------------------------------------------------------------
  // TAB 1 EFFECT: Process Remover Image
  // -------------------------------------------------------------
  useEffect(() => {
    if (!removerImage) {
      setRemoverCutout(null);
      return;
    }
    let cancelled = false;
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = removerImage;
    setRemoverProcessing(true);

    img.onload = async () => {
      if (cancelled) return;
      const cutout = await removeBackgroundFromImg(img, removerTolerance, removerFeather);
      if (!cancelled) {
        setRemoverCutout(cutout);
        setRemoverProcessing(false);
      }
    };

    return () => {
      cancelled = true;
    };
  }, [removerImage, removerTolerance, removerFeather, removeBackgroundFromImg]);

  // TAB 1: Draw Remover Canvas
  useEffect(() => {
    const canvas = removerCanvasRef.current;
    if (!canvas || !removerCutout) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = removerCutout;
    img.onload = () => {
      const w = img.naturalWidth || 600;
      const h = img.naturalHeight || 600;
      canvas.width = w;
      canvas.height = h;

      ctx.clearRect(0, 0, w, h);

      if (removerBgType === "solid") {
        ctx.fillStyle = removerSolidColor;
        ctx.fillRect(0, 0, w, h);
      } else if (removerBgType === "gradient") {
        const grad = ctx.createLinearGradient(0, 0, w, h);
        grad.addColorStop(0, "#f8fafc");
        grad.addColorStop(1, "#94a3b8");
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, w, h);
      } else if (removerBgType === "ai-marble") {
        ctx.fillStyle = "#f8fafc";
        ctx.fillRect(0, 0, w, h);
        ctx.strokeStyle = "rgba(148, 163, 184, 0.3)";
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(0, h * 0.3);
        ctx.bezierCurveTo(w * 0.4, h * 0.2, w * 0.6, h * 0.6, w, h * 0.4);
        ctx.stroke();
      } else if (removerBgType === "ai-wood") {
        const woodGrad = ctx.createLinearGradient(0, 0, 0, h);
        woodGrad.addColorStop(0, "#d97706");
        woodGrad.addColorStop(1, "#92400e");
        ctx.fillStyle = woodGrad;
        ctx.fillRect(0, 0, w, h);
      } else if (removerBgType === "ai-studio") {
        const studioGrad = ctx.createRadialGradient(w / 2, h * 0.4, 10, w / 2, h * 0.5, w * 0.7);
        studioGrad.addColorStop(0, "#ffffff");
        studioGrad.addColorStop(1, "#e2e8f0");
        ctx.fillStyle = studioGrad;
        ctx.fillRect(0, 0, w, h);
      } else if (removerBgType === "custom" && removerCustomBg) {
        const bgImg = new Image();
        bgImg.src = removerCustomBg;
        if (bgImg.complete) ctx.drawImage(bgImg, 0, 0, w, h);
      }

      ctx.drawImage(img, 0, 0, w, h);
    };
  }, [removerCutout, removerBgType, removerSolidColor, removerCustomBg]);

  // -------------------------------------------------------------
  // TAB 2 EFFECT: Process Product Image
  // -------------------------------------------------------------
  useEffect(() => {
    if (!productImage) {
      setProductCutout(null);
      return;
    }
    let cancelled = false;
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = productImage;
    setProductProcessing(true);

    img.onload = async () => {
      if (cancelled) return;
      const cutout = await removeBackgroundFromImg(img, 30, 2);
      if (!cancelled) {
        setProductCutout(cutout);
        setProductProcessing(false);
      }
    };

    return () => {
      cancelled = true;
    };
  }, [productImage, removeBackgroundFromImg]);

  // TAB 2: Draw Product Studio Showcase Canvas
  useEffect(() => {
    const canvas = productCanvasRef.current;
    if (!canvas || !productCutout) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = productCutout;
    img.onload = () => {
      // Dimensions based on selected Aspect Ratio
      let canvasW = 1000;
      let canvasH = 1000;
      if (productAspectRatio === "3:4") {
        canvasW = 900;
        canvasH = 1200;
      } else if (productAspectRatio === "4:5") {
        canvasW = 960;
        canvasH = 1200;
      } else if (productAspectRatio === "16:9") {
        canvasW = 1600;
        canvasH = 900;
      }

      canvas.width = canvasW;
      canvas.height = canvasH;
      ctx.clearRect(0, 0, canvasW, canvasH);

      // 1. Draw Staging Environment
      if (productPreset === "amazon-white") {
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, canvasW, canvasH);
      } else if (productPreset === "shopify-clean") {
        const bgGrad = ctx.createLinearGradient(0, 0, 0, canvasH);
        bgGrad.addColorStop(0, "#f8fafc");
        bgGrad.addColorStop(1, "#edf2f7");
        ctx.fillStyle = bgGrad;
        ctx.fillRect(0, 0, canvasW, canvasH);
      } else if (productPreset === "marble-counter") {
        ctx.fillStyle = "#f8fafc";
        ctx.fillRect(0, 0, canvasW, canvasH);
        // Marble streaks
        ctx.strokeStyle = "rgba(148, 163, 184, 0.25)";
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.moveTo(0, canvasH * 0.4);
        ctx.bezierCurveTo(canvasW * 0.4, canvasH * 0.2, canvasW * 0.7, canvasH * 0.7, canvasW, canvasH * 0.5);
        ctx.stroke();
      } else if (productPreset === "oak-table") {
        const woodGrad = ctx.createLinearGradient(0, 0, 0, canvasH);
        woodGrad.addColorStop(0, "#d97706");
        woodGrad.addColorStop(1, "#78350f");
        ctx.fillStyle = woodGrad;
        ctx.fillRect(0, 0, canvasW, canvasH);
      } else if (productPreset === "podium-glow") {
        const podGrad = ctx.createRadialGradient(canvasW / 2, canvasH * 0.45, 30, canvasW / 2, canvasH * 0.5, canvasW * 0.8);
        podGrad.addColorStop(0, "#f8fafc");
        podGrad.addColorStop(1, "#475569");
        ctx.fillStyle = podGrad;
        ctx.fillRect(0, 0, canvasW, canvasH);

        // Circular pedestal
        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.ellipse(canvasW / 2, canvasH * 0.82, canvasW * 0.36, canvasH * 0.08, 0, 0, Math.PI * 2);
        ctx.fill();
      } else if (productPreset === "dark-room") {
        const darkGrad = ctx.createRadialGradient(canvasW / 2, canvasH * 0.35, 10, canvasW / 2, canvasH * 0.5, canvasW * 0.7);
        darkGrad.addColorStop(0, "#1e293b");
        darkGrad.addColorStop(1, "#020617");
        ctx.fillStyle = darkGrad;
        ctx.fillRect(0, 0, canvasW, canvasH);
      }

      // Calculate Product Placement & Scale
      const scaleFactor = (productScale / 100) * Math.min(canvasW / img.width, canvasH / img.height);
      const dw = img.width * scaleFactor;
      const dh = img.height * scaleFactor;
      const dx = (canvasW - dw) / 2;
      const dy = canvasH * 0.88 - dh; // Grounded to base

      // 2. Draw Floor Contact Shadow or Reflection
      if (productShadowType === "contact") {
        ctx.save();
        ctx.fillStyle = `rgba(15, 23, 42, ${productShadowIntensity})`;
        ctx.shadowColor = `rgba(15, 23, 42, ${productShadowIntensity})`;
        ctx.shadowBlur = 32;
        ctx.beginPath();
        ctx.ellipse(canvasW / 2, dy + dh - 4, dw * 0.45, 16, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      } else if (productShadowType === "reflection") {
        ctx.save();
        ctx.translate(0, (dy + dh) * 2);
        ctx.scale(1, -1);
        ctx.globalAlpha = 0.15;
        ctx.drawImage(img, dx, dy, dw, dh);
        ctx.restore();
      } else if (productShadowType === "directional") {
        ctx.save();
        ctx.fillStyle = `rgba(15, 23, 42, ${productShadowIntensity * 0.8})`;
        ctx.shadowColor = `rgba(15, 23, 42, ${productShadowIntensity * 0.8})`;
        ctx.shadowBlur = 40;
        ctx.beginPath();
        ctx.ellipse(canvasW / 2 + 40, dy + dh + 10, dw * 0.5, 20, 0.1, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // 3. Draw Foreground Product
      ctx.drawImage(img, dx, dy, dw, dh);

      // 4. Draw Promotional Badge if active
      if (productBadge !== "none") {
        ctx.save();
        ctx.fillStyle = "#ef4444";
        ctx.shadowColor = "rgba(0,0,0,0.25)";
        ctx.shadowBlur = 12;
        const bx = 40;
        const by = 40;
        const bw = 170;
        const bh = 46;
        ctx.beginPath();
        ctx.roundRect(bx, by, bw, bh, 14);
        ctx.fill();

        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 20px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(productBadge, bx + bw / 2, by + 30);
        ctx.restore();
      }
    };
  }, [productCutout, productPreset, productAspectRatio, productScale, productShadowType, productShadowIntensity, productBadge]);

  // -------------------------------------------------------------
  // TAB 3 EFFECT: Process Passport Image
  // -------------------------------------------------------------
  useEffect(() => {
    if (!passportImage) {
      setPassportCutout(null);
      return;
    }
    let cancelled = false;
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = passportImage;
    setPassportProcessing(true);

    img.onload = async () => {
      if (cancelled) return;
      const cutout = await removeBackgroundFromImg(img, 32, 2);
      if (!cancelled) {
        setPassportCutout(cutout);
        setPassportProcessing(false);
      }
    };

    return () => {
      cancelled = true;
    };
  }, [passportImage, removeBackgroundFromImg]);

  // TAB 3: Draw Passport Sheet Canvas
  useEffect(() => {
    const canvas = passportCanvasRef.current;
    if (!canvas || !passportCutout) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = passportCutout;
    img.onload = () => {
      let photoW = 600; // US 2x2" @ 300DPI
      let photoH = 600;

      if (passportStandard === "schengen") {
        photoW = 413;
        photoH = 531;
      } else if (passportStandard === "india") {
        photoW = 413;
        photoH = 413;
      } else if (passportStandard === "canada") {
        photoW = 590;
        photoH = 826;
      }

      if (passportSheetMode === "single") {
        canvas.width = photoW;
        canvas.height = photoH;
        ctx.fillStyle = passportBgTone;
        ctx.fillRect(0, 0, photoW, photoH);

        const scale = (passportHeadScale / 100) * Math.min(photoW / img.width, photoH / img.height);
        const dw = img.width * scale;
        const dh = img.height * scale;
        const dx = (photoW - dw) / 2;
        const dy = photoH - dh + passportYOffset;

        ctx.drawImage(img, dx, dy, dw, dh);

        // Biometric Guidelines Overlay (US State Dept / ICAO oval & lines)
        if (showBiometricLines) {
          ctx.strokeStyle = "rgba(59, 130, 246, 0.4)";
          ctx.lineWidth = 2;
          ctx.setLineDash([6, 6]);
          // Crown top line
          ctx.beginPath();
          ctx.moveTo(0, photoH * 0.18);
          ctx.lineTo(photoW, photoH * 0.18);
          ctx.stroke();
          // Chin line
          ctx.beginPath();
          ctx.moveTo(0, photoH * 0.78);
          ctx.lineTo(photoW, photoH * 0.78);
          ctx.stroke();
          // Center axis
          ctx.beginPath();
          ctx.moveTo(photoW / 2, 0);
          ctx.lineTo(photoW / 2, photoH);
          ctx.stroke();
          ctx.setLineDash([]);
        }
        return;
      }

      // 4x6" Sheet (1200 x 1800 px @ 300 DPI)
      const sheetW = 1800;
      const sheetH = 1200;
      canvas.width = sheetW;
      canvas.height = sheetH;

      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, sheetW, sheetH);

      const cols = passportSheetMode === "sheet8" ? 4 : 3;
      const rows = 2;

      const marginX = (sheetW - cols * photoW) / (cols + 1);
      const marginY = (sheetH - rows * photoH) / (rows + 1);

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const px = marginX + c * (photoW + marginX);
          const py = marginY + r * (photoH + marginY);

          ctx.fillStyle = passportBgTone;
          ctx.fillRect(px, py, photoW, photoH);

          ctx.strokeStyle = "#cbd5e1";
          ctx.lineWidth = 1;
          ctx.strokeRect(px, py, photoW, photoH);

          const scale = (passportHeadScale / 100) * Math.min(photoW / img.width, photoH / img.height);
          const dw = img.width * scale;
          const dh = img.height * scale;
          const dx = px + (photoW - dw) / 2;
          const dy = py + photoH - dh + passportYOffset;

          ctx.drawImage(img, dx, dy, dw, dh);

          // Cutting guides
          ctx.strokeStyle = "#94a3b8";
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(px - 10, py);
          ctx.lineTo(px, py);
          ctx.lineTo(px, py - 10);
          ctx.stroke();
        }
      }

      ctx.font = "14px monospace";
      ctx.fillStyle = "#94a3b8";
      ctx.fillText(
        `Passport Studio Print Sheet • ${passportStandard.toUpperCase()} (${cols * rows} Photos, 300 DPI)`,
        marginX,
        sheetH - 18
      );
    };
  }, [passportCutout, passportStandard, passportBgTone, passportSheetMode, passportHeadScale, passportYOffset, showBiometricLines]);

  // -------------------------------------------------------------
  // TAB 4 EFFECT: Process Signature Image
  // -------------------------------------------------------------
  useEffect(() => {
    if (!sigImage) {
      setSigCutout(null);
      return;
    }
    let cancelled = false;
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = sigImage;
    setSigProcessing(true);

    img.onload = async () => {
      if (cancelled) return;
      const cutout = await cleanSignatureFromImg(img, sigThreshold, sigInkColor);
      if (!cancelled) {
        setSigCutout(cutout);
        setSigProcessing(false);
      }
    };

    return () => {
      cancelled = true;
    };
  }, [sigImage, sigThreshold, sigInkColor, cleanSignatureFromImg]);

  // TAB 4: Draw Signature Canvas
  useEffect(() => {
    const canvas = signatureCanvasRef.current;
    if (!canvas || !sigCutout) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = sigCutout;
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.clearRect(0, 0, img.width, img.height);
      ctx.drawImage(img, 0, 0);
    };
  }, [sigCutout]);

  // -------------------------------------------------------------
  // GENERIC DOWNLOAD HELPER
  // -------------------------------------------------------------
  const downloadCanvasImage = (canvas: HTMLCanvasElement | null, filename: string, format = "png") => {
    if (!canvas) return;
    const mime = format === "jpg" ? "image/jpeg" : format === "webp" ? "image/webp" : "image/png";
    canvas.toBlob(
      (blob) => {
        if (!blob) return;
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${filename}_${Date.now()}.${format}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      },
      mime,
      0.95
    );
  };

  // -------------------------------------------------------------
  // BATCH PROCESS ENGINE
  // -------------------------------------------------------------
  const handleBatchDrop = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isPro) {
      setHighlightFeature("Batch Queue Processing");
      setIsUpgradeOpen(true);
      return;
    }
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newItems: BatchItem[] = Array.from(files).map((file, idx) => ({
      id: `${Date.now()}-${idx}`,
      name: file.name,
      originalUrl: URL.createObjectURL(file),
      processedBlob: null,
      processedUrl: null,
      status: "pending",
    }));

    setBatchItems((prev) => [...prev, ...newItems]);
  };

  const loadSampleBatch = () => {
    if (!isPro) {
      setHighlightFeature("Batch Queue Processing");
      setIsUpgradeOpen(true);
      return;
    }
    const samples = [
      { name: "product_sneaker.png", url: SAMPLE_PRODUCT_SNEAKER },
      { name: "luxury_watch.png", url: SAMPLE_REMOVER_WATCH },
      { name: "executive_headshot.png", url: SAMPLE_PASSPORT_PORTRAIT },
      { name: "official_seal.png", url: SAMPLE_OFFICIAL_STAMP },
    ];

    const items: BatchItem[] = samples.map((s, idx) => ({
      id: `sample-${Date.now()}-${idx}`,
      name: s.name,
      originalUrl: s.url,
      processedBlob: null,
      processedUrl: null,
      status: "pending",
    }));

    setBatchItems(items);
  };

  const runBatchProcessing = async () => {
    if (!isPro) {
      setHighlightFeature("Batch Queue Processing");
      setIsUpgradeOpen(true);
      return;
    }
    if (batchItems.length === 0 || isBatchRunning) return;
    setIsBatchRunning(true);

    const updated = [...batchItems];
    for (let i = 0; i < updated.length; i++) {
      if (updated[i].status === "done") continue;
      updated[i].status = "processing";
      setBatchItems([...updated]);
      setBatchProgress(Math.round(((i + 1) / updated.length) * 100));

      try {
        const img = new Image();
        img.src = updated[i].originalUrl;
        await new Promise((res) => {
          img.onload = res;
        });

        const cutoutData = await removeBackgroundFromImg(img, 30, 2);
        const res = await fetch(cutoutData);
        const blob = await res.blob();

        updated[i].processedBlob = blob;
        updated[i].processedUrl = cutoutData;
        updated[i].status = "done";
      } catch (err: unknown) {
        const errorMsg = err instanceof Error ? err.message : "Failed";
        updated[i].status = "error";
        updated[i].error = errorMsg;
      }

      setBatchItems([...updated]);
    }
    setIsBatchRunning(false);
  };

  const downloadBatchZip = async () => {
    const zip = new JSZip();
    const folder = zip.folder("transparent_cutouts");
    let count = 0;

    batchItems.forEach((item) => {
      if (item.processedBlob) {
        const cleanName = item.name.replace(/\.[^/.]+$/, "") + "_cutout.png";
        folder?.file(cleanName, item.processedBlob);
        count++;
      }
    });

    if (count === 0) return alert("No processed items to zip yet.");

    const zipBlob = await zip.generateAsync({ type: "blob" });
    const url = URL.createObjectURL(zipBlob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `batch_background_cutouts_${Date.now()}.zip`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Hidden File Inputs */}
      <input
        ref={removerInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) setRemoverImage(URL.createObjectURL(file));
        }}
      />
      <input
        ref={removerCustomBgRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) {
            setRemoverCustomBg(URL.createObjectURL(file));
            setRemoverBgType("custom");
          }
        }}
      />
      <input
        ref={productInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) {
            const access = checkClientFeatureAccess("bg:product-showcase", isPro);
            if (!access.allowed) {
              setHighlightFeature("Product Showcase Studio");
              setIsUpgradeOpen(true);
              return;
            }
            incrementClientUsage("bg:product-showcase");
            setProductImage(URL.createObjectURL(file));
          }
        }}
      />
      <input
        ref={passportInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) setPassportImage(URL.createObjectURL(file));
        }}
      />
      <input
        ref={signatureInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) setSigImage(URL.createObjectURL(file));
        }}
      />
      <input
        ref={batchInputRef}
        type="file"
        multiple
        accept="image/*"
        className="hidden"
        onChange={handleBatchDrop}
      />

      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
        <Link href="/app" className="hover:text-blue-600 transition">
          Home
        </Link>
        <span>&rsaquo;</span>
        <span className="text-slate-800 font-semibold">Background Studio</span>
      </div>

      {/* Hero Header: Modern Glassmorphic Gradient */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-50/90 via-indigo-50/70 to-purple-50/80 backdrop-blur-xl border border-blue-200/80 p-6 sm:p-8 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        {/* Subtle Ambient Glow Orbs */}
        <div className="absolute -top-12 -right-12 w-56 h-56 rounded-full bg-gradient-to-br from-blue-400/20 via-indigo-400/15 to-purple-400/20 blur-2xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-44 h-44 rounded-full bg-gradient-to-tr from-sky-300/20 to-blue-400/15 blur-xl pointer-events-none" />

        <div className="relative z-10 space-y-2.5 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/80 backdrop-blur-md border border-blue-200/60 text-xs font-semibold text-blue-700 shadow-xs">
            <LuSparkles className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
            <span>Dedicated Studio Suites &bull; 100% Client-Side Neural Engine</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
            <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">Background</span> Studio
          </h1>
          <p className="text-sm text-slate-600 leading-relaxed font-normal">
            Separate AI-powered workflows tailored specifically for Product Sellers, Visa/Passport Applicants, Office Signature extraction, and Batch catalogs.
          </p>
        </div>

        {/* Feature Highlights Pill Box */}
        <div className="relative z-10 hidden lg:flex flex-col gap-2 bg-white/70 backdrop-blur-md border border-blue-100 rounded-2xl p-4 shadow-xs shrink-0 text-xs text-slate-700">
          <div className="flex items-center gap-2 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>Zero Server Uploads &bull; Private</span>
          </div>
          <div className="flex items-center gap-2 font-medium">
            <span className="w-2 h-2 rounded-full bg-blue-500"></span>
            <span>Sub-second Neural Matting</span>
          </div>
          <div className="flex items-center gap-2 font-medium">
            <span className="w-2 h-2 rounded-full bg-purple-500"></span>
            <span>Up to 4K Ultra-HD Crisp Export</span>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-3">
        {[
          { id: "remove", label: "1. AI Background Remover", icon: LuScissors },
          { id: "product", label: "2. Product Showcase Studio", icon: LuShoppingBag },
          { id: "passport", label: "3. Passport & Visa Photo Maker", icon: LuUserCheck },
          { id: "signature", label: "4. Signature & Stamp Extractor", icon: LuSignature },
          { id: "batch", label: "5. Batch Queue Processing", icon: LuLayers },
        ].map((tab) => {
          const Icon = tab.icon;
          const isProduct = tab.id === "product";
          const isBatch = tab.id === "batch";
          const prodAccess = isProduct ? checkClientFeatureAccess("bg:product-showcase", isPro) : null;

          return (
            <button
              key={tab.id}
              onClick={() => {
                if (isBatch && !isPro) {
                  setHighlightFeature("Batch Queue Processing");
                  setIsUpgradeOpen(true);
                  return;
                }
                setActiveTab(tab.id as typeof activeTab);
              }}
              className={`px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition ${
                activeTab === tab.id
                  ? "bg-blue-600 text-white shadow-xs"
                  : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
              {isProduct && !isPro && prodAccess && (
                <span className="text-[10px] px-1.5 py-0.5 rounded-full font-bold bg-amber-100 text-amber-800">
                  {prodAccess.remaining}/3 free
                </span>
              )}
              {isBatch && !isPro && (
                <span className="text-[10px] px-1.5 py-0.5 rounded-full font-bold bg-purple-100 text-purple-700 flex items-center gap-1">
                  <LuCrown className="w-3 h-3" /> PRO
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ========================================================= */}
      {/* TAB 1: AI REMOVER & REPLACER */}
      {/* ========================================================= */}
      {activeTab === "remove" && (
        <div className="space-y-6">
          {!removerImage ? (
            /* Dedicated Empty Upload State */
            <div className="bg-white border-2 border-dashed border-blue-200 rounded-3xl p-12 text-center flex flex-col items-center justify-center space-y-4 bg-blue-50/20">
              <div className="w-16 h-16 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center text-3xl shadow-xs">
                <LuScissors className="w-8 h-8 text-blue-600" />
              </div>
              <div className="max-w-md">
                <h3 className="font-bold text-slate-900 text-lg">AI Background Remover</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Upload any photo to automatically separate foreground subjects and export crisp transparent alpha PNGs or replace backgrounds.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => removerInputRef.current?.click()}
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs transition flex items-center gap-2"
                >
                  <LuUpload className="w-4 h-4" />
                  <span>Upload Image</span>
                </button>
                <button
                  onClick={() => setRemoverImage(SAMPLE_REMOVER_WATCH)}
                  className="px-5 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold shadow-xs transition"
                >
                  Try Sample Watch
                </button>
              </div>
              <span className="text-[11px] text-slate-400">Supports JPG, PNG, WEBP &bull; Max 20MB</span>
            </div>
          ) : (
            /* Active Editor */
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              <div className="lg:col-span-8 bg-white border border-slate-200 rounded-3xl p-5 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-slate-900 text-sm">Before & After Comparison</h3>
                    {removerProcessing && (
                      <span className="text-[11px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full font-semibold animate-pulse flex items-center gap-1">
                        <LuRefreshCw className="w-3 h-3 animate-spin" /> Processing...
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setRemoverImage(null)}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition"
                    >
                      <LuRotateCcw className="w-3.5 h-3.5" />
                      <span>Change Image</span>
                    </button>
                  </div>
                </div>

                {/* Before / After Slider */}
                <div className="relative h-[420px] rounded-2xl overflow-hidden border border-slate-200 select-none bg-[repeating-conic-gradient(#e2e8f0_0%_25%,#ffffff_0%_50%)] bg-[length:16px_16px]">
                  <div
                    className="absolute inset-0 overflow-hidden"
                    style={{ width: `${removerSliderPos}%` }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={removerImage}
                      alt="Original"
                      className="absolute top-0 left-0 max-w-none h-full w-full object-contain pointer-events-none"
                    />
                    <div className="absolute top-3 left-3 px-2.5 py-1 bg-black/70 backdrop-blur-md text-white text-[10px] font-bold rounded-lg uppercase tracking-wider">
                      Original
                    </div>
                  </div>

                  <div
                    className="absolute inset-0 overflow-hidden"
                    style={{ left: `${removerSliderPos}%` }}
                  >
                    <canvas
                      ref={removerCanvasRef}
                      className="absolute top-0 left-0 h-full w-full object-contain pointer-events-none"
                      style={{
                        transform: `translateX(-${removerSliderPos}%)`,
                        width: "100%",
                        height: "100%",
                      }}
                    />
                    <div className="absolute top-3 right-3 px-2.5 py-1 bg-blue-600 backdrop-blur-md text-white text-[10px] font-bold rounded-lg uppercase tracking-wider">
                      Background Removed
                    </div>
                  </div>

                  <div
                    className="absolute inset-y-0 w-1 bg-white shadow-xl cursor-ew-resize z-20"
                    style={{ left: `${removerSliderPos}%` }}
                  >
                    <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs shadow-lg border-2 border-white">
                      <LuArrowLeftRight className="w-4 h-4 text-white" />
                    </div>
                  </div>

                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={removerSliderPos}
                    onChange={(e) => setRemoverSliderPos(Number(e.target.value))}
                    className="absolute inset-0 opacity-0 cursor-ew-resize w-full h-full z-30"
                  />
                </div>

                {/* Backdrop presets */}
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <span className="text-xs font-bold text-slate-800">Backdrop Replacement:</span>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { id: "transparent", label: "Transparent Alpha", bg: "bg-slate-200" },
                      { id: "solid", label: "Solid White", bg: "bg-white border" },
                      { id: "gradient", label: "Studio Gradient", bg: "bg-gradient-to-r from-slate-200 to-slate-400" },
                      { id: "ai-marble", label: "Carrara Marble", bg: "bg-slate-100 border" },
                      { id: "ai-wood", label: "Oak Wood", bg: "bg-amber-700" },
                      { id: "ai-studio", label: "Showroom", bg: "bg-gradient-to-b from-white to-slate-300" },
                    ].map((b) => (
                      <button
                        key={b.id}
                        onClick={() => setRemoverBgType(b.id as typeof removerBgType)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition flex items-center gap-1.5 ${
                          removerBgType === b.id
                            ? "border-blue-600 bg-blue-50 text-blue-700 font-bold"
                            : "border-slate-200 hover:bg-slate-50 text-slate-700"
                        }`}
                      >
                        <span className={`w-3.5 h-3.5 rounded-md ${b.bg}`} />
                        <span>{b.label}</span>
                      </button>
                    ))}
                    <button
                      onClick={() => removerCustomBgRef.current?.click()}
                      className="px-3 py-1.5 rounded-xl text-xs font-medium border border-slate-200 hover:bg-slate-50 text-slate-700 flex items-center gap-1.5"
                    >
                      <LuImage className="w-3.5 h-3.5 text-blue-600" />
                      <span>Custom Photo</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Sidebar Tuning & Export */}
              <div className="lg:col-span-4 space-y-4">
                <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs space-y-4 text-xs">
                  <h4 className="font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                    <LuSlidersHorizontal className="w-3.5 h-3.5 text-blue-600" />
                    <span>Cutout Precision</span>
                  </h4>

                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-slate-600 mb-1">
                        <span>Tolerance</span>
                        <span className="font-mono font-bold text-slate-800">{removerTolerance}</span>
                      </div>
                      <input
                        type="range"
                        min="10"
                        max="80"
                        value={removerTolerance}
                        onChange={(e) => setRemoverTolerance(Number(e.target.value))}
                        className="w-full accent-blue-600"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between text-slate-600 mb-1">
                        <span>Edge Feathering</span>
                        <span className="font-mono font-bold text-slate-800">{removerFeather}px</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="6"
                        value={removerFeather}
                        onChange={(e) => setRemoverFeather(Number(e.target.value))}
                        className="w-full accent-blue-600"
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs space-y-4 text-xs">
                  <h4 className="font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                    <LuDownload className="w-3.5 h-3.5 text-blue-600" />
                    <span>Export Image</span>
                  </h4>

                  <div className="grid grid-cols-3 gap-2">
                    {(["png", "jpg", "webp"] as const).map((fmt) => (
                      <button
                        key={fmt}
                        onClick={() => {
                          setRemoverExportFormat(fmt);
                          if (fmt === "png") setRemoverBgType("transparent");
                          else if (removerBgType === "transparent") setRemoverBgType("solid");
                        }}
                        className={`py-2 rounded-xl font-bold uppercase transition ${
                          removerExportFormat === fmt
                            ? "bg-blue-600 text-white shadow-xs"
                            : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                        }`}
                      >
                        {fmt}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={() => downloadCanvasImage(removerCanvasRef.current, "background_cutout", removerExportFormat)}
                    className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold text-sm shadow-md transition flex items-center justify-center gap-2"
                  >
                    <LuDownload className="w-4 h-4" />
                    <span>Download {removerExportFormat.toUpperCase()}</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 2: PRODUCT SHOWCASE STUDIO (E-Commerce Centric) */}
      {/* ========================================================= */}
      {activeTab === "product" && (
        <div className="space-y-6">
          {!productImage ? (
            /* Dedicated Product Empty Upload State */
            <div className="bg-white border-2 border-dashed border-indigo-200 rounded-3xl p-12 text-center flex flex-col items-center justify-center space-y-4 bg-indigo-50/20">
              <div className="w-16 h-16 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center text-3xl shadow-xs">
                <LuShoppingBag className="w-8 h-8 text-indigo-600" />
              </div>
              <div className="max-w-md">
                <h3 className="font-bold text-slate-900 text-lg">Product Photo Studio</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Built specifically for Amazon, Shopify, and e-commerce sellers. Automatic background isolation, compliance pure white (255,255,255), grounding contact floor shadows, and promotional badges.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => {
                    const access = checkClientFeatureAccess("bg:product-showcase", isPro);
                    if (!access.allowed) {
                      setHighlightFeature("Product Showcase Studio");
                      setIsUpgradeOpen(true);
                      return;
                    }
                    productInputRef.current?.click();
                  }}
                  className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs transition flex items-center gap-2"
                >
                  <LuUpload className="w-4 h-4" />
                  <span>Upload Product Photo</span>
                </button>
                <button
                  onClick={() => {
                    const access = checkClientFeatureAccess("bg:product-showcase", isPro);
                    if (!access.allowed) {
                      setHighlightFeature("Product Showcase Studio");
                      setIsUpgradeOpen(true);
                      return;
                    }
                    incrementClientUsage("bg:product-showcase");
                    setProductImage(SAMPLE_PRODUCT_SNEAKER);
                  }}
                  className="px-5 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold shadow-xs transition"
                >
                  Try Sample Sneaker
                </button>
              </div>
              <span className="text-[11px] text-slate-400">Generates Amazon, Shopify, & Instagram ready product shots</span>
            </div>
          ) : (
            /* Active Product Staging Studio */
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              <div className="lg:col-span-8 bg-white border border-slate-200 rounded-3xl p-5 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                      <LuShoppingBag className="w-4 h-4 text-indigo-600" />
                      <span>E-Commerce Product Stage</span>
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      Standardized marketplace canvas with realistic ground shadow contact.
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setProductImage(null)}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition"
                    >
                      <LuRotateCcw className="w-3.5 h-3.5" />
                      <span>Change Product</span>
                    </button>
                  </div>
                </div>

                {/* Staging Canvas Viewport */}
                <div className="relative rounded-2xl overflow-hidden border border-slate-300 bg-slate-50 flex items-center justify-center p-4 min-h-[440px]">
                  <canvas
                    ref={productCanvasRef}
                    className="max-h-[420px] max-w-full shadow-lg rounded-xl border border-slate-200 bg-white"
                  />
                </div>

                {/* Marketplace Presets */}
                <div className="space-y-2 pt-2 border-t border-slate-100 text-xs">
                  <span className="font-bold text-slate-800">Marketplace Scene Preset:</span>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
                    {[
                      { id: "amazon-white", label: "Amazon White (100%)", class: "bg-white border" },
                      { id: "shopify-clean", label: "Shopify Showroom", class: "bg-slate-100 border" },
                      { id: "marble-counter", label: "Luxury Marble", class: "bg-slate-200" },
                      { id: "oak-table", label: "Oak Wood Table", class: "bg-amber-700 text-white" },
                      { id: "podium-glow", label: "Studio Podium", class: "bg-slate-700 text-white" },
                      { id: "dark-room", label: "Midnight Mood", class: "bg-slate-900 text-white" },
                    ].map((p) => (
                      <button
                        key={p.id}
                        onClick={() => setProductPreset(p.id as typeof productPreset)}
                        className={`p-2 rounded-xl text-center border transition ${
                          productPreset === p.id
                            ? "border-indigo-600 ring-2 ring-indigo-100 font-bold"
                            : "border-slate-200 hover:border-slate-300"
                        }`}
                      >
                        <div className={`w-full h-6 rounded-lg mb-1 ${p.class}`} />
                        <span className="text-[10px] text-slate-700 block truncate">{p.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Product Staging Controls Sidebar */}
              <div className="lg:col-span-4 space-y-4 text-xs">
                {/* Canvas Aspect Ratio */}
                <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs space-y-3">
                  <h4 className="font-bold text-slate-900 uppercase tracking-wider">Canvas Ratio</h4>
                  <div className="grid grid-cols-4 gap-1.5">
                    {(["1:1", "3:4", "4:5", "16:9"] as const).map((r) => (
                      <button
                        key={r}
                        onClick={() => setProductAspectRatio(r)}
                        className={`py-2 rounded-xl font-bold transition ${
                          productAspectRatio === r
                            ? "bg-indigo-600 text-white shadow-xs"
                            : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                        }`}
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                  <span className="text-[10px] text-slate-400 block">
                    {productAspectRatio === "1:1"
                      ? "Amazon / Square Catalog (1000x1000)"
                      : productAspectRatio === "3:4"
                      ? "Shopify Fashion (900x1200)"
                      : productAspectRatio === "4:5"
                      ? "Instagram / TikTok Feed"
                      : "Website Hero Banner"}
                  </span>
                </div>

                {/* Staging & Shadows */}
                <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs space-y-3">
                  <h4 className="font-bold text-slate-900 uppercase tracking-wider">Product Geometry & Grounding</h4>

                  <div>
                    <div className="flex justify-between text-slate-600 mb-1">
                      <span>Product Scale</span>
                      <span className="font-mono font-bold text-slate-800">{productScale}%</span>
                    </div>
                    <input
                      type="range"
                      min="55"
                      max="95"
                      value={productScale}
                      onChange={(e) => setProductScale(Number(e.target.value))}
                      className="w-full accent-indigo-600"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 font-medium mb-1">Grounding Floor Shadow</label>
                    <div className="grid grid-cols-2 gap-1.5">
                      {[
                        { id: "contact", label: "Contact Floor" },
                        { id: "reflection", label: "Mirror Gloss" },
                        { id: "directional", label: "Directional" },
                        { id: "none", label: "None" },
                      ].map((s) => (
                        <button
                          key={s.id}
                          onClick={() => setProductShadowType(s.id as typeof productShadowType)}
                          className={`py-2 rounded-xl text-[11px] font-semibold border ${
                            productShadowType === s.id
                              ? "border-indigo-600 bg-indigo-50 text-indigo-700 font-bold"
                              : "border-slate-200 text-slate-600 hover:bg-slate-50"
                          }`}
                        >
                          {s.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-600 font-medium mb-1">Promotional Badge</label>
                    <div className="grid grid-cols-2 gap-1.5">
                      {(["none", "SALE -20%", "BESTSELLER", "NEW ARRIVAL"] as const).map((b) => (
                        <button
                          key={b}
                          onClick={() => setProductBadge(b)}
                          className={`py-1.5 px-2 rounded-xl text-[10px] font-semibold truncate border ${
                            productBadge === b
                              ? "border-red-600 bg-red-50 text-red-700 font-bold"
                              : "border-slate-200 text-slate-600 hover:bg-slate-50"
                          }`}
                        >
                          {b === "none" ? "No Badge" : b}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Export Button */}
                <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs space-y-3">
                  <button
                    onClick={() => downloadCanvasImage(productCanvasRef.current, "product_showcase", "png")}
                    className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold text-sm shadow-md transition flex items-center justify-center gap-2"
                  >
                    <LuDownload className="w-4 h-4" />
                    <span>Download E-Commerce Image</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 3: PASSPORT PHOTO MAKER */}
      {/* ========================================================= */}
      {activeTab === "passport" && (
        <div className="space-y-6">
          {!passportImage ? (
            /* Dedicated Passport Empty Upload State */
            <div className="bg-white border-2 border-dashed border-sky-200 rounded-3xl p-12 text-center flex flex-col items-center justify-center space-y-4 bg-sky-50/20">
              <div className="w-16 h-16 rounded-2xl bg-sky-100 text-sky-600 flex items-center justify-center text-3xl shadow-xs">
                <LuUserCheck className="w-8 h-8 text-sky-600" />
              </div>
              <div className="max-w-md">
                <h3 className="font-bold text-slate-900 text-lg">Passport & Visa Photo Maker</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Upload a headshot portrait. Automatically removes background, applies government consular background colors, and generates printable 4x6&quot; photo sheets with cutting guides.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => passportInputRef.current?.click()}
                  className="px-6 py-2.5 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-bold shadow-xs transition flex items-center gap-2"
                >
                  <LuUpload className="w-4 h-4" />
                  <span>Upload Portrait Photo</span>
                </button>
                <button
                  onClick={() => setPassportImage(SAMPLE_PASSPORT_PORTRAIT)}
                  className="px-5 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold shadow-xs transition"
                >
                  Try Sample Portrait
                </button>
              </div>
              <span className="text-[11px] text-slate-400">US 2x2&quot;, Schengen 35x45mm, India 35x35mm at 300 DPI</span>
            </div>
          ) : (
            /* Active Passport Studio */
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              <div className="lg:col-span-8 bg-white border border-slate-200 rounded-3xl p-5 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                      <LuUserCheck className="w-4 h-4 text-sky-600" />
                      <span>Official Biometric Print Layout</span>
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      Standard 300 DPI photographic resolution ready for high-grade color photo paper.
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setPassportImage(null)}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition"
                    >
                      <LuRotateCcw className="w-3.5 h-3.5" />
                      <span>Change Portrait</span>
                    </button>
                  </div>
                </div>

                {/* Viewport */}
                <div className="relative rounded-2xl overflow-hidden border border-slate-300 bg-slate-100 flex items-center justify-center p-4 min-h-[420px]">
                  <canvas
                    ref={passportCanvasRef}
                    className="max-h-[420px] max-w-full shadow-lg rounded-xl border border-slate-200 bg-white"
                  />
                </div>

                <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-2xl text-blue-900 text-xs flex items-center gap-2">
                  <LuFileCheck className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>
                    Guidelines indicate ICAO crown and chin boundary requirements. Print at 100% scale without fit-to-page margins.
                  </span>
                </div>
              </div>

              {/* Passport Specs Sidebar */}
              <div className="lg:col-span-4 space-y-4 text-xs">
                <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs space-y-3">
                  <h4 className="font-bold text-slate-900 uppercase tracking-wider">Country Specifications</h4>
                  <div className="space-y-1.5">
                    {[
                      { id: "us", label: "US Passport / Visa (2 x 2 inches / 51x51mm)" },
                      { id: "schengen", label: "Schengen / EU / UK (35 x 45 mm)" },
                      { id: "india", label: "India Passport / OCI (35 x 35 mm)" },
                      { id: "canada", label: "Canada Passport (50 x 70 mm)" },
                    ].map((spec) => (
                      <button
                        key={spec.id}
                        onClick={() => setPassportStandard(spec.id as typeof passportStandard)}
                        className={`w-full text-left p-2.5 rounded-xl border transition text-xs ${
                          passportStandard === spec.id
                            ? "border-sky-600 bg-sky-50 text-sky-900 font-bold"
                            : "border-slate-200 hover:bg-slate-50 text-slate-700"
                        }`}
                      >
                        {spec.label}
                      </button>
                    ))}
                  </div>

                  <div>
                    <label className="block text-slate-600 font-medium mb-1">Official Background Color</label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { color: "#ffffff", label: "Pure White" },
                        { color: "#c8e0f4", label: "Consular Blue" },
                        { color: "#e2e8f0", label: "Light Grey" },
                      ].map((b) => (
                        <button
                          key={b.color}
                          onClick={() => setPassportBgTone(b.color as typeof passportBgTone)}
                          className={`py-2 px-1 text-center rounded-xl border text-xs font-semibold ${
                            passportBgTone === b.color ? "border-sky-600 ring-2 ring-sky-100" : "border-slate-200"
                          }`}
                          style={{ backgroundColor: b.color }}
                        >
                          <span className="text-slate-800 drop-shadow-xs">{b.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-600 font-medium mb-1">Print Layout</label>
                    <div className="grid grid-cols-3 gap-1.5">
                      {[
                        { id: "single", label: "Single" },
                        { id: "sheet6", label: "4x6\" (6)" },
                        { id: "sheet8", label: "4x6\" (8)" },
                      ].map((lay) => (
                        <button
                          key={lay.id}
                          onClick={() => setPassportSheetMode(lay.id as typeof passportSheetMode)}
                          className={`py-2 text-center rounded-xl border text-xs font-semibold ${
                            passportSheetMode === lay.id
                              ? "border-sky-600 bg-sky-600 text-white"
                              : "border-slate-200 text-slate-700 hover:bg-slate-50"
                          }`}
                        >
                          {lay.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-slate-600 mb-1">
                      <span>Face Scale Tuning</span>
                      <span className="font-mono font-bold text-slate-800">{passportHeadScale}%</span>
                    </div>
                    <input
                      type="range"
                      min="60"
                      max="95"
                      value={passportHeadScale}
                      onChange={(e) => setPassportHeadScale(Number(e.target.value))}
                      className="w-full accent-sky-600"
                    />
                  </div>

                  <label className="flex items-center gap-2 cursor-pointer pt-1 text-slate-700">
                    <input
                      type="checkbox"
                      checked={showBiometricLines}
                      onChange={(e) => setShowBiometricLines(e.target.checked)}
                      className="rounded text-sky-600 focus:ring-sky-500 w-4 h-4"
                    />
                    <span>Show Biometric Guide Overlay</span>
                  </label>
                </div>

                <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs">
                  <button
                    onClick={() => downloadCanvasImage(passportCanvasRef.current, "passport_print_sheet", "jpg")}
                    className="w-full py-3 bg-sky-600 hover:bg-sky-700 text-white rounded-2xl font-bold text-sm shadow-md transition flex items-center justify-center gap-2"
                  >
                    <LuDownload className="w-4 h-4" />
                    <span>Download Print Ready Sheet</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 4: SIGNATURE & STAMP CLEANUP */}
      {/* ========================================================= */}
      {activeTab === "signature" && (
        <div className="space-y-6">
          {!sigImage ? (
            /* Dedicated Signature Empty State */
            <div className="bg-white border-2 border-dashed border-emerald-200 rounded-3xl p-12 text-center flex flex-col items-center justify-center space-y-4 bg-emerald-50/20">
              <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center text-3xl shadow-xs">
                <LuSignature className="w-8 h-8 text-emerald-600" />
              </div>
              <div className="max-w-md">
                <h3 className="font-bold text-slate-900 text-lg">Signature & Stamp Background Extractor</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Clean backgrounds from smartphone photos or scans of handwritten signatures and company stamps. Removes shadows, wrinkles, and page tint — leaving crisp ink over 100% transparent PNG.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => signatureInputRef.current?.click()}
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition flex items-center gap-2"
                >
                  <LuUpload className="w-4 h-4" />
                  <span>Upload Signature / Stamp</span>
                </button>
                <button
                  onClick={() => {
                    setSigImage(SAMPLE_HANDWRITTEN_SIGNATURE);
                    setSigInkColor("black");
                  }}
                  className="px-5 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold shadow-xs transition"
                >
                  Try Sample Signature
                </button>
                <button
                  onClick={() => {
                    setSigImage(SAMPLE_OFFICIAL_STAMP);
                    setSigInkColor("red");
                  }}
                  className="px-5 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold shadow-xs transition"
                >
                  Try Sample Stamp
                </button>
              </div>
              <span className="text-[11px] text-slate-400">Perfect for PDF contracts, Word documents, & DocuSign</span>
            </div>
          ) : (
            /* Active Signature Cleaner */
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              <div className="lg:col-span-8 bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                      <LuSignature className="w-4 h-4 text-emerald-600" />
                      <span>Extracted Signature & Stamp Preview</span>
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      Isolated ink lines over transparent alpha channel.
                    </p>
                  </div>

                  <button
                    onClick={() => setSigImage(null)}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition"
                  >
                    <LuRotateCcw className="w-3.5 h-3.5" />
                    <span>Upload Another</span>
                  </button>
                </div>

                {/* Checkerboard Viewport */}
                <div className="relative rounded-2xl overflow-hidden border border-slate-300 bg-[repeating-conic-gradient(#e2e8f0_0%_25%,#ffffff_0%_50%)] bg-[length:16px_16px] flex items-center justify-center p-8 min-h-[320px]">
                  <canvas
                    ref={signatureCanvasRef}
                    className="max-h-[300px] max-w-full drop-shadow-md"
                  />
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                  <span className="text-xs text-slate-500">
                    Transparent PNG ready to copy or insert directly into contracts.
                  </span>

                  <div className="flex gap-2">
                    <button
                      onClick={async () => {
                        const canvas = signatureCanvasRef.current;
                        if (!canvas) return;
                        try {
                          canvas.toBlob(async (blob) => {
                            if (!blob) return;
                            await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
                            setSigCopied(true);
                            setTimeout(() => setSigCopied(false), 2500);
                          });
                        } catch {
                          alert("Transparent signature ready to download.");
                        }
                      }}
                      className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition"
                    >
                      {sigCopied ? (
                        <>
                          <LuCheck className="w-4 h-4 text-emerald-600" />
                          <span className="text-emerald-700 font-bold">Copied!</span>
                        </>
                      ) : (
                        <>
                          <LuCopy className="w-4 h-4 text-slate-600" />
                          <span>Copy to Clipboard</span>
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => downloadCanvasImage(signatureCanvasRef.current, "cleaned_signature", "png")}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition shadow-xs"
                    >
                      <LuDownload className="w-4 h-4" />
                      <span>Download Transparent PNG</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Signature Cleanup Tuning */}
              <div className="lg:col-span-4 space-y-4 text-xs">
                <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs space-y-4">
                  <h4 className="font-bold text-slate-900 uppercase tracking-wider">Cleanup Parameters</h4>

                  <div>
                    <div className="flex justify-between text-slate-600 mb-1">
                      <span>Paper Removal Threshold</span>
                      <span className="font-mono font-bold text-slate-800">{sigThreshold}</span>
                    </div>
                    <input
                      type="range"
                      min="110"
                      max="240"
                      value={sigThreshold}
                      onChange={(e) => setSigThreshold(Number(e.target.value))}
                      className="w-full accent-emerald-600"
                    />
                    <p className="text-[10px] text-slate-400 mt-1">
                      Drag right if background shadows still remain; drag left if ink strokes become too faint.
                    </p>
                  </div>

                  <div>
                    <label className="block text-slate-600 font-medium mb-1.5">Ink Color Tint</label>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { id: "black", label: "Jet Black", color: "bg-black text-white" },
                        { id: "navy", label: "Formal Navy", color: "bg-blue-950 text-white" },
                        { id: "royal", label: "Fountain Blue", color: "bg-blue-600 text-white" },
                        { id: "red", label: "Official Red Stamp", color: "bg-red-600 text-white" },
                        { id: "original", label: "Original Pen", color: "bg-slate-200 text-slate-800" },
                      ].map((ink) => (
                        <button
                          key={ink.id}
                          onClick={() => setSigInkColor(ink.id as typeof sigInkColor)}
                          className={`p-2 rounded-xl text-xs font-semibold text-center border transition ${
                            sigInkColor === ink.id ? "border-emerald-600 ring-2 ring-emerald-100" : "border-slate-200"
                          } ${ink.color}`}
                        >
                          {ink.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 5: BATCH PROCESSING QUEUE */}
      {/* ========================================================= */}
      {activeTab === "batch" && (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <LuLayers className="w-5 h-5 text-blue-600" />
                <span>Batch Catalog Background Removal</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Drop multiple product photos, process them simultaneously in the queue, and download a single organized ZIP package.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => {
                  if (!isPro) {
                    setHighlightFeature("Batch Queue Processing");
                    setIsUpgradeOpen(true);
                    return;
                  }
                  batchInputRef.current?.click();
                }}
                className="px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition"
              >
                <LuUpload className="w-3.5 h-3.5" />
                <span>Add Photos</span>
              </button>

              <button
                onClick={loadSampleBatch}
                className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition"
              >
                Load Sample Batch (4)
              </button>

              <button
                onClick={runBatchProcessing}
                disabled={batchItems.length === 0 || isBatchRunning}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition shadow-xs"
              >
                <LuZap className="w-3.5 h-3.5" />
                <span>{isBatchRunning ? "Processing..." : "Process Queue"}</span>
              </button>

              <button
                onClick={downloadBatchZip}
                disabled={!batchItems.some((i) => i.status === "done")}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition shadow-xs"
              >
                <LuFolderArchive className="w-3.5 h-3.5" />
                <span>Download All (.ZIP)</span>
              </button>

              {batchItems.length > 0 && (
                <button
                  onClick={() => setBatchItems([])}
                  className="px-3 py-2 bg-slate-100 hover:bg-red-50 hover:text-red-600 text-slate-600 rounded-xl text-xs transition"
                  title="Clear Queue"
                >
                  <LuTrash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Progress bar */}
          {isBatchRunning && (
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-medium text-slate-600">
                <span>Processing Queue Progress</span>
                <span className="font-mono">{batchProgress}%</span>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-600 transition-all duration-300"
                  style={{ width: `${batchProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Queue Cards */}
          {batchItems.length === 0 ? (
            <div
              onClick={() => {
                if (!isPro) {
                  setHighlightFeature("Batch Queue Processing");
                  setIsUpgradeOpen(true);
                  return;
                }
                batchInputRef.current?.click();
              }}
              className="border-2 border-dashed border-slate-200 rounded-3xl p-12 text-center flex flex-col items-center justify-center space-y-3 hover:border-blue-400 bg-slate-50/50 cursor-pointer transition"
            >
              <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center text-xl">
                <LuLayers className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h4 className="font-bold text-slate-800 text-sm">No items in the batch queue</h4>
                <p className="text-xs text-slate-400 mt-1">
                  Upload multiple product photos or click &quot;Load Sample Batch&quot; above to test.
                </p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {batchItems.map((item) => (
                <div
                  key={item.id}
                  className="border border-slate-200 rounded-2xl p-2.5 bg-white space-y-2 relative group"
                >
                  <div className="h-28 rounded-xl overflow-hidden bg-[repeating-conic-gradient(#e2e8f0_0%_25%,#ffffff_0%_50%)] bg-[length:12px_12px] flex items-center justify-center">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.processedUrl || item.originalUrl}
                      alt={item.name}
                      className="h-full w-full object-contain"
                    />
                  </div>

                  <div className="text-[11px] font-semibold text-slate-700 truncate">{item.name}</div>

                  <div className="flex items-center justify-between text-[10px]">
                    <span
                      className={`px-2 py-0.5 rounded-full font-bold uppercase ${
                        item.status === "done"
                          ? "bg-emerald-100 text-emerald-700"
                          : item.status === "processing"
                          ? "bg-blue-100 text-blue-700 animate-pulse"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {item.status}
                    </span>

                    {item.processedUrl && (
                      <a
                        href={item.processedUrl}
                        download={`${item.name}_cutout.png`}
                        className="text-blue-600 hover:text-blue-800 font-bold"
                      >
                        Save
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Razorpay Pro Upgrade Modal */}
      <UpgradeCheckoutModal
        isOpen={isUpgradeOpen}
        onClose={() => setIsUpgradeOpen(false)}
        highlightFeature={highlightFeature}
      />
    </div>
  );
}
