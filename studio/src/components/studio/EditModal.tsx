"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { PDFDocument, StandardFonts, rgb, degrees } from "pdf-lib";
import {
  LuUpload,
  LuFileText,
  LuPencil,
  LuImage,
  LuDroplets,
  LuRotateCw,
  LuRotateCcw,
  LuScissors,
  LuRuler,
  LuX,
  LuDownload,
  LuLoader,
  LuCircleCheck,
  LuCircleAlert,
  LuCheck,
  LuType,
  LuHighlighter,
  LuTrash2,
  LuZoomIn,
  LuZoomOut,
  LuChevronLeft,
  LuChevronRight,
  LuMousePointer,
  LuMaximize2,
  LuSparkles,
  LuRefreshCw,
  LuSquare,
  LuMove,
  LuPlus,
  LuUndo2,
  LuEraser,
} from "react-icons/lu";
import { CustomSelect } from "@/components/ui/CustomSelect";

export type EditAction =
  | "edit-pdf"
  | "add-text"
  | "add-image"
  | "add-watermark"
  | "rotate-pdf"
  | "crop-pdf"
  | "resize-pdf"
  | "page-numbers";

export interface EditToolConfig {
  id: string;
  action: EditAction;
  title: string;
  desc: string;
  icon: React.ReactNode;
  iconBg: string;
  borderHover: string;
  gradientFlare: string;
}

interface EditModalProps {
  isOpen: boolean;
  onClose: () => void;
  tool: EditToolConfig | null;
}

interface TextItem {
  id: string;
  page: number;
  originalText: string;
  text: string;
  pdfX: number; // in PDF points
  pdfY: number; // in PDF points
  pdfW: number; // in PDF points
  pdfH: number; // in PDF points
  xPercent: number; // 0 - 100%
  yPercent: number; // 0 - 100%
  fontSize: number;
  color: string;
  isBold?: boolean;
  isEdited: boolean;
  isDeleted: boolean;
  isNew?: boolean;
}

interface ImageItem {
  id: string;
  page: number;
  xPercent: number;
  yPercent: number;
  widthPercent: number;
  heightPercent: number;
  dataUrl: string;
  format: "png" | "jpeg";
}

interface CropBoxRect {
  x: number; // 0 - 100 %
  y: number; // 0 - 100 %
  w: number; // 0 - 100 %
  h: number; // 0 - 100 %
}

type RibbonTool =
  | "select"
  | "text"
  | "draw"
  | "eraser"
  | "highlight"
  | "image"
  | "watermark"
  | "page-numbers"
  | "rotate";

// Helper: Group raw PDF text items into clean sentences / table cells
function extractAndGroupTextItems(rawItems: any[], pWidth: number, pHeight: number, pageNum: number): TextItem[] {
  const filtered = rawItems
    .filter((it) => it.str && it.str.trim().length > 0)
    .map((it, idx) => {
      const tx = it.transform[4];
      const ty = it.transform[5];
      const fSize = Math.round(Math.hypot(it.transform[0] || 0, it.transform[1] || 0)) || Math.abs(it.transform[3]) || 12;
      const w = it.width || it.str.length * fSize * 0.55;
      const h = it.height || fSize;
      return {
        str: it.str,
        tx,
        ty,
        fSize,
        w,
        h,
        origIdx: idx,
      };
    });

  // Sort top-to-bottom (ty descending in PDF coords), then left-to-right
  filtered.sort((a, b) => {
    if (Math.abs(b.ty - a.ty) > 4) {
      return b.ty - a.ty;
    }
    return a.tx - b.tx;
  });

  const grouped: any[] = [];
  for (const item of filtered) {
    const last = grouped[grouped.length - 1];
    if (
      last &&
      Math.abs(last.ty - item.ty) < 3.5 &&
      item.tx >= last.tx + last.w - 1 &&
      item.tx <= last.tx + last.w + last.fSize * 1.8
    ) {
      const spacer = item.tx > last.tx + last.w + 1 ? " " : "";
      last.str += spacer + item.str;
      last.w = item.tx + item.w - last.tx;
      last.fSize = Math.max(last.fSize, item.fSize);
      last.h = Math.max(last.h, item.h);
    } else {
      grouped.push({ ...item });
    }
  }

  return grouped.map((g, idx) => {
    const xPercent = (g.tx / pWidth) * 100;
    const yPercent = ((pHeight - g.ty - g.h * 0.85) / pHeight) * 100;
    return {
      id: `txt-${pageNum}-${idx}`,
      page: pageNum,
      originalText: g.str,
      text: g.str,
      pdfX: g.tx,
      pdfY: g.ty,
      pdfW: g.w,
      pdfH: g.h,
      xPercent: Math.max(0, Math.min(96, xPercent)),
      yPercent: Math.max(0, Math.min(96, yPercent)),
      fontSize: Math.round(g.fSize),
      isEdited: false,
      isDeleted: false,
      color: "#000000",
      isNew: false,
    };
  });
}

