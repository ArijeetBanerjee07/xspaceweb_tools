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
  | "images-to-pdf"
  | "pdf-to-text";

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
          const str = String(it.str || "");
          if (!str) continue;

          const x = it.transform[4];
          const fontSize = Math.abs(it.transform[0]) || Math.abs(it.transform[3]) || it.height || 10;
          const w = it.width || (str.length * fontSize * 0.52);

          if (lastRight === null) {
            curCol = str;
          } else {
            const gap = x - lastRight;
            // Column separation threshold (tabular cells or wide tabs)
            const colGapThreshold = Math.max(22, fontSize * 2.2);

            if (gap >= colGapThreshold) {
              if (curCol.trim()) cols.push(curCol.trim());
              curCol = str;
            } else if (gap > 1.8 && !curCol.endsWith(" ") && !str.startsWith(" ")) {
              // Standard inter-word whitespace
              curCol += " " + str;
            } else {
              // Contiguous letters in the same word (gap <= 1.8 or kerning/ligature)
              curCol += str;
            }
          }
          lastRight = x + w;
        }

        if (curCol.trim()) cols.push(curCol.trim());

        if (cols.length > 0) {
          allRows.push({
            pageNumber: p,
            columns: cols,
            fullLine: cols.length === 1 ? cols[0] : cols.join("    "),
          });
          allLines.push(cols.length === 1 ? cols[0] : cols.join("    "));
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

        // If tableBatch only has 1 row, it's not a real multi-row table (e.g. aligned metadata, date/author, header)
        if (tableBatch.length === 1) {
          const singleRow = tableBatch[0];
          children.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: singleRow.join("        "),
                  size: 22,
                  color: "334155",
                }),
              ],
              spacing: { after: 120, before: 40 },
            })
          );
          tableBatch = [];
          return;
        }

        const maxCols = Math.max(...tableBatch.map((r) => r.length));
        if (maxCols === 0) {
          tableBatch = [];
          return;
        }

        // Calculate proportional column widths based on maximum character count per column
        const colLengths = Array.from({ length: maxCols }, (_, c) => {
          let maxLen = 4;
          for (const r of tableBatch) {
            const val = r[c] || "";
            if (val.length > maxLen) maxLen = val.length;
          }
          return maxLen;
        });
        const totalContentLen = colLengths.reduce((a, b) => a + b, 0);
        const colWidthPercents = colLengths.map((len) =>
          Math.max(10, Math.round((len / totalContentLen) * 100))
        );
        const sumPercents = colWidthPercents.reduce((a, b) => a + b, 0);
        const finalWidths = colWidthPercents.map((w) =>
          Math.floor((w / sumPercents) * 100)
        );

        const tableBorder = {
          style: BorderStyle.SINGLE,
          size: 4,
          color: "CBD5E1",
        };

        const cellBorders = {
          top: tableBorder,
          bottom: tableBorder,
          left: tableBorder,
          right: tableBorder,
        };

        const tableRows = tableBatch.map((row, rowIdx) => {
          const isHeader = rowIdx === 0;
          return new TableRow({
            tableHeader: isHeader,
            children: Array.from({ length: maxCols }).map((_, colIdx) => {
              const textVal = row[colIdx] || "";
              return new TableCell({
                width: {
                  size: finalWidths[colIdx] || Math.floor(100 / maxCols),
                  type: WidthType.PERCENTAGE,
                },
                borders: cellBorders,
                shading: {
                  fill: isHeader ? "F1F5F9" : rowIdx % 2 === 1 ? "F8FAFC" : "FFFFFF",
                },
                margins: { top: 100, bottom: 100, left: 140, right: 140 },
                children: [
                  new Paragraph({
                    children: [
                      new TextRun({
                        text: textVal,
                        bold: isHeader,
                        size: isHeader ? 21 : 20,
                        color: isHeader ? "0F172A" : "334155",
                      }),
                    ],
                    spacing: { before: 40, after: 40 },
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

        children.push(new Paragraph({ text: "", spacing: { after: 120 } }));
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

          // Check if this line looks like a major section heading (All Caps, short)
          const isHeading =
            lineText.length < 50 &&
            lineText === lineText.toUpperCase() &&
            /[A-Z]/.test(lineText) &&
            !lineText.includes(":") &&
            !lineText.endsWith(".");

          // Check if this line looks like a sub-heading (short and distinct)
          const isSubheading =
            !isHeading &&
            lineText.length < 50 &&
            (lineText.endsWith(":") || /^(section|chapter|part|page|sheet|note|table|terms)\b/i.test(lineText));

          const isBullet = /^[•\-\*▪►]\s*/.test(lineText) || /^\d+[\.\)]\s+/.test(lineText);
          const cleanText = isBullet ? lineText.replace(/^[•\-\*▪►]\s*/, "") : lineText;

          children.push(
            new Paragraph({
              heading: isHeading ? HeadingLevel.HEADING_2 : undefined,
              bullet: isBullet ? { level: 0 } : undefined,
              children: [
                new TextRun({
                  text: cleanText,
                  bold: isHeading || isSubheading,
                  size: isHeading ? 26 : isSubheading ? 23 : 21,
                  color: isHeading ? "0F172A" : isSubheading ? "1E293B" : "334155",
                }),
              ],
              spacing: {
                before: isHeading ? 200 : isSubheading ? 140 : 40,
                after: isHeading ? 100 : isSubheading ? 80 : 80,
                line: 276, // 1.15 line spacing
              },
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
      // Clean Unicode characters that StandardFonts (WinAnsi) cannot encode
      const sanitizeWinAnsi = (str: string): string => {
        if (!str) return "";
        return str
          .replace(/[≥]/g, ">=")
          .replace(/[≤]/g, "<=")
          .replace(/[≠]/g, "!=")
          .replace(/[±]/g, "+/-")
          .replace(/[×]/g, "x")
          .replace(/[÷]/g, "/")
          .replace(/[–—]/g, "-")
          .replace(/['']/g, "'")
          .replace(/[""]/g, '"')
          .replace(/[•▪►]/g, "*")
          .replace(/[…]/g, "...")
          .replace(/[→⇒]/g, "->")
          .replace(/[←⇐]/g, "<-")
          .replace(/[µ]/g, "u")
          .replace(/[°]/g, " deg")
          .replace(/[²]/g, "^2")
          .replace(/[³]/g, "^3")
          .replace(/[^\x09\x0A\x0D\x20-\x7E\xA0-\xFF]/g, " "); // Strip anything else outside WinAnsi
      };

      let htmlContent = "";
      try {
        const res = await mammoth.convertToHtml({ buffer: fileBuffer });
        htmlContent = res.value || "";
      } catch (err) {
        console.warn("Mammoth HTML conversion fallback:", err);
      }

      const pdfDoc = await PDFDocument.create();
      const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

      const pageWidth = 595.28;
      const pageHeight = 841.89;
      const margin = 48;
      const contentWidth = pageWidth - margin * 2;
      const baseLineHeight = 15;

      let page = pdfDoc.addPage([pageWidth, pageHeight]);
      let y = pageHeight - margin;

      const ensureSpace = (needed: number) => {
        if (y < margin + needed) {
          page = pdfDoc.addPage([pageWidth, pageHeight]);
          y = pageHeight - margin;
        }
      };

      // Draw Document Title Header
      page.drawText(sanitizeWinAnsi(baseName), {
        x: margin,
        y: y - 10,
        size: 18,
        font: boldFont,
        color: rgb(0.08, 0.12, 0.2),
      });
      y -= 38;

      if (!htmlContent) {
        // Fallback for empty or plain documents
        let raw = "";
        try {
          const res = await mammoth.extractRawText({ buffer: fileBuffer });
          raw = res.value || "";
        } catch {}
        const text = sanitizeWinAnsi(raw.trim() || `Document: ${originalFileName}\nWord document processed.`);
        for (const line of text.split(/\r?\n/)) {
          ensureSpace(baseLineHeight);
          page.drawText(line.slice(0, 95), {
            x: margin,
            y,
            size: 10,
            font,
            color: rgb(0.2, 0.23, 0.28),
          });
          y -= baseLineHeight;
        }
      } else {
        // Parse HTML blocks: tables, headings, list items, paragraphs
        const blockRegex = /<(table|h[1-6]|p|li)[\s\S]*?<\/\1>/gi;
        const blocks = htmlContent.match(blockRegex) || [];

        const stripHtml = (html: string) =>
          html.replace(/<[^>]*>/g, " ").replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/\s+/g, " ").trim();

        for (const block of blocks) {
          const lower = block.toLowerCase();

          if (lower.startsWith("<table")) {
            // Parse table rows and cells
            const rowMatches = block.match(/<tr[\s\S]*?<\/tr>/gi) || [];
            if (rowMatches.length === 0) continue;

            const tableData: string[][] = [];
            for (const tr of rowMatches) {
              const cellMatches = tr.match(/<(td|th)[\s\S]*?<\/\1>/gi) || [];
              const rowCells = cellMatches.map((c) => sanitizeWinAnsi(stripHtml(c)));
              if (rowCells.length > 0) tableData.push(rowCells);
            }

            if (tableData.length === 0) continue;

            const numCols = Math.min(Math.max(...tableData.map((r) => r.length), 1), 8);
            const colWidth = Math.floor(contentWidth / numCols);
            const tableRowHeight = 18;

            y -= 8;
            for (let rIdx = 0; rIdx < tableData.length; rIdx++) {
              ensureSpace(tableRowHeight);
              const isHeaderRow = rIdx === 0;

              // Header background fill
              if (isHeaderRow) {
                page.drawRectangle({
                  x: margin,
                  y: y - 3,
                  width: numCols * colWidth,
                  height: tableRowHeight,
                  color: rgb(0.93, 0.95, 0.98),
                });
              }

              for (let cIdx = 0; cIdx < numCols; cIdx++) {
                const cellText = (tableData[rIdx][cIdx] || "").slice(0, Math.floor(colWidth / 6));
                const cellX = margin + cIdx * colWidth;

                page.drawRectangle({
                  x: cellX,
                  y: y - 3,
                  width: colWidth,
                  height: tableRowHeight,
                  borderColor: rgb(0.85, 0.88, 0.92),
                  borderWidth: 0.5,
                });

                if (cellText) {
                  page.drawText(cellText, {
                    x: cellX + 4,
                    y: y + 2,
                    size: 8.5,
                    font: isHeaderRow ? boldFont : font,
                    color: isHeaderRow ? rgb(0.08, 0.12, 0.2) : rgb(0.2, 0.23, 0.28),
                  });
                }
              }
              y -= tableRowHeight;
            }
            y -= 10;
          } else if (lower.startsWith("<h")) {
            const hText = sanitizeWinAnsi(stripHtml(block));
            if (!hText) continue;
            ensureSpace(24);
            y -= 6;
            page.drawText(hText.slice(0, 80), {
              x: margin,
              y,
              size: 13,
              font: boldFont,
              color: rgb(0.09, 0.15, 0.28),
            });
            y -= 18;
          } else {
            // Paragraph or bullet item
            const pText = sanitizeWinAnsi(stripHtml(block));
            if (!pText) continue;

            const isLi = lower.startsWith("<li");
            const prefix = isLi ? "* " : "";
            const fullText = prefix + pText;

            const words = fullText.split(/\s+/);
            let currentLine = "";

            for (const word of words) {
              const testLine = currentLine ? `${currentLine} ${word}` : word;
              const testWidth = font.widthOfTextAtSize(testLine, 9.5);

              if (testWidth > contentWidth && currentLine) {
                ensureSpace(baseLineHeight);
                page.drawText(currentLine, {
                  x: margin + (isLi ? 10 : 0),
                  y,
                  size: 9.5,
                  font,
                  color: rgb(0.2, 0.23, 0.28),
                });
                y -= baseLineHeight;
                currentLine = word;
              } else {
                currentLine = testLine;
              }
            }

            if (currentLine) {
              ensureSpace(baseLineHeight);
              page.drawText(currentLine, {
                x: margin + (isLi ? 10 : 0),
                y,
                size: 9.5,
                font,
                color: rgb(0.2, 0.23, 0.28),
              });
              y -= baseLineHeight;
            }
            y -= 3;
          }
        }
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
      workbook.creator = "XSpaceWeb Tools";
      workbook.created = new Date();

      // Check if document has sheet title, e.g. "Sheet: Sheet1"
      let defaultSheetName = "Sheet1";
      let startRowIdx = 0;

      if (rows.length > 0 && rows[0].columns.length === 1 && /^sheet:\s*(.+)$/i.test(rows[0].columns[0])) {
        const match = rows[0].columns[0].match(/^sheet:\s*(.+)$/i);
        if (match && match[1]) {
          defaultSheetName = match[1].trim().slice(0, 31);
          startRowIdx = 1;
        }
      }

      // Group rows by PDF page number if multi-page document, or combine cleanly
      const pageNumbers = Array.from(new Set(rows.map((r) => r.pageNumber || 1))).sort((a, b) => a - b);
      const isMultiPage = pageNumbers.length > 1;

      // Thin border style for clean Excel presentation across all spreadsheet apps (Excel, Google Sheets, LibreOffice, Numbers)
      const thinBorder: any = {
        top: { style: "thin", color: { argb: "FFD4D4D8" } },
        left: { style: "thin", color: { argb: "FFD4D4D8" } },
        bottom: { style: "thin", color: { argb: "FFD4D4D8" } },
        right: { style: "thin", color: { argb: "FFD4D4D8" } },
      };

      for (const pNum of (isMultiPage ? pageNumbers : [1])) {
        const pageRows = rows.filter((r, idx) => (isMultiPage ? r.pageNumber === pNum : idx >= startRowIdx));
        if (pageRows.length === 0) continue;

        const sheetName = isMultiPage ? `Page ${pNum}` : defaultSheetName;
        const sheet = workbook.addWorksheet(sheetName, {
          views: [{ showGridLines: true }],
        });

        const maxCols = Math.max(1, ...pageRows.map((r) => r.columns.length));
        const colWidths: number[] = Array(maxCols).fill(14);
        let isFirstTableContentRow = true;

        for (const row of pageRows) {
          if (row.columns.length === 0) continue;

          // Convert string values to numbers/currencies where suitable
          const cellValues = row.columns.map((colStr, colIdx) => {
            const trimmed = colStr.trim();
            colWidths[colIdx] = Math.max(colWidths[colIdx] || 14, trimmed.length + 3);

            // Clean currency symbols or commas for numeric parsing
            const numericCandidate = trimmed.replace(/^[$€£₹]\s?/, "").replace(/,/g, "");
            const num = Number(numericCandidate);
            if (!isNaN(num) && numericCandidate !== "" && !trimmed.startsWith("0") && numericCandidate.length < 15) {
              return num;
            }
            return trimmed;
          });

          const addedRow = sheet.addRow(cellValues);

          // Apply styling
          if (isFirstTableContentRow && row.columns.length > 1) {
            addedRow.font = { bold: true, color: { argb: "FF0F172A" }, size: 10 };
            addedRow.fill = {
              type: "pattern",
              pattern: "solid",
              fgColor: { argb: "FFF1F5F9" },
            };
            addedRow.height = 24;
            addedRow.alignment = { vertical: "middle", horizontal: "left" };
            addedRow.eachCell((cell) => {
              cell.border = thinBorder;
            });
            isFirstTableContentRow = false;
          } else if (row.columns.length > 1) {
            addedRow.height = 20;
            addedRow.font = { size: 9.5, color: { argb: "FF334155" } };
            addedRow.alignment = { vertical: "middle" };
            addedRow.eachCell((cell, colIdx) => {
              cell.border = thinBorder;
              if (typeof cell.value === "number") {
                cell.alignment = { vertical: "middle", horizontal: "right" };
              }
            });
          } else {
            // Single column line / heading
            addedRow.font = { bold: true, size: 10, color: { argb: "FF1E293B" } };
            addedRow.height = 22;
          }
        }

        // Apply calculated column widths (bounded between 14 and 45 characters)
        sheet.columns = colWidths.map((w) => ({ width: Math.min(Math.max(w, 14), 45) }));
      }

      const buffer = Buffer.from(await workbook.xlsx.writeBuffer());
      return {
        buffer,
        fileName: `${baseName}.xlsx`,
        mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      };
    }

    case "excel-to-pdf": {
      const workbook = new ExcelJS.Workbook();
      const isCsv = originalFileName.toLowerCase().endsWith(".csv");

      if (isCsv) {
        const stream = require("stream");
        const bufferStream = new stream.PassThrough();
        bufferStream.end(fileBuffer);
        await workbook.csv.read(bufferStream);
      } else {
        await workbook.xlsx.load(fileBuffer as any);
      }

      const pdfDoc = await PDFDocument.create();
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

      const pageWidth = 841.89; // Landscape A4
      const pageHeight = 595.28;
      const margin = 36;
      const contentWidth = pageWidth - margin * 2;

      // Helper to cleanly extract text from any ExcelJS cell value type
      const getCellString = (val: any): string => {
        if (val === null || val === undefined) return "";
        if (typeof val === "object") {
          if (val.result !== undefined) return String(val.result);
          if (Array.isArray(val.richText)) return val.richText.map((t: any) => t.text || "").join("");
          if (val.text !== undefined) return String(val.text);
          if (val instanceof Date) return val.toLocaleDateString();
          return "";
        }
        return String(val);
      };

      const sheets = workbook.worksheets.filter((ws) => ws.rowCount > 0);
      const activeSheets = sheets.length > 0 ? sheets : [workbook.addWorksheet("Sheet1")];

      for (const worksheet of activeSheets) {
        let page = pdfDoc.addPage([pageWidth, pageHeight]);
        let y = pageHeight - margin;

        // Sheet Title Header
        page.drawText(`Sheet: ${worksheet.name}`, {
          x: margin,
          y,
          size: 14,
          font: boldFont,
          color: rgb(0.08, 0.35, 0.22),
        });
        y -= 22;

        // Determine max columns (cap at 12 to maintain readable fit on landscape A4)
        const maxCols = Math.min(Math.max(worksheet.columnCount || 1, 1), 12);
        const colWidth = Math.floor(contentWidth / maxCols);
        const rowHeight = 18;

        worksheet.eachRow((row, rowNumber) => {
          if (y < margin + rowHeight) {
            page = pdfDoc.addPage([pageWidth, pageHeight]);
            y = pageHeight - margin;
          }

          const isHeader = rowNumber === 1;

          // Header background fill
          if (isHeader) {
            page.drawRectangle({
              x: margin,
              y: y - 3,
              width: maxCols * colWidth,
              height: rowHeight,
              color: rgb(0.93, 0.95, 0.97),
            });
          }

          // Draw cells with exact absolute column positioning
          for (let colIdx = 1; colIdx <= maxCols; colIdx++) {
            const cell = row.getCell(colIdx);
            const rawVal = cell.value;
            const textVal = getCellString(rawVal).trim();
            const cellX = margin + (colIdx - 1) * colWidth;

            // Draw cell border
            page.drawRectangle({
              x: cellX,
              y: y - 3,
              width: colWidth,
              height: rowHeight,
              borderColor: rgb(0.85, 0.88, 0.92),
              borderWidth: 0.5,
            });

            if (textVal) {
              // Truncate based on column width
              const maxChars = Math.max(8, Math.floor(colWidth / 5.8));
              const truncated = textVal.length > maxChars ? textVal.slice(0, maxChars - 1) + "…" : textVal;

              page.drawText(truncated, {
                x: cellX + 4,
                y: y + 2,
                size: 8.5,
                font: isHeader ? boldFont : font,
                color: isHeader ? rgb(0.08, 0.12, 0.2) : rgb(0.2, 0.23, 0.28),
              });
            }
          }

          y -= rowHeight;
        });
      }

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

    case "pdf-to-text": {
      const extracted = await extractStructuredPdf(fileBuffer);
      const textOutput = extracted.rawText || extracted.lines.join("\n") || "No selectable text found in the document.";
      const cleanCustomName = customOutputName?.trim();
      const resolvedTextName = cleanCustomName
        ? (cleanCustomName.toLowerCase().endsWith(".txt") ? cleanCustomName : `${cleanCustomName}.txt`)
        : (baseName ? `${baseName}.txt` : "extracted_text.txt");

      return {
        buffer: Buffer.from(textOutput, "utf-8"),
        fileName: resolvedTextName,
        mimeType: "text/plain; charset=utf-8",
      };
    }

    default:
      throw new Error(`Unsupported conversion action: ${action}`);
  }
}
