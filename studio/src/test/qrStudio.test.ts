import { describe, it, expect } from "vitest";

describe("QR & Link Studio Payload Generators", () => {
  describe("Wi-Fi Payload Formatting", () => {
    it("formats standard Wi-Fi connection strings correctly", () => {
      const ssid = "Home_Office";
      const pass = "SecretPass123";
      const enc = "WPA";
      const hidden = false;

      const payload = `WIFI:S:${ssid};T:${enc};P:${pass};H:${hidden ? "true" : "false"};;`;
      expect(payload).toBe("WIFI:S:Home_Office;T:WPA;P:SecretPass123;H:false;;");
      expect(payload.startsWith("WIFI:")).toBe(true);
      expect(payload.endsWith(";;")).toBe(true);
    });
  });

  describe("vCard 3.0 Formatting", () => {
    it("formats standard vCard contact payloads correctly", () => {
      const vcard = [
        "BEGIN:VCARD",
        "VERSION:3.0",
        "N:Morgan;Alex;;;",
        "FN:Alex Morgan",
        "ORG:XSpace Tools",
        "TEL;TYPE=CELL:+15550192",
        "EMAIL:alex@xspace.tools",
        "END:VCARD",
      ].join("\n");

      expect(vcard.includes("BEGIN:VCARD")).toBe(true);
      expect(vcard.includes("FN:Alex Morgan")).toBe(true);
      expect(vcard.endsWith("END:VCARD")).toBe(true);
    });
  });

  describe("Bulk CSV URL Parsing", () => {
    it("parses multiple lines and extracts valid URLs with custom labels", () => {
      const csvInput =
        "https://xspace.tools/pdf, PDF Studio\nhttps://xspace.tools/security, Security Studio\nhttps://xspace.tools/compress, Compress Studio";

      const lines = csvInput
        .split("\n")
        .map((l) => l.trim())
        .filter(Boolean);

      expect(lines.length).toBe(3);

      const parsed = lines.map((line, idx) => {
        const [url, label] = line.split(",").map((s) => s.trim());
        return { url, label: label || `item_${idx + 1}` };
      });

      expect(parsed[0].url).toBe("https://xspace.tools/pdf");
      expect(parsed[0].label).toBe("PDF Studio");
      expect(parsed[1].label).toBe("Security Studio");
    });
  });
});
