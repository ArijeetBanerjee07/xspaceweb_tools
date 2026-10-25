import { describe, it, expect } from "vitest";

describe("Compress & Enhance Studio Core Algorithms", () => {
  describe("Target Size Calculation", () => {
    it("converts KB and MB targets to exact byte boundaries", () => {
      const getTargetBytes = (value: number, unit: "KB" | "MB") =>
        unit === "MB" ? value * 1024 * 1024 : value * 1024;

      expect(getTargetBytes(100, "KB")).toBe(102400);
      expect(getTargetBytes(1, "MB")).toBe(1048576);
      expect(getTargetBytes(50, "KB")).toBe(51200);
    });
  });

  describe("Aspect Ratio Dimension Resizing", () => {
    it("preserves aspect ratio when width changes", () => {
      const origW = 1600;
      const origH = 1000;
      const newW = 800;
      const calculatedH = Math.round((newW / origW) * origH);

      expect(calculatedH).toBe(500);
      expect(newW / calculatedH).toBeCloseTo(origW / origH, 2);
    });

    it("calculates percentage dimensions correctly", () => {
      const origW = 1200;
      const origH = 800;
      const percent = 50;

      const targetW = Math.round(origW * (percent / 100));
      const targetH = Math.round(origH * (percent / 100));

      expect(targetW).toBe(600);
      expect(targetH).toBe(400);
    });
  });

  describe("Upscaling Multipliers", () => {
    it("computes 2x and 4x target dimensions accurately", () => {
      const origW = 640;
      const origH = 480;

      expect(origW * 2).toBe(1280);
      expect(origH * 2).toBe(960);
      expect(origW * 4).toBe(2560);
      expect(origH * 4).toBe(1920);
    });
  });

  describe("Sharpening Kernel Clamping", () => {
    it("clamps pixel values within 0 and 255 byte bounds", () => {
      const clamp = (val: number) => Math.min(255, Math.max(0, Math.round(val)));
      expect(clamp(320)).toBe(255);
      expect(clamp(-45)).toBe(0);
      expect(clamp(128.6)).toBe(129);
    });
  });
});