export function EditModal({ isOpen, onClose, tool }: EditModalProps) {
  const [mounted, setMounted] = useState(false);
  const [status, setStatus] = useState<"idle" | "processing" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isDraggingFile, setIsDraggingFile] = useState(false);

  // Loaded PDF
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState<number>(1);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageDimensions, setPageDimensions] = useState<Record<number, { width: number; height: number }>>({});
  const [pageThumbnails, setPageThumbnails] = useState<Record<number, string>>({});
  const [isLoadingPage, setIsLoadingPage] = useState<boolean>(false);

  // Editor View controls
  const [zoomScale, setZoomScale] = useState<number>(1.2);
  const [activeRibbonTool, setActiveRibbonTool] = useState<RibbonTool>("text");

  // Extracted & Added Text Items (In-Place Document Editing)
  const [textItems, setTextItems] = useState<TextItem[]>([]);
  const [selectedTextId, setSelectedTextId] = useState<string | null>(null);
  const [imageItems, setImageItems] = useState<ImageItem[]>([]);
  const [selectedImageId, setSelectedImageId] = useState<string | null>(null);

  // Drawing, Eraser & Highlighting
  const [drawMode, setDrawMode] = useState<"pen" | "eraser">("pen");
  const [drawColor, setDrawColor] = useState<string>("#2563eb");
  const [drawWidth, setDrawWidth] = useState<number>(4);
  const [eraserWidth, setEraserWidth] = useState<number>(24);
  const [highlightColor, setHighlightColor] = useState<string>("rgba(250, 204, 21, 0.25)");
  const [highlightWidth, setHighlightWidth] = useState<number>(24);
  const [isDrawing, setIsDrawing] = useState(false);
  const [pageDrawings, setPageDrawings] = useState<Record<number, string>>({});
  const lastPointerRef = useRef<{ x: number; y: number } | null>(null);

  // Watermark
  const [watermarkEnabled, setWatermarkEnabled] = useState<boolean>(false);
  const [watermarkText, setWatermarkText] = useState<string>("CONFIDENTIAL");
  const [watermarkOpacity, setWatermarkOpacity] = useState<number>(0.2);
  const [watermarkColor, setWatermarkColor] = useState<"grey" | "red" | "blue" | "amber" | "green">("grey");
  const [watermarkAngle, setWatermarkAngle] = useState<"diagonal" | "horizontal">("diagonal");
  const [watermarkSize, setWatermarkSize] = useState<number>(54);

  // Page Numbers Specific State
  const [pageNumbersEnabled, setPageNumbersEnabled] = useState<boolean>(true);
  const [pageNumberFormat, setPageNumberFormat] = useState<
    | "page-x-of-y"
    | "page-x"
    | "x-only"
    | "dash-x-dash"
    | "x-slash-y"
    | "bracket-x"
    | "pg-x"
    | "roman-lower"
    | "roman-upper"
  >("page-x-of-y");
  const [pageNumberPosition, setPageNumberPosition] = useState<"bottom-center" | "bottom-left" | "bottom-right" | "top-center" | "top-left" | "top-right">("bottom-center");
  const [pageNumberFontSize, setPageNumberFontSize] = useState<number>(11);
  const [pageNumberColor, setPageNumberColor] = useState<string>("#334155");
  const [skipFirstPage, setSkipFirstPage] = useState<boolean>(false);

  // Page Rotations (Cumulative degrees per page)
  const [pageRotations, setPageRotations] = useState<Record<number, number>>({});

  // Dynamic Crop State
  const [cropBox, setCropBox] = useState<CropBoxRect>({ x: 10, y: 10, w: 80, h: 80 });
  const [pageCrops, setPageCrops] = useState<Record<number, CropBoxRect>>({});
  const [cropScope, setCropScope] = useState<"current" | "all">("current");
  const [cropPreset, setCropPreset] = useState<"free" | "1:1" | "a4" | "4:3" | "16:9">("free");

  // Output
  const [outputFileName, setOutputFileName] = useState("");
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [downloadFileName, setDownloadFileName] = useState<string | null>(null);

  // Refs
  const fileInputRef = useRef<HTMLInputElement>(null);
  const stampImageInputRef = useRef<HTMLInputElement>(null);
  const mainCanvasRef = useRef<HTMLCanvasElement>(null);
  const cropCanvasRef = useRef<HTMLCanvasElement>(null);
  const drawingCanvasRef = useRef<HTMLCanvasElement>(null);
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const cropContainerRef = useRef<HTMLDivElement>(null);
  const pdfJsDocRef = useRef<any>(null);

  // Drag tracking ref for Crop Box
  const cropDragRef = useRef<{
    type: "move" | "nw" | "ne" | "sw" | "se" | "n" | "s" | "w" | "e";
    startX: number;
    startY: number;
    startBox: CropBoxRect;
    containerRect: DOMRect;
  } | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Lock body scroll when open
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

  // Set initial ribbon tool according to selected card action
  useEffect(() => {
    if (!tool) return;
    switch (tool.action) {
      case "add-text":
      case "edit-pdf":
        setActiveRibbonTool("text");
        break;
      case "add-image":
        setActiveRibbonTool("image");
        break;
      case "add-watermark":
        setActiveRibbonTool("watermark");
        setWatermarkEnabled(true);
        break;
      case "rotate-pdf":
        setActiveRibbonTool("rotate");
        break;
      case "page-numbers":
        setActiveRibbonTool("page-numbers");
        setPageNumbersEnabled(true);
        break;
      default:
        setActiveRibbonTool("text");
        break;
    }
  }, [tool?.action]);

  const resetState = () => {
    if (downloadUrl) {
      URL.revokeObjectURL(downloadUrl);
    }
    setSelectedFile(null);
    setPageCount(1);
    setCurrentPage(1);
    setPageDimensions({});
    setPageThumbnails({});
    setTextItems([]);
    setSelectedTextId(null);
    setImageItems([]);
    setSelectedImageId(null);
    setPageDrawings({});
    setPageRotations({});
    setCropBox({ x: 10, y: 10, w: 80, h: 80 });
    setPageCrops({});
    setCropScope("current");
    setCropPreset("free");
    setWatermarkEnabled(false);
    setPageNumbersEnabled(true);
    setPageNumberPosition("bottom-center");
    setPageNumberFormat("page-x-of-y");
    setSkipFirstPage(false);
    setStatus("idle");
    setErrorMessage(null);
    setDownloadUrl(null);
    setDownloadFileName(null);
    pdfJsDocRef.current = null;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes <= 0) return "0 B";
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(2) + " MB";
  };

  // Rotation Helpers
  const rotatePage = (pNum: number, dir: "cw" | "ccw") => {
    setPageRotations((prev) => {
      const cur = prev[pNum] || 0;
      const delta = dir === "cw" ? 90 : -90;
      return { ...prev, [pNum]: cur + delta };
    });
  };

  const rotateAll = (dir: "cw" | "ccw") => {
    setPageRotations((prev) => {
      const next: Record<number, number> = {};
      for (let i = 1; i <= pageCount; i++) {
        const cur = prev[i] || 0;
        next[i] = cur + (dir === "cw" ? 90 : -90);
      }
      return next;
    });
  };

  // Add brand new text item explicitly
  const handleAddNewText = () => {
    const newItem: TextItem = {
      id: `new-text-${Date.now()}`,
      page: currentPage,
      originalText: "",
      text: "New Text",
      pdfX: 100,
      pdfY: 200,
      pdfW: 100,
      pdfH: 20,
      xPercent: 35,
      yPercent: 35,
      fontSize: 16,
      color: "#000000",
      isBold: false,
      isEdited: true,
      isDeleted: false,
      isNew: true,
    };
    setTextItems((prev) => [...prev, newItem]);
    setSelectedTextId(newItem.id);
  };

  // Delete & Revert text helpers
  const handleDeleteText = (id: string) => {
    setTextItems((prev) =>
      prev.map((t) => (t.id === id ? { ...t, isDeleted: true } : t))
    );
    setSelectedTextId(null);
  };

  const handleRevertText = (id: string) => {
    setTextItems((prev) =>
      prev.map((t) =>
        t.id === id
          ? { ...t, text: t.originalText, isEdited: false, isDeleted: false }
          : t
      )
    );
  };

  // Drag text to move
  const handleTextDragStart = (e: React.PointerEvent, item: TextItem) => {
    e.stopPropagation();
    e.preventDefault();
    const paperRect = mainCanvasRef.current?.getBoundingClientRect() || canvasContainerRef.current?.getBoundingClientRect();
    if (!paperRect) return;
    const startX = e.clientX;
    const startY = e.clientY;
    const origX = item.xPercent;
    const origY = item.yPercent;

    const onPointerMove = (moveEvt: PointerEvent) => {
      const deltaX = ((moveEvt.clientX - startX) / paperRect.width) * 100;
      const deltaY = ((moveEvt.clientY - startY) / paperRect.height) * 100;
      setTextItems((prev) =>
        prev.map((t) =>
          t.id === item.id
            ? {
                ...t,
                xPercent: Math.max(0, Math.min(95, origX + deltaX)),
                yPercent: Math.max(0, Math.min(95, origY + deltaY)),
                isEdited: true,
              }
            : t
        )
      );
    };

    const onPointerUp = () => {
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
    };

    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
  };

  // Drag image stamp to move
  const handleImageDragStart = (e: React.PointerEvent, img: ImageItem) => {
    e.stopPropagation();
    e.preventDefault();
    setSelectedImageId(img.id);

    const paperRect = mainCanvasRef.current?.getBoundingClientRect() || canvasContainerRef.current?.getBoundingClientRect();
    if (!paperRect) return;
    const startX = e.clientX;
    const startY = e.clientY;
    const origX = img.xPercent;
    const origY = img.yPercent;

    const onPointerMove = (moveEvt: PointerEvent) => {
      const deltaX = ((moveEvt.clientX - startX) / paperRect.width) * 100;
      const deltaY = ((moveEvt.clientY - startY) / paperRect.height) * 100;
      setImageItems((prev) =>
        prev.map((i) =>
          i.id === img.id
            ? {
                ...i,
                xPercent: Math.max(0, Math.min(100 - i.widthPercent, origX + deltaX)),
                yPercent: Math.max(0, Math.min(100 - i.heightPercent, origY + deltaY)),
              }
            : i
        )
      );
    };

    const onPointerUp = () => {
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
    };

    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
  };

  // Resize image stamp handle
  const handleImageResizeStart = (e: React.PointerEvent, img: ImageItem) => {
    e.stopPropagation();
    e.preventDefault();
    setSelectedImageId(img.id);

    const paperRect = mainCanvasRef.current?.getBoundingClientRect() || canvasContainerRef.current?.getBoundingClientRect();
    if (!paperRect) return;
    const startX = e.clientX;
    const startY = e.clientY;
    const origW = img.widthPercent;
    const origH = img.heightPercent;

    const onPointerMove = (moveEvt: PointerEvent) => {
      const deltaW = ((moveEvt.clientX - startX) / paperRect.width) * 100;
      const deltaH = ((moveEvt.clientY - startY) / paperRect.height) * 100;
      setImageItems((prev) =>
        prev.map((i) =>
          i.id === img.id
            ? {
                ...i,
                widthPercent: Math.max(5, Math.min(100 - i.xPercent, origW + deltaW)),
                heightPercent: Math.max(5, Math.min(100 - i.yPercent, origH + deltaH)),
              }
            : i
        )
      );
    };

    const onPointerUp = () => {
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
    };

    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
  };

  // Crop Aspect Ratio Presets
  const applyCropPreset = (preset: "free" | "1:1" | "a4" | "4:3" | "16:9") => {
    setCropPreset(preset);
    if (!cropContainerRef.current) return;
    const { width: cW, height: cH } = cropContainerRef.current.getBoundingClientRect();

    if (preset === "1:1") {
      const minDim = Math.min(cW, cH) * 0.75;
      const w = (minDim / cW) * 100;
      const h = (minDim / cH) * 100;
      const x = (100 - w) / 2;
      const y = (100 - h) / 2;
      const b: CropBoxRect = { x, y, w, h };
      setCropBox(b);
      setPageCrops((prev) => ({ ...prev, [currentPage]: b }));
    } else if (preset === "a4") {
      const targetRatio = 1 / 1.414;
      let w = 75;
      let h = (w * (cW / cH)) / targetRatio;
      if (h > 90) {
        h = 85;
        w = h * (cH / cW) * targetRatio;
      }
      const x = (100 - w) / 2;
      const y = (100 - h) / 2;
      const b: CropBoxRect = { x, y, w, h };
      setCropBox(b);
      setPageCrops((prev) => ({ ...prev, [currentPage]: b }));
    } else if (preset === "4:3") {
      const targetRatio = 4 / 3;
      let w = 75;
      let h = (w * (cW / cH)) / targetRatio;
      if (h > 90) {
        h = 85;
        w = h * (cH / cW) * targetRatio;
      }
      const x = (100 - w) / 2;
      const y = (100 - h) / 2;
      const b: CropBoxRect = { x, y, w, h };
      setCropBox(b);
      setPageCrops((prev) => ({ ...prev, [currentPage]: b }));
    } else if (preset === "16:9") {
      const targetRatio = 16 / 9;
      let w = 85;
      let h = (w * (cW / cH)) / targetRatio;
      if (h > 90) {
        h = 85;
        w = h * (cH / cW) * targetRatio;
      }
      const x = (100 - w) / 2;
      const y = (100 - h) / 2;
      const b: CropBoxRect = { x, y, w, h };
      setCropBox(b);
      setPageCrops((prev) => ({ ...prev, [currentPage]: b }));
    } else {
      const b: CropBoxRect = { x: 10, y: 10, w: 80, h: 80 };
      setCropBox(b);
      setPageCrops((prev) => ({ ...prev, [currentPage]: b }));
    }
  };

  // Crop Pointer Event Handlers
  const onCropPointerDown = (
    e: React.PointerEvent,
    type: "move" | "nw" | "ne" | "sw" | "se" | "n" | "s" | "w" | "e"
  ) => {
    e.stopPropagation();
    e.preventDefault();
    if (!cropContainerRef.current) return;
    const containerRect = cropContainerRef.current.getBoundingClientRect();
    cropDragRef.current = {
      type,
      startX: e.clientX,
      startY: e.clientY,
      startBox: { ...cropBox },
      containerRect,
    };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const onCropPointerMove = (e: React.PointerEvent) => {
    if (!cropDragRef.current) return;
    const { type, startX, startY, startBox, containerRect } = cropDragRef.current;
    const deltaXPercent = ((e.clientX - startX) / containerRect.width) * 100;
    const deltaYPercent = ((e.clientY - startY) / containerRect.height) * 100;

    let newBox = { ...startBox };

    if (type === "move") {
      newBox.x = Math.max(0, Math.min(100 - startBox.w, startBox.x + deltaXPercent));
      newBox.y = Math.max(0, Math.min(100 - startBox.h, startBox.y + deltaYPercent));
    } else {
      if (type.includes("w")) {
        const maxX = startBox.x + startBox.w - 5;
        const proposedX = Math.max(0, Math.min(maxX, startBox.x + deltaXPercent));
        newBox.w = startBox.w - (proposedX - startBox.x);
        newBox.x = proposedX;
      }
      if (type.includes("e")) {
        const maxW = 100 - startBox.x;
        newBox.w = Math.max(5, Math.min(maxW, startBox.w + deltaXPercent));
      }
      if (type.includes("n")) {
        const maxY = startBox.y + startBox.h - 5;
        const proposedY = Math.max(0, Math.min(maxY, startBox.y + deltaYPercent));
        newBox.h = startBox.h - (proposedY - startBox.y);
        newBox.y = proposedY;
      }
      if (type.includes("s")) {
        const maxH = 100 - startBox.y;
        newBox.h = Math.max(5, Math.min(maxH, startBox.h + deltaYPercent));
      }

      if (cropPreset === "1:1") {
        const pixelW = (newBox.w / 100) * containerRect.width;
        const pixelH = (newBox.h / 100) * containerRect.height;
        const minPixel = Math.min(pixelW, pixelH);
        newBox.w = (minPixel / containerRect.width) * 100;
        newBox.h = (minPixel / containerRect.height) * 100;
      }
    }

    setCropBox(newBox);
    setPageCrops((prev) => ({ ...prev, [currentPage]: newBox }));
  };

  const onCropPointerUp = (e: React.PointerEvent) => {
    if (cropDragRef.current) {
      try {
        (e.target as HTMLElement).releasePointerCapture(e.pointerId);
      } catch {}
      cropDragRef.current = null;
    }
  };

  // Load PDF and extract all real text elements from pages
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
      let suffix = "_edited.pdf";
      if (tool?.action === "rotate-pdf") suffix = "_rotated.pdf";
      if (tool?.action === "crop-pdf") suffix = "_cropped.pdf";
      if (tool?.action === "page-numbers") suffix = "_numbered.pdf";
      setOutputFileName(`${baseName}${suffix}`);

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
      pdfJsDocRef.current = pdf;
      const totalPages = pdf.numPages;
      setPageCount(totalPages);
      setCurrentPage(1);

      // Extract real text from all pages & generate thumbnails
      await extractDocumentTextAndThumbnails(pdf, totalPages);
    } catch (err: any) {
      console.error("PDF Load Error:", err);
      setErrorMessage("Could not open this PDF. It might be corrupt or password-protected.");
    }
  };

  // Extract all text elements and generate thumbnails
  const extractDocumentTextAndThumbnails = async (pdf: any, totalPages: number) => {
    const dims: Record<number, { width: number; height: number }> = {};
    const extractedAllTexts: TextItem[] = [];

    for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
      try {
        const page = await pdf.getPage(pageNum);
        const originalViewport = page.getViewport({ scale: 1 });
        dims[pageNum] = { width: originalViewport.width, height: originalViewport.height };

        // 1. Extract and group real document text
        const textContent = await page.getTextContent();
        const pageTexts = extractAndGroupTextItems(
          textContent.items,
          originalViewport.width,
          originalViewport.height,
          pageNum
        );
        extractedAllTexts.push(...pageTexts);

        // 2. Generate crisp thumbnails
        const scale = Math.min(2.5, Math.max(480 / originalViewport.width, 1.2));
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

          const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
          setPageThumbnails((prev) => ({ ...prev, [pageNum]: dataUrl }));
        }
      } catch (err) {
        console.error("Error processing page " + pageNum, err);
      }
    }
    setPageDimensions(dims);
    setTextItems(extractedAllTexts);
  };

  // Render main canvas for active page in Word-style editor & Page Numbers studio
  const renderCurrentPage = useCallback(async () => {
    if (!pdfJsDocRef.current || !mainCanvasRef.current) return;
    setIsLoadingPage(true);

    try {
      const page = await pdfJsDocRef.current.getPage(currentPage);
      const rotation = pageRotations[currentPage] || 0;
      const viewport = page.getViewport({ scale: zoomScale, rotation: rotation });

      const canvas = mainCanvasRef.current;
      canvas.width = Math.floor(viewport.width);
      canvas.height = Math.floor(viewport.height);

      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        await page.render({
          canvasContext: ctx,
          viewport: viewport,
          canvas: canvas,
        }).promise;
      }

      // Synchronize drawing canvas size if present
      if (drawingCanvasRef.current) {
        drawingCanvasRef.current.width = canvas.width;
        drawingCanvasRef.current.height = canvas.height;
        const dCtx = drawingCanvasRef.current.getContext("2d");
        if (dCtx) {
          dCtx.clearRect(0, 0, canvas.width, canvas.height);
          const existingDataUrl = pageDrawings[currentPage];
          if (existingDataUrl) {
            const img = new Image();
            img.onload = () => {
              dCtx.drawImage(img, 0, 0, canvas.width, canvas.height);
            };
            img.src = existingDataUrl;
          }
        }
      }
    } catch (err) {
      console.error("Page render error:", err);
    } finally {
      setIsLoadingPage(false);
    }
  }, [currentPage, zoomScale, pageRotations, pageDrawings]);

  // Render canvas specifically for Crop PDF
  const renderCropPage = useCallback(async () => {
    if (!pdfJsDocRef.current || !cropCanvasRef.current) return;
    setIsLoadingPage(true);
    try {
      const page = await pdfJsDocRef.current.getPage(currentPage);
      const viewport = page.getViewport({ scale: zoomScale });
      const canvas = cropCanvasRef.current;
      canvas.width = Math.floor(viewport.width);
      canvas.height = Math.floor(viewport.height);
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        await page.render({
          canvasContext: ctx,
          viewport: viewport,
          canvas: canvas,
        }).promise;
      }
    } catch (err) {
      console.error("Crop page render error:", err);
    } finally {
      setIsLoadingPage(false);
    }
  }, [currentPage, zoomScale]);

  useEffect(() => {
    if (selectedFile && pdfJsDocRef.current) {
      if (tool?.action === "crop-pdf") {
        renderCropPage();
      } else if (tool?.action !== "rotate-pdf") {
        renderCurrentPage();
      }
    }
  }, [selectedFile, currentPage, zoomScale, pageRotations, renderCurrentPage, renderCropPage, tool?.action]);

  // Deselect active text on canvas background click (NO accidental text spawning!)
  const handleBackgroundClick = () => {
    setSelectedTextId(null);
  };

  // Drawing & Eraser handlers on the overlay canvas
  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (activeRibbonTool !== "draw" && activeRibbonTool !== "eraser" && activeRibbonTool !== "highlight") return;
    const canvas = drawingCanvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    setIsDrawing(true);
    lastPointerRef.current = { x, y };

    const isEraser = activeRibbonTool === "eraser" || (activeRibbonTool === "draw" && drawMode === "eraser");

    ctx.beginPath();
    ctx.moveTo(x, y);

    if (isEraser) {
      ctx.globalCompositeOperation = "destination-out";
      ctx.lineWidth = eraserWidth;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.strokeStyle = "rgba(0,0,0,1)";
    } else if (activeRibbonTool === "draw") {
      ctx.globalCompositeOperation = "source-over";
      ctx.strokeStyle = drawColor;
      ctx.lineWidth = drawWidth;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
    } else {
      ctx.globalCompositeOperation = "source-over";
      ctx.strokeStyle = highlightColor;
      ctx.lineWidth = highlightWidth;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
    }

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !lastPointerRef.current) return;
    if (activeRibbonTool !== "draw" && activeRibbonTool !== "eraser" && activeRibbonTool !== "highlight") return;
    const canvas = drawingCanvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const isEraser = activeRibbonTool === "eraser" || (activeRibbonTool === "draw" && drawMode === "eraser");

    // Single-segment draw prevents exponential alpha accumulation on semi-transparent strokes
    ctx.beginPath();
    ctx.moveTo(lastPointerRef.current.x, lastPointerRef.current.y);
    ctx.lineTo(x, y);

    if (isEraser) {
      ctx.globalCompositeOperation = "destination-out";
      ctx.lineWidth = eraserWidth;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.strokeStyle = "rgba(0,0,0,1)";
    } else if (activeRibbonTool === "draw") {
      ctx.globalCompositeOperation = "source-over";
      ctx.strokeStyle = drawColor;
      ctx.lineWidth = drawWidth;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
    } else {
      ctx.globalCompositeOperation = "source-over";
      ctx.strokeStyle = highlightColor;
      ctx.lineWidth = highlightWidth;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
    }

    ctx.stroke();
    lastPointerRef.current = { x, y };
  };

  const handlePointerUp = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    lastPointerRef.current = null;
    const canvas = drawingCanvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.globalCompositeOperation = "source-over";
    }

    const dataUrl = canvas.toDataURL("image/png");
    setPageDrawings((prev) => ({ ...prev, [currentPage]: dataUrl }));
  };

  // Add Image / Stamp handler
  const handleStampUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const file = files[0];
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      const isPng = file.type === "image/png" || file.name.toLowerCase().endsWith(".png");
      const newItem: ImageItem = {
        id: `img-${Date.now()}`,
        page: currentPage,
        xPercent: 35,
        yPercent: 35,
        widthPercent: 30,
        heightPercent: 20,
        dataUrl,
        format: isPng ? "png" : "jpeg",
      };
      setImageItems((prev) => [...prev, newItem]);
      setSelectedImageId(newItem.id);
      setActiveRibbonTool("select");
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const handleClearCurrentPageDrawings = () => {
    if (drawingCanvasRef.current) {
      const ctx = drawingCanvasRef.current.getContext("2d");
      if (ctx) {
        ctx.clearRect(0, 0, drawingCanvasRef.current.width, drawingCanvasRef.current.height);
      }
    }
    setPageDrawings((prev) => {
      const copy = { ...prev };
      delete copy[currentPage];
      return copy;
    });
  };

  const parseColor = (col: string) => {
    if (!col) return rgb(0, 0, 0);
    const hex = col.trim().replace(/^#/, "");
    if (hex.length === 6) {
      const r = parseInt(hex.slice(0, 2), 16) / 255;
      const g = parseInt(hex.slice(2, 4), 16) / 255;
      const b = parseInt(hex.slice(4, 6), 16) / 255;
      if (!isNaN(r) && !isNaN(g) && !isNaN(b)) return rgb(r, g, b);
    }
    if (col === "black") return rgb(0, 0, 0);
    if (col === "blue") return rgb(0.145, 0.388, 0.922);
    if (col === "red") return rgb(0.863, 0.149, 0.149);
    if (col === "green") return rgb(0.086, 0.639, 0.29);
    if (col === "white") return rgb(1, 1, 1);
    return rgb(0.2, 0.25, 0.33);
  };

  const toRoman = (num: number): string => {
    if (num <= 0 || num > 3999) return String(num);
    const lookup: [number, string][] = [
      [1000, "M"], [900, "CM"], [500, "D"], [400, "CD"],
      [100, "C"], [90, "XC"], [50, "L"], [40, "XL"],
      [10, "X"], [9, "IX"], [5, "V"], [4, "IV"], [1, "I"]
    ];
    let result = "";
    let n = num;
    for (const [val, roman] of lookup) {
      while (n >= val) {
        result += roman;
        n -= val;
      }
    }
    return result;
  };

  // Helper string for page number display
  const getPageNumberString = (pageNum: number) => {
    const displayNum = skipFirstPage ? pageNum - 1 : pageNum;
    const totalDisplayPages = skipFirstPage ? pageCount - 1 : pageCount;

    if (pageNumberFormat === "page-x-of-y") return `Page ${displayNum} of ${totalDisplayPages}`;
    if (pageNumberFormat === "page-x") return `Page ${displayNum}`;
    if (pageNumberFormat === "x-only") return `${displayNum}`;
    if (pageNumberFormat === "dash-x-dash") return `- ${displayNum} -`;
    if (pageNumberFormat === "x-slash-y") return `${displayNum} / ${totalDisplayPages}`;
    if (pageNumberFormat === "bracket-x") return `[ ${displayNum} ]`;
    if (pageNumberFormat === "pg-x") return `Pg. ${displayNum}`;
    if (pageNumberFormat === "roman-lower") return toRoman(displayNum).toLowerCase();
    if (pageNumberFormat === "roman-upper") return toRoman(displayNum);
    return `Page ${displayNum} of ${totalDisplayPages}`;
  };

  // Active selected text item
  const selectedTextItem = textItems.find((t) => t.id === selectedTextId);

  // Save changes & download final PDF
  const handleSaveChanges = async () => {
    if (!selectedFile) return;
    setStatus("processing");
    setErrorMessage(null);

    try {
      const originalBytes = await selectedFile.arrayBuffer();
      const pdfDoc = await PDFDocument.load(originalBytes, { ignoreEncryption: true });

      const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

      const totalDocPages = pdfDoc.getPageCount();

      for (let pIdx = 0; pIdx < totalDocPages; pIdx++) {
        const pageNum = pIdx + 1;
        const pdfPage = pdfDoc.getPage(pIdx);
        const { width: pWidth, height: pHeight } = pdfPage.getSize();

        // 1. ROTATE PDF MODE & PER-PAGE ROTATIONS
        const addRot = pageRotations[pageNum] || 0;
        if (addRot !== 0) {
          const rawCurrent = typeof pdfPage.getRotation?.()?.angle === "number" ? pdfPage.getRotation().angle : 0;
          const finalRot = (((Math.round(rawCurrent) + Math.round(addRot)) % 360) + 360) % 360;
          const normalized = (Math.round(finalRot / 90) * 90) % 360;
          try {
            pdfPage.setRotation(degrees(normalized));
          } catch (rErr) {
            console.error("Rotation error on page " + pageNum, rErr);
          }
        }

        if (tool?.action === "rotate-pdf") {
          continue;
        }

        // 2. CROP PDF MODE
        if (tool?.action === "crop-pdf") {
          if (cropScope === "all") {
            const cBox = pageCrops[currentPage] || cropBox;
            const cropX = (cBox.x / 100) * pWidth;
            const cropW = (cBox.w / 100) * pWidth;
            const cropH = (cBox.h / 100) * pHeight;
            const cropY = pHeight - (cBox.y / 100) * pHeight - cropH;

            pdfPage.setCropBox(Math.max(0, cropX), Math.max(0, cropY), Math.min(pWidth, cropW), Math.min(pHeight, cropH));
            pdfPage.setMediaBox(Math.max(0, cropX), Math.max(0, cropY), Math.min(pWidth, cropW), Math.min(pHeight, cropH));
          } else {
            const cBox = pageCrops[pageNum];
            if (cBox) {
              const cropX = (cBox.x / 100) * pWidth;
              const cropW = (cBox.w / 100) * pWidth;
              const cropH = (cBox.h / 100) * pHeight;
              const cropY = pHeight - (cBox.y / 100) * pHeight - cropH;

              pdfPage.setCropBox(Math.max(0, cropX), Math.max(0, cropY), Math.min(pWidth, cropW), Math.min(pHeight, cropH));
              pdfPage.setMediaBox(Math.max(0, cropX), Math.max(0, cropY), Math.min(pWidth, cropW), Math.min(pHeight, cropH));
            }
          }
          continue;
        }

        // 3. PAGE NUMBERS DEDICATED MODE
        if (tool?.action === "page-numbers") {
          if (skipFirstPage && pageNum === 1) {
            continue;
          }

          const pageStr = getPageNumberString(pageNum);
          const numSize = pageNumberFontSize;
          const textWidth = helvetica.widthOfTextAtSize(pageStr, numSize);
          const margin = 28;
          const fontColor = parseColor(pageNumberColor);

          let numX = (pWidth - textWidth) / 2;
          if (pageNumberPosition === "bottom-left" || pageNumberPosition === "top-left") {
            numX = margin;
          } else if (pageNumberPosition === "bottom-right" || pageNumberPosition === "top-right") {
            numX = pWidth - textWidth - margin;
          }

          let numY = margin;
          if (pageNumberPosition.startsWith("top")) {
            numY = pHeight - margin - numSize;
          }

          pdfPage.drawText(pageStr, {
            x: numX,
            y: numY,
            size: numSize,
            font: helvetica,
            color: fontColor,
          });
          continue;
        }

        // 4. EDIT PDF & WORD-STYLE TEXT REPLACEMENTS
        const pageTexts = textItems.filter((t) => t.page === pageNum);

        // First: White-out redaction over original text positions that were edited or deleted
        for (const item of pageTexts) {
          if ((item.isEdited || item.isDeleted) && !item.isNew) {
            pdfPage.drawRectangle({
              x: Math.max(0, item.pdfX - 2),
              y: Math.max(0, item.pdfY - 3),
              width: item.pdfW + 4,
              height: item.pdfH + 6,
              color: rgb(1, 1, 1),
            });
          }
        }

        // Second: Paint new or updated text
        for (const item of pageTexts) {
          if (item.isDeleted) continue;
          if (item.isEdited || item.isNew) {
            if (!item.text.trim()) continue;
            const font = item.isBold ? helveticaBold : helvetica;
            const fontColor = parseColor(item.color);

            const xPdf = (item.xPercent / 100) * pWidth;
            const yPdf = pHeight - (item.yPercent / 100) * pHeight - item.fontSize * 0.9;

            pdfPage.drawText(item.text, {
              x: Math.max(0, Math.min(pWidth - 20, xPdf)),
              y: Math.max(0, Math.min(pHeight - 20, yPdf)),
              size: item.fontSize,
              font: font,
              color: fontColor,
            });
          }
        }

        // Overlay Freehand Drawings & Highlights
        const drawingDataUrl = pageDrawings[pageNum];
        if (drawingDataUrl) {
          try {
            const imgRes = await fetch(drawingDataUrl);
            const imgBuf = await imgRes.arrayBuffer();
            const embeddedDrawing = await pdfDoc.embedPng(imgBuf);
            pdfPage.drawImage(embeddedDrawing, {
              x: 0,
              y: 0,
              width: pWidth,
              height: pHeight,
            });
          } catch (dErr) {
            console.error("Drawing embed error:", dErr);
          }
        }

        // Overlay Placed Image Stamps
        const pageImages = imageItems.filter((img) => img.page === pageNum);
        for (const img of pageImages) {
          try {
            const imgRes = await fetch(img.dataUrl);
            const imgBuf = await imgRes.arrayBuffer();
            const embeddedImg =
              img.format === "png"
                ? await pdfDoc.embedPng(imgBuf)
                : await pdfDoc.embedJpg(imgBuf);

            const imgX = (img.xPercent / 100) * pWidth;
            const imgW = (img.widthPercent / 100) * pWidth;
            const imgH = (img.heightPercent / 100) * pHeight;
            const imgY = pHeight - (img.yPercent / 100) * pHeight - imgH;

            pdfPage.drawImage(embeddedImg, {
              x: imgX,
              y: imgY,
              width: imgW,
              height: imgH,
            });
          } catch (iErr) {
            console.error("Image embed error:", iErr);
          }
        }

        // Overlay Watermark
        if (watermarkEnabled && watermarkText.trim()) {
          const wmColor =
            watermarkColor === "red"
              ? rgb(0.86, 0.15, 0.15)
              : watermarkColor === "blue"
              ? rgb(0.15, 0.39, 0.92)
              : watermarkColor === "amber"
              ? rgb(0.85, 0.47, 0.02)
              : watermarkColor === "green"
              ? rgb(0.09, 0.64, 0.29)
              : rgb(0.39, 0.46, 0.55);

          const wmSize = Math.max(28, Math.min(72, pWidth / 8));
          const textWidth = helveticaBold.widthOfTextAtSize(watermarkText, wmSize);
          const centerX = (pWidth - textWidth) / 2;
          const centerY = pHeight / 2;
          const rotAngle = watermarkAngle === "diagonal" ? 45 : 0;

          pdfPage.drawText(watermarkText, {
            x: centerX,
            y: centerY,
            size: wmSize,
            font: helveticaBold,
            color: wmColor,
            opacity: watermarkOpacity,
            rotate: degrees(rotAngle),
          });
        }
      }

      const finalPdfBytes = await pdfDoc.save();
      const blob = new Blob([new Uint8Array(finalPdfBytes)], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const resolvedName = outputFileName.trim() || "document.pdf";

      setDownloadUrl(url);
      setDownloadFileName(resolvedName);
      setStatus("success");

      // Auto trigger download
      const a = document.createElement("a");
      a.href = url;
      a.download = resolvedName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (err: any) {
      console.error("Save PDF Error:", err);
      setStatus("error");
      setErrorMessage(err.message || "Failed to compile and save edited PDF.");
    }
  };

  if (!isOpen || !tool || !mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[99999] w-screen h-[100dvh] min-h-screen bg-slate-950/80 backdrop-blur-md flex flex-col p-2 sm:p-4 overflow-hidden animate-in fade-in duration-200">
      {/* 1. Initial File Dropzone Modal (When no file is selected yet) */}
      {!selectedFile && (
        <div className="m-auto w-full max-w-lg bg-white/95 backdrop-blur-2xl rounded-3xl border border-slate-200/80 shadow-2xl p-6 relative overflow-hidden flex flex-col space-y-5">
          <div
            className={`absolute -top-16 -right-16 w-40 h-40 rounded-full bg-gradient-to-br ${tool.gradientFlare} blur-2xl pointer-events-none opacity-60`}
          />

          <div className="flex items-center justify-between z-10">
            <div className="flex items-center gap-3">
              <span className={`w-10 h-10 rounded-xl ${tool.iconBg} text-white font-bold text-sm flex items-center justify-center shadow-xs`}>
                {tool.icon}
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-bold text-slate-900">{tool.title}</h2>
                  <span className="text-[10px] font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200/60">
                    PDF Studio
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

          {errorMessage && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
              <LuCircleAlert className="w-4 h-4 shrink-0 text-red-600" />
              <span>{errorMessage}</span>
            </div>
          )}

          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDraggingFile(true);
            }}
            onDragLeave={() => setIsDraggingFile(false)}
            onDrop={(e) => {
              e.preventDefault();
              setIsDraggingFile(false);
              handleFileUpload(e.dataTransfer.files);
            }}
            onClick={() => fileInputRef.current?.click()}
            className={`relative border-2 border-dashed rounded-2xl p-8 sm:p-10 text-center cursor-pointer transition-all duration-200 ${
              isDraggingFile
                ? "border-blue-500 bg-blue-50/50 scale-[0.99]"
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
              <span className={`w-12 h-12 rounded-2xl ${tool.iconBg}/15 text-slate-700 flex items-center justify-center`}>
                <LuUpload className="w-6 h-6 text-slate-700" />
              </span>
              <div>
                <div className="text-sm font-bold text-slate-900">Choose PDF to {tool.title}</div>
                <div className="text-xs text-slate-400 mt-0.5">Drag and drop or click to browse (.pdf)</div>
              </div>
              <div className="pt-2">
                <span className="px-4 py-1.5 bg-slate-900 text-white rounded-xl text-xs font-semibold shadow-xs hover:bg-slate-800 transition">
                  Browse File
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. DEDICATED LIVE PAGE NUMBERS STUDIO (For Page Numbers) */}
      {selectedFile && tool.action === "page-numbers" && (
        <div className="w-full h-full max-w-[1580px] mx-auto bg-slate-900 rounded-3xl shadow-2xl border border-slate-700/60 overflow-hidden flex flex-col">
          {/* Top Header Bar */}
          <header className="h-16 bg-slate-900 border-b border-slate-800 px-6 flex items-center justify-between shrink-0 text-white">
            <div className="flex items-center gap-3 min-w-0">
              <span className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-base shadow-xs shrink-0">
                #
              </span>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-slate-100 truncate max-w-[200px] sm:max-w-xs">
                    {selectedFile.name}
                  </span>
                  <span className="text-[11px] text-slate-400 shrink-0">
                    ({formatFileSize(selectedFile.size)})
                  </span>
                </div>
                <div className="text-[11px] text-slate-400">
                  Page {currentPage} of {pageCount} &bull; Live Page Numbering Studio
                </div>
              </div>
              <button
                type="button"
                onClick={resetState}
                className="text-xs text-slate-400 hover:text-slate-200 hover:bg-slate-800 px-3 py-1.5 rounded-xl transition ml-2 shrink-0 hidden sm:inline-block"
              >
                Change PDF
              </button>
            </div>

            {/* Page & Zoom Navigation */}
            <div className="flex items-center gap-3">
              <div className="flex items-center bg-slate-800 border border-slate-700/80 rounded-xl px-2 py-1 text-xs">
                <button
                  type="button"
                  disabled={currentPage <= 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  className="p-1 hover:text-indigo-400 disabled:opacity-30 disabled:hover:text-white transition"
                  title="Previous Page"
                >
                  <LuChevronLeft className="w-4 h-4" />
                </button>
                <span className="px-2 text-slate-300 font-semibold text-[11px]">
                  {currentPage} / {pageCount}
                </span>
                <button
                  type="button"
                  disabled={currentPage >= pageCount}
                  onClick={() => setCurrentPage((p) => Math.min(pageCount, p + 1))}
                  className="p-1 hover:text-indigo-400 disabled:opacity-30 disabled:hover:text-white transition"
                  title="Next Page"
                >
                  <LuChevronRight className="w-4 h-4" />
                </button>
              </div>

              <div className="hidden sm:flex items-center bg-slate-800 border border-slate-700/80 rounded-xl px-2 py-1 text-xs">
                <button
                  type="button"
                  onClick={() => setZoomScale((z) => Math.max(0.6, z - 0.2))}
                  className="p-1 text-slate-400 hover:text-white transition"
                  title="Zoom Out"
                >
                  <LuZoomOut className="w-3.5 h-3.5" />
                </button>
                <span className="px-2 text-slate-300 text-[11px] font-medium">
                  {Math.round(zoomScale * 100)}%
                </span>
                <button
                  type="button"
                  onClick={() => setZoomScale((z) => Math.min(2.5, z + 0.2))}
                  className="p-1 text-slate-400 hover:text-white transition"
                  title="Zoom In"
                >
                  <LuZoomIn className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Actions: Save & Close */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                disabled={status === "processing"}
                onClick={handleSaveChanges}
                className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 via-blue-600 to-indigo-700 hover:from-indigo-500 hover:to-blue-500 text-white rounded-xl text-xs font-bold shadow-lg transition flex items-center gap-2 disabled:opacity-50"
              >
                {status === "processing" ? (
                  <>
                    <LuLoader className="w-4 h-4 animate-spin" />
                    <span>Adding Page Numbers...</span>
                  </>
                ) : (
                  <>
                    <LuDownload className="w-4 h-4" />
                    <span>Save & Download PDF</span>
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 transition"
              >
                <LuX className="w-5 h-5" />
              </button>
            </div>
          </header>

          {/* Page Numbers Formatting Ribbon */}
          <div className="bg-slate-800/90 border-b border-slate-700/70 p-2 sm:px-6 flex flex-wrap items-center justify-between gap-3 text-white shrink-0">
            {/* 6 Positions Selector */}
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-semibold text-slate-400">Position:</span>
              <div className="grid grid-cols-3 gap-1 bg-slate-900/80 p-1 rounded-xl border border-slate-700/60">
                {[
                  { id: "top-left", label: "Top Left" },
                  { id: "top-center", label: "Top Center" },
                  { id: "top-right", label: "Top Right" },
                  { id: "bottom-left", label: "Bottom Left" },
                  { id: "bottom-center", label: "Bottom Center" },
                  { id: "bottom-right", label: "Bottom Right" },
                ].map((pos) => (
                  <button
                    key={pos.id}
                    type="button"
                    onClick={() => setPageNumberPosition(pos.id as any)}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold transition ${
                      pageNumberPosition === pos.id
                        ? "bg-indigo-600 text-white shadow-xs"
                        : "text-slate-400 hover:text-white hover:bg-slate-800"
                    }`}
                  >
                    {pos.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Format & Typography */}
            <div className="flex flex-wrap items-center gap-3 text-xs">
              <div className="flex items-center gap-2 bg-slate-900/60 px-2.5 py-1 rounded-xl border border-slate-700/50">
                <span className="text-[11px] text-slate-400 shrink-0">Format:</span>
                <div className="w-36">
                  <CustomSelect
                    value={pageNumberFormat}
                    onChange={(v: any) => setPageNumberFormat(v)}
                    variant="dark"
                    size="sm"
                    options={[
                      { value: "page-x-of-y", label: `Page 1 of ${pageCount}` },
                      { value: "page-x", label: "Page 1" },
                      { value: "x-only", label: "1 (Number only)" },
                      { value: "x-slash-y", label: `1 / ${pageCount}` },
                      { value: "dash-x-dash", label: "- 1 -" },
                      { value: "bracket-x", label: "[ 1 ]" },
                      { value: "pg-x", label: "Pg. 1" },
                      { value: "roman-lower", label: "i, ii, iii (Roman)" },
                      { value: "roman-upper", label: "I, II, III (ROMAN)" },
                    ]}
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 bg-slate-900/60 px-2.5 py-1 rounded-xl border border-slate-700/50">
                <span className="text-[11px] text-slate-400 shrink-0">Size:</span>
                <div className="w-24">
                  <CustomSelect
                    value={String(pageNumberFontSize)}
                    onChange={(v) => setPageNumberFontSize(parseInt(v, 10))}
                    variant="dark"
                    size="sm"
                    options={[
                      { value: "9", label: "9 pt" },
                      { value: "11", label: "11 pt" },
                      { value: "13", label: "13 pt" },
                      { value: "16", label: "16 pt" },
                    ]}
                  />
                </div>
              </div>

              <div className="flex items-center gap-1.5 bg-slate-900/60 px-3 py-1.5 rounded-xl border border-slate-700/50">
                <span className="text-[11px] text-slate-400">Color:</span>
                {[
                  { name: "Charcoal Slate", color: "#334155" },
                  { name: "Neutral Gray", color: "#64748b" },
                  { name: "Solid Black", color: "#000000" },
                  { name: "Royal Blue", color: "#2563eb" },
                  { name: "Crimson Red", color: "#dc2626" },
                  { name: "Emerald Green", color: "#16a34a" },
                ].map((c) => (
                  <button
                    key={c.color}
                    type="button"
                    onClick={() => setPageNumberColor(c.color)}
                    className={`w-4 h-4 rounded-full border transition ${
                      pageNumberColor === c.color ? "ring-2 ring-indigo-400 scale-125 border-white shadow-xs" : "border-slate-500 hover:scale-110"
                    }`}
                    style={{ backgroundColor: c.color }}
                    title={c.name}
                  />
                ))}
              </div>

              <label className="flex items-center gap-1.5 bg-slate-900/60 px-3 py-1.5 rounded-xl border border-slate-700/50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={skipFirstPage}
                  onChange={(e) => setSkipFirstPage(e.target.checked)}
                  className="rounded text-indigo-600 focus:ring-indigo-500"
                />
                <span className="text-[11px] text-slate-300 font-medium">Skip Cover Page</span>
              </label>
            </div>
          </div>

          {/* Main Document Workspace Area with Live Preview */}
          <div className="flex-1 flex overflow-hidden bg-slate-950/80">
            {/* Left Page Thumbnails Strip */}
            <aside className="w-48 bg-slate-900/90 border-r border-slate-800/80 p-3 overflow-y-auto space-y-3 shrink-0">
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-1">
                Pages ({pageCount})
              </div>
              <div className="space-y-2">
                {Array.from({ length: pageCount }).map((_, idx) => {
                  const pNum = idx + 1;
                  const thumb = pageThumbnails[pNum];
                  const isActive = currentPage === pNum;
                  return (
                    <div
                      key={pNum}
                      onClick={() => setCurrentPage(pNum)}
                      className={`group relative p-2 rounded-xl cursor-pointer transition flex flex-col items-center border ${
                        isActive
                          ? "bg-indigo-600/15 border-indigo-500 shadow-md ring-1 ring-indigo-500/40"
                          : "bg-slate-800/50 border-slate-700/60 hover:bg-slate-800 hover:border-slate-600"
                      }`}
                    >
                      <div className="w-full aspect-[1/1.4] bg-white rounded-md overflow-hidden flex items-center justify-center shadow-xs relative">
                        {thumb ? (
                          <img
                            src={thumb}
                            alt={`Page ${pNum}`}
                            className="w-full h-full object-contain pointer-events-none"
                          />
                        ) : (
                          <span className="text-slate-400 text-xs font-bold">#{pNum}</span>
                        )}
                      </div>
                      <div className="mt-1.5 flex items-center justify-between w-full px-1">
                        <span className={`text-[10px] font-bold ${isActive ? "text-indigo-400" : "text-slate-400"}`}>
                          Page {pNum}
                        </span>
                        <span className="text-[9px] text-indigo-400 font-mono">
                          {skipFirstPage && pNum === 1 ? "Cover" : `#${skipFirstPage ? pNum - 1 : pNum}`}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </aside>

            {/* Center Canvas with Live Interactive Page Number Overlay */}
            <main
              ref={canvasContainerRef}
              className="flex-1 overflow-auto bg-slate-950/60 p-4 sm:p-8 flex justify-center items-start select-none relative"
            >
              {isLoadingPage && (
                <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-2xs flex items-center justify-center z-50">
                  <div className="flex items-center gap-2 bg-slate-900 border border-slate-700 px-4 py-2 rounded-xl text-white text-xs font-semibold shadow-lg">
                    <LuLoader className="w-4 h-4 animate-spin text-indigo-400" />
                    <span>Rendering Page {currentPage}...</span>
                  </div>
                </div>
              )}

              {/* White Sheet Paper Container */}
              <div className="relative bg-white shadow-2xl rounded-sm ring-1 ring-slate-800/20 overflow-hidden">
                {/* Underlying High-Res Page Canvas */}
                <canvas ref={mainCanvasRef} className="block pointer-events-none" />

                {/* Real-time Live Page Number Overlay Preview */}
                {skipFirstPage && currentPage === 1 ? (
                  <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-amber-900/80 text-amber-200 border border-amber-500/40 px-3 py-1 rounded-xl text-xs font-medium shadow-md">
                    Cover page (numbering skipped)
                  </div>
                ) : (
                  <div
                    className={`absolute pointer-events-none transition-all duration-300 z-30 ${
                      pageNumberPosition === "bottom-center"
                        ? "bottom-5 left-1/2 -translate-x-1/2"
                        : pageNumberPosition === "bottom-left"
                        ? "bottom-5 left-8"
                        : pageNumberPosition === "bottom-right"
                        ? "bottom-5 right-8"
                        : pageNumberPosition === "top-center"
                        ? "top-5 left-1/2 -translate-x-1/2"
                        : pageNumberPosition === "top-left"
                        ? "top-5 left-8"
                        : "top-5 right-8"
                    }`}
                  >
                    <div className="px-2 py-0.5 rounded transition">
                      <span
                        className="font-medium tracking-normal select-none"
                        style={{
                          fontSize: `${Math.round(pageNumberFontSize * zoomScale)}px`,
                          color: pageNumberColor,
                        }}
                      >
                        {getPageNumberString(currentPage)}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </main>
          </div>
        </div>
      )}

      {/* 3. DEDICATED DYNAMIC DRAGGABLE SQUARE & RECT CROP STUDIO (For Crop PDF) */}
      {selectedFile && tool.action === "crop-pdf" && (
        <div className="w-full h-full max-w-[1580px] mx-auto bg-slate-900 rounded-3xl shadow-2xl border border-slate-700/60 overflow-hidden flex flex-col">
          {/* Header Bar */}
          <header className="h-16 bg-slate-900 border-b border-slate-800 px-6 flex items-center justify-between shrink-0 text-white">
            <div className="flex items-center gap-3 min-w-0">
              <span className="w-10 h-10 rounded-xl bg-teal-500 text-white flex items-center justify-center font-bold shadow-xs shrink-0">
                <LuScissors className="w-5 h-5" />
              </span>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-slate-100 truncate max-w-[200px] sm:max-w-xs">
                    {selectedFile.name}
                  </span>
                  <span className="text-[11px] text-slate-400 shrink-0">
                    ({formatFileSize(selectedFile.size)})
                  </span>
                </div>
                <div className="text-[11px] text-slate-400">
                  Page {currentPage} of {pageCount} &bull; Drag handles to crop area
                </div>
              </div>
              <button
                type="button"
                onClick={resetState}
                className="text-xs text-slate-400 hover:text-slate-200 hover:bg-slate-800 px-3 py-1.5 rounded-xl transition ml-2 shrink-0 hidden sm:inline-block"
              >
                Change PDF
              </button>
            </div>

            {/* Page & Zoom Navigation */}
            <div className="flex items-center gap-3">
              <div className="flex items-center bg-slate-800 border border-slate-700/80 rounded-xl px-2 py-1 text-xs">
                <button
                  type="button"
                  disabled={currentPage <= 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  className="p-1 hover:text-teal-400 disabled:opacity-30 disabled:hover:text-white transition"
                  title="Previous Page"
                >
                  <LuChevronLeft className="w-4 h-4" />
                </button>
                <span className="px-2 text-slate-300 font-semibold text-[11px]">
                  {currentPage} / {pageCount}
                </span>
                <button
                  type="button"
                  disabled={currentPage >= pageCount}
                  onClick={() => setCurrentPage((p) => Math.min(pageCount, p + 1))}
                  className="p-1 hover:text-teal-400 disabled:opacity-30 disabled:hover:text-white transition"
                  title="Next Page"
                >
                  <LuChevronRight className="w-4 h-4" />
                </button>
              </div>

              <div className="hidden sm:flex items-center bg-slate-800 border border-slate-700/80 rounded-xl px-2 py-1 text-xs">
                <button
                  type="button"
                  onClick={() => setZoomScale((z) => Math.max(0.6, z - 0.2))}
                  className="p-1 text-slate-400 hover:text-white transition"
                  title="Zoom Out"
                >
                  <LuZoomOut className="w-3.5 h-3.5" />
                </button>
                <span className="px-2 text-slate-300 text-[11px] font-medium">
                  {Math.round(zoomScale * 100)}%
                </span>
                <button
                  type="button"
                  onClick={() => setZoomScale((z) => Math.min(2.5, z + 0.2))}
                  className="p-1 text-slate-400 hover:text-white transition"
                  title="Zoom In"
                >
                  <LuZoomIn className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Actions: Save & Close */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                disabled={status === "processing"}
                onClick={handleSaveChanges}
                className="px-5 py-2.5 bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-400 hover:to-emerald-500 text-white rounded-xl text-xs font-bold shadow-lg transition flex items-center gap-2 disabled:opacity-50"
              >
                {status === "processing" ? (
                  <>
                    <LuLoader className="w-4 h-4 animate-spin" />
                    <span>Cropping PDF...</span>
                  </>
                ) : (
                  <>
                    <LuDownload className="w-4 h-4" />
                    <span>Crop & Download PDF</span>
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 transition"
              >
                <LuX className="w-5 h-5" />
              </button>
            </div>
          </header>

          {/* Crop Ribbon Toolbar */}
          <div className="bg-slate-800/90 border-b border-slate-700/70 p-2 sm:px-6 flex flex-wrap items-center justify-between gap-3 text-white shrink-0">
            <div className="flex items-center gap-1.5 bg-slate-900/80 p-1 rounded-xl border border-slate-700/60 overflow-x-auto">
              <span className="text-[11px] font-semibold text-slate-400 px-2">Preset:</span>
              <button
                type="button"
                onClick={() => applyCropPreset("free")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  cropPreset === "free"
                    ? "bg-teal-600 text-white shadow-xs"
                    : "text-slate-400 hover:text-white hover:bg-slate-800"
                }`}
              >
                Freeform
              </button>

              <button
                type="button"
                onClick={() => applyCropPreset("1:1")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  cropPreset === "1:1"
                    ? "bg-teal-600 text-white shadow-xs"
                    : "text-slate-400 hover:text-white hover:bg-slate-800"
                }`}
                title="Dynamic 1:1 Square Crop"
              >
                <LuSquare className="w-3.5 h-3.5 text-teal-300" />
                <span>1:1 Square</span>
              </button>

              <button
                type="button"
                onClick={() => applyCropPreset("a4")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  cropPreset === "a4"
                    ? "bg-teal-600 text-white shadow-xs"
                    : "text-slate-400 hover:text-white hover:bg-slate-800"
                }`}
              >
                A4 Document
              </button>

              <button
                type="button"
                onClick={() => applyCropPreset("4:3")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  cropPreset === "4:3"
                    ? "bg-teal-600 text-white shadow-xs"
                    : "text-slate-400 hover:text-white hover:bg-slate-800"
                }`}
              >
                4:3 Standard
              </button>

              <button
                type="button"
                onClick={() => applyCropPreset("16:9")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  cropPreset === "16:9"
                    ? "bg-teal-600 text-white shadow-xs"
                    : "text-slate-400 hover:text-white hover:bg-slate-800"
                }`}
              >
                16:9 Wide
              </button>
            </div>

            <div className="flex items-center gap-3 text-xs">
              {/* Radio Buttons: This Page Only vs All Pages */}
              <div className="flex items-center gap-3 bg-slate-900/80 px-3 py-1.5 rounded-xl border border-slate-700/60">
                <span className="text-[11px] font-semibold text-slate-400">Apply Crop To:</span>

                <label className="flex items-center gap-1.5 cursor-pointer text-xs font-semibold text-slate-200 select-none">
                  <input
                    type="radio"
                    name="cropScope"
                    value="current"
                    checked={cropScope === "current"}
                    onChange={() => setCropScope("current")}
                    className="text-teal-500 focus:ring-0 bg-slate-800 border-slate-600 w-3.5 h-3.5 cursor-pointer"
                  />
                  <span>This Page Only (Page {currentPage})</span>
                </label>

                <div className="h-3 w-px bg-slate-700" />

                <label className="flex items-center gap-1.5 cursor-pointer text-xs font-semibold text-slate-200 select-none">
                  <input
                    type="radio"
                    name="cropScope"
                    value="all"
                    checked={cropScope === "all"}
                    onChange={() => setCropScope("all")}
                    className="text-teal-500 focus:ring-0 bg-slate-800 border-slate-600 w-3.5 h-3.5 cursor-pointer"
                  />
                  <span>All Pages ({pageCount})</span>
                </label>
              </div>

              <div className="bg-teal-950/40 border border-teal-500/30 px-3 py-1.5 rounded-xl text-teal-300 font-mono text-[11px]">
                Crop Area: {Math.round(cropBox.w)}% &times; {Math.round(cropBox.h)}%
              </div>

              <button
                type="button"
                onClick={() => {
                  setCropPreset("free");
                  const b = { x: 0, y: 0, w: 100, h: 100 };
                  setCropBox(b);
                  if (cropScope === "all") {
                    setPageCrops({});
                  } else {
                    setPageCrops((prev) => {
                      const copy = { ...prev };
                      delete copy[currentPage];
                      return copy;
                    });
                  }
                }}
                className="text-[11px] text-slate-400 hover:text-teal-300 font-semibold"
              >
                Reset to Full Page
              </button>
            </div>
          </div>

          {/* Main Crop Workspace */}
          <div className="flex-1 flex overflow-hidden bg-slate-950/80">
            <aside className="w-48 bg-slate-900/90 border-r border-slate-800/80 p-3 overflow-y-auto space-y-3 shrink-0">
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-1">
                Pages ({pageCount})
              </div>
              <div className="space-y-2">
                {Array.from({ length: pageCount }).map((_, idx) => {
                  const pNum = idx + 1;
                  const thumb = pageThumbnails[pNum];
                  const isActive = currentPage === pNum;
                  return (
                    <div
                      key={pNum}
                      onClick={() => {
                        setCurrentPage(pNum);
                        if (cropScope === "current" && pageCrops[pNum]) {
                          setCropBox(pageCrops[pNum]);
                        }
                      }}
                      className={`group relative p-2 rounded-xl cursor-pointer transition flex flex-col items-center border ${
                        isActive
                          ? "bg-teal-600/15 border-teal-500 shadow-md ring-1 ring-teal-500/40"
                          : "bg-slate-800/50 border-slate-700/60 hover:bg-slate-800 hover:border-slate-600"
                      }`}
                    >
                      <div className="w-full aspect-[1/1.4] bg-white rounded-md overflow-hidden flex items-center justify-center shadow-xs relative">
                        {thumb ? (
                          <img
                            src={thumb}
                            alt={`Page ${pNum}`}
                            className="w-full h-full object-contain pointer-events-none"
                          />
                        ) : (
                          <span className="text-slate-400 text-xs font-bold">#{pNum}</span>
                        )}
                      </div>
                      <div className="mt-1.5 flex items-center justify-between w-full px-1">
                        <span className={`text-[10px] font-bold ${isActive ? "text-teal-400" : "text-slate-400"}`}>
                          Page {pNum}
                        </span>
                        {cropScope === "all" ? (
                          <span className="text-[9px] text-teal-400 font-semibold">Cropped</span>
                        ) : pageCrops[pNum] ? (
                          <span className="text-[9px] text-teal-400 font-semibold">Cropped</span>
                        ) : (
                          <span className="text-[9px] text-slate-500 font-medium">Original</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </aside>

            <main
              onPointerMove={onCropPointerMove}
              onPointerUp={onCropPointerUp}
              className="flex-1 overflow-auto bg-slate-950/60 p-4 sm:p-8 flex justify-center items-start select-none relative"
            >
              {isLoadingPage && (
                <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-2xs flex items-center justify-center z-50">
                  <div className="flex items-center gap-2 bg-slate-900 border border-slate-700 px-4 py-2 rounded-xl text-white text-xs font-semibold shadow-lg">
                    <LuLoader className="w-4 h-4 animate-spin text-teal-400" />
                    <span>Rendering Page {currentPage}...</span>
                  </div>
                </div>
              )}

              <div
                ref={cropContainerRef}
                className="relative bg-white shadow-2xl rounded-sm ring-1 ring-slate-800/20 overflow-hidden"
              >
                <canvas ref={cropCanvasRef} className="block pointer-events-none" />

                {/* Darkened Semi-Transparent Backdrop Masks */}
                <div
                  className="absolute bg-slate-950/70 pointer-events-none"
                  style={{ top: 0, left: 0, width: "100%", height: `${cropBox.y}%` }}
                />
                <div
                  className="absolute bg-slate-950/70 pointer-events-none"
                  style={{ top: `${cropBox.y + cropBox.h}%`, left: 0, width: "100%", bottom: 0 }}
                />
                <div
                  className="absolute bg-slate-950/70 pointer-events-none"
                  style={{ top: `${cropBox.y}%`, left: 0, width: `${cropBox.x}%`, height: `${cropBox.h}%` }}
                />
                <div
                  className="absolute bg-slate-950/70 pointer-events-none"
                  style={{ top: `${cropBox.y}%`, left: `${cropBox.x + cropBox.w}%`, right: 0, height: `${cropBox.h}%` }}
                />

                {/* The Interactive Draggable & Resizable Crop Box */}
                <div
                  onPointerDown={(e) => onCropPointerDown(e, "move")}
                  className="absolute border-2 border-dashed border-teal-400 shadow-2xl cursor-move group select-none"
                  style={{
                    left: `${cropBox.x}%`,
                    top: `${cropBox.y}%`,
                    width: `${cropBox.w}%`,
                    height: `${cropBox.h}%`,
                  }}
                >
                  <div className="absolute inset-0 pointer-events-none grid grid-cols-3 grid-rows-3 opacity-30">
                    <div className="border-r border-b border-teal-200" />
                    <div className="border-r border-b border-teal-200" />
                    <div className="border-b border-teal-200" />
                    <div className="border-r border-b border-teal-200" />
                    <div className="border-r border-b border-teal-200" />
                    <div className="border-b border-teal-200" />
                    <div className="border-r border-teal-200" />
                    <div className="border-r border-teal-200" />
                    <div />
                  </div>

                  {/* Corner Handles */}
                  <div
                    onPointerDown={(e) => onCropPointerDown(e, "nw")}
                    className="absolute -top-2.5 -left-2.5 w-5 h-5 bg-white border-2 border-teal-500 rounded-sm cursor-nwse-resize shadow-md hover:scale-125 transition-transform"
                  />
                  <div
                    onPointerDown={(e) => onCropPointerDown(e, "ne")}
                    className="absolute -top-2.5 -right-2.5 w-5 h-5 bg-white border-2 border-teal-500 rounded-sm cursor-nesw-resize shadow-md hover:scale-125 transition-transform"
                  />
                  <div
                    onPointerDown={(e) => onCropPointerDown(e, "sw")}
                    className="absolute -bottom-2.5 -left-2.5 w-5 h-5 bg-white border-2 border-teal-500 rounded-sm cursor-nesw-resize shadow-md hover:scale-125 transition-transform"
                  />
                  <div
                    onPointerDown={(e) => onCropPointerDown(e, "se")}
                    className="absolute -bottom-2.5 -right-2.5 w-5 h-5 bg-white border-2 border-teal-500 rounded-sm cursor-nwse-resize shadow-md hover:scale-125 transition-transform"
                  />

                  {/* Edge Handles */}
                  <div
                    onPointerDown={(e) => onCropPointerDown(e, "n")}
                    className="absolute -top-2 left-1/2 -translate-x-1/2 w-8 h-3 bg-white border-2 border-teal-500 rounded-full cursor-ns-resize shadow-md hover:scale-110 transition-transform"
                  />
                  <div
                    onPointerDown={(e) => onCropPointerDown(e, "s")}
                    className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-8 h-3 bg-white border-2 border-teal-500 rounded-full cursor-ns-resize shadow-md hover:scale-110 transition-transform"
                  />
                  <div
                    onPointerDown={(e) => onCropPointerDown(e, "w")}
                    className="absolute -left-2 top-1/2 -translate-y-1/2 w-3 h-8 bg-white border-2 border-teal-500 rounded-full cursor-ew-resize shadow-md hover:scale-110 transition-transform"
                  />
                  <div
                    onPointerDown={(e) => onCropPointerDown(e, "e")}
                    className="absolute -right-2 top-1/2 -translate-y-1/2 w-3 h-8 bg-white border-2 border-teal-500 rounded-full cursor-ew-resize shadow-md hover:scale-110 transition-transform"
                  />

                  <div className="absolute top-2 left-2 bg-slate-900/90 text-teal-300 font-mono text-[10px] px-2 py-0.5 rounded shadow-md pointer-events-none border border-slate-700/80">
                    {Math.round(cropBox.w)}% &times; {Math.round(cropBox.h)}%
                  </div>
                </div>
              </div>
            </main>
          </div>
        </div>
      )}

      {/* 4. DEDICATED BROAD ANIMATED PAGE ROTATION STUDIO (For Rotate PDF) */}
      {selectedFile && tool.action === "rotate-pdf" && (
        <div className="w-full h-full max-w-[1580px] mx-auto bg-slate-900 rounded-3xl shadow-2xl border border-slate-700/60 overflow-hidden flex flex-col">
          <header className="h-16 bg-slate-900 border-b border-slate-800 px-6 flex items-center justify-between shrink-0 text-white">
            <div className="flex items-center gap-3 min-w-0">
              <span className="w-10 h-10 rounded-xl bg-sky-500 text-white flex items-center justify-center font-bold shadow-xs shrink-0">
                <LuRotateCw className="w-5 h-5" />
              </span>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-slate-100 truncate max-w-[200px] sm:max-w-xs">
                    {selectedFile.name}
                  </span>
                  <span className="text-[11px] text-slate-400 shrink-0">
                    ({formatFileSize(selectedFile.size)})
                  </span>
                </div>
                <div className="text-[11px] text-slate-400">
                  {pageCount} {pageCount === 1 ? "page" : "pages"} &bull; Click any page or use arrows under cards to rotate
                </div>
              </div>
              <button
                type="button"
                onClick={resetState}
                className="text-xs text-slate-400 hover:text-slate-200 hover:bg-slate-800 px-3 py-1.5 rounded-xl transition ml-2 shrink-0 hidden sm:inline-block"
              >
                Change PDF
              </button>
            </div>

            <div className="flex items-center gap-2 bg-slate-800/80 p-1.5 rounded-2xl border border-slate-700/60">
              <button
                type="button"
                onClick={() => rotateAll("ccw")}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-white rounded-xl text-xs font-semibold transition"
                title="Rotate All Pages Left 90°"
              >
                <LuRotateCcw className="w-4 h-4 text-sky-400" />
                <span className="hidden md:inline">Rotate All Left</span>
              </button>
              <button
                type="button"
                onClick={() => rotateAll("cw")}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-white rounded-xl text-xs font-semibold transition"
                title="Rotate All Pages Right 90°"
              >
                <LuRotateCw className="w-4 h-4 text-sky-400" />
                <span className="hidden md:inline">Rotate All Right</span>
              </button>
              <button
                type="button"
                onClick={() => setPageRotations({})}
                className="px-2.5 py-1.5 text-xs text-slate-400 hover:text-red-400 transition"
                title="Reset All Rotations"
              >
                Reset
              </button>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                disabled={status === "processing"}
                onClick={handleSaveChanges}
                className="px-5 py-2.5 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white rounded-xl text-xs font-bold shadow-lg transition flex items-center gap-2 disabled:opacity-50"
              >
                {status === "processing" ? (
                  <>
                    <LuLoader className="w-4 h-4 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <LuDownload className="w-4 h-4" />
                    <span>Save & Download Rotated PDF</span>
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 transition"
              >
                <LuX className="w-5 h-5" />
              </button>
            </div>
          </header>

          <div className="flex-1 overflow-y-auto p-6 sm:p-8 bg-slate-950/70">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
              {Array.from({ length: pageCount }).map((_, idx) => {
                const pNum = idx + 1;
                const thumb = pageThumbnails[pNum];
                const curRot = pageRotations[pNum] || 0;
                const normalizedRot = ((curRot % 360) + 360) % 360;

                return (
                  <div
                    key={pNum}
                    className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-3xl p-4 shadow-xl flex flex-col justify-between group transition-all duration-200"
                  >
                    <div className="flex items-center justify-between mb-3 px-1">
                      <span className="text-xs font-bold text-slate-300">Page {pNum}</span>
                      <span
                        className={`text-[11px] font-semibold px-2 py-0.5 rounded-full transition ${
                          normalizedRot !== 0
                            ? "bg-sky-500/20 text-sky-400 border border-sky-500/40"
                            : "bg-slate-800 text-slate-500"
                        }`}
                      >
                        {normalizedRot}°
                      </span>
                    </div>

                    <div
                      onClick={() => rotatePage(pNum, "cw")}
                      className="w-full aspect-[1/1.3] bg-slate-950/80 rounded-2xl p-4 flex items-center justify-center cursor-pointer overflow-hidden relative group/preview border border-slate-800/80 hover:border-sky-500/50 transition-colors"
                      title="Click page to rotate 90° clockwise"
                    >
                      <div
                        className="w-full h-full flex items-center justify-center transition-transform duration-300 ease-out"
                        style={{ transform: `rotate(${curRot}deg)` }}
                      >
                        {thumb ? (
                          <img
                            src={thumb}
                            alt={`Page ${pNum}`}
                            className="max-w-full max-h-full object-contain rounded-sm shadow-lg pointer-events-none select-none bg-white"
                          />
                        ) : (
                          <div className="text-slate-600 text-xs font-bold flex flex-col items-center gap-2">
                            <LuLoader className="w-5 h-5 animate-spin text-slate-500" />
                            <span>Loading page...</span>
                          </div>
                        )}
                      </div>

                      <div className="absolute inset-0 bg-sky-950/30 opacity-0 group-hover/preview:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                        <span className="bg-slate-900/90 text-white text-[11px] font-semibold px-3 py-1.5 rounded-xl shadow-lg border border-slate-700 flex items-center gap-1.5">
                          <LuRotateCw className="w-3.5 h-3.5 text-sky-400" />
                          Click to rotate
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 mt-4 pt-2 border-t border-slate-800">
                      <button
                        type="button"
                        onClick={() => rotatePage(pNum, "ccw")}
                        className="w-full py-2 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold transition flex items-center justify-center gap-1.5"
                      >
                        <LuRotateCcw className="w-3.5 h-3.5 text-sky-400" />
                        <span>Rotate Left</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => rotatePage(pNum, "cw")}
                        className="w-full py-2 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold transition flex items-center justify-center gap-1.5"
                      >
                        <LuRotateCw className="w-3.5 h-3.5 text-sky-400" />
                        <span>Rotate Right</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* 5. FULL MICROSOFT WORD-STYLE IN-PLACE DOCUMENT EDITOR (For Edit PDF, Add Text, etc.) */}
      {selectedFile &&
        tool.action !== "rotate-pdf" &&
        tool.action !== "crop-pdf" &&
        tool.action !== "page-numbers" && (
          <div className="w-full h-full max-w-[1680px] mx-auto bg-slate-900 rounded-2xl shadow-2xl border border-slate-700/60 overflow-hidden flex flex-col">
            {/* Top Header Bar */}
            <header className="h-14 bg-slate-900 border-b border-slate-800 px-4 flex items-center justify-between shrink-0 text-white">
              <div className="flex items-center gap-3 min-w-0">
                <span className={`w-8 h-8 rounded-lg ${tool.iconBg} text-white font-bold text-xs flex items-center justify-center shrink-0`}>
                  {tool.icon}
                </span>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs truncate max-w-[200px] sm:max-w-[320px] text-slate-100">
                      {selectedFile.name}
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium shrink-0">
                      ({formatFileSize(selectedFile.size)})
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-400">
                    {pageCount} {pageCount === 1 ? "page" : "pages"} &bull; In-Place PDF Document Editor
                  </div>
                </div>
                <button
                  type="button"
                  onClick={resetState}
                  className="text-[11px] font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800 px-2.5 py-1 rounded-lg transition shrink-0 ml-2"
                >
                  Change PDF
                </button>
              </div>

              {/* Page & Zoom Navigation */}
              <div className="flex items-center gap-3">
                <div className="flex items-center bg-slate-800 border border-slate-700/80 rounded-xl px-2 py-1 text-xs">
                  <button
                    type="button"
                    disabled={currentPage <= 1}
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    className="p-1 hover:text-blue-400 disabled:opacity-30 disabled:hover:text-white transition"
                    title="Previous Page"
                  >
                    <LuChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="px-2 text-slate-300 font-semibold text-[11px]">
                    {currentPage} / {pageCount}
                  </span>
                  <button
                    type="button"
                    disabled={currentPage >= pageCount}
                    onClick={() => setCurrentPage((p) => Math.min(pageCount, p + 1))}
                    className="p-1 hover:text-blue-400 disabled:opacity-30 disabled:hover:text-white transition"
                    title="Next Page"
                  >
                    <LuChevronRight className="w-4 h-4" />
                  </button>
                </div>

                <div className="hidden sm:flex items-center bg-slate-800 border border-slate-700/80 rounded-xl px-2 py-1 text-xs">
                  <button
                    type="button"
                    onClick={() => setZoomScale((z) => Math.max(0.6, z - 0.2))}
                    className="p-1 text-slate-400 hover:text-white transition"
                    title="Zoom Out"
                  >
                    <LuZoomOut className="w-3.5 h-3.5" />
                  </button>
                  <span className="px-2 text-slate-300 text-[11px] font-medium">
                    {Math.round(zoomScale * 100)}%
                  </span>
                  <button
                    type="button"
                    onClick={() => setZoomScale((z) => Math.min(2.5, z + 0.2))}
                    className="p-1 text-slate-400 hover:text-white transition"
                    title="Zoom In"
                  >
                    <LuZoomIn className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Actions: Save & Close */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={status === "processing"}
                  onClick={handleSaveChanges}
                  className="px-4 py-2 bg-gradient-to-r from-red-600 via-rose-600 to-pink-600 hover:from-red-500 hover:to-pink-500 text-white rounded-xl text-xs font-bold shadow-md hover:shadow-lg transition flex items-center gap-1.5 disabled:opacity-50"
                >
                  {status === "processing" ? (
                    <>
                      <LuLoader className="w-4 h-4 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <LuDownload className="w-4 h-4" />
                      <span>Save & Download PDF</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={onClose}
                  className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 transition"
                >
                  <LuX className="w-5 h-5" />
                </button>
              </div>
            </header>

            {/* Microsoft Word Ribbon Toolbar */}
            <div className="bg-slate-800/90 border-b border-slate-700/70 p-2 sm:px-4 flex flex-wrap items-center justify-between gap-3 text-white shrink-0">
              {/* Primary Actions: Add Text Button */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleAddNewText}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold shadow-sm transition"
                  title="Add a new custom text box"
                >
                  <LuPlus className="w-4 h-4" />
                  <span>Add New Text</span>
                </button>

                <div className="h-5 w-px bg-slate-700 mx-1 hidden sm:block" />

                {/* Selected Text Controls (When an existing or new text item is selected) */}
                {selectedTextItem ? (
                  <div className="flex items-center gap-2 bg-slate-900/80 px-3 py-1 rounded-xl border border-blue-500/50 shadow-sm animate-in fade-in duration-150">
                    <span className="text-[11px] font-semibold text-blue-400">Editing Text:</span>
                    <select
                      value={selectedTextItem.fontSize}
                      onChange={(e) => {
                        const val = parseInt(e.target.value, 10);
                        setTextItems((prev) =>
                          prev.map((t) => (t.id === selectedTextId ? { ...t, fontSize: val, isEdited: true } : t))
                        );
                      }}
                      className="bg-slate-800 border border-slate-700 rounded-lg px-2 py-0.5 text-xs text-white focus:outline-none"
                    >
                      <option value={10}>10 pt</option>
                      <option value={12}>12 pt</option>
                      <option value={14}>14 pt</option>
                      <option value={16}>16 pt</option>
                      <option value={18}>18 pt</option>
                      <option value={22}>22 pt</option>
                      <option value={28}>28 pt</option>
                      <option value={36}>36 pt</option>
                    </select>

                    <div className="flex items-center gap-1">
                      {[
                        { name: "Black", color: "#000000" },
                        { name: "Blue", color: "#2563eb" },
                        { name: "Red", color: "#dc2626" },
                        { name: "Green", color: "#16a34a" },
                      ].map((c) => (
                        <button
                          key={c.color}
                          type="button"
                          onClick={() => {
                            setTextItems((prev) =>
                              prev.map((t) => (t.id === selectedTextId ? { ...t, color: c.color, isEdited: true } : t))
                            );
                          }}
                          className={`w-4 h-4 rounded-full border ${
                            selectedTextItem.color === c.color ? "ring-2 ring-white scale-110" : "border-slate-600"
                          }`}
                          style={{ backgroundColor: c.color }}
                          title={c.name}
                        />
                      ))}
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setTextItems((prev) =>
                          prev.map((t) => (t.id === selectedTextId ? { ...t, isBold: !t.isBold, isEdited: true } : t))
                        );
                      }}
                      className={`px-2 py-0.5 rounded-lg text-xs font-bold transition ${
                        selectedTextItem.isBold ? "bg-blue-600 text-white" : "bg-slate-800 text-slate-400 hover:text-white"
                      }`}
                      title="Bold"
                    >
                      B
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        if (selectedTextId) handleDeleteText(selectedTextId);
                      }}
                      className="flex items-center gap-1 text-red-400 hover:text-red-200 bg-red-950/40 hover:bg-red-900/60 px-2 py-1 border border-red-800/60 rounded-lg transition text-xs font-bold"
                      title="Delete text from document (Redact)"
                    >
                      <LuTrash2 className="w-3.5 h-3.5" />
                      <span>Delete</span>
                    </button>

                    {selectedTextItem.isEdited && !selectedTextItem.isNew && (
                      <button
                        type="button"
                        onClick={() => {
                          setTextItems((prev) =>
                            prev.map((t) =>
                              t.id === selectedTextId
                                ? { ...t, text: t.originalText, isEdited: false, isDeleted: false }
                                : t
                            )
                          );
                        }}
                        className="text-slate-400 hover:text-white p-1 hover:bg-slate-800 rounded-lg transition"
                        title="Revert to original text"
                      >
                        <LuUndo2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ) : activeRibbonTool === "draw" || activeRibbonTool === "eraser" ? (
                  <div className="flex items-center gap-2 bg-slate-900/90 px-2.5 py-1 rounded-xl border border-slate-700/80 shadow-xs animate-in fade-in duration-150">
                    <div className="flex items-center gap-0.5 bg-slate-800 p-0.5 rounded-lg">
                      <button
                        type="button"
                        onClick={() => {
                          setActiveRibbonTool("draw");
                          setDrawMode("pen");
                        }}
                        className={`flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-semibold transition ${
                          drawMode === "pen" && activeRibbonTool === "draw"
                            ? "bg-blue-600 text-white shadow-xs"
                            : "text-slate-400 hover:text-white"
                        }`}
                      >
                        <LuPencil className="w-3 h-3" />
                        <span>Pen</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setActiveRibbonTool("eraser");
                          setDrawMode("eraser");
                        }}
                        className={`flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-semibold transition ${
                          drawMode === "eraser" || activeRibbonTool === "eraser"
                            ? "bg-rose-600 text-white shadow-xs"
                            : "text-slate-400 hover:text-white"
                        }`}
                      >
                        <LuEraser className="w-3 h-3" />
                        <span>Eraser</span>
                      </button>
                    </div>

                    {drawMode === "pen" && activeRibbonTool === "draw" ? (
                      <>
                        <div className="h-4 w-px bg-slate-700" />
                        <span className="text-[11px] text-slate-400 font-medium">Color:</span>
                        <div className="flex items-center gap-1">
                          {[
                            { name: "Blue", color: "#2563eb" },
                            { name: "Black", color: "#000000" },
                            { name: "Red", color: "#dc2626" },
                            { name: "Green", color: "#16a34a" },
                          ].map((c) => (
                            <button
                              key={c.color}
                              type="button"
                              onClick={() => setDrawColor(c.color)}
                              className={`w-4 h-4 rounded-full border ${
                                drawColor === c.color ? "ring-2 ring-white scale-110" : "border-slate-600"
                              }`}
                              style={{ backgroundColor: c.color }}
                              title={c.name}
                            />
                          ))}
                        </div>

                        <div className="h-4 w-px bg-slate-700" />
                        <span className="text-[11px] text-slate-400 font-medium">Size:</span>
                        <div className="flex items-center gap-1">
                          {[
                            { label: "Fine", width: 2 },
                            { label: "Med", width: 4 },
                            { label: "Bold", width: 8 },
                          ].map((s) => (
                            <button
                              key={s.width}
                              type="button"
                              onClick={() => setDrawWidth(s.width)}
                              className={`px-1.5 py-0.5 rounded text-[10px] font-bold transition ${
                                drawWidth === s.width ? "bg-blue-600 text-white" : "bg-slate-800 text-slate-400 hover:text-white"
                              }`}
                            >
                              {s.label}
                            </button>
                          ))}
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="h-4 w-px bg-slate-700" />
                        <span className="text-[11px] text-slate-400 font-medium">Eraser Size:</span>
                        <div className="flex items-center gap-1">
                          {[
                            { label: "Small", width: 14 },
                            { label: "Medium", width: 24 },
                            { label: "Large", width: 40 },
                          ].map((s) => (
                            <button
                              key={s.width}
                              type="button"
                              onClick={() => setEraserWidth(s.width)}
                              className={`px-1.5 py-0.5 rounded text-[10px] font-bold transition ${
                                eraserWidth === s.width ? "bg-rose-600 text-white" : "bg-slate-800 text-slate-400 hover:text-white"
                              }`}
                            >
                              {s.label}
                            </button>
                          ))}
                        </div>
                      </>
                    )}

                    <div className="h-4 w-px bg-slate-700" />
                    <button
                      type="button"
                      onClick={handleClearCurrentPageDrawings}
                      className="flex items-center gap-1 px-2 py-0.5 rounded-lg text-[11px] font-semibold text-red-400 hover:text-red-300 hover:bg-red-950/40 border border-red-800/40 transition"
                      title="Clear all ink drawings on this page"
                    >
                      <LuTrash2 className="w-3 h-3" />
                      <span>Clear Page Ink</span>
                    </button>
                  </div>
                ) : activeRibbonTool === "highlight" ? (
                  <div className="flex items-center gap-2 bg-slate-900/90 px-2.5 py-1 rounded-xl border border-slate-700/80 shadow-xs animate-in fade-in duration-150">
                    <span className="text-[11px] text-amber-400 font-semibold flex items-center gap-1">
                      <LuHighlighter className="w-3.5 h-3.5" />
                      <span>Highlighter</span>
                    </span>

                    <div className="h-4 w-px bg-slate-700" />
                    <span className="text-[11px] text-slate-400 font-medium">Color:</span>
                    <div className="flex items-center gap-1">
                      {[
                        { name: "Yellow", color: "rgba(250, 204, 21, 0.25)", swatch: "#facc15" },
                        { name: "Green", color: "rgba(74, 222, 128, 0.25)", swatch: "#4ade80" },
                        { name: "Cyan", color: "rgba(56, 189, 248, 0.25)", swatch: "#38bdf8" },
                        { name: "Pink", color: "rgba(244, 114, 182, 0.25)", swatch: "#f472b6" },
                        { name: "Orange", color: "rgba(251, 146, 60, 0.25)", swatch: "#fb923c" },
                      ].map((c) => (
                        <button
                          key={c.name}
                          type="button"
                          onClick={() => setHighlightColor(c.color)}
                          className={`w-4 h-4 rounded-full border ${
                            highlightColor === c.color ? "ring-2 ring-white scale-110" : "border-slate-600"
                          }`}
                          style={{ backgroundColor: c.swatch }}
                          title={`${c.name} Highlighter`}
                        />
                      ))}
                    </div>

                    <div className="h-4 w-px bg-slate-700" />
                    <span className="text-[11px] text-slate-400 font-medium">Size:</span>
                    <div className="flex items-center gap-1">
                      {[
                        { label: "16px", width: 16 },
                        { label: "24px", width: 24 },
                        { label: "32px", width: 32 },
                      ].map((s) => (
                        <button
                          key={s.width}
                          type="button"
                          onClick={() => setHighlightWidth(s.width)}
                          className={`px-1.5 py-0.5 rounded text-[10px] font-bold transition ${
                            highlightWidth === s.width ? "bg-amber-600 text-white" : "bg-slate-800 text-slate-400 hover:text-white"
                          }`}
                        >
                          {s.label}
                        </button>
                      ))}
                    </div>

                    <div className="h-4 w-px bg-slate-700" />
                    <button
                      type="button"
                      onClick={handleClearCurrentPageDrawings}
                      className="flex items-center gap-1 px-2 py-0.5 rounded-lg text-[11px] font-semibold text-red-400 hover:text-red-300 hover:bg-red-950/40 border border-red-800/40 transition"
                      title="Clear all ink & highlights on this page"
                    >
                      <LuTrash2 className="w-3 h-3" />
                      <span>Clear Page Ink</span>
                    </button>
                  </div>
                ) : activeRibbonTool === "watermark" ? (
                  <div className="flex items-center gap-2 bg-slate-900/95 px-3 py-1 rounded-xl border border-amber-500/50 shadow-sm animate-in fade-in duration-150 flex-wrap">
                    <div className="flex items-center gap-1.5">
                      <label className="flex items-center gap-1 cursor-pointer select-none text-xs font-bold text-amber-400">
                        <input
                          type="checkbox"
                          checked={watermarkEnabled}
                          onChange={(e) => setWatermarkEnabled(e.target.checked)}
                          className="rounded border-slate-700 text-amber-500 focus:ring-0 w-3.5 h-3.5"
                        />
                        <span>Watermark</span>
                      </label>
                    </div>

                    {watermarkEnabled && (
                      <>
                        <div className="h-4 w-px bg-slate-700 mx-0.5" />
                        
                        {/* Presets */}
                        <div className="flex items-center gap-1">
                          {["CONFIDENTIAL", "DRAFT", "DO NOT COPY", "APPROVED", "SAMPLE"].map((preset) => (
                            <button
                              key={preset}
                              type="button"
                              onClick={() => setWatermarkText(preset)}
                              className={`px-1.5 py-0.5 rounded text-[10px] font-bold transition ${
                                watermarkText === preset
                                  ? "bg-amber-600 text-white shadow-xs"
                                  : "bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700"
                              }`}
                            >
                              {preset}
                            </button>
                          ))}
                        </div>

                        <div className="h-4 w-px bg-slate-700 mx-0.5" />

                        {/* Custom Text */}
                        <input
                          type="text"
                          value={watermarkText}
                          onChange={(e) => setWatermarkText(e.target.value)}
                          placeholder="Custom text..."
                          className="bg-slate-800 border border-slate-700 rounded-lg px-2 py-0.5 text-xs text-white focus:outline-none w-28 focus:border-amber-500"
                        />

                        {/* Color */}
                        <select
                          value={watermarkColor}
                          onChange={(e) => setWatermarkColor(e.target.value as any)}
                          className="bg-slate-800 border border-slate-700 rounded-lg px-1.5 py-0.5 text-xs text-white focus:outline-none"
                        >
                          <option value="grey">Grey</option>
                          <option value="red">Red</option>
                          <option value="blue">Blue</option>
                          <option value="amber">Amber</option>
                          <option value="green">Green</option>
                        </select>

                        {/* Opacity */}
                        <select
                          value={watermarkOpacity}
                          onChange={(e) => setWatermarkOpacity(parseFloat(e.target.value))}
                          className="bg-slate-800 border border-slate-700 rounded-lg px-1.5 py-0.5 text-xs text-white focus:outline-none"
                        >
                          <option value={0.1}>10% Opacity</option>
                          <option value={0.2}>20% Opacity</option>
                          <option value={0.35}>35% Opacity</option>
                          <option value={0.5}>50% Opacity</option>
                        </select>

                        {/* Layout */}
                        <button
                          type="button"
                          onClick={() => setWatermarkAngle(watermarkAngle === "diagonal" ? "horizontal" : "diagonal")}
                          className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded text-[10px] font-semibold transition"
                          title="Toggle diagonal vs horizontal"
                        >
                          {watermarkAngle === "diagonal" ? "Diagonal (-45°)" : "Horizontal (0°)"}
                        </button>

                        <div className="h-4 w-px bg-slate-700 mx-0.5" />

                        {/* Remove Watermark Button */}
                        <button
                          type="button"
                          onClick={() => {
                            setWatermarkEnabled(false);
                            setWatermarkText("");
                          }}
                          className="flex items-center gap-1 px-2 py-0.5 rounded-lg text-[11px] font-semibold text-red-400 hover:text-red-300 hover:bg-red-950/40 border border-red-800/40 transition"
                          title="Remove watermark completely"
                        >
                          <LuTrash2 className="w-3 h-3" />
                          <span>Remove</span>
                        </button>
                      </>
                    )}
                  </div>
                ) : (
                  <span className="text-[11px] text-slate-400 hidden sm:inline">
                    &bull; Click any text on the page below to edit or drag it directly!
                  </span>
                )}
              </div>

              {/* Secondary Tools: Draw, Eraser, Highlight, Watermark */}
              <div className="flex items-center gap-1.5 overflow-x-auto">
                <button
                  type="button"
                  onClick={() => {
                    setActiveRibbonTool(activeRibbonTool === "draw" && drawMode === "pen" ? "text" : "draw");
                    setDrawMode("pen");
                    setSelectedTextId(null);
                  }}
                  className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition ${
                    activeRibbonTool === "draw" && drawMode === "pen"
                      ? "bg-blue-600 text-white shadow-xs"
                      : "text-slate-400 hover:text-white hover:bg-slate-800"
                  }`}
                  title="Draw / Pen Signature"
                >
                  <LuPencil className="w-3.5 h-3.5" />
                  <span>Pen</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setActiveRibbonTool(activeRibbonTool === "eraser" || (activeRibbonTool === "draw" && drawMode === "eraser") ? "text" : "eraser");
                    setDrawMode("eraser");
                    setSelectedTextId(null);
                  }}
                  className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition ${
                    activeRibbonTool === "eraser" || (activeRibbonTool === "draw" && drawMode === "eraser")
                      ? "bg-rose-600 text-white shadow-xs"
                      : "text-slate-400 hover:text-white hover:bg-slate-800"
                  }`}
                  title="Eraser (Erase drawing / pen ink)"
                >
                  <LuEraser className="w-3.5 h-3.5" />
                  <span>Eraser</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setActiveRibbonTool(activeRibbonTool === "highlight" ? "text" : "highlight");
                    setSelectedTextId(null);
                  }}
                  className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition ${
                    activeRibbonTool === "highlight"
                      ? "bg-blue-600 text-white shadow-xs"
                      : "text-slate-400 hover:text-white hover:bg-slate-800"
                  }`}
                  title="Highlighter"
                >
                  <LuHighlighter className="w-3.5 h-3.5" />
                  <span>Highlight</span>
                </button>

                <button
                  type="button"
                  onClick={() => stampImageInputRef.current?.click()}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition"
                  title="Insert Image Stamp"
                >
                  <LuImage className="w-3.5 h-3.5" />
                  <span>Add Image</span>
                  <input
                    ref={stampImageInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    className="hidden"
                    onChange={handleStampUpload}
                  />
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (activeRibbonTool === "watermark") {
                      setActiveRibbonTool("text");
                    } else {
                      setActiveRibbonTool("watermark");
                      setWatermarkEnabled(true);
                    }
                    setSelectedTextId(null);
                  }}
                  className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition ${
                    activeRibbonTool === "watermark" || watermarkEnabled
                      ? "bg-amber-600 text-white shadow-xs"
                      : "text-slate-400 hover:text-white hover:bg-slate-800"
                  }`}
                  title="Watermark Options & Presets"
                >
                  <LuDroplets className="w-3.5 h-3.5" />
                  <span>Watermark</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    rotatePage(currentPage, "cw");
                  }}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition"
                  title="Rotate Current Page 90° Clockwise"
                >
                  <LuRotateCw className="w-3.5 h-3.5 text-sky-400" />
                  <span>Rotate 90°</span>
                </button>
              </div>
            </div>

            {/* Main Document Workspace Area */}
            <div className="flex-1 flex overflow-hidden bg-slate-950/80">
              {/* Left Page Thumbnails Strip */}
              <aside className="w-48 bg-slate-900/90 border-r border-slate-800/80 p-3 overflow-y-auto space-y-3 shrink-0">
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-1">
                  Pages ({pageCount})
                </div>
                <div className="space-y-2">
                  {Array.from({ length: pageCount }).map((_, idx) => {
                    const pNum = idx + 1;
                    const thumb = pageThumbnails[pNum];
                    const isActive = currentPage === pNum;
                    return (
                      <div
                        key={pNum}
                        onClick={() => {
                          setCurrentPage(pNum);
                          setSelectedTextId(null);
                        }}
                        className={`group relative p-2 rounded-xl cursor-pointer transition flex flex-col items-center border ${
                          isActive
                            ? "bg-blue-600/15 border-blue-500 shadow-md ring-1 ring-blue-500/40"
                            : "bg-slate-800/50 border-slate-700/60 hover:bg-slate-800 hover:border-slate-600"
                        }`}
                      >
                        <div className="w-full aspect-[1/1.4] bg-white rounded-md overflow-hidden flex items-center justify-center shadow-xs relative">
                          {thumb ? (
                            <img
                              src={thumb}
                              alt={`Page ${pNum}`}
                              className="w-full h-full object-contain pointer-events-none"
                            />
                          ) : (
                            <span className="text-slate-400 text-xs font-bold">#{pNum}</span>
                          )}
                        </div>
                        <div className="mt-1.5 flex items-center justify-between w-full px-1">
                          <span className={`text-[10px] font-bold ${isActive ? "text-blue-400" : "text-slate-400"}`}>
                            Page {pNum}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </aside>

              {/* Center: In-Place Editable PDF Page View */}
              <main
                ref={canvasContainerRef}
                onClick={handleBackgroundClick}
                className="flex-1 overflow-auto bg-slate-950/50 p-4 sm:p-8 flex justify-center items-start relative"
              >
                {isLoadingPage && (
                  <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-2xs flex items-center justify-center z-50">
                    <div className="flex items-center gap-2 bg-slate-900 border border-slate-700 px-4 py-2 rounded-xl text-white text-xs font-semibold shadow-lg">
                      <LuLoader className="w-4 h-4 animate-spin text-blue-400" />
                      <span>Rendering Page {currentPage}...</span>
                    </div>
                  </div>
                )}

                {/* White Sheet Paper Container */}
                <div
                  className="relative bg-white shadow-2xl rounded-sm transition-transform duration-150 ring-1 ring-slate-800/20"
                  style={{
                    cursor:
                      activeRibbonTool === "eraser" || (activeRibbonTool === "draw" && drawMode === "eraser")
                        ? "cell"
                        : activeRibbonTool === "draw" || activeRibbonTool === "highlight"
                        ? "crosshair"
                        : "default",
                  }}
                >
                  {/* 1. Underlying High-Res PDF Page Canvas */}
                  <canvas ref={mainCanvasRef} className="block pointer-events-none" />

                  {/* 2. Drawing / Highlighting Overlay Canvas with Multiply blend mode */}
                  <canvas
                    ref={drawingCanvasRef}
                    onPointerDown={handlePointerDown}
                    onPointerMove={handlePointerMove}
                    onPointerUp={handlePointerUp}
                    style={{ mixBlendMode: "multiply" }}
                    className={`absolute inset-0 ${
                      activeRibbonTool === "draw" || activeRibbonTool === "eraser" || activeRibbonTool === "highlight"
                        ? "pointer-events-auto z-20"
                        : "pointer-events-none z-10"
                    }`}
                  />

                  {/* 3. Watermark Preview Layer */}
                  {watermarkEnabled && watermarkText.trim() && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden z-10">
                      <div
                        className={`font-extrabold tracking-widest uppercase select-none transform ${
                          watermarkAngle === "diagonal" ? "rotate-[-45deg]" : "rotate-0"
                        }`}
                        style={{
                          fontSize: `${Math.round(watermarkSize * zoomScale)}px`,
                          color:
                            watermarkColor === "red"
                              ? `rgba(220, 38, 38, ${watermarkOpacity})`
                              : watermarkColor === "blue"
                              ? `rgba(37, 99, 235, ${watermarkOpacity})`
                              : watermarkColor === "amber"
                              ? `rgba(217, 119, 6, ${watermarkOpacity})`
                              : watermarkColor === "green"
                              ? `rgba(22, 163, 74, ${watermarkOpacity})`
                              : `rgba(100, 116, 139, ${watermarkOpacity})`,
                        }}
                      >
                        {watermarkText}
                      </div>
                    </div>
                  )}

                  {/* 4. White-out Redaction Patches for Deleted Items */}
                  {textItems
                    .filter((t) => t.page === currentPage && t.isDeleted && !t.isNew)
                    .map((item) => (
                      <div
                        key={`del-${item.id}`}
                        className="absolute bg-white pointer-events-none z-10"
                        style={{
                          left: `${item.xPercent - 0.2}%`,
                          top: `${item.yPercent - 0.2}%`,
                          width: `${(item.pdfW / (pageDimensions[currentPage]?.width || 1)) * 100 + 0.8}%`,
                          height: `${(item.pdfH / (pageDimensions[currentPage]?.height || 1)) * 100 + 0.8}%`,
                        }}
                      />
                    ))}

                  {/* 5. Real In-Place Interactive Document Text Elements */}
                  {textItems
                    .filter((t) => t.page === currentPage && !t.isDeleted)
                    .map((item) => {
                      const isSelected = selectedTextId === item.id;
                      const isEdited = item.isEdited;

                      return (
                        <div
                          key={item.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedTextId(item.id);
                          }}
                          className={`absolute transition-all duration-150 z-20 select-text ${
                            isSelected
                              ? "ring-2 ring-blue-500 bg-white shadow-xl z-30 rounded px-1"
                              : isEdited
                              ? "bg-white shadow-xs rounded px-0.5 hover:ring-1 hover:ring-blue-400"
                              : "hover:bg-blue-100/50 hover:outline hover:outline-1 hover:outline-blue-400 rounded px-0.5 cursor-pointer"
                          }`}
                          style={{
                            left: `${item.xPercent}%`,
                            top: `${item.yPercent}%`,
                            lineHeight: 1.1,
                          }}
                        >
                          {isSelected ? (
                            <div className="relative">
                              {/* Floating Action Bar directly attached to selected text item */}
                              <div className="absolute -top-9 left-0 flex items-center gap-1.5 bg-slate-900/95 text-white rounded-lg px-2 py-1 shadow-2xl border border-slate-700 z-50 text-[11px] whitespace-nowrap animate-in fade-in duration-100 select-none">
                                <span
                                  onPointerDown={(e) => handleTextDragStart(e, item)}
                                  className="cursor-move text-slate-400 hover:text-white p-0.5 rounded transition flex items-center gap-1"
                                  title="Drag to move text"
                                >
                                  <LuMove className="w-3.5 h-3.5" />
                                </span>

                                <div className="w-px h-3.5 bg-slate-700" />

                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteText(item.id);
                                  }}
                                  className="flex items-center gap-1 text-red-400 hover:text-red-200 hover:bg-red-950/80 px-1.5 py-0.5 rounded transition font-bold"
                                  title="Delete text from document (Redact)"
                                >
                                  <LuTrash2 className="w-3.5 h-3.5" />
                                  <span>Delete</span>
                                </button>

                                {item.isEdited && !item.isNew && (
                                  <>
                                    <div className="w-px h-3.5 bg-slate-700" />
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleRevertText(item.id);
                                      }}
                                      className="flex items-center gap-1 text-slate-300 hover:text-white px-1.5 py-0.5 rounded transition"
                                      title="Revert to original text"
                                    >
                                      <LuUndo2 className="w-3.5 h-3.5" />
                                      <span>Reset</span>
                                    </button>
                                  </>
                                )}

                                <div className="w-px h-3.5 bg-slate-700" />

                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedTextId(null);
                                  }}
                                  className="text-emerald-400 hover:text-emerald-300 p-0.5 rounded transition flex items-center gap-0.5 font-semibold"
                                  title="Done editing"
                                >
                                  <LuCheck className="w-3.5 h-3.5" />
                                  <span>Done</span>
                                </button>
                              </div>

                              {/* Inline Editable Text Input */}
                              <div className="flex items-center">
                                <input
                                  type="text"
                                  value={item.text}
                                  autoFocus
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    setTextItems((prev) =>
                                      prev.map((t) => (t.id === item.id ? { ...t, text: val, isEdited: true } : t))
                                    );
                                  }}
                                  onKeyDown={(e) => {
                                    if (e.key === "Enter" || e.key === "Escape") {
                                      setSelectedTextId(null);
                                    }
                                  }}
                                  className="bg-transparent border-none outline-none focus:ring-0 p-0 text-slate-900 leading-tight"
                                  style={{
                                    fontSize: `${Math.round(item.fontSize * zoomScale)}px`,
                                    color: item.color,
                                    fontWeight: item.isBold ? "bold" : "normal",
                                    minWidth: "60px",
                                    width: `${Math.max(60, item.text.length * (item.fontSize * zoomScale * 0.65))}px`,
                                  }}
                                />
                              </div>
                            </div>
                          ) : (
                            <span
                              style={{
                                fontSize: `${Math.round(item.fontSize * zoomScale)}px`,
                                color: item.color,
                                fontWeight: item.isBold ? "bold" : "normal",
                                opacity: isEdited ? 1 : 0.01, // If unedited, sits transparently over the sharp canvas text!
                              }}
                            >
                              {item.text}
                            </span>
                          )}
                        </div>
                      );
                    })}

                  {/* 6. Placed Image Stamps */}
                  {imageItems
                    .filter((img) => img.page === currentPage)
                    .map((img) => {
                      const isSelected = selectedImageId === img.id;
                      return (
                        <div
                          key={img.id}
                          onPointerDown={(e) => handleImageDragStart(e, img)}
                          className={`absolute group select-none z-30 cursor-move ${
                            isSelected
                              ? "ring-2 ring-blue-500 shadow-2xl"
                              : "hover:ring-2 hover:ring-blue-400/80 shadow-md"
                          }`}
                          style={{
                            left: `${img.xPercent}%`,
                            top: `${img.yPercent}%`,
                            width: `${img.widthPercent}%`,
                            height: `${img.heightPercent}%`,
                          }}
                        >
                          <img
                            src={img.dataUrl}
                            alt="Stamp"
                            className="w-full h-full object-contain pointer-events-none select-none"
                          />

                          {/* Selected Controls: Move badge, Delete button & Corner Resize Handle */}
                          {isSelected && (
                            <>
                              {/* Top-Right Delete button */}
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setImageItems((prev) => prev.filter((i) => i.id !== img.id));
                                  setSelectedImageId(null);
                                }}
                                className="absolute -top-3.5 -right-3.5 w-7 h-7 bg-red-600 hover:bg-red-700 text-white rounded-full flex items-center justify-center shadow-xl hover:scale-110 transition cursor-pointer z-40 border-2 border-white"
                                title="Delete Image"
                              >
                                <LuTrash2 className="w-3.5 h-3.5" />
                              </button>

                              {/* Top-Left Drag to Move Badge */}
                              <div className="absolute -top-7 left-0 bg-slate-900/90 text-white text-[10px] font-semibold px-2 py-0.5 rounded shadow-lg border border-slate-700 flex items-center gap-1 pointer-events-none whitespace-nowrap">
                                <LuMove className="w-3 h-3 text-blue-400" />
                                <span>Drag to move</span>
                              </div>

                              {/* Bottom-Right Corner Resize Handle */}
                              <div
                                onPointerDown={(e) => handleImageResizeStart(e, img)}
                                className="absolute -bottom-2 -right-2 w-4 h-4 bg-white border-2 border-blue-600 rounded-xs cursor-nwse-resize shadow-lg hover:scale-125 transition z-40"
                                title="Drag to resize image"
                              />
                            </>
                          )}
                        </div>
                      );
                    })}
                </div>
              </main>
            </div>
          </div>
        )}
    </div>,
    document.body
  );
}
