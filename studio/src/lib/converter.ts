import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import { Document, Paragraph, TextRun, HeadingLevel, Packer, Table, TableRow, TableCell, WidthType, BorderStyle } from "docx";
import ExcelJS from "exceljs";
import PptxGenJS from "pptxgenjs";
import mammoth from "mammoth";

// Polyfill DOMMatrix for Node.js environments (required by pdfjs-dist / pdf-parse v2)
try {
  const canvas = require("@napi-rs/canvas");
  const DOMMatrixCtor = canvas.DOMMatrix || canvas.default?.DOMMatrix;
  const ImageDataCtor = canvas.ImageData || canvas.default?.ImageData;
  const Path2DCtor = canvas.Path2D || canvas.default?.Path2D;
  if (DOMMatrixCtor) {
    (global as any).DOMMatrix = DOMMatrixCtor;
    (globalThis as any).DOMMatrix = DOMMatrixCtor;
  }
  if (ImageDataCtor) {
    (global as any).ImageData = ImageDataCtor;
    (globalThis as any).ImageData = ImageDataCtor;
  }
  if (Path2DCtor) {
    (global as any).Path2D = Path2DCtor;
    (globalThis as any).Path2D = Path2DCtor;
  }
} catch (e) {
  console.warn("[Canvas polyfill warning]:", e);
}

export type ConvertAction =
  | "pdf-to-word"
  | "word-to-pdf"
  | "pdf-to-excel"
  | "excel-to-pdf"
  | "pdf-to-ppt"
  | "ppt-to-pdf"
  | "pdf-to-images"
  | "images-to-pdf";

export interface ConvertResult {
  buffer: Buffer;
  fileName: string;
  mimeType: string;
}

export interface StructuredRow {
  pageNumber: number;
  columns: string[];
  fullLine: string;
}

export interface StructuredPdf {
  rows: StructuredRow[];
  lines: string[];
  rawText: string;
  pageCount: number;
}

/**
 * High-precision layout-aware PDF content extractor.
 * Groups text fragments by coordinate space to preserve tables, columns, and headings.
 */
async function extractStructuredPdf(buffer: Buffer): Promise<StructuredPdf> {
  // Ensure DOMMatrix is present on global and globalThis
  if (typeof (global as any).DOMMatrix === "undefined") {
    (global as any).DOMMatrix = require("dommatrix");
  }
  if (typeof (globalThis as any).DOMMatrix === "undefined") {
    (globalThis as any).DOMMatrix = require("dommatrix");
  }

  const { PDFParse } = require("pdf-parse");
  const parser = new PDFParse({ data: new Uint8Array(buffer) });

  try {
    const loaded = await parser.load();
    const pageCount = loaded.numPages || 1;
    const allRows: StructuredRow[] = [];
    const allLines: string[] = [];

    const pageIndices = Array.from({ length: pageCount }, (_, i) => i + 1);
    const pagesData = await Promise.all(
      pageIndices.map(async (p) => {
        const page = await loaded.getPage(p);
        const textContent = await page.getTextContent();
        const items = (textContent.items || []).filter(
          (it: any) => it.str && String(it.str).trim().length > 0
        );
        if (typeof page.cleanup === "function") {
          page.cleanup();
        }
        return { p, items };
      })
    );

    for (const { p, items } of pagesData) {
      // Sort vertical top-to-bottom, then horizontal left-to-right
      items.sort((a: any, b: any) => {
        const yDiff = b.transform[5] - a.transform[5];
        if (Math.abs(yDiff) > 4) return yDiff;
        return a.transform[4] - b.transform[4];
      });

      // Cluster items into rows by Y coordinate
      const pageRows: any[][] = [];
      let curRow: any[] = [];
      let lastY: number | null = null;

      for (const it of items) {
        const y = it.transform[5];
        if (lastY === null || Math.abs(lastY - y) < 4.5) {
          curRow.push(it);
        } else {
          if (curRow.length) pageRows.push(curRow);
          curRow = [it];
        }
        lastY = y;
      }
      if (curRow.length) pageRows.push(curRow);

      // Cluster row items into distinct columns by X coordinate gap
      for (const rowItems of pageRows) {
        rowItems.sort((a: any, b: any) => a.transform[4] - b.transform[4]);
        const cols: string[] = [];
        let curCol = "";
        let lastRight: number | null = null;

        for (const it of rowItems) {
          const x = it.transform[4];
          const w = it.width || Math.max(12, it.str.length * 6);

          // If gap between previous right edge and current start is > 14 points, treat as separate column
          if (lastRight !== null && x - lastRight > 14) {
            if (curCol.trim()) cols.push(curCol.trim());
            curCol = it.str;
          } else {
            curCol = curCol ? `${curCol} ${it.str}` : it.str;
          }
          lastRight = x + w;
        }

        if (curCol.trim()) cols.push(curCol.trim());

        if (cols.length > 0) {
          allRows.push({
            pageNumber: p,
            columns: cols,
            fullLine: cols.join("    "),
          });
          allLines.push(cols.join("    "));
        }
      }
    }

    await parser.destroy();

    // If no coordinates were extracted, fallback to standard getText
    if (allLines.length === 0) {
      const fallbackParser = new PDFParse({ data: new Uint8Array(buffer) });
      const fallbackResult = await fallbackParser.getText();
      await fallbackParser.destroy();
      const rawText = fallbackResult?.text || "";
      const splitLines = rawText.split(/\r?\n/).map((l: string) => l.trim()).filter(Boolean);
      return {
        rows: splitLines.map((l: string) => ({ pageNumber: 1, columns: [l], fullLine: l })),
        lines: splitLines,
        rawText,
        pageCount,
      };
    }

    return {
      rows: allRows,
      lines: allLines,
      rawText: allLines.join("\n"),
      pageCount,
    };
  } catch (error) {
    console.warn("[PDF Extraction Error, attempting text fallback]:", error);
    try {
      const fallbackParser = new PDFParse({ data: new Uint8Array(buffer) });
      const fallbackResult = await fallbackParser.getText();
      await fallbackParser.destroy();
      const raw = fallbackResult?.text || "";
      const splitLines = raw.split(/\r?\n/).map((l: string) => l.trim()).filter(Boolean);
      return {
        rows: splitLines.map((l: string) => ({ pageNumber: 1, columns: [l], fullLine: l })),
        lines: splitLines,
        rawText: raw,
        pageCount: 1,
      };
    } catch {
      return { rows: [], lines: [], rawText: "", pageCount: 1 };
    }
  }
}

