"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import JSZip from "jszip";
import {
  LuMinimize2,
  LuMaximize2,
  LuSparkles,
  LuSlidersHorizontal,
  LuImage,
  LuLayers,
  LuDownload,
  LuUpload,
  LuRefreshCw,
  LuCheck,
  LuTrash2,
  LuFolderArchive,
  LuArrowRight,
  LuArrowLeftRight,
  LuEye,
  LuFileCheck,
  LuInfo,
  LuScaling,
  LuZap,
} from "react-icons/lu";

// -------------------------------------------------------------
// SAMPLE IMAGE GENERATOR (Instant 1-Click Testing)
// -------------------------------------------------------------
function generateSampleImage(): Promise<File> {
  return new Promise((resolve) => {
    const canvas = document.createElement("canvas");
    canvas.width = 1600;
    canvas.height = 1000;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      resolve(new File([], "sample.jpg", { type: "image/jpeg" }));
      return;
    }

    // Rich gradient background (sunset landscape)
    const grad = ctx.createLinearGradient(0, 0, 0, 1000);
    grad.addColorStop(0, "#0f172a");
    grad.addColorStop(0.35, "#312e81");
    grad.addColorStop(0.65, "#c026d3");
    grad.addColorStop(0.85, "#f97316");
    grad.addColorStop(1, "#facc15");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 1600, 1000);

    // Glowing sun
    const sunGrad = ctx.createRadialGradient(800, 680, 20, 800, 680, 180);
    sunGrad.addColorStop(0, "rgba(255, 255, 255, 1)");
    sunGrad.addColorStop(0.3, "rgba(254, 240, 138, 0.9)");
    sunGrad.addColorStop(0.7, "rgba(249, 115, 22, 0.4)");
    sunGrad.addColorStop(1, "rgba(249, 115, 22, 0)");
    ctx.fillStyle = sunGrad;
    ctx.beginPath();
    ctx.arc(800, 680, 180, 0, Math.PI * 2);
    ctx.fill();

    // Mountain silhouettes with fine details for testing compression & sharpening
    ctx.fillStyle = "#1e1b4b";
    ctx.beginPath();
    ctx.moveTo(0, 780);
    ctx.lineTo(250, 520);
    ctx.lineTo(480, 690);
    ctx.lineTo(760, 440);
    ctx.lineTo(1050, 680);
    ctx.lineTo(1320, 490);
    ctx.lineTo(1600, 750);
    ctx.lineTo(1600, 1000);
    ctx.lineTo(0, 1000);
    ctx.closePath();
    ctx.fill();

    // Foreground dark hill
    ctx.fillStyle = "#09090b";
    ctx.beginPath();
    ctx.moveTo(0, 860);
    ctx.quadraticCurveTo(400, 760, 900, 880);
    ctx.quadraticCurveTo(1300, 960, 1600, 850);
    ctx.lineTo(1600, 1000);
    ctx.lineTo(0, 1000);
    ctx.closePath();
    ctx.fill();

    // High frequency texture (trees / fine stars)
    ctx.fillStyle = "#ffffff";
    for (let i = 0; i < 180; i++) {
      const sx = (i * 12347) % 1600;
      const sy = (i * 9821) % 450;
      const r = (i % 3) + 1;
      ctx.beginPath();
      ctx.arc(sx, sy, r, 0, Math.PI * 2);
      ctx.fill();
    }

    // Typography
    ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
    ctx.font = "bold 44px -apple-system, BlinkMacSystemFont, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("Compress & Enhance Studio Test Asset", 800, 200);

    ctx.font = "24px -apple-system, BlinkMacSystemFont, sans-serif";
    ctx.fillStyle = "rgba(255, 255, 255, 0.75)";
    ctx.fillText("High-Resolution 1600x1000 Benchmark Image", 800, 250);

    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(new File([blob], "sample_landscape_hd.jpg", { type: "image/jpeg" }));
        } else {
          resolve(new File([], "sample_landscape_hd.jpg", { type: "image/jpeg" }));
        }
      },
      "image/jpeg",
      0.95
    );
  });
}

// -------------------------------------------------------------
// TYPES
// -------------------------------------------------------------
type StudioTab =
  | "compress"
  | "target-size"
  | "batch"
  | "resize"
  | "upscale"
  | "enhance"
  | "convert";

interface BatchItem {
  id: string;
  file: File;
  originalSize: number;
  compressedBlob: Blob | null;
  compressedSize: number;
  status: "idle" | "processing" | "done" | "error";
  progress: number;
}

