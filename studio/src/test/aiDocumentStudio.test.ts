import { describe, it, expect } from "vitest";
import {
  parseDocumentText,
  exportExtractedData,
  chatWithPdf,
  summarizePdf,
  extractActionItemsKeyPoints,
} from "../lib/aiDocumentStudio";

describe("AI Document Studio 10 Blueprint Tools", () => {
  const sampleDocText = `--- PAGE 1 ---
Annual Strategic Review 2026. Prepared by Dr. Aris Thorne.
Acme Technologies approved the allocation of $1,500,000 for cloud automation on October 15, 2026.
Action: Deploy pilot infrastructure by November 30, 2026, assigned to Maria Garcia.
Decision: Migrate all legacy servers to Next.js and Groq architecture.`;

  it("Tool 1 & 2: parses plain document and extracts page content", async () => {
    const parsed = await parseDocumentText(Buffer.from(sampleDocText, "utf8"), "strategy.txt");
    expect(parsed.text).toContain("Annual Strategic Review");
    expect(parsed.pages.length).toBeGreaterThan(0);
  });

  it("Tool 9: exports extracted data into CSV, JSON, and XLSX", async () => {
    const sampleData = {
      invoiceNumber: "INV-2026-999",
      vendor: { name: "Acme Corp" },
      customer: { name: "Starlight Inc" },
      lineItems: [
        { description: "AI Server Subscription", quantity: 2, unitPrice: 2500, total: 5000 },
        { description: "Implementation Hours", quantity: 10, unitPrice: 150, total: 1500 },
      ],
    };

    // JSON export
    const jsonExport = await exportExtractedData(sampleData, "json");
    expect(jsonExport.mimeType).toBe("application/json");
    expect(jsonExport.buffer.length).toBeGreaterThan(50);

    // CSV export
    const csvExport = await exportExtractedData(sampleData, "csv");
    expect(csvExport.mimeType).toBe("text/csv");
    expect(csvExport.buffer.toString()).toContain("AI Server Subscription");

    // XLSX export
    const xlsxExport = await exportExtractedData(sampleData, "xlsx");
    expect(xlsxExport.mimeType).toBe("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    expect(xlsxExport.buffer.length).toBeGreaterThan(1000);
  });

  it("Live Groq integration: runs real summarization and action items extraction", async () => {
    const summary = await summarizePdf(sampleDocText, "short");
    expect(summary).toBeDefined();
    expect(summary.length).toBeGreaterThan(10);

    const actionItems = await extractActionItemsKeyPoints(sampleDocText);
    expect(actionItems).toBeDefined();
    expect(actionItems.toLowerCase()).toMatch(/maria|deploy|infrastructure|action/i);
  }, 30000);
});
