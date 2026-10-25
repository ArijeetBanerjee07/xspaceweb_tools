import { NextRequest, NextResponse } from "next/server";
import {
  generateAiDocument,
  generateDocx,
  generateXlsx,
  suggestSpreadsheetFormula,
  generateChartTableXlsx,
  generateInvoiceDocx,
  generateReportDocx,
  generateBusinessLetterDocx,
  generateSpreadsheetToDocMerge,
  generateBatchDocuments,
  aiDraftDocument,
  aiDraftDocx,
  aiDraftXlsx,
  aiDraftReport,
  aiDraftBusinessLetter,
  aiDraftChartData,
  aiSuggestSpreadsheetFormula,
} from "@/lib/officeStudio";
import { convertDocument, ConvertAction } from "@/lib/converter";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get("content-type") || "";

    // 1. Handle multipart FormData (e.g. for conversions or file uploads)
    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      const action = formData.get("action") as string | null;

      if (action === "convert") {
        const convertAction = (formData.get("convertAction") || "pdf-to-word") as ConvertAction;
        const file = formData.get("file") as File | null;
        if (!file) {
          return NextResponse.json({ error: "No file provided for conversion" }, { status: 400 });
        }
        const buffer = Buffer.from(await file.arrayBuffer());
        const result = await convertDocument(buffer, file.name || "document", convertAction);
        return new Response(new Uint8Array(result.buffer), {
          status: 200,
          headers: {
            "Content-Type": result.mimeType,
            "Content-Disposition": `attachment; filename="${encodeURIComponent(result.fileName)}"`,
            "x-filename": encodeURIComponent(result.fileName),
          },
        });
      }
    }

    // 2. Handle JSON payload for generation & formula queries
    const body = await req.json();
    const action = body.action;

    if (!action) {
      return NextResponse.json({ error: "Missing action in request" }, { status: 400 });
    }

    switch (action) {
      // Dynamic AI Drafting Endpoints
      case "draft-ai-document": {
        const drafted = await aiDraftDocument({
          title: body.title || "Business Document",
          brief: body.brief || "",
          docType: body.docType || "proposal",
          tone: body.tone || "professional",
          mode: body.mode || "full",
        });
        return NextResponse.json(drafted);
      }

      case "draft-docx": {
        const drafted = await aiDraftDocx({
          title: body.title || "Document",
          prompt: body.prompt || body.content || "",
          author: body.author || "Office Studio User",
        });
        return NextResponse.json(drafted);
      }

      case "draft-xlsx": {
        const drafted = await aiDraftXlsx({
          title: body.title || "Workbook",
          prompt: body.prompt || "",
        });
        return NextResponse.json(drafted);
      }

      case "draft-report": {
        const drafted = await aiDraftReport({
          title: body.title || "Executive Report",
          reportType: body.reportType || "Operations Report",
          context: body.context || body.summary || body.prompt || "",
        });
        return NextResponse.json(drafted);
      }

      case "draft-letter": {
        const drafted = await aiDraftBusinessLetter({
          letterType: body.letterType || "Formal Letter",
          subject: body.subject || "Notification",
          sender: body.sender || { name: "Sender", title: "Manager", company: "Company", address: "City" },
          recipient: body.recipient || { name: "Recipient", title: "Client", company: "Client Co", address: "City" },
          details: body.details || "",
        });
        return NextResponse.json(drafted);
      }

      case "draft-chart": {
        const drafted = await aiDraftChartData({
          title: body.title || "Chart",
          type: body.type || "bar",
          prompt: body.prompt || "",
        });
        return NextResponse.json(drafted);
      }

      // Document File Generation Endpoints
      case "ai-document": {
        const buffer = await generateAiDocument({
          title: body.title || "Business Document",
          brief: body.brief || "",
          docType: body.docType || "proposal",
          tone: body.tone || "professional",
          customSections: body.sections || body.customSections,
          fullText: body.fullText,
          mode: body.mode || (body.fullText ? "full" : "sections"),
        });
        const fileName = `${(body.title || "ai_document").toLowerCase().replace(/[^a-z0-9]/g, "_")}.docx`;
        return new Response(new Uint8Array(buffer), {
          status: 200,
          headers: {
            "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            "Content-Disposition": `attachment; filename="${encodeURIComponent(fileName)}"`,
            "x-filename": encodeURIComponent(fileName),
          },
        });
      }

      case "docx": {
        const buffer = await generateDocx({
          title: body.title || "Untitled Document",
          author: body.author || "Office Studio User",
          content: body.content || "",
          sections: body.sections,
        });
        const fileName = `${(body.title || "document").toLowerCase().replace(/[^a-z0-9]/g, "_")}.docx`;
        return new Response(new Uint8Array(buffer), {
          status: 200,
          headers: {
            "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            "Content-Disposition": `attachment; filename="${encodeURIComponent(fileName)}"`,
            "x-filename": encodeURIComponent(fileName),
          },
        });
      }

      case "xlsx": {
        const buffer = await generateXlsx({
          title: body.title || "Workbook",
          sheetName: body.sheetName || "Sheet1",
          columns: body.columns || [{ header: "Column 1", key: "col1" }],
          rows: body.rows || [],
        });
        const fileName = `${(body.title || "workbook").toLowerCase().replace(/[^a-z0-9]/g, "_")}.xlsx`;
        return new Response(new Uint8Array(buffer), {
          status: 200,
          headers: {
            "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            "Content-Disposition": `attachment; filename="${encodeURIComponent(fileName)}"`,
            "x-filename": encodeURIComponent(fileName),
          },
        });
      }

      case "formula":
      case "suggest-formula": {
        const result = await aiSuggestSpreadsheetFormula(body.prompt || body.query || "");
        return NextResponse.json(result);
      }

      case "chart-table": {
        const buffer = await generateChartTableXlsx({
          title: body.title || "Visual Summary",
          type: body.type || "bar",
          labels: body.labels || ["Q1", "Q2", "Q3", "Q4"],
          values: body.values || [100, 200, 300, 400],
          seriesName: body.seriesName || "Metrics",
        });
        const fileName = `${(body.title || "visual_data").toLowerCase().replace(/[^a-z0-9]/g, "_")}.xlsx`;
        return new Response(new Uint8Array(buffer), {
          status: 200,
          headers: {
            "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            "Content-Disposition": `attachment; filename="${encodeURIComponent(fileName)}"`,
            "x-filename": encodeURIComponent(fileName),
          },
        });
      }

      case "invoice": {
        const buffer = await generateInvoiceDocx({
          invoiceNumber: body.invoiceNumber || `INV-${Date.now().toString().slice(-5)}`,
          date: body.date || new Date().toISOString().split("T")[0],
          dueDate: body.dueDate || new Date(Date.now() + 15 * 86400000).toISOString().split("T")[0],
          from: body.from || { name: "Seller Company", address: "City, Country", email: "billing@company.com" },
          billTo: body.billTo || { name: "Client Name", address: "Client Address", email: "client@example.com" },
          items: body.items || [{ description: "Consulting Services", quantity: 1, unitPrice: 1000 }],
          currency: body.currency || "INR",
          taxRatePercent: body.taxRatePercent ?? 18,
          notes: body.notes,
        });
        const fileName = `invoice_${body.invoiceNumber || "doc"}.docx`;
        return new Response(new Uint8Array(buffer), {
          status: 200,
          headers: {
            "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            "Content-Disposition": `attachment; filename="${encodeURIComponent(fileName)}"`,
            "x-filename": encodeURIComponent(fileName),
          },
        });
      }

      case "report": {
        const buffer = await generateReportDocx({
          title: body.title || "Corporate Executive Report",
          reportType: body.reportType || "Operations Report",
          author: body.author || "Reporting Directorate",
          date: body.date || new Date().toISOString().split("T")[0],
          summary: body.summary || "Summary of quarterly activities and performance indices.",
          keyMetrics: body.keyMetrics || [],
          findings: body.findings || [],
          recommendations: body.recommendations || [],
        });
        const fileName = `report_${(body.title || "summary").toLowerCase().replace(/[^a-z0-9]/g, "_")}.docx`;
        return new Response(new Uint8Array(buffer), {
          status: 200,
          headers: {
            "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            "Content-Disposition": `attachment; filename="${encodeURIComponent(fileName)}"`,
            "x-filename": encodeURIComponent(fileName),
          },
        });
      }

      case "business-letter": {
        const buffer = await generateBusinessLetterDocx({
          letterType: body.letterType || "Formal Letter",
          sender: body.sender || { name: "Sender Name", title: "Manager", company: "Company Ltd", address: "Office 101" },
          recipient: body.recipient || { name: "Recipient", title: "Client", company: "Recipient Co", address: "Address 202" },
          date: body.date || new Date().toISOString().split("T")[0],
          subject: body.subject || "Formal Notification",
          paragraphs: body.paragraphs || ["This is a formal communication."],
          signoff: body.signoff || "Sincerely,",
        });
        const fileName = `letter_${(body.subject || "notice").toLowerCase().replace(/[^a-z0-9]/g, "_").slice(0, 20)}.docx`;
        return new Response(new Uint8Array(buffer), {
          status: 200,
          headers: {
            "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            "Content-Disposition": `attachment; filename="${encodeURIComponent(fileName)}"`,
            "x-filename": encodeURIComponent(fileName),
          },
        });
      }

      case "merge": {
        const buffer = await generateSpreadsheetToDocMerge({
          templateText: body.templateText || "Dear {{Name}},\n\nYour account has a balance of {{Balance}}.",
          rows: body.rows || [{ Name: "Sample Client", Balance: "$100" }],
          fileNamePrefix: body.fileNamePrefix || "Document",
        });
        const fileName = `mail_merge_${Date.now()}.zip`;
        return new Response(new Uint8Array(buffer), {
          status: 200,
          headers: {
            "Content-Type": "application/zip",
            "Content-Disposition": `attachment; filename="${encodeURIComponent(fileName)}"`,
            "x-filename": encodeURIComponent(fileName),
          },
        });
      }

      case "batch": {
        const buffer = await generateBatchDocuments({
          templateType: body.templateType || "certificate",
          records: body.records || [{ name: "User 1", id: "001", extra: "Approved" }],
        });
        const fileName = `batch_documents_${Date.now()}.zip`;
        return new Response(new Uint8Array(buffer), {
          status: 200,
          headers: {
            "Content-Type": "application/zip",
            "Content-Disposition": `attachment; filename="${encodeURIComponent(fileName)}"`,
            "x-filename": encodeURIComponent(fileName),
          },
        });
      }

      default:
        return NextResponse.json({ error: `Unsupported action: ${action}` }, { status: 400 });
    }
  } catch (error: any) {
    console.error("[OFFICE_API_ERROR]", error);
    return NextResponse.json(
      { error: error?.message || "Internal server error occurred in Office Studio" },
      { status: 500 }
    );
  }
}