/**
 * Uses native Microsoft PowerPoint COM automation on Windows to generate
 * pixel-perfect PDF output matching exact fonts, vector tables, and slide layouts.
 */
async function convertPptWithPowerPoint(buffer: Buffer): Promise<Buffer | null> {
  if (process.platform !== "win32") return null;
  const fs = require("fs");
  const os = require("os");
  const path = require("path");
  const { execFile } = require("child_process");

  const tmpDir = os.tmpdir();
  const id = Date.now() + "_" + Math.random().toString(36).slice(2, 8);
  const inPath = path.join(tmpDir, `ppt_in_${id}.pptx`);
  const outPath = path.join(tmpDir, `ppt_out_${id}.pdf`);

  try {
    await fs.promises.writeFile(inPath, buffer);

    const psScript = `
$ErrorActionPreference = "Stop"
$pptApp = $null
$pres = $null
try {
  $pptApp = New-Object -ComObject PowerPoint.Application
  $inP = [System.IO.Path]::GetFullPath("${inPath.replace(/\\/g, '\\\\')}")
  $outP = [System.IO.Path]::GetFullPath("${outPath.replace(/\\/g, '\\\\')}")
  $pres = $pptApp.Presentations.Open($inP, 1, 0, 0)
  $pres.SaveAs($outP, 32)
} finally {
  if ($pres) { try { $pres.Close() } catch {} [System.Runtime.InteropServices.Marshal]::ReleaseComObject($pres) | Out-Null }
  if ($pptApp) { try { $pptApp.Quit() } catch {} [System.Runtime.InteropServices.Marshal]::ReleaseComObject($pptApp) | Out-Null }
  [System.GC]::Collect()
}
`;

    await new Promise<void>((resolve, reject) => {
      execFile(
        "powershell",
        ["-NoProfile", "-NonInteractive", "-Command", psScript],
        { timeout: 45000 },
        (err: any) => {
          if (err) return reject(err);
          resolve();
        }
      );
    });

    if (fs.existsSync(outPath)) {
      const outBuf = await fs.promises.readFile(outPath);
      try { await fs.promises.unlink(outPath); } catch {}
      return outBuf;
    }
    return null;
  } catch (err) {
    console.warn("[PowerPoint COM Conversion Notice, falling back to OpenXML engine]:", err);
    return null;
  } finally {
    try { await fs.promises.unlink(inPath); } catch {}
    try { await fs.promises.unlink(outPath); } catch {}
  }
}

/**
 * Executes file conversion based on the requested action.
 */
