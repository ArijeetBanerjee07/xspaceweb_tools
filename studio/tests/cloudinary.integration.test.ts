import { describe, it, expect, afterAll } from "vitest";
import { CloudinaryStorageAdapter } from "@/lib/storage/cloudinary";
import { getEnv } from "@/lib/env";
import crypto from "crypto";

const skipIntegration = process.env.SKIP_CLOUDINARY_INTEGRATION === "true";

describe.skipIf(skipIntegration)("Cloudinary Real Account Integration Test", () => {
  let uploadedPublicId: string | null = null;
  let storageInstance: CloudinaryStorageAdapter | null = null;

  it("should upload a buffer to test-run subfolder, generate signed download URL, and fetch it", async () => {
    const storage = new CloudinaryStorageAdapter();
    storageInstance = storage;
    const env = getEnv();
    const testRunId = crypto.randomUUID();
    const testFolder = `${env.CLOUDINARY_FOLDER}/test-run-${testRunId}`;

    const testContent = `Hello Cloudinary! Test run: ${testRunId}`;
    const buffer = Buffer.from(testContent, "utf8");

    const result = await storage.uploadBuffer({
      buffer,
      folder: testFolder,
      publicId: "integration_test_file",
      resourceType: "raw",
      format: "txt",
    });

    uploadedPublicId = result.publicId;
    expect(result.publicId).toBeDefined();
    expect(result.bytes).toBe(buffer.length);

    const downloadUrl = storage.getDownloadUrl({
      publicId: result.publicId,
      resourceType: "raw",
      format: "txt",
      expiresInSeconds: 300,
    });

    expect(downloadUrl).toContain("signature=");
    expect(downloadUrl).toContain("expires_at=");

    const fetchedBuffer = await storage.fetchBuffer(result.publicId, "raw", "txt");
    expect(fetchedBuffer.toString("utf8")).toBe(testContent);
  });

  afterAll(async () => {
    if (uploadedPublicId && storageInstance) {
      await storageInstance.deleteResource(uploadedPublicId, "raw");
    }
  });
});
