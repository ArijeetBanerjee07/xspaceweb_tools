"use client";

import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import JSZip from "jszip";
import { PDFDocument, degrees } from "pdf-lib";
import {
  LuUpload,
  LuFileText,
  LuFiles,
  LuScissors,
  LuTrash2,
  LuArrowLeftRight,
  LuPlus,
  LuCopy,
  LuFolderTree,
  LuRotateCw,
  LuChevronLeft,
  LuChevronRight,
  LuDownload,
  LuX,
  LuLoader,
  LuCircleCheck,
  LuCircleAlert,
  LuRefreshCw,
  LuCheck,
} from "react-icons/lu";

export type OrganizeAction =
  | "merge-pdf"
  | "split-pdf"
  | "extract-pages"
  | "delete-pages"
  | "reorder-pages"
  | "insert-pages"
  | "duplicate-pages"
  | "organize-pdf";

export interface OrganizeToolConfig {
  id: string;
  action: OrganizeAction;
  title: string;
  desc: string;
  icon: React.ReactNode;
  iconBg: string;
  borderHover: string;
  gradientFlare: string;
}

interface OrganizeModalProps {
  isOpen: boolean;
  onClose: () => void;
  tool: OrganizeToolConfig | null;
}

interface PageItem {
  id: string;
  originalPage: number;
  rotation: number;
}