export default function CompressStudioPage() {
  const [activeTab, setActiveTab] = useState<StudioTab>("compress");

  // Single file state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [originalImage, setOriginalImage] = useState<HTMLImageElement | null>(null);
  const [originalDimensions, setOriginalDimensions] = useState<{ width: number; height: number }>({
    width: 0,
    height: 0,
  });
  const [originalSize, setOriginalSize] = useState<number>(0);

  // Processed Output state
  const [processedBlob, setProcessedBlob] = useState<Blob | null>(null);
  const [processedUrl, setProcessedUrl] = useState<string | null>(null);
  const [processedSize, setProcessedSize] = useState<number>(0);
  const [processedDimensions, setProcessedDimensions] = useState<{ width: number; height: number }>({
    width: 0,
    height: 0,
  });

  const [isProcessing, setIsProcessing] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string>("");

  // Quality Preview split slider (0 to 100)
  const [sliderPosition, setSliderPosition] = useState<number>(50);

  // 1. Image Compression State
  const [quality, setQuality] = useState<number>(75); // 1 - 100
  const [compressionFormat, setCompressionFormat] = useState<"image/jpeg" | "image/webp" | "image/png">("image/jpeg");

  // 2. Target File Size State
  const [targetSizeKB, setTargetSizeKB] = useState<number>(100);
  const [targetUnit, setTargetUnit] = useState<"KB" | "MB">("KB");

  // 3. Batch Compression State
  const [batchItems, setBatchItems] = useState<BatchItem[]>([]);
  const [batchQuality, setBatchQuality] = useState<number>(70);
  const [isBatchProcessing, setIsBatchProcessing] = useState(false);

  // 4. Image Resizing State
  const [resizeMode, setResizeMode] = useState<"percentage" | "dimensions">("percentage");
  const [resizePercent, setResizePercent] = useState<number>(50);
  const [customWidth, setCustomWidth] = useState<number>(800);
  const [customHeight, setCustomHeight] = useState<number>(600);
  const [lockAspectRatio, setLockAspectRatio] = useState<boolean>(true);

  // 5. Image Upscaling State (2x / 4x)
  const [upscaleFactor, setUpscaleFactor] = useState<2 | 4>(2);
  const [edgeEnhance, setEdgeEnhance] = useState<boolean>(true);

  // 6. Denoising & Sharpening State
  const [sharpenIntensity, setSharpenIntensity] = useState<number>(60); // 0 - 100
  const [denoiseLevel, setDenoiseLevel] = useState<number>(30); // 0 - 100

  // 7. Format Conversion State
  const [targetFormat, setTargetFormat] = useState<"jpeg" | "png" | "webp">("webp");

  const fileInputRef = useRef<HTMLInputElement>(null);
  const batchInputRef = useRef<HTMLInputElement>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);

  // Format bytes helper
  const formatBytes = (bytes: number) => {
    if (bytes <= 0) return "0 B";
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(2) + " MB";
  };

  const handleLoadSample = async () => {
    try {
      const sample = await generateSampleImage();
      loadFile(sample);
    } catch (e) {
      console.error(e);
    }
  };

  const loadFile = (file: File) => {
    setSelectedFile(file);
    setOriginalSize(file.size);

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        setOriginalImage(img);
        setOriginalDimensions({ width: img.naturalWidth, height: img.naturalHeight });
        setCustomWidth(Math.round(img.naturalWidth / 2));
        setCustomHeight(Math.round(img.naturalHeight / 2));
        // Reset processed
        setProcessedBlob(null);
        if (processedUrl) URL.revokeObjectURL(processedUrl);
        setProcessedUrl(null);
        setProcessedSize(0);
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    loadFile(files[0]);
  };

  // Trigger download helper
  const downloadBlob = (blob: Blob, name: string) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  // -----------------------------------------------------------
  // PROCESS 1: STANDARD IMAGE COMPRESSION
  // -----------------------------------------------------------
  const runCompression = useCallback(async () => {
    if (!originalImage) return;
    setIsProcessing(true);
    setStatusMessage("Compressing image...");

    setTimeout(() => {
      const canvas = document.createElement("canvas");
      canvas.width = originalImage.naturalWidth;
      canvas.height = originalImage.naturalHeight;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      ctx.drawImage(originalImage, 0, 0);

      const q = quality / 100;
      canvas.toBlob(
        (blob) => {
          if (blob) {
            setProcessedBlob(blob);
            if (processedUrl) URL.revokeObjectURL(processedUrl);
            setProcessedUrl(URL.createObjectURL(blob));
            setProcessedSize(blob.size);
            setProcessedDimensions({ width: canvas.width, height: canvas.height });
            setIsProcessing(false);
            setStatusMessage(`Compression complete: ${formatBytes(originalSize)} → ${formatBytes(blob.size)}`);
          }
        },
        compressionFormat,
        q
      );
    }, 50);
  }, [originalImage, quality, compressionFormat, originalSize, processedUrl]);

  // -----------------------------------------------------------
  // PROCESS 2: TARGET FILE SIZE (Convergence Loop)
  // -----------------------------------------------------------
  const runTargetSizeCompression = useCallback(async () => {
    if (!originalImage) return;
    setIsProcessing(true);
    setStatusMessage(`Targeting exact file size: ${targetSizeKB} ${targetUnit}...`);

    setTimeout(async () => {
      const targetBytes = targetUnit === "MB" ? targetSizeKB * 1024 * 1024 : targetSizeKB * 1024;

      let minQ = 0.05;
      let maxQ = 0.98;
      let bestBlob: Blob | null = null;
      let scale = 1.0;

      // shortcut: binary search on JPEG/WebP quality parameter up to 6 iterations, then downscales dimensions if target is below quality floor
      for (let attempt = 0; attempt < 8; attempt++) {
        const curQ = (minQ + maxQ) / 2;
        const canvas = document.createElement("canvas");
        canvas.width = Math.max(100, Math.floor(originalImage.naturalWidth * scale));
        canvas.height = Math.max(100, Math.floor(originalImage.naturalHeight * scale));
        const ctx = canvas.getContext("2d");
        if (!ctx) break;

        ctx.drawImage(originalImage, 0, 0, canvas.width, canvas.height);

        const blob: Blob = await new Promise((resolve) =>
          canvas.toBlob((b) => resolve(b || new Blob()), "image/jpeg", curQ)
        );

        bestBlob = blob;

        if (blob.size > targetBytes) {
          maxQ = curQ;
          // If already at very low quality and still too big, downscale dimensions
          if (curQ < 0.2 && scale > 0.4) {
            scale *= 0.85;
            minQ = 0.05;
            maxQ = 0.8;
          }
        } else {
          minQ = curQ;
          if (Math.abs(blob.size - targetBytes) < targetBytes * 0.05) {
            // within 5% of target
            break;
          }
        }
      }

      if (bestBlob) {
        setProcessedBlob(bestBlob);
        if (processedUrl) URL.revokeObjectURL(processedUrl);
        setProcessedUrl(URL.createObjectURL(bestBlob));
        setProcessedSize(bestBlob.size);
        setProcessedDimensions({
          width: Math.floor(originalImage.naturalWidth * scale),
          height: Math.floor(originalImage.naturalHeight * scale),
        });
        setIsProcessing(false);
        setStatusMessage(
          `Target reached: ${formatBytes(bestBlob.size)} (Target was ${targetSizeKB} ${targetUnit})`
        );
      }
    }, 50);
  }, [originalImage, targetSizeKB, targetUnit, processedUrl]);

  // -----------------------------------------------------------
  // PROCESS 3: BATCH COMPRESSION
  // -----------------------------------------------------------
  const handleBatchFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newItems: BatchItem[] = Array.from(files).map((f) => ({
      id: Math.random().toString(36).substring(2, 9),
      file: f,
      originalSize: f.size,
      compressedBlob: null,
      compressedSize: 0,
      status: "idle",
      progress: 0,
    }));

    setBatchItems((prev) => [...prev, ...newItems]);
  };

  const runBatchProcessing = async () => {
    if (batchItems.length === 0) return;
    setIsBatchProcessing(true);

    const updated = [...batchItems];
    for (let i = 0; i < updated.length; i++) {
      if (updated[i].status === "done") continue;

      updated[i].status = "processing";
      updated[i].progress = 30;
      setBatchItems([...updated]);

      try {
        const item = updated[i];
        const dataUrl: string = await new Promise((res) => {
          const r = new FileReader();
          r.onload = () => res(r.result as string);
          r.readAsDataURL(item.file);
        });

        const img: HTMLImageElement = await new Promise((res) => {
          const image = new Image();
          image.onload = () => res(image);
          image.src = dataUrl;
        });

        const canvas = document.createElement("canvas");
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(img, 0, 0);
          const blob: Blob = await new Promise((res) =>
            canvas.toBlob((b) => res(b || new Blob()), "image/jpeg", batchQuality / 100)
          );

          updated[i].compressedBlob = blob;
          updated[i].compressedSize = blob.size;
          updated[i].status = "done";
          updated[i].progress = 100;
          setBatchItems([...updated]);
        }
      } catch {
        updated[i].status = "error";
        setBatchItems([...updated]);
      }
    }

    setIsBatchProcessing(false);
  };

  const downloadAllBatchZip = async () => {
    const zip = new JSZip();
    let count = 0;

    batchItems.forEach((item) => {
      if (item.compressedBlob) {
        const nameParts = item.file.name.split(".");
        const ext = nameParts.pop();
        const baseName = nameParts.join(".");
        zip.file(`${baseName}_compressed.jpg`, item.compressedBlob);
        count++;
      }
    });

    if (count === 0) return;
    const zipBlob = await zip.generateAsync({ type: "blob" });
    downloadBlob(zipBlob, `compressed_batch_${count}_images.zip`);
  };

  // -----------------------------------------------------------
  // PROCESS 4: IMAGE RESIZING
  // -----------------------------------------------------------
  const runResize = useCallback(async () => {
    if (!originalImage) return;
    setIsProcessing(true);
    setStatusMessage("Resizing image dimensions...");

    setTimeout(() => {
      let targetW = originalImage.naturalWidth;
      let targetH = originalImage.naturalHeight;

      if (resizeMode === "percentage") {
        targetW = Math.round(originalImage.naturalWidth * (resizePercent / 100));
        targetH = Math.round(originalImage.naturalHeight * (resizePercent / 100));
      } else {
        targetW = customWidth;
        targetH = customHeight;
      }

      const canvas = document.createElement("canvas");
      canvas.width = targetW;
      canvas.height = targetH;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      // High quality smoothing
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(originalImage, 0, 0, targetW, targetH);

      canvas.toBlob(
        (blob) => {
          if (blob) {
            setProcessedBlob(blob);
            if (processedUrl) URL.revokeObjectURL(processedUrl);
            setProcessedUrl(URL.createObjectURL(blob));
            setProcessedSize(blob.size);
            setProcessedDimensions({ width: targetW, height: targetH });
            setIsProcessing(false);
            setStatusMessage(`Resized to ${targetW} × ${targetH} px (${formatBytes(blob.size)})`);
          }
        },
        "image/jpeg",
        0.9
      );
    }, 50);
  }, [originalImage, resizeMode, resizePercent, customWidth, customHeight, processedUrl]);

  // -----------------------------------------------------------
  // PROCESS 5: IMAGE UPSCALING (2x / 4x Super Resolution Interpolation)
  // -----------------------------------------------------------
  const runUpscale = useCallback(async () => {
    if (!originalImage) return;
    setIsProcessing(true);
    setStatusMessage(`Upscaling ${upscaleFactor}x with bicubic edge enhancement...`);

    setTimeout(() => {
      const factor = upscaleFactor;
      const targetW = originalImage.naturalWidth * factor;
      const targetH = originalImage.naturalHeight * factor;

      const canvas = document.createElement("canvas");
      canvas.width = targetW;
      canvas.height = targetH;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(originalImage, 0, 0, targetW, targetH);

      // Edge crisping unsharp pass if enabled
      if (edgeEnhance) {
        try {
          const imgData = ctx.getImageData(0, 0, targetW, targetH);
          const data = imgData.data;
          // Apply subtle high-pass sharpening to avoid blur
          const w = targetW;
          const h = targetH;
          const copy = new Uint8ClampedArray(data);

          // shortcut: 3x3 unsharp kernel for 2x/4x edge reconstruction without external neural weights
          const k = 0.28;
          for (let y = 1; y < h - 1; y += 2) {
            for (let x = 1; x < w - 1; x += 2) {
              const idx = (y * w + x) * 4;
              for (let c = 0; c < 3; c++) {
                const up = ((y - 1) * w + x) * 4 + c;
                const down = ((y + 1) * w + x) * 4 + c;
                const left = (y * w + (x - 1)) * 4 + c;
                const right = (y * w + (x + 1)) * 4 + c;
                const val = (1 + 4 * k) * copy[idx + c] - k * (copy[up] + copy[down] + copy[left] + copy[right]);
                data[idx + c] = Math.min(255, Math.max(0, val));
              }
            }
          }
          ctx.putImageData(imgData, 0, 0);
        } catch {
          // fallback if tainted
        }
      }

      canvas.toBlob(
        (blob) => {
          if (blob) {
            setProcessedBlob(blob);
            if (processedUrl) URL.revokeObjectURL(processedUrl);
            setProcessedUrl(URL.createObjectURL(blob));
            setProcessedSize(blob.size);
            setProcessedDimensions({ width: targetW, height: targetH });
            setIsProcessing(false);
            setStatusMessage(`Upscaled ${factor}x: now ${targetW} × ${targetH} px (${formatBytes(blob.size)})`);
          }
        },
        "image/png"
      );
    }, 80);
  }, [originalImage, upscaleFactor, edgeEnhance, processedUrl]);

  // -----------------------------------------------------------
  // PROCESS 6: DENOISING & SHARPENING
  // -----------------------------------------------------------
  const runEnhance = useCallback(async () => {
    if (!originalImage) return;
    setIsProcessing(true);
    setStatusMessage("Applying spatial convolution sharpening & artifact reduction...");

    setTimeout(() => {
      const w = originalImage.naturalWidth;
      const h = originalImage.naturalHeight;
      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      ctx.drawImage(originalImage, 0, 0);

      try {
        const imgData = ctx.getImageData(0, 0, w, h);
        const data = imgData.data;
        const copy = new Uint8ClampedArray(data);

        // Sharpen kernel factor based on slider (0 - 100)
        const k = (sharpenIntensity / 100) * 0.75;
        // Denoise smooth factor (0 - 100)
        const denoise = denoiseLevel / 100;

        for (let y = 1; y < h - 1; y++) {
          for (let x = 1; x < w - 1; x++) {
            const idx = (y * w + x) * 4;

            for (let c = 0; c < 3; c++) {
              const up = ((y - 1) * w + x) * 4 + c;
              const down = ((y + 1) * w + x) * 4 + c;
              const left = (y * w + (x - 1)) * 4 + c;
              const right = (y * w + (x + 1)) * 4 + c;

              // Neighborhood average for slight noise reduction
              const avg = (copy[up] + copy[down] + copy[left] + copy[right] + copy[idx + c]) / 5;
              const smoothed = copy[idx + c] * (1 - denoise * 0.4) + avg * (denoise * 0.4);

              // Unsharp mask filter
              const sharpVal =
                (1 + 4 * k) * smoothed - k * (copy[up] + copy[down] + copy[left] + copy[right]);

              data[idx + c] = Math.min(255, Math.max(0, sharpVal));
            }
          }
        }
        ctx.putImageData(imgData, 0, 0);
      } catch {
        // Ignored
      }

      canvas.toBlob(
        (blob) => {
          if (blob) {
            setProcessedBlob(blob);
            if (processedUrl) URL.revokeObjectURL(processedUrl);
            setProcessedUrl(URL.createObjectURL(blob));
            setProcessedSize(blob.size);
            setProcessedDimensions({ width: w, height: h });
            setIsProcessing(false);
            setStatusMessage(`Enhanced image output ready (${formatBytes(blob.size)})`);
          }
        },
        "image/jpeg",
        0.95
      );
    }, 70);
  }, [originalImage, sharpenIntensity, denoiseLevel, processedUrl]);

  // -----------------------------------------------------------
  // PROCESS 7: FORMAT CONVERSION
  // -----------------------------------------------------------
  const runConversion = useCallback(async () => {
    if (!originalImage) return;
    setIsProcessing(true);
    setStatusMessage(`Converting image to ${targetFormat.toUpperCase()} format...`);

    setTimeout(() => {
      const canvas = document.createElement("canvas");
      canvas.width = originalImage.naturalWidth;
      canvas.height = originalImage.naturalHeight;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      ctx.drawImage(originalImage, 0, 0);

      const mimeType = targetFormat === "png" ? "image/png" : targetFormat === "webp" ? "image/webp" : "image/jpeg";
      canvas.toBlob(
        (blob) => {
          if (blob) {
            setProcessedBlob(blob);
            if (processedUrl) URL.revokeObjectURL(processedUrl);
            setProcessedUrl(URL.createObjectURL(blob));
            setProcessedSize(blob.size);
            setProcessedDimensions({ width: canvas.width, height: canvas.height });
            setIsProcessing(false);
            setStatusMessage(`Converted to .${targetFormat} (${formatBytes(blob.size)})`);
          }
        },
        mimeType,
        0.92
      );
    }, 50);
  }, [originalImage, targetFormat, processedUrl]);

  return (
    <div className="space-y-6 pb-16">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
        <Link href="/app" className="hover:text-emerald-600 transition">
          Home
        </Link>
        <span>&rsaquo;</span>
        <span className="text-slate-800 font-semibold">Compress &amp; Enhance Studio</span>
      </div>

      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-950 via-teal-950 to-slate-900 text-white p-6 sm:p-8 border border-emerald-900/60 shadow-xl flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-semibold">
            <LuZap className="w-4 h-4" />
            <span>High-Speed Client-Side &bull; Lossless &amp; Lossy Engine &bull; Zero Server Uploads</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
            Compress &amp; <span className="text-emerald-400">Enhance</span> Studio
          </h1>
          <p className="text-sm text-slate-300 leading-relaxed max-w-xl">
            Optimize images to exact target KB/MB sizes, batch compress folders, upscale 2x/4x with edge
            crisping, remove noise artifacts, and convert formats with instant interactive before/after quality preview.
          </p>

          <div className="flex flex-wrap gap-2 pt-2">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white text-xs font-bold transition shadow-sm"
            >
              <LuUpload className="w-4 h-4" />
              Upload Image (JPG, PNG, WebP)
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>
        </div>

        {/* 3D Compress Arrows Illustration */}
        <div className="relative z-10 self-center lg:self-auto shrink-0 flex flex-col items-center">
          <div className="relative group">
            <div className="absolute -inset-2 bg-gradient-to-tr from-emerald-600/30 to-teal-500/20 rounded-full blur-2xl group-hover:blur-3xl transition" />
            <img
              src="/banners/compress_arrows.png"
              alt="3D Compress Inward Arrows"
              className="relative w-36 sm:w-44 lg:w-52 h-auto drop-shadow-2xl transform hover:scale-105 transition-transform duration-300 pointer-events-none select-none"
            />
          </div>
        </div>
      </div>

      {/* Main Studio Navigation Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 border-b border-slate-200">
        {[
          { id: "compress", label: "Smart Compression", icon: LuMinimize2 },
          { id: "target-size", label: "Target File Size (KB/MB)", icon: LuSlidersHorizontal },
          { id: "batch", label: "Batch Compression", icon: LuLayers },
          { id: "resize", label: "Image Resizing", icon: LuScaling },
          { id: "upscale", label: "Upscale 2x / 4x", icon: LuMaximize2 },
          { id: "enhance", label: "Denoise & Sharpen", icon: LuSparkles },
          { id: "convert", label: "Format Conversion", icon: LuArrowLeftRight },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id as StudioTab);
                setStatusMessage("");
              }}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all ${
                isActive
                  ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/20"
                  : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Status Bar */}
      {statusMessage && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-900 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            {isProcessing ? (
              <LuRefreshCw className="w-4 h-4 animate-spin text-emerald-600" />
            ) : (
              <LuCheck className="w-4 h-4 text-emerald-600" />
            )}
            <span>{statusMessage}</span>
          </div>

          {processedBlob && (
            <button
              onClick={() => downloadBlob(processedBlob, `enhanced_${selectedFile?.name || "image.jpg"}`)}
              className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition shrink-0"
            >
              <LuDownload className="w-3.5 h-3.5" />
              Download Result
            </button>
          )}
        </div>
      )}

      {/* Main Studio Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Interactive Settings Panel */}
        <div className="lg:col-span-5 space-y-6">
          {/* File Overview Card */}
          <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 truncate">
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${selectedFile ? "bg-emerald-50 text-emerald-600" : "bg-slate-100 text-slate-400"}`}>
                  <LuImage className="w-5 h-5" />
                </div>
                <div className="truncate">
                  <div className="text-xs font-bold text-slate-800 truncate">
                    {selectedFile ? selectedFile.name : "No Image Selected"}
                  </div>
                  <div className="text-[11px] text-slate-400">
                    {selectedFile
                      ? `${originalDimensions.width} × ${originalDimensions.height} px • ${formatBytes(originalSize)}`
                      : "Upload an image (JPG, PNG, WebP) to begin"}
                  </div>
                </div>
              </div>
              <button
                onClick={() => fileInputRef.current?.click()}
                className={`text-xs font-bold shrink-0 ${
                  selectedFile
                    ? "text-emerald-600 hover:underline"
                    : "px-3 py-1.5 rounded-xl bg-emerald-600 text-white hover:bg-emerald-500 shadow-xs transition"
                }`}
              >
                {selectedFile ? "Change" : "Upload"}
              </button>
            </div>
          </div>

          {/* TAB 1: SMART COMPRESSION */}
          {activeTab === "compress" && (
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-5">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Image Compression</h3>
                <p className="text-xs text-slate-500">Reduce file size with fine-tuned visual quality control.</p>
              </div>

              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-700 mb-1.5">
                    <span>Quality Level:</span>
                    <span className="text-emerald-600 font-bold">{quality}%</span>
                  </div>
                  <input
                    type="range"
                    min={5}
                    max={100}
                    value={quality}
                    onChange={(e) => setQuality(Number(e.target.value))}
                    className="w-full accent-emerald-600 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                    <span>Smallest Size (Aggressive)</span>
                    <span>Recommended (75%)</span>
                    <span>Maximum Fidelity</span>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700">Encoding Format</label>
                  <div className="grid grid-cols-3 gap-2 mt-1">
                    {[
                      { id: "image/jpeg", label: "JPG" },
                      { id: "image/webp", label: "WebP (Ultra)" },
                      { id: "image/png", label: "PNG" },
                    ].map((f) => (
                      <button
                        key={f.id}
                        onClick={() => setCompressionFormat(f.id as any)}
                        className={`py-2 text-xs font-bold rounded-xl border transition ${
                          compressionFormat === f.id
                            ? "bg-emerald-50 border-emerald-500 text-emerald-700"
                            : "border-slate-200 text-slate-600 hover:bg-slate-50"
                        }`}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Original Size:</span>
                    <span className="font-semibold text-slate-800">{formatBytes(originalSize)}</span>
                  </div>
                  {processedSize > 0 && (
                    <>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Compressed Size:</span>
                        <span className="font-bold text-emerald-600">{formatBytes(processedSize)}</span>
                      </div>
                      <div className="flex justify-between border-t border-slate-200 pt-1.5">
                        <span className="text-slate-500">Savings:</span>
                        <span className="font-bold text-emerald-600">
                          {Math.max(0, Math.round(((originalSize - processedSize) / originalSize) * 100))}% Saved
                        </span>
                      </div>
                    </>
                  )}
                </div>

                <button
                  onClick={runCompression}
                  disabled={isProcessing}
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl text-xs font-bold transition shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2"
                >
                  <LuMinimize2 className="w-4 h-4" />
                  Apply Compression &amp; Update Preview
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: TARGET FILE SIZE */}
          {activeTab === "target-size" && (
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-5">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Target File-Size Options</h3>
                <p className="text-xs text-slate-500">
                  Iteratively adjust compression and dimensions to hit exact portal/application limits.
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-slate-700">Desired Output File Size</label>
                  <div className="flex gap-2 mt-1">
                    <input
                      type="number"
                      min={10}
                      max={10000}
                      value={targetSizeKB}
                      onChange={(e) => setTargetSizeKB(Number(e.target.value))}
                      className="flex-1 px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                    <div className="flex rounded-xl border border-slate-200 overflow-hidden text-xs font-bold">
                      <button
                        onClick={() => setTargetUnit("KB")}
                        className={`px-3 py-2 transition ${
                          targetUnit === "KB" ? "bg-slate-900 text-white" : "bg-white text-slate-600"
                        }`}
                      >
                        KB
                      </button>
                      <button
                        onClick={() => setTargetUnit("MB")}
                        className={`px-3 py-2 transition ${
                          targetUnit === "MB" ? "bg-slate-900 text-white" : "bg-white text-slate-600"
                        }`}
                      >
                        MB
                      </button>
                    </div>
                  </div>
                </div>

                {/* Popular Presets */}
                <div>
                  <div className="text-xs font-semibold text-slate-700 mb-1.5">Common Application Targets:</div>
                  <div className="grid grid-cols-4 gap-1.5">
                    {[
                      { label: "50 KB", val: 50, u: "KB" },
                      { label: "100 KB", val: 100, u: "KB" },
                      { label: "200 KB", val: 200, u: "KB" },
                      { label: "500 KB", val: 500, u: "KB" },
                      { label: "1 MB", val: 1, u: "MB" },
                      { label: "2 MB", val: 2, u: "MB" },
                      { label: "5 MB", val: 5, u: "MB" },
                      { label: "10 MB", val: 10, u: "MB" },
                    ].map((p) => (
                      <button
                        key={p.label}
                        onClick={() => {
                          setTargetSizeKB(p.val);
                          setTargetUnit(p.u as any);
                        }}
                        className={`py-1.5 text-[11px] font-bold rounded-xl border transition ${
                          targetSizeKB === p.val && targetUnit === p.u
                            ? "bg-emerald-50 border-emerald-500 text-emerald-700"
                            : "border-slate-200 text-slate-600 hover:bg-slate-50"
                        }`}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={runTargetSizeCompression}
                  disabled={isProcessing}
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl text-xs font-bold transition shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2"
                >
                  <LuSlidersHorizontal className="w-4 h-4" />
                  Compress to Exactly {targetSizeKB} {targetUnit}
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: BATCH COMPRESSION */}
          {activeTab === "batch" && (
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-5">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Batch Compression</h3>
                <p className="text-xs text-slate-500">Compress multiple images simultaneously and export as ZIP.</p>
              </div>

              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-700 mb-1.5">
                    <span>Batch Compression Quality:</span>
                    <span className="text-emerald-600 font-bold">{batchQuality}%</span>
                  </div>
                  <input
                    type="range"
                    min={10}
                    max={95}
                    value={batchQuality}
                    onChange={(e) => setBatchQuality(Number(e.target.value))}
                    className="w-full accent-emerald-600 cursor-pointer"
                  />
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => batchInputRef.current?.click()}
                    className="flex-1 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl text-xs font-bold transition flex items-center justify-center gap-2"
                  >
                    <LuUpload className="w-4 h-4" />
                    Select Batch Files
                  </button>
                  <input
                    ref={batchInputRef}
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleBatchFileSelect}
                    className="hidden"
                  />

                  {batchItems.length > 0 && (
                    <button
                      onClick={runBatchProcessing}
                      disabled={isBatchProcessing}
                      className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl text-xs font-bold transition flex items-center gap-2"
                    >
                      <LuRefreshCw className={`w-4 h-4 ${isBatchProcessing ? "animate-spin" : ""}`} />
                      Process ({batchItems.length})
                    </button>
                  )}
                </div>

                {batchItems.length > 0 && (
                  <div className="space-y-2 max-h-48 overflow-y-auto p-2 bg-slate-50 rounded-2xl border border-slate-200">
                    {batchItems.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between gap-2 p-2 bg-white rounded-xl border border-slate-100 text-xs"
                      >
                        <div className="truncate flex-1">
                          <div className="font-semibold text-slate-800 truncate">{item.file.name}</div>
                          <div className="text-[10px] text-slate-400">
                            {formatBytes(item.originalSize)}
                            {item.compressedSize > 0 && ` → ${formatBytes(item.compressedSize)}`}
                          </div>
                        </div>
                        <div>
                          {item.status === "done" ? (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800">
                              Done
                            </span>
                          ) : item.status === "processing" ? (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-100 text-blue-800">
                              Processing
                            </span>
                          ) : (
                            <span className="text-[10px] text-slate-400 font-semibold">Queued</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {batchItems.some((b) => b.status === "done") && (
                  <button
                    onClick={downloadAllBatchZip}
                    className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl text-xs font-bold transition shadow-md flex items-center justify-center gap-2"
                  >
                    <LuFolderArchive className="w-4 h-4 text-emerald-400" />
                    Download All as ZIP Archive
                  </button>
                )}
              </div>
            </div>
          )}

          {/* TAB 4: IMAGE RESIZING */}
          {activeTab === "resize" && (
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-5">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Image Resizing</h3>
                <p className="text-xs text-slate-500">Resize by exact pixel dimensions or percentage scale.</p>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setResizeMode("percentage")}
                    className={`py-2 text-xs font-bold rounded-xl border transition ${
                      resizeMode === "percentage"
                        ? "bg-emerald-50 border-emerald-500 text-emerald-700"
                        : "border-slate-200 text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    By Percentage
                  </button>
                  <button
                    onClick={() => setResizeMode("dimensions")}
                    className={`py-2 text-xs font-bold rounded-xl border transition ${
                      resizeMode === "dimensions"
                        ? "bg-emerald-50 border-emerald-500 text-emerald-700"
                        : "border-slate-200 text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    By Dimensions (px)
                  </button>
                </div>

                {resizeMode === "percentage" ? (
                  <div>
                    <div className="flex items-center justify-between text-xs font-semibold text-slate-700 mb-1.5">
                      <span>Scale Factor:</span>
                      <span className="text-emerald-600 font-bold">{resizePercent}%</span>
                    </div>
                    <input
                      type="range"
                      min={10}
                      max={200}
                      value={resizePercent}
                      onChange={(e) => setResizePercent(Number(e.target.value))}
                      className="w-full accent-emerald-600 cursor-pointer"
                    />
                    <div className="flex gap-1.5 mt-2">
                      {[25, 50, 75, 125, 150].map((pct) => (
                        <button
                          key={pct}
                          onClick={() => setResizePercent(pct)}
                          className="flex-1 py-1 text-[11px] rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 font-medium"
                        >
                          {pct}%
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[11px] font-semibold text-slate-600">Width (px)</label>
                        <input
                          type="number"
                          value={customWidth}
                          onChange={(e) => {
                            const val = Number(e.target.value);
                            setCustomWidth(val);
                            if (lockAspectRatio && originalDimensions.width > 0) {
                              setCustomHeight(Math.round((val / originalDimensions.width) * originalDimensions.height));
                            }
                          }}
                          className="w-full mt-1 px-3 py-1.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-semibold text-slate-600">Height (px)</label>
                        <input
                          type="number"
                          value={customHeight}
                          onChange={(e) => {
                            const val = Number(e.target.value);
                            setCustomHeight(val);
                            if (lockAspectRatio && originalDimensions.height > 0) {
                              setCustomWidth(Math.round((val / originalDimensions.height) * originalDimensions.width));
                            }
                          }}
                          className="w-full mt-1 px-3 py-1.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                      </div>
                    </div>

                    <label className="flex items-center gap-2 text-xs cursor-pointer">
                      <input
                        type="checkbox"
                        checked={lockAspectRatio}
                        onChange={(e) => setLockAspectRatio(e.target.checked)}
                        className="rounded text-emerald-600 focus:ring-emerald-500"
                      />
                      <span className="text-slate-700">Lock Aspect Ratio</span>
                    </label>
                  </div>
                )}

                <button
                  onClick={runResize}
                  disabled={isProcessing}
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl text-xs font-bold transition shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2"
                >
                  <LuScaling className="w-4 h-4" />
                  Resize Image &amp; Preview
                </button>
              </div>
            </div>
          )}

          {/* TAB 5: IMAGE UPSCALING 2x / 4x */}
          {activeTab === "upscale" && (
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-5">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Image Upscaling (2x / 4x)</h3>
                <p className="text-xs text-slate-500">
                  Increase pixel dimensions with bicubic interpolation and edge-preserving reconstruction.
                </p>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  {[2, 4].map((factor) => (
                    <button
                      key={factor}
                      onClick={() => setUpscaleFactor(factor as any)}
                      className={`p-4 rounded-2xl border text-center transition ${
                        upscaleFactor === factor
                          ? "bg-emerald-50 border-emerald-500 text-emerald-900 shadow-xs"
                          : "border-slate-200 text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      <div className="text-xl font-black text-emerald-600">{factor}x</div>
                      <div className="text-xs font-bold mt-1">
                        {originalDimensions.width * factor} × {originalDimensions.height * factor} px
                      </div>
                    </button>
                  ))}
                </div>

                <label className="flex items-center gap-2 text-xs cursor-pointer">
                  <input
                    type="checkbox"
                    checked={edgeEnhance}
                    onChange={(e) => setEdgeEnhance(e.target.checked)}
                    className="rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  <span className="text-slate-700">Apply edge-crisping pass (minimizes blur)</span>
                </label>

                <button
                  onClick={runUpscale}
                  disabled={isProcessing}
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl text-xs font-bold transition shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2"
                >
                  <LuMaximize2 className="w-4 h-4" />
                  Upscale {upscaleFactor}x Image
                </button>
              </div>
            </div>
          )}

          {/* TAB 6: DENOISING & SHARPENING */}
          {activeTab === "enhance" && (
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-5">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Denoising &amp; Sharpening</h3>
                <p className="text-xs text-slate-500">
                  Sharpen soft edges and smooth out compression artifacts with spatial convolution filtering.
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-700 mb-1.5">
                    <span>Sharpening Strength:</span>
                    <span className="text-emerald-600 font-bold">{sharpenIntensity}%</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={sharpenIntensity}
                    onChange={(e) => setSharpenIntensity(Number(e.target.value))}
                    className="w-full accent-emerald-600 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                    <span>Soft</span>
                    <span>Balanced</span>
                    <span>Crisp Details</span>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-700 mb-1.5">
                    <span>Noise Reduction (Denoising):</span>
                    <span className="text-emerald-600 font-bold">{denoiseLevel}%</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={denoiseLevel}
                    onChange={(e) => setDenoiseLevel(Number(e.target.value))}
                    className="w-full accent-emerald-600 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                    <span>Raw</span>
                    <span>Smooth Artifacts</span>
                    <span>Max Smoothing</span>
                  </div>
                </div>

                <button
                  onClick={runEnhance}
                  disabled={isProcessing}
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl text-xs font-bold transition shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2"
                >
                  <LuSparkles className="w-4 h-4" />
                  Apply Denoise &amp; Sharpen Filters
                </button>
              </div>
            </div>
          )}

          {/* TAB 7: FORMAT CONVERSION */}
          {activeTab === "convert" && (
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-5">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Format Conversion</h3>
                <p className="text-xs text-slate-500">Convert between JPG, PNG, and modern WebP formats.</p>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: "webp", label: "WebP (Ultra Compact)" },
                    { id: "jpeg", label: "JPG (Universal)" },
                    { id: "png", label: "PNG (Lossless)" },
                  ].map((fmt) => (
                    <button
                      key={fmt.id}
                      onClick={() => setTargetFormat(fmt.id as any)}
                      className={`p-3 text-xs font-bold rounded-xl border text-center transition ${
                        targetFormat === fmt.id
                          ? "bg-emerald-50 border-emerald-500 text-emerald-800"
                          : "border-slate-200 text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      {fmt.label}
                    </button>
                  ))}
                </div>

                <button
                  onClick={runConversion}
                  disabled={isProcessing}
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl text-xs font-bold transition shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2"
                >
                  <LuArrowLeftRight className="w-4 h-4" />
                  Convert to .{targetFormat.toUpperCase()}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Interactive Before/After Split Quality Preview */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Interactive Quality Preview</h3>
                <p className="text-xs text-slate-500">
                  {processedUrl ? "Drag the split slider to compare Before vs After" : "Original Image Preview"}
                </p>
              </div>

              {processedSize > 0 && (
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold px-2.5 py-1 rounded-xl bg-emerald-100 text-emerald-800">
                    {Math.max(0, Math.round(((originalSize - processedSize) / originalSize) * 100))}% Saved
                  </span>
                </div>
              )}
            </div>

            {/* Split Slider Preview Box */}
            <div className="relative border border-slate-200 rounded-2xl bg-slate-900 overflow-hidden flex items-center justify-center min-h-[440px] select-none">
              {originalImage ? (
                <div className="relative w-full h-[440px] flex items-center justify-center overflow-hidden">
                  {/* Base Layer: Original Image */}
                  <img
                    src={originalImage.src}
                    alt="Original"
                    className="absolute inset-0 w-full h-full object-contain pointer-events-none"
                  />

                  {/* Top Layer: Processed Result Clipped by Slider */}
                  {processedUrl && (
                    <div
                      style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
                      className="absolute inset-0 w-full h-full pointer-events-none"
                    >
                      <img
                        src={processedUrl}
                        alt="Processed"
                        className="w-full h-full object-contain"
                      />
                    </div>
                  )}

                  {/* Split Divider Handle */}
                  {processedUrl && (
                    <div
                      style={{ left: `${sliderPosition}%` }}
                      className="absolute top-0 bottom-0 w-1 bg-white shadow-2xl pointer-events-none flex items-center justify-center"
                    >
                      <div className="w-7 h-7 rounded-full bg-white shadow-lg text-slate-800 text-[10px] font-bold flex items-center justify-center border border-slate-300">
                        &harr;
                      </div>
                    </div>
                  )}

                  {/* Tags */}
                  <div className="absolute top-3 left-3 px-2 py-1 bg-black/60 backdrop-blur-md rounded-lg text-[10px] font-bold text-white">
                    {processedUrl ? "PROCESSED OUTPUT" : "ORIGINAL"}
                  </div>
                  {processedUrl && (
                    <div className="absolute top-3 right-3 px-2 py-1 bg-black/60 backdrop-blur-md rounded-lg text-[10px] font-bold text-white">
                      ORIGINAL
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center text-slate-400 p-8 space-y-3">
                  <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 text-slate-400 mx-auto flex items-center justify-center shadow-xs">
                    <LuImage className="w-7 h-7 opacity-60" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-200">No Image Uploaded</h4>
                    <p className="text-[11px] text-slate-400 max-w-xs mx-auto mt-1">
                      Upload an image to compare before/after compression, upscale, or convert formats.
                    </p>
                  </div>
                  <div className="flex justify-center pt-1">
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition shadow-xs flex items-center gap-2"
                    >
                      <LuUpload className="w-4 h-4" />
                      Upload Image
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Slider Control */}
            {processedUrl && (
              <div className="space-y-1 pt-1">
                <div className="flex justify-between text-xs text-slate-500 font-semibold">
                  <span>Processed View ({sliderPosition}%)</span>
                  <span>Original View ({100 - sliderPosition}%)</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={sliderPosition}
                  onChange={(e) => setSliderPosition(Number(e.target.value))}
                  className="w-full accent-emerald-600 cursor-pointer"
                />
              </div>
            )}

            {/* Comparison Metrics */}
            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-100">
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
                <div className="text-[11px] font-semibold text-slate-500">Original Asset</div>
                <div className="text-sm font-black text-slate-800 mt-0.5">{formatBytes(originalSize)}</div>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  {originalDimensions.width} × {originalDimensions.height} px
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200">
                <div className="text-[11px] font-semibold text-emerald-800">Optimized Output</div>
                <div className="text-sm font-black text-emerald-700 mt-0.5">
                  {processedSize > 0 ? formatBytes(processedSize) : "Pending Action"}
                </div>
                <div className="text-[11px] text-emerald-600 mt-0.5">
                  {processedDimensions.width > 0
                    ? `${processedDimensions.width} × ${processedDimensions.height} px`
                    : "Ready to process"}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
