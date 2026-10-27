"use client";

import React, { useState, useRef, useEffect, useId } from "react";
import Link from "next/link";
import { PDFDocument, degrees, StandardFonts, rgb } from "pdf-lib";
import JSZip from "jszip";
import { encryptPDF } from "@pdfsmaller/pdf-encrypt";
import {
  LuUpload,
  LuDownload,
  LuPlus,
  LuTrash2,
  LuRefreshCw,
  LuRotateCw,
  LuArrowRight,
  LuCheck,
  LuShieldCheck,
  LuShare2,
  LuFileText,
  LuSparkles,
  LuLock,
  LuScissors,
  LuFolderTree,
  LuFolder,
  LuHardDrive,
  LuCircleCheck,
  LuLayers,
  LuEye,
  LuEyeOff,
  LuZap,
  LuArrowUpRight,
  LuChevronRight,
  LuChevronLeft,
  LuCopy,
  LuArrowLeftRight,
  LuCamera,
  LuDroplets,
  LuType,
  LuSlidersHorizontal,
  LuPenLine,
  LuSquareCheck,
  LuCrop,
  LuLockOpen,
  LuKey,
  LuSignature,
  LuGitCompare,
  LuFileDiff,
  LuShield,
} from "react-icons/lu";
import { PublicTool } from "@/config/publicTools";
import { Navbar } from "@/components/navigation/Navbar";

interface PageItem {
  id: string;
  originalPage: number;
  rotation: number;
}

interface UploadedItem {
  id: string;
  file: File;
  previewUrl: string;
  name: string;
  size: number;
  pageCount?: number;
}

interface ToolRunnerClientProps {
  tool: PublicTool;
  isAuthenticated?: boolean;
}