export function OrganizeModal({ isOpen, onClose, tool }: OrganizeModalProps) {
  const [mounted, setMounted] = useState(false);
  const [status, setStatus] = useState<"idle" | "processing" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Single file state
  const [primaryFile, setPrimaryFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState<number | null>(null);

  // Page thumbnails cache
  const [pageThumbnails, setPageThumbnails] = useState<Record<number, string>>({});
  const [isLoadingThumbnails, setIsLoadingThumbnails] = useState<boolean>(false);

  // Multi-file state (Merge PDF)
  const [mergeFiles, setMergeFiles] = useState<
    Array<{ id: string; file: File; pageCount?: number; thumbnail?: string }>
  >([]);

  // Insert Pages second file state
  const [secondFile, setSecondFile] = useState<File | null>(null);
  const [secondPageCount, setSecondPageCount] = useState<number | null>(null);
  const [secondThumbnail, setSecondThumbnail] = useState<string | null>(null);
  const [insertPosition, setInsertPosition] = useState<"start" | "end" | "after">("end");
  const [insertAfterPage, setInsertAfterPage] = useState<number>(1);

  // Split PDF state
  const [splitMode, setSplitMode] = useState<"individual" | "range">("individual");
  const [splitRangeText, setSplitRangeText] = useState<string>("1-2, 3-5");

  // Page Selection state (Extract / Delete / Duplicate)
  const [selectedPages, setSelectedPages] = useState<Set<number>>(new Set());
  const [customRangeInput, setCustomRangeInput] = useState<string>("");

  // Reorder & Organize state
  const [pagesList, setPagesList] = useState<PageItem[]>([]);

  // Duplicate state
  const [duplicateCopies, setDuplicateCopies] = useState<number>(1);

  // Output results
  const [outputFileName, setOutputFileName] = useState<string>("");
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [downloadFileName, setDownloadFileName] = useState<string | null>(null);
  const [resultSummary, setResultSummary] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const addMoreMergeInputRef = useRef<HTMLInputElement>(null);
  const secondFileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const resetState = () => {
    if (downloadUrl) {
      URL.revokeObjectURL(downloadUrl);
    }
    setPrimaryFile(null);
    setPageCount(null);
    setPageThumbnails({});
    setIsLoadingThumbnails(false);
    setMergeFiles([]);
    setSecondFile(null);
    setSecondPageCount(null);
    setSecondThumbnail(null);
    setInsertPosition("end");
    setInsertAfterPage(1);
    setSplitMode("individual");
    setSplitRangeText("");
    setSelectedPages(new Set());
    setCustomRangeInput("");
    setPagesList([]);
    setDuplicateCopies(1);
    setOutputFileName("");
    setDownloadUrl(null);
    setDownloadFileName(null);
    setResultSummary(null);
    setStatus("idle");
    setErrorMessage(null);
    setIsDragging(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
    if (addMoreMergeInputRef.current) addMoreMergeInputRef.current.value = "";
    if (secondFileInputRef.current) secondFileInputRef.current.value = "";
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

  const isMerge = tool.action === "merge-pdf";
  const isInsert = tool.action === "insert-pages";

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  // Helper to load and detect page count using pdf-lib
  const detectPdfPages = async (file: File): Promise<number> => {
    const buf = await file.arrayBuffer();
    const doc = await PDFDocument.load(buf, { ignoreEncryption: true });
    return doc.getPageCount();
  };

  // Render high quality page thumbnails using pdfjs-dist in the browser
  const generateThumbnails = async (file: File, totalPages: number) => {
    setIsLoadingThumbnails(true);
    try {
      const pdfjs = await import("pdfjs-dist");
      if (!pdfjs.GlobalWorkerOptions.workerSrc) {
        pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
      }

      const arrayBuffer = await file.arrayBuffer();
      const bufferCopy = arrayBuffer.slice(0);
      const loadingTask = pdfjs.getDocument({
        data: new Uint8Array(bufferCopy),
        cMapUrl: "https://unpkg.com/pdfjs-dist@5.4.296/cmaps/",
        cMapPacked: true,
      });

      const pdf = await loadingTask.promise;
      const count = Math.min(totalPages, pdf.numPages);

      for (let pageNum = 1; pageNum <= count; pageNum++) {
        try {
          const page = await pdf.getPage(pageNum);
          const originalViewport = page.getViewport({ scale: 1 });
          // Scale to ~180px width for fast and crisp thumbnail display
          const scale = Math.min(2, 180 / originalViewport.width);
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

  const renderSingleThumbnail = async (file: File): Promise<string | undefined> => {
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
      const page = await pdf.getPage(1);
      const originalViewport = page.getViewport({ scale: 1 });
      const scale = Math.min(2, 120 / originalViewport.width);
      const viewport = page.getViewport({ scale });
      const canvas = document.createElement("canvas");
      canvas.width = Math.floor(viewport.width);
      canvas.height = Math.floor(viewport.height);
      const ctx = canvas.getContext("2d");
      if (ctx) {
        await page.render({ canvasContext: ctx, viewport, canvas }).promise;
        return canvas.toDataURL("image/jpeg", 0.8);
      }
    } catch {
      return undefined;
    }
  };

  // Handle file uploads
  const handleFileUpload = async (files: FileList | null, isAppendMerge: boolean = false) => {
    if (!files || files.length === 0) return;
    setStatus("idle");
    setErrorMessage(null);

    const pdfFiles = Array.from(files).filter(
      (f) => f.type === "application/pdf" || f.name.toLowerCase().endsWith(".pdf")
    );

    if (pdfFiles.length === 0) {
      setErrorMessage("Please select valid PDF documents (.pdf).");
      return;
    }

    try {
      if (isMerge) {
        const fileItems = await Promise.all(
          pdfFiles.map(async (file, idx) => {
            let count = 0;
            let thumb: string | undefined;
            try {
              count = await detectPdfPages(file);
              thumb = await renderSingleThumbnail(file);
            } catch {
              count = 1;
            }
            return {
              id: `${Date.now()}_${Math.random()}_${idx}`,
              file,
              pageCount: count,
              thumbnail: thumb,
            };
          })
        );

        if (isAppendMerge) {
          setMergeFiles((prev) => [...prev, ...fileItems]);
        } else {
          setMergeFiles(fileItems);
          const baseName = pdfFiles[0].name.replace(/\.pdf$/i, "");
          setOutputFileName(`${baseName}_merged.pdf`);
        }
      } else {
        const file = pdfFiles[0];
        setPrimaryFile(file);
        const count = await detectPdfPages(file);
        setPageCount(count);

        // Immediately start asynchronous thumbnail generation for all pages
        generateThumbnails(file, count);

        const baseName = file.name.replace(/\.pdf$/i, "");
        if (tool.action === "split-pdf") {
          setOutputFileName(`${baseName}_split.zip`);
          setSplitRangeText(count > 2 ? `1-${Math.ceil(count / 2)}, ${Math.ceil(count / 2) + 1}-${count}` : "1");
        } else if (tool.action === "extract-pages") {
          setOutputFileName(`${baseName}_extracted.pdf`);
          setSelectedPages(new Set([1]));
          setCustomRangeInput("1");
        } else if (tool.action === "delete-pages") {
          setOutputFileName(`${baseName}_cleaned.pdf`);
          setSelectedPages(new Set());
          setCustomRangeInput("");
        } else if (tool.action === "duplicate-pages") {
          setOutputFileName(`${baseName}_duplicated.pdf`);
          setSelectedPages(new Set([1]));
        } else if (tool.action === "insert-pages") {
          setOutputFileName(`${baseName}_expanded.pdf`);
        } else {
          setOutputFileName(`${baseName}_organized.pdf`);
        }

        // Initialize page item representations for visual cards
        const items: PageItem[] = Array.from({ length: count }, (_, i) => ({
          id: `p_${i + 1}`,
          originalPage: i + 1,
          rotation: 0,
        }));
        setPagesList(items);
      }
    } catch (err: any) {
      setErrorMessage("Could not read PDF. It might be corrupt or password-protected.");
    }
  };

  const handleSecondFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];
    if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
      setErrorMessage("Please select a PDF document to insert.");
      return;
    }
    try {
      setSecondFile(file);
      const count = await detectPdfPages(file);
      setSecondPageCount(count);
      const thumb = await renderSingleThumbnail(file);
      if (thumb) setSecondThumbnail(thumb);
    } catch {
      setErrorMessage("Could not read the PDF to insert.");
    }
  };

  // Page selection helpers
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
    if (!pageCount) return;
    const all = new Set<number>();
    for (let i = 1; i <= pageCount; i++) all.add(i);
    setSelectedPages(all);
    setCustomRangeInput(`1-${pageCount}`);
  };

  const clearSelectedPages = () => {
    setSelectedPages(new Set());
    setCustomRangeInput("");
  };

  const selectOddPages = () => {
    if (!pageCount) return;
    const odd = new Set<number>();
    for (let i = 1; i <= pageCount; i += 2) odd.add(i);
    setSelectedPages(odd);
    setCustomRangeInput(Array.from(odd).join(", "));
  };

  const selectEvenPages = () => {
    if (!pageCount) return;
    const even = new Set<number>();
    for (let i = 2; i <= pageCount; i += 2) even.add(i);
    setSelectedPages(even);
    setCustomRangeInput(Array.from(even).join(", "));
  };

  const applyCustomRangeText = (text: string) => {
    setCustomRangeInput(text);
    if (!pageCount) return;
    const set = new Set<number>();
    const parts = text.split(",").map((s) => s.trim()).filter(Boolean);
    for (const part of parts) {
      if (part.includes("-")) {
        const [sStr, eStr] = part.split("-").map((s) => s.trim());
        let s = parseInt(sStr, 10);
        let e = parseInt(eStr, 10);
        if (isNaN(s)) s = 1;
        if (isNaN(e)) e = pageCount;
        s = Math.max(1, Math.min(s, pageCount));
        e = Math.max(1, Math.min(e, pageCount));
        for (let i = s; i <= e; i++) set.add(i);
      } else {
        const num = parseInt(part, 10);
        if (!isNaN(num) && num >= 1 && num <= pageCount) {
          set.add(num);
        }
      }
    }
    setSelectedPages(set);
  };

  // Reorder & Organize helpers
  const movePage = (from: number, to: number) => {
    if (to < 0 || to >= pagesList.length) return;
    setPagesList((prev) => {
      const copy = [...prev];
      const [moved] = copy.splice(from, 1);
      copy.splice(to, 0, moved);
      return copy;
    });
  };

  const rotatePage = (idx: number) => {
    setPagesList((prev) => {
      const copy = [...prev];
      copy[idx] = { ...copy[idx], rotation: (copy[idx].rotation + 90) % 360 };
      return copy;
    });
  };

  const rotateAllPages = () => {
    setPagesList((prev) =>
      prev.map((p) => ({ ...p, rotation: (p.rotation + 90) % 360 }))
    );
  };

  const reversePages = () => {
    setPagesList((prev) => [...prev].reverse());
  };

  const duplicateSinglePageInOrganizer = (idx: number) => {
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

  const deletePageInOrganizer = (idx: number) => {
    if (pagesList.length <= 1) {
      setErrorMessage("At least one page must remain.");
      return;
    }
    setPagesList((prev) => prev.filter((_, i) => i !== idx));
  };

  const resetOrganizer = () => {
    if (!pageCount) return;
    setPagesList(
      Array.from({ length: pageCount }, (_, i) => ({
        id: `p_${i + 1}`,
        originalPage: i + 1,
        rotation: 0,
      }))
    );
  };

  const triggerDownload = (url: string, name: string) => {
    const a = document.createElement("a");
    a.href = url;
    a.download = name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // Main Action Execution
  const handleProcess = async () => {
    setStatus("processing");
    setErrorMessage(null);

    try {
      if (tool.action === "merge-pdf") {
        if (mergeFiles.length < 2) {
          throw new Error("Please add at least 2 PDF files to merge.");
        }
        const mergedDoc = await PDFDocument.create();
        let totalPagesMerged = 0;

        for (const item of mergeFiles) {
          const buf = await item.file.arrayBuffer();
          const doc = await PDFDocument.load(buf, { ignoreEncryption: true });
          const indices = doc.getPageIndices();
          const copied = await mergedDoc.copyPages(doc, indices);
          copied.forEach((p) => mergedDoc.addPage(p));
          totalPagesMerged += indices.length;
        }

        const pdfBytes = await mergedDoc.save();
        const blob = new Blob([new Uint8Array(pdfBytes)], { type: "application/pdf" });
        const finalName = outputFileName.trim() || "merged_document.pdf";
        const url = URL.createObjectURL(blob);
        setDownloadUrl(url);
        setDownloadFileName(finalName);
        setResultSummary(`Successfully merged ${mergeFiles.length} files into ${totalPagesMerged} pages (${formatFileSize(blob.size)}).`);
        setStatus("success");
        triggerDownload(url, finalName);
      } else if (tool.action === "split-pdf") {
        if (!primaryFile || !pageCount) throw new Error("Please upload a PDF file.");
        const buf = await primaryFile.arrayBuffer();
        const srcDoc = await PDFDocument.load(buf, { ignoreEncryption: true });
        const baseName = primaryFile.name.replace(/\.pdf$/i, "");

        if (splitMode === "individual") {
          const zip = new JSZip();
          for (let i = 0; i < pageCount; i++) {
            const newDoc = await PDFDocument.create();
            const [copied] = await newDoc.copyPages(srcDoc, [i]);
            newDoc.addPage(copied);
            const bytes = await newDoc.save();
            zip.file(`${baseName}_page_${i + 1}.pdf`, bytes);
          }
          const zipBlob = await zip.generateAsync({ type: "blob" });
          const finalName = outputFileName.trim() || `${baseName}_split_pages.zip`;
          const url = URL.createObjectURL(zipBlob);
          setDownloadUrl(url);
          setDownloadFileName(finalName);
          setResultSummary(`Split into ${pageCount} individual page PDF files inside ZIP archive.`);
          setStatus("success");
          triggerDownload(url, finalName);
        } else {
          // Range mode
          const parts = splitRangeText.split(",").map((s) => s.trim()).filter(Boolean);
          if (parts.length === 0) throw new Error("Please enter at least one valid page range.");

          const zip = new JSZip();
          let rangeCount = 0;

          for (let idx = 0; idx < parts.length; idx++) {
            const part = parts[idx];
            let start = 1;
            let end = pageCount;
            if (part.includes("-")) {
              const [sStr, eStr] = part.split("-").map((s) => s.trim());
              start = Math.max(1, Math.min(parseInt(sStr, 10) || 1, pageCount));
              end = Math.max(1, Math.min(parseInt(eStr, 10) || pageCount, pageCount));
            } else {
              start = Math.max(1, Math.min(parseInt(part, 10) || 1, pageCount));
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
                const blob = new Blob([new Uint8Array(chunkBytes)], { type: "application/pdf" });
                const url = URL.createObjectURL(blob);
                setDownloadUrl(url);
                setDownloadFileName(rangeName);
                setResultSummary(`Extracted range ${start}-${end} (${indices.length} pages).`);
                setStatus("success");
                triggerDownload(url, rangeName);
                return;
              }
              zip.file(rangeName, chunkBytes);
              rangeCount++;
            }
          }

          const zipBlob = await zip.generateAsync({ type: "blob" });
          const finalName = `${baseName}_split_ranges.zip`;
          const url = URL.createObjectURL(zipBlob);
          setDownloadUrl(url);
          setDownloadFileName(finalName);
          setResultSummary(`Created ${rangeCount} separate PDF range files inside ZIP archive.`);
          setStatus("success");
          triggerDownload(url, finalName);
        }
      } else if (tool.action === "extract-pages") {
        if (!primaryFile || !pageCount) throw new Error("Please upload a PDF file.");
        const indices = Array.from(selectedPages)
          .sort((a, b) => a - b)
          .map((p) => p - 1);
        if (indices.length === 0) {
          throw new Error("Please select at least 1 page to extract.");
        }

        const buf = await primaryFile.arrayBuffer();
        const srcDoc = await PDFDocument.load(buf, { ignoreEncryption: true });
        const newDoc = await PDFDocument.create();
        const copied = await newDoc.copyPages(srcDoc, indices);
        copied.forEach((p) => newDoc.addPage(p));

        const pdfBytes = await newDoc.save();
        const blob = new Blob([new Uint8Array(pdfBytes)], { type: "application/pdf" });
        const finalName = outputFileName.trim() || `${primaryFile.name.replace(/\.pdf$/i, "")}_extracted.pdf`;
        const url = URL.createObjectURL(blob);
        setDownloadUrl(url);
        setDownloadFileName(finalName);
        setResultSummary(`Extracted ${indices.length} of ${pageCount} pages (${formatFileSize(blob.size)}).`);
        setStatus("success");
        triggerDownload(url, finalName);
      } else if (tool.action === "delete-pages") {
        if (!primaryFile || !pageCount) throw new Error("Please upload a PDF file.");
        const keepIndices: number[] = [];
        for (let i = 1; i <= pageCount; i++) {
          if (!selectedPages.has(i)) {
            keepIndices.push(i - 1);
          }
        }
        if (keepIndices.length === 0) {
          throw new Error("You cannot delete all pages. At least one page must remain.");
        }

        const buf = await primaryFile.arrayBuffer();
        const srcDoc = await PDFDocument.load(buf, { ignoreEncryption: true });
        const newDoc = await PDFDocument.create();
        const copied = await newDoc.copyPages(srcDoc, keepIndices);
        copied.forEach((p) => newDoc.addPage(p));

        const pdfBytes = await newDoc.save();
        const blob = new Blob([new Uint8Array(pdfBytes)], { type: "application/pdf" });
        const finalName = outputFileName.trim() || `${primaryFile.name.replace(/\.pdf$/i, "")}_deleted.pdf`;
        const url = URL.createObjectURL(blob);
        setDownloadUrl(url);
        setDownloadFileName(finalName);
        setResultSummary(`Removed ${selectedPages.size} pages. New document contains ${keepIndices.length} pages.`);
        setStatus("success");
        triggerDownload(url, finalName);
      } else if (tool.action === "reorder-pages") {
        if (!primaryFile || !pageCount) throw new Error("Please upload a PDF file.");
        const buf = await primaryFile.arrayBuffer();
        const srcDoc = await PDFDocument.load(buf, { ignoreEncryption: true });
        const newDoc = await PDFDocument.create();

        const indices = pagesList.map((p) => p.originalPage - 1);
        const copied = await newDoc.copyPages(srcDoc, indices);
        copied.forEach((p) => newDoc.addPage(p));

        const pdfBytes = await newDoc.save();
        const blob = new Blob([new Uint8Array(pdfBytes)], { type: "application/pdf" });
        const finalName = outputFileName.trim() || `${primaryFile.name.replace(/\.pdf$/i, "")}_reordered.pdf`;
        const url = URL.createObjectURL(blob);
        setDownloadUrl(url);
        setDownloadFileName(finalName);
        setResultSummary(`Reordered all ${pagesList.length} pages successfully.`);
        setStatus("success");
        triggerDownload(url, finalName);
      } else if (tool.action === "insert-pages") {
        if (!primaryFile || !secondFile) {
          throw new Error("Please select both the main PDF and the file to insert.");
        }
        const baseBuf = await primaryFile.arrayBuffer();
        const insertBuf = await secondFile.arrayBuffer();

        const baseDoc = await PDFDocument.load(baseBuf, { ignoreEncryption: true });
        const insertDoc = await PDFDocument.load(insertBuf, { ignoreEncryption: true });

        const newDoc = await PDFDocument.create();
        const baseIndices = baseDoc.getPageIndices();
        const insertIndices = insertDoc.getPageIndices();

        let splitPoint = baseIndices.length;
        if (insertPosition === "start") {
          splitPoint = 0;
        } else if (insertPosition === "after") {
          splitPoint = Math.min(Math.max(1, insertAfterPage), baseIndices.length);
        }

        const before = baseIndices.slice(0, splitPoint);
        const after = baseIndices.slice(splitPoint);

        if (before.length > 0) {
          const pBefore = await newDoc.copyPages(baseDoc, before);
          pBefore.forEach((p) => newDoc.addPage(p));
        }
        const pInsert = await newDoc.copyPages(insertDoc, insertIndices);
        pInsert.forEach((p) => newDoc.addPage(p));

        if (after.length > 0) {
          const pAfter = await newDoc.copyPages(baseDoc, after);
          pAfter.forEach((p) => newDoc.addPage(p));
        }

        const pdfBytes = await newDoc.save();
        const blob = new Blob([new Uint8Array(pdfBytes)], { type: "application/pdf" });
        const finalName = outputFileName.trim() || `${primaryFile.name.replace(/\.pdf$/i, "")}_inserted.pdf`;
        const url = URL.createObjectURL(blob);
        setDownloadUrl(url);
        setDownloadFileName(finalName);
        setResultSummary(`Inserted ${insertIndices.length} pages into target document. Total pages: ${newDoc.getPageCount()}.`);
        setStatus("success");
        triggerDownload(url, finalName);
      } else if (tool.action === "duplicate-pages") {
        if (!primaryFile || !pageCount) throw new Error("Please upload a PDF file.");
        if (selectedPages.size === 0) throw new Error("Please select at least one page to duplicate.");

        const buf = await primaryFile.arrayBuffer();
        const srcDoc = await PDFDocument.load(buf, { ignoreEncryption: true });
        const newDoc = await PDFDocument.create();

        for (let i = 0; i < pageCount; i++) {
          const pageNum = i + 1;
          const copies = selectedPages.has(pageNum) ? 1 + duplicateCopies : 1;
          for (let c = 0; c < copies; c++) {
            const [copied] = await newDoc.copyPages(srcDoc, [i]);
            newDoc.addPage(copied);
          }
        }

        const pdfBytes = await newDoc.save();
        const blob = new Blob([new Uint8Array(pdfBytes)], { type: "application/pdf" });
        const finalName = outputFileName.trim() || `${primaryFile.name.replace(/\.pdf$/i, "")}_duplicated.pdf`;
        const url = URL.createObjectURL(blob);
        setDownloadUrl(url);
        setDownloadFileName(finalName);
        setResultSummary(`Duplicated selected pages. Document now has ${newDoc.getPageCount()} pages.`);
        setStatus("success");
        triggerDownload(url, finalName);
      } else if (tool.action === "organize-pdf") {
        if (!primaryFile || !pageCount) throw new Error("Please upload a PDF file.");
        if (pagesList.length === 0) throw new Error("At least one page must remain.");

        const buf = await primaryFile.arrayBuffer();
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
        const finalName = outputFileName.trim() || `${primaryFile.name.replace(/\.pdf$/i, "")}_organized.pdf`;
        const url = URL.createObjectURL(blob);
        setDownloadUrl(url);
        setDownloadFileName(finalName);
        setResultSummary(`Exported organized PDF with ${pagesList.length} pages and custom rotations applied.`);
        setStatus("success");
        triggerDownload(url, finalName);
      }
    } catch (err: any) {
      console.error("Organize processing error:", err);
      setStatus("error");
      setErrorMessage(err.message || "An error occurred while processing the PDF.");
    }
  };

  const hasLoadedContent =
    (isMerge && mergeFiles.length > 0) ||
    (!isMerge && primaryFile !== null);

  const isWideModal =
    status !== "success" &&
    hasLoadedContent &&
    (tool.action === "reorder-pages" ||
      tool.action === "organize-pdf" ||
      tool.action === "extract-pages" ||
      tool.action === "delete-pages" ||
      tool.action === "duplicate-pages" ||
      tool.action === "merge-pdf" ||
      tool.action === "insert-pages");

  return createPortal(
    <div className="fixed inset-0 z-[99999] w-screen h-[100dvh] min-h-screen bg-slate-950/75 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto overflow-x-hidden animate-in fade-in duration-200">
      <div
        className={`relative w-full ${
          isWideModal ? "max-w-5xl max-h-[92vh]" : "max-w-lg"
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
                <span className="text-[10px] font-semibold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                  Organize
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

        {/* Content Body */}
        <div className="p-6 space-y-5 overflow-y-auto overflow-x-hidden flex-1 min-w-0">
          {/* File Upload Dropzone (When no file uploaded yet) */}
          {status !== "success" && !hasLoadedContent && (
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={(e) => {
                e.preventDefault();
                setIsDragging(false);
                handleFileUpload(e.dataTransfer.files, false);
              }}
              onClick={() => fileInputRef.current?.click()}
              className={`relative border-2 border-dashed rounded-2xl p-8 sm:p-10 text-center cursor-pointer transition-all duration-200 ${
                isDragging
                  ? "border-blue-500 bg-blue-50/50 scale-[0.99]"
                  : "border-slate-200 hover:border-slate-300 hover:bg-slate-50/50"
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                multiple={isMerge}
                accept=".pdf,application/pdf"
                className="hidden"
                onChange={(e) => handleFileUpload(e.target.files, false)}
              />
              <div className="flex flex-col items-center justify-center space-y-3">
                <span
                  className={`w-12 h-12 rounded-2xl ${tool.iconBg}/15 text-slate-700 flex items-center justify-center`}
                >
                  <LuUpload className="w-6 h-6 text-slate-700" />
                </span>
                <div>
                  <div className="text-sm font-bold text-slate-900">
                    {isMerge ? "Select multiple PDF files to merge" : "Choose PDF file"}
                  </div>
                  <div className="text-xs text-slate-400 mt-0.5">
                    Drag and drop or click to browse (.pdf)
                  </div>
                </div>
                <div className="pt-2">
                  <span className="px-4 py-1.5 bg-slate-900 text-white rounded-xl text-xs font-semibold shadow-xs hover:bg-slate-800 transition">
                    Browse PDF
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Merge PDF File Manager */}
          {status !== "success" && isMerge && mergeFiles.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <div>
                  <h3 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <span>PDF Files to Merge</span>
                    <span className="text-[11px] font-semibold text-red-600 bg-red-50 px-2 py-0.5 rounded-md border border-red-200/60">
                      {mergeFiles.length} files
                    </span>
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Files will be combined in top-to-bottom sequence
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    ref={addMoreMergeInputRef}
                    type="file"
                    multiple
                    accept=".pdf,application/pdf"
                    className="hidden"
                    onChange={(e) => handleFileUpload(e.target.files, true)}
                  />
                  <button
                    type="button"
                    onClick={() => addMoreMergeInputRef.current?.click()}
                    className="px-2.5 py-1 text-[11px] font-semibold text-red-600 bg-red-50 hover:bg-red-100 rounded-lg border border-red-200/60 transition flex items-center gap-1"
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

              <div className="space-y-2 max-h-[360px] overflow-y-auto p-1">
                {mergeFiles.map((item, idx) => (
                  <div
                    key={item.id}
                    className="bg-slate-50 border border-slate-200/80 rounded-xl p-3 flex items-center justify-between gap-3 hover:border-slate-300 transition"
                  >
                    <div className="flex items-center gap-3 overflow-hidden">
                      <span className="w-6 h-6 rounded-md bg-white border border-slate-200 text-[11px] font-bold text-slate-600 flex items-center justify-center shrink-0">
                        {idx + 1}
                      </span>
                      {item.thumbnail ? (
                        <div className="w-10 h-13 rounded border border-slate-200 bg-white overflow-hidden shrink-0 shadow-2xs">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={item.thumbnail} alt={item.file.name} className="w-full h-full object-contain" />
                        </div>
                      ) : (
                        <LuFileText className="w-5 h-5 text-red-500 shrink-0" />
                      )}
                      <div className="truncate">
                        <div className="text-xs font-semibold text-slate-800 truncate">
                          {item.file.name}
                        </div>
                        <div className="text-[10px] text-slate-400 flex items-center gap-2">
                          <span>{formatFileSize(item.file.size)}</span>
                          <span>•</span>
                          <span>{item.pageCount} pages</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        disabled={idx === 0}
                        onClick={() => {
                          setMergeFiles((prev) => {
                            const copy = [...prev];
                            const [m] = copy.splice(idx, 1);
                            copy.splice(idx - 1, 0, m);
                            return copy;
                          });
                        }}
                        className="w-6 h-6 rounded flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-white disabled:opacity-30"
                        title="Move Up"
                      >
                        <LuChevronLeft className="w-3.5 h-3.5 rotate-90" />
                      </button>
                      <button
                        type="button"
                        disabled={idx === mergeFiles.length - 1}
                        onClick={() => {
                          setMergeFiles((prev) => {
                            const copy = [...prev];
                            const [m] = copy.splice(idx, 1);
                            copy.splice(idx + 1, 0, m);
                            return copy;
                          });
                        }}
                        className="w-6 h-6 rounded flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-white disabled:opacity-30"
                        title="Move Down"
                      >
                        <LuChevronRight className="w-3.5 h-3.5 rotate-90" />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setMergeFiles((prev) => prev.filter((_, i) => i !== idx));
                        }}
                        className="w-6 h-6 rounded flex items-center justify-center text-slate-400 hover:text-red-600 hover:bg-red-50"
                        title="Remove file"
                      >
                        <LuTrash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Single PDF Info Banner (For non-merge tools) */}
          {status !== "success" && !isMerge && primaryFile && (
            <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3.5 flex items-center justify-between">
              <div className="flex items-center gap-3 overflow-hidden">
                <div className="w-9 h-9 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-600 shrink-0">
                  <LuFileText className="w-5 h-5 text-blue-600" />
                </div>
                <div className="truncate">
                  <div className="text-xs font-semibold text-slate-800 truncate">
                    {primaryFile.name}
                  </div>
                  <div className="text-[11px] text-slate-400 flex items-center gap-1.5 flex-wrap mt-0.5">
                    <span>{formatFileSize(primaryFile.size)}</span>
                    {pageCount !== null && (
                      <>
                        <span>•</span>
                        <span className="font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200/60">
                          {pageCount} {pageCount === 1 ? "page" : "pages"} detected
                        </span>
                      </>
                    )}
                    {isLoadingThumbnails && (
                      <>
                        <span>•</span>
                        <span className="text-[10px] text-slate-500 flex items-center gap-1">
                          <LuLoader className="w-3 h-3 animate-spin text-blue-500" />
                          <span>Rendering page previews...</span>
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>
              <button
                onClick={resetState}
                className="text-[11px] font-semibold text-slate-400 hover:text-red-600 transition px-2 py-1"
              >
                Change PDF
              </button>
            </div>
          )}

          {/* Insert Pages Specific Settings */}
          {status !== "success" && isInsert && primaryFile && (
            <div className="space-y-4 pt-1">
              <div className="border border-slate-200 rounded-2xl p-4 bg-white space-y-3">
                <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center text-[10px]">
                    2
                  </span>
                  <span>Select Document to Insert</span>
                </div>

                {!secondFile ? (
                  <div
                    onClick={() => secondFileInputRef.current?.click()}
                    className="border-2 border-dashed border-amber-200/80 hover:border-amber-400 rounded-xl p-4 text-center cursor-pointer bg-amber-50/20 hover:bg-amber-50/40 transition"
                  >
                    <input
                      ref={secondFileInputRef}
                      type="file"
                      accept=".pdf,application/pdf"
                      className="hidden"
                      onChange={(e) => handleSecondFileUpload(e.target.files)}
                    />
                    <LuPlus className="w-5 h-5 text-amber-600 mx-auto mb-1" />
                    <div className="text-xs font-semibold text-slate-800">
                      Upload PDF to Insert
                    </div>
                    <div className="text-[10px] text-slate-400">
                      Click to choose secondary PDF file
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between p-2.5 bg-amber-50/50 border border-amber-200 rounded-xl">
                    <div className="flex items-center gap-3 truncate">
                      {secondThumbnail ? (
                        <div className="w-8 h-10 rounded border border-amber-200 bg-white overflow-hidden shrink-0 shadow-2xs">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={secondThumbnail} alt={secondFile.name} className="w-full h-full object-contain" />
                        </div>
                      ) : (
                        <LuFileText className="w-4 h-4 text-amber-600 shrink-0" />
                      )}
                      <div className="truncate text-xs font-medium text-slate-800">
                        {secondFile.name} ({secondPageCount} pages)
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setSecondFile(null);
                        setSecondPageCount(null);
                        setSecondThumbnail(null);
                      }}
                      className="text-[11px] text-slate-400 hover:text-red-600 px-2"
                    >
                      Remove
                    </button>
                  </div>
                )}
              </div>

              {/* Insertion Position */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-800">
                  Where to Insert Pages?
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setInsertPosition("start")}
                    className={`p-2.5 rounded-xl border text-left transition ${
                      insertPosition === "start"
                        ? "border-amber-500 bg-amber-50 text-amber-900 font-semibold"
                        : "border-slate-200 hover:bg-slate-50 text-slate-700 text-xs"
                    }`}
                  >
                    <div className="text-xs">At the Beginning</div>
                    <div className="text-[10px] text-slate-400">Before Page 1</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setInsertPosition("end")}
                    className={`p-2.5 rounded-xl border text-left transition ${
                      insertPosition === "end"
                        ? "border-amber-500 bg-amber-50 text-amber-900 font-semibold"
                        : "border-slate-200 hover:bg-slate-50 text-slate-700 text-xs"
                    }`}
                  >
                    <div className="text-xs">At the End</div>
                    <div className="text-[10px] text-slate-400">After last page</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setInsertPosition("after")}
                    className={`p-2.5 rounded-xl border text-left transition ${
                      insertPosition === "after"
                        ? "border-amber-500 bg-amber-50 text-amber-900 font-semibold"
                        : "border-slate-200 hover:bg-slate-50 text-slate-700 text-xs"
                    }`}
                  >
                    <div className="text-xs">After Specific Page</div>
                    <div className="text-[10px] text-slate-400">Custom insertion point</div>
                  </button>
                </div>

                {insertPosition === "after" && pageCount && (
                  <div className="flex items-center gap-2 pt-1">
                    <span className="text-xs text-slate-600">Insert after page:</span>
                    <input
                      type="number"
                      min={1}
                      max={pageCount}
                      value={insertAfterPage}
                      onChange={(e) => setInsertAfterPage(parseInt(e.target.value, 10) || 1)}
                      className="w-16 px-2.5 py-1 text-xs border border-slate-200 rounded-lg text-slate-800"
                    />
                    <span className="text-[11px] text-slate-400">(1 to {pageCount})</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Split PDF Options */}
          {status !== "success" && tool.action === "split-pdf" && primaryFile && pageCount && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => setSplitMode("individual")}
                  className={`p-3 rounded-xl border text-left transition ${
                    splitMode === "individual"
                      ? "border-blue-500 bg-blue-50/70 text-blue-900"
                      : "border-slate-200 hover:bg-slate-50 text-slate-700"
                  }`}
                >
                  <div className="text-xs font-bold">Extract All Pages</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    Separates into {pageCount} individual PDF files (ZIP)
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => setSplitMode("range")}
                  className={`p-3 rounded-xl border text-left transition ${
                    splitMode === "range"
                      ? "border-blue-500 bg-blue-50/70 text-blue-900"
                      : "border-slate-200 hover:bg-slate-50 text-slate-700"
                  }`}
                >
                  <div className="text-xs font-bold">Split by Page Ranges</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    Define custom ranges (e.g. 1-3, 4-6)
                  </div>
                </button>
              </div>

              {splitMode === "range" && (
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Page Ranges:</label>
                  <input
                    type="text"
                    value={splitRangeText}
                    onChange={(e) => setSplitRangeText(e.target.value)}
                    placeholder="e.g. 1-2, 3-5"
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 font-medium"
                  />
                  <p className="text-[10px] text-slate-400">
                    Separate ranges with commas. Example: 1-2, 3-5 will create 2 PDF files.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Extract / Delete / Duplicate Pages Grid Selector with Real Page Previews */}
          {status !== "success" &&
            (tool.action === "extract-pages" ||
              tool.action === "delete-pages" ||
              tool.action === "duplicate-pages") &&
            primaryFile &&
            pageCount && (
              <div className="space-y-3">
                <div className="flex items-center justify-between flex-wrap gap-2 border-b border-slate-100 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-800">
                      {tool.action === "extract-pages"
                        ? "Select Pages to Extract:"
                        : tool.action === "delete-pages"
                        ? "Click Pages to Delete:"
                        : "Select Pages to Duplicate:"}
                    </span>
                    <span
                      className={`text-[11px] font-semibold px-2 py-0.5 rounded-md border ${
                        tool.action === "delete-pages"
                          ? "text-red-600 bg-red-50 border-red-200"
                          : "text-blue-600 bg-blue-50 border-blue-200"
                      }`}
                    >
                      {selectedPages.size} {selectedPages.size === 1 ? "page" : "pages"} selected
                    </span>
                    {isLoadingThumbnails && (
                      <span className="text-[10px] font-medium text-slate-400 flex items-center gap-1 bg-slate-100 px-2 py-0.5 rounded-md">
                        <LuLoader className="w-3 h-3 animate-spin text-blue-500" />
                        <span>Rendering previews...</span>
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5 flex-wrap">
                    <button
                      type="button"
                      onClick={selectAllPages}
                      className="text-[11px] font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-2.5 py-1 rounded-md transition"
                    >
                      All
                    </button>
                    <button
                      type="button"
                      onClick={selectOddPages}
                      className="text-[11px] font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-2.5 py-1 rounded-md transition"
                    >
                      Odd
                    </button>
                    <button
                      type="button"
                      onClick={selectEvenPages}
                      className="text-[11px] font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-2.5 py-1 rounded-md transition"
                    >
                      Even
                    </button>
                    <button
                      type="button"
                      onClick={clearSelectedPages}
                      className="text-[11px] font-semibold text-slate-400 hover:text-red-600 px-2 py-1 transition"
                    >
                      Clear
                    </button>
                  </div>
                </div>

                {/* Range text input */}
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-slate-400 whitespace-nowrap">Range:</span>
                  <input
                    type="text"
                    value={customRangeInput}
                    onChange={(e) => applyCustomRangeText(e.target.value)}
                    placeholder="e.g. 1, 3, 5-8"
                    className="flex-1 px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 font-medium"
                  />
                </div>

                {/* Duplicate specific options */}
                {tool.action === "duplicate-pages" && (
                  <div className="flex items-center gap-3 p-3 bg-blue-50/50 border border-blue-100 rounded-xl">
                    <span className="text-xs font-semibold text-slate-700">Copies to add:</span>
                    <div className="flex items-center gap-1.5">
                      {[1, 2, 3].map((num) => (
                        <button
                          key={num}
                          type="button"
                          onClick={() => setDuplicateCopies(num)}
                          className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                            duplicateCopies === num
                              ? "bg-blue-600 text-white shadow-xs"
                              : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50"
                          }`}
                        >
                          +{num} {num === 1 ? "copy" : "copies"}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Interactive Page Previews Grid */}
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3 max-h-[360px] overflow-y-auto p-2.5 bg-slate-50/70 rounded-2xl border border-slate-200/80">
                  {Array.from({ length: pageCount }, (_, i) => i + 1).map((pageNum) => {
                    const isSelected = selectedPages.has(pageNum);
                    const isDelete = tool.action === "delete-pages";
                    const thumbnail = pageThumbnails[pageNum];

                    return (
                      <button
                        key={pageNum}
                        type="button"
                        onClick={() => togglePageSelection(pageNum)}
                        className={`group relative rounded-2xl border p-2 flex flex-col justify-between items-center transition-all duration-200 shadow-2xs hover:shadow-md hover:scale-[1.02] cursor-pointer ${
                          isSelected
                            ? isDelete
                              ? "border-red-500 bg-red-50/70 text-red-950 ring-2 ring-red-400"
                              : "border-blue-600 bg-blue-50/70 text-blue-950 ring-2 ring-blue-400"
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
                        <div className="relative w-full aspect-[3/4] rounded-xl overflow-hidden bg-slate-100 flex items-center justify-center border border-slate-200/60 shadow-2xs">
                          {thumbnail ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={thumbnail}
                              alt={`Page ${pageNum}`}
                              className="w-full h-full object-contain pointer-events-none"
                            />
                          ) : (
                            <div className="flex flex-col items-center justify-center gap-1.5 p-2 text-center">
                              <LuLoader className="w-4 h-4 text-slate-400 animate-spin" />
                              <span className="text-[9px] text-slate-400 font-medium">Page {pageNum}</span>
                            </div>
                          )}

                          {/* Selected Overlay */}
                          {isSelected && (
                            <div
                              className={`absolute inset-0 flex items-center justify-center transition-all ${
                                isDelete ? "bg-red-500/20" : "bg-blue-600/20"
                              }`}
                            >
                              <span
                                className={`w-8 h-8 rounded-full flex items-center justify-center text-white shadow-md ${
                                  isDelete ? "bg-red-600" : "bg-blue-600"
                                }`}
                              >
                                {isDelete ? <LuTrash2 className="w-4 h-4" /> : <LuCheck className="w-4 h-4 font-bold" />}
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
            )}

          {/* Reorder Pages Visual Manager with Page Previews */}
          {status !== "success" && tool.action === "reorder-pages" && primaryFile && pageCount && (
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <div>
                  <h3 className="text-xs font-bold text-slate-800">Drag or Use Arrows to Rearrange</h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Click arrow buttons to specify exact page sequence
                  </p>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={reversePages}
                    className="px-2.5 py-1 text-[11px] font-semibold text-purple-700 bg-purple-50 hover:bg-purple-100 rounded-lg border border-purple-200 transition flex items-center gap-1"
                  >
                    <LuArrowLeftRight className="w-3.5 h-3.5" />
                    <span>Reverse</span>
                  </button>
                  <button
                    type="button"
                    onClick={resetOrganizer}
                    className="px-2 py-1 text-[11px] font-semibold text-slate-400 hover:text-slate-700 transition"
                  >
                    Reset
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 max-h-[380px] overflow-y-auto p-2 bg-slate-50/50 rounded-2xl border border-slate-100">
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
                    <div className="my-1.5 w-full aspect-[3/4] rounded-xl overflow-hidden bg-slate-100 border border-slate-200/70 flex items-center justify-center relative shadow-2xs">
                      {pageThumbnails[item.originalPage] ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={pageThumbnails[item.originalPage]}
                          alt={`Page ${item.originalPage}`}
                          className="w-full h-full object-contain pointer-events-none"
                        />
                      ) : (
                        <div className="flex flex-col items-center justify-center gap-1">
                          <LuLoader className="w-4 h-4 text-purple-400 animate-spin" />
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
                        onClick={() => movePage(idx, idx - 1)}
                        className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-500 hover:text-slate-800 hover:bg-slate-100 disabled:opacity-20 transition"
                        title="Move Left"
                      >
                        <LuChevronLeft className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        disabled={idx === pagesList.length - 1}
                        onClick={() => movePage(idx, idx + 1)}
                        className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-500 hover:text-slate-800 hover:bg-slate-100 disabled:opacity-20 transition"
                        title="Move Right"
                      >
                        <LuChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* PDF Organizer (Full Page Studio with Rotating Previews) */}
          {status !== "success" && tool.action === "organize-pdf" && primaryFile && pageCount && (
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2 flex-wrap gap-2">
                <div>
                  <h3 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <span>PDF Page Manager</span>
                    <span className="text-[11px] font-semibold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200">
                      {pagesList.length} pages
                    </span>
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Rotate, duplicate, move, or delete individual pages
                  </p>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={rotateAllPages}
                    className="px-2.5 py-1 text-[11px] font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-lg border border-rose-200 transition flex items-center gap-1"
                  >
                    <LuRotateCw className="w-3.5 h-3.5" />
                    <span>Rotate All</span>
                  </button>
                  <button
                    type="button"
                    onClick={reversePages}
                    className="px-2.5 py-1 text-[11px] font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition flex items-center gap-1"
                  >
                    <LuArrowLeftRight className="w-3.5 h-3.5" />
                    <span>Reverse</span>
                  </button>
                  <button
                    type="button"
                    onClick={resetOrganizer}
                    className="px-2 py-1 text-[11px] font-semibold text-slate-400 hover:text-slate-700 transition"
                  >
                    Reset
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 max-h-[380px] overflow-y-auto p-2 bg-slate-50/50 rounded-2xl border border-slate-100">
                {pagesList.map((item, idx) => (
                  <div
                    key={item.id}
                    className="bg-white border border-slate-200/90 rounded-2xl p-3 flex flex-col justify-between shadow-2xs hover:shadow-md transition relative group"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                        #{idx + 1}
                      </span>
                      {item.rotation !== 0 && (
                        <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                          {item.rotation}°
                        </span>
                      )}
                    </div>

                    {/* Real Page Thumbnail with live CSS rotation */}
                    <div className="my-2 w-full aspect-[3/4] rounded-xl overflow-hidden bg-slate-100 border border-slate-200/80 flex items-center justify-center relative p-1 shadow-2xs">
                      {pageThumbnails[item.originalPage] ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={pageThumbnails[item.originalPage]}
                          alt={`Page ${item.originalPage}`}
                          className="w-full h-full object-contain pointer-events-none transition-transform duration-300"
                          style={{ transform: `rotate(${item.rotation}deg)` }}
                        />
                      ) : (
                        <div className="flex flex-col items-center justify-center gap-1">
                          <LuLoader className="w-5 h-5 text-rose-400 animate-spin" />
                          <span className="text-[10px] text-slate-400 font-medium">Page {item.originalPage}</span>
                        </div>
                      )}
                    </div>

                    <div className="text-center font-bold text-slate-800 text-xs py-1">
                      Page {item.originalPage}
                    </div>

                    {/* Toolbar per page */}
                    <div className="flex items-center justify-between border-t border-slate-100 pt-2 gap-1">
                      <button
                        type="button"
                        onClick={() => rotatePage(idx)}
                        className="w-6 h-6 rounded flex items-center justify-center text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                        title="Rotate 90°"
                      >
                        <LuRotateCw className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => duplicateSinglePageInOrganizer(idx)}
                        className="w-6 h-6 rounded flex items-center justify-center text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition"
                        title="Duplicate"
                      >
                        <LuCopy className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        disabled={idx === 0}
                        onClick={() => movePage(idx, idx - 1)}
                        className="w-6 h-6 rounded flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 disabled:opacity-20 transition"
                        title="Move Left"
                      >
                        <LuChevronLeft className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        disabled={idx === pagesList.length - 1}
                        onClick={() => movePage(idx, idx + 1)}
                        className="w-6 h-6 rounded flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 disabled:opacity-20 transition"
                        title="Move Right"
                      >
                        <LuChevronRight className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => deletePageInOrganizer(idx)}
                        className="w-6 h-6 rounded flex items-center justify-center text-slate-400 hover:text-red-600 hover:bg-red-50 transition"
                        title="Delete Page"
                      >
                        <LuTrash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Output Filename Config (If content is loaded) */}
          {status !== "success" && hasLoadedContent && (
            <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
              <span className="text-[11px] font-semibold text-slate-500 whitespace-nowrap">
                Save as:
              </span>
              <input
                type="text"
                value={outputFileName}
                onChange={(e) => setOutputFileName(e.target.value)}
                placeholder="output.pdf"
                className="flex-1 px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 font-medium"
              />
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
            <div className="py-6 text-center space-y-3">
              <div className="w-12 h-12 rounded-full border-4 border-slate-200 border-t-red-600 animate-spin mx-auto" />
              <div className="text-xs font-bold text-slate-800">
                Processing your PDF pages...
              </div>
              <div className="text-[11px] text-slate-400">
                Generating high-fidelity PDF output
              </div>
            </div>
          )}

          {/* Success Download Screen */}
          {status === "success" && downloadUrl && (
            <div className="py-8 text-center space-y-4">
              <div className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto ring-8 ring-emerald-50/50">
                <LuCircleCheck className="w-8 h-8 text-emerald-600" />
              </div>

              <div>
                <h3 className="text-base font-bold text-slate-900">PDF Ready!</h3>
                {resultSummary && (
                  <p className="text-xs text-slate-500 mt-1">{resultSummary}</p>
                )}
                {downloadFileName && (
                  <div className="inline-block mt-2 px-3 py-1 bg-slate-100 rounded-lg text-xs font-mono font-medium text-slate-700">
                    {downloadFileName}
                  </div>
                )}
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => triggerDownload(downloadUrl, downloadFileName || "document.pdf")}
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
                  <span>Process Another</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer with Action Buttons */}
        {status !== "success" && hasLoadedContent && (
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
              onClick={handleProcess}
              disabled={
                status === "processing" ||
                (isMerge && mergeFiles.length < 2) ||
                (isInsert && !secondFile) ||
                (tool.action === "extract-pages" && selectedPages.size === 0) ||
                (tool.action === "delete-pages" && (selectedPages.size === 0 || (pageCount !== null && selectedPages.size >= pageCount))) ||
                (tool.action === "duplicate-pages" && selectedPages.size === 0)
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
                    {tool.action === "merge-pdf"
                      ? `Merge ${mergeFiles.length} PDFs`
                      : tool.action === "split-pdf"
                      ? "Split PDF"
                      : tool.action === "extract-pages"
                      ? `Extract ${selectedPages.size} ${selectedPages.size === 1 ? "Page" : "Pages"}`
                      : tool.action === "delete-pages"
                      ? `Delete ${selectedPages.size} ${selectedPages.size === 1 ? "Page" : "Pages"}`
                      : tool.action === "reorder-pages"
                      ? "Save Reordered PDF"
                      : tool.action === "insert-pages"
                      ? "Insert & Save PDF"
                      : tool.action === "duplicate-pages"
                      ? "Duplicate & Save"
                      : "Export Organized PDF"}
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
