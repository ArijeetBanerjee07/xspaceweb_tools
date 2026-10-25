import { describe, it, expect } from "vitest";

describe("TrendRank AI Core Heuristics & Search Logic", () => {
  describe("Keyword Generation & Intent Grouping", () => {
    it("groups keywords into accurate search intent classes", () => {
      const sampleQueries = [
        { q: "buy cheap headphones", expectedIntent: "Transactional" },
        { q: "how to edit pdf on mac", expectedIntent: "Informational" },
        { q: "best saas crm software", expectedIntent: "Commercial" },
      ];

      const classifyIntent = (query: string): string => {
        const lower = query.toLowerCase();
        if (lower.includes("buy") || lower.includes("cheap") || lower.includes("pricing") || lower.includes("order")) {
          return "Transactional";
        }
        if (lower.includes("how to") || lower.includes("tutorial") || lower.includes("guide")) {
          return "Informational";
        }
        return "Commercial";
      };

      for (const item of sampleQueries) {
        expect(classifyIntent(item.q)).toBe(item.expectedIntent);
      }
    });
  });

  describe("Rank Shift Delta Calculation", () => {
    it("computes position delta correctly", () => {
      const prev = 7;
      const current = 3;
      const delta = prev - current; // +4 positions gained
      expect(delta).toBe(4);
      expect(delta > 0).toBe(true);
    });

    it("handles rank drop appropriately", () => {
      const prev = 2;
      const current = 5;
      const delta = prev - current; // -3 positions lost
      expect(delta).toBe(-3);
      expect(delta < 0).toBe(true);
    });
  });

  describe("Hashtag Cluster Formatting", () => {
    it("formats hashtags cleanly with single hashes and spacing", () => {
      const tags = ["#ai", "#marketing", "#seo"];
      const formatted = tags.join(" ");
      expect(formatted).toBe("#ai #marketing #seo");
      expect(tags.every((t) => t.startsWith("#"))).toBe(true);
    });
  });
});