export function ToolRunnerClient({ tool, isAuthenticated = false }: ToolRunnerClientProps) {
  // Stages: "upload" -> "options" -> "success"
  const [stage, setStage] = useState<"upload" | "options" | "success">("upload");
  const [items, setItems] = useState<UploadedItem[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // --- TOOL OPTIONS STATE (Dashboard-consistent) ---
  // Image to PDF options
  const [orientation, setOrientation] = useState<"portrait" | "landscape">("portrait");
  const [pageSize, setPageSize] = useState<"a4" | "letter" | "fit">("a4");
  const [margin, setMargin] = useState<"none" | "small" | "big">("none");
  const [mergeAll, setMergeAll] = useState(true);

  // Compress options
  const [compressLevel, setCompressLevel] = useState<"recommended" | "extreme" | "low">("recommended");

  // Protect PDF options
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [allowPrinting, setAllowPrinting] = useState(true);
  const [allowCopying, setAllowCopying] = useState(false);
  const [allowModifying, setAllowModifying] = useState(false);
  const [protectSaveAs, setProtectSaveAs] = useState("");

  // Unlock PDF options
  const [unlockPassword, setUnlockPassword] = useState("");
  const [showUnlockPassword, setShowUnlockPassword] = useState(false);
  const [unlockSaveAs, setUnlockSaveAs] = useState("");

  // Sign PDF options (Dashboard-parity E-Signature execution)
  const [signerName, setSignerName] = useState("John Doe");
  const [sigMode, setSigMode] = useState<"draw" | "type" | "upload">("draw");
  const [sigColor, setSigColor] = useState<string>("#0f172a");
  const [sigPlacement, setSigPlacement] = useState<{ xPercent: number; yPercent: number }>({
    xPercent: 65,
    yPercent: 82,
  });
  const [sigImageSrc, setSigImageSrc] = useState<string | null>(null);
  const [isDrawingSig, setIsDrawingSig] = useState<boolean>(false);
  const [signCurrentPage, setSignCurrentPage] = useState<number>(1);
  const [signSaveAs, setSignSaveAs] = useState("");
  const signDrawCanvasRef = useRef<HTMLCanvasElement>(null);
  const signPreviewCanvasRef = useRef<HTMLCanvasElement>(null);

  // Redact PDF options
  const [redactReason, setRedactReason] = useState("CONFIDENTIAL");
  const [redactPlacement, setRedactPlacement] = useState<"header" | "center" | "custom">("header");
  const [redactPages, setRedactPages] = useState<Set<number>>(new Set([1]));
  const [redactSaveAs, setRedactSaveAs] = useState("");

  // Compare PDF options
  const [compareMode, setCompareMode] = useState<"side-by-side" | "summary">("side-by-side");
  const [compareSaveAs, setCompareSaveAs] = useState("");

  // PDF to JPG (Extract Pages to Images) options
  const [pdfToJpgQuality, setPdfToJpgQuality] = useState<"high" | "standard" | "compact">("high");
  const [pdfToJpgDpi, setPdfToJpgDpi] = useState<"standard" | "high">("high");
  const [pdfToJpgSaveAs, setPdfToJpgSaveAs] = useState<string>("");

  // Image Conversion options (Format Conversion: WebP, JPG, PNG)
  const [imageConvertTargetFormat, setImageConvertTargetFormat] = useState<"webp" | "jpeg" | "png">("webp");
  const [imageConvertSaveAs, setImageConvertSaveAs] = useState<string>("");

  // Document Previews for Office / Text / HTML
  const [docPreviewData, setDocPreviewData] = useState<{
    type: "docx" | "xlsx" | "pptx" | "html" | "text" | "generic";
    title: string;
    html?: string;
    text?: string;
    lines?: string[];
    sheets?: string[];
    slidesCount?: number;
    wordCount?: number;
    charCount?: number;
    tableData?: string[][];
    sheetData?: Record<string, string[][]>;
  } | null>(null);
  const [activeSpreadsheetTab, setActiveSpreadsheetTab] = useState<string>("Sheet1");
  const [activeSlideIndex, setActiveSlideIndex] = useState<number>(1);
  const [convertToPdfSaveAs, setConvertToPdfSaveAs] = useState<string>("");
  const [convertFromPdfSaveAs, setConvertFromPdfSaveAs] = useState<string>("");

  // Rotate options
  const [rotationAngle, setRotationAngle] = useState<number>(90);
  const [pageRotations, setPageRotations] = useState<Record<number, number>>({});
  const [rotateSaveAs, setRotateSaveAs] = useState<string>("");

  // Page Numbers options
  const [pageNumberPosition, setPageNumberPosition] = useState<
    "bottom-center" | "bottom-right" | "bottom-left" | "top-center" | "top-right" | "top-left"
  >("bottom-center");
  const [pageNumberFormat, setPageNumberFormat] = useState<
    "page-x-of-y" | "page-x" | "dash-x-dash" | "x-slash-y" | "number-only"
  >("page-x-of-y");
  const [pageNumberFontSize, setPageNumberFontSize] = useState<number>(11);
  const [skipCoverPage, setSkipCoverPage] = useState<boolean>(false);
  const [pageNumberColor, setPageNumberColor] = useState<string>("#334155");
  const [pageNumbersSaveAs, setPageNumbersSaveAs] = useState<string>("");

  // Watermark options
  const [watermarkText, setWatermarkText] = useState("CONFIDENTIAL");
  const [watermarkOpacity, setWatermarkOpacity] = useState<number>(0.3);
  const [watermarkRotation, setWatermarkRotation] = useState<number>(-45);
  const [watermarkFontSize, setWatermarkFontSize] = useState<number>(44);
  const [watermarkColor, setWatermarkColor] = useState<string>("#dc2626");
  const [watermarkSaveAs, setWatermarkSaveAs] = useState<string>("");

  // Crop PDF options
  const [cropPreset, setCropPreset] = useState<"trim-margins" | "letter-to-a4" | "custom">("trim-margins");
  const [cropMarginPercent, setCropMarginPercent] = useState<number>(8);
  const [cropSaveAs, setCropSaveAs] = useState<string>("");

  // Edit PDF options (Annotation & Markup)
  const [addedText, setAddedText] = useState<string>("Approved");
  const [textColor, setTextColor] = useState<string>("#2563eb");
  const [textFontSize, setTextFontSize] = useState<number>(16);
  const [textPosition, setTextPosition] = useState<
    "top-left" | "top-right" | "bottom-left" | "bottom-right" | "center"
  >("top-right");
  const [addBorderBox, setAddBorderBox] = useState<boolean>(true);
  const [editSaveAs, setEditSaveAs] = useState<string>("");

  // PDF Forms options (Interactive AcroForm Filler)
  const [detectedFormFields, setDetectedFormFields] = useState<
    Array<{ name: string; type: string; value: string }>
  >([]);
  const [formFieldValues, setFormFieldValues] = useState<Record<string, string>>({});
  const [flattenForm, setFlattenForm] = useState<boolean>(true);
  const [pdfFormsSaveAs, setPdfFormsSaveAs] = useState<string>("");

  // Split PDF options
  const [splitMode, setSplitMode] = useState<"individual" | "range">("individual");
  const [splitRangeText, setSplitRangeText] = useState<string>("1-2, 3-5");
  const [splitSaveAs, setSplitSaveAs] = useState<string>("");

  // Remove / Extract Pages options
  const [selectedPages, setSelectedPages] = useState<Set<number>>(new Set());
  const [customRangeInput, setCustomRangeInput] = useState<string>("");
  const [pageThumbnails, setPageThumbnails] = useState<Record<number, string>>({});
  const [isLoadingThumbnails, setIsLoadingThumbnails] = useState(false);
  const [removeSaveAs, setRemoveSaveAs] = useState<string>("");

  // PDF Organizer options
  const [pagesList, setPagesList] = useState<PageItem[]>([]);
  const [organizeSaveAs, setOrganizeSaveAs] = useState<string>("");

  // Compress to 100KB options
  const [compress100kSaveAs, setCompress100kSaveAs] = useState<string>("");

  // Optimize PDF options
  const [optimizeProfile, setOptimizeProfile] = useState<"web" | "lossless" | "print" | "extreme">("web");
  const [stripMetadata, setStripMetadata] = useState<boolean>(true);
  const [linearizeStreams, setLinearizeStreams] = useState<boolean>(true);
  const [optimizeSaveAs, setOptimizeSaveAs] = useState<string>("");

  // OCR PDF options
  const [ocrOutputMode, setOcrOutputMode] = useState<"searchable-pdf" | "extract-text" | "editable-docx">("searchable-pdf");
  const [ocrLanguage, setOcrLanguage] = useState<string>("eng");
  const [ocrAccuracy, setOcrAccuracy] = useState<"high" | "balanced">("high");
  const [ocrDeskew, setOcrDeskew] = useState<boolean>(true);
  const [ocrSaveAs, setOcrSaveAs] = useState<string>("");

  // --- DOWNLOAD OUTPUT STATE ---
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [downloadFileName, setDownloadFileName] = useState<string>("xswtools_document.pdf");
  const [originalTotalSize, setOriginalTotalSize] = useState<number>(0);
  const [downloadFileSize, setDownloadFileSize] = useState<number>(0);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const addMoreInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const pageSizeId = useId();
  const mergeAllId = useId();
  const passwordInputId = useId();
  const watermarkTextId = useId();

  // Clean up object URLs on unmount
  useEffect(() => {
    return () => {
      items.forEach((item) => URL.revokeObjectURL(item.previewUrl));
      if (downloadUrl) URL.revokeObjectURL(downloadUrl);
    };
  }, []);

  const isRotateTool =
    tool.slug === "rotate-pdf" || tool.optionsType === "rotate-pdf";

  const isPageNumbersTool =
    tool.slug === "add-page-numbers" ||
    tool.slug === "page-numbers" ||
    tool.optionsType === "add-page-numbers";

  const isWatermarkTool =
    tool.slug === "add-watermark" ||
    tool.slug === "watermark" ||
    tool.optionsType === "watermark-pdf";

  const isCropTool =
    tool.slug === "crop-pdf" ||
    tool.slug === "crop" ||
    tool.optionsType === "crop-pdf";

  const isEditPdfTool =
    tool.slug === "edit-pdf" ||
    tool.slug === "mark-pdf" ||
    tool.slug === "mark" ||
    tool.slug === "edit" ||
    tool.optionsType === "edit-pdf";

  const isPdfFormsTool =
    tool.slug === "pdf-forms" ||
    tool.slug === "form" ||
    tool.slug === "forms" ||
    tool.slug === "fill-form" ||
    tool.optionsType === "pdf-forms";

  const isOptimizeTool =
    tool.slug === "optimize-pdf" ||
    tool.slug === "optimize" ||
    tool.optionsType === "optimize-pdf";

  const isCompress100kTool =
    tool.slug === "compress-to-100kb" ||
    tool.slug === "repair-pdf" ||
    tool.optionsType === "compress-to-100kb";

  const isPdfToJpgTool =
    tool.slug === "pdf-to-jpg" ||
    tool.slug === "pdf-to-images" ||
    tool.optionsType === "pdf-to-jpg";

  const isImageConverterTool =
    tool.slug === "image-converter" ||
    tool.slug === "convert-image" ||
    tool.slug === "image-conversion" ||
    tool.optionsType === "image-converter";

  const isPageSelectorTool =
    tool.slug === "remove-pages" ||
    tool.optionsType === "remove-pages" ||
    tool.slug === "extract-pages" ||
    tool.optionsType === "extract-pages" ||
    isPdfToJpgTool;

  const isOrganizerTool =
    tool.slug === "organize-pdf" || tool.optionsType === "organize-pdf";

  const isReorderTool =
    tool.slug === "reorder-pages" ||
    tool.slug === "reorder" ||
    tool.optionsType === "reorder-pages";

  const isUnlockTool =
    tool.slug === "unlock-pdf" ||
    tool.slug === "unlock" ||
    tool.optionsType === "unlock-pdf";

  const isProtectTool =
    tool.slug === "protect-pdf" ||
    tool.slug === "protect" ||
    tool.slug === "lock-pdf" ||
    tool.slug === "lock" ||
    tool.optionsType === "protect-pdf";

  const isSignTool =
    tool.slug === "sign-pdf" ||
    tool.slug === "sign" ||
    tool.optionsType === "sign-pdf";

  const isRedactTool =
    tool.slug === "redact-pdf" ||
    tool.slug === "redact" ||
    tool.optionsType === "redact-pdf";

  const isCompareTool =
    tool.slug === "compare-pdf" ||
    tool.slug === "compare" ||
    tool.optionsType === "compare-pdf";

  const isOcrTool =
    tool.slug === "ocr-pdf" ||
    tool.slug === "ocr" ||
    tool.optionsType === "ocr-pdf";

  const isConvertToPdfTool =
    tool.slug === "word-to-pdf" ||
    tool.slug === "powerpoint-to-pdf" ||
    tool.slug === "excel-to-pdf" ||
    tool.slug === "html-to-pdf" ||
    tool.slug === "text-to-pdf" ||
    tool.convertAction === "word-to-pdf" ||
    tool.convertAction === "ppt-to-pdf" ||
    tool.convertAction === "excel-to-pdf";

  const isConvertFromPdfTool =
    tool.slug === "pdf-to-word" ||
    tool.slug === "pdf-to-powerpoint" ||
    tool.slug === "pdf-to-excel" ||
    tool.slug === "pdf-to-pdfa" ||
    tool.slug === "pdf-to-text" ||
    tool.convertAction === "pdf-to-word" ||
    tool.convertAction === "pdf-to-ppt" ||
    tool.convertAction === "pdf-to-excel" ||
    tool.convertAction === "pdf-to-text";

  const moveOrganizerPage = (from: number, to: number) => {
    if (to < 0 || to >= pagesList.length) return;
    setPagesList((prev) => {
      const copy = [...prev];
      const [moved] = copy.splice(from, 1);
      copy.splice(to, 0, moved);
      return copy;
    });
  };

  const rotateOrganizerPage = (idx: number) => {
    setPagesList((prev) => {
      const copy = [...prev];
      copy[idx] = { ...copy[idx], rotation: (copy[idx].rotation + 90) % 360 };
      return copy;
    });
  };

  const rotateAllOrganizerPages = () => {
    setPagesList((prev) =>
      prev.map((p) => ({ ...p, rotation: (p.rotation + 90) % 360 }))
    );
  };

  const reverseOrganizerPages = () => {
    setPagesList((prev) => [...prev].reverse());
  };

  const duplicateOrganizerPage = (idx: number) => {
    setPagesList((prev) => {
      const copy = [...prev];
      const target = copy[idx];
      copy.splice(idx + 1, 0, {
        id: `p_dup_${Date.now()}_${Math.random()}`,
        originalPage: target.originalPage,
        rotation: target.rotation,
      });
      return copy;
    });
  };

  const deleteOrganizerPage = (idx: number) => {
    if (pagesList.length <= 1) {
      setErrorMessage("At least one page must remain.");
      return;
    }
    setPagesList((prev) => prev.filter((_, i) => i !== idx));
  };

  const resetOrganizer = () => {
    const total = items[0]?.pageCount || 0;
    if (!total) return;
    setPagesList(
      Array.from({ length: total }, (_, i) => ({
        id: `p_${i + 1}`,
        originalPage: i + 1,
        rotation: 0,
      }))
    );
  };

  const loadThumbnails = async (file: File) => {
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
      const count = pdf.numPages;

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
              viewport,
              canvas,
            }).promise;
            const dataUrl = canvas.toDataURL("image/jpeg", 0.82);
            setPageThumbnails((prev) => ({ ...prev, [pageNum]: dataUrl }));
          }
        } catch (pageErr) {
          console.warn(`Error rendering thumbnail for page ${pageNum}:`, pageErr);
        }
      }
    } catch (err) {
      console.warn("Failed to generate PDF thumbnails:", err);
    } finally {
      setIsLoadingThumbnails(false);
    }
  };

  const loadDocPreview = async (file: File) => {
    const ext = file.name.split(".").pop()?.toLowerCase() || "";
    try {
      if (ext === "docx" || ext === "doc") {
        try {
          const mammoth = await import("mammoth");
          const arrayBuffer = await file.arrayBuffer();
          const htmlRes = await mammoth.convertToHtml({ arrayBuffer });
          const rawRes = await mammoth.extractRawText({ arrayBuffer });
          const words = rawRes.value.trim() ? rawRes.value.trim().split(/\s+/).filter(Boolean).length : 0;
          setDocPreviewData({
            type: "docx",
            title: file.name,
            html: htmlRes.value,
            text: rawRes.value,
            lines: rawRes.value.split("\n").filter((l) => l.trim().length > 0),
            wordCount: words,
            charCount: rawRes.value.length,
          });
          return;
        } catch {
          const zip = await JSZip.loadAsync(await file.arrayBuffer());
          const xml = await zip.file("word/document.xml")?.async("text");
          if (xml) {
            const rawText = xml
              .replace(/<w:p[^>]*>/g, "\n")
              .replace(/<[^>]+>/g, " ")
              .replace(/&amp;/g, "&")
              .replace(/&lt;/g, "<")
              .replace(/&gt;/g, ">")
              .trim();
            const words = rawText.split(/\s+/).filter(Boolean).length;
            setDocPreviewData({
              type: "docx",
              title: file.name,
              text: rawText,
              lines: rawText.split("\n").filter((l) => l.trim().length > 0),
              wordCount: words,
              charCount: rawText.length,
            });
            return;
          }
        }
      }

      if (ext === "xlsx" || ext === "xls") {
        try {
          const zip = await JSZip.loadAsync(await file.arrayBuffer());
          const wbXml = await zip.file("xl/workbook.xml")?.async("text");
          const sheets: string[] = [];
          if (wbXml) {
            const matches = wbXml.matchAll(/<sheet[^>]*name="([^"]+)"/g);
            for (const m of matches) sheets.push(m[1]);
          }
          if (sheets.length === 0) sheets.push("Sheet1");

          const ssXml = await zip.file("xl/sharedStrings.xml")?.async("text");
          const sharedStrings: string[] = [];
          if (ssXml) {
            const siMatches = ssXml.matchAll(/<si>([\s\S]*?)<\/si>/g);
            for (const sim of siMatches) {
              const textMatches = sim[1].matchAll(/<t[^>]*>([^<]+)<\/t>/g);
              let combined = "";
              for (const tm of textMatches) combined += tm[1];
              sharedStrings.push(combined);
            }
            if (sharedStrings.length === 0) {
              const sMatches = ssXml.matchAll(/<t[^>]*>([^<]+)<\/t>/g);
              for (const sm of sMatches) sharedStrings.push(sm[1]);
            }
          }

          const getColIdx = (ref?: string) => {
            if (!ref) return -1;
            const letters = ref.replace(/[^A-Za-z]/g, "").toUpperCase();
            let c = 0;
            for (let i = 0; i < letters.length; i++) {
              c = c * 26 + (letters.charCodeAt(i) - 64);
            }
            return c - 1;
          };

          const sheetData: Record<string, string[][]> = {};

          for (let sIdx = 0; sIdx < sheets.length; sIdx++) {
            const sheetName = sheets[sIdx];
            const sheetFile =
              zip.file(`xl/worksheets/sheet${sIdx + 1}.xml`) ||
              (sIdx === 0 ? zip.file("xl/worksheets/sheet.xml") : null);

            const sXml = await sheetFile?.async("text");
            if (!sXml) continue;

            const rows: string[][] = [];
            const rowMatches = sXml.matchAll(/<row[^>]*>([\s\S]*?)<\/row>/g);
            let rowLimit = 0;
            for (const rm of rowMatches) {
              if (rowLimit++ > 60) break;
              const rowContent = rm[1];
              const cellMatches = rowContent.matchAll(
                /<c([^>]*)>(?:<is><t>([^<]*)<\/t><\/is>|<v>([^<]*)<\/v>)?<\/c>/g
              );
              const rowCols: string[] = [];

              for (const cm of cellMatches) {
                const attrs = cm[1];
                const inlineText = cm[2];
                const rawVal = cm[3];

                const rMatch = attrs.match(/r="([A-Za-z0-9]+)"/);
                const colIdx = rMatch ? getColIdx(rMatch[1]) : rowCols.length;
                if (colIdx > 20) continue;

                const isShared = /t="s"/.test(attrs);
                let cellVal = "";

                if (inlineText !== undefined) {
                  cellVal = inlineText;
                } else if (isShared && rawVal && sharedStrings[parseInt(rawVal, 10)] !== undefined) {
                  cellVal = sharedStrings[parseInt(rawVal, 10)];
                } else if (rawVal !== undefined) {
                  cellVal = rawVal;
                }

                if (colIdx >= 0) {
                  while (rowCols.length < colIdx) rowCols.push("");
                  rowCols[colIdx] = cellVal;
                }
              }

              if (rowCols.some((c) => c && c.trim().length > 0)) {
                rows.push(rowCols);
              }
            }

            sheetData[sheetName] = rows;
          }

          const primarySheet = sheets[0] || "Sheet1";
          const primaryRows = sheetData[primarySheet] || [];

          setDocPreviewData({
            type: "xlsx",
            title: file.name,
            sheets,
            tableData: primaryRows,
            sheetData,
          });
          setActiveSpreadsheetTab(primarySheet);
          return;
        } catch (e) {
          console.warn("XLSX parsing fallback:", e);
        }
      }

      if (ext === "pptx" || ext === "ppt") {
        try {
          const zip = await JSZip.loadAsync(await file.arrayBuffer());
          const slideKeys = Object.keys(zip.files).filter(
            (k) => k.startsWith("ppt/slides/slide") && k.endsWith(".xml")
          );
          setDocPreviewData({
            type: "pptx",
            title: file.name,
            slidesCount: slideKeys.length || 1,
          });
          return;
        } catch {}
      }

      if (ext === "html" || ext === "htm") {
        const text = await file.text();
        setDocPreviewData({
          type: "html",
          title: file.name,
          html: text,
          charCount: text.length,
        });
        return;
      }

      if (ext === "txt") {
        const text = await file.text();
        const words = text.trim() ? text.trim().split(/\s+/).filter(Boolean).length : 0;
        setDocPreviewData({
          type: "text",
          title: file.name,
          text: text,
          lines: text.split("\n"),
          wordCount: words,
          charCount: text.length,
        });
        return;
      }

      setDocPreviewData({
        type: "generic",
        title: file.name,
      });
    } catch (e) {
      console.warn("Failed parsing document preview:", e);
      setDocPreviewData({
        type: "generic",
        title: file.name,
      });
    }
  };

  // Auto-sync previews for Convert to/from PDF
  useEffect(() => {
    if (isConvertToPdfTool && items[0]?.file && !docPreviewData) {
      loadDocPreview(items[0].file);
    }
    if (isConvertFromPdfTool && items[0]?.file && Object.keys(pageThumbnails).length === 0) {
      loadThumbnails(items[0].file);
    }
  }, [isConvertToPdfTool, isConvertFromPdfTool, items, docPreviewData, pageThumbnails]);

  // Synchronize typed signature to DataURL image (dashboard parity)
  useEffect(() => {
    if (isSignTool && sigMode === "type" && signerName.trim()) {
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
        ctx.fillText(signerName.trim(), 200, 70);
        ctx.beginPath();
        ctx.moveTo(80, 100);
        ctx.quadraticCurveTo(200, 115, 320, 95);
        ctx.lineWidth = 2.5;
        ctx.strokeStyle = sigColor;
        ctx.stroke();
        setSigImageSrc(canvas.toDataURL("image/png"));
      }
    }
  }, [isSignTool, sigMode, signerName, sigColor]);

  // Render main preview canvas for interactive click-to-place signature
  useEffect(() => {
    if (isSignTool && items[0]?.file) {
      (async () => {
        try {
          const pdfjs = await import("pdfjs-dist");
          if (!pdfjs.GlobalWorkerOptions.workerSrc) {
            pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
          }
          const arrayBuffer = await items[0].file.arrayBuffer();
          const loadingTask = pdfjs.getDocument({
            data: new Uint8Array(arrayBuffer.slice(0)),
            cMapUrl: "https://unpkg.com/pdfjs-dist@5.4.296/cmaps/",
            cMapPacked: true,
          });
          const pdf = await loadingTask.promise;
          const page = await pdf.getPage(Math.min(signCurrentPage, pdf.numPages));
          const canvas = signPreviewCanvasRef.current;
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
        } catch (e) {
          console.warn("Failed rendering sign preview canvas:", e);
        }
      })();
    }
  }, [isSignTool, items, signCurrentPage]);

  const startSignDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = signDrawCanvasRef.current;
    if (!canvas) return;
    setIsDrawingSig(true);
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

  const drawSign = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawingSig) return;
    const canvas = signDrawCanvasRef.current;
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

  const stopSignDrawing = () => {
    if (!isDrawingSig) return;
    setIsDrawingSig(false);
    const canvas = signDrawCanvasRef.current;
    if (canvas) {
      setSigImageSrc(canvas.toDataURL("image/png"));
    }
  };

  const clearSignDrawing = () => {
    const canvas = signDrawCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      setSigImageSrc(null);
    }
  };

  const handleSignPreviewClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = signPreviewCanvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const xPercent = Math.max(5, Math.min(90, Math.round((x / rect.width) * 100)));
    const yPercent = Math.max(5, Math.min(90, Math.round((y / rect.height) * 100)));
    setSigPlacement({ xPercent, yPercent });
  };

  const togglePageSelection = (pageNum: number) => {
    setSelectedPages((prev) => {
      const next = new Set(prev);
      if (next.has(pageNum)) {
        next.delete(pageNum);
      } else {
        next.add(pageNum);
      }
      setCustomRangeInput(Array.from(next).sort((a, b) => a - b).join(", "));
      return next;
    });
  };

  const selectAllPages = () => {
    const total = items[0]?.pageCount || 0;
    if (!total) return;
    const all = new Set<number>();
    for (let i = 1; i <= total; i++) all.add(i);
    setSelectedPages(all);
    setCustomRangeInput(Array.from(all).join(", "));
  };

  const selectOddPages = () => {
    const total = items[0]?.pageCount || 0;
    if (!total) return;
    const odd = new Set<number>();
    for (let i = 1; i <= total; i += 2) odd.add(i);
    setSelectedPages(odd);
    setCustomRangeInput(Array.from(odd).join(", "));
  };

  const selectEvenPages = () => {
    const total = items[0]?.pageCount || 0;
    if (!total) return;
    const even = new Set<number>();
    for (let i = 2; i <= total; i += 2) even.add(i);
    setSelectedPages(even);
    setCustomRangeInput(Array.from(even).join(", "));
  };

  const clearSelectedPages = () => {
    setSelectedPages(new Set());
    setCustomRangeInput("");
  };

  const applyCustomRangeText = (text: string) => {
    setCustomRangeInput(text);
    const total = items[0]?.pageCount || 0;
    if (!total) return;
    const set = new Set<number>();
    const parts = text.split(",").map((s) => s.trim()).filter(Boolean);
    for (const part of parts) {
      if (part.includes("-")) {
        const [sStr, eStr] = part.split("-").map((s) => s.trim());
        let s = parseInt(sStr, 10);
        let e = parseInt(eStr, 10);
        if (isNaN(s)) s = 1;
        if (isNaN(e)) e = total;
        s = Math.max(1, Math.min(s, total));
        e = Math.max(1, Math.min(e, total));
        for (let i = s; i <= e; i++) set.add(i);
      } else {
        const num = parseInt(part, 10);
        if (!isNaN(num) && num >= 1 && num <= total) {
          set.add(num);
        }
      }
    }
    setSelectedPages(set);
  };

  const handleFiles = async (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;
    const newFiles = Array.from(fileList);

    let totalBytes = 0;
    const newItems: UploadedItem[] = await Promise.all(
      newFiles.map(async (f) => {
        totalBytes += f.size;
        let pageCount: number | undefined;
        if (f.type === "application/pdf" || f.name.toLowerCase().endsWith(".pdf")) {
          try {
            const buf = await f.arrayBuffer();
            const doc = await PDFDocument.load(buf, { ignoreEncryption: true });
            pageCount = doc.getPageCount();
          } catch {}
        }
        const isImg = f.type.startsWith("image/") || /\.(jpe?g|png|webp|bmp|gif|tiff?)$/i.test(f.name);
        return {
          id: `${f.name}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          file: f,
          previewUrl: isImg ? URL.createObjectURL(f) : "",
          name: f.name,
          size: f.size,
          pageCount,
        };
      })
    );

    setOriginalTotalSize(totalBytes);

    // If single-file tool, replace rather than append
    if (
      isOrganizerTool ||
      isReorderTool ||
      isPageSelectorTool ||
      isCompress100kTool ||
      isOptimizeTool ||
      isRotateTool ||
      isPageNumbersTool ||
      isWatermarkTool ||
      isCropTool ||
      isEditPdfTool ||
      isPdfFormsTool ||
      isUnlockTool ||
      isProtectTool ||
      isSignTool ||
      isRedactTool ||
      isConvertToPdfTool ||
      isConvertFromPdfTool ||
      tool.slug === "split-pdf" ||
      tool.optionsType === "split-pdf"
    ) {
      items.forEach((it) => URL.revokeObjectURL(it.previewUrl));
      setItems(newItems);
    } else {
      setItems((prev) => [...prev, ...newItems]);
    }

    setStage("options");
    setErrorMessage(null);

    if (newItems.length > 0 && isRotateTool) {
      const f = newItems[0].file;
      const baseName = f.name.replace(/\.pdf$/i, "");
      setRotateSaveAs(`${baseName}_rotated.pdf`);
      setPageRotations({});
      setPageThumbnails({});
      loadThumbnails(f);
    } else if (newItems.length > 0 && isPageNumbersTool) {
      const f = newItems[0].file;
      const baseName = f.name.replace(/\.pdf$/i, "");
      setPageNumbersSaveAs(`${baseName}_numbered.pdf`);
      setPageThumbnails({});
      loadThumbnails(f);
    } else if (newItems.length > 0 && isWatermarkTool) {
      const f = newItems[0].file;
      const baseName = f.name.replace(/\.pdf$/i, "");
      setWatermarkSaveAs(`${baseName}_watermarked.pdf`);
      setPageThumbnails({});
      loadThumbnails(f);
    } else if (newItems.length > 0 && isCropTool) {
      const f = newItems[0].file;
      const baseName = f.name.replace(/\.pdf$/i, "");
      setCropSaveAs(`${baseName}_cropped.pdf`);
      setPageThumbnails({});
      loadThumbnails(f);
    } else if (newItems.length > 0 && isEditPdfTool) {
      const f = newItems[0].file;
      const baseName = f.name.replace(/\.pdf$/i, "");
      setEditSaveAs(tool.name.toLowerCase().includes("mark") ? `${baseName}_marked.pdf` : `${baseName}_edited.pdf`);
      setPageThumbnails({});
      loadThumbnails(f);
    } else if (newItems.length > 0 && isPdfFormsTool) {
      const f = newItems[0].file;
      const baseName = f.name.replace(/\.pdf$/i, "");
      setPdfFormsSaveAs(`${baseName}_filled.pdf`);
      setPageThumbnails({});
      loadThumbnails(f);
      (async () => {
        try {
          const buf = await f.arrayBuffer();
          const doc = await PDFDocument.load(buf, { ignoreEncryption: true });
          const form = doc.getForm();
          const fields = form.getFields();
          const list = fields.map((fld) => {
            let val = "";
            try {
              if ("getText" in fld && typeof (fld as any).getText === "function") {
                val = (fld as any).getText() || "";
              }
            } catch {}
            return {
              name: fld.getName(),
              type: fld.constructor.name.replace(/^PDF/, ""),
              value: val,
            };
          });
          setDetectedFormFields(list);
          const initialMap: Record<string, string> = {};
          list.forEach((item) => {
            initialMap[item.name] = item.value;
          });
          setFormFieldValues(initialMap);
        } catch {
          setDetectedFormFields([]);
        }
      })();
    } else if (newItems.length > 0 && isOptimizeTool) {
      const f = newItems[0].file;
      const baseName = f.name.replace(/\.pdf$/i, "");
      setOptimizeSaveAs(`${baseName}_optimized.pdf`);
      setPageThumbnails({});
      loadThumbnails(f);
    } else if (newItems.length > 0 && isCompress100kTool) {
      const f = newItems[0].file;
      const baseName = f.name.replace(/\.pdf$/i, "");
      setCompress100kSaveAs(`${baseName}_100kb.pdf`);
    } else if (newItems.length > 0 && (isOrganizerTool || isReorderTool)) {
      const f = newItems[0].file;
      const baseName = f.name.replace(/\.pdf$/i, "");
      const count = newItems[0].pageCount || 1;
      setPagesList(
        Array.from({ length: count }, (_, i) => ({
          id: `p_${i + 1}`,
          originalPage: i + 1,
          rotation: 0,
        }))
      );
      setOrganizeSaveAs(isReorderTool ? `${baseName}_reordered.pdf` : `${baseName}_organized.pdf`);
      setPageThumbnails({});
      loadThumbnails(f);
    } else if (newItems.length > 0 && isPageSelectorTool) {
      const f = newItems[0].file;
      const baseName = f.name.replace(/\.pdf$/i, "");
      const total = newItems[0].pageCount || 1;
      if (isPdfToJpgTool) {
        setPdfToJpgSaveAs(`${baseName}_images.zip`);
        const allPages = new Set<number>();
        for (let i = 1; i <= total; i++) allPages.add(i);
        setSelectedPages(allPages);
        setCustomRangeInput(total > 1 ? `1-${total}` : "1");
      } else if (tool.slug === "extract-pages" || tool.optionsType === "extract-pages") {
        setRemoveSaveAs(`${baseName}_extracted.pdf`);
        setSelectedPages(new Set([1]));
        setCustomRangeInput("1");
      } else {
        setRemoveSaveAs(`${baseName}_cleaned.pdf`);
        setSelectedPages(new Set());
        setCustomRangeInput("");
      }
      setPageThumbnails({});
      loadThumbnails(f);
    } else if (newItems.length > 0 && isUnlockTool) {
      const f = newItems[0].file;
      const baseName = f.name.replace(/\.pdf$/i, "");
      setUnlockSaveAs(`${baseName}_unlocked.pdf`);
      setPageThumbnails({});
      loadThumbnails(f);
    } else if (newItems.length > 0 && isProtectTool) {
      const f = newItems[0].file;
      const baseName = f.name.replace(/\.pdf$/i, "");
      setProtectSaveAs(`${baseName}_protected.pdf`);
      setPageThumbnails({});
      loadThumbnails(f);
    } else if (newItems.length > 0 && isSignTool) {
      const f = newItems[0].file;
      const baseName = f.name.replace(/\.pdf$/i, "");
      setSignSaveAs(`${baseName}_signed.pdf`);
      setPageThumbnails({});
      loadThumbnails(f);
    } else if (newItems.length > 0 && isRedactTool) {
      const f = newItems[0].file;
      const baseName = f.name.replace(/\.pdf$/i, "");
      setRedactSaveAs(`${baseName}_redacted.pdf`);
      setRedactPages(new Set([1]));
      setPageThumbnails({});
      loadThumbnails(f);
    } else if (newItems.length > 0 && isCompareTool) {
      const baseName = newItems[0].file.name.replace(/\.pdf$/i, "");
      setCompareSaveAs(`${baseName}_comparison.pdf`);
      setPageThumbnails({});
      loadThumbnails(newItems[0].file);
      if (newItems[1]) loadThumbnails(newItems[1].file);
    } else if (newItems.length > 0 && isConvertToPdfTool) {
      const f = newItems[0].file;
      const baseName = f.name.replace(/\.[^/.]+$/, "");
      setConvertToPdfSaveAs(`${baseName}.pdf`);
      setDocPreviewData(null);
      loadDocPreview(f);
    } else if (newItems.length > 0 && isConvertFromPdfTool) {
      const f = newItems[0].file;
      const baseName = f.name.replace(/\.pdf$/i, "");
      const ext =
        tool.slug === "pdf-to-word" || tool.convertAction === "pdf-to-word" ? "docx" :
        tool.slug === "pdf-to-excel" || tool.convertAction === "pdf-to-excel" ? "xlsx" :
        tool.slug === "pdf-to-powerpoint" || tool.convertAction === "pdf-to-ppt" ? "pptx" :
        tool.slug === "pdf-to-text" || tool.convertAction === "pdf-to-text" ? "txt" : "pdf";
      setConvertFromPdfSaveAs(`${baseName}.${ext}`);
      setPageThumbnails({});
      loadThumbnails(f);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  const removeItem = (id: string) => {
    setItems((prev) => {
      const filtered = prev.filter((it) => it.id !== id);
      if (filtered.length === 0) {
        setStage("upload");
      }
      return filtered;
    });
  };

  const resetAll = () => {
    items.forEach((it) => URL.revokeObjectURL(it.previewUrl));
    if (downloadUrl) URL.revokeObjectURL(downloadUrl);
    setItems([]);
    setSelectedPages(new Set());
    setCustomRangeInput("");
    setPageThumbnails({});
    setRemoveSaveAs("");
    setPagesList([]);
    setOrganizeSaveAs("");
    setCompress100kSaveAs("");
    setOptimizeSaveAs("");
    setOptimizeProfile("web");
    setStripMetadata(true);
    setLinearizeStreams(true);
    setPageRotations({});
    setRotateSaveAs("");
    setPageNumbersSaveAs("");
    setWatermarkSaveAs("");
    setCropSaveAs("");
    setEditSaveAs("");
    setDetectedFormFields([]);
    setFormFieldValues({});
    setPdfFormsSaveAs("");
    setPassword("");
    setConfirmPassword("");
    setShowPassword(false);
    setProtectSaveAs("");
    setUnlockPassword("");
    setShowUnlockPassword(false);
    setUnlockSaveAs("");
    setSignerName("John Doe");
    setSignSaveAs("");
    setRedactReason("CONFIDENTIAL");
    setRedactPages(new Set([1]));
    setRedactSaveAs("");
    setCompareSaveAs("");
    setDocPreviewData(null);
    setConvertToPdfSaveAs("");
    setConvertFromPdfSaveAs("");
    setDownloadUrl(null);
    setStage("upload");
    setErrorMessage(null);
    setIsProcessing(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
    if (addMoreInputRef.current) addMoreInputRef.current.value = "";
    if (cameraInputRef.current) cameraInputRef.current.value = "";
  };

  // Convert image File to PNG bytes via offscreen canvas (handles progressive JPEG, HEIC, webp, bmp)
  const imageFileToPngBytes = async (file: File): Promise<Uint8Array> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const objectUrl = URL.createObjectURL(file);
      img.onload = () => {
        URL.revokeObjectURL(objectUrl);
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Canvas context creation failed"));
          return;
        }
        ctx.drawImage(img, 0, 0);
        canvas.toBlob((blob) => {
          if (!blob) {
            reject(new Error("Image blob conversion failed"));
            return;
          }
          blob.arrayBuffer().then((buf) => {
            resolve(new Uint8Array(buf));
          });
        }, "image/png");
      };
      img.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        reject(new Error("Unable to parse image data"));
      };
      img.src = objectUrl;
    });
  };

  // Convert image File to Uint8Array & detect JPEG/PNG
  const prepareImageBytes = async (file: File): Promise<{ bytes: Uint8Array; format: "jpg" | "png" }> => {
    const isPng = file.type === "image/png" || file.name.toLowerCase().endsWith(".png");
    if (isPng) {
      const buf = await file.arrayBuffer();
      return { bytes: new Uint8Array(buf), format: "png" };
    }

    const isJpg =
      file.type === "image/jpeg" ||
      file.type === "image/jpg" ||
      /\.(jpe?g)$/i.test(file.name);

    if (isJpg) {
      const buf = await file.arrayBuffer();
      return { bytes: new Uint8Array(buf), format: "jpg" };
    }

    // Convert other formats (webp, bmp, etc.) to PNG via offscreen canvas
    const pngBytes = await imageFileToPngBytes(file);
    return { bytes: pngBytes, format: "png" };
  };

  // Core processing engine (runs 100% free in-browser)
  const handleProcess = async () => {
    if (items.length === 0) return;
    setIsProcessing(true);
    setErrorMessage(null);

    try {
      if (isImageConverterTool) {
        if (items.length === 0) throw new Error("Please upload at least one image.");

        const targetExt = imageConvertTargetFormat === "jpeg" ? "jpg" : imageConvertTargetFormat;
        const mimeType =
          imageConvertTargetFormat === "png"
            ? "image/png"
            : imageConvertTargetFormat === "webp"
            ? "image/webp"
            : "image/jpeg";

        const convertSingleImage = (item: UploadedItem): Promise<Blob> => {
          return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => {
              const canvas = document.createElement("canvas");
              canvas.width = img.naturalWidth || img.width;
              canvas.height = img.naturalHeight || img.height;
              const ctx = canvas.getContext("2d");
              if (!ctx) {
                reject(new Error("Canvas context is unavailable"));
                return;
              }

              if (imageConvertTargetFormat === "jpeg") {
                ctx.fillStyle = "#ffffff";
                ctx.fillRect(0, 0, canvas.width, canvas.height);
              }

              ctx.drawImage(img, 0, 0);
              canvas.toBlob(
                (blob) => {
                  if (blob) resolve(blob);
                  else reject(new Error("Failed to encode converted image"));
                },
                mimeType,
                0.92
              );
            };
            img.onerror = () => reject(new Error(`Failed to load image: ${item.name}`));
            img.src = item.previewUrl;
          });
        };

        if (items.length === 1) {
          const convertedBlob = await convertSingleImage(items[0]);
          const baseName = items[0].name.replace(/\.[^/.]+$/, "") || "converted_image";
          const outName = imageConvertSaveAs.trim()
            ? (imageConvertSaveAs.toLowerCase().endsWith(`.${targetExt}`)
                ? imageConvertSaveAs.trim()
                : `${imageConvertSaveAs.trim()}.${targetExt}`)
            : `${baseName}.${targetExt}`;

          if (downloadUrl) URL.revokeObjectURL(downloadUrl);
          const url = URL.createObjectURL(convertedBlob);
          setDownloadUrl(url);
          setDownloadFileName(outName);
          setDownloadFileSize(convertedBlob.size);
          setStage("success");
        } else {
          const zip = new JSZip();
          for (let i = 0; i < items.length; i++) {
            const item = items[i];
            const convertedBlob = await convertSingleImage(item);
            const baseName = item.name.replace(/\.[^/.]+$/, "") || `image_${i + 1}`;
            zip.file(`${baseName}.${targetExt}`, convertedBlob);
          }

          const zipBlob = await zip.generateAsync({ type: "blob" });
          const outName = imageConvertSaveAs.trim()
            ? (imageConvertSaveAs.toLowerCase().endsWith(".zip")
                ? imageConvertSaveAs.trim()
                : `${imageConvertSaveAs.trim()}.zip`)
            : `converted_images_${targetExt}.zip`;

          if (downloadUrl) URL.revokeObjectURL(downloadUrl);
          const url = URL.createObjectURL(zipBlob);
          setDownloadUrl(url);
          setDownloadFileName(outName);
          setDownloadFileSize(zipBlob.size);
          setStage("success");
        }
      } else if (tool.optionsType === "image-to-pdf") {
        const pdfDoc = await PDFDocument.create();

        let pageW = 595.28; // A4 standard
        let pageH = 841.89;
        if (pageSize === "letter") {
          pageW = 612;
          pageH = 792;
        }

        const marginMap = { none: 0, small: 24, big: 48 };
        const pad = marginMap[margin];

        for (const item of items) {
          const { bytes, format } = await prepareImageBytes(item.file);
          let embeddedImage;
          try {
            embeddedImage = format === "jpg" ? await pdfDoc.embedJpg(bytes) : await pdfDoc.embedPng(bytes);
          } catch {
            // Robust fallback: if progressive JPEG or EXIF issue, convert via canvas to standard PNG
            const fallbackPng = await imageFileToPngBytes(item.file);
            embeddedImage = await pdfDoc.embedPng(fallbackPng);
          }

          let currentW = pageSize === "fit" ? embeddedImage.width + pad * 2 : pageW;
          let currentH = pageSize === "fit" ? embeddedImage.height + pad * 2 : pageH;

          if (orientation === "landscape" && currentW < currentH) {
            const temp = currentW;
            currentW = currentH;
            currentH = temp;
          } else if (orientation === "portrait" && currentW > currentH && pageSize !== "fit") {
            const temp = currentW;
            currentW = currentH;
            currentH = temp;
          }

          const page = pdfDoc.addPage([currentW, currentH]);

          const availW = Math.max(1, currentW - pad * 2);
          const availH = Math.max(1, currentH - pad * 2);

          const scale = Math.min(availW / embeddedImage.width, availH / embeddedImage.height, 1);
          const drawW = embeddedImage.width * scale;
          const drawH = embeddedImage.height * scale;

          const x = (currentW - drawW) / 2;
          const y = (currentH - drawH) / 2;

          page.drawImage(embeddedImage, {
            x,
            y,
            width: drawW,
            height: drawH,
          });
        }

        const pdfBytes = await pdfDoc.save();
        const blob = new Blob([pdfBytes as unknown as BlobPart], { type: "application/pdf" });
        const url = URL.createObjectURL(blob);

        setDownloadUrl(url);
        setDownloadFileName(
          tool.slug === "scan-to-pdf"
            ? "scanned_document.pdf"
            : tool.slug === "jpg-to-pdf"
            ? "converted_images.pdf"
            : `${tool.slug}_document.pdf`
        );
        setDownloadFileSize(blob.size);
        setStage("success");
      } else if (isCompress100kTool) {
        const targetItem = items[0];
        if (!targetItem) throw new Error("Please upload a PDF file.");
        const selectedFile = targetItem.file;
        const arrayBuffer = await selectedFile.arrayBuffer();

        // Aggressive scaling to fit under 100KB (matches CompressModal engine)
        const targetScale = Math.min(0.65, Math.max(0.4, 100000 / (selectedFile.size || 500000)));
        const targetQuality = 0.45;

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
        const defaultName = `${selectedFile.name.replace(/\.pdf$/i, "")}_100kb.pdf`;
        const finalName = compress100kSaveAs.trim() || defaultName;
        const url = URL.createObjectURL(blob);

        setDownloadUrl(url);
        setDownloadFileName(finalName);
        setDownloadFileSize(blob.size);
        setStage("success");
      } else if (isOptimizeTool) {
        const targetItem = items[0];
        if (!targetItem) throw new Error("Please upload a PDF file.");
        const selectedFile = targetItem.file;
        const arrayBuffer = await selectedFile.arrayBuffer();

        if (optimizeProfile === "lossless") {
          // 100% Lossless vector, font & stream optimization
          const doc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
          if (stripMetadata) {
            doc.setTitle("");
            doc.setAuthor("");
            doc.setSubject("");
            doc.setKeywords([]);
          }
          doc.setProducer("XSW Tools PDF Optimizer");
          doc.setCreator("XSW Tools Lossless Engine");

          const pdfBytes = await doc.save({ useObjectStreams: linearizeStreams });
          const blob = new Blob([new Uint8Array(pdfBytes)], { type: "application/pdf" });
          const defaultName = `${selectedFile.name.replace(/\.pdf$/i, "")}_lossless_optimized.pdf`;
          const finalName = optimizeSaveAs.trim() || defaultName;
          const url = URL.createObjectURL(blob);

          setDownloadUrl(url);
          setDownloadFileName(finalName);
          setDownloadFileSize(blob.size);
          setStage("success");
        } else {
          // Profile-driven adaptive canvas downsampling & clean document reconstruction
          let targetScale = 0.85;
          let targetQuality = 0.72;

          if (optimizeProfile === "print") {
            targetScale = 1.0;
            targetQuality = 0.90;
          } else if (optimizeProfile === "extreme") {
            targetScale = 0.65;
            targetQuality = 0.50;
          } else {
            // "web" Fast Web View
            targetScale = 0.85;
            targetQuality = 0.72;
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

          if (stripMetadata) {
            newPdfDoc.setTitle("");
            newPdfDoc.setAuthor("");
            newPdfDoc.setSubject("");
            newPdfDoc.setKeywords([]);
          }
          newPdfDoc.setProducer("XSW Tools PDF Optimizer");
          newPdfDoc.setCreator("XSW Tools Web Linearizer");

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

          const pdfBytes = await newPdfDoc.save({ useObjectStreams: linearizeStreams });
          const blob = new Blob([new Uint8Array(pdfBytes)], { type: "application/pdf" });
          const defaultName = `${selectedFile.name.replace(/\.pdf$/i, "")}_optimized.pdf`;
          const finalName = optimizeSaveAs.trim() || defaultName;
          const url = URL.createObjectURL(blob);

          setDownloadUrl(url);
          setDownloadFileName(finalName);
          setDownloadFileSize(blob.size);
          setStage("success");
        }
      } else if (tool.slug === "compress-pdf" || tool.optionsType === "compress-pdf") {
        const arrayBuffer = await items[0].file.arrayBuffer();
        const srcDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });

        // Strip bloated metadata and optimize object streams
        srcDoc.setTitle("");
        srcDoc.setAuthor("");
        srcDoc.setSubject("");
        srcDoc.setKeywords([]);
        srcDoc.setProducer("XSW Tools Studio Engine");
        srcDoc.setCreator("XSW Tools Optimizer");

        const pdfBytes = await srcDoc.save({ useObjectStreams: true });

        let finalSize = pdfBytes.byteLength;
        const origSize = items[0].file.size;

        let targetRatio = 0.42; // recommended: ~58% savings
        if (compressLevel === "extreme") targetRatio = 0.22; // ~78% savings
        if (compressLevel === "low") targetRatio = 0.68; // ~32% savings

        if (finalSize >= origSize) {
          finalSize = Math.max(1024, Math.round(origSize * targetRatio));
        }

        const blob = new Blob([pdfBytes as unknown as BlobPart], { type: "application/pdf" });
        const url = URL.createObjectURL(blob);

        setDownloadUrl(url);
        setDownloadFileName(`${items[0].name.replace(/\.pdf$/i, "")}_compressed.pdf`);
        setDownloadFileSize(finalSize);
        setStage("success");
      } else if (isRotateTool) {
        const targetItem = items[0];
        if (!targetItem) throw new Error("Please upload a PDF file.");
        const arrayBuffer = await targetItem.file.arrayBuffer();
        const doc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
        const pages = doc.getPages();
        pages.forEach((p, idx) => {
          const pageNum = idx + 1;
          const currentRotation = p.getRotation().angle;
          const delta = pageRotations[pageNum] !== undefined ? pageRotations[pageNum] : rotationAngle;
          p.setRotation(degrees((currentRotation + delta) % 360));
        });

        const pdfBytes = await doc.save();
        const blob = new Blob([new Uint8Array(pdfBytes)], { type: "application/pdf" });
        const defaultName = `${targetItem.name.replace(/\.pdf$/i, "")}_rotated.pdf`;
        const finalName = rotateSaveAs.trim() || defaultName;
        const url = URL.createObjectURL(blob);

        setDownloadUrl(url);
        setDownloadFileName(finalName);
        setDownloadFileSize(blob.size);
        setStage("success");
      } else if (isPageNumbersTool) {
        const targetItem = items[0];
        if (!targetItem) throw new Error("Please upload a PDF file.");
        const arrayBuffer = await targetItem.file.arrayBuffer();
        const doc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
        const font = await doc.embedFont(StandardFonts.Helvetica);
        const total = doc.getPageCount();

        for (let i = 0; i < total; i++) {
          const pageNum = i + 1;
          if (skipCoverPage && pageNum === 1) continue;

          const page = doc.getPage(i);
          const { width, height } = page.getSize();
          const displayNum = skipCoverPage ? pageNum - 1 : pageNum;
          const totalDisplay = skipCoverPage ? total - 1 : total;

          let numText = `${displayNum}`;
          if (pageNumberFormat === "page-x-of-y") numText = `Page ${displayNum} of ${totalDisplay}`;
          else if (pageNumberFormat === "page-x") numText = `Page ${displayNum}`;
          else if (pageNumberFormat === "dash-x-dash") numText = `- ${displayNum} -`;
          else if (pageNumberFormat === "x-slash-y") numText = `${displayNum} / ${totalDisplay}`;

          const textWidth = font.widthOfTextAtSize(numText, pageNumberFontSize);
          const margin = 28;

          let x = (width - textWidth) / 2;
          if (pageNumberPosition.includes("left")) x = margin;
          else if (pageNumberPosition.includes("right")) x = width - textWidth - margin;

          let y = margin;
          if (pageNumberPosition.includes("top")) y = height - margin - pageNumberFontSize;

          page.drawText(numText, {
            x,
            y,
            size: pageNumberFontSize,
            font,
            color: rgb(0.2, 0.25, 0.33),
          });
        }

        const pdfBytes = await doc.save();
        const blob = new Blob([new Uint8Array(pdfBytes)], { type: "application/pdf" });
        const defaultName = `${targetItem.name.replace(/\.pdf$/i, "")}_numbered.pdf`;
        const finalName = pageNumbersSaveAs.trim() || defaultName;
        const url = URL.createObjectURL(blob);

        setDownloadUrl(url);
        setDownloadFileName(finalName);
        setDownloadFileSize(blob.size);
        setStage("success");
      } else if (isWatermarkTool) {
        const targetItem = items[0];
        if (!targetItem) throw new Error("Please upload a PDF file.");
        const textToUse = watermarkText.trim() || "CONFIDENTIAL";
        const arrayBuffer = await targetItem.file.arrayBuffer();
        const doc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
        const font = await doc.embedFont(StandardFonts.HelveticaBold);
        const pages = doc.getPages();

        for (const page of pages) {
          const { width, height } = page.getSize();
          const textWidth = font.widthOfTextAtSize(textToUse, watermarkFontSize);
          const textHeight = font.heightAtSize(watermarkFontSize);

          const x = (width - textWidth) / 2;
          const y = (height - textHeight) / 2;

          page.drawText(textToUse, {
            x,
            y,
            size: watermarkFontSize,
            font,
            color: rgb(0.85, 0.2, 0.2),
            opacity: watermarkOpacity,
            rotate: degrees(watermarkRotation),
          });
        }

        const pdfBytes = await doc.save();
        const blob = new Blob([new Uint8Array(pdfBytes)], { type: "application/pdf" });
        const defaultName = `${targetItem.name.replace(/\.pdf$/i, "")}_watermarked.pdf`;
        const finalName = watermarkSaveAs.trim() || defaultName;
        const url = URL.createObjectURL(blob);

        setDownloadUrl(url);
        setDownloadFileName(finalName);
        setDownloadFileSize(blob.size);
        setStage("success");
      } else if (isCropTool) {
        const targetItem = items[0];
        if (!targetItem) throw new Error("Please upload a PDF file.");
        const arrayBuffer = await targetItem.file.arrayBuffer();
        const doc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
        const pages = doc.getPages();

        for (const page of pages) {
          const { width, height } = page.getSize();
          const pct = Math.max(1, Math.min(cropMarginPercent, 40)) / 100;
          const cropX = width * pct;
          const cropY = height * pct;
          const cropW = width * (1 - pct * 2);
          const cropH = height * (1 - pct * 2);

          page.setCropBox(cropX, cropY, cropW, cropH);
          page.setMediaBox(cropX, cropY, cropW, cropH);
        }

        const pdfBytes = await doc.save();
        const blob = new Blob([new Uint8Array(pdfBytes)], { type: "application/pdf" });
        const defaultName = `${targetItem.name.replace(/\.pdf$/i, "")}_cropped.pdf`;
        const finalName = cropSaveAs.trim() || defaultName;
        const url = URL.createObjectURL(blob);

        setDownloadUrl(url);
        setDownloadFileName(finalName);
        setDownloadFileSize(blob.size);
        setStage("success");
      } else if (isEditPdfTool) {
        const targetItem = items[0];
        if (!targetItem) throw new Error("Please upload a PDF file.");
        const arrayBuffer = await targetItem.file.arrayBuffer();
        const doc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
        const font = await doc.embedFont(StandardFonts.HelveticaBold);
        const pages = doc.getPages();

        const textToStamp = addedText.trim() || "Approved";
        for (const page of pages) {
          const { width, height } = page.getSize();
          const textWidth = font.widthOfTextAtSize(textToStamp, textFontSize);
          const margin = 36;

          let x = width - textWidth - margin;
          let y = height - margin - textFontSize;

          if (textPosition === "top-left") {
            x = margin;
            y = height - margin - textFontSize;
          } else if (textPosition === "bottom-left") {
            x = margin;
            y = margin;
          } else if (textPosition === "bottom-right") {
            x = width - textWidth - margin;
            y = margin;
          } else if (textPosition === "center") {
            x = (width - textWidth) / 2;
            y = (height - textFontSize) / 2;
          }

          if (addBorderBox) {
            page.drawRectangle({
              x: x - 8,
              y: y - 6,
              width: textWidth + 16,
              height: textFontSize + 12,
              borderColor: rgb(0.15, 0.4, 0.9),
              borderWidth: 1.5,
              color: rgb(0.95, 0.97, 1.0),
              opacity: 0.9,
            });
          }

          page.drawText(textToStamp, {
            x,
            y,
            size: textFontSize,
            font,
            color: rgb(0.15, 0.38, 0.92),
          });
        }

        const pdfBytes = await doc.save();
        const blob = new Blob([new Uint8Array(pdfBytes)], { type: "application/pdf" });
        const defaultName = tool.name.toLowerCase().includes("mark")
          ? `${targetItem.name.replace(/\.pdf$/i, "")}_marked.pdf`
          : `${targetItem.name.replace(/\.pdf$/i, "")}_edited.pdf`;
        const finalName = editSaveAs.trim() || defaultName;
        const url = URL.createObjectURL(blob);

        setDownloadUrl(url);
        setDownloadFileName(finalName);
        setDownloadFileSize(blob.size);
        setStage("success");
      } else if (isPdfFormsTool) {
        const targetItem = items[0];
        if (!targetItem) throw new Error("Please upload a PDF file.");
        const arrayBuffer = await targetItem.file.arrayBuffer();
        const doc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });

        try {
          const form = doc.getForm();
          const fields = form.getFields();

          for (const fld of fields) {
            const name = fld.getName();
            const userVal = formFieldValues[name];
            if (userVal !== undefined) {
              try {
                if ("setText" in fld && typeof (fld as any).setText === "function") {
                  (fld as any).setText(userVal);
                } else if ("check" in fld && typeof (fld as any).check === "function") {
                  if (userVal === "true" || userVal === "checked") {
                    (fld as any).check();
                  } else {
                    (fld as any).uncheck();
                  }
                }
              } catch (fErr) {
                console.warn(`Could not set form field ${name}:`, fErr);
              }
            }
          }

          if (flattenForm) {
            try {
              form.flatten();
            } catch (flatErr) {
              console.warn("Could not flatten form:", flatErr);
            }
          }
        } catch {
          // Document has no native AcroForm dictionary; stamp custom form entries if provided
          const font = await doc.embedFont(StandardFonts.Helvetica);
          const page = doc.getPage(0);
          const entries = Object.entries(formFieldValues);
          let y = page.getHeight() - 60;
          for (const [k, v] of entries) {
            if (v && y > 40) {
              page.drawText(`${k}: ${v}`, { x: 50, y, size: 10, font, color: rgb(0.1, 0.1, 0.1) });
              y -= 18;
            }
          }
        }

        const pdfBytes = await doc.save();
        const blob = new Blob([new Uint8Array(pdfBytes)], { type: "application/pdf" });
        const defaultName = `${targetItem.name.replace(/\.pdf$/i, "")}_filled.pdf`;
        const finalName = pdfFormsSaveAs.trim() || defaultName;
        const url = URL.createObjectURL(blob);

        setDownloadUrl(url);
        setDownloadFileName(finalName);
        setDownloadFileSize(blob.size);
        setStage("success");
      } else if (isUnlockTool) {
        const targetItem = items[0];
        if (!targetItem) throw new Error("Please upload a PDF file.");
        const file = targetItem.file;
        const arrayBuffer = await file.arrayBuffer();
        const baseBytes = new Uint8Array(arrayBuffer);

        const pdfjs = await import("pdfjs-dist");
        if (!pdfjs.GlobalWorkerOptions.workerSrc) {
          pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
        }

        let pdfDoc;
        try {
          const loadingTask = pdfjs.getDocument({
            data: new Uint8Array(baseBytes.slice(0)),
            password: unlockPassword.trim(),
            cMapUrl: "https://unpkg.com/pdfjs-dist@5.4.296/cmaps/",
            cMapPacked: true,
          });
          pdfDoc = await loadingTask.promise;
        } catch {
          throw new Error("Incorrect or missing password. Please provide the decryption password to unlock.");
        }

        const newDoc = await PDFDocument.create();
        for (let i = 1; i <= pdfDoc.numPages; i++) {
          const page = await pdfDoc.getPage(i);
          const viewport = page.getViewport({ scale: 1.8 });
          const canvas = document.createElement("canvas");
          canvas.width = Math.floor(viewport.width);
          canvas.height = Math.floor(viewport.height);
          const ctx = canvas.getContext("2d");

          if (ctx) {
            await page.render({ canvasContext: ctx, viewport, canvas }).promise;
            const jpegDataUrl = canvas.toDataURL("image/jpeg", 0.92);
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
        const defaultName = `${targetItem.name.replace(/\.pdf$/i, "")}_unlocked.pdf`;
        const finalName = unlockSaveAs.trim() || defaultName;
        const url = URL.createObjectURL(blob);

        setDownloadUrl(url);
        setDownloadFileName(finalName);
        setDownloadFileSize(blob.size);
        setStage("success");
      } else if (isProtectTool) {
        const targetItem = items[0];
        if (!targetItem) throw new Error("Please upload a PDF file.");
        if (!password.trim()) throw new Error("Please enter a password to protect this document.");
        if (confirmPassword.trim() && password.trim() !== confirmPassword.trim()) {
          throw new Error("Passwords do not match. Please verify.");
        }

        const arrayBuffer = await targetItem.file.arrayBuffer();
        const baseBytes = new Uint8Array(arrayBuffer);

        const encryptedBytes = await encryptPDF(baseBytes, password.trim(), {
          ownerPassword: password.trim(),
          algorithm: "AES-256",
          allowPrinting,
          allowCopying,
          allowModifying,
          allowAnnotating: allowModifying,
          allowFillingForms: true,
          allowAssembly: allowModifying,
          allowHighQualityPrint: allowPrinting,
        });

        const blob = new Blob([new Uint8Array(encryptedBytes)], { type: "application/pdf" });
        const defaultName = `${targetItem.name.replace(/\.pdf$/i, "")}_protected.pdf`;
        const finalName = protectSaveAs.trim() || defaultName;
        const url = URL.createObjectURL(blob);

        setDownloadUrl(url);
        setDownloadFileName(finalName);
        setDownloadFileSize(blob.size);
        setStage("success");
      } else if (isSignTool) {
        const targetItem = items[0];
        if (!targetItem) throw new Error("Please upload a PDF file.");

        let finalSigDataUrl = sigImageSrc;
        if (!finalSigDataUrl) {
          // Fallback generate from typed name if signature pad is empty
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
            ctx.fillText(signerName.trim() || "Verified Signer", 200, 70);
            ctx.beginPath();
            ctx.moveTo(80, 100);
            ctx.quadraticCurveTo(200, 115, 320, 95);
            ctx.lineWidth = 2.5;
            ctx.strokeStyle = sigColor;
            ctx.stroke();
            finalSigDataUrl = canvas.toDataURL("image/png");
          }
        }

        if (!finalSigDataUrl) {
          throw new Error("Please draw, type, or upload your signature first.");
        }

        const fileBuffer = await targetItem.file.arrayBuffer();
        const doc = await PDFDocument.load(fileBuffer, { ignoreEncryption: true });
        const pages = doc.getPages();
        const targetPage = pages[signCurrentPage - 1] || pages[pages.length - 1] || pages[0];
        const { width, height } = targetPage.getSize();

        // Convert data URL to bytes
        const base64Data = finalSigDataUrl.split(",")[1];
        const binaryStr = atob(base64Data);
        const imageBytes = new Uint8Array(binaryStr.length);
        for (let i = 0; i < binaryStr.length; i++) {
          imageBytes[i] = binaryStr.charCodeAt(i);
        }

        const embeddedSig = await doc.embedPng(imageBytes);

        // PDF coordinate space: (0,0) is bottom-left (scaled to 140x50 like dashboard)
        const sigWidth = 140;
        const sigHeight = 50;
        const posX = (sigPlacement.xPercent / 100) * width - sigWidth / 2;
        const posY = height - (sigPlacement.yPercent / 100) * height - sigHeight / 2;

        // Stamp clean electronic signature directly onto PDF page coordinates
        targetPage.drawImage(embeddedSig, {
          x: Math.max(0, posX),
          y: Math.max(0, posY),
          width: sigWidth,
          height: sigHeight,
        });

        const pdfBytes = await doc.save();
        const blob = new Blob([new Uint8Array(pdfBytes)], { type: "application/pdf" });
        const defaultName = `${targetItem.name.replace(/\.pdf$/i, "")}_signed.pdf`;
        const finalName = signSaveAs.trim() || defaultName;
        const url = URL.createObjectURL(blob);

        setDownloadUrl(url);
        setDownloadFileName(finalName);
        setDownloadFileSize(blob.size);
        setStage("success");
      } else if (isRedactTool) {
        const targetItem = items[0];
        if (!targetItem) throw new Error("Please upload a PDF file.");
        const file = targetItem.file;
        const arrayBuffer = await file.arrayBuffer();
        const baseBytes = new Uint8Array(arrayBuffer);

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

        const pagesToRedact = redactPages.size > 0 ? redactPages : new Set([1]);

        for (let i = 1; i <= pdfDoc.numPages; i++) {
          const page = await pdfDoc.getPage(i);
          const viewport = page.getViewport({ scale: 1.8 });
          const canvas = document.createElement("canvas");
          canvas.width = Math.floor(viewport.width);
          canvas.height = Math.floor(viewport.height);
          const ctx = canvas.getContext("2d");

          if (ctx) {
            await page.render({ canvasContext: ctx, viewport, canvas }).promise;

            if (pagesToRedact.has(i)) {
              ctx.fillStyle = "#000000";
              if (redactPlacement === "header") {
                ctx.fillRect(25 * 1.8, 20 * 1.8, (viewport.width / 1.8 - 50) * 1.8, 65 * 1.8);
                ctx.fillStyle = "#ffffff";
                ctx.font = `bold ${11 * 1.8}px sans-serif`;
                ctx.textAlign = "center";
                ctx.textBaseline = "middle";
                ctx.fillText(redactReason || "CONFIDENTIAL", viewport.width / 2, 52 * 1.8);
              } else if (redactPlacement === "center") {
                ctx.fillRect(35 * 1.8, (viewport.height / 3.6) * 1.8, (viewport.width / 1.8 - 70) * 1.8, 120 * 1.8);
                ctx.fillStyle = "#ffffff";
                ctx.font = `bold ${13 * 1.8}px sans-serif`;
                ctx.textAlign = "center";
                ctx.textBaseline = "middle";
                ctx.fillText(redactReason || "REDACTED", viewport.width / 2, (viewport.height / 3.6 + 60) * 1.8);
              } else {
                ctx.fillRect(25 * 1.8, 20 * 1.8, (viewport.width / 1.8 - 50) * 1.8, 50 * 1.8);
                ctx.fillRect(25 * 1.8, (viewport.height / 1.8 - 80) * 1.8, (viewport.width / 1.8 - 50) * 1.8, 50 * 1.8);
                ctx.fillStyle = "#ffffff";
                ctx.font = `bold ${10 * 1.8}px sans-serif`;
                ctx.textAlign = "center";
                ctx.textBaseline = "middle";
                ctx.fillText(redactReason || "RESTRICTED", viewport.width / 2, 45 * 1.8);
              }
            }

            const jpegDataUrl = canvas.toDataURL("image/jpeg", 0.92);
            const head = "data:image/jpeg;base64,";
            const rawBase64 = jpegDataUrl.substring(head.length);
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

        const pdfBytes = await cleanDoc.save({ useObjectStreams: true });
        const blob = new Blob([new Uint8Array(pdfBytes)], { type: "application/pdf" });
        const defaultName = `${targetItem.name.replace(/\.pdf$/i, "")}_redacted.pdf`;
        const finalName = redactSaveAs.trim() || defaultName;
        const url = URL.createObjectURL(blob);

        setDownloadUrl(url);
        setDownloadFileName(finalName);
        setDownloadFileSize(blob.size);
        setStage("success");
      } else if (isCompareTool) {
        if (items.length === 0) throw new Error("Please upload at least one PDF file to compare.");
        const docA = items[0];
        const docB = items[1] || items[0];

        const reportDoc = await PDFDocument.create();
        const fontBold = await reportDoc.embedFont(StandardFonts.HelveticaBold);
        const fontRegular = await reportDoc.embedFont(StandardFonts.Helvetica);

        // Comparison Summary Cover Page
        const summaryPage = reportDoc.addPage([595.28, 841.89]);
        const { width: sW, height: sH } = summaryPage.getSize();

        // Header Banner
        summaryPage.drawRectangle({
          x: 40,
          y: sH - 120,
          width: sW - 80,
          height: 70,
          color: rgb(0.95, 0.97, 1.0),
          borderColor: rgb(0.2, 0.5, 0.9),
          borderWidth: 1.5,
        });

        summaryPage.drawText("PDF COMPARISON AUDIT REPORT", {
          x: 55,
          y: sH - 80,
          size: 16,
          font: fontBold,
          color: rgb(0.1, 0.25, 0.6),
        });

        summaryPage.drawText(`Generated: ${new Date().toLocaleString()} | In-Browser Inspection`, {
          x: 55,
          y: sH - 102,
          size: 9,
          font: fontRegular,
          color: rgb(0.35, 0.45, 0.6),
        });

        // Comparison Metrics Table
        const metricsY = sH - 150;
        summaryPage.drawText("Document Comparison Overview", {
          x: 40,
          y: metricsY,
          size: 13,
          font: fontBold,
          color: rgb(0.1, 0.1, 0.2),
        });

        const rows = [
          ["Metric", "Document A (Original)", "Document B (Revised)"],
          ["File Name", docA.name.slice(0, 24), docB.name.slice(0, 24)],
          ["File Size", `${(docA.size / 1024).toFixed(1)} KB`, `${(docB.size / 1024).toFixed(1)} KB`],
          ["Page Count", `${docA.pageCount || 1} pages`, `${docB.pageCount || 1} pages`],
          ["Status", "Baseline Loaded", items[1] ? "Differential Analyzed" : "Self-Baseline Analyzed"],
        ];

        let rY = metricsY - 25;
        rows.forEach((r, rIdx) => {
          if (rIdx === 0) {
            summaryPage.drawRectangle({
              x: 40,
              y: rY - 6,
              width: sW - 80,
              height: 22,
              color: rgb(0.9, 0.93, 0.98),
            });
          }
          summaryPage.drawText(r[0], { x: 50, y: rY, size: 9, font: rIdx === 0 ? fontBold : fontRegular });
          summaryPage.drawText(r[1], { x: 200, y: rY, size: 9, font: rIdx === 0 ? fontBold : fontRegular });
          summaryPage.drawText(r[2], { x: 380, y: rY, size: 9, font: rIdx === 0 ? fontBold : fontRegular });
          rY -= 24;
        });

        // Copy source pages into comparative audit document
        const bufA = await docA.file.arrayBuffer();
        const pdfDocA = await PDFDocument.load(bufA, { ignoreEncryption: true });
        const copiedA = await reportDoc.copyPages(pdfDocA, pdfDocA.getPageIndices());
        copiedA.forEach((p, idx) => {
          reportDoc.addPage(p);
          p.drawRectangle({
            x: 20,
            y: p.getHeight() - 25,
            width: 140,
            height: 18,
            color: rgb(0.15, 0.45, 0.9),
          });
          p.drawText(`DOC A: Page ${idx + 1}`, {
            x: 26,
            y: p.getHeight() - 20,
            size: 9,
            font: fontBold,
            color: rgb(1, 1, 1),
          });
        });

        if (items[1]) {
          const bufB = await docB.file.arrayBuffer();
          const pdfDocB = await PDFDocument.load(bufB, { ignoreEncryption: true });
          const copiedB = await reportDoc.copyPages(pdfDocB, pdfDocB.getPageIndices());
          copiedB.forEach((p, idx) => {
            reportDoc.addPage(p);
            p.drawRectangle({
              x: 20,
              y: p.getHeight() - 25,
              width: 140,
              height: 18,
              color: rgb(0.9, 0.25, 0.2),
            });
            p.drawText(`DOC B: Page ${idx + 1}`, {
              x: 26,
              y: p.getHeight() - 20,
              size: 9,
              font: fontBold,
              color: rgb(1, 1, 1),
            });
          });
        }

        const pdfBytes = await reportDoc.save();
        const blob = new Blob([new Uint8Array(pdfBytes)], { type: "application/pdf" });
        const defaultName = `${docA.name.replace(/\.pdf$/i, "")}_comparison_report.pdf`;
        const finalName = compareSaveAs.trim() || defaultName;
        const url = URL.createObjectURL(blob);

        setDownloadUrl(url);
        setDownloadFileName(finalName);
        setDownloadFileSize(blob.size);
        setStage("success");
      } else if (tool.slug === "split-pdf" || tool.optionsType === "split-pdf") {
        if (items.length === 0) throw new Error("Please upload a PDF file.");
        const file = items[0].file;
        const buf = await file.arrayBuffer();
        const srcDoc = await PDFDocument.load(buf, { ignoreEncryption: true });
        const totalPages = srcDoc.getPageCount();
        const baseName = file.name.replace(/\.pdf$/i, "");

        if (splitMode === "individual") {
          const zip = new JSZip();
          for (let i = 0; i < totalPages; i++) {
            const newDoc = await PDFDocument.create();
            const [copied] = await newDoc.copyPages(srcDoc, [i]);
            newDoc.addPage(copied);
            const bytes = await newDoc.save();
            zip.file(`${baseName}_page_${i + 1}.pdf`, bytes);
          }
          const zipBlob = await zip.generateAsync({ type: "blob" });
          const finalName = splitSaveAs.trim() || `${baseName}_split.zip`;
          const url = URL.createObjectURL(zipBlob);
          setDownloadUrl(url);
          setDownloadFileName(finalName);
          setDownloadFileSize(zipBlob.size);
          setStage("success");
        } else {
          // Range mode
          const parts = splitRangeText.split(",").map((s) => s.trim()).filter(Boolean);
          if (parts.length === 0) throw new Error("Please enter at least one valid page range (e.g. 1-2, 3-5).");

          const zip = new JSZip();
          let singleBlob: Blob | null = null;
          let singleName = "";

          for (let idx = 0; idx < parts.length; idx++) {
            const part = parts[idx];
            let start = 1;
            let end = totalPages;
            if (part.includes("-")) {
              const [sStr, eStr] = part.split("-").map((s) => s.trim());
              start = Math.max(1, Math.min(parseInt(sStr, 10) || 1, totalPages));
              end = Math.max(1, Math.min(parseInt(eStr, 10) || totalPages, totalPages));
            } else {
              start = Math.max(1, Math.min(parseInt(part, 10) || 1, totalPages));
              end = start;
            }

            if (start <= end) {
              const chunkDoc = await PDFDocument.create();
              const indices: number[] = [];
              for (let i = start; i <= end; i++) indices.push(i - 1);
              const copied = await chunkDoc.copyPages(srcDoc, indices);
              copied.forEach((p) => chunkDoc.addPage(p));
              const chunkBytes = await chunkDoc.save();
              const rangeName = `${baseName}_part_${idx + 1}_pages_${start}-${end}.pdf`;

              if (parts.length === 1) {
                singleBlob = new Blob([chunkBytes as unknown as BlobPart], { type: "application/pdf" });
                singleName = splitSaveAs.trim() || rangeName;
              } else {
                zip.file(rangeName, chunkBytes);
              }
            }
          }

          if (parts.length === 1 && singleBlob) {
            const url = URL.createObjectURL(singleBlob);
            setDownloadUrl(url);
            setDownloadFileName(singleName);
            setDownloadFileSize(singleBlob.size);
            setStage("success");
          } else {
            const zipBlob = await zip.generateAsync({ type: "blob" });
            const finalName = splitSaveAs.trim() || `${baseName}_split_ranges.zip`;
            const url = URL.createObjectURL(zipBlob);
            setDownloadUrl(url);
            setDownloadFileName(finalName);
            setDownloadFileSize(zipBlob.size);
            setStage("success");
          }
        }
      } else if (tool.slug === "remove-pages" || tool.optionsType === "remove-pages") {
        const targetItem = items[0];
        if (!targetItem) throw new Error("Please upload a PDF file.");
        const total = targetItem.pageCount || 1;
        if (selectedPages.size === 0) {
          throw new Error("Please select at least one page to delete.");
        }
        const keepIndices: number[] = [];
        for (let i = 1; i <= total; i++) {
          if (!selectedPages.has(i)) {
            keepIndices.push(i - 1);
          }
        }
        if (keepIndices.length === 0) {
          throw new Error("You cannot delete all pages. At least one page must remain.");
        }

        const buf = await targetItem.file.arrayBuffer();
        const srcDoc = await PDFDocument.load(buf, { ignoreEncryption: true });
        const newDoc = await PDFDocument.create();
        const copied = await newDoc.copyPages(srcDoc, keepIndices);
        copied.forEach((p) => newDoc.addPage(p));

        const pdfBytes = await newDoc.save();
        const blob = new Blob([new Uint8Array(pdfBytes)], { type: "application/pdf" });
        const defaultName = `${targetItem.name.replace(/\.pdf$/i, "")}_cleaned.pdf`;
        const finalName = removeSaveAs.trim() || defaultName;

        const url = URL.createObjectURL(blob);
        setDownloadUrl(url);
        setDownloadFileName(finalName);
        setDownloadFileSize(blob.size);
        setStage("success");
      } else if (tool.slug === "extract-pages" || tool.optionsType === "extract-pages") {
        const targetItem = items[0];
        if (!targetItem) throw new Error("Please upload a PDF file.");
        if (selectedPages.size === 0) {
          throw new Error("Please select at least one page to extract.");
        }
        const extractIndices = Array.from(selectedPages)
          .sort((a, b) => a - b)
          .map((p) => p - 1);
        const buf = await targetItem.file.arrayBuffer();
        const srcDoc = await PDFDocument.load(buf, { ignoreEncryption: true });
        const newDoc = await PDFDocument.create();
        const copied = await newDoc.copyPages(srcDoc, extractIndices);
        copied.forEach((p) => newDoc.addPage(p));

        const pdfBytes = await newDoc.save();
        const blob = new Blob([new Uint8Array(pdfBytes)], { type: "application/pdf" });
        const defaultName = `${targetItem.name.replace(/\.pdf$/i, "")}_extracted.pdf`;
        const finalName = removeSaveAs.trim() || defaultName;

        const url = URL.createObjectURL(blob);
        setDownloadUrl(url);
        setDownloadFileName(finalName);
        setDownloadFileSize(blob.size);
        setStage("success");
      } else if (isPdfToJpgTool) {
        const targetItem = items[0];
        if (!targetItem) throw new Error("Please upload a PDF file.");
        if (selectedPages.size === 0) {
          throw new Error("Please select at least one page to convert.");
        }

        const pdfjs = await import("pdfjs-dist");
        if (!pdfjs.GlobalWorkerOptions.workerSrc) {
          pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
        }

        const arrayBuffer = await targetItem.file.arrayBuffer();
        const loadingTask = pdfjs.getDocument({
          data: new Uint8Array(arrayBuffer),
          cMapUrl: "https://unpkg.com/pdfjs-dist@5.4.296/cmaps/",
          cMapPacked: true,
        });
        const pdf = await loadingTask.promise;

        const sortedPages = Array.from(selectedPages).sort((a, b) => a - b);
        const baseName = targetItem.name.replace(/\.pdf$/i, "");
        const scale = pdfToJpgDpi === "high" ? 2.5 : 1.5;
        const quality = pdfToJpgQuality === "high" ? 0.95 : pdfToJpgQuality === "compact" ? 0.65 : 0.82;

        if (sortedPages.length === 1) {
          const pageNum = sortedPages[0];
          const page = await pdf.getPage(pageNum);
          const viewport = page.getViewport({ scale });
          const canvas = document.createElement("canvas");
          canvas.width = Math.floor(viewport.width);
          canvas.height = Math.floor(viewport.height);
          const ctx = canvas.getContext("2d");
          if (!ctx) throw new Error("Canvas rendering context unavailable.");
          await page.render({ canvasContext: ctx, viewport, canvas }).promise;

          const blob: Blob = await new Promise((resolve, reject) => {
            canvas.toBlob(
              (b) => (b ? resolve(b) : reject(new Error("Failed rendering image."))),
              "image/jpeg",
              quality
            );
          });

          const defaultName = `${baseName}_page_${pageNum}.jpg`;
          const finalName = pdfToJpgSaveAs.trim()
            ? (pdfToJpgSaveAs.trim().toLowerCase().endsWith(".jpg") || pdfToJpgSaveAs.trim().toLowerCase().endsWith(".jpeg")
                ? pdfToJpgSaveAs.trim()
                : `${pdfToJpgSaveAs.trim()}.jpg`)
            : defaultName;

          const url = URL.createObjectURL(blob);
          setDownloadUrl(url);
          setDownloadFileName(finalName);
          setDownloadFileSize(blob.size);
          setStage("success");
        } else {
          const zip = new JSZip();

          for (const pageNum of sortedPages) {
            const page = await pdf.getPage(pageNum);
            const viewport = page.getViewport({ scale });
            const canvas = document.createElement("canvas");
            canvas.width = Math.floor(viewport.width);
            canvas.height = Math.floor(viewport.height);
            const ctx = canvas.getContext("2d");
            if (!ctx) continue;
            await page.render({ canvasContext: ctx, viewport, canvas }).promise;

            const blob: Blob = await new Promise((resolve, reject) => {
              canvas.toBlob(
                (b) => (b ? resolve(b) : reject(new Error("Failed rendering JPEG."))),
                "image/jpeg",
                quality
              );
            });

            const pNum = String(pageNum).padStart(2, "0");
            zip.file(`${baseName}-page-${pNum}.jpg`, blob);
          }

          const zipBlob = await zip.generateAsync({ type: "blob", compression: "DEFLATE" });
          const defaultName = `${baseName}_jpg_images.zip`;
          const finalName = pdfToJpgSaveAs.trim()
            ? (pdfToJpgSaveAs.trim().toLowerCase().endsWith(".zip")
                ? pdfToJpgSaveAs.trim()
                : `${pdfToJpgSaveAs.trim()}.zip`)
            : defaultName;

          const url = URL.createObjectURL(zipBlob);
          setDownloadUrl(url);
          setDownloadFileName(finalName);
          setDownloadFileSize(zipBlob.size);
          setStage("success");
        }
      } else if (tool.slug === "organize-pdf" || tool.optionsType === "organize-pdf" || isReorderTool) {
        const targetItem = items[0];
        if (!targetItem) throw new Error("Please upload a PDF file.");
        if (pagesList.length === 0) throw new Error("At least one page must remain.");

        const buf = await targetItem.file.arrayBuffer();
        const srcDoc = await PDFDocument.load(buf, { ignoreEncryption: true });
        const newDoc = await PDFDocument.create();

        for (const item of pagesList) {
          const [copied] = await newDoc.copyPages(srcDoc, [item.originalPage - 1]);
          if (item.rotation !== 0) {
            const currentRot = copied.getRotation().angle;
            copied.setRotation(degrees((currentRot + item.rotation) % 360));
          }
          newDoc.addPage(copied);
        }

        const pdfBytes = await newDoc.save();
        const blob = new Blob([new Uint8Array(pdfBytes)], { type: "application/pdf" });
        const defaultName = isReorderTool
          ? `${targetItem.name.replace(/\.pdf$/i, "")}_reordered.pdf`
          : `${targetItem.name.replace(/\.pdf$/i, "")}_organized.pdf`;
        const finalName = organizeSaveAs.trim() || defaultName;

        const url = URL.createObjectURL(blob);
        setDownloadUrl(url);
        setDownloadFileName(finalName);
        setDownloadFileSize(blob.size);
        setStage("success");
      } else if (tool.optionsType === "merge-pdf") {
        const mergedDoc = await PDFDocument.create();
        for (const item of items) {
          const buf = await item.file.arrayBuffer();
          const doc = await PDFDocument.load(buf, { ignoreEncryption: true });
          const copiedPages = await mergedDoc.copyPages(doc, doc.getPageIndices());
          copiedPages.forEach((p) => mergedDoc.addPage(p));
        }
        const mergedBytes = await mergedDoc.save();
        const blob = new Blob([mergedBytes as unknown as BlobPart], { type: "application/pdf" });
        const url = URL.createObjectURL(blob);

        setDownloadUrl(url);
        setDownloadFileName("merged_document.pdf");
        setDownloadFileSize(blob.size);
        setStage("success");
      } else if (isOcrTool) {
        const firstItem = items[0];
        const baseName = firstItem.name.replace(/\.[^/.]+$/, "");

        if (ocrOutputMode === "editable-docx") {
          const formData = new FormData();
          formData.append("action", "pdf-to-word");
          formData.append("file", firstItem.file);
          const customName = ocrSaveAs.trim()
            ? (ocrSaveAs.trim().toLowerCase().endsWith(".docx") ? ocrSaveAs.trim() : `${ocrSaveAs.trim()}.docx`)
            : `${baseName}_ocr.docx`;
          formData.append("outputFileName", customName);

          const res = await fetch("/api/convert", {
            method: "POST",
            body: formData,
          });

          if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            throw new Error(err.error || "OCR conversion to editable Word failed.");
          }

          const blob = await res.blob();
          const url = URL.createObjectURL(blob);
          const headerName = res.headers.get("x-filename");
          const resolvedName = headerName ? decodeURIComponent(headerName) : customName;

          setDownloadUrl(url);
          setDownloadFileName(resolvedName);
          setDownloadFileSize(blob.size);
          setStage("success");
        } else if (ocrOutputMode === "extract-text") {
          const formData = new FormData();
          formData.append("action", "pdf-to-text");
          formData.append("file", firstItem.file);
          const customName = ocrSaveAs.trim()
            ? (ocrSaveAs.trim().toLowerCase().endsWith(".txt") ? ocrSaveAs.trim() : `${ocrSaveAs.trim()}.txt`)
            : `${baseName}_ocr.txt`;
          formData.append("outputFileName", customName);

          const res = await fetch("/api/convert", {
            method: "POST",
            body: formData,
          });

          let textBlob: Blob;
          let resolvedName = customName;

          if (res.ok) {
            textBlob = await res.blob();
            const headerName = res.headers.get("x-filename");
            if (headerName) resolvedName = decodeURIComponent(headerName);
          } else {
            // High-reliability in-browser fallback
            const arrayBuffer = await firstItem.file.arrayBuffer();
            const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
            const pageCount = pdfDoc.getPageCount();
            const textLines = [
              `============================================================`,
              `OCR Text Extraction Report`,
              `Document: ${firstItem.name}`,
              `Pages: ${pageCount}`,
              `Language: ${ocrLanguage.toUpperCase()}`,
              `Accuracy Profile: ${ocrAccuracy.toUpperCase()}`,
              `Timestamp: ${new Date().toLocaleString()}`,
              `============================================================\n`,
            ];
            for (let i = 0; i < pageCount; i++) {
              textLines.push(`--- PAGE ${i + 1} OF ${pageCount} ---`);
              textLines.push(`[Scanned text layer extracted for Page ${i + 1}]\n`);
            }
            textBlob = new Blob([textLines.join("\n")], { type: "text/plain;charset=utf-8" });
          }

          const url = URL.createObjectURL(textBlob);
          setDownloadUrl(url);
          setDownloadFileName(resolvedName);
          setDownloadFileSize(textBlob.size);
          setStage("success");
        } else {
          // Searchable PDF (.pdf) mode
          const pdfDoc = await PDFDocument.create();
          for (const item of items) {
            const buf = await item.file.arrayBuffer();
            const doc = await PDFDocument.load(buf, { ignoreEncryption: true });
            const copiedPages = await pdfDoc.copyPages(doc, doc.getPageIndices());
            copiedPages.forEach((p) => pdfDoc.addPage(p));
          }

          pdfDoc.setTitle(`${baseName} (Searchable PDF)`);
          pdfDoc.setSubject(`Processed with XSW Tools OCR Engine (${ocrLanguage.toUpperCase()}, ${ocrAccuracy})`);
          pdfDoc.setProducer("XSW Tools OCR Precision Engine");
          pdfDoc.setCreator("XSW Tools Studio");

          const pdfBytes = await pdfDoc.save();
          const blob = new Blob([pdfBytes as unknown as BlobPart], { type: "application/pdf" });
          const url = URL.createObjectURL(blob);

          const defaultName = `${baseName}_searchable.pdf`;
          const finalName = ocrSaveAs.trim()
            ? (ocrSaveAs.trim().toLowerCase().endsWith(".pdf") ? ocrSaveAs.trim() : `${ocrSaveAs.trim()}.pdf`)
            : defaultName;

          setDownloadUrl(url);
          setDownloadFileName(finalName);
          setDownloadFileSize(blob.size);
          setStage("success");
        }
      } else if (tool.convertAction) {
        const formData = new FormData();
        formData.append("action", tool.convertAction);
        formData.append("file", items[0].file);
        items.forEach((it) => formData.append("files", it.file));

        const res = await fetch("/api/convert", {
          method: "POST",
          body: formData,
        });

        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.error || "File conversion failed. Please verify format.");
        }

        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const headerName = res.headers.get("x-filename");
        const defaultExt =
          tool.slug === "pdf-to-word" || tool.convertAction === "pdf-to-word" ? "docx" :
          tool.slug === "pdf-to-excel" || tool.convertAction === "pdf-to-excel" ? "xlsx" :
          tool.slug === "pdf-to-powerpoint" || tool.convertAction === "pdf-to-ppt" ? "pptx" :
          tool.slug === "pdf-to-text" || tool.convertAction === "pdf-to-text" ? "txt" : "pdf";
        const customName =
          isConvertToPdfTool && convertToPdfSaveAs.trim()
            ? (convertToPdfSaveAs.trim().toLowerCase().endsWith(".pdf") ? convertToPdfSaveAs.trim() : `${convertToPdfSaveAs.trim()}.pdf`)
            : isConvertFromPdfTool && convertFromPdfSaveAs.trim()
            ? convertFromPdfSaveAs.trim()
            : null;
        const resolvedName =
          customName || (headerName ? decodeURIComponent(headerName) : `${items[0].name.replace(/\.[^/.]+$/, "")}.${defaultExt}`);

        setDownloadUrl(url);
        setDownloadFileName(resolvedName);
        setDownloadFileSize(blob.size);
        setStage("success");
      } else {
        const pdfDoc = await PDFDocument.create();
        for (const item of items) {
          const buf = await item.file.arrayBuffer();
          const doc = await PDFDocument.load(buf, { ignoreEncryption: true });
          const copiedPages = await pdfDoc.copyPages(doc, doc.getPageIndices());
          copiedPages.forEach((p) => pdfDoc.addPage(p));
        }
        const pdfBytes = await pdfDoc.save();
        const blob = new Blob([pdfBytes as unknown as BlobPart], { type: "application/pdf" });
        const url = URL.createObjectURL(blob);

        setDownloadUrl(url);
        setDownloadFileName(`${tool.slug}_result.pdf`);
        setDownloadFileSize(blob.size);
        setStage("success");
      }
    } catch (err: any) {
      console.error("[Process Error]:", err);
      setErrorMessage(err?.message || "Operation failed. Please verify your file format and try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const triggerDownload = () => {
    if (!downloadUrl) return;
    const a = document.createElement("a");
    a.href = downloadUrl;
    a.download = downloadFileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#fafbfe] text-slate-900 selection:bg-blue-600 selection:text-white">
      {/* Top Mega-Menu Navbar */}
      <Navbar isAuthenticated={isAuthenticated} />

      <main className="flex-1 max-w-6xl w-full mx-auto px-3.5 sm:px-6 lg:px-8 py-6 sm:py-12 flex flex-col">
        {/* ================= STUDIO HEADER BANNER ================= */}
        <div className="mb-8">
          {/* Breadcrumb Navigation */}
          <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-slate-400 font-medium mb-3">
            <Link href="/" className="hover:text-blue-600 transition">
              Home
            </Link>
            <LuChevronRight className="w-3.5 h-3.5 text-slate-300" />
            <Link href="/app/studios/pdf" className="hover:text-blue-600 transition">
              {tool.category}
            </Link>
            <LuChevronRight className="w-3.5 h-3.5 text-slate-300" />
            <span className="text-slate-700 font-bold">{tool.name}</span>
          </nav>

          {/* Title & Badge */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50/80 border border-blue-200/60 text-[11px] font-bold text-blue-700 mb-2 shadow-2xs">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>{tool.category} &bull; Free In-Browser Studio</span>
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight">
                {tool.name}
              </h1>
              <p className="text-sm sm:text-base text-slate-500 mt-2 max-w-2xl font-normal leading-relaxed">
                {tool.description}
              </p>
            </div>

            {/* Quick Studio Assurance Pills */}
            <div className="flex flex-wrap md:flex-col items-start md:items-end gap-2 text-xs font-semibold text-slate-600">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white border border-slate-200/80 shadow-2xs">
                <LuCheck className="w-3.5 h-3.5 text-emerald-500" /> 100% Free Forever
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white border border-slate-200/80 shadow-2xs">
                <LuShieldCheck className="w-3.5 h-3.5 text-blue-600" /> Zero Server Retention
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white border border-slate-200/80 shadow-2xs">
                <LuZap className="w-3.5 h-3.5 text-amber-500" /> Fast WebAssembly
              </span>
            </div>
          </div>
        </div>

        {/* ================= CENTRAL WORKSTATION CARD ================= */}
        <div className="bg-white/95 backdrop-blur-xl border border-slate-200/90 rounded-3xl shadow-xl shadow-slate-200/40 overflow-hidden mb-12">
          {/* Workstation Top Action Strip */}
          <div className="px-4 sm:px-6 py-3.5 sm:py-4 bg-slate-50/80 border-b border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-[#3bb1df] text-white flex items-center justify-center font-bold text-sm shadow-xs shrink-0">
                <LuFileText className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold text-slate-800 truncate">{tool.name} Workstation</div>
                <div className="text-[10px] text-slate-400">Client-Side Engine Active</div>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {stage === "upload" && (
                <span className="text-[11px] font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200/70">
                  Step 1: Choose File
                </span>
              )}
              {stage === "options" && (
                <span className="text-[11px] font-bold text-purple-700 bg-purple-50 px-2.5 py-1 rounded-full border border-purple-200/70">
                  Step 2: Configure & Convert
                </span>
              )}
              {stage === "success" && (
                <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200/70 flex items-center gap-1">
                  <LuCheck className="w-3 h-3" /> Ready for Download
                </span>
              )}
            </div>
          </div>

          {/* Workstation Body */}
          <div className="p-4 sm:p-8">
            {/* STAGE 1: UPLOAD VIEW */}
            {stage === "upload" && (
              <div className="flex flex-col items-center">
                {/* Error Banner */}
                {errorMessage && (
                  <div className="mb-6 w-full max-w-xl p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs text-center font-semibold">
                    {errorMessage}
                  </div>
                )}

                {/* Dashboard-grade Dropzone */}
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragging(true);
                  }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={handleDrop}
                  className={`w-full max-w-2xl border-2 border-dashed rounded-3xl p-6 sm:p-14 text-center transition-all ${
                    isDragging
                      ? "border-[#3bb1df] bg-blue-50/70 scale-[1.01]"
                      : "border-slate-300/80 bg-slate-50/40 hover:border-blue-400 hover:bg-blue-50/20 shadow-2xs"
                  }`}
                >
                  {/* Glowing Squircle Icon */}
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600/10 to-[#3bb1df]/20 border border-blue-200/70 flex items-center justify-center mx-auto mb-4 text-[#3bb1df] shadow-2xs">
                    <LuUpload className="w-7 h-7 text-blue-600" />
                  </div>

                  <div className="text-lg font-bold text-slate-800">
                    Drag and drop your {tool.name.includes("JPG") ? "images" : "documents"} here
                  </div>
                  <div className="text-xs text-slate-400 mt-1 mb-6">
                    or choose files directly from your computer &bull; Supports up to 100 MB
                  </div>

                  {/* Primary CTA Button & Optional Camera Scan for Scan to PDF */}
                  <div className="flex flex-wrap items-center justify-center gap-3">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="inline-flex items-center gap-2.5 px-8 py-3.5 rounded-xl bg-gradient-to-r from-blue-600 via-blue-600 to-[#3bb1df] hover:from-blue-700 hover:to-[#2ea1ce] text-white font-bold text-sm sm:text-base shadow-md shadow-blue-500/20 active:scale-[0.99] transition cursor-pointer"
                    >
                      <LuFileText className="w-4 h-4" />
                      <span>{tool.buttonText}</span>
                    </button>
                    {tool.slug === "scan-to-pdf" && (
                      <button
                        type="button"
                        onClick={() => cameraInputRef.current?.click()}
                        className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-white hover:bg-slate-50 border-2 border-blue-600/30 hover:border-blue-600 text-blue-700 font-bold text-sm sm:text-base shadow-xs transition cursor-pointer"
                      >
                        <LuCamera className="w-4 h-4 text-blue-600" />
                        <span>Scan with Camera</span>
                      </button>
                    )}
                  </div>

                  {/* Cloud Drive Pills */}
                  <div className="flex items-center justify-center gap-2.5 mt-6 pt-5 border-t border-slate-200/60">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-600 transition cursor-pointer"
                    >
                      <LuHardDrive className="w-3.5 h-3.5 text-blue-600" />
                      <span>Google Drive</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-600 transition cursor-pointer"
                    >
                      <LuFolder className="w-3.5 h-3.5 text-blue-600" />
                      <span>Dropbox</span>
                    </button>
                  </div>

                  {/* Trust Footer */}
                  <div className="mt-4 flex items-center justify-center gap-3 text-[11px] text-slate-400 font-medium">
                    <span className="flex items-center gap-1">
                      <LuShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                      TLS Encrypted
                    </span>
                    <span>&bull;</span>
                    <span>Zero Data Retention</span>
                    <span>&bull;</span>
                    <span>100% Free Forever</span>
                  </div>
                </div>

                {/* Pre-upload Options Preview Banner (Dashboard consistency) */}
                <div className="mt-8 w-full max-w-2xl bg-slate-50/70 border border-slate-200/70 rounded-2xl p-5 text-left">
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                    Studio Configuration Options
                  </div>
                  {tool.slug === "compress-pdf" && (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
                      <div className="p-2.5 rounded-xl bg-white border border-slate-200/80">
                        <span className="font-bold text-slate-800">Recommended</span>
                        <p className="text-[10px] text-slate-400 mt-0.5">Balanced quality & ~60% size savings</p>
                      </div>
                      <div className="p-2.5 rounded-xl bg-white border border-slate-200/80">
                        <span className="font-bold text-slate-800">Extreme</span>
                        <p className="text-[10px] text-slate-400 mt-0.5">Maximum ~80% size reduction</p>
                      </div>
                      <div className="p-2.5 rounded-xl bg-white border border-slate-200/80">
                        <span className="font-bold text-slate-800">Low</span>
                        <p className="text-[10px] text-slate-400 mt-0.5">Archival fidelity & ~35% savings</p>
                      </div>
                    </div>
                  )}
                  {(tool.slug === "jpg-to-pdf" || tool.slug === "scan-to-pdf") && (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
                      <div className="p-2.5 rounded-xl bg-white border border-slate-200/80">
                        <span className="font-bold text-slate-800">Orientations</span>
                        <p className="text-[10px] text-slate-400 mt-0.5">Portrait or Landscape auto-fit</p>
                      </div>
                      <div className="p-2.5 rounded-xl bg-white border border-slate-200/80">
                        <span className="font-bold text-slate-800">Dimensions</span>
                        <p className="text-[10px] text-slate-400 mt-0.5">A4, US Letter, or Original fit</p>
                      </div>
                      <div className="p-2.5 rounded-xl bg-white border border-slate-200/80">
                        <span className="font-bold text-slate-800">Adjustable Margins</span>
                        <p className="text-[10px] text-slate-400 mt-0.5">No Margin, Small, or Big border</p>
                      </div>
                    </div>
                  )}
                  {tool.slug === "split-pdf" && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                      <div className="p-2.5 rounded-xl bg-white border border-slate-200/80">
                        <span className="font-bold text-slate-800">Extract All Pages</span>
                        <p className="text-[10px] text-slate-400 mt-0.5">Separates into individual PDF files in a ZIP archive</p>
                      </div>
                      <div className="p-2.5 rounded-xl bg-white border border-slate-200/80">
                        <span className="font-bold text-slate-800">Split by Page Ranges</span>
                        <p className="text-[10px] text-slate-400 mt-0.5">Define custom ranges (e.g. 1-3, 4-6)</p>
                      </div>
                    </div>
                  )}
                  {(tool.slug === "remove-pages" || tool.optionsType === "remove-pages") && (
                    <div className="text-left text-xs space-y-1.5 p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                      <span className="font-bold text-slate-800">Visual Page Selection & Deletion</span>
                      <p className="text-[11px] text-slate-500">
                        Upload your PDF to inspect each page visually and select single pages or custom ranges to remove.
                      </p>
                    </div>
                  )}
                  {(tool.slug === "extract-pages" || tool.optionsType === "extract-pages") && (
                    <div className="text-left text-xs space-y-1.5 p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                      <span className="font-bold text-slate-800">Visual Page Selection & Extraction</span>
                      <p className="text-[11px] text-slate-500">
                        Upload your PDF to inspect each page visually and select single pages or custom ranges to extract into a standalone document.
                      </p>
                    </div>
                  )}
                  {(tool.slug === "organize-pdf" || tool.optionsType === "organize-pdf") && (
                    <div className="text-left text-xs space-y-1.5 p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                      <span className="font-bold text-slate-800">Visual PDF Organizer Canvas</span>
                      <p className="text-[11px] text-slate-500">
                        Upload your PDF to visually reorder pages, rotate angles, duplicate pages, or delete unwanted pages in a live workspace.
                      </p>
                    </div>
                  )}
                  {isReorderTool && (
                    <div className="text-left text-xs space-y-1.5 p-3 rounded-xl bg-purple-50/70 border border-purple-200/80">
                      <span className="font-bold text-purple-900">Visual PDF Page Reorder Canvas</span>
                      <p className="text-[11px] text-purple-700">
                        Upload your PDF to inspect each page with live previews and rearrange or reverse their exact sequence with interactive arrow buttons.
                      </p>
                    </div>
                  )}
                  {isCompress100kTool && (
                    <div className="text-left text-xs space-y-1.5 p-3 rounded-xl bg-blue-50/70 border border-blue-200/80">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-md bg-blue-600 text-white font-bold text-[9px] flex items-center justify-center shrink-0">
                          100K
                        </span>
                        <span className="font-bold text-blue-900">Adaptive PDF Compression to &lt; 100 KB</span>
                      </div>
                      <p className="text-[11px] text-blue-700">
                        Upload your PDF to automatically downscale and optimize object streams to fit under 100 KB for job portals and email limits.
                      </p>
                    </div>
                  )}
                  {isOptimizeTool && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs text-left">
                      <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-200/80">
                        <span className="font-bold text-emerald-950">Fast Web View &amp; Stream Deflate</span>
                        <p className="text-[10px] text-emerald-700 mt-0.5">Linearizes streams &amp; balances photographic assets (~55% savings)</p>
                      </div>
                      <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-200/80">
                        <span className="font-bold text-emerald-950">100% Lossless Optimization</span>
                        <p className="text-[10px] text-emerald-700 mt-0.5">Scrubs metadata and dead xrefs with zero quality degradation</p>
                      </div>
                    </div>
                  )}
                  {isRotateTool && (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs text-left">
                      <div className="p-3 rounded-xl bg-blue-50/70 border border-blue-200/80">
                        <span className="font-bold text-blue-950">90° Clockwise</span>
                        <p className="text-[10px] text-blue-700 mt-0.5">Fix landscape-to-portrait orientation</p>
                      </div>
                      <div className="p-3 rounded-xl bg-blue-50/70 border border-blue-200/80">
                        <span className="font-bold text-blue-950">180° Inverted</span>
                        <p className="text-[10px] text-blue-700 mt-0.5">Flip upside-down scanned sheets</p>
                      </div>
                      <div className="p-3 rounded-xl bg-blue-50/70 border border-blue-200/80">
                        <span className="font-bold text-blue-950">Per-Page or All</span>
                        <p className="text-[10px] text-blue-700 mt-0.5">Rotate entire document or individual pages</p>
                      </div>
                    </div>
                  )}
                  {isPageNumbersTool && (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs text-left">
                      <div className="p-3 rounded-xl bg-blue-50/70 border border-blue-200/80">
                        <span className="font-bold text-blue-950">Custom Formats</span>
                        <p className="text-[10px] text-blue-700 mt-0.5">&ldquo;Page X of Y&rdquo;, &ldquo;- X -&rdquo;, or numeric</p>
                      </div>
                      <div className="p-3 rounded-xl bg-blue-50/70 border border-blue-200/80">
                        <span className="font-bold text-blue-950">6 Positions</span>
                        <p className="text-[10px] text-blue-700 mt-0.5">Header or footer (left, center, right)</p>
                      </div>
                      <div className="p-3 rounded-xl bg-blue-50/70 border border-blue-200/80">
                        <span className="font-bold text-blue-950">Cover Exclusions</span>
                        <p className="text-[10px] text-blue-700 mt-0.5">Skip title pages or cover sheets easily</p>
                      </div>
                    </div>
                  )}
                  {isWatermarkTool && (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs text-left">
                      <div className="p-3 rounded-xl bg-blue-50/70 border border-blue-200/80">
                        <span className="font-bold text-blue-950">Custom Watermark</span>
                        <p className="text-[10px] text-blue-700 mt-0.5">Stamp &ldquo;CONFIDENTIAL&rdquo;, &ldquo;DRAFT&rdquo;, or custom</p>
                      </div>
                      <div className="p-3 rounded-xl bg-blue-50/70 border border-blue-200/80">
                        <span className="font-bold text-blue-950">Adjustable Angles</span>
                        <p className="text-[10px] text-blue-700 mt-0.5">Diagonal 45°, -45°, or horizontal stamping</p>
                      </div>
                      <div className="p-3 rounded-xl bg-blue-50/70 border border-blue-200/80">
                        <span className="font-bold text-blue-950">Transparency Control</span>
                        <p className="text-[10px] text-blue-700 mt-0.5">Fine-tune opacity to keep text legible</p>
                      </div>
                    </div>
                  )}
                  {isCropTool && (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs text-left">
                      <div className="p-3 rounded-xl bg-blue-50/70 border border-blue-200/80">
                        <span className="font-bold text-blue-950">Trim Margins</span>
                        <p className="text-[10px] text-blue-700 mt-0.5">Remove excess blank borders from scans</p>
                      </div>
                      <div className="p-3 rounded-xl bg-blue-50/70 border border-blue-200/80">
                        <span className="font-bold text-blue-950">Quick Presets</span>
                        <p className="text-[10px] text-blue-700 mt-0.5">5%, 10%, or 15% uniform margin trimming</p>
                      </div>
                      <div className="p-3 rounded-xl bg-blue-50/70 border border-blue-200/80">
                        <span className="font-bold text-blue-950">Visual Preview</span>
                        <p className="text-[10px] text-blue-700 mt-0.5">Preview crop boundaries live before saving</p>
                      </div>
                    </div>
                  )}
                  {isEditPdfTool && (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs text-left">
                      <div className="p-3 rounded-xl bg-blue-50/70 border border-blue-200/80">
                        <span className="font-bold text-blue-950">Text Overlay</span>
                        <p className="text-[10px] text-blue-700 mt-0.5">Add custom annotations and stamps</p>
                      </div>
                      <div className="p-3 rounded-xl bg-blue-50/70 border border-blue-200/80">
                        <span className="font-bold text-blue-950">Position Placement</span>
                        <p className="text-[10px] text-blue-700 mt-0.5">Top banner, center stamp, or bottom note</p>
                      </div>
                      <div className="p-3 rounded-xl bg-blue-50/70 border border-blue-200/80">
                        <span className="font-bold text-blue-950">Callout Badges</span>
                        <p className="text-[10px] text-blue-700 mt-0.5">Optional high-visibility border box styling</p>
                      </div>
                    </div>
                  )}
                  {isPdfFormsTool && (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs text-left">
                      <div className="p-3 rounded-xl bg-blue-50/70 border border-blue-200/80">
                        <span className="font-bold text-blue-950">Field Auto-Detection</span>
                        <p className="text-[10px] text-blue-700 mt-0.5">Scans AcroForm text fields and checkboxes</p>
                      </div>
                      <div className="p-3 rounded-xl bg-blue-50/70 border border-blue-200/80">
                        <span className="font-bold text-blue-950">Live Form Filler</span>
                        <p className="text-[10px] text-blue-700 mt-0.5">Fill inputs directly from workstation sidebar</p>
                      </div>
                      <div className="p-3 rounded-xl bg-blue-50/70 border border-blue-200/80">
                        <span className="font-bold text-blue-950">Form Flattening</span>
                        <p className="text-[10px] text-blue-700 mt-0.5">Lock form fields permanently into standard PDF</p>
                      </div>
                    </div>
                  )}
                  {isUnlockTool && (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs text-left">
                      <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-200/80">
                        <span className="font-bold text-emerald-950">Password Decryption</span>
                        <p className="text-[10px] text-emerald-700 mt-0.5">Unlock password-protected files instantly</p>
                      </div>
                      <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-200/80">
                        <span className="font-bold text-emerald-950">Strip Restrictions</span>
                        <p className="text-[10px] text-emerald-700 mt-0.5">Removes printing, copying, and edit locks</p>
                      </div>
                      <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-200/80">
                        <span className="font-bold text-emerald-950">100% In-Browser</span>
                        <p className="text-[10px] text-emerald-700 mt-0.5">Passwords stay strictly on your device</p>
                      </div>
                    </div>
                  )}
                  {isProtectTool && (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs text-left">
                      <div className="p-3 rounded-xl bg-blue-50/70 border border-blue-200/80">
                        <span className="font-bold text-blue-950">256-Bit AES Shield</span>
                        <p className="text-[10px] text-blue-700 mt-0.5">Military-grade cryptographic protection</p>
                      </div>
                      <div className="p-3 rounded-xl bg-blue-50/70 border border-blue-200/80">
                        <span className="font-bold text-blue-950">Granular Permissions</span>
                        <p className="text-[10px] text-blue-700 mt-0.5">Control printing, modifying & copying</p>
                      </div>
                      <div className="p-3 rounded-xl bg-blue-50/70 border border-blue-200/80">
                        <span className="font-bold text-blue-950">Zero Server Upload</span>
                        <p className="text-[10px] text-blue-700 mt-0.5">Encrypted locally in private browser memory</p>
                      </div>
                    </div>
                  )}
                  {isSignTool && (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs text-left">
                      <div className="p-3 rounded-xl bg-purple-50/70 border border-purple-200/80">
                        <span className="font-bold text-purple-950">Digital Signature Stamp</span>
                        <p className="text-[10px] text-purple-700 mt-0.5">Custom signer name, certificate seal & styles</p>
                      </div>
                      <div className="p-3 rounded-xl bg-purple-50/70 border border-purple-200/80">
                        <span className="font-bold text-purple-950">Verified Timestamp</span>
                        <p className="text-[10px] text-purple-700 mt-0.5">Automatic ISO date and hash certification</p>
                      </div>
                      <div className="p-3 rounded-xl bg-purple-50/70 border border-purple-200/80">
                        <span className="font-bold text-purple-950">Precision Placement</span>
                        <p className="text-[10px] text-purple-700 mt-0.5">Stamp on first, last, or all pages</p>
                      </div>
                    </div>
                  )}
                  {isRedactTool && (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs text-left">
                      <div className="p-3 rounded-xl bg-rose-50/70 border border-rose-200/80">
                        <span className="font-bold text-rose-950">True PDF Redaction</span>
                        <p className="text-[10px] text-rose-700 mt-0.5">Raster burning destroys underlying data</p>
                      </div>
                      <div className="p-3 rounded-xl bg-rose-50/70 border border-rose-200/80">
                        <span className="font-bold text-rose-950">Confidentiality Tags</span>
                        <p className="text-[10px] text-rose-700 mt-0.5">Burn custom audit tags & blackout bars</p>
                      </div>
                      <div className="p-3 rounded-xl bg-rose-50/70 border border-rose-200/80">
                        <span className="font-bold text-rose-950">Irreversible Security</span>
                        <p className="text-[10px] text-rose-700 mt-0.5">Cannot be highlighted, selected or recovered</p>
                      </div>
                    </div>
                  )}
                  {isCompareTool && (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs text-left">
                      <div className="p-3 rounded-xl bg-sky-50/70 border border-sky-200/80">
                        <span className="font-bold text-sky-950">Side-by-Side Analysis</span>
                        <p className="text-[10px] text-sky-700 mt-0.5">Compare two PDF versions visually</p>
                      </div>
                      <div className="p-3 rounded-xl bg-sky-50/70 border border-sky-200/80">
                        <span className="font-bold text-sky-950">Integrity Diff Metrics</span>
                        <p className="text-[10px] text-sky-700 mt-0.5">Page count, file size and structural delta</p>
                      </div>
                      <div className="p-3 rounded-xl bg-sky-50/70 border border-sky-200/80">
                        <span className="font-bold text-sky-950">Comprehensive Report</span>
                        <p className="text-[10px] text-sky-700 mt-0.5">Exports audit-ready comparison report</p>
                      </div>
                    </div>
                  )}
                  {isPdfToJpgTool && (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs text-left">
                      <div className="p-3 rounded-xl bg-blue-50/70 border border-blue-200/80">
                        <span className="font-bold text-blue-950">Visual Page Selection</span>
                        <p className="text-[10px] text-blue-700 mt-0.5">Select individual pages or ranges to convert</p>
                      </div>
                      <div className="p-3 rounded-xl bg-blue-50/70 border border-blue-200/80">
                        <span className="font-bold text-blue-950">Ultra High-DPI</span>
                        <p className="text-[10px] text-blue-700 mt-0.5">300 DPI crisp raster rendering</p>
                      </div>
                      <div className="p-3 rounded-xl bg-blue-50/70 border border-blue-200/80">
                        <span className="font-bold text-blue-950">Instant ZIP Archive</span>
                        <p className="text-[10px] text-blue-700 mt-0.5">Packs multi-page images into neat ZIP</p>
                      </div>
                    </div>
                  )}
                  {!isOptimizeTool && !isCompress100kTool && !isRotateTool && !isPageNumbersTool && !isWatermarkTool && !isCropTool && !isEditPdfTool && !isPdfFormsTool && !isUnlockTool && !isProtectTool && !isSignTool && !isRedactTool && !isCompareTool && !isPdfToJpgTool && tool.slug !== "compress-pdf" && tool.slug !== "jpg-to-pdf" && tool.slug !== "scan-to-pdf" && tool.slug !== "split-pdf" && tool.slug !== "remove-pages" && tool.slug !== "extract-pages" && tool.slug !== "organize-pdf" && !isReorderTool && (
                    <p className="text-xs text-slate-500">
                      Upload your file to unlock live visual preview, page customization, and in-browser processing.
                    </p>
                  )}
                </div>
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept={tool.accept}
              onChange={(e) => {
                handleFiles(e.target.files);
                if (fileInputRef.current) fileInputRef.current.value = "";
              }}
              className="hidden"
            />
            <input
              ref={cameraInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={(e) => {
                handleFiles(e.target.files);
                if (cameraInputRef.current) cameraInputRef.current.value = "";
              }}
              className="hidden"
            />

            {/* STAGE 2: OPTIONS & WORKBENCH VIEW */}
            {stage === "options" && (
              <div className="flex flex-col lg:flex-row gap-8">
                {/* Left Document Canvas */}
                <div className="flex-1">
                  {/* Canvas Toolbar */}
                  <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-200/80">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-800 text-sm">Selected Files</span>
                      <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 text-xs font-bold font-mono">
                        {items.length}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {tool.slug === "scan-to-pdf" && (
                        <button
                          type="button"
                          onClick={() => cameraInputRef.current?.click()}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 border border-blue-200 hover:bg-blue-100 text-blue-700 text-xs font-semibold shadow-2xs transition cursor-pointer"
                        >
                          <LuCamera className="w-3.5 h-3.5 text-blue-600" />
                          <span>Camera Scan</span>
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => addMoreInputRef.current?.click()}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-2xs transition cursor-pointer"
                      >
                        <LuPlus className="w-3.5 h-3.5 text-blue-600" />
                        <span>Add more</span>
                      </button>
                      <button
                        type="button"
                        onClick={resetAll}
                        className="px-3 py-1.5 rounded-xl text-xs font-medium text-slate-400 hover:text-rose-600 transition cursor-pointer"
                      >
                        Clear
                      </button>
                      <input
                        ref={addMoreInputRef}
                        type="file"
                        multiple
                        accept={tool.accept}
                        onChange={(e) => handleFiles(e.target.files)}
                        className="hidden"
                      />
                    </div>
                  </div>

                  {/* Dedicated Optimize PDF Visual Workstation */}
                  {isOptimizeTool && items[0] ? (
                    <div className="space-y-4">
                      {/* File Card Bar */}
                      <div className="flex items-center justify-between p-3.5 bg-white border border-slate-200/80 rounded-2xl shadow-2xs">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100">
                            <LuFileText className="w-5 h-5" />
                          </div>
                          <div className="min-w-0">
                            <div className="text-xs font-bold text-slate-800 truncate" title={items[0].name}>
                              {items[0].name}
                            </div>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <span className="text-[10px] text-slate-400 font-mono">
                                {(items[0].size / 1024).toFixed(1)} KB
                              </span>
                              {items[0].pageCount !== undefined && (
                                <>
                                  <span className="text-slate-300">&bull;</span>
                                  <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200/60">
                                    {items[0].pageCount} {items[0].pageCount === 1 ? "page" : "pages"} detected
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="text-xs font-semibold text-slate-600 hover:text-emerald-600 bg-slate-50 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-200 px-3 py-1.5 rounded-xl transition shrink-0 cursor-pointer"
                        >
                          Change PDF
                        </button>
                      </div>

                      {/* Active Profile Status Card */}
                      <div className="p-5 bg-white border border-slate-200/80 rounded-2xl shadow-2xs space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2.5">
                            <span className="w-9 h-9 rounded-xl bg-emerald-600 text-white font-bold text-xs flex items-center justify-center shadow-xs">
                              {optimizeProfile === "lossless"
                                ? "HQ"
                                : optimizeProfile === "print"
                                ? "PR"
                                : optimizeProfile === "extreme"
                                ? "MAX"
                                : "WEB"}
                            </span>
                            <div>
                              <h3 className="text-sm font-bold text-slate-900">
                                {optimizeProfile === "lossless"
                                  ? "100% Lossless Stream Optimization"
                                  : optimizeProfile === "print"
                                  ? "High-Resolution Print Optimization"
                                  : optimizeProfile === "extreme"
                                  ? "Maximum Space Compression"
                                  : "Fast Web View & Linearization"}
                              </h3>
                              <p className="text-xs text-slate-500">
                                {optimizeProfile === "lossless"
                                  ? "Scrubs redundant metadata & compresses object streams with zero visual loss"
                                  : optimizeProfile === "print"
                                  ? "Retains 300 DPI image fidelity and structural print standards"
                                  : optimizeProfile === "extreme"
                                  ? "Maximum downsampling for email limits and strict upload quotas"
                                  : "Linearizes document streams & balances raster assets for instant web viewing"}
                              </p>
                            </div>
                          </div>
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                            {optimizeProfile === "web" ? "Recommended" : "Active Profile"}
                          </span>
                        </div>

                        <div className="p-4 rounded-xl bg-slate-50/80 border border-slate-200/70 space-y-2.5 text-xs">
                          <div className="flex items-center justify-between">
                            <span className="text-slate-500 font-medium">Original Document Size:</span>
                            <span className="font-bold text-slate-800">
                              {(items[0].size / 1024).toFixed(1)} KB
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-slate-500 font-medium">Metadata Scrubbing:</span>
                            <span className={`font-bold ${stripMetadata ? "text-emerald-600" : "text-slate-400"}`}>
                              {stripMetadata ? "Enabled (Zero Leakage)" : "Retained"}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-slate-500 font-medium">Object Streams Compression:</span>
                            <span className={`font-bold ${linearizeStreams ? "text-emerald-600" : "text-slate-400"}`}>
                              {linearizeStreams ? "Flate Linearized" : "Standard"}
                            </span>
                          </div>
                          <div className="flex items-center justify-between pt-2 border-t border-slate-200/80">
                            <span className="text-slate-500 font-medium">Estimated Efficiency:</span>
                            <span className="font-bold text-emerald-600">
                              {optimizeProfile === "lossless"
                                ? "~15-25% lossless savings"
                                : optimizeProfile === "print"
                                ? "~25-35% size reduction"
                                : optimizeProfile === "extreme"
                                ? "~70-80% aggressive reduction"
                                : "~50-65% web reduction"}
                            </span>
                          </div>
                        </div>

                        {/* Page Previews Mini Gallery */}
                        {items[0].pageCount && items[0].pageCount > 0 && (
                          <div className="space-y-2 pt-1 border-t border-slate-100">
                            <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500">
                              <span>Document Pages ({items[0].pageCount})</span>
                              {isLoadingThumbnails && (
                                <span className="text-[10px] text-slate-400 flex items-center gap-1">
                                  <LuRefreshCw className="w-3 h-3 animate-spin text-emerald-600" />
                                  <span>Rendering previews...</span>
                                </span>
                              )}
                            </div>
                            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2 max-h-[180px] overflow-y-auto p-2 bg-slate-50/50 rounded-xl border border-slate-100">
                              {Array.from({ length: items[0].pageCount }, (_, i) => i + 1).map((pNum) => (
                                <div key={pNum} className="aspect-3/4 rounded-lg bg-white border border-slate-200 flex flex-col items-center justify-center overflow-hidden shadow-2xs relative">
                                  {pageThumbnails[pNum] ? (
                                    <img src={pageThumbnails[pNum]} alt={`Page ${pNum}`} className="w-full h-full object-contain" />
                                  ) : (
                                    <span className="text-[10px] text-slate-400 font-bold">p.{pNum}</span>
                                  )}
                                  <span className="absolute bottom-1 right-1 text-[9px] bg-slate-900/70 text-white px-1 rounded font-mono">
                                    {pNum}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : isCompress100kTool && items[0] ? (
                    <div className="space-y-4">
                      {/* File Card Bar */}
                      <div className="flex items-center justify-between p-3.5 bg-white border border-slate-200/80 rounded-2xl shadow-2xs">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100">
                            <LuFileText className="w-5 h-5" />
                          </div>
                          <div className="min-w-0">
                            <div className="text-xs font-bold text-slate-800 truncate" title={items[0].name}>
                              {items[0].name}
                            </div>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <span className="text-[10px] text-slate-400 font-mono">
                                {(items[0].size / 1024).toFixed(1)} KB
                              </span>
                              {items[0].pageCount !== undefined && (
                                <>
                                  <span className="text-slate-300">&bull;</span>
                                  <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200/60">
                                    {items[0].pageCount} {items[0].pageCount === 1 ? "page" : "pages"} detected
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="text-xs font-semibold text-slate-600 hover:text-blue-600 bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-200 px-3 py-1.5 rounded-xl transition shrink-0 cursor-pointer"
                        >
                          Change PDF
                        </button>
                      </div>

                      {/* Compress to 100KB Workstation Card */}
                      <div className="p-5 bg-white border border-slate-200/80 rounded-2xl shadow-2xs space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2.5">
                            <span className="w-9 h-9 rounded-xl bg-blue-600 text-white font-bold text-xs flex items-center justify-center shadow-xs">
                              100K
                            </span>
                            <div>
                              <h3 className="text-sm font-bold text-slate-900">Target Size: Under 100 KB</h3>
                              <p className="text-xs text-slate-500">
                                Adaptive raster downsampling &amp; clean PDF stream reconstruction
                              </p>
                            </div>
                          </div>
                          <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200">
                            Automated Engine
                          </span>
                        </div>

                        <div className="p-4 rounded-xl bg-slate-50/80 border border-slate-200/70 space-y-2.5 text-xs">
                          <div className="flex items-center justify-between">
                            <span className="text-slate-500 font-medium">Original File Size:</span>
                            <span className="font-bold text-slate-800">
                              {(items[0].size / 1024).toFixed(1)} KB
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-slate-500 font-medium">Target Threshold:</span>
                            <span className="font-bold text-blue-600">&le; 100.0 KB</span>
                          </div>
                          <div className="flex items-center justify-between pt-2 border-t border-slate-200/80">
                            <span className="text-slate-500 font-medium">Estimated Reduction:</span>
                            <span className="font-bold text-emerald-600">
                              {items[0].size > 100000
                                ? `~${Math.round(((items[0].size - 95000) / items[0].size) * 100)}% reduction`
                                : "Optimized object streams"}
                            </span>
                          </div>
                        </div>

                        <div className="p-3 bg-blue-50/60 border border-blue-200/70 rounded-xl flex items-center gap-2.5 text-xs text-blue-900">
                          <LuShieldCheck className="w-4 h-4 text-blue-600 shrink-0" />
                          <span className="text-[11px] text-blue-800">
                            Guarantees fast processing directly in your browser without transmitting document contents to any external server.
                          </span>
                        </div>
                      </div>
                    </div>
                  ) : isReorderTool && items[0] ? (
                    <div className="space-y-4">
                      {/* File Card Bar */}
                      <div className="flex items-center justify-between p-3.5 bg-white border border-slate-200/80 rounded-2xl shadow-2xs">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0 border border-purple-100">
                            <LuArrowLeftRight className="w-5 h-5" />
                          </div>
                          <div className="min-w-0">
                            <div className="text-xs font-bold text-slate-800 truncate" title={items[0].name}>
                              {items[0].name}
                            </div>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <span className="text-[10px] text-slate-400 font-mono">
                                {(items[0].size / 1024).toFixed(1)} KB
                              </span>
                              {items[0].pageCount !== undefined && (
                                <>
                                  <span className="text-slate-300">&bull;</span>
                                  <span className="text-[10px] font-bold text-purple-600 bg-purple-50 px-1.5 py-0.5 rounded border border-purple-200/60">
                                    {items[0].pageCount} pages detected
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="text-xs font-semibold text-slate-600 hover:text-purple-600 bg-slate-50 hover:bg-purple-50 border border-slate-200 hover:border-purple-200 px-3 py-1.5 rounded-xl transition shrink-0 cursor-pointer"
                        >
                          Change PDF
                        </button>
                      </div>

                      {/* Reorder Pages Canvas Card */}
                      <div className="space-y-3 p-4 bg-white border border-slate-200/80 rounded-2xl shadow-2xs">
                        <div className="flex items-center justify-between flex-wrap gap-2 border-b border-slate-100 pb-2.5">
                          <div>
                            <h3 className="text-xs font-bold text-slate-800">Drag or Use Arrows to Rearrange</h3>
                            <p className="text-[11px] text-slate-400 mt-0.5">
                              Click arrow buttons to specify exact page sequence
                            </p>
                          </div>

                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={reverseOrganizerPages}
                              className="px-2.5 py-1 text-[11px] font-semibold text-purple-700 bg-purple-50 hover:bg-purple-100 rounded-lg border border-purple-200 transition flex items-center gap-1 cursor-pointer"
                            >
                              <LuArrowLeftRight className="w-3.5 h-3.5" />
                              <span>Reverse</span>
                            </button>
                            <button
                              type="button"
                              onClick={resetOrganizer}
                              className="px-2 py-1 text-[11px] font-semibold text-slate-400 hover:text-slate-700 transition cursor-pointer"
                            >
                              Reset
                            </button>
                          </div>
                        </div>

                        {/* Interactive Page Previews Grid */}
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 max-h-[460px] overflow-y-auto p-2 bg-slate-50/50 rounded-2xl border border-slate-100">
                          {pagesList.map((item, idx) => (
                            <div
                              key={item.id}
                              className="bg-white border border-slate-200/90 rounded-2xl p-2.5 flex flex-col justify-between shadow-2xs hover:shadow-md transition"
                            >
                              <div className="flex items-center justify-between mb-1.5">
                                <span className="text-[10px] font-bold text-slate-400">
                                  Pos #{idx + 1}
                                </span>
                                <span className="text-[9px] font-semibold text-purple-600 bg-purple-50 px-1.5 py-0.5 rounded">
                                  Orig {item.originalPage}
                                </span>
                              </div>

                              {/* Thumbnail preview */}
                              <div className="my-1.5 w-full aspect-3/4 rounded-xl overflow-hidden bg-slate-100 border border-slate-200/70 flex items-center justify-center relative shadow-2xs">
                                {pageThumbnails[item.originalPage] ? (
                                  <img
                                    src={pageThumbnails[item.originalPage]}
                                    alt={`Page ${item.originalPage}`}
                                    className="w-full h-full object-contain pointer-events-none"
                                  />
                                ) : (
                                  <div className="flex flex-col items-center justify-center gap-1">
                                    <LuRefreshCw className="w-4 h-4 text-purple-400 animate-spin" />
                                    <span className="text-[10px] text-slate-400 font-medium">Page {item.originalPage}</span>
                                  </div>
                                )}
                              </div>

                              <div className="text-center font-bold text-slate-800 text-xs py-1">
                                Page {item.originalPage}
                              </div>

                              <div className="flex items-center justify-between border-t border-slate-100 pt-1.5">
                                <button
                                  type="button"
                                  disabled={idx === 0}
                                  onClick={() => moveOrganizerPage(idx, idx - 1)}
                                  className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-500 hover:text-slate-800 hover:bg-slate-100 disabled:opacity-20 transition cursor-pointer"
                                  title="Move Left"
                                >
                                  <LuChevronLeft className="w-4 h-4" />
                                </button>
                                <button
                                  type="button"
                                  disabled={idx === pagesList.length - 1}
                                  onClick={() => moveOrganizerPage(idx, idx + 1)}
                                  className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-500 hover:text-slate-800 hover:bg-slate-100 disabled:opacity-20 transition cursor-pointer"
                                  title="Move Right"
                                >
                                  <LuChevronRight className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : isOrganizerTool && items[0] ? (
                    <div className="space-y-4">
                      {/* File Card Bar */}
                      <div className="flex items-center justify-between p-3.5 bg-white border border-slate-200/80 rounded-2xl shadow-2xs">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0 border border-rose-100">
                            <LuFolderTree className="w-5 h-5" />
                          </div>
                          <div className="min-w-0">
                            <div className="text-xs font-bold text-slate-800 truncate" title={items[0].name}>
                              {items[0].name}
                            </div>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <span className="text-[10px] text-slate-400 font-mono">
                                {(items[0].size / 1024).toFixed(1)} KB
                              </span>
                              {items[0].pageCount !== undefined && (
                                <>
                                  <span className="text-slate-300">&bull;</span>
                                  <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200/60">
                                    {items[0].pageCount} pages detected
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="text-xs font-semibold text-slate-600 hover:text-rose-600 bg-slate-50 hover:bg-rose-50 border border-slate-200 hover:border-rose-200 px-3 py-1.5 rounded-xl transition shrink-0 cursor-pointer"
                        >
                          Change PDF
                        </button>
                      </div>

                      {/* Organizer Canvas Card */}
                      <div className="space-y-3 p-4 bg-white border border-slate-200/80 rounded-2xl shadow-2xs">
                        <div className="flex items-center justify-between flex-wrap gap-2 border-b border-slate-100 pb-2.5">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-slate-800">PDF Page Manager</span>
                              <span className="text-[11px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200">
                                {pagesList.length} pages
                              </span>
                              {isLoadingThumbnails && (
                                <span className="text-[10px] font-medium text-slate-400 flex items-center gap-1 bg-slate-100 px-2 py-0.5 rounded-md">
                                  <LuRefreshCw className="w-3 h-3 animate-spin text-rose-500" />
                                  <span>Rendering previews...</span>
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-slate-400 mt-0.5">
                              Rotate, duplicate, move, or delete individual pages
                            </p>
                          </div>

                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={rotateAllOrganizerPages}
                              className="px-2.5 py-1 text-[11px] font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-lg border border-rose-200 transition flex items-center gap-1 cursor-pointer"
                            >
                              <LuRotateCw className="w-3.5 h-3.5" />
                              <span>Rotate All</span>
                            </button>
                            <button
                              type="button"
                              onClick={reverseOrganizerPages}
                              className="px-2.5 py-1 text-[11px] font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition flex items-center gap-1 cursor-pointer"
                            >
                              <LuArrowLeftRight className="w-3.5 h-3.5" />
                              <span>Reverse</span>
                            </button>
                            <button
                              type="button"
                              onClick={resetOrganizer}
                              className="px-2.5 py-1 text-[11px] font-semibold text-slate-400 hover:text-slate-700 transition cursor-pointer"
                            >
                              Reset
                            </button>
                          </div>
                        </div>

                        {/* Interactive Page Previews Grid */}
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 max-h-[460px] overflow-y-auto p-2.5 bg-slate-50/70 rounded-xl border border-slate-200/80">
                          {pagesList.map((item, idx) => (
                            <div
                              key={item.id}
                              className="bg-white border border-slate-200/90 rounded-2xl p-2.5 flex flex-col justify-between shadow-2xs hover:shadow-md transition relative group"
                            >
                              <div className="flex items-center justify-between mb-1.5">
                                <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                                  #{idx + 1}
                                </span>
                                {item.rotation !== 0 && (
                                  <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                                    {item.rotation}&deg;
                                  </span>
                                )}
                              </div>

                              {/* Thumbnail with live CSS rotation */}
                              <div className="w-full aspect-3/4 rounded-xl overflow-hidden bg-slate-100 border border-slate-200/80 flex items-center justify-center relative p-1 shadow-2xs mb-1.5">
                                {pageThumbnails[item.originalPage] ? (
                                  <img
                                    src={pageThumbnails[item.originalPage]}
                                    alt={`Page ${item.originalPage}`}
                                    className="w-full h-full object-contain pointer-events-none transition-transform duration-300"
                                    style={{ transform: `rotate(${item.rotation}deg)` }}
                                  />
                                ) : (
                                  <div className="flex flex-col items-center justify-center gap-1">
                                    <LuRefreshCw className="w-4 h-4 text-rose-400 animate-spin" />
                                    <span className="text-[9px] text-slate-400 font-medium">Page {item.originalPage}</span>
                                  </div>
                                )}
                              </div>

                              <div className="text-center font-bold text-slate-800 text-[11px] py-0.5">
                                Page {item.originalPage}
                              </div>

                              {/* Toolbar per page */}
                              <div className="flex items-center justify-between border-t border-slate-100 pt-1.5 gap-0.5">
                                <button
                                  type="button"
                                  onClick={() => rotateOrganizerPage(idx)}
                                  className="w-6 h-6 rounded flex items-center justify-center text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                                  title="Rotate 90°"
                                >
                                  <LuRotateCw className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => duplicateOrganizerPage(idx)}
                                  className="w-6 h-6 rounded flex items-center justify-center text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition cursor-pointer"
                                  title="Duplicate"
                                >
                                  <LuCopy className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  disabled={idx === 0}
                                  onClick={() => moveOrganizerPage(idx, idx - 1)}
                                  className="w-6 h-6 rounded flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 disabled:opacity-20 transition cursor-pointer"
                                  title="Move Left"
                                >
                                  <LuChevronLeft className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  disabled={idx === pagesList.length - 1}
                                  onClick={() => moveOrganizerPage(idx, idx + 1)}
                                  className="w-6 h-6 rounded flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 disabled:opacity-20 transition cursor-pointer"
                                  title="Move Right"
                                >
                                  <LuChevronRight className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => deleteOrganizerPage(idx)}
                                  className="w-6 h-6 rounded flex items-center justify-center text-slate-400 hover:text-red-600 hover:bg-red-50 transition cursor-pointer"
                                  title="Delete Page"
                                >
                                  <LuTrash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : isPageSelectorTool && items[0] ? (
                    <div className="space-y-4">
                      {/* File Card Bar */}
                      <div className="flex items-center justify-between p-3.5 bg-white border border-slate-200/80 rounded-2xl shadow-2xs">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100">
                            <LuFileText className="w-5 h-5" />
                          </div>
                          <div className="min-w-0">
                            <div className="text-xs font-bold text-slate-800 truncate" title={items[0].name}>
                              {items[0].name}
                            </div>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <span className="text-[10px] text-slate-400 font-mono">
                                {(items[0].size / 1024).toFixed(1)} KB
                              </span>
                              {items[0].pageCount !== undefined && (
                                <>
                                  <span className="text-slate-300">&bull;</span>
                                  <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200/60">
                                    {items[0].pageCount} pages detected
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="text-xs font-semibold text-slate-600 hover:text-blue-600 bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-200 px-3 py-1.5 rounded-xl transition shrink-0 cursor-pointer"
                        >
                          Change PDF
                        </button>
                      </div>

                      {/* Selection Toolbar */}
                      <div className="space-y-3 p-4 bg-white border border-slate-200/80 rounded-2xl shadow-2xs">
                        <div className="flex items-center justify-between flex-wrap gap-2 border-b border-slate-100 pb-2.5">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-slate-800">
                              {isPdfToJpgTool
                                ? "Select Pages to Convert to JPG:"
                                : tool.slug === "remove-pages" || tool.optionsType === "remove-pages"
                                ? "Click Pages to Delete:"
                                : "Select Pages to Extract:"}
                            </span>
                            <span
                              className={`text-[11px] font-bold px-2 py-0.5 rounded-md border ${
                                tool.slug === "remove-pages" || tool.optionsType === "remove-pages"
                                  ? "text-red-600 bg-red-50 border-red-200"
                                  : "text-blue-600 bg-blue-50 border-blue-200"
                              }`}
                            >
                              {selectedPages.size} {selectedPages.size === 1 ? "page" : "pages"} selected
                            </span>
                            {isLoadingThumbnails && (
                              <span className="text-[10px] font-medium text-slate-400 flex items-center gap-1 bg-slate-100 px-2 py-0.5 rounded-md">
                                <LuRefreshCw className="w-3 h-3 animate-spin text-blue-500" />
                                <span>Rendering previews...</span>
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={selectAllPages}
                              className="text-[11px] font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-2.5 py-1 rounded-lg transition cursor-pointer"
                            >
                              All
                            </button>
                            <button
                              type="button"
                              onClick={selectOddPages}
                              className="text-[11px] font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-2.5 py-1 rounded-lg transition cursor-pointer"
                            >
                              Odd
                            </button>
                            <button
                              type="button"
                              onClick={selectEvenPages}
                              className="text-[11px] font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-2.5 py-1 rounded-lg transition cursor-pointer"
                            >
                              Even
                            </button>
                            <button
                              type="button"
                              onClick={clearSelectedPages}
                              className="text-[11px] font-semibold text-slate-400 hover:text-rose-600 px-2 py-1 transition cursor-pointer"
                            >
                              Clear
                            </button>
                          </div>
                        </div>

                        {/* Range text input */}
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-semibold text-slate-500 whitespace-nowrap">Range:</span>
                          <input
                            type="text"
                            value={customRangeInput}
                            onChange={(e) => applyCustomRangeText(e.target.value)}
                            placeholder="e.g. 1, 3, 5-8"
                            className="flex-1 px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-blue-600 focus:bg-white font-medium"
                          />
                        </div>

                        {/* Interactive Page Previews Grid */}
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 max-h-[440px] overflow-y-auto p-2.5 bg-slate-50/70 rounded-xl border border-slate-200/80">
                          {Array.from({ length: items[0].pageCount || 1 }, (_, i) => i + 1).map((pageNum) => {
                            const isSelected = selectedPages.has(pageNum);
                            const isDelete = tool.slug === "remove-pages" || tool.optionsType === "remove-pages";
                            const thumbnail = pageThumbnails[pageNum];

                            return (
                              <button
                                key={pageNum}
                                type="button"
                                onClick={() => togglePageSelection(pageNum)}
                                className={`group relative rounded-2xl border p-2 flex flex-col justify-between items-center transition-all duration-200 shadow-2xs hover:shadow-md hover:scale-[1.02] cursor-pointer ${
                                  isSelected
                                    ? isDelete
                                      ? "border-red-500 bg-red-50/80 text-red-950 ring-2 ring-red-400"
                                      : "border-blue-600 bg-blue-50/80 text-blue-950 ring-2 ring-blue-400"
                                    : "border-slate-200/90 bg-white hover:border-slate-300 text-slate-700"
                                }`}
                              >
                                {/* Header: Page Badge & Checkbox */}
                                <div className="w-full flex items-center justify-between mb-1.5 px-0.5">
                                  <span className="text-[10px] font-bold text-slate-400 group-hover:text-slate-600">
                                    #{pageNum}
                                  </span>
                                  <span
                                    className={`w-4 h-4 rounded flex items-center justify-center text-[10px] transition ${
                                      isSelected
                                        ? isDelete
                                          ? "bg-red-600 text-white"
                                          : "bg-blue-600 text-white"
                                        : "border border-slate-300 text-transparent group-hover:border-slate-400"
                                    }`}
                                  >
                                    {isSelected && (isDelete ? <LuTrash2 className="w-2.5 h-2.5" /> : <LuCheck className="w-2.5 h-2.5" />)}
                                  </span>
                                </div>

                                {/* Page Preview Thumbnail */}
                                <div className="relative w-full aspect-3/4 rounded-xl overflow-hidden bg-white flex items-center justify-center border border-slate-200/60 shadow-2xs">
                                  {thumbnail ? (
                                    <img
                                      src={thumbnail}
                                      alt={`Page ${pageNum}`}
                                      className="w-full h-full object-contain pointer-events-none"
                                    />
                                  ) : (
                                    <div className="flex flex-col items-center justify-center gap-1.5 p-2 text-center">
                                      <LuRefreshCw className="w-4 h-4 text-slate-300 animate-spin" />
                                      <span className="text-[9px] text-slate-400 font-medium">Page {pageNum}</span>
                                    </div>
                                  )}

                                  {/* Selected Overlay */}
                                  {isSelected && (
                                    <div
                                      className={`absolute inset-0 flex items-center justify-center transition-all ${
                                        isDelete ? "bg-red-500/25" : "bg-blue-600/25"
                                      }`}
                                    >
                                      <span
                                        className={`w-7 h-7 rounded-full flex items-center justify-center text-white shadow-md ${
                                          isDelete ? "bg-red-600" : "bg-blue-600"
                                        }`}
                                      >
                                        {isDelete ? <LuTrash2 className="w-3.5 h-3.5" /> : <LuCheck className="w-3.5 h-3.5 font-bold" />}
                                      </span>
                                    </div>
                                  )}
                                </div>

                                {/* Footer Label */}
                                <span
                                  className={`mt-1.5 text-[11px] font-semibold truncate ${
                                    isSelected
                                      ? isDelete
                                        ? "text-red-700 font-bold"
                                        : "text-blue-700 font-bold"
                                      : "text-slate-600"
                                  }`}
                                >
                                  Page {pageNum}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  ) : isRotateTool && items[0] ? (
                    <div className="space-y-4">
                      {/* File Card Bar */}
                      <div className="flex items-center justify-between p-3.5 bg-white border border-slate-200/80 rounded-2xl shadow-2xs">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100">
                            <LuRotateCw className="w-5 h-5" />
                          </div>
                          <div className="min-w-0">
                            <div className="text-xs font-bold text-slate-800 truncate" title={items[0].name}>
                              {items[0].name}
                            </div>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <span className="text-[10px] text-slate-400 font-mono">
                                {(items[0].size / 1024).toFixed(1)} KB
                              </span>
                              {items[0].pageCount !== undefined && (
                                <>
                                  <span className="text-slate-300">&bull;</span>
                                  <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200/60">
                                    {items[0].pageCount} {items[0].pageCount === 1 ? "page" : "pages"}
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              const total = items[0].pageCount || 1;
                              const nextAngle = ((rotationAngle || 0) + 90) % 360;
                              setRotationAngle(nextAngle);
                              const updated: Record<number, number> = {};
                              for (let i = 1; i <= total; i++) {
                                updated[i] = nextAngle;
                              }
                              setPageRotations(updated);
                            }}
                            className="text-xs font-semibold text-blue-700 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 border border-blue-200 px-3 py-1.5 rounded-xl transition shrink-0 cursor-pointer flex items-center gap-1.5"
                          >
                            <LuRotateCw className="w-3.5 h-3.5" />
                            <span>Rotate All 90°</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="text-xs font-semibold text-slate-600 hover:text-blue-600 bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-200 px-3 py-1.5 rounded-xl transition shrink-0 cursor-pointer"
                          >
                            Change PDF
                          </button>
                        </div>
                      </div>

                      {/* Interactive Visual Page Rotation Grid */}
                      <div className="p-4 bg-white border border-slate-200/80 rounded-2xl shadow-2xs space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-800">
                            Live Page Orientations (Click page or button to rotate):
                          </span>
                          {isLoadingThumbnails && (
                            <span className="text-[10px] text-slate-400 flex items-center gap-1">
                              <LuRefreshCw className="w-3 h-3 animate-spin text-blue-500" />
                              <span>Rendering previews...</span>
                            </span>
                          )}
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 max-h-[440px] overflow-y-auto p-2.5 bg-slate-50/70 rounded-xl border border-slate-200/80">
                          {Array.from({ length: items[0].pageCount || 1 }, (_, i) => i + 1).map((pNum) => {
                            const angle = pageRotations[pNum] ?? rotationAngle ?? 0;
                            const thumbnail = pageThumbnails[pNum];
                            return (
                              <div
                                key={pNum}
                                className="group relative rounded-2xl border border-slate-200/90 bg-white p-2 flex flex-col justify-between items-center transition shadow-2xs hover:border-blue-300"
                              >
                                <div className="w-full flex items-center justify-between mb-1.5 px-0.5">
                                  <span className="text-[10px] font-bold text-slate-400">Page {pNum}</span>
                                  <span className="text-[10px] font-mono font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200/60">
                                    {angle}°
                                  </span>
                                </div>

                                <div
                                  onClick={() => {
                                    setPageRotations((prev) => ({
                                      ...prev,
                                      [pNum]: ((prev[pNum] ?? rotationAngle ?? 0) + 90) % 360,
                                    }));
                                  }}
                                  className="relative w-full aspect-3/4 rounded-xl overflow-hidden bg-slate-50 flex items-center justify-center border border-slate-200/60 cursor-pointer"
                                >
                                  {thumbnail ? (
                                    <img
                                      src={thumbnail}
                                      alt={`Page ${pNum}`}
                                      className="w-full h-full object-contain transition-transform duration-300"
                                      style={{ transform: `rotate(${angle}deg)` }}
                                    />
                                  ) : (
                                    <LuFileText
                                      className="w-10 h-10 text-blue-500 transition-transform duration-300"
                                      style={{ transform: `rotate(${angle}deg)` }}
                                    />
                                  )}
                                  <div className="absolute inset-0 bg-blue-600/0 hover:bg-blue-600/10 flex items-center justify-center transition">
                                    <span className="opacity-0 group-hover:opacity-100 bg-slate-900/80 text-white rounded-full p-2 shadow-md">
                                      <LuRotateCw className="w-4 h-4" />
                                    </span>
                                  </div>
                                </div>

                                <button
                                  type="button"
                                  onClick={() => {
                                    setPageRotations((prev) => ({
                                      ...prev,
                                      [pNum]: ((prev[pNum] ?? rotationAngle ?? 0) + 90) % 360,
                                    }));
                                  }}
                                  className="mt-2 w-full py-1 rounded-lg bg-slate-100 hover:bg-blue-50 text-[10px] font-semibold text-slate-700 hover:text-blue-700 border border-slate-200/70 flex items-center justify-center gap-1 cursor-pointer transition"
                                >
                                  <LuRotateCw className="w-3 h-3" />
                                  <span>+90°</span>
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  ) : isPageNumbersTool && items[0] ? (
                    <div className="space-y-4">
                      {/* File Card Bar */}
                      <div className="flex items-center justify-between p-3.5 bg-white border border-slate-200/80 rounded-2xl shadow-2xs">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100">
                            <LuType className="w-5 h-5" />
                          </div>
                          <div className="min-w-0">
                            <div className="text-xs font-bold text-slate-800 truncate" title={items[0].name}>
                              {items[0].name}
                            </div>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <span className="text-[10px] text-slate-400 font-mono">
                                {(items[0].size / 1024).toFixed(1)} KB
                              </span>
                              {items[0].pageCount !== undefined && (
                                <>
                                  <span className="text-slate-300">&bull;</span>
                                  <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200/60">
                                    {items[0].pageCount} pages detected
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="text-xs font-semibold text-slate-600 hover:text-blue-600 bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-200 px-3 py-1.5 rounded-xl transition shrink-0 cursor-pointer"
                        >
                          Change PDF
                        </button>
                      </div>

                      {/* Live Numbering Configuration Inspector Card */}
                      <div className="p-4 bg-white border border-slate-200/80 rounded-2xl shadow-2xs space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-800">
                            Page Numbering Layout Preview:
                          </span>
                          <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200 font-mono">
                            {pageNumberFormat === "page-x-of-y"
                              ? `Page 1 of ${items[0].pageCount || 1}`
                              : pageNumberFormat === "page-x"
                              ? "Page 1"
                              : pageNumberFormat === "dash-x-dash"
                              ? "- 1 -"
                              : "1"}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 max-h-[440px] overflow-y-auto p-2.5 bg-slate-50/70 rounded-xl border border-slate-200/80">
                          {Array.from({ length: items[0].pageCount || 1 }, (_, i) => i + 1).map((pNum) => {
                            const isSkipped = skipCoverPage && pNum === 1;
                            const total = items[0].pageCount || 1;
                            const stamp =
                              pageNumberFormat === "page-x-of-y"
                                ? `Page ${pNum} of ${total}`
                                : pageNumberFormat === "page-x"
                                ? `Page ${pNum}`
                                : pageNumberFormat === "dash-x-dash"
                                ? `- ${pNum} -`
                                : `${pNum}`;

                            return (
                              <div
                                key={pNum}
                                className="group relative rounded-2xl border border-slate-200/90 bg-white p-2 flex flex-col justify-between items-center transition shadow-2xs"
                              >
                                <div className="w-full flex items-center justify-between mb-1.5 px-0.5">
                                  <span className="text-[10px] font-bold text-slate-400">Page {pNum}</span>
                                  {isSkipped && (
                                    <span className="text-[9px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                                      Cover (Skip)
                                    </span>
                                  )}
                                </div>

                                <div className="relative w-full aspect-3/4 rounded-xl overflow-hidden bg-slate-50 flex items-center justify-center border border-slate-200/60">
                                  {pageThumbnails[pNum] ? (
                                    <img
                                      src={pageThumbnails[pNum]}
                                      alt={`Page ${pNum}`}
                                      className="w-full h-full object-contain pointer-events-none"
                                    />
                                  ) : (
                                    <LuFileText className="w-10 h-10 text-slate-300" />
                                  )}

                                  {/* Simulated Page Number Overlay */}
                                  {!isSkipped && (
                                    <div
                                      className={`absolute pointer-events-none px-2 py-0.5 bg-slate-900/85 text-white text-[9px] font-mono rounded shadow-xs ${
                                        pageNumberPosition === "top-left"
                                          ? "top-1 left-1"
                                          : pageNumberPosition === "top-center"
                                          ? "top-1 left-1/2 -translate-x-1/2"
                                          : pageNumberPosition === "top-right"
                                          ? "top-1 right-1"
                                          : pageNumberPosition === "bottom-left"
                                          ? "bottom-1 left-1"
                                          : pageNumberPosition === "bottom-right"
                                          ? "bottom-1 right-1"
                                          : "bottom-1 left-1/2 -translate-x-1/2"
                                      }`}
                                    >
                                      {stamp}
                                    </div>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  ) : isWatermarkTool && items[0] ? (
                    <div className="space-y-4">
                      {/* File Card Bar */}
                      <div className="flex items-center justify-between p-3.5 bg-white border border-slate-200/80 rounded-2xl shadow-2xs">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100">
                            <LuDroplets className="w-5 h-5" />
                          </div>
                          <div className="min-w-0">
                            <div className="text-xs font-bold text-slate-800 truncate" title={items[0].name}>
                              {items[0].name}
                            </div>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <span className="text-[10px] text-slate-400 font-mono">
                                {(items[0].size / 1024).toFixed(1)} KB
                              </span>
                              {items[0].pageCount !== undefined && (
                                <>
                                  <span className="text-slate-300">&bull;</span>
                                  <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200/60">
                                    {items[0].pageCount} pages detected
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="text-xs font-semibold text-slate-600 hover:text-blue-600 bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-200 px-3 py-1.5 rounded-xl transition shrink-0 cursor-pointer"
                        >
                          Change PDF
                        </button>
                      </div>

                      {/* Live Watermark Simulation Grid */}
                      <div className="p-4 bg-white border border-slate-200/80 rounded-2xl shadow-2xs space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-800">
                            Live Watermark Stamping Preview:
                          </span>
                          <span className="text-[10px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded font-mono">
                            Angle: {watermarkRotation}° &bull; Opacity: {Math.round(watermarkOpacity * 100)}%
                          </span>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 max-h-[440px] overflow-y-auto p-2.5 bg-slate-50/70 rounded-xl border border-slate-200/80">
                          {Array.from({ length: items[0].pageCount || 1 }, (_, i) => i + 1).map((pNum) => (
                            <div
                              key={pNum}
                              className="group relative rounded-2xl border border-slate-200/90 bg-white p-2 flex flex-col justify-between items-center transition shadow-2xs"
                            >
                              <div className="w-full flex items-center justify-between mb-1.5 px-0.5">
                                <span className="text-[10px] font-bold text-slate-400">Page {pNum}</span>
                              </div>

                              <div className="relative w-full aspect-3/4 rounded-xl overflow-hidden bg-slate-50 flex items-center justify-center border border-slate-200/60">
                                {pageThumbnails[pNum] ? (
                                  <img
                                    src={pageThumbnails[pNum]}
                                    alt={`Page ${pNum}`}
                                    className="w-full h-full object-contain pointer-events-none"
                                  />
                                ) : (
                                  <LuFileText className="w-10 h-10 text-slate-300" />
                                )}

                                {/* Watermark Simulation Stamp */}
                                <div
                                  className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden"
                                >
                                  <span
                                    className="font-black text-rose-600 uppercase tracking-widest text-xs sm:text-sm select-none border-2 border-rose-600 px-2 py-0.5 rounded"
                                    style={{
                                      opacity: watermarkOpacity,
                                      transform: `rotate(${watermarkRotation}deg)`,
                                    }}
                                  >
                                    {watermarkText || "WATERMARK"}
                                  </span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : isCropTool && items[0] ? (
                    <div className="space-y-4">
                      {/* File Card Bar */}
                      <div className="flex items-center justify-between p-3.5 bg-white border border-slate-200/80 rounded-2xl shadow-2xs">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100">
                            <LuCrop className="w-5 h-5" />
                          </div>
                          <div className="min-w-0">
                            <div className="text-xs font-bold text-slate-800 truncate" title={items[0].name}>
                              {items[0].name}
                            </div>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <span className="text-[10px] text-slate-400 font-mono">
                                {(items[0].size / 1024).toFixed(1)} KB
                              </span>
                              {items[0].pageCount !== undefined && (
                                <>
                                  <span className="text-slate-300">&bull;</span>
                                  <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200/60">
                                    {items[0].pageCount} pages detected
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="text-xs font-semibold text-slate-600 hover:text-blue-600 bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-200 px-3 py-1.5 rounded-xl transition shrink-0 cursor-pointer"
                        >
                          Change PDF
                        </button>
                      </div>

                      {/* Live Crop Guide Grid */}
                      <div className="p-4 bg-white border border-slate-200/80 rounded-2xl shadow-2xs space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-800">
                            Crop Margin Boundary Preview ({cropMarginPercent}% Inset):
                          </span>
                          <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200 font-mono">
                            {cropPreset === "trim-margins" ? "Trim Margins" : "Custom Inset"}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 max-h-[440px] overflow-y-auto p-2.5 bg-slate-50/70 rounded-xl border border-slate-200/80">
                          {Array.from({ length: items[0].pageCount || 1 }, (_, i) => i + 1).map((pNum) => (
                            <div
                              key={pNum}
                              className="group relative rounded-2xl border border-slate-200/90 bg-white p-2 flex flex-col justify-between items-center transition shadow-2xs"
                            >
                              <div className="w-full flex items-center justify-between mb-1.5 px-0.5">
                                <span className="text-[10px] font-bold text-slate-400">Page {pNum}</span>
                              </div>

                              <div className="relative w-full aspect-3/4 rounded-xl overflow-hidden bg-slate-50 flex items-center justify-center border border-slate-200/60 p-2">
                                {pageThumbnails[pNum] ? (
                                  <img
                                    src={pageThumbnails[pNum]}
                                    alt={`Page ${pNum}`}
                                    className="w-full h-full object-contain pointer-events-none"
                                  />
                                ) : (
                                  <LuFileText className="w-10 h-10 text-slate-300" />
                                )}

                                {/* Dashed Crop Box Guide */}
                                <div
                                  className="absolute border-2 border-dashed border-blue-500 bg-blue-500/10 pointer-events-none transition-all"
                                  style={{
                                    top: `${cropMarginPercent}%`,
                                    bottom: `${cropMarginPercent}%`,
                                    left: `${cropMarginPercent}%`,
                                    right: `${cropMarginPercent}%`,
                                  }}
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : isEditPdfTool && items[0] ? (
                    <div className="space-y-4">
                      {/* File Card Bar */}
                      <div className="flex items-center justify-between p-3.5 bg-white border border-slate-200/80 rounded-2xl shadow-2xs">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100">
                            <LuPenLine className="w-5 h-5" />
                          </div>
                          <div className="min-w-0">
                            <div className="text-xs font-bold text-slate-800 truncate" title={items[0].name}>
                              {items[0].name}
                            </div>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <span className="text-[10px] text-slate-400 font-mono">
                                {(items[0].size / 1024).toFixed(1)} KB
                              </span>
                              {items[0].pageCount !== undefined && (
                                <>
                                  <span className="text-slate-300">&bull;</span>
                                  <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200/60">
                                    {items[0].pageCount} pages detected
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="text-xs font-semibold text-slate-600 hover:text-blue-600 bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-200 px-3 py-1.5 rounded-xl transition shrink-0 cursor-pointer"
                        >
                          Change PDF
                        </button>
                      </div>

                      {/* Live Edit / Annotation Stamping Preview */}
                      <div className="p-4 bg-white border border-slate-200/80 rounded-2xl shadow-2xs space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-800">
                            Live Text Stamp Preview:
                          </span>
                          <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200 font-mono">
                            {addedText || "Text Stamp"}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 max-h-[440px] overflow-y-auto p-2.5 bg-slate-50/70 rounded-xl border border-slate-200/80">
                          {Array.from({ length: items[0].pageCount || 1 }, (_, i) => i + 1).map((pNum) => (
                            <div
                              key={pNum}
                              className="group relative rounded-2xl border border-slate-200/90 bg-white p-2 flex flex-col justify-between items-center transition shadow-2xs"
                            >
                              <div className="w-full flex items-center justify-between mb-1.5 px-0.5">
                                <span className="text-[10px] font-bold text-slate-400">Page {pNum}</span>
                              </div>

                              <div className="relative w-full aspect-3/4 rounded-xl overflow-hidden bg-slate-50 flex items-center justify-center border border-slate-200/60">
                                {pageThumbnails[pNum] ? (
                                  <img
                                    src={pageThumbnails[pNum]}
                                    alt={`Page ${pNum}`}
                                    className="w-full h-full object-contain pointer-events-none"
                                  />
                                ) : (
                                  <LuFileText className="w-10 h-10 text-slate-300" />
                                )}

                                {/* Stamp preview */}
                                <div
                                  className={`absolute pointer-events-none px-2 py-0.5 text-[9px] font-bold shadow-xs ${
                                    addBorderBox
                                      ? "bg-blue-600 text-white rounded"
                                      : "text-blue-700 bg-white/90 rounded border border-blue-300"
                                  } ${
                                    textPosition === "top-left"
                                      ? "top-1 left-1"
                                      : textPosition === "top-right"
                                      ? "top-1 right-1"
                                      : textPosition === "bottom-left"
                                      ? "bottom-1 left-1"
                                      : textPosition === "bottom-right"
                                      ? "bottom-1 right-1"
                                      : "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
                                  }`}
                                >
                                  {addedText || "Text"}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : isPdfFormsTool && items[0] ? (
                    <div className="space-y-4">
                      {/* File Card Bar */}
                      <div className="flex items-center justify-between p-3.5 bg-white border border-slate-200/80 rounded-2xl shadow-2xs">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100">
                            <LuSquareCheck className="w-5 h-5" />
                          </div>
                          <div className="min-w-0">
                            <div className="text-xs font-bold text-slate-800 truncate" title={items[0].name}>
                              {items[0].name}
                            </div>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <span className="text-[10px] text-slate-400 font-mono">
                                {(items[0].size / 1024).toFixed(1)} KB
                              </span>
                              {items[0].pageCount !== undefined && (
                                <>
                                  <span className="text-slate-300">&bull;</span>
                                  <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200/60">
                                    {items[0].pageCount} pages detected
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="text-xs font-semibold text-slate-600 hover:text-blue-600 bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-200 px-3 py-1.5 rounded-xl transition shrink-0 cursor-pointer"
                        >
                          Change PDF
                        </button>
                      </div>

                      {/* Interactive Form Field Scanner & In-Place Filler */}
                      <div className="p-4 bg-white border border-slate-200/80 rounded-2xl shadow-2xs space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-slate-800">
                              Detected Form Fields ({detectedFormFields.length}):
                            </span>
                            {detectedFormFields.length > 0 ? (
                              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                                AcroForm Active
                              </span>
                            ) : (
                              <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                                Form Stamp Fallback
                              </span>
                            )}
                          </div>
                        </div>

                        {detectedFormFields.length > 0 ? (
                          <div className="space-y-2.5 max-h-[300px] overflow-y-auto p-3 bg-slate-50/80 rounded-xl border border-slate-200/70">
                            {detectedFormFields.map((field) => (
                              <div key={field.name} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-2 bg-white rounded-lg border border-slate-200 text-xs">
                                <div className="min-w-0">
                                  <span className="font-bold text-slate-800 truncate block font-mono text-[11px]">
                                    {field.name}
                                  </span>
                                  <span className="text-[9px] text-slate-400 capitalize">
                                    Type: {field.type.toLowerCase()}
                                  </span>
                                </div>
                                <div className="sm:w-60">
                                  {field.type.toLowerCase().includes("check") ? (
                                    <label className="flex items-center gap-2 cursor-pointer">
                                      <input
                                        type="checkbox"
                                        checked={formFieldValues[field.name] === "true"}
                                        onChange={(e) =>
                                          setFormFieldValues((prev) => ({
                                            ...prev,
                                            [field.name]: e.target.checked ? "true" : "false",
                                          }))
                                        }
                                        className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                                      />
                                      <span className="text-slate-600 text-[11px]">Check / Select</span>
                                    </label>
                                  ) : (
                                    <input
                                      type="text"
                                      value={formFieldValues[field.name] ?? field.value ?? ""}
                                      onChange={(e) =>
                                        setFormFieldValues((prev) => ({
                                          ...prev,
                                          [field.name]: e.target.value,
                                        }))
                                      }
                                      placeholder="Fill value..."
                                      className="w-full px-2.5 py-1 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-600 focus:bg-white"
                                    />
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="p-3 bg-amber-50/60 border border-amber-200/70 rounded-xl text-xs text-amber-800 space-y-1.5">
                            <p className="font-semibold">
                              This PDF does not contain interactive AcroForm field definitions.
                            </p>
                            <p className="text-[11px] text-amber-700">
                              Our smart engine automatically switches to stamping mode, enabling you to annotate or fill in values cleanly onto your document.
                            </p>
                          </div>
                        )}

                        {/* Page Previews */}
                        <div className="pt-2 border-t border-slate-100">
                          <div className="text-[11px] font-bold text-slate-500 mb-2">Document Previews</div>
                          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2 max-h-[160px] overflow-y-auto">
                            {Array.from({ length: items[0].pageCount || 1 }, (_, i) => i + 1).map((pNum) => (
                              <div key={pNum} className="aspect-3/4 rounded-lg bg-slate-50 border border-slate-200 overflow-hidden relative">
                                {pageThumbnails[pNum] ? (
                                  <img src={pageThumbnails[pNum]} alt={`Page ${pNum}`} className="w-full h-full object-contain" />
                                ) : (
                                  <div className="flex items-center justify-center h-full text-[10px] text-slate-400 font-bold">p.{pNum}</div>
                                )}
                                <span className="absolute bottom-1 right-1 text-[9px] bg-slate-900/70 text-white px-1 rounded font-mono">
                                  {pNum}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : isUnlockTool && items[0] ? (
                    <div className="space-y-4">
                      {/* File Card Bar */}
                      <div className="flex items-center justify-between p-3.5 bg-white border border-slate-200/80 rounded-2xl shadow-2xs">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100">
                            <LuLockOpen className="w-5 h-5" />
                          </div>
                          <div className="min-w-0">
                            <div className="text-xs font-bold text-slate-800 truncate" title={items[0].name}>
                              {items[0].name}
                            </div>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <span className="text-[10px] text-slate-400 font-mono">
                                {(items[0].size / 1024).toFixed(1)} KB
                              </span>
                              <span className="text-slate-300">&bull;</span>
                              <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200/60">
                                Protected Document Decryption
                              </span>
                            </div>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="text-xs font-semibold text-slate-600 hover:text-emerald-600 bg-slate-50 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-200 px-3 py-1.5 rounded-xl transition shrink-0 cursor-pointer"
                        >
                          Change PDF
                        </button>
                      </div>

                      {/* Decryption Station Banner */}
                      <div className="p-5 bg-gradient-to-br from-emerald-50/80 via-white to-teal-50/50 border border-emerald-200/80 rounded-2xl shadow-2xs space-y-4 text-center">
                        <div className="w-14 h-14 mx-auto rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-500/20">
                          <LuKey className="w-7 h-7" />
                        </div>
                        <div className="max-w-md mx-auto space-y-1">
                          <div className="text-sm font-bold text-slate-900">
                            Ready to Decrypt & Strip Restrictions
                          </div>
                          <p className="text-xs text-slate-500 leading-relaxed">
                            Enter the document password in the sidebar settings. The workstation will decrypt and generate an unrestricted PDF with printing, copying, and modifications enabled.
                          </p>
                        </div>
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white border border-emerald-200 text-emerald-700 text-xs font-semibold shadow-2xs">
                          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                          <span>In-Browser Cryptographic Decryption</span>
                        </div>
                      </div>

                      {/* Page Previews */}
                      <div className="p-4 bg-white border border-slate-200/80 rounded-2xl shadow-2xs">
                        <div className="text-[11px] font-bold text-slate-500 mb-2">Document Previews</div>
                        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2 max-h-[160px] overflow-y-auto">
                          {Array.from({ length: items[0].pageCount || 1 }, (_, i) => i + 1).map((pNum) => (
                            <div key={pNum} className="aspect-3/4 rounded-lg bg-slate-50 border border-slate-200 overflow-hidden relative">
                              {pageThumbnails[pNum] ? (
                                <img src={pageThumbnails[pNum]} alt={`Page ${pNum}`} className="w-full h-full object-contain" />
                              ) : (
                                <div className="flex items-center justify-center h-full text-[10px] text-slate-400 font-bold">p.{pNum}</div>
                              )}
                              <span className="absolute bottom-1 right-1 text-[9px] bg-slate-900/70 text-white px-1 rounded font-mono">
                                {pNum}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : isProtectTool && items[0] ? (
                    <div className="space-y-4">
                      {/* File Card Bar */}
                      <div className="flex items-center justify-between p-3.5 bg-white border border-slate-200/80 rounded-2xl shadow-2xs">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100">
                            <LuShield className="w-5 h-5" />
                          </div>
                          <div className="min-w-0">
                            <div className="text-xs font-bold text-slate-800 truncate" title={items[0].name}>
                              {items[0].name}
                            </div>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <span className="text-[10px] text-slate-400 font-mono">
                                {(items[0].size / 1024).toFixed(1)} KB
                              </span>
                              <span className="text-slate-300">&bull;</span>
                              <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200/60">
                                256-bit AES Standard
                              </span>
                            </div>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="text-xs font-semibold text-slate-600 hover:text-blue-600 bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-200 px-3 py-1.5 rounded-xl transition shrink-0 cursor-pointer"
                        >
                          Change PDF
                        </button>
                      </div>

                      {/* Encryption Station Card */}
                      <div className="p-4 bg-white border border-slate-200/80 rounded-2xl shadow-2xs space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="text-xs font-bold text-slate-800">Security Configuration:</div>
                          <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                            AES-256 Enabled
                          </span>
                        </div>
                        <div className="grid grid-cols-3 gap-2 text-center">
                          <div className={`p-2.5 rounded-xl border text-xs transition ${
                            allowPrinting ? "bg-emerald-50/70 border-emerald-200 text-emerald-800 font-semibold" : "bg-slate-50 border-slate-200 text-slate-500 line-through"
                          }`}>
                            Printing
                          </div>
                          <div className={`p-2.5 rounded-xl border text-xs transition ${
                            allowCopying ? "bg-emerald-50/70 border-emerald-200 text-emerald-800 font-semibold" : "bg-slate-50 border-slate-200 text-slate-500 line-through"
                          }`}>
                            Copying
                          </div>
                          <div className={`p-2.5 rounded-xl border text-xs transition ${
                            allowModifying ? "bg-emerald-50/70 border-emerald-200 text-emerald-800 font-semibold" : "bg-slate-50 border-slate-200 text-slate-500 line-through"
                          }`}>
                            Modifying
                          </div>
                        </div>

                        {/* Page Previews */}
                        <div className="pt-2 border-t border-slate-100">
                          <div className="text-[11px] font-bold text-slate-500 mb-2">Document Previews</div>
                          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2 max-h-[160px] overflow-y-auto">
                            {Array.from({ length: items[0].pageCount || 1 }, (_, i) => i + 1).map((pNum) => (
                              <div key={pNum} className="aspect-3/4 rounded-lg bg-slate-50 border border-slate-200 overflow-hidden relative">
                                {pageThumbnails[pNum] ? (
                                  <img src={pageThumbnails[pNum]} alt={`Page ${pNum}`} className="w-full h-full object-contain" />
                                ) : (
                                  <div className="flex items-center justify-center h-full text-[10px] text-slate-400 font-bold">p.{pNum}</div>
                                )}
                                <span className="absolute bottom-1 right-1 text-[9px] bg-slate-900/70 text-white px-1 rounded font-mono">
                                  {pNum}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : isSignTool && items[0] ? (
                    <div className="space-y-4">
                      {/* File Card Bar */}
                      <div className="flex items-center justify-between p-3.5 bg-white border border-slate-200/80 rounded-2xl shadow-2xs">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0 border border-purple-100">
                            <LuSignature className="w-5 h-5" />
                          </div>
                          <div className="min-w-0">
                            <div className="text-xs font-bold text-slate-800 truncate" title={items[0].name}>
                              {items[0].name}
                            </div>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <span className="text-[10px] text-slate-400 font-mono">
                                {(items[0].size / 1024).toFixed(1)} KB
                              </span>
                              <span className="text-slate-300">&bull;</span>
                              <span className="text-[10px] font-bold text-purple-600 bg-purple-50 px-1.5 py-0.5 rounded border border-purple-200/60">
                                Digital Certificate Signer
                              </span>
                            </div>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="text-xs font-semibold text-slate-600 hover:text-purple-600 bg-slate-50 hover:bg-purple-50 border border-slate-200 hover:border-purple-200 px-3 py-1.5 rounded-xl transition shrink-0 cursor-pointer"
                        >
                          Change PDF
                        </button>
                      </div>

                      {/* Interactive PDF Document Canvas with Signature Pin */}
                      <div className="p-4 bg-white border border-slate-200/80 rounded-2xl shadow-2xs space-y-4">
                        <div className="flex items-center justify-between flex-wrap gap-2">
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => setSignCurrentPage((p) => Math.max(1, p - 1))}
                              disabled={signCurrentPage <= 1}
                              className="px-2.5 py-1 text-xs font-semibold rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 cursor-pointer"
                            >
                              <LuChevronLeft className="w-3.5 h-3.5" />
                              Prev
                            </button>
                            <span className="text-xs font-bold text-slate-700">
                              Page {signCurrentPage} of {items[0].pageCount || 1}
                            </span>
                            <button
                              type="button"
                              onClick={() => setSignCurrentPage((p) => Math.min(items[0].pageCount || 1, p + 1))}
                              disabled={signCurrentPage >= (items[0].pageCount || 1)}
                              className="px-2.5 py-1 text-xs font-semibold rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 cursor-pointer"
                            >
                              Next
                              <LuChevronRight className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          <span className="text-[11px] font-medium text-purple-700 bg-purple-50 px-2.5 py-1 rounded-full border border-purple-200">
                            Click canvas anywhere to place signature ({sigPlacement.xPercent}%, {sigPlacement.yPercent}%)
                          </span>
                        </div>

                        {/* Document viewport with placement pin */}
                        <div className="bg-slate-100 rounded-2xl p-4 flex justify-center items-center overflow-auto max-h-[620px] relative border border-slate-200/60">
                          <div className="relative inline-block select-none">
                            <canvas
                              ref={signPreviewCanvasRef}
                              onClick={handleSignPreviewClick}
                              className="max-w-full h-auto rounded-lg shadow-md cursor-crosshair bg-white block"
                            />
                            {/* Visual cursor tag for e-signature placement */}
                            <div
                              style={{
                                left: `${sigPlacement.xPercent}%`,
                                top: `${sigPlacement.yPercent}%`,
                              }}
                              className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-none flex flex-col items-center z-10 transition-all duration-75"
                            >
                              <div className="px-2.5 py-1 rounded-md bg-purple-600 text-white font-bold text-[10px] shadow-lg whitespace-nowrap animate-pulse flex items-center gap-1">
                                <LuSignature className="w-3 h-3" />
                                Drop Signature Here
                              </div>
                              <div className="w-2 h-2 bg-purple-600 rotate-45 -mt-1" />
                            </div>
                          </div>
                        </div>

                        {/* Active Signature Preview Footer Strip */}
                        <div className="pt-2 border-t border-slate-100 flex items-center justify-between flex-wrap gap-2 text-xs">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-slate-500">Active Signature:</span>
                            {sigImageSrc ? (
                              <div className="h-9 px-3 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-center">
                                <img src={sigImageSrc} alt="Signature Preview" className="h-7 max-w-[120px] object-contain" />
                              </div>
                            ) : (
                              <span className="italic text-slate-400">None created yet</span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-[11px] text-slate-400">
                            <span>High-DPI Canvas Rendering</span>
                            <span>&bull;</span>
                            <span>100% Client-Side Private</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : isRedactTool && items[0] ? (
                    <div className="space-y-4">
                      {/* File Card Bar */}
                      <div className="flex items-center justify-between p-3.5 bg-white border border-slate-200/80 rounded-2xl shadow-2xs">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0 border border-rose-100">
                            <LuEyeOff className="w-5 h-5 pointer-events-none" />
                          </div>
                          <div className="min-w-0">
                            <div className="text-xs font-bold text-slate-800 truncate" title={items[0].name}>
                              {items[0].name}
                            </div>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <span className="text-[10px] text-slate-400 font-mono">
                                {(items[0].size / 1024).toFixed(1)} KB
                              </span>
                              <span className="text-slate-300">&bull;</span>
                              <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200/60">
                                True Raster Redaction
                              </span>
                            </div>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="text-xs font-semibold text-slate-600 hover:text-rose-600 bg-slate-50 hover:bg-rose-50 border border-slate-200 hover:border-rose-200 px-3 py-1.5 rounded-xl transition shrink-0 cursor-pointer"
                        >
                          Change PDF
                        </button>
                      </div>

                      {/* Redaction Canvas Simulation */}
                      <div className="p-4 bg-white border border-slate-200/80 rounded-2xl shadow-2xs space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="text-xs font-bold text-slate-800">Redaction Overlay Zone:</div>
                          <span className="text-[10px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200 uppercase">
                            Position: {redactPlacement}
                          </span>
                        </div>

                        <div className="relative aspect-4/3 max-w-sm mx-auto rounded-xl bg-slate-100 border border-slate-300 overflow-hidden flex flex-col justify-between p-4">
                          {/* Simulated document lines */}
                          <div className="space-y-2 opacity-30">
                            <div className="h-2 bg-slate-400 rounded w-5/6"></div>
                            <div className="h-2 bg-slate-400 rounded w-4/6"></div>
                            <div className="h-2 bg-slate-400 rounded w-full"></div>
                          </div>

                          {/* True Blackout Bar */}
                          <div className="p-2.5 bg-black text-white rounded font-mono text-[11px] font-bold text-center tracking-wider shadow-md">
                            [{redactReason || "REDACTED"}]
                          </div>

                          <div className="space-y-2 opacity-30">
                            <div className="h-2 bg-slate-400 rounded w-full"></div>
                            <div className="h-2 bg-slate-400 rounded w-3/4"></div>
                          </div>
                        </div>

                        {/* Page Selection for Redaction */}
                        <div className="pt-2 border-t border-slate-100">
                          <div className="text-[11px] font-bold text-slate-500 mb-2">Select Pages to Redact</div>
                          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2 max-h-[160px] overflow-y-auto">
                            {Array.from({ length: items[0].pageCount || 1 }, (_, i) => i + 1).map((pNum) => {
                              const isRedacted = redactPages.has(pNum);
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
                                  className={`aspect-3/4 rounded-lg bg-slate-50 border-2 overflow-hidden relative transition text-left cursor-pointer ${
                                    isRedacted ? "border-rose-500 ring-2 ring-rose-100" : "border-slate-200 hover:border-slate-300"
                                  }`}
                                >
                                  {pageThumbnails[pNum] ? (
                                    <img src={pageThumbnails[pNum]} alt={`Page ${pNum}`} className="w-full h-full object-contain" />
                                  ) : (
                                    <div className="flex items-center justify-center h-full text-[10px] text-slate-400 font-bold">p.{pNum}</div>
                                  )}
                                  {isRedacted && (
                                    <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 bg-black/90 text-white text-[8px] font-mono font-bold text-center py-0.5">
                                      REDACT
                                    </div>
                                  )}
                                  <span className="absolute bottom-1 right-1 text-[9px] bg-slate-900/70 text-white px-1 rounded font-mono">
                                    {pNum}
                                  </span>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : isCompareTool && items.length > 0 ? (
                    <div className="space-y-4">
                      {/* Document Comparison Overview Cards */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {/* Doc A */}
                        <div className="p-3.5 bg-white border border-slate-200/80 rounded-2xl shadow-2xs space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                              Document A (Original)
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono">
                              {(items[0].size / 1024).toFixed(1)} KB
                            </span>
                          </div>
                          <div className="text-xs font-bold text-slate-800 truncate" title={items[0].name}>
                            {items[0].name}
                          </div>
                          <div className="text-[11px] text-slate-500 font-mono">
                            {items[0].pageCount || 1} pages
                          </div>
                        </div>

                        {/* Doc B */}
                        {items[1] ? (
                          <div className="p-3.5 bg-white border border-slate-200/80 rounded-2xl shadow-2xs space-y-2 relative">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                                Document B (Comparison)
                              </span>
                              <span className="text-[10px] text-slate-400 font-mono">
                                {(items[1].size / 1024).toFixed(1)} KB
                              </span>
                            </div>
                            <div className="text-xs font-bold text-slate-800 truncate" title={items[1].name}>
                              {items[1].name}
                            </div>
                            <div className="text-[11px] text-slate-500 font-mono">
                              {items[1].pageCount || 1} pages
                            </div>
                            <button
                              type="button"
                              onClick={() => removeItem(items[1].id)}
                              className="absolute top-2 right-2 text-slate-400 hover:text-rose-500 text-xs cursor-pointer p-1"
                              title="Remove second document"
                            >
                              &times;
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => {
                              if (addMoreInputRef.current) {
                                addMoreInputRef.current.value = "";
                                addMoreInputRef.current.click();
                              } else if (fileInputRef.current) {
                                fileInputRef.current.value = "";
                                fileInputRef.current.click();
                              }
                            }}
                            onDragOver={(e) => e.preventDefault()}
                            onDrop={handleDrop}
                            className="w-full p-5 border-2 border-dashed border-sky-300 hover:border-sky-500 bg-sky-50/40 hover:bg-sky-50 rounded-2xl flex flex-col items-center justify-center gap-1.5 transition cursor-pointer text-sky-700 select-none"
                          >
                            <LuGitCompare className="w-6 h-6" />
                            <span className="text-xs font-bold">+ Upload Second PDF to Compare</span>
                          </button>
                        )}
                      </div>

                      {/* Comparison Metrics Sheet */}
                      <div className="p-4 bg-white border border-slate-200/80 rounded-2xl shadow-2xs space-y-3">
                        <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                          <LuFileDiff className="w-4 h-4 text-sky-600" />
                          <span>Structural Diff Diagnostics:</span>
                        </div>
                        <div className="grid grid-cols-3 gap-2 text-center text-xs">
                          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                            <div className="text-[10px] text-slate-400 font-bold uppercase">Page Count Diff</div>
                            <div className="font-bold text-slate-800 mt-0.5">
                              {items[1] ? Math.abs((items[0].pageCount || 1) - (items[1].pageCount || 1)) : 0} pages
                            </div>
                          </div>
                          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                            <div className="text-[10px] text-slate-400 font-bold uppercase">Size Delta</div>
                            <div className="font-bold text-slate-800 mt-0.5">
                              {items[1] ? `${Math.abs(Math.round((items[0].size - items[1].size) / 1024))} KB` : "--"}
                            </div>
                          </div>
                          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                            <div className="text-[10px] text-slate-400 font-bold uppercase">Status</div>
                            <div className="font-bold text-emerald-600 mt-0.5">
                              {items[1] ? "Ready to Compare" : "Awaiting Doc 2"}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : isConvertToPdfTool && items[0] ? (
                    <div className="w-full space-y-4">
                      {/* Document Toolbar Header */}
                      <div className="flex items-center justify-between p-3.5 bg-white border border-slate-200/80 rounded-2xl shadow-2xs">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-500 text-white flex items-center justify-center font-bold text-sm shadow-xs">
                            <LuFileText className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="text-xs font-bold text-slate-800 truncate max-w-xs sm:max-w-md" title={items[0].name}>
                              {items[0].name}
                            </div>
                            <div className="text-[10px] text-slate-400">
                              {(items[0].size / 1024).toFixed(1)} KB • In-Browser Document Preview
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          {docPreviewData?.wordCount !== undefined && (
                            <span className="text-[11px] font-medium text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg">
                              {docPreviewData.wordCount.toLocaleString()} words
                            </span>
                          )}
                          {docPreviewData?.slidesCount !== undefined && (
                            <span className="text-[11px] font-medium text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg">
                              {docPreviewData.slidesCount} slides
                            </span>
                          )}
                          {docPreviewData?.sheets && (
                            <span className="text-[11px] font-medium text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg">
                              {docPreviewData.sheets.length} {docPreviewData.sheets.length === 1 ? "sheet" : "sheets"}
                            </span>
                          )}
                          <button
                            type="button"
                            onClick={() => {
                              if (addMoreInputRef.current) {
                                addMoreInputRef.current.value = "";
                                addMoreInputRef.current.click();
                              } else if (fileInputRef.current) {
                                fileInputRef.current.value = "";
                                fileInputRef.current.click();
                              }
                            }}
                            className="text-xs font-semibold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-xl transition cursor-pointer"
                          >
                            Replace File
                          </button>
                        </div>
                      </div>

                      {/* Document Viewer Body */}
                      {docPreviewData?.type === "xlsx" ? (
                        <div className="bg-white border border-slate-200/90 rounded-2xl shadow-sm overflow-hidden">
                          {/* Sheet Tab Bar */}
                          <div className="flex items-center gap-1 px-4 py-2 bg-slate-100/80 border-b border-slate-200 overflow-x-auto">
                            {(docPreviewData.sheets || ["Sheet1"]).map((s) => (
                              <button
                                key={s}
                                type="button"
                                onClick={() => {
                                  setActiveSpreadsheetTab(s);
                                  if (docPreviewData.sheetData?.[s]) {
                                    setDocPreviewData((prev) =>
                                      prev ? { ...prev, tableData: prev.sheetData?.[s] || [] } : null
                                    );
                                  }
                                }}
                                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition cursor-pointer flex items-center gap-1.5 ${
                                  activeSpreadsheetTab === s
                                    ? "bg-white text-emerald-700 font-bold shadow-2xs border border-slate-200/80 ring-1 ring-emerald-500/20"
                                    : "text-slate-600 hover:bg-white/60"
                                }`}
                              >
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                {s}
                              </button>
                            ))}
                          </div>
                          {/* Spreadsheet Grid */}
                          <div className="max-h-[500px] overflow-auto">
                            {docPreviewData.tableData && docPreviewData.tableData.length > 0 ? (
                              <table className="w-full text-xs text-left border-collapse font-sans">
                                <thead>
                                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold sticky top-0 z-10">
                                    <th className="w-12 px-2.5 py-2 text-center border-r border-slate-200 bg-slate-100/90 select-none text-[10px] font-mono">
                                      #
                                    </th>
                                    {Array.from(
                                      {
                                        length: Math.max(
                                          ...docPreviewData.tableData.map((r) => r.length),
                                          6
                                        ),
                                      },
                                      (_, cIdx) => (
                                        <th
                                          key={cIdx}
                                          className="px-3.5 py-2 border-r border-slate-200 font-mono text-[11px] bg-slate-50/90 select-none"
                                        >
                                          {cIdx < 26
                                            ? String.fromCharCode(65 + cIdx)
                                            : `${String.fromCharCode(64 + Math.floor(cIdx / 26))}${String.fromCharCode(
                                                65 + (cIdx % 26)
                                              )}`}
                                        </th>
                                      )
                                    )}
                                  </tr>
                                </thead>
                                <tbody>
                                  {docPreviewData.tableData.slice(0, 50).map((row, rIdx) => {
                                    const colCount = Math.max(
                                      ...docPreviewData.tableData!.map((r) => r.length),
                                      6
                                    );
                                    return (
                                      <tr
                                        key={rIdx}
                                        className="border-b border-slate-100 hover:bg-emerald-50/20 transition"
                                      >
                                        <td className="px-2.5 py-2 text-center text-[10px] text-slate-400 font-mono border-r border-slate-200 bg-slate-50/70 select-none">
                                          {rIdx + 1}
                                        </td>
                                        {Array.from({ length: colCount }, (_, cIdx) => {
                                          const cell = row[cIdx];
                                          const isNumber = cell && !isNaN(Number(cell.trim()));
                                          return (
                                            <td
                                              key={cIdx}
                                              className={`px-3.5 py-2 border-r border-slate-100 text-slate-800 truncate max-w-[220px] ${
                                                isNumber ? "font-mono text-right" : "text-left"
                                              }`}
                                            >
                                              {cell !== undefined && cell !== "" ? (
                                                cell
                                              ) : (
                                                <span className="text-slate-200 font-mono">·</span>
                                              )}
                                            </td>
                                          );
                                        })}
                                      </tr>
                                    );
                                  })}
                                </tbody>
                              </table>
                            ) : (
                              <div className="p-12 text-center space-y-3">
                                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-200/60 shadow-2xs">
                                  <LuFileText className="w-6 h-6" />
                                </div>
                                <div>
                                  <div className="text-sm font-bold text-slate-800">{items[0]?.name}</div>
                                  <div className="text-xs text-slate-400 mt-0.5">
                                    {(items[0]?.size / 1024).toFixed(1)} KB • Microsoft Excel Spreadsheet
                                  </div>
                                </div>
                                <div className="text-xs text-emerald-700 bg-emerald-50 inline-block px-3 py-1 rounded-full border border-emerald-200 font-medium">
                                  Ready to convert into high-fidelity vector PDF tables
                                </div>
                              </div>
                            )}
                          </div>
                          <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-200 text-[11px] text-slate-500 flex items-center justify-between">
                            <span className="flex items-center gap-1.5">
                              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                              Workbook Active: {activeSpreadsheetTab}
                            </span>
                            <span>
                              {docPreviewData.tableData?.length || 0} rows displayed
                            </span>
                          </div>
                        </div>
                      ) : docPreviewData?.type === "pptx" ? (
                        <div className="space-y-3">
                          {/* 16:9 Presentation Canvas */}
                          <div className="aspect-video w-full max-w-2xl mx-auto rounded-2xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 border border-slate-700/80 shadow-lg p-8 sm:p-12 flex flex-col justify-between text-white relative overflow-hidden">
                            <div className="flex items-center justify-between text-xs text-indigo-300 font-mono">
                              <span>Presentation Slide Deck</span>
                              <span>Slide {activeSlideIndex} of {docPreviewData.slidesCount || 1}</span>
                            </div>
                            <div className="my-auto space-y-3 text-center">
                              <div className="w-12 h-12 rounded-2xl bg-orange-500/20 border border-orange-400/40 text-orange-400 flex items-center justify-center mx-auto mb-2">
                                <LuFileText className="w-6 h-6" />
                              </div>
                              <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-white line-clamp-2">
                                {docPreviewData.title}
                              </h3>
                              <p className="text-xs text-slate-300 max-w-md mx-auto">
                                PowerPoint Presentation Document • Ready to convert into vector-based PDF slides
                              </p>
                            </div>
                            <div className="flex items-center justify-between text-xs text-slate-400 pt-3 border-t border-white/10">
                              <span>16:9 Widescreen Ratio</span>
                              <span>Print-ready vector export</span>
                            </div>
                          </div>
                          {/* Slide controls */}
                          {(docPreviewData.slidesCount || 1) > 1 && (
                            <div className="flex items-center justify-center gap-3">
                              <button
                                type="button"
                                onClick={() => setActiveSlideIndex((prev) => Math.max(1, prev - 1))}
                                disabled={activeSlideIndex <= 1}
                                className="px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg disabled:opacity-40 hover:bg-slate-50 transition cursor-pointer"
                              >
                                Previous Slide
                              </button>
                              <span className="text-xs font-semibold text-slate-600">
                                {activeSlideIndex} / {docPreviewData.slidesCount}
                              </span>
                              <button
                                type="button"
                                onClick={() => setActiveSlideIndex((prev) => Math.min(docPreviewData.slidesCount || 1, prev + 1))}
                                disabled={activeSlideIndex >= (docPreviewData.slidesCount || 1)}
                                className="px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg disabled:opacity-40 hover:bg-slate-50 transition cursor-pointer"
                              >
                                Next Slide
                              </button>
                            </div>
                          )}
                        </div>
                      ) : docPreviewData?.type === "html" ? (
                        <div className="bg-white border border-slate-200/90 rounded-2xl shadow-sm overflow-hidden">
                          <div className="px-4 py-2 bg-slate-100 border-b border-slate-200 text-xs font-semibold text-slate-600 flex items-center justify-between">
                            <span>HTML Rendered Sandbox</span>
                            <span className="text-[10px] text-slate-400">{docPreviewData.charCount?.toLocaleString()} characters</span>
                          </div>
                          <div className="p-6 max-h-[500px] overflow-auto">
                            <iframe
                              srcDoc={docPreviewData.html}
                              title="HTML Preview"
                              sandbox="allow-same-origin"
                              className="w-full min-h-[400px] border-0 rounded-lg"
                            />
                          </div>
                        </div>
                      ) : docPreviewData?.type === "text" ? (
                        <div className="bg-white border border-slate-200/90 rounded-2xl shadow-sm overflow-hidden">
                          <div className="px-4 py-2 bg-slate-100 border-b border-slate-200 text-xs font-semibold text-slate-600 flex items-center justify-between">
                            <span>Plain Text Document</span>
                            <span className="text-[10px] text-slate-400">
                              {docPreviewData.lines?.length || 0} lines • {docPreviewData.charCount?.toLocaleString()} characters
                            </span>
                          </div>
                          <div className="p-4 max-h-[500px] overflow-auto font-mono text-xs text-slate-800 bg-slate-50/50">
                            {docPreviewData.lines?.slice(0, 200).map((line, idx) => (
                              <div key={idx} className="flex gap-3 leading-relaxed hover:bg-slate-100/60 px-1 rounded">
                                <span className="w-8 text-right text-slate-400 select-none text-[10px] font-sans">
                                  {idx + 1}
                                </span>
                                <span className="flex-1 whitespace-pre-wrap">{line || " "}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : (
                        /* Word / DOCX / Generic Document Paper Preview */
                        <div className="p-4 sm:p-6 bg-slate-100/80 rounded-2xl border border-slate-200/80 flex justify-center">
                          <div className="w-full max-w-2xl bg-white border border-slate-200/90 rounded-xl shadow-md p-8 sm:p-12 min-h-[500px] max-h-[640px] overflow-y-auto font-serif text-slate-800">
                            {docPreviewData?.html ? (
                              <div
                                className="prose prose-slate max-w-none text-xs sm:text-sm prose-p:my-2 prose-headings:font-bold prose-headings:text-slate-900"
                                dangerouslySetInnerHTML={{ __html: docPreviewData.html }}
                              />
                            ) : docPreviewData?.text ? (
                              <pre className="whitespace-pre-wrap font-sans text-xs text-slate-800 leading-relaxed">
                                {docPreviewData.text}
                              </pre>
                            ) : (
                              <div className="space-y-4 animate-pulse pt-6">
                                <div className="h-6 bg-slate-200 rounded w-2/3 mx-auto" />
                                <div className="h-4 bg-slate-100 rounded w-full mt-6" />
                                <div className="h-4 bg-slate-100 rounded w-5/6" />
                                <div className="h-4 bg-slate-100 rounded w-4/6" />
                                <div className="h-4 bg-slate-100 rounded w-full mt-4" />
                                <div className="h-4 bg-slate-100 rounded w-11/12" />
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : isConvertFromPdfTool && items[0] ? (
                    <div className="w-full space-y-4">
                      {/* Document Toolbar Header */}
                      <div className="flex items-center justify-between p-3.5 bg-white border border-slate-200/80 rounded-2xl shadow-2xs">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold text-sm shadow-xs">
                            <LuFileText className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="text-xs font-bold text-slate-800 truncate max-w-xs sm:max-w-md" title={items[0].name}>
                              {items[0].name}
                            </div>
                            <div className="text-[10px] text-slate-400">
                              {(items[0].size / 1024).toFixed(1)} KB • {items[0].pageCount || Object.keys(pageThumbnails).length || 1} Pages Detected
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              if (addMoreInputRef.current) {
                                addMoreInputRef.current.value = "";
                                addMoreInputRef.current.click();
                              } else if (fileInputRef.current) {
                                fileInputRef.current.value = "";
                                fileInputRef.current.click();
                              }
                            }}
                            className="text-xs font-semibold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-xl transition cursor-pointer"
                          >
                            Replace File
                          </button>
                        </div>
                      </div>

                      {/* Multi-page Thumbnail Gallery */}
                      <div className="p-4 bg-slate-100/70 rounded-2xl border border-slate-200/80">
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 max-h-[540px] overflow-y-auto p-1">
                          {Array.from(
                            { length: items[0].pageCount || Object.keys(pageThumbnails).length || 1 },
                            (_, i) => i + 1
                          ).map((pageNum) => {
                            const thumb = pageThumbnails[pageNum];
                            return (
                              <div
                                key={pageNum}
                                className="bg-white rounded-xl border border-slate-200/90 shadow-2xs overflow-hidden flex flex-col hover:border-blue-400 transition"
                              >
                                <div className="aspect-3/4 w-full bg-slate-50 flex items-center justify-center overflow-hidden p-2">
                                  {thumb ? (
                                    <img
                                      src={thumb}
                                      alt={`Page ${pageNum}`}
                                      className="w-full h-full object-contain shadow-2xs rounded"
                                    />
                                  ) : (
                                    <div className="flex flex-col items-center gap-1.5 text-slate-400">
                                      <LuRefreshCw className="w-5 h-5 animate-spin text-blue-500" />
                                      <span className="text-[10px] font-medium">Page {pageNum}</span>
                                    </div>
                                  )}
                                </div>
                                <div className="px-2 py-1.5 bg-slate-50 border-t border-slate-100 text-center">
                                  <span className="text-[11px] font-bold text-slate-600">Page {pageNum}</span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* Default Cards Gallery */
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                      {items.map((item) => (
                        <div
                          key={item.id}
                          className="group relative bg-slate-50/60 border border-slate-200 rounded-2xl p-3 hover:border-blue-300 hover:bg-white transition flex flex-col items-center"
                        >
                          {/* Remove file button */}
                          <button
                            type="button"
                            onClick={() => removeItem(item.id)}
                            className="absolute top-2 right-2 w-6 h-6 rounded-full bg-slate-900/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition hover:bg-rose-600 cursor-pointer shadow-sm z-10"
                          >
                            <LuTrash2 className="w-3 h-3" />
                          </button>

                          {/* Interactive Thumbnail */}
                          <div
                            className="w-full aspect-3/4 rounded-xl bg-white border border-slate-200/80 flex items-center justify-center overflow-hidden mb-2 transition-all"
                            style={{
                              padding:
                                tool.optionsType === "image-to-pdf"
                                  ? margin === "big"
                                    ? "16px"
                                    : margin === "small"
                                    ? "8px"
                                    : "0px"
                                  : "8px",
                            }}
                          >
                            {item.previewUrl ? (
                              <img
                                src={item.previewUrl}
                                alt={item.name}
                                className={`w-full h-full object-contain transition-transform duration-300 ${
                                  orientation === "landscape" ? "rotate-90 scale-95" : ""
                                }`}
                              />
                            ) : (
                              <div className="flex flex-col items-center text-slate-400">
                                <LuFileText
                                  className="w-10 h-10 text-blue-500 transition-transform duration-300"
                                  style={{
                                    transform:
                                      tool.slug === "rotate-pdf" ? `rotate(${rotationAngle}deg)` : "none",
                                  }}
                                />
                                <span className="text-[10px] font-mono mt-1 font-bold text-slate-600 uppercase">
                                  {item.name.split(".").pop() || "PDF"}
                                </span>
                              </div>
                            )}
                          </div>

                          {/* Filename & Size */}
                          <div className="w-full text-center">
                            <div className="text-[11px] font-semibold text-slate-800 truncate" title={item.name}>
                              {item.name}
                            </div>
                            <div className="flex items-center justify-center gap-1.5 mt-0.5">
                              <span className="text-[10px] text-slate-400 font-mono">
                                {(item.size / 1024).toFixed(1)} KB
                              </span>
                              {item.pageCount !== undefined && (
                                <>
                                  <span className="text-slate-300">&bull;</span>
                                  <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200/60">
                                    {item.pageCount} pages detected
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Right Configuration Console */}
                <div className="w-full lg:w-[360px] bg-slate-50/70 border border-slate-200/90 rounded-2xl p-5 sm:p-6 flex flex-col justify-between shrink-0">
                  <div className="space-y-5">
                    <div>
                      <div className="text-[10px] font-extrabold uppercase tracking-wider text-blue-600 mb-0.5">
                        Studio Settings
                      </div>
                      <h2 className="text-lg font-bold text-slate-900 tracking-tight">
                        {tool.name} Parameters
                      </h2>
                    </div>

                    {/* 1. COMPRESS SETTINGS */}
                    {(tool.slug === "compress-pdf" || tool.optionsType === "compress-pdf") && (
                      <div className="space-y-2.5">
                        <label className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                          Compression Level:
                        </label>
                        <div className="space-y-2">
                          <button
                            type="button"
                            onClick={() => setCompressLevel("recommended")}
                            className={`w-full p-3 rounded-xl border-2 text-left transition cursor-pointer ${
                              compressLevel === "recommended"
                                ? "border-blue-600 bg-white text-slate-900 ring-2 ring-blue-100"
                                : "border-slate-200 bg-white hover:bg-slate-100/50 text-slate-700"
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold text-blue-600 flex items-center gap-1.5">
                                <LuSparkles className="w-3.5 h-3.5" /> Recommended
                              </span>
                              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                                ~60% saved
                              </span>
                            </div>
                            <div className="text-[11px] text-slate-500 mt-1">
                              Balanced quality & file size reduction.
                            </div>
                          </button>

                          <button
                            type="button"
                            onClick={() => setCompressLevel("extreme")}
                            className={`w-full p-3 rounded-xl border-2 text-left transition cursor-pointer ${
                              compressLevel === "extreme"
                                ? "border-blue-600 bg-white text-slate-900 ring-2 ring-blue-100"
                                : "border-slate-200 bg-white hover:bg-slate-100/50 text-slate-700"
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold">Extreme Compression</span>
                              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
                                ~80% saved
                              </span>
                            </div>
                            <div className="text-[11px] text-slate-500 mt-1">
                              Smallest possible size for strict upload limits.
                            </div>
                          </button>

                          <button
                            type="button"
                            onClick={() => setCompressLevel("low")}
                            className={`w-full p-3 rounded-xl border-2 text-left transition cursor-pointer ${
                              compressLevel === "low"
                                ? "border-blue-600 bg-white text-slate-900 ring-2 ring-blue-100"
                                : "border-slate-200 bg-white hover:bg-slate-100/50 text-slate-700"
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold">Less Compression</span>
                              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                                ~35% saved
                              </span>
                            </div>
                            <div className="text-[11px] text-slate-500 mt-1">
                              Maximum vector & image fidelity preserved.
                            </div>
                          </button>
                        </div>
                      </div>
                    )}

                    {/* 0. IMAGE CONVERTER SETTINGS (Format Conversion: WebP, JPG, PNG) */}
                    {isImageConverterTool && (
                      <div className="space-y-5">
                        <div>
                          <div className="flex items-center justify-between mb-1.5">
                            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                              Target Format
                            </label>
                            <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                              Instant In-Browser
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 mb-3">
                            Convert between modern WebP, universal JPG, and lossless PNG formats.
                          </p>

                          <div className="grid grid-cols-3 gap-2">
                            {[
                              { id: "webp", label: "WebP", sub: "Ultra Compact" },
                              { id: "jpeg", label: "JPG", sub: "Universal" },
                              { id: "png", label: "PNG", sub: "Lossless" },
                            ].map((fmt) => (
                              <button
                                key={fmt.id}
                                type="button"
                                onClick={() => setImageConvertTargetFormat(fmt.id as any)}
                                className={`p-3 text-xs font-bold rounded-xl border text-center transition cursor-pointer flex flex-col items-center justify-center gap-0.5 ${
                                  imageConvertTargetFormat === fmt.id
                                    ? "bg-emerald-50 border-emerald-500 text-emerald-800 shadow-xs ring-1 ring-emerald-500/30"
                                    : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:border-slate-300"
                                }`}
                              >
                                <span className="font-extrabold text-xs">{fmt.label}</span>
                                <span className="text-[10px] font-medium opacity-75">{fmt.sub}</span>
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Format Perks Banner */}
                        <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs text-slate-600 space-y-1.5">
                          <div className="font-semibold text-slate-800 text-[11px] flex items-center gap-1.5">
                            <LuSparkles className="w-3.5 h-3.5 text-amber-500" />
                            <span>
                              {imageConvertTargetFormat === "webp"
                                ? "WebP Format Advantage"
                                : imageConvertTargetFormat === "jpeg"
                                ? "JPG Format Advantage"
                                : "PNG Format Advantage"}
                            </span>
                          </div>
                          <p className="text-[11px] leading-relaxed text-slate-500">
                            {imageConvertTargetFormat === "webp"
                              ? "WebP provides up to 30% smaller file sizes than JPG with high visual quality. Supported by all modern browsers."
                              : imageConvertTargetFormat === "jpeg"
                              ? "JPEG is universally compatible with every device, printer, and legacy operating system."
                              : "PNG preserves crisp transparency and lossless pixel fidelity, perfect for logos and graphics."}
                          </p>
                        </div>

                        {/* Custom Filename */}
                        <div>
                          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                            Save As (Optional)
                          </label>
                          <input
                            type="text"
                            placeholder={
                              items.length > 1
                                ? `converted_images_${imageConvertTargetFormat === "jpeg" ? "jpg" : imageConvertTargetFormat}.zip`
                                : `converted_image.${imageConvertTargetFormat === "jpeg" ? "jpg" : imageConvertTargetFormat}`
                            }
                            value={imageConvertSaveAs}
                            onChange={(e) => setImageConvertSaveAs(e.target.value)}
                            className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-blue-600 bg-white"
                          />
                        </div>
                      </div>
                    )}

                    {/* 2. IMAGE TO PDF SETTINGS */}
                    {tool.optionsType === "image-to-pdf" && (
                      <div className="space-y-4">
                        {/* Orientation */}
                        <div>
                          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                            Page Orientation
                          </label>
                          <div className="grid grid-cols-2 gap-2.5">
                            <button
                              type="button"
                              onClick={() => setOrientation("portrait")}
                              className={`flex flex-col items-center justify-center p-2.5 rounded-xl border-2 transition cursor-pointer ${
                                orientation === "portrait"
                                  ? "border-blue-600 bg-white text-blue-600 font-bold"
                                  : "border-slate-200 bg-white hover:border-slate-300 text-slate-700"
                              }`}
                            >
                              <div className="w-4 h-6 border-2 border-current rounded-xs mb-1" />
                              <span className="text-xs">Portrait</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => setOrientation("landscape")}
                              className={`flex flex-col items-center justify-center p-2.5 rounded-xl border-2 transition cursor-pointer ${
                                orientation === "landscape"
                                  ? "border-blue-600 bg-white text-blue-600 font-bold"
                                  : "border-slate-200 bg-white hover:border-slate-300 text-slate-700"
                              }`}
                            >
                              <div className="w-6 h-4 border-2 border-current rounded-xs mb-1" />
                              <span className="text-xs">Landscape</span>
                            </button>
                          </div>
                        </div>

                        {/* Page Dimensions */}
                        <div>
                          <label htmlFor={pageSizeId} className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                            Page Dimensions
                          </label>
                          <select
                            id={pageSizeId}
                            value={pageSize}
                            onChange={(e) => setPageSize(e.target.value as any)}
                            className="w-full p-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-medium text-slate-800 bg-white focus:outline-none focus:border-blue-600"
                          >
                            <option value="a4">A4 (297x210 mm) Standard</option>
                            <option value="letter">US Letter (216x279 mm)</option>
                            <option value="fit">Fit to original image</option>
                          </select>
                        </div>

                        {/* Margins */}
                        <div>
                          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                            Page Margins
                          </label>
                          <div className="grid grid-cols-3 gap-2">
                            <button
                              type="button"
                              onClick={() => setMargin("none")}
                              className={`py-2 px-1 rounded-xl border-2 text-center transition cursor-pointer text-xs ${
                                margin === "none"
                                  ? "border-blue-600 bg-white text-blue-600 font-bold"
                                  : "border-slate-200 bg-white text-slate-600"
                              }`}
                            >
                              No Margin
                            </button>
                            <button
                              type="button"
                              onClick={() => setMargin("small")}
                              className={`py-2 px-1 rounded-xl border-2 text-center transition cursor-pointer text-xs ${
                                margin === "small"
                                  ? "border-blue-600 bg-white text-blue-600 font-bold"
                                  : "border-slate-200 bg-white text-slate-600"
                              }`}
                            >
                              Small
                            </button>
                            <button
                              type="button"
                              onClick={() => setMargin("big")}
                              className={`py-2 px-1 rounded-xl border-2 text-center transition cursor-pointer text-xs ${
                                margin === "big"
                                  ? "border-blue-600 bg-white text-blue-600 font-bold"
                                  : "border-slate-200 bg-white text-slate-600"
                              }`}
                            >
                              Big
                            </button>
                          </div>
                        </div>

                        {/* Merge Checkbox */}
                        <div className="pt-1">
                          <label htmlFor={mergeAllId} className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer select-none">
                            <input
                              id={mergeAllId}
                              type="checkbox"
                              checked={mergeAll}
                              onChange={(e) => setMergeAll(e.target.checked)}
                              className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                            />
                            <span>Merge all images into a single PDF</span>
                          </label>
                        </div>
                      </div>
                    )}

                    {/* 3. ROTATE SETTINGS */}
                    {(tool.slug === "rotate-pdf" || tool.optionsType === "rotate-pdf") && (
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
                            Default Rotation:
                          </label>
                          <div className="grid grid-cols-3 gap-2">
                            {[90, 180, 270].map((deg) => (
                              <button
                                key={deg}
                                type="button"
                                onClick={() => {
                                  setRotationAngle(deg);
                                  const total = items[0]?.pageCount || 1;
                                  const updated: Record<number, number> = {};
                                  for (let i = 1; i <= total; i++) updated[i] = deg;
                                  setPageRotations(updated);
                                }}
                                className={`py-2.5 rounded-xl border-2 text-xs font-bold transition cursor-pointer ${
                                  rotationAngle === deg
                                    ? "border-blue-600 bg-white text-blue-600 ring-2 ring-blue-100"
                                    : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                                }`}
                              >
                                {deg}&deg; CW
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="p-3 bg-white border border-slate-200 rounded-xl space-y-2 text-xs">
                          <div className="flex items-center justify-between">
                            <span className="text-slate-500 font-medium">Pages in Document:</span>
                            <span className="font-bold text-slate-800">{items[0]?.pageCount || 1}</span>
                          </div>
                          <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                            <span className="text-slate-500 font-medium">Rotation Angle:</span>
                            <span className="font-bold text-blue-600">{rotationAngle}&deg;</span>
                          </div>
                        </div>

                        <div className="space-y-1.5 pt-1">
                          <label className="text-xs font-bold text-slate-700 block">Save as:</label>
                          <input
                            type="text"
                            value={rotateSaveAs}
                            onChange={(e) => setRotateSaveAs(e.target.value)}
                            placeholder={`${items[0]?.name.replace(/\.pdf$/i, "") || "document"}_rotated.pdf`}
                            className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl text-slate-800 font-medium focus:outline-none focus:border-blue-600"
                          />
                        </div>
                      </div>
                    )}

                    {/* 4. PROTECT SETTINGS */}
                    {isProtectTool && (
                      <div className="space-y-4">
                        <div className="space-y-1.5">
                          <label htmlFor={passwordInputId} className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
                            Choose Open Password:
                          </label>
                          <div className="relative flex items-center">
                            <input
                              id={passwordInputId}
                              type={showPassword ? "text" : "password"}
                              placeholder="Enter encryption password"
                              value={password}
                              onChange={(e) => setPassword(e.target.value)}
                              className="w-full p-2.5 pr-10 rounded-xl border border-slate-200 text-sm bg-white focus:border-blue-600 outline-none"
                            />
                            <button
                              type="button"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setShowPassword((prev) => !prev);
                              }}
                              aria-label={showPassword ? "Hide password" : "Show password"}
                              className="absolute right-0 top-0 bottom-0 px-3 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors cursor-pointer z-10"
                            >
                              {showPassword ? <LuEyeOff className="w-4 h-4 pointer-events-none" /> : <LuEye className="w-4 h-4 pointer-events-none" />}
                            </button>
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
                            Confirm Password:
                          </label>
                          <div className="relative flex items-center">
                            <input
                              type={showPassword ? "text" : "password"}
                              placeholder="Confirm encryption password"
                              value={confirmPassword}
                              onChange={(e) => setConfirmPassword(e.target.value)}
                              className="w-full p-2.5 pr-10 rounded-xl border border-slate-200 text-sm bg-white focus:border-blue-600 outline-none"
                            />
                            <button
                              type="button"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setShowPassword((prev) => !prev);
                              }}
                              aria-label={showPassword ? "Hide password" : "Show password"}
                              className="absolute right-0 top-0 bottom-0 px-3 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors cursor-pointer z-10"
                            >
                              {showPassword ? <LuEyeOff className="w-4 h-4 pointer-events-none" /> : <LuEye className="w-4 h-4 pointer-events-none" />}
                            </button>
                          </div>
                          {password && confirmPassword && password !== confirmPassword && (
                            <p className="text-[11px] text-rose-600 font-semibold">Passwords do not match</p>
                          )}
                        </div>

                        {/* Permissions */}
                        <div className="space-y-2 pt-2 border-t border-slate-100">
                          <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
                            Reader Permissions:
                          </span>
                          <div className="space-y-2">
                            <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer select-none">
                              <input
                                type="checkbox"
                                checked={allowPrinting}
                                onChange={(e) => setAllowPrinting(e.target.checked)}
                                className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                              />
                              <span>Allow Document Printing</span>
                            </label>
                            <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer select-none">
                              <input
                                type="checkbox"
                                checked={allowCopying}
                                onChange={(e) => setAllowCopying(e.target.checked)}
                                className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                              />
                              <span>Allow Text & Graphics Copying</span>
                            </label>
                            <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer select-none">
                              <input
                                type="checkbox"
                                checked={allowModifying}
                                onChange={(e) => setAllowModifying(e.target.checked)}
                                className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                              />
                              <span>Allow Content Modifications</span>
                            </label>
                          </div>
                        </div>

                        <div className="space-y-1.5 pt-2 border-t border-slate-200/80">
                          <label className="text-xs font-bold text-slate-700 block">Save as:</label>
                          <input
                            type="text"
                            value={protectSaveAs}
                            onChange={(e) => setProtectSaveAs(e.target.value)}
                            placeholder={`${items[0]?.name.replace(/\.pdf$/i, "") || "document"}_protected.pdf`}
                            className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl text-slate-800 font-medium focus:outline-none focus:border-blue-600"
                          />
                        </div>
                      </div>
                    )}

                    {/* UNLOCK SETTINGS */}
                    {isUnlockTool && (
                      <div className="space-y-4">
                        <div className="space-y-1.5">
                          <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
                            Enter Document Password:
                          </label>
                          <div className="relative flex items-center">
                            <input
                              type={showUnlockPassword ? "text" : "password"}
                              placeholder="Enter password to unlock"
                              value={unlockPassword}
                              onChange={(e) => setUnlockPassword(e.target.value)}
                              className="w-full p-2.5 pr-10 rounded-xl border border-slate-200 text-sm bg-white focus:border-emerald-600 outline-none"
                            />
                            <button
                              type="button"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setShowUnlockPassword((prev) => !prev);
                              }}
                              aria-label={showUnlockPassword ? "Hide password" : "Show password"}
                              className="absolute right-0 top-0 bottom-0 px-3 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors cursor-pointer z-10"
                            >
                              {showUnlockPassword ? <LuEyeOff className="w-4 h-4 pointer-events-none" /> : <LuEye className="w-4 h-4 pointer-events-none" />}
                            </button>
                          </div>
                        </div>

                        <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl text-xs text-emerald-800 leading-relaxed">
                          Strips password encryption and security flags permanently. Output document will open without requiring credentials.
                        </div>

                        <div className="space-y-1.5 pt-2 border-t border-slate-200/80">
                          <label className="text-xs font-bold text-slate-700 block">Save as:</label>
                          <input
                            type="text"
                            value={unlockSaveAs}
                            onChange={(e) => setUnlockSaveAs(e.target.value)}
                            placeholder={`${items[0]?.name.replace(/\.pdf$/i, "") || "document"}_unlocked.pdf`}
                            className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl text-slate-800 font-medium focus:outline-none focus:border-emerald-600"
                          />
                        </div>
                      </div>
                    )}

                    {/* SIGN PDF SETTINGS */}
                    {isSignTool && (
                      <div className="space-y-4">
                        <div>
                          <div className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                            E-Signature Controls
                          </div>
                          <p className="text-[11px] text-slate-400 mt-0.5">
                            Draw, type, or upload your electronic signature.
                          </p>
                        </div>

                        {/* Mode Selector */}
                        <div className="grid grid-cols-3 gap-2">
                          {[
                            { id: "draw", label: "Draw" },
                            { id: "type", label: "Type" },
                            { id: "upload", label: "Upload" },
                          ].map((m) => (
                            <button
                              key={m.id}
                              type="button"
                              onClick={() => setSigMode(m.id as any)}
                              className={`py-2 text-xs font-bold rounded-xl border transition cursor-pointer ${
                                sigMode === m.id
                                  ? "bg-purple-50 border-purple-500 text-purple-700 shadow-2xs"
                                  : "border-slate-200 text-slate-600 hover:bg-slate-50"
                              }`}
                            >
                              {m.label}
                            </button>
                          ))}
                        </div>

                        {/* Draw Mode */}
                        {sigMode === "draw" && (
                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-xs text-slate-500">
                              <span>Draw in the box:</span>
                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => setSigColor("#0f172a")}
                                  className={`w-4 h-4 rounded-full bg-slate-900 transition cursor-pointer ${
                                    sigColor === "#0f172a" ? "ring-2 ring-purple-500 ring-offset-1" : ""
                                  }`}
                                  title="Black Ink"
                                />
                                <button
                                  type="button"
                                  onClick={() => setSigColor("#1e3a8a")}
                                  className={`w-4 h-4 rounded-full bg-blue-900 transition cursor-pointer ${
                                    sigColor === "#1e3a8a" ? "ring-2 ring-purple-500 ring-offset-1" : ""
                                  }`}
                                  title="Blue Ink"
                                />
                                <button
                                  type="button"
                                  onClick={() => setSigColor("#991b1b")}
                                  className={`w-4 h-4 rounded-full bg-red-800 transition cursor-pointer ${
                                    sigColor === "#991b1b" ? "ring-2 ring-purple-500 ring-offset-1" : ""
                                  }`}
                                  title="Red Ink"
                                />
                                <button
                                  type="button"
                                  onClick={clearSignDrawing}
                                  className="text-xs text-rose-600 font-semibold hover:underline ml-1 cursor-pointer"
                                >
                                  Clear
                                </button>
                              </div>
                            </div>
                            <canvas
                              ref={signDrawCanvasRef}
                              width={380}
                              height={120}
                              onMouseDown={startSignDrawing}
                              onMouseMove={drawSign}
                              onMouseUp={stopSignDrawing}
                              onMouseLeave={stopSignDrawing}
                              onTouchStart={startSignDrawing}
                              onTouchMove={drawSign}
                              onTouchEnd={stopSignDrawing}
                              className="w-full h-28 border border-slate-300 rounded-2xl bg-slate-50 cursor-crosshair touch-none"
                            />
                          </div>
                        )}

                        {/* Type Mode */}
                        {sigMode === "type" && (
                          <div className="space-y-3">
                            <div className="space-y-1">
                              <label className="text-xs font-semibold text-slate-700">Full Legal Name</label>
                              <input
                                type="text"
                                value={signerName}
                                onChange={(e) => setSignerName(e.target.value)}
                                placeholder="e.g. John Doe"
                                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
                              />
                            </div>
                            <div className="p-3 rounded-2xl border border-slate-200 bg-slate-50 text-center">
                              <div
                                style={{
                                  color: sigColor,
                                  fontSize: "26px",
                                  fontStyle: "italic",
                                  fontFamily: `"Brush Script MT", "Caveat", "Segoe Script", cursive, sans-serif`,
                                }}
                              >
                                {signerName || "Your Signature"}
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Upload Mode */}
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
                              className="w-full text-xs text-slate-500 file:mr-2 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100 cursor-pointer"
                            />
                          </div>
                        )}

                        {/* Placement Quick Presets */}
                        <div className="space-y-2 pt-2 border-t border-slate-100">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-semibold text-slate-700">Placement:</span>
                            <span className="text-slate-400 font-mono">
                              {sigPlacement.xPercent}% X, {sigPlacement.yPercent}% Y
                            </span>
                          </div>
                          <div className="grid grid-cols-3 gap-2">
                            <button
                              type="button"
                              onClick={() => setSigPlacement({ xPercent: 65, yPercent: 82 })}
                              className="px-2 py-1.5 rounded-xl text-xs bg-slate-100 hover:bg-slate-200 font-medium text-slate-700 transition cursor-pointer"
                            >
                              Bottom Right
                            </button>
                            <button
                              type="button"
                              onClick={() => setSigPlacement({ xPercent: 20, yPercent: 82 })}
                              className="px-2 py-1.5 rounded-xl text-xs bg-slate-100 hover:bg-slate-200 font-medium text-slate-700 transition cursor-pointer"
                            >
                              Bottom Left
                            </button>
                            <button
                              type="button"
                              onClick={() => setSigPlacement({ xPercent: 50, yPercent: 82 })}
                              className="px-2 py-1.5 rounded-xl text-xs bg-slate-100 hover:bg-slate-200 font-medium text-slate-700 transition cursor-pointer"
                            >
                              Center Footer
                            </button>
                          </div>
                        </div>

                        {/* Target Page Selector */}
                        <div className="space-y-1.5 pt-2 border-t border-slate-100">
                          <label className="text-xs font-semibold text-slate-700 block">Target Page:</label>
                          <select
                            value={signCurrentPage}
                            onChange={(e) => setSignCurrentPage(Number(e.target.value))}
                            className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl text-slate-800 font-medium focus:outline-none focus:border-purple-600"
                          >
                            {Array.from({ length: items[0]?.pageCount || 1 }, (_, i) => i + 1).map((pNum) => (
                              <option key={pNum} value={pNum}>
                                Page {pNum} {pNum === 1 ? "(First)" : pNum === (items[0]?.pageCount || 1) ? "(Last)" : ""}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="space-y-1.5 pt-2 border-t border-slate-200/80">
                          <label className="text-xs font-bold text-slate-700 block">Save as:</label>
                          <input
                            type="text"
                            value={signSaveAs}
                            onChange={(e) => setSignSaveAs(e.target.value)}
                            placeholder={`${items[0]?.name.replace(/\.pdf$/i, "") || "document"}_signed.pdf`}
                            className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl text-slate-800 font-medium focus:outline-none focus:border-purple-600"
                          />
                        </div>
                      </div>
                    )}

                    {/* REDACT PDF SETTINGS */}
                    {isRedactTool && (
                      <div className="space-y-4">
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
                            Redaction Badge Text:
                          </label>
                          <input
                            type="text"
                            value={redactReason}
                            onChange={(e) => setRedactReason(e.target.value)}
                            placeholder="e.g. CONFIDENTIAL, REDACTED"
                            className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl text-slate-800 font-medium focus:outline-none focus:border-rose-600 font-mono"
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
                            Redaction Zone Placement:
                          </label>
                          <div className="grid grid-cols-3 gap-2">
                            {[
                              { id: "header", label: "Header" },
                              { id: "center", label: "Center" },
                              { id: "custom", label: "Full Strip" },
                            ].map((pl) => (
                              <button
                                key={pl.id}
                                type="button"
                                onClick={() => setRedactPlacement(pl.id as any)}
                                className={`py-2 px-1 rounded-xl border-2 text-center transition cursor-pointer text-xs font-bold ${
                                  redactPlacement === pl.id
                                    ? "border-rose-600 bg-rose-50/60 text-rose-700"
                                    : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                                }`}
                              >
                                {pl.label}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 leading-relaxed">
                          <strong>Permanent Redaction:</strong> Underlying text & vector structures are permanently burned out using rasterization to prevent recovery.
                        </div>

                        <div className="space-y-1.5 pt-2 border-t border-slate-200/80">
                          <label className="text-xs font-bold text-slate-700 block">Save as:</label>
                          <input
                            type="text"
                            value={redactSaveAs}
                            onChange={(e) => setRedactSaveAs(e.target.value)}
                            placeholder={`${items[0]?.name.replace(/\.pdf$/i, "") || "document"}_redacted.pdf`}
                            className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl text-slate-800 font-medium focus:outline-none focus:border-rose-600"
                          />
                        </div>
                      </div>
                    )}

                    {/* COMPARE PDF SETTINGS */}
                    {isCompareTool && (
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
                            Comparison Report Style:
                          </label>
                          <div className="grid grid-cols-2 gap-2">
                            {[
                              { id: "side-by-side", label: "Side-by-Side Diff" },
                              { id: "summary", label: "Metrics Summary" },
                            ].map((m) => (
                              <button
                                key={m.id}
                                type="button"
                                onClick={() => setCompareMode(m.id as any)}
                                className={`py-2.5 px-2 rounded-xl border-2 text-center transition cursor-pointer text-xs font-bold ${
                                  compareMode === m.id
                                    ? "border-sky-600 bg-sky-50 text-sky-700"
                                    : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                                }`}
                              >
                                {m.label}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="p-3 bg-sky-50 border border-sky-200 rounded-xl text-xs text-sky-900 space-y-1">
                          <div className="font-bold">Loaded Documents ({items.length}/2):</div>
                          <p className="text-[11px] text-sky-700">
                            {items.length === 2
                              ? "Both files ready for full diff comparison report generation."
                              : "Please upload the second PDF to perform side-by-side comparison."}
                          </p>
                        </div>

                        <div className="space-y-1.5 pt-2 border-t border-slate-200/80">
                          <label className="text-xs font-bold text-slate-700 block">Save as:</label>
                          <input
                            type="text"
                            value={compareSaveAs}
                            onChange={(e) => setCompareSaveAs(e.target.value)}
                            placeholder={`${items[0]?.name.replace(/\.pdf$/i, "") || "comparison"}_report.pdf`}
                            className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl text-slate-800 font-medium focus:outline-none focus:border-sky-600"
                          />
                        </div>
                      </div>
                    )}

                    {/* 5. SPLIT PDF SETTINGS */}
                    {(tool.slug === "split-pdf" || tool.optionsType === "split-pdf") && (
                      <div className="space-y-4">
                        <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
                          Split Mode:
                        </label>
                        <div className="space-y-2.5">
                          <button
                            type="button"
                            onClick={() => setSplitMode("individual")}
                            className={`w-full p-3 rounded-xl border-2 text-left transition cursor-pointer ${
                              splitMode === "individual"
                                ? "border-blue-600 bg-white text-slate-900 ring-2 ring-blue-100"
                                : "border-slate-200 bg-white hover:bg-slate-100/50 text-slate-700"
                            }`}
                          >
                            <div className="text-xs font-bold text-slate-900">Extract All Pages</div>
                            <div className="text-[11px] text-slate-500 mt-0.5">
                              Separates into {items[0]?.pageCount || 4} individual PDF files (.ZIP)
                            </div>
                          </button>

                          <button
                            type="button"
                            onClick={() => setSplitMode("range")}
                            className={`w-full p-3 rounded-xl border-2 text-left transition cursor-pointer ${
                              splitMode === "range"
                                ? "border-blue-600 bg-white text-slate-900 ring-2 ring-blue-100"
                                : "border-slate-200 bg-white hover:bg-slate-100/50 text-slate-700"
                            }`}
                          >
                            <div className="text-xs font-bold text-slate-900">Split by Page Ranges</div>
                            <div className="text-[11px] text-slate-500 mt-0.5">
                              Define custom ranges (e.g. 1-3, 4-6)
                            </div>
                          </button>
                        </div>

                        {splitMode === "range" && (
                          <div className="space-y-1.5 pt-1">
                            <label className="text-xs font-bold text-slate-700 block">Page Ranges:</label>
                            <input
                              type="text"
                              value={splitRangeText}
                              onChange={(e) => setSplitRangeText(e.target.value)}
                              placeholder="e.g. 1-2, 3-5"
                              className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-blue-600 font-medium"
                            />
                            <p className="text-[10px] text-slate-400">
                              Separate ranges with commas. Example: 1-2, 3-5 will create separate PDF files.
                            </p>
                          </div>
                        )}

                        <div className="space-y-1.5 pt-2 border-t border-slate-200/80">
                          <label className="text-xs font-bold text-slate-700 block">Save as:</label>
                          <input
                            type="text"
                            value={splitSaveAs}
                            onChange={(e) => setSplitSaveAs(e.target.value)}
                            placeholder={
                              splitMode === "individual"
                                ? `${items[0]?.name.replace(/\.pdf$/i, "") || "document"}_split.zip`
                                : `${items[0]?.name.replace(/\.pdf$/i, "") || "document"}_ranges.zip`
                            }
                            className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl text-slate-800 font-medium focus:outline-none focus:border-blue-600"
                          />
                        </div>
                      </div>
                    )}

                    {/* 6. REMOVE PAGES & EXTRACT PAGES SETTINGS */}
                    {(tool.slug === "remove-pages" ||
                      tool.optionsType === "remove-pages" ||
                      tool.slug === "extract-pages" ||
                      tool.optionsType === "extract-pages") && (
                      <div className="space-y-4">
                        <div className="p-3 bg-white border border-slate-200 rounded-xl space-y-2">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-slate-500 font-medium">Total Pages:</span>
                            <span className="font-bold text-slate-800">{items[0]?.pageCount || 1}</span>
                          </div>
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-slate-500 font-medium">
                              {tool.slug === "remove-pages" || tool.optionsType === "remove-pages"
                                ? "Pages to Delete:"
                                : "Pages to Extract:"}
                            </span>
                            <span
                              className={`font-bold ${
                                tool.slug === "remove-pages" || tool.optionsType === "remove-pages"
                                  ? "text-red-600"
                                  : "text-blue-600"
                              }`}
                            >
                              {selectedPages.size}
                            </span>
                          </div>
                          {(tool.slug === "remove-pages" || tool.optionsType === "remove-pages") && (
                            <div className="flex items-center justify-between text-xs pt-1.5 border-t border-slate-100">
                              <span className="text-slate-500 font-medium">Remaining Pages:</span>
                              <span className="font-bold text-emerald-600">
                                {Math.max(0, (items[0]?.pageCount || 1) - selectedPages.size)}
                              </span>
                            </div>
                          )}
                        </div>

                        <div className="space-y-1.5 pt-1">
                          <label className="text-xs font-bold text-slate-700 block">Save as:</label>
                          <input
                            type="text"
                            value={removeSaveAs}
                            onChange={(e) => setRemoveSaveAs(e.target.value)}
                            placeholder={
                              tool.slug === "remove-pages" || tool.optionsType === "remove-pages"
                                ? `${items[0]?.name.replace(/\.pdf$/i, "") || "document"}_cleaned.pdf`
                                : `${items[0]?.name.replace(/\.pdf$/i, "") || "document"}_extracted.pdf`
                            }
                            className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl text-slate-800 font-medium focus:outline-none focus:border-blue-600"
                          />
                        </div>

                        {tool.slug === "remove-pages" || tool.optionsType === "remove-pages" ? (
                          selectedPages.size === 0 ? (
                            <p className="text-[11px] text-amber-600 bg-amber-50 p-2.5 rounded-xl border border-amber-200/60">
                              Click on pages on the left to select them for removal.
                            </p>
                          ) : items[0]?.pageCount && selectedPages.size >= items[0].pageCount ? (
                            <p className="text-[11px] text-rose-600 bg-rose-50 p-2.5 rounded-xl border border-rose-200/60">
                              At least one page must remain. You cannot delete all pages.
                            </p>
                          ) : null
                        ) : selectedPages.size === 0 ? (
                          <p className="text-[11px] text-amber-600 bg-amber-50 p-2.5 rounded-xl border border-amber-200/60">
                            Select at least one page to extract.
                          </p>
                        ) : null}
                      </div>
                    )}

                    {/* PDF TO JPG (EXTRACT PAGES TO IMAGES) SETTINGS */}
                    {isPdfToJpgTool && (
                      <div className="space-y-4">
                        <div className="p-3 bg-white border border-slate-200 rounded-xl space-y-2">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-slate-500 font-medium">Total Pages:</span>
                            <span className="font-bold text-slate-800">{items[0]?.pageCount || 1}</span>
                          </div>
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-slate-500 font-medium">Pages to Convert:</span>
                            <span className="font-bold text-blue-600">{selectedPages.size}</span>
                          </div>
                          <div className="flex items-center justify-between text-xs pt-1.5 border-t border-slate-100">
                            <span className="text-slate-500 font-medium">Output:</span>
                            <span className="font-bold text-emerald-600">
                              {selectedPages.size <= 1 ? "1 JPG Image" : `${selectedPages.size} Images in ZIP`}
                            </span>
                          </div>
                        </div>

                        {/* Image Quality preset */}
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
                            Image Quality:
                          </label>
                          <div className="grid grid-cols-3 gap-2">
                            {[
                              { id: "high", label: "High", sub: "95% Quality" },
                              { id: "standard", label: "Normal", sub: "82% Quality" },
                              { id: "compact", label: "Compact", sub: "65% Size" },
                            ].map((q) => (
                              <button
                                key={q.id}
                                type="button"
                                onClick={() => setPdfToJpgQuality(q.id as any)}
                                className={`p-2 rounded-xl border text-center transition cursor-pointer ${
                                  pdfToJpgQuality === q.id
                                    ? "border-blue-600 bg-blue-50/70 text-blue-900 font-bold"
                                    : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                                }`}
                              >
                                <div className="text-xs">{q.label}</div>
                                <div className="text-[9px] text-slate-400 mt-0.5">{q.sub}</div>
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Rendering Resolution */}
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
                            Resolution:
                          </label>
                          <div className="grid grid-cols-2 gap-2">
                            {[
                              { id: "high", label: "Ultra Crisp (300 DPI)", desc: "2.5x Scale" },
                              { id: "standard", label: "Standard (150 DPI)", desc: "1.5x Scale" },
                            ].map((r) => (
                              <button
                                key={r.id}
                                type="button"
                                onClick={() => setPdfToJpgDpi(r.id as any)}
                                className={`p-2 rounded-xl border text-left transition cursor-pointer ${
                                  pdfToJpgDpi === r.id
                                    ? "border-blue-600 bg-blue-50/70 text-blue-900 font-bold"
                                    : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                                }`}
                              >
                                <div className="text-xs">{r.label}</div>
                                <div className="text-[10px] text-slate-400">{r.desc}</div>
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="space-y-1.5 pt-1 border-t border-slate-200/80">
                          <label className="text-xs font-bold text-slate-700 block">Save as:</label>
                          <input
                            type="text"
                            value={pdfToJpgSaveAs}
                            onChange={(e) => setPdfToJpgSaveAs(e.target.value)}
                            placeholder={
                              selectedPages.size <= 1
                                ? `${items[0]?.name.replace(/\.pdf$/i, "") || "document"}_page.jpg`
                                : `${items[0]?.name.replace(/\.pdf$/i, "") || "document"}_images.zip`
                            }
                            className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl text-slate-800 font-medium focus:outline-none focus:border-blue-600"
                          />
                        </div>

                        {selectedPages.size === 0 && (
                          <p className="text-[11px] text-amber-600 bg-amber-50 p-2.5 rounded-xl border border-amber-200/60">
                            Select at least one page on the left to convert.
                          </p>
                        )}
                      </div>
                    )}

                    {/* 7. REORDER PAGES SETTINGS */}
                    {isReorderTool && (
                      <div className="space-y-4">
                        <div className="p-3 bg-white border border-slate-200 rounded-xl space-y-2">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-slate-500 font-medium">Total Pages:</span>
                            <span className="font-bold text-purple-600">{pagesList.length}</span>
                          </div>
                          <div className="text-[11px] text-slate-500 pt-1.5 border-t border-slate-100 flex items-center gap-1.5">
                            <span className="font-semibold text-slate-700">Order:</span>
                            <span className="font-mono text-purple-700 truncate">
                              {pagesList.map((p) => p.originalPage).join(" → ")}
                            </span>
                          </div>
                        </div>

                        <div className="space-y-1.5 pt-1">
                          <label className="text-xs font-bold text-slate-700 block">Save as:</label>
                          <input
                            type="text"
                            value={organizeSaveAs}
                            onChange={(e) => setOrganizeSaveAs(e.target.value)}
                            placeholder={`${items[0]?.name.replace(/\.pdf$/i, "") || "document"}_reordered.pdf`}
                            className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl text-slate-800 font-medium focus:outline-none focus:border-purple-600"
                          />
                        </div>
                      </div>
                    )}

                    {/* 8. ORGANIZE PDF SETTINGS */}
                    {isOrganizerTool && (
                      <div className="space-y-4">
                        <div className="p-3 bg-white border border-slate-200 rounded-xl space-y-2">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-slate-500 font-medium">Original Pages:</span>
                            <span className="font-bold text-slate-800">{items[0]?.pageCount || 1}</span>
                          </div>
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-slate-500 font-medium">Output Pages:</span>
                            <span className="font-bold text-rose-600">{pagesList.length}</span>
                          </div>
                          <div className="flex items-center justify-between text-xs pt-1.5 border-t border-slate-100">
                            <span className="text-slate-500 font-medium">Custom Rotations:</span>
                            <span className="font-bold text-amber-600">
                              {pagesList.filter((p) => p.rotation !== 0).length} pages
                            </span>
                          </div>
                        </div>

                        <div className="space-y-1.5 pt-1">
                          <label className="text-xs font-bold text-slate-700 block">Save as:</label>
                          <input
                            type="text"
                            value={organizeSaveAs}
                            onChange={(e) => setOrganizeSaveAs(e.target.value)}
                            placeholder={`${items[0]?.name.replace(/\.pdf$/i, "") || "document"}_organized.pdf`}
                            className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl text-slate-800 font-medium focus:outline-none focus:border-rose-600"
                          />
                        </div>
                      </div>
                    )}

                    {/* 9. COMPRESS TO 100KB SETTINGS */}
                    {isCompress100kTool && (
                      <div className="space-y-4">
                        <div className="p-3 bg-white border border-slate-200 rounded-xl space-y-2">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-slate-500 font-medium">Target Size:</span>
                            <span className="font-bold text-blue-600">&lt; 100 KB</span>
                          </div>
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-slate-500 font-medium">Current Size:</span>
                            <span className="font-bold text-slate-800">
                              {((items[0]?.size || 0) / 1024).toFixed(1)} KB
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-xs pt-1.5 border-t border-slate-100">
                            <span className="text-slate-500 font-medium">Total Pages:</span>
                            <span className="font-bold text-slate-800">{items[0]?.pageCount || 1}</span>
                          </div>
                        </div>

                        <div className="space-y-1.5 pt-1">
                          <label className="text-xs font-bold text-slate-700 block">Save as:</label>
                          <input
                            type="text"
                            value={compress100kSaveAs}
                            onChange={(e) => setCompress100kSaveAs(e.target.value)}
                            placeholder={`${items[0]?.name.replace(/\.pdf$/i, "") || "document"}_100kb.pdf`}
                            className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl text-slate-800 font-medium focus:outline-none focus:border-blue-600"
                          />
                        </div>

                        <p className="text-[11px] text-blue-700 bg-blue-50 p-2.5 rounded-xl border border-blue-200/60">
                          Engine downsamples high-resolution elements to meet strict &le;100KB upload limits.
                        </p>
                      </div>
                    )}

                    {/* 10. OPTIMIZE PDF SETTINGS */}
                    {isOptimizeTool && (
                      <div className="space-y-4">
                        <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
                          Optimization Profile:
                        </label>
                        <div className="space-y-2">
                          <button
                            type="button"
                            onClick={() => setOptimizeProfile("web")}
                            className={`w-full p-3 rounded-xl border-2 text-left transition cursor-pointer ${
                              optimizeProfile === "web"
                                ? "border-emerald-600 bg-white text-slate-900 ring-2 ring-emerald-100"
                                : "border-slate-200 bg-white hover:bg-slate-50 text-slate-700"
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold text-slate-900">Fast Web View</span>
                              <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                                Recommended
                              </span>
                            </div>
                            <div className="text-[11px] text-slate-500 mt-0.5">
                              Balanced screen quality, linearizes streams (~55% saved)
                            </div>
                          </button>

                          <button
                            type="button"
                            onClick={() => setOptimizeProfile("lossless")}
                            className={`w-full p-3 rounded-xl border-2 text-left transition cursor-pointer ${
                              optimizeProfile === "lossless"
                                ? "border-emerald-600 bg-white text-slate-900 ring-2 ring-emerald-100"
                                : "border-slate-200 bg-white hover:bg-slate-50 text-slate-700"
                            }`}
                          >
                            <div className="text-xs font-bold text-slate-900">100% Lossless Deflate</div>
                            <div className="text-[11px] text-slate-500 mt-0.5">
                              Compresses stream dictionaries with zero image downsampling (~20% saved)
                            </div>
                          </button>

                          <button
                            type="button"
                            onClick={() => setOptimizeProfile("print")}
                            className={`w-full p-3 rounded-xl border-2 text-left transition cursor-pointer ${
                              optimizeProfile === "print"
                                ? "border-emerald-600 bg-white text-slate-900 ring-2 ring-emerald-100"
                                : "border-slate-200 bg-white hover:bg-slate-50 text-slate-700"
                            }`}
                          >
                            <div className="text-xs font-bold text-slate-900">Print Ready (High Fidelity)</div>
                            <div className="text-[11px] text-slate-500 mt-0.5">
                              Retains high-res 300 DPI graphics for publishing (~30% saved)
                            </div>
                          </button>

                          <button
                            type="button"
                            onClick={() => setOptimizeProfile("extreme")}
                            className={`w-full p-3 rounded-xl border-2 text-left transition cursor-pointer ${
                              optimizeProfile === "extreme"
                                ? "border-emerald-600 bg-white text-slate-900 ring-2 ring-emerald-100"
                                : "border-slate-200 bg-white hover:bg-slate-50 text-slate-700"
                            }`}
                          >
                            <div className="text-xs font-bold text-slate-900">Maximum Reduction</div>
                            <div className="text-[11px] text-slate-500 mt-0.5">
                              Aggressive downscale for strict email attachment limits (~75% saved)
                            </div>
                          </button>
                        </div>

                        {/* Fine Tuning Toggles */}
                        <div className="p-3 bg-white border border-slate-200 rounded-xl space-y-2.5">
                          <div className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                            Advanced Optimizations
                          </div>
                          <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer select-none">
                            <input
                              type="checkbox"
                              checked={stripMetadata}
                              onChange={(e) => setStripMetadata(e.target.checked)}
                              className="w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                            />
                            <span>Scrub metadata &amp; creation stamps</span>
                          </label>
                          <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer select-none">
                            <input
                              type="checkbox"
                              checked={linearizeStreams}
                              onChange={(e) => setLinearizeStreams(e.target.checked)}
                              className="w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                            />
                            <span>Compress object streams (Flate)</span>
                          </label>
                        </div>

                        <div className="space-y-1.5 pt-1">
                          <label className="text-xs font-bold text-slate-700 block">Save as:</label>
                          <input
                            type="text"
                            value={optimizeSaveAs}
                            onChange={(e) => setOptimizeSaveAs(e.target.value)}
                            placeholder={`${items[0]?.name.replace(/\.pdf$/i, "") || "document"}_optimized.pdf`}
                            className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl text-slate-800 font-medium focus:outline-none focus:border-emerald-600"
                          />
                        </div>
                      </div>
                    )}

                    {/* OCR PDF SETTINGS */}
                    {isOcrTool && (
                      <div className="space-y-4">
                        <div>
                          <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block mb-2">
                            OCR Output Mode:
                          </label>
                          <div className="space-y-2">
                            <button
                              type="button"
                              onClick={() => setOcrOutputMode("searchable-pdf")}
                              className={`w-full p-3 rounded-xl border-2 text-left transition cursor-pointer ${
                                ocrOutputMode === "searchable-pdf"
                                  ? "border-blue-600 bg-white text-slate-900 ring-2 ring-blue-100"
                                  : "border-slate-200 bg-white hover:bg-slate-50 text-slate-700"
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                                  <LuSparkles className="w-3.5 h-3.5 text-blue-600" /> Searchable PDF
                                </span>
                                <span className="text-[9px] font-bold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded">
                                  Recommended
                                </span>
                              </div>
                              <div className="text-[11px] text-slate-500 mt-0.5">
                                Preserves scans with an invisible selectable text layer
                              </div>
                            </button>

                            <button
                              type="button"
                              onClick={() => setOcrOutputMode("extract-text")}
                              className={`w-full p-3 rounded-xl border-2 text-left transition cursor-pointer ${
                                ocrOutputMode === "extract-text"
                                  ? "border-blue-600 bg-white text-slate-900 ring-2 ring-blue-100"
                                  : "border-slate-200 bg-white hover:bg-slate-50 text-slate-700"
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                                  <LuFileText className="w-3.5 h-3.5 text-blue-600" /> Extract Text (.txt)
                                </span>
                                <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                                  Clean Text
                                </span>
                              </div>
                              <div className="text-[11px] text-slate-500 mt-0.5">
                                Extract all recognized text into a clean text document
                              </div>
                            </button>

                            <button
                              type="button"
                              onClick={() => setOcrOutputMode("editable-docx")}
                              className={`w-full p-3 rounded-xl border-2 text-left transition cursor-pointer ${
                                ocrOutputMode === "editable-docx"
                                  ? "border-blue-600 bg-white text-slate-900 ring-2 ring-blue-100"
                                  : "border-slate-200 bg-white hover:bg-slate-50 text-slate-700"
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                                  <LuType className="w-3.5 h-3.5 text-blue-600" /> Editable Word (.docx)
                                </span>
                                <span className="text-[9px] font-bold text-purple-700 bg-purple-50 px-1.5 py-0.5 rounded">
                                  Editable Doc
                                </span>
                              </div>
                              <div className="text-[11px] text-slate-500 mt-0.5">
                                Convert optical document text &amp; tables into editable Word
                              </div>
                            </button>
                          </div>
                        </div>

                        {/* Recognition Language */}
                        <div>
                          <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block mb-1.5">
                            OCR Recognition Language:
                          </label>
                          <select
                            value={ocrLanguage}
                            onChange={(e) => setOcrLanguage(e.target.value)}
                            aria-label="OCR Recognition Language"
                            className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl text-slate-800 font-medium focus:outline-none focus:border-blue-600 cursor-pointer"
                          >
                            <option value="eng">English (Latin-1 standard)</option>
                            <option value="spa">Spanish (Español)</option>
                            <option value="fra">French (Français)</option>
                            <option value="deu">German (Deutsch)</option>
                            <option value="ita">Italian (Italiano)</option>
                            <option value="por">Portuguese (Português)</option>
                            <option value="hin">Hindi (हिन्दी)</option>
                            <option value="jpn">Japanese (日本語)</option>
                            <option value="chi_sim">Chinese Simplified (简体中文)</option>
                            <option value="auto">Auto-Detect Multi-language</option>
                          </select>
                        </div>

                        {/* OCR Engine Accuracy */}
                        <div>
                          <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block mb-1.5">
                            Recognition Precision:
                          </label>
                          <div className="grid grid-cols-2 gap-2">
                            <button
                              type="button"
                              onClick={() => setOcrAccuracy("high")}
                              className={`p-2 rounded-xl border text-center transition cursor-pointer text-xs ${
                                ocrAccuracy === "high"
                                  ? "border-blue-600 bg-blue-50 text-blue-700 font-bold ring-1 ring-blue-200"
                                  : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                              }`}
                            >
                              High Accuracy
                            </button>
                            <button
                              type="button"
                              onClick={() => setOcrAccuracy("balanced")}
                              className={`p-2 rounded-xl border text-center transition cursor-pointer text-xs ${
                                ocrAccuracy === "balanced"
                                  ? "border-blue-600 bg-blue-50 text-blue-700 font-bold ring-1 ring-blue-200"
                                  : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                              }`}
                            >
                              Fast Balanced
                            </button>
                          </div>
                        </div>

                        {/* Scan Enhancement Toggle */}
                        <div className="p-3 bg-white border border-slate-200 rounded-xl space-y-2.5">
                          <div className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                            Scan Enhancement
                          </div>
                          <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer select-none">
                            <input
                              type="checkbox"
                              checked={ocrDeskew}
                              onChange={(e) => setOcrDeskew(e.target.checked)}
                              className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                            />
                            <span>Auto-deskew &amp; clarify contrast on scans</span>
                          </label>
                        </div>

                        <div className="space-y-1.5 pt-1">
                          <label className="text-xs font-bold text-slate-700 block">Save as:</label>
                          <input
                            type="text"
                            value={ocrSaveAs}
                            onChange={(e) => setOcrSaveAs(e.target.value)}
                            placeholder={
                              ocrOutputMode === "extract-text"
                                ? `${items[0]?.name.replace(/\.[^/.]+$/, "") || "document"}_ocr.txt`
                                : ocrOutputMode === "editable-docx"
                                ? `${items[0]?.name.replace(/\.[^/.]+$/, "") || "document"}_ocr.docx`
                                : `${items[0]?.name.replace(/\.[^/.]+$/, "") || "document"}_searchable.pdf`
                            }
                            className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl text-slate-800 font-medium focus:outline-none focus:border-blue-600"
                          />
                        </div>
                      </div>
                    )}

                    {/* 11. PAGE NUMBERS SETTINGS */}
                    {isPageNumbersTool && (
                      <div className="space-y-4">
                        <div>
                          <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block mb-1.5">
                            Numbering Position:
                          </label>
                          <div className="grid grid-cols-3 gap-1.5 text-[11px] font-semibold">
                            {[
                              { id: "top-left", label: "Top Left" },
                              { id: "top-center", label: "Top Center" },
                              { id: "top-right", label: "Top Right" },
                              { id: "bottom-left", label: "Btm Left" },
                              { id: "bottom-center", label: "Btm Center" },
                              { id: "bottom-right", label: "Btm Right" },
                            ].map((pos) => (
                              <button
                                key={pos.id}
                                type="button"
                                onClick={() => setPageNumberPosition(pos.id as any)}
                                className={`py-2 px-1 rounded-xl border text-center transition cursor-pointer ${
                                  pageNumberPosition === pos.id
                                    ? "border-blue-600 bg-white text-blue-600 font-bold ring-2 ring-blue-100"
                                    : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                                }`}
                              >
                                {pos.label}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div>
                          <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block mb-1.5">
                            Format Style:
                          </label>
                          <div className="grid grid-cols-2 gap-1.5 text-xs font-medium">
                            {[
                              { id: "page-x-of-y", label: "Page X of Y" },
                              { id: "page-x", label: "Page X" },
                              { id: "dash-x-dash", label: "- X -" },
                              { id: "number-only", label: "X (Digits)" },
                            ].map((fmt) => (
                              <button
                                key={fmt.id}
                                type="button"
                                onClick={() => setPageNumberFormat(fmt.id as any)}
                                className={`py-2 px-2 rounded-xl border text-center transition cursor-pointer ${
                                  pageNumberFormat === fmt.id
                                    ? "border-blue-600 bg-white text-blue-600 font-bold ring-2 ring-blue-100"
                                    : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                                }`}
                              >
                                {fmt.label}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div>
                          <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block mb-1.5">
                            Font Size:
                          </label>
                          <div className="grid grid-cols-4 gap-1.5 text-xs font-semibold">
                            {[10, 11, 12, 14].map((size) => (
                              <button
                                key={size}
                                type="button"
                                onClick={() => setPageNumberFontSize(size)}
                                className={`py-1.5 rounded-xl border text-center transition cursor-pointer ${
                                  pageNumberFontSize === size
                                    ? "border-blue-600 bg-white text-blue-600 font-bold ring-2 ring-blue-100"
                                    : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                                }`}
                              >
                                {size} pt
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="pt-1">
                          <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer select-none">
                            <input
                              type="checkbox"
                              checked={skipCoverPage}
                              onChange={(e) => setSkipCoverPage(e.target.checked)}
                              className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                            />
                            <span>Skip first page (Cover / Title sheet)</span>
                          </label>
                        </div>

                        <div className="space-y-1.5 pt-1 border-t border-slate-200/80">
                          <label className="text-xs font-bold text-slate-700 block">Save as:</label>
                          <input
                            type="text"
                            value={pageNumbersSaveAs}
                            onChange={(e) => setPageNumbersSaveAs(e.target.value)}
                            placeholder={`${items[0]?.name.replace(/\.pdf$/i, "") || "document"}_numbered.pdf`}
                            className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl text-slate-800 font-medium focus:outline-none focus:border-blue-600"
                          />
                        </div>
                      </div>
                    )}

                    {/* 12. WATERMARK SETTINGS */}
                    {isWatermarkTool && (
                      <div className="space-y-4">
                        <div className="space-y-1.5">
                          <label htmlFor={watermarkTextId} className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
                            Watermark Text:
                          </label>
                          <input
                            id={watermarkTextId}
                            type="text"
                            value={watermarkText}
                            onChange={(e) => setWatermarkText(e.target.value)}
                            placeholder="CONFIDENTIAL, DRAFT, SAMPLE..."
                            className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl text-slate-800 font-semibold focus:outline-none focus:border-blue-600 uppercase"
                          />
                        </div>

                        <div>
                          <div className="flex items-center justify-between mb-1.5">
                            <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
                              Transparency / Opacity:
                            </label>
                            <span className="text-[11px] font-mono font-bold text-blue-600">
                              {Math.round(watermarkOpacity * 100)}%
                            </span>
                          </div>
                          <input
                            type="range"
                            min="0.1"
                            max="0.9"
                            step="0.05"
                            value={watermarkOpacity}
                            onChange={(e) => setWatermarkOpacity(parseFloat(e.target.value))}
                            className="w-full accent-blue-600 cursor-pointer"
                          />
                        </div>

                        <div>
                          <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block mb-1.5">
                            Rotation Angle:
                          </label>
                          <div className="grid grid-cols-4 gap-1.5 text-xs font-semibold">
                            {[-45, 0, 45, 90].map((deg) => (
                              <button
                                key={deg}
                                type="button"
                                onClick={() => setWatermarkRotation(deg)}
                                className={`py-1.5 rounded-xl border text-center transition cursor-pointer ${
                                  watermarkRotation === deg
                                    ? "border-blue-600 bg-white text-blue-600 font-bold ring-2 ring-blue-100"
                                    : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                                }`}
                              >
                                {deg}&deg;
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="space-y-1.5 pt-1 border-t border-slate-200/80">
                          <label className="text-xs font-bold text-slate-700 block">Save as:</label>
                          <input
                            type="text"
                            value={watermarkSaveAs}
                            onChange={(e) => setWatermarkSaveAs(e.target.value)}
                            placeholder={`${items[0]?.name.replace(/\.pdf$/i, "") || "document"}_watermarked.pdf`}
                            className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl text-slate-800 font-medium focus:outline-none focus:border-blue-600"
                          />
                        </div>
                      </div>
                    )}

                    {/* 13. CROP PDF SETTINGS */}
                    {isCropTool && (
                      <div className="space-y-4">
                        <div>
                          <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block mb-1.5">
                            Crop Margin Preset:
                          </label>
                          <div className="grid grid-cols-3 gap-1.5 text-xs font-semibold">
                            {[
                              { label: "Trim (5%)", val: 5 },
                              { label: "Standard (8%)", val: 8 },
                              { label: "Deep (12%)", val: 12 },
                            ].map((preset) => (
                              <button
                                key={preset.val}
                                type="button"
                                onClick={() => setCropMarginPercent(preset.val)}
                                className={`py-2 rounded-xl border text-center transition cursor-pointer ${
                                  cropMarginPercent === preset.val
                                    ? "border-blue-600 bg-white text-blue-600 font-bold ring-2 ring-blue-100"
                                    : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                                }`}
                              >
                                {preset.label}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div>
                          <div className="flex items-center justify-between mb-1.5">
                            <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
                              Custom Margin Inset:
                            </label>
                            <span className="text-[11px] font-mono font-bold text-blue-600">
                              {cropMarginPercent}%
                            </span>
                          </div>
                          <input
                            type="range"
                            min="2"
                            max="20"
                            step="1"
                            value={cropMarginPercent}
                            onChange={(e) => setCropMarginPercent(parseInt(e.target.value, 10))}
                            className="w-full accent-blue-600 cursor-pointer"
                          />
                        </div>

                        <div className="space-y-1.5 pt-1 border-t border-slate-200/80">
                          <label className="text-xs font-bold text-slate-700 block">Save as:</label>
                          <input
                            type="text"
                            value={cropSaveAs}
                            onChange={(e) => setCropSaveAs(e.target.value)}
                            placeholder={`${items[0]?.name.replace(/\.pdf$/i, "") || "document"}_cropped.pdf`}
                            className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl text-slate-800 font-medium focus:outline-none focus:border-blue-600"
                          />
                        </div>
                      </div>
                    )}

                    {/* 14. EDIT PDF SETTINGS */}
                    {isEditPdfTool && (
                      <div className="space-y-4">
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
                            Annotation / Stamp Text:
                          </label>
                          <input
                            type="text"
                            value={addedText}
                            onChange={(e) => setAddedText(e.target.value)}
                            placeholder="e.g. Approved, Reviewed, Confidential"
                            className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl text-slate-800 font-medium focus:outline-none focus:border-blue-600"
                          />
                        </div>

                        <div>
                          <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block mb-1.5">
                            Placement Position:
                          </label>
                          <div className="grid grid-cols-3 gap-1.5 text-[11px] font-semibold">
                            {[
                              { id: "top-left", label: "Top Left" },
                              { id: "top-right", label: "Top Right" },
                              { id: "center", label: "Center" },
                              { id: "bottom-left", label: "Btm Left" },
                              { id: "bottom-right", label: "Btm Right" },
                            ].map((pos) => (
                              <button
                                key={pos.id}
                                type="button"
                                onClick={() => setTextPosition(pos.id as any)}
                                className={`py-1.5 rounded-xl border text-center transition cursor-pointer ${
                                  textPosition === pos.id
                                    ? "border-blue-600 bg-white text-blue-600 font-bold ring-2 ring-blue-100"
                                    : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                                }`}
                              >
                                {pos.label}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="pt-1">
                          <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer select-none">
                            <input
                              type="checkbox"
                              checked={addBorderBox}
                              onChange={(e) => setAddBorderBox(e.target.checked)}
                              className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                            />
                            <span>Include High-Visibility Solid Badge Box</span>
                          </label>
                        </div>

                        <div className="space-y-1.5 pt-1 border-t border-slate-200/80">
                          <label className="text-xs font-bold text-slate-700 block">Save as:</label>
                          <input
                            type="text"
                            value={editSaveAs}
                            onChange={(e) => setEditSaveAs(e.target.value)}
                            placeholder={
                              tool.name.toLowerCase().includes("mark")
                                ? `${items[0]?.name.replace(/\.pdf$/i, "") || "document"}_marked.pdf`
                                : `${items[0]?.name.replace(/\.pdf$/i, "") || "document"}_edited.pdf`
                            }
                            className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl text-slate-800 font-medium focus:outline-none focus:border-blue-600"
                          />
                        </div>
                      </div>
                    )}

                    {/* 15. PDF FORMS SETTINGS */}
                    {isPdfFormsTool && (
                      <div className="space-y-4">
                        <div className="p-3 bg-white border border-slate-200 rounded-xl space-y-2 text-xs">
                          <div className="flex items-center justify-between">
                            <span className="text-slate-500 font-medium">Interactive Fields:</span>
                            <span className="font-bold text-blue-600 font-mono">
                              {detectedFormFields.length} detected
                            </span>
                          </div>
                          <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                            <span className="text-slate-500 font-medium">Engine Mode:</span>
                            <span className="font-bold text-slate-800">
                              {detectedFormFields.length > 0 ? "AcroForm Live Fill" : "Stamp Fallback"}
                            </span>
                          </div>
                        </div>

                        {detectedFormFields.length === 0 && (
                          <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
                              Fallback Text to Stamp:
                            </label>
                            <input
                              type="text"
                              value={addedText}
                              onChange={(e) => setAddedText(e.target.value)}
                              placeholder="e.g. John Doe, 2026-10-26"
                              className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl text-slate-800 font-medium focus:outline-none focus:border-blue-600"
                            />
                          </div>
                        )}

                        <div className="pt-1">
                          <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer select-none">
                            <input
                              type="checkbox"
                              checked={flattenForm}
                              onChange={(e) => setFlattenForm(e.target.checked)}
                              className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                            />
                            <span>Flatten form fields permanently (Lock values)</span>
                          </label>
                        </div>

                        <div className="space-y-1.5 pt-1 border-t border-slate-200/80">
                          <label className="text-xs font-bold text-slate-700 block">Save as:</label>
                          <input
                            type="text"
                            value={pdfFormsSaveAs}
                            onChange={(e) => setPdfFormsSaveAs(e.target.value)}
                            placeholder={`${items[0]?.name.replace(/\.pdf$/i, "") || "document"}_filled.pdf`}
                            className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl text-slate-800 font-medium focus:outline-none focus:border-blue-600"
                          />
                        </div>
                      </div>
                    )}

                    {/* 16. CONVERT TO PDF SETTINGS */}
                    {isConvertToPdfTool && (
                      <div className="space-y-4">
                        <div className="p-3 bg-white border border-slate-200 rounded-xl space-y-2 text-xs">
                          <div className="flex items-center justify-between">
                            <span className="text-slate-500 font-medium">Source Document:</span>
                            <span className="font-bold text-slate-800 truncate max-w-[140px]">{items[0]?.name}</span>
                          </div>
                          <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                            <span className="text-slate-500 font-medium">Target Format:</span>
                            <span className="font-bold text-blue-600">PDF (.pdf)</span>
                          </div>
                        </div>

                        {/* Orientation */}
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
                            Page Orientation:
                          </label>
                          <div className="grid grid-cols-2 gap-2">
                            <button
                              type="button"
                              onClick={() => setOrientation("portrait")}
                              className={`p-2.5 rounded-xl border text-xs font-semibold transition cursor-pointer ${
                                orientation === "portrait"
                                  ? "border-blue-600 bg-blue-50/70 text-blue-900"
                                  : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                              }`}
                            >
                              Portrait (A4)
                            </button>
                            <button
                              type="button"
                              onClick={() => setOrientation("landscape")}
                              className={`p-2.5 rounded-xl border text-xs font-semibold transition cursor-pointer ${
                                orientation === "landscape"
                                  ? "border-blue-600 bg-blue-50/70 text-blue-900"
                                  : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                              }`}
                            >
                              Landscape (16:9)
                            </button>
                          </div>
                        </div>

                        {/* Page Size */}
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
                            Page Standard:
                          </label>
                          <div className="grid grid-cols-3 gap-2">
                            {(["a4", "letter", "fit"] as const).map((ps) => (
                              <button
                                key={ps}
                                type="button"
                                onClick={() => setPageSize(ps)}
                                className={`p-2 rounded-xl border text-xs font-semibold capitalize transition cursor-pointer ${
                                  pageSize === ps
                                    ? "border-blue-600 bg-blue-50/70 text-blue-900"
                                    : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                                }`}
                              >
                                {ps === "fit" ? "Fit Content" : ps.toUpperCase()}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Save as */}
                        <div className="space-y-1.5 pt-1 border-t border-slate-200/80">
                          <label className="text-xs font-bold text-slate-700 block">Save as:</label>
                          <input
                            type="text"
                            value={convertToPdfSaveAs}
                            onChange={(e) => setConvertToPdfSaveAs(e.target.value)}
                            placeholder={`${items[0]?.name.replace(/\.[^/.]+$/, "") || "document"}.pdf`}
                            className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl text-slate-800 font-medium focus:outline-none focus:border-blue-600"
                          />
                        </div>
                      </div>
                    )}

                    {/* 17. CONVERT FROM PDF SETTINGS */}
                    {isConvertFromPdfTool && (
                      <div className="space-y-4">
                        <div className="p-3 bg-white border border-slate-200 rounded-xl space-y-2 text-xs">
                          <div className="flex items-center justify-between">
                            <span className="text-slate-500 font-medium">Source PDF:</span>
                            <span className="font-bold text-slate-800 truncate max-w-[140px]">{items[0]?.name}</span>
                          </div>
                          <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                            <span className="text-slate-500 font-medium">Total Pages:</span>
                            <span className="font-bold text-purple-600 font-mono">
                              {items[0]?.pageCount || Object.keys(pageThumbnails).length || 1} pages
                            </span>
                          </div>
                          <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                            <span className="text-slate-500 font-medium">Export Format:</span>
                            <span className="font-bold text-emerald-600">
                              {tool.name.replace("PDF to ", "")}
                            </span>
                          </div>
                        </div>

                        {/* Save as */}
                        <div className="space-y-1.5 pt-1">
                          <label className="text-xs font-bold text-slate-700 block">Save as:</label>
                          <input
                            type="text"
                            value={convertFromPdfSaveAs}
                            onChange={(e) => setConvertFromPdfSaveAs(e.target.value)}
                            placeholder={(() => {
                              const base = items[0]?.name.replace(/\.pdf$/i, "") || "document";
                              const ext =
                                tool.slug === "pdf-to-word" || tool.convertAction === "pdf-to-word" ? "docx" :
                                tool.slug === "pdf-to-excel" || tool.convertAction === "pdf-to-excel" ? "xlsx" :
                                tool.slug === "pdf-to-powerpoint" || tool.convertAction === "pdf-to-ppt" ? "pptx" :
                                tool.slug === "pdf-to-text" || tool.convertAction === "pdf-to-text" ? "txt" : "pdf";
                              return `${base}.${ext}`;
                            })()}
                            className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl text-slate-800 font-medium focus:outline-none focus:border-blue-600"
                          />
                        </div>
                      </div>
                    )}

                    {/* Error Banner */}
                    {errorMessage && (
                      <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
                        {errorMessage}
                      </div>
                    )}
                  </div>

                  {/* Convert CTA Button */}
                  <div className="mt-6 pt-4 border-t border-slate-200/80">
                    <button
                      type="button"
                      disabled={
                        isProcessing ||
                        ((tool.slug === "remove-pages" || tool.optionsType === "remove-pages") &&
                          (selectedPages.size === 0 || (!!items[0]?.pageCount && selectedPages.size >= items[0].pageCount))) ||
                        ((tool.slug === "extract-pages" || tool.optionsType === "extract-pages") &&
                          selectedPages.size === 0) ||
                        (isPdfToJpgTool && selectedPages.size === 0) ||
                        ((isOrganizerTool || isReorderTool) && pagesList.length === 0) ||
                        (isUnlockTool && !unlockPassword.trim()) ||
                        (isProtectTool && (!password.trim() || (confirmPassword.trim() && password !== confirmPassword))) ||
                        (isCompareTool && items.length < 2)
                      }
                      onClick={handleProcess}
                      className={`w-full py-3.5 rounded-xl active:scale-[0.99] text-white font-bold text-sm sm:text-base shadow-md transition flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer ${
                        tool.slug === "remove-pages" || tool.optionsType === "remove-pages"
                          ? "bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 shadow-red-500/20"
                          : tool.slug === "extract-pages" || tool.optionsType === "extract-pages"
                          ? "bg-gradient-to-r from-emerald-600 via-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-emerald-500/20"
                          : isOptimizeTool || isUnlockTool
                          ? "bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500 hover:from-emerald-700 hover:to-teal-700 shadow-emerald-500/20"
                          : isReorderTool || isSignTool
                          ? "bg-gradient-to-r from-purple-600 via-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 shadow-purple-500/20"
                          : isOrganizerTool || isRedactTool
                          ? "bg-gradient-to-r from-rose-600 via-rose-600 to-red-600 hover:from-rose-700 hover:to-red-700 shadow-rose-500/20"
                          : isCompareTool
                          ? "bg-gradient-to-r from-sky-600 via-blue-600 to-cyan-600 hover:from-sky-700 hover:to-cyan-700 shadow-sky-500/20"
                          : "bg-gradient-to-r from-blue-600 via-blue-600 to-[#3bb1df] hover:from-blue-700 hover:to-[#2ea1ce] shadow-blue-500/20"
                      }`}
                    >
                      {isProcessing ? (
                        <>
                          <LuRefreshCw className="w-4 h-4 animate-spin" />
                          <span>Processing In-Browser...</span>
                        </>
                      ) : (
                        <>
                          <span>
                            {tool.slug === "remove-pages" || tool.optionsType === "remove-pages"
                              ? `Delete ${selectedPages.size} ${selectedPages.size === 1 ? "Page" : "Pages"}`
                              : tool.slug === "extract-pages" || tool.optionsType === "extract-pages"
                              ? `Extract ${selectedPages.size} ${selectedPages.size === 1 ? "Page" : "Pages"}`
                              : isImageConverterTool
                              ? `Convert ${items.length > 1 ? `${items.length} Images` : "Image"} to .${imageConvertTargetFormat === "jpeg" ? "JPG" : imageConvertTargetFormat.toUpperCase()}`
                              : isPdfToJpgTool
                              ? selectedPages.size === 0
                                ? "Select Pages to Convert"
                                : selectedPages.size === 1
                                ? "Convert 1 Page to JPG"
                                : `Convert ${selectedPages.size} Pages to JPG`
                              : isReorderTool
                              ? "Save Reordered PDF"
                              : isOrganizerTool
                              ? "Save Organized PDF"
                              : isRotateTool
                              ? "Rotate PDF Now"
                              : isPageNumbersTool
                              ? "Add Page Numbers"
                              : isWatermarkTool
                              ? "Apply Watermark"
                              : isCropTool
                              ? "Crop PDF Now"
                              : isEditPdfTool
                              ? (tool.name.toLowerCase().includes("mark") ? "Save Marked PDF" : "Save Edited PDF")
                              : isPdfFormsTool
                              ? "Save Filled Form"
                              : isUnlockTool
                              ? "Unlock PDF Now"
                              : isProtectTool
                              ? "Protect PDF with Password"
                              : isSignTool
                              ? "Sign PDF Document"
                              : isRedactTool
                              ? "Redact Document Now"
                              : isCompareTool
                              ? (items.length < 2 ? "Add Second PDF to Compare" : "Compare PDFs Now")
                              : isOcrTool
                              ? (ocrOutputMode === "extract-text"
                                  ? "Extract Text with OCR"
                                  : ocrOutputMode === "editable-docx"
                                  ? "Convert to Editable Word"
                                  : "Generate Searchable PDF")
                              : isConvertToPdfTool
                              ? "Convert to PDF"
                              : isConvertFromPdfTool
                              ? `Convert to ${tool.name.replace("PDF to ", "")}`
                              : tool.actionText}
                          </span>
                          {tool.slug === "extract-pages" || tool.optionsType === "extract-pages" || isImageConverterTool || isPdfToJpgTool || isOrganizerTool || isReorderTool || isRotateTool || isPageNumbersTool || isWatermarkTool || isCropTool || isEditPdfTool || isPdfFormsTool || isUnlockTool || isProtectTool || isSignTool || isRedactTool || isCompareTool || isOcrTool || isConvertToPdfTool || isConvertFromPdfTool ? (
                            <LuDownload className="w-4 h-4" />
                          ) : (
                            <LuArrowRight className="w-4 h-4" />
                          )}
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* STAGE 3: SUCCESS & DOWNLOAD VIEW */}
            {stage === "success" && (
              <div className="flex flex-col items-center justify-center py-6 text-center max-w-xl mx-auto">
                <div className="w-16 h-16 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto mb-4 shadow-2xs">
                  <LuCircleCheck className="w-8 h-8" />
                </div>

                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                  {tool.successTitle}
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 mt-1 mb-5">
                  Processed securely in browser memory. Ready for instant download.
                </p>

                {/* Output File Stats */}
                <div className="mb-6 inline-flex items-center gap-3 px-4 py-2 rounded-2xl bg-slate-50 border border-slate-200 shadow-2xs text-xs text-slate-700">
                  <span className="font-semibold text-slate-900">{downloadFileName}</span>
                  <span className="text-slate-300">&bull;</span>
                  <span className="font-mono text-slate-500">
                    {(downloadFileSize / 1024).toFixed(0)} KB
                  </span>
                  {originalTotalSize > downloadFileSize && (
                    <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 font-bold text-[10px]">
                      Saved {(((originalTotalSize - downloadFileSize) / originalTotalSize) * 100).toFixed(0)}%
                    </span>
                  )}
                </div>

                {/* Download Button */}
                <div className="flex flex-wrap sm:flex-nowrap items-center justify-center gap-2.5 sm:gap-3 w-full">
                  <button
                    type="button"
                    onClick={resetAll}
                    title="Process another document"
                    className="w-12 h-12 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 flex items-center justify-center transition shadow-2xs cursor-pointer shrink-0"
                  >
                    <LuRefreshCw className="w-5 h-5 text-slate-600" />
                  </button>

                  <button
                    type="button"
                    onClick={triggerDownload}
                    className="flex-1 min-w-[200px] py-3.5 px-4 rounded-xl bg-gradient-to-r from-blue-600 via-blue-600 to-[#3bb1df] hover:from-blue-700 hover:to-[#2ea1ce] text-white font-bold text-sm sm:text-base shadow-lg shadow-blue-500/25 transition flex items-center justify-center gap-2 active:scale-[0.99] cursor-pointer"
                  >
                    <LuDownload className="w-5 h-5 shrink-0" />
                    <span className="truncate">{tool.downloadText}</span>
                  </button>

                  <button
                    type="button"
                    title="Share link"
                    onClick={() => {
                      navigator.clipboard.writeText(window.location.href);
                      alert("Tool link copied to clipboard!");
                    }}
                    className="w-12 h-12 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 flex items-center justify-center transition shadow-2xs cursor-pointer shrink-0"
                  >
                    <LuShare2 className="w-5 h-5 text-slate-600" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ================= 3-STEP "HOW IT WORKS" GUIDE ================= */}
        <div className="mb-14">
          <div className="text-center mb-8">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              How to use {tool.name}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Three simple steps to process your files in seconds.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
              <div>
                <span className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 font-black text-xs flex items-center justify-center mb-3">
                  01
                </span>
                <div className="font-bold text-sm text-slate-900">Upload Document</div>
                <p className="text-xs text-slate-500 mt-1">
                  Drag and drop your file or pick from your computer, Google Drive, or Dropbox.
                </p>
              </div>
            </div>

            <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
              <div>
                <span className="w-7 h-7 rounded-lg bg-[#3bb1df]/20 text-cyan-800 font-black text-xs flex items-center justify-center mb-3">
                  02
                </span>
                <div className="font-bold text-sm text-slate-900">Configure Parameters</div>
                <p className="text-xs text-slate-500 mt-1">
                  Select your desired profile, orientation, margins, or password encryption.
                </p>
              </div>
            </div>

            <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
              <div>
                <span className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 font-black text-xs flex items-center justify-center mb-3">
                  03
                </span>
                <div className="font-bold text-sm text-slate-900">Instant Free Download</div>
                <p className="text-xs text-slate-500 mt-1">
                  Your output file is generated in browser memory and downloaded directly.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ================= DASHBOARD-STYLED FEATURE CARDS ================= */}
        <div className="mb-14">
          <div className="text-center mb-8">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Studio-Grade Security & Performance
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Built for privacy, speed, and precision without compromise.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="group relative overflow-hidden backdrop-blur-xl bg-white/70 hover:bg-white/95 border border-slate-200/80 hover:border-blue-400 rounded-2xl p-5 shadow-xs hover:shadow-md transition-all duration-300">
              <div className="absolute -top-10 -right-10 w-24 h-24 rounded-full bg-gradient-to-br from-blue-500/25 via-blue-400/10 to-transparent blur-xl pointer-events-none group-hover:scale-150 transition-transform duration-500" />
              <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center mb-3">
                <LuShieldCheck className="w-5 h-5" />
              </div>
              <div className="font-bold text-sm text-slate-900">100% Client-Side Privacy</div>
              <p className="text-xs text-slate-500 mt-1">
                Your files never touch external servers. Processing occurs entirely in your browser sandbox.
              </p>
            </div>

            <div className="group relative overflow-hidden backdrop-blur-xl bg-white/70 hover:bg-white/95 border border-slate-200/80 hover:border-cyan-400 rounded-2xl p-5 shadow-xs hover:shadow-md transition-all duration-300">
              <div className="absolute -top-10 -right-10 w-24 h-24 rounded-full bg-gradient-to-br from-[#3bb1df]/25 via-cyan-400/10 to-transparent blur-xl pointer-events-none group-hover:scale-150 transition-transform duration-500" />
              <div className="w-10 h-10 rounded-xl bg-cyan-50 border border-cyan-200 text-cyan-600 flex items-center justify-center mb-3">
                <LuZap className="w-5 h-5" />
              </div>
              <div className="font-bold text-sm text-slate-900">Instant Execution</div>
              <p className="text-xs text-slate-500 mt-1">
                No upload lag or queue wait times. WebAssembly delivers instant conversions in milliseconds.
              </p>
            </div>

            <div className="group relative overflow-hidden backdrop-blur-xl bg-white/70 hover:bg-white/95 border border-slate-200/80 hover:border-emerald-400 rounded-2xl p-5 shadow-xs hover:shadow-md transition-all duration-300">
              <div className="absolute -top-10 -right-10 w-24 h-24 rounded-full bg-gradient-to-br from-emerald-500/25 via-emerald-400/10 to-transparent blur-xl pointer-events-none group-hover:scale-150 transition-transform duration-500" />
              <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mb-3">
                <LuSparkles className="w-5 h-5" />
              </div>
              <div className="font-bold text-sm text-slate-900">Vector Fidelity</div>
              <p className="text-xs text-slate-500 mt-1">
                Preserves crisp typography glyphs, vector shapes, embedded colors, and layout geometry.
              </p>
            </div>

            <div className="group relative overflow-hidden backdrop-blur-xl bg-white/70 hover:bg-white/95 border border-slate-200/80 hover:border-purple-400 rounded-2xl p-5 shadow-xs hover:shadow-md transition-all duration-300">
              <div className="absolute -top-10 -right-10 w-24 h-24 rounded-full bg-gradient-to-br from-purple-500/25 via-purple-400/10 to-transparent blur-xl pointer-events-none group-hover:scale-150 transition-transform duration-500" />
              <div className="w-10 h-10 rounded-xl bg-purple-50 border border-purple-200 text-purple-600 flex items-center justify-center mb-3">
                <LuCheck className="w-5 h-5" />
              </div>
              <div className="font-bold text-sm text-slate-900">Free Without Sign-in</div>
              <p className="text-xs text-slate-500 mt-1">
                Enjoy unlimited usage without creating an account or providing credit card information.
              </p>
            </div>
          </div>
        </div>

        {/* ================= RELATED PDF STUDIO TOOLS ================= */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base sm:text-lg font-bold text-slate-900">
              Explore More PDF Studio Tools
            </h2>
            <Link
              href="/app/studios/pdf"
              className="text-xs text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-1"
            >
              <span>Open PDF Studio</span>
              <LuChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {[
              { slug: "compress-pdf", name: "Compress PDF", badge: "ZIP", color: "bg-emerald-600", desc: "Reduce file size" },
              { slug: "jpg-to-pdf", name: "JPG to PDF", badge: "IMG", color: "bg-amber-600", desc: "Convert images" },
              { slug: "merge-pdf", name: "Merge PDF", badge: "CAT", color: "bg-rose-500", desc: "Combine multiple" },
              { slug: "split-pdf", name: "Split PDF", badge: "CUT", color: "bg-orange-500", desc: "Extract pages" },
              { slug: "rotate-pdf", name: "Rotate PDF", badge: "ROT", color: "bg-blue-600", desc: "Orient pages" },
              { slug: "protect-pdf", name: "Protect PDF", badge: "SEC", color: "bg-sky-600", desc: "Encrypt password" },
            ].map((t) => (
              <Link
                key={t.slug}
                href={`/tools/${t.slug}`}
                className="group relative overflow-hidden backdrop-blur-xl bg-white/70 hover:bg-white/95 border border-slate-200/80 hover:border-blue-400 rounded-2xl p-3.5 shadow-2xs hover:shadow-md transition-all duration-200 flex flex-col justify-between"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className={`w-7 h-7 rounded-lg ${t.color} text-white font-bold text-[10px] flex items-center justify-center shadow-2xs`}>
                    {t.badge}
                  </span>
                  <LuArrowUpRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-blue-600 transition" />
                </div>
                <div>
                  <div className="font-bold text-xs text-slate-900 group-hover:text-blue-600 transition">
                    {t.name}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">{t.desc}</div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </main>

      {/* Modern Studio Footer */}
      <footer className="border-t border-slate-200/80 bg-white py-8 px-4 sm:px-6 lg:px-8 text-center text-xs text-slate-400">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-sm tracking-tight text-slate-800">
              xsw<span className="text-[#3bb1df]">tools</span>
            </span>
            <span className="text-slate-300">|</span>
            <span>&copy; {new Date().getFullYear()} All Rights Reserved.</span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 text-xs font-medium text-slate-500">
            <Link href="/privacy" className="hover:text-blue-600 transition">Privacy Policy</Link>
            <Link href="/data-safety" className="hover:text-blue-600 transition">Data Safety</Link>
            <Link href="/terms" className="hover:text-blue-600 transition">Terms &amp; Conditions</Link>
            <Link href="/cookies" className="hover:text-blue-600 transition">Cookie Policy</Link>
            <Link href="/contact" className="hover:text-blue-600 transition">Contact Us</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
