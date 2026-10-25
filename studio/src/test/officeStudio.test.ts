import { describe, it, expect } from "vitest";
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
} from "../lib/officeStudio";
import JSZip from "jszip";

describe("Office Studio 11 Blueprint Tools", () => {
  it("Tool 1: AI-assisted document creation produces valid DOCX buffer", async () => {
    const buffer = await generateAiDocument({
      title: "Partnership Proposal",
      brief: "Joint AI initiative for SME workflows",
      docType: "proposal",
      tone: "professional",
    });
    expect(buffer).toBeInstanceOf(Buffer);
    expect(buffer.length).toBeGreaterThan(1000);
  });

  it("Tool 1b: AI-assisted document creation in Full Document mode produces valid DOCX buffer", async () => {
    const buffer = await generateAiDocument({
      title: "Employment Offer Letter",
      brief: "Offer letter for full stack development position",
      mode: "full",
      fullText: "1. Offer of Employment\nDear Candidate, we are pleased to offer you the position.\n\n2. Compensation\nAnnual compensation will be ₹25,00,000.\n\n3. Acceptance\nPlease sign and return by next week.",
    });
    expect(buffer).toBeInstanceOf(Buffer);
    expect(buffer.length).toBeGreaterThan(1000);
  });

  it("Tool 2: DOCX generation produces structured editable Word document", async () => {
    const buffer = await generateDocx({
      title: "Weekly Status Brief",
      author: "Alex Morgan",
      content: "First paragraph introducing deliverables.\n\nSecond paragraph outlining milestones.",
    });
    expect(buffer).toBeInstanceOf(Buffer);
    expect(buffer.length).toBeGreaterThan(1000);
  });

  it("Tool 3: Excel/XLSX creation produces structured workbook with styled cells", async () => {
    const buffer = await generateXlsx({
      title: "Quarterly Revenue",
      sheetName: "Q3 Results",
      columns: [
        { header: "Region", key: "region" },
        { header: "Revenue ($)", key: "revenue" },
      ],
      rows: [
        { region: "North", revenue: 45000 },
        { region: "South", revenue: 62000 },
      ],
    });
    expect(buffer).toBeInstanceOf(Buffer);
    expect(buffer.length).toBeGreaterThan(1000);
  });

  it("Tool 4: Spreadsheet formulas provides suggestions, syntax, and examples", () => {
    const sumResult = suggestSpreadsheetFormula("Calculate sum of sales in North region where status is Paid");
    expect(sumResult.formula).toContain("SUMIFS");
    expect(sumResult.syntax).toBeDefined();
    expect(sumResult.exampleData.rows.length).toBeGreaterThan(0);

    const lookupResult = suggestSpreadsheetFormula("How to lookup value from another table");
    expect(lookupResult.formula).toContain("XLOOKUP");
  });

  it("Tool 5: Charts and tables generates visual data workbook", async () => {
    const buffer = await generateChartTableXlsx({
      title: "Quarterly Sales",
      type: "bar",
      labels: ["Q1", "Q2", "Q3", "Q4"],
      values: [12000, 19000, 24000, 31000],
      seriesName: "Net Revenue ($)",
    });
    expect(buffer).toBeInstanceOf(Buffer);
    expect(buffer.length).toBeGreaterThan(1000);
  });

  it("Tool 6: Invoice templates generates complete invoice document", async () => {
    const buffer = await generateInvoiceDocx({
      invoiceNumber: "INV-2026-001",
      date: "2026-10-22",
      dueDate: "2026-11-05",
      from: {
        name: "Acme Corp",
        address: "100 Tech Park, Bangalore",
        email: "billing@acme.com",
        taxId: "29AAAAA0000A1Z5",
      },
      billTo: {
        name: "Beta Global Ltd",
        address: "500 Cyber City, Gurgaon",
        email: "accounts@betaglobal.com",
      },
      items: [
        { description: "Cloud Consulting (Hours)", quantity: 20, unitPrice: 1500 },
        { description: "SaaS Enterprise License", quantity: 1, unitPrice: 25000 },
      ],
      currency: "INR",
      taxRatePercent: 18,
    });
    expect(buffer).toBeInstanceOf(Buffer);
    expect(buffer.length).toBeGreaterThan(1000);
  });

  it("Tool 7: Report generation generates multi-section corporate report", async () => {
    const buffer = await generateReportDocx({
      title: "Annual Operational Efficiency",
      reportType: "Annual Operations",
      author: "Operations Directorate",
      date: "2026-10-22",
      summary: "Documented throughput increased by 34% across all departments.",
      keyMetrics: [
        { metric: "Document Velocity", value: "+34%", trend: "Upward" },
        { metric: "Error Rate", value: "0.2%", trend: "Reduced" },
      ],
      findings: ["Automated pipelines reduced repetitive manual formatting by 70%."],
      recommendations: ["Expand batch document templates across all regional teams."],
    });
    expect(buffer).toBeInstanceOf(Buffer);
    expect(buffer.length).toBeGreaterThan(1000);
  });

  it("Tool 7: Report generation cleanly omits KPI table when keyMetrics is empty", async () => {
    const buffer = await generateReportDocx({
      title: "Executive Strategic Narrative",
      reportType: "Strategic Memo",
      author: "Executive Office",
      date: "2026-10-22",
      summary: "Qualitative overview of business alignments without numerical KPI indicators.",
      keyMetrics: [],
      findings: ["Cross-departmental collaboration models finalized."],
      recommendations: ["Publish guidance document to internal portal."],
    });
    expect(buffer).toBeInstanceOf(Buffer);
    expect(buffer.length).toBeGreaterThan(1000);
  });

  it("Tool 8: Business letter generation generates formal business letter", async () => {
    const buffer = await generateBusinessLetterDocx({
      letterType: "Offer Letter",
      sender: {
        name: "Jane Doe",
        title: "Head of People",
        company: "Starlight Tech Inc",
        address: "Bengaluru, Karnataka",
      },
      recipient: {
        name: "Rahul Verma",
        title: "Senior Full Stack Engineer",
        company: "Applicant",
        address: "Mumbai, Maharashtra",
      },
      date: "2026-10-22",
      subject: "Formal Offer of Employment - Senior Full Stack Engineer",
      paragraphs: [
        "We are pleased to extend an offer of employment for the role of Senior Full Stack Engineer.",
        "Your compensation package, benefits, and start date are detailed below.",
      ],
    });
    expect(buffer).toBeInstanceOf(Buffer);
    expect(buffer.length).toBeGreaterThan(1000);
  });

  it("Tool 9: Spreadsheet-to-document automation merges rows into personalized documents zip", async () => {
    const buffer = await generateSpreadsheetToDocMerge({
      templateText: "Dear {{Name}},\n\nYour account #{{Account}} has a balance of ${{Balance}} due on {{Date}}.",
      rows: [
        { Name: "John Doe", Account: "AC-101", Balance: "250.00", Date: "Nov 1" },
        { Name: "Jane Smith", Account: "AC-102", Balance: "420.00", Date: "Nov 3" },
      ],
      fileNamePrefix: "BillingStatement",
    });

    expect(buffer).toBeInstanceOf(Buffer);
    const zip = await JSZip.loadAsync(buffer);
    const files = Object.keys(zip.files);
    expect(files.some((f) => f.includes("John_Doe"))).toBe(true);
    expect(files.some((f) => f.includes("Jane_Smith"))).toBe(true);
    expect(files.includes("merge_summary.csv")).toBe(true);
  });

  it("Tool 10: Batch document generation generates multi-file zip", async () => {
    const buffer = await generateBatchDocuments({
      templateType: "certificate",
      records: [
        { name: "Dev A", id: "CERT-001", extra: "Grade A" },
        { name: "Dev B", id: "CERT-002", extra: "Grade A+" },
      ],
    });

    expect(buffer).toBeInstanceOf(Buffer);
    const zip = await JSZip.loadAsync(buffer);
    const files = Object.keys(zip.files);
    expect(files.length).toBe(2);
  });
});
