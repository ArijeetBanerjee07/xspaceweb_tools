import { NextRequest, NextResponse } from "next/server";
import {
  parseDocumentText,
  chatWithPdf,
  summarizePdf,
  documentQA,
  extractTextTablesEntities,
  extractInvoiceReceipt,
  translateDocument,
  rewriteSimplifyDocument,
  compareTwoDocuments,
  exportExtractedData,
  extractActionItemsKeyPoints,
} from "@/lib/aiDocumentStudio";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get("content-type") || "";

    // 1. Handle multipart form uploads (parsing PDF / DOCX / TXT)
    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      const action = formData.get("action") as string;
      const file = formData.get("file") as File | null;

      if (!file) {
        return NextResponse.json({ error: "No file provided" }, { status: 400 });
      }

      const buffer = Buffer.from(await file.arrayBuffer());
      const parsed = await parseDocumentText(buffer, file.name);

      if (action === "parse-only") {
        return NextResponse.json({
          fileName: file.name,
          text: parsed.text,
          pages: parsed.pages,
          pageCount: parsed.pages.length,
        });
      }

      // If action is directly an extraction or analysis on uploaded file
      if (action === "summarize") {
        const summary = await summarizePdf(parsed.text, "detailed");
        return NextResponse.json({ summary, pageCount: parsed.pages.length });
      }

      if (action === "extract-invoice") {
        const invoiceData = await extractInvoiceReceipt(parsed.text);
        return NextResponse.json(invoiceData);
      }

      if (action === "extract-entities") {
        const entities = await extractTextTablesEntities(parsed.text);
        return NextResponse.json(entities);
      }

      return NextResponse.json({
        fileName: file.name,
        text: parsed.text,
        pages: parsed.pages,
        pageCount: parsed.pages.length,
      });
    }

    // 2. Handle JSON API actions
    const body = await req.json();
    const action = body.action;

    if (!action) {
      return NextResponse.json({ error: "Missing action in request body" }, { status: 400 });
    }

    switch (action) {
      case "chat": {
        const answer = await chatWithPdf(body.docContent || "", body.question || "", body.history || []);
        return NextResponse.json({ answer });
      }

      case "summarize": {
        const summary = await summarizePdf(body.docContent || "", body.style || "detailed");
        return NextResponse.json({ summary });
      }

      case "qa": {
        const answer = await documentQA(body.docs || [], body.question || "");
        return NextResponse.json({ answer });
      }

      case "extract-entities": {
        const data = await extractTextTablesEntities(body.docContent || "", {
          focus: body.focus,
          targetCategory: body.targetCategory,
        });
        return NextResponse.json(data);
      }

      case "extract-invoice": {
        const data = await extractInvoiceReceipt(body.docContent || "");
        return NextResponse.json(data);
      }

      case "translate": {
        const translated = await translateDocument(body.docContent || "", body.targetLanguage || "Spanish");
        return NextResponse.json({ translatedText: translated });
      }

      case "rewrite": {
        const rewritten = await rewriteSimplifyDocument(body.docContent || "", {
          tone: body.tone || "Professional",
          readingLevel: body.readingLevel || "Standard",
        });
        return NextResponse.json({ rewrittenText: rewritten });
      }

      case "compare": {
        const comparison = await compareTwoDocuments(
          body.doc1 || { name: "Document 1", content: "" },
          body.doc2 || { name: "Document 2", content: "" }
        );
        return NextResponse.json({ comparison });
      }

      case "export": {
        const exportResult = await exportExtractedData(body.data, body.format || "xlsx");
        return new Response(new Uint8Array(exportResult.buffer), {
          status: 200,
          headers: {
            "Content-Type": exportResult.mimeType,
            "Content-Disposition": `attachment; filename="${encodeURIComponent(exportResult.fileName)}"`,
            "x-filename": encodeURIComponent(exportResult.fileName),
          },
        });
      }

      case "action-items": {
        const actionItems = await extractActionItemsKeyPoints(body.docContent || "");
        return NextResponse.json({ actionItems });
      }

      default:
        return NextResponse.json({ error: `Unsupported action: ${action}` }, { status: 400 });
    }
  } catch (error: any) {
    console.error("[AI_DOC_API_ERROR]", error);
    return NextResponse.json(
      { error: error?.message || "Internal server error in AI Document Studio" },
      { status: 500 }
    );
  }
}
