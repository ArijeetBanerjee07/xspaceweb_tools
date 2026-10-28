import { describe, expect, it } from "vitest";
import { matchesHelpSearch } from "@/lib/helpSearch";

describe("help center search", () => {
  it("matches case-insensitively across question and answer text", () => {
    expect(
      matchesHelpSearch("RAZORPAY UPI", "Payment gateway", "Razorpay accepts UPI"),
    ).toBe(true);
  });

  it("requires all query words and ignores surrounding whitespace", () => {
    expect(matchesHelpSearch("  PDF   compress ", "Compress a PDF file")).toBe(
      true,
    );
    expect(matchesHelpSearch("PDF invoice", "Compress a PDF file")).toBe(false);
  });

  it("matches all content when the query is empty", () => {
    expect(matchesHelpSearch("   ", "Any help article")).toBe(true);
  });
});