export async function convertDocument(
  fileBuffer: Buffer,
  originalFileName: string,
  action: ConvertAction,
  additionalFiles?: { buffer: Buffer; fileName: string }[],
  customOutputName?: string | null
): Promise<ConvertResult> {
  const baseName = originalFileName.replace(/\.[^/.]+$/, "");

  switch (action) {
    case "pdf-to-word": {
      const extracted = await extractStructuredPdf(fileBuffer);
      const rows = extracted.rows;

      const children: (Paragraph | Table)[] = [];

      // Determine main title
      const titleText = rows.length > 0 && rows[0].columns.length === 1 && rows[0].fullLine.length < 60
        ? rows[0].fullLine
        : baseName.toUpperCase();

      children.push(
        new Paragraph({
          text: titleText,
          heading: HeadingLevel.HEADING_1,
          spacing: { after: 240, before: 120 },
        })
      );

      // Start processing content from index 1 if first line was used as title
      const startIndex = titleText === rows[0]?.fullLine ? 1 : 0;

      // Group consecutive multi-column rows into Word Tables, single-column rows into Paragraphs
      let tableBatch: string[][] = [];

      const flushTable = () => {
        if (tableBatch.length === 0) return;

        const maxCols = Math.max(...tableBatch.map((r) => r.length));
        const tableRows = tableBatch.map((r, rowIdx) => {
          const isHeader = rowIdx === 0;
          return new TableRow({
            children: Array.from({ length: maxCols }).map((_, colIdx) => {
              const textVal = r[colIdx] || "";
              return new TableCell({
                width: { size: Math.floor(100 / maxCols), type: WidthType.PERCENTAGE },
                children: [
                  new Paragraph({
                    children: [
                      new TextRun({
                        text: textVal,
                        bold: isHeader,
                        size: 20,
                      }),
                    ],
                    spacing: { before: 60, after: 60 },
                  }),
                ],
              });
            }),
          });
        });

        children.push(
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: tableRows,
          })
        );

        // Add spacing after table
        children.push(new Paragraph({ text: "", spacing: { after: 140 } }));
        tableBatch = [];
      };

      for (let i = startIndex; i < rows.length; i++) {
        const row = rows[i];
        if (row.columns.length > 1) {
          tableBatch.push(row.columns);
        } else {
          flushTable();
          const lineText = row.fullLine.trim();
          if (!lineText) continue;

          // Check if this line looks like a sub-heading (short and distinct)
          const isSubheading =
            lineText.length < 40 &&
            (lineText.endsWith(":") || /^(section|chapter|part|page|sheet)\b/i.test(lineText));

          children.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: lineText,
                  bold: isSubheading,
                  size: isSubheading ? 24 : 22,
                }),
              ],
              spacing: { after: isSubheading ? 140 : 100 },
            })
          );
        }
      }
      flushTable();

      // If document was completely empty, provide structured fallback
      if (children.length <= 1) {
        children.push(
          new Paragraph({
            text: `Document: ${originalFileName}\nNo extractable text layers found. Scanned content may require OCR.`,
            spacing: { after: 120 },
          })
        );
      }

      const doc = new Document({
        sections: [{ properties: {}, children }],
      });

      const buffer = await Packer.toBuffer(doc);
      return {
        buffer,
        fileName: `${baseName}.docx`,
        mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      };
    }

    case "word-to-pdf": {
      let rawText = "";
      try {
        const result = await mammoth.extractRawText({ buffer: fileBuffer });
        rawText = result.value || "";
      } catch (err) {
        console.warn("Mammoth extraction warning:", err);
      }

      const textToUse = rawText.trim() || `Document: ${originalFileName}\nWord document processed.`;
      const lines = textToUse.split(/\r?\n/).map((l: string) => l.trim()).filter(Boolean);

      const pdfDoc = await PDFDocument.create();
      const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

      const pageWidth = 595.28;
      const pageHeight = 841.89;
      const margin = 50;
      const fontSize = 11;
      const lineHeight = 16;
      const maxLineWidth = pageWidth - margin * 2;

      let page = pdfDoc.addPage([pageWidth, pageHeight]);
      let y = pageHeight - margin;

      // Draw Title
      page.drawText(baseName, {
        x: margin,
        y: y - 10,
        size: 20,
        font: boldFont,
        color: rgb(0.1, 0.1, 0.15),
      });
      y -= 45;

      for (const rawLine of lines) {
        const words = rawLine.split(/\s+/);
        let currentLine = "";

        for (const word of words) {
          const testLine = currentLine ? `${currentLine} ${word}` : word;
          const testWidth = font.widthOfTextAtSize(testLine, fontSize);

          if (testWidth > maxLineWidth && currentLine) {
            if (y < margin + lineHeight) {
              page = pdfDoc.addPage([pageWidth, pageHeight]);
              y = pageHeight - margin;
            }
            page.drawText(currentLine, {
              x: margin,
              y,
              size: fontSize,
              font,
              color: rgb(0.2, 0.2, 0.25),
            });
            y -= lineHeight;
            currentLine = word;
          } else {
            currentLine = testLine;
          }
        }

        if (currentLine) {
          if (y < margin + lineHeight) {
            page = pdfDoc.addPage([pageWidth, pageHeight]);
            y = pageHeight - margin;
          }
          page.drawText(currentLine, {
            x: margin,
            y,
            size: fontSize,
            font,
            color: rgb(0.2, 0.2, 0.25),
          });
          y -= lineHeight;
        }

        y -= 6;
      }

      const buffer = Buffer.from(await pdfDoc.save());
      return {
        buffer,
        fileName: `${baseName}.pdf`,
        mimeType: "application/pdf",
      };
    }

    case "pdf-to-excel": {
      const extracted = await extractStructuredPdf(fileBuffer);
      const rows = extracted.rows;

      const workbook = new ExcelJS.Workbook();
      workbook.creator = "Document Converter";
      workbook.created = new Date();

      // Check if document has sheet title, e.g. "Sheet: Sheet1"
      let sheetName = "Sheet1";
      let startRowIdx = 0;

      if (rows.length > 0 && rows[0].columns.length === 1 && /^sheet:\s*(.+)$/i.test(rows[0].columns[0])) {
        const match = rows[0].columns[0].match(/^sheet:\s*(.+)$/i);
        if (match && match[1]) {
          sheetName = match[1].trim().slice(0, 31);
          startRowIdx = 1;
        }
      }

      const sheet = workbook.addWorksheet(sheetName);

      const maxCols = Math.max(1, ...rows.map((r) => r.columns.length));
      const colWidths: number[] = Array(maxCols).fill(12);

      let isFirstTableContentRow = true;

      for (let i = startRowIdx; i < rows.length; i++) {
        const row = rows[i];
        if (row.columns.length === 0) continue;

        // Convert string values to numbers where suitable (e.g. roll numbers, marks, percentages)
        const cellValues = row.columns.map((colStr, colIdx) => {
          const trimmed = colStr.trim();
          colWidths[colIdx] = Math.max(colWidths[colIdx] || 12, trimmed.length + 4);

          const num = Number(trimmed);
          if (!isNaN(num) && trimmed !== "" && !trimmed.startsWith("0")) {
            return num;
          }
          return trimmed;
        });

        const addedRow = sheet.addRow(cellValues);

        // Style the first multi-column row as the table header
        if (isFirstTableContentRow && row.columns.length > 1) {
          addedRow.font = { bold: true, color: { argb: "FF0F172A" } };
          addedRow.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "FFF1F5F9" },
          };
          addedRow.height = 24;
          isFirstTableContentRow = false;
        } else if (row.columns.length > 1) {
          addedRow.height = 20;
        }
      }

      // Apply calculated column widths
      sheet.columns = colWidths.map((w) => ({ width: Math.min(Math.max(w, 14), 50) }));

      const buffer = Buffer.from(await workbook.xlsx.writeBuffer());
      return {
        buffer,
        fileName: `${baseName}.xlsx`,
        mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      };
    }

    case "excel-to-pdf": {
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.load(fileBuffer as any);

      const pdfDoc = await PDFDocument.create();
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

      const pageWidth = 841.89; // Landscape A4
      const pageHeight = 595.28;
      const margin = 40;

      workbook.eachSheet((worksheet) => {
        let page = pdfDoc.addPage([pageWidth, pageHeight]);
        let y = pageHeight - margin;

        // Sheet Header
        page.drawText(`Sheet: ${worksheet.name}`, {
          x: margin,
          y,
          size: 16,
          font: boldFont,
          color: rgb(0.1, 0.35, 0.2),
        });
        y -= 25;

        worksheet.eachRow((row, rowNumber) => {
          if (y < margin + 15) {
            page = pdfDoc.addPage([pageWidth, pageHeight]);
            y = pageHeight - margin;
          }

          let x = margin;
          const colWidth = 120;
          const isHeader = rowNumber === 1;

          row.eachCell((cell, colNumber) => {
            if (colNumber > 6) return;
            const cellValue = cell.text ? String(cell.text).slice(0, 20) : "";
            page.drawText(cellValue, {
              x,
              y,
              size: 9,
              font: isHeader ? boldFont : font,
              color: isHeader ? rgb(0.1, 0.1, 0.2) : rgb(0.2, 0.2, 0.25),
            });
            x += colWidth;
          });

          y -= 16;
        });
      });

      const buffer = Buffer.from(await pdfDoc.save());
      return {
        buffer,
        fileName: `${baseName}.pdf`,
        mimeType: "application/pdf",
      };
    }

    case "pdf-to-ppt": {
      const extracted = await extractStructuredPdf(fileBuffer);
      const pptx = new PptxGenJS();

      let renderedPages: Array<{ dataUrl: string; pageNumber: number; width: number; height: number }> = [];

      try {
        const { PDFParse } = require("pdf-parse");
        const parser = new PDFParse({ data: new Uint8Array(fileBuffer) });
        const screenshotResult = await parser.getScreenshot({ scale: 2.0 });
        await parser.destroy();
        if (screenshotResult?.pages && screenshotResult.pages.length > 0) {
          renderedPages = screenshotResult.pages;
        }
      } catch (err) {
        console.warn("[pdf-to-ppt screenshot render error]:", err);
      }

      if (renderedPages.length > 0) {
        const firstPage = renderedPages[0];
        const pWidth = firstPage.width || 1920;
        const pHeight = firstPage.height || 1080;
        const ratio = pWidth / pHeight;

        // Custom slide dimensions matching exact PDF aspect ratio
        const slideWidthInches = 13.333;
        const slideHeightInches = Number((slideWidthInches / ratio).toFixed(3));

        pptx.defineLayout({
          name: "PDF_RATIO",
          width: slideWidthInches,
          height: slideHeightInches,
        });
        pptx.layout = "PDF_RATIO";

        for (const p of renderedPages) {
          const slide = pptx.addSlide();
          slide.addImage({
            data: p.dataUrl,
            x: 0,
            y: 0,
            w: "100%",
            h: "100%",
          });

          // Attach page text to presenter notes for full searchability
          const pageRows = extracted.rows.filter((r) => r.pageNumber === p.pageNumber);
          const pageNotes = pageRows.map((r) => r.fullLine).join("\n").trim();
          if (pageNotes) {
            slide.addNotes(pageNotes);
          }
        }
      } else {
        // Fallback per-page text layout if screenshot rendering fails
        pptx.layout = "LAYOUT_16x9";
        for (let pNum = 1; pNum <= Math.max(1, extracted.pageCount); pNum++) {
          const slide = pptx.addSlide();
          slide.background = { color: "F8FAFC" };

          const pageRows = extracted.rows.filter((r) => r.pageNumber === pNum);
          const pageLines = pageRows.map((r) => r.fullLine);
          const slideTitle = pageLines[0] || `Slide ${pNum}`;
          const bodyLines = pageLines.slice(1);

          slide.addText(slideTitle, {
            x: 0.8,
            y: 0.6,
            w: 11.0,
            h: 0.8,
            fontSize: 22,
            bold: true,
            color: "0F172A",
          });

          if (bodyLines.length > 0) {
            slide.addText(bodyLines.map((l) => `• ${l}`).join("\n\n"), {
              x: 0.8,
              y: 1.6,
              w: 11.0,
              h: 5.0,
              fontSize: 14,
              color: "334155",
            });
          }
        }
      }

      const outBuffer = (await pptx.write({ outputType: "nodebuffer" })) as Buffer;
      return {
        buffer: outBuffer,
        fileName: `${baseName}.pptx`,
        mimeType: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
      };
    }

    case "ppt-to-pdf": {
      // 1. First attempt native PowerPoint engine for 100% pixel-perfect rendering of tables, fonts, layouts
      try {
        const nativePdf = await convertPptWithPowerPoint(fileBuffer);
        if (nativePdf && nativePdf.length > 0) {
          if (process.env.CLOUDINARY_CLOUD_NAME) {
            try {
              const { CloudinaryStorageAdapter } = require("@/lib/storage/cloudinary");
              const storage = new CloudinaryStorageAdapter();
              storage
                .uploadBuffer({
                  buffer: nativePdf,
                  folder: process.env.CLOUDINARY_FOLDER || "xspaceweb-studio-dev",
                  publicId: `ppt_to_pdf_${Date.now()}_${baseName.slice(0, 20)}`,
                  resourceType: "raw",
                  format: "pdf",
                })
                .catch((err: any) => console.warn("[Cloudinary PPT backup notice]:", err?.message));
            } catch {}
          }

          return {
            buffer: nativePdf,
            fileName: `${baseName}.pdf`,
            mimeType: "application/pdf",
          };
        }
      } catch (nativeErr) {
        console.warn("[Native PowerPoint conversion skipped]:", nativeErr);
      }

      // 2. High-fidelity OpenXML fallback (cross-platform, handles tables, shapes, and images)
      const JSZip = require("jszip");
      const zip = await JSZip.loadAsync(fileBuffer);

      const pdfDoc = await PDFDocument.create();
      const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

      // Determine slide dimensions from presentation.xml (default 16:9 widescreen = 960x540)
      let slideWidth = 960;
      let slideHeight = 540;
      const presXml = await zip.file("ppt/presentation.xml")?.async("text");
      if (presXml) {
        const szMatch = presXml.match(/cx="(-?\d+)"\s+cy="(-?\d+)"/);
        if (szMatch) {
          const w = Math.round(Number(szMatch[1]) / 12700);
          const h = Math.round(Number(szMatch[2]) / 12700);
          if (w > 0 && h > 0) {
            slideWidth = w;
            slideHeight = h;
          }
        }
      }

      // Collect all slide XML files sorted numerically (slide1.xml, slide2.xml, ...)
      const slideFiles = Object.keys(zip.files).filter((f) => /^ppt\/slides\/slide\d+\.xml$/.test(f));
      slideFiles.sort((a, b) => {
        const numA = parseInt(a.match(/\d+/)![0], 10);
        const numB = parseInt(b.match(/\d+/)![0], 10);
        return numA - numB;
      });

      if (slideFiles.length === 0) {
        const page = pdfDoc.addPage([slideWidth, slideHeight]);
        page.drawText(baseName, {
          x: 50,
          y: slideHeight / 2,
          size: 24,
          font: boldFont,
          color: rgb(0.1, 0.1, 0.15),
        });
      }

      for (const sf of slideFiles) {
        const slidePage = pdfDoc.addPage([slideWidth, slideHeight]);
        const slideXml = (await zip.file(sf)?.async("text")) || "";

        // Check slide background color
        const bgMatch = slideXml.match(/<p:bgPr[^>]*>[\s\S]*?<a:srgbClr val="([0-9a-fA-F]{6})"/i);
        if (bgMatch) {
          const hex = bgMatch[1];
          const r = parseInt(hex.slice(0, 2), 16) / 255;
          const g = parseInt(hex.slice(2, 4), 16) / 255;
          const b = parseInt(hex.slice(4, 6), 16) / 255;
          slidePage.drawRectangle({
            x: 0,
            y: 0,
            width: slideWidth,
            height: slideHeight,
            color: rgb(r, g, b),
          });
        }

        // Check for slide relationships (images)
        const relFile = sf.replace("ppt/slides/", "ppt/slides/_rels/") + ".rels";
        const relContent = (await zip.file(relFile)?.async("text")) || "";

        // Map rId -> media path
        const relMap: Record<string, string> = {};
        const relMatches = relContent.matchAll(/<Relationship[^>]*Id="([^"]+)"[^>]*Target="([^"]+)"/g);
        for (const rm of relMatches) {
          const rId = rm[1];
          const target = rm[2];
          if (/\.(png|jpe?g|webp|gif)$/i.test(target)) {
            relMap[rId] = "ppt/" + target.replace(/^(\.\.\/)+/, "");
          }
        }

        // Extract and render picture elements (<p:pic>)
        const picBlocks = slideXml.match(/<p:pic[\s\S]*?<\/p:pic>/g) || [];
        for (const pic of picBlocks) {
          const embedMatch = pic.match(/r:embed="([^"]+)"/);
          if (!embedMatch) continue;
          const mediaPath = relMap[embedMatch[1]];
          if (!mediaPath) continue;

          const imgBuf = await zip.file(mediaPath)?.async("nodebuffer");
          if (!imgBuf) continue;

          try {
            const isPng = imgBuf.slice(0, 8).toString("hex") === "89504e470d0a1a0a";
            const embedded = isPng ? await pdfDoc.embedPng(imgBuf) : await pdfDoc.embedJpg(imgBuf);

            const posMatch = pic.match(/<a:off x="(-?\d+)" y="(-?\d+)"\/>\s*<a:ext cx="(-?\d+)" cy="(-?\d+)"\/>/);
            if (posMatch) {
              const xEmu = Number(posMatch[1]);
              const yEmu = Number(posMatch[2]);
              const cxEmu = Number(posMatch[3]);
              const cyEmu = Number(posMatch[4]);

              const imgX = Math.round(xEmu / 12700);
              const imgW = Math.round(cxEmu / 12700);
              const imgH = Math.round(cyEmu / 12700);
              const imgY = Math.round(slideHeight - yEmu / 12700 - imgH);

              if (imgW >= slideWidth * 0.9 && imgH >= slideHeight * 0.9) {
                slidePage.drawImage(embedded, { x: 0, y: 0, width: slideWidth, height: slideHeight });
              } else {
                slidePage.drawImage(embedded, {
                  x: Math.max(0, imgX),
                  y: Math.max(0, imgY),
                  width: Math.min(slideWidth, imgW),
                  height: Math.min(slideHeight, imgH),
                });
              }
            } else {
              slidePage.drawImage(embedded, { x: 0, y: 0, width: slideWidth, height: slideHeight });
            }
          } catch (imgErr) {
            console.warn("[PPTX Image Embed Warning]:", imgErr);
          }
        }

        // Render tables from <p:graphicFrame> (e.g. implementation cost tables, schedules)
        const graphicFrames = slideXml.match(/<p:graphicFrame[\s\S]*?<\/p:graphicFrame>/g) || [];
        for (const gf of graphicFrames) {
          const trMatches = gf.match(/<a:tr[\s\S]*?<\/a:tr>/g) || [];
          if (trMatches.length > 0) {
            const posMatch = gf.match(/<a:off x="(-?\d+)" y="(-?\d+)"\/>\s*<a:ext cx="(-?\d+)" cy="(-?\d+)"\/>/);
            let gfX = 60;
            let gfY = slideHeight - 160;
            let gfW = slideWidth - 120;
            if (posMatch) {
              gfX = Math.max(30, Math.round(Number(posMatch[1]) / 12700));
              const cy = Math.round(Number(posMatch[4]) / 12700);
              gfY = Math.max(40, Math.round(slideHeight - Number(posMatch[2]) / 12700 - cy));
              gfW = Math.max(200, Math.round(Number(posMatch[3]) / 12700));
            }

            const tableData: string[][] = [];
            for (const tr of trMatches) {
              const tcMatches = tr.match(/<a:tc[\s\S]*?<\/a:tc>/g) || [];
              const rowTexts = tcMatches.map((tc: string) => {
                const t = tc.match(/<a:t[^>]*>([^<]+)<\/a:t>/g) || [];
                return t.map((m: string) => m.replace(/<[^>]+>/g, "").trim()).filter(Boolean).join(" ");
              });
              tableData.push(rowTexts);
            }

            let tableY = gfY + tableData.length * 20;
            for (let rIdx = 0; rIdx < tableData.length; rIdx++) {
              const row = tableData[rIdx];
              const isHdr = rIdx === 0;
              const colW = Math.floor(gfW / Math.max(1, row.length));
              for (let cIdx = 0; cIdx < row.length; cIdx++) {
                const cellText = row[cIdx] || "";
                if (cellText) {
                  slidePage.drawText(cellText.slice(0, 40), {
                    x: Math.max(20, gfX + cIdx * colW),
                    y: Math.max(20, tableY),
                    size: isHdr ? 11 : 10,
                    font: isHdr ? boldFont : font,
                    color: rgb(0.1, 0.15, 0.25),
                  });
                }
              }
              tableY -= 20;
            }
          }
        }

        // Render text elements and shapes (<p:sp>)
        const spBlocks = slideXml.match(/<p:sp[\s\S]*?<\/p:sp>/g) || [];
        let fallbackY = slideHeight - 60;

        for (const sp of spBlocks) {
          const paraMatches = sp.match(/<a:p[\s\S]*?<\/a:p>/g) || [];
          const posMatch = sp.match(/<a:off x="(-?\d+)" y="(-?\d+)"\/>\s*<a:ext cx="(-?\d+)" cy="(-?\d+)"\/>/);
          let targetX = 50;
          let targetY = fallbackY;

          if (posMatch) {
            targetX = Math.max(30, Math.round(Number(posMatch[1]) / 12700));
            targetY = Math.max(30, Math.round(slideHeight - Number(posMatch[2]) / 12700 - 16));
          }

          for (const para of paraMatches) {
            const textMatches = para.match(/<a:t[^>]*>([^<]+)<\/a:t>/g) || [];
            const lineText = textMatches
              .map((t: string) => t.replace(/<[^>]+>/g, "").trim())
              .filter(Boolean)
              .join(" ");

            if (!lineText) continue;

            const isTitle = /type="(title|ctrTitle)"/i.test(sp) || targetY > slideHeight - 120;
            const fSize = isTitle ? 18 : 12;
            const fUse = isTitle ? boldFont : font;

            const maxW = slideWidth - targetX - 40;
            let displayText = lineText;
            while (displayText.length > 0 && fUse.widthOfTextAtSize(displayText, fSize) > maxW) {
              displayText = displayText.slice(0, -4) + "...";
            }

            slidePage.drawText(displayText, {
              x: targetX,
              y: targetY,
              size: fSize,
              font: fUse,
              color: rgb(0.1, 0.15, 0.25),
            });

            targetY -= fSize + 8;
            fallbackY = Math.min(fallbackY, targetY);
          }
        }
      }

      const buffer = Buffer.from(await pdfDoc.save());

      if (process.env.CLOUDINARY_CLOUD_NAME) {
        try {
          const { CloudinaryStorageAdapter } = require("@/lib/storage/cloudinary");
          const storage = new CloudinaryStorageAdapter();
          storage
            .uploadBuffer({
              buffer,
              folder: process.env.CLOUDINARY_FOLDER || "xspaceweb-studio-dev",
              publicId: `ppt_to_pdf_${Date.now()}_${baseName.slice(0, 20)}`,
              resourceType: "raw",
              format: "pdf",
            })
            .catch((err: any) => console.warn("[Cloudinary PPT backup notice]:", err?.message));
        } catch {}
      }

      return {
        buffer,
        fileName: `${baseName}.pdf`,
        mimeType: "application/pdf",
      };
    }

    case "pdf-to-images": {
      // High-resolution page rendering to PNG (single image for 1 page, ZIP archive for multi-page)
      try {
        const { PDFParse } = require("pdf-parse");
        const parser = new PDFParse({ data: new Uint8Array(fileBuffer) });
        // Scale 1.0 renders 4x faster than 2.0 while maintaining full reading sharpness
        const screenshotResult = await parser.getScreenshot({ scale: 1.0 });
        await parser.destroy();
        if (screenshotResult?.pages && screenshotResult.pages.length > 0) {
          const pages = screenshotResult.pages;

          if (pages.length === 1) {
            const firstPage = pages[0];
            const imgBuffer = firstPage.data
              ? Buffer.from(firstPage.data)
              : Buffer.from(firstPage.dataUrl.replace(/^data:image\/\w+;base64,/, ""), "base64");
            return {
              buffer: imgBuffer,
              fileName: `${baseName}-page1.png`,
              mimeType: "image/png",
            };
          }

          const JSZip = require("jszip");
          const zip = new JSZip();

          for (let i = 0; i < pages.length; i++) {
            const p = pages[i];
            const pNum = String(i + 1).padStart(2, "0");
            const imgBuffer = p.data
              ? Buffer.from(p.data)
              : Buffer.from(p.dataUrl.replace(/^data:image\/\w+;base64,/, ""), "base64");
            zip.file(`${baseName}-page-${pNum}.png`, imgBuffer);
          }

          const zipBuffer = await zip.generateAsync({ type: "nodebuffer", compression: "DEFLATE" });
          return {
            buffer: zipBuffer,
            fileName: `${baseName}-images.zip`,
            mimeType: "application/zip",
          };
        }
      } catch (err) {
        console.warn("[pdf-to-images screenshot warning]:", err);
      }

      // Embedded raster extraction fallback
      try {
        const { PDFParse } = require("pdf-parse");
        const parser = new PDFParse({ data: new Uint8Array(fileBuffer) });
        const imgResult = await parser.getImage({ imageBuffer: true });
        await parser.destroy();
        if (imgResult && imgResult.pages && imgResult.pages.length > 0) {
          const extractedList: Buffer[] = [];
          for (const p of imgResult.pages) {
            if (p.images && p.images.length > 0) {
              for (const img of p.images) {
                if (img.data) extractedList.push(Buffer.from(img.data));
              }
            }
          }

          if (extractedList.length === 1) {
            return {
              buffer: extractedList[0],
              fileName: `${baseName}-page1.png`,
              mimeType: "image/png",
            };
          }

          if (extractedList.length > 1) {
            const JSZip = require("jszip");
            const zip = new JSZip();
            extractedList.forEach((buf, idx) => {
              const num = String(idx + 1).padStart(2, "0");
              zip.file(`${baseName}-image-${num}.png`, buf);
            });
            const zipBuffer = await zip.generateAsync({ type: "nodebuffer", compression: "DEFLATE" });
            return {
              buffer: zipBuffer,
              fileName: `${baseName}-images.zip`,
              mimeType: "application/zip",
            };
          }
        }
      } catch (err) {
        console.warn("[pdf-to-images extract warning]:", err);
      }

      // Fallback single page visual snapshot extraction
      const pdfDoc = await PDFDocument.load(fileBuffer, { ignoreEncryption: true });
      const canvasPdf = await PDFDocument.create();
      const [copiedPage] = await canvasPdf.copyPages(pdfDoc, [0]);
      canvasPdf.addPage(copiedPage);

      const buffer = Buffer.from(await canvasPdf.save());
      return {
        buffer,
        fileName: `${baseName}-page1.pdf`,
        mimeType: "application/pdf",
      };
    }

    case "images-to-pdf": {
      const pdfDoc = await PDFDocument.create();

      const allBuffers = [fileBuffer, ...(additionalFiles?.map((f) => f.buffer) || [])];

      for (const imgBuf of allBuffers) {
        let embeddedImage;
        const isPng = imgBuf.slice(0, 8).toString("hex") === "89504e470d0a1a0a";
        const isJpg = imgBuf.slice(0, 3).toString("hex") === "ffd8ff";

        if (isPng) {
          embeddedImage = await pdfDoc.embedPng(imgBuf);
        } else if (isJpg) {
          try {
            embeddedImage = await pdfDoc.embedJpg(imgBuf);
          } catch {
            embeddedImage = await pdfDoc.embedPng(imgBuf);
          }
        } else {
          // Transcode WebP / other image formats via @napi-rs/canvas
          try {
            const { loadImage, createCanvas } = require("@napi-rs/canvas");
            const loaded = await loadImage(imgBuf);
            const canvas = createCanvas(loaded.width, loaded.height);
            const ctx = canvas.getContext("2d");
            ctx.drawImage(loaded, 0, 0);
            const pngBytes = canvas.toBuffer("image/png");
            embeddedImage = await pdfDoc.embedPng(pngBytes);
          } catch {
            try {
              embeddedImage = await pdfDoc.embedPng(imgBuf);
            } catch {
              embeddedImage = await pdfDoc.embedJpg(imgBuf);
            }
          }
        }

        const { width, height } = embeddedImage;
        const page = pdfDoc.addPage([width, height]);
        page.drawImage(embeddedImage, {
          x: 0,
          y: 0,
          width,
          height,
        });
      }

      const buffer = Buffer.from(await pdfDoc.save());

      // Cloudinary cloud backup (non-blocking)
      if (process.env.CLOUDINARY_CLOUD_NAME) {
        try {
          const { CloudinaryStorageAdapter } = require("@/lib/storage/cloudinary");
          const storage = new CloudinaryStorageAdapter();
          const publicId = `images_to_pdf_${Date.now()}_${baseName.slice(0, 20)}`;
          storage
            .uploadBuffer({
              buffer,
              folder: process.env.CLOUDINARY_FOLDER || "xspaceweb-studio-dev",
              publicId,
              resourceType: "raw",
              format: "pdf",
            })
            .catch((err: any) => console.warn("[Cloudinary backup notice]:", err?.message));
        } catch {}
      }

      const cleanCustomName = customOutputName?.trim();
      const resolvedPdfName = cleanCustomName
        ? (cleanCustomName.toLowerCase().endsWith(".pdf") ? cleanCustomName : `${cleanCustomName}.pdf`)
        : (baseName ? `${baseName}.pdf` : "converted_images.pdf");

      return {
        buffer,
        fileName: resolvedPdfName,
        mimeType: "application/pdf",
      };
    }

    default:
      throw new Error(`Unsupported conversion action: ${action}`);
  }
}
