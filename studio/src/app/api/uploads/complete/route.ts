import { NextResponse } from "next/server";
import { z } from "zod";
import crypto from "crypto";
import { fileTypeFromBuffer } from "file-type";
import { getAuthContext } from "@/lib/auth/session";
import { getPlan } from "@/config/plans";
import { storage, virusScanner } from "@/lib/storage/cloudinary";
import { prisma } from "@/lib/prisma";

const completeUploadSchema = z.object({
  fileId: z.string().min(1),
});

export async function POST(req: Request) {
  try {
    const authContext = await getAuthContext();
    if (!authContext) {
      return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = completeUploadSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "VALIDATION_FAILED", details: parsed.error.issues },
        { status: 400 }
      );
    }

    const { fileId } = parsed.data;

    const file = await prisma.file.findFirst({
      where: {
        id: fileId,
        workspaceId: authContext.workspaceId,
      },
    });

    if (!file) {
      return NextResponse.json({ error: "FILE_NOT_FOUND" }, { status: 404 });
    }

    const resourceType = file.cloudinaryResourceType as "image" | "raw";

    // 1. Fetch resource details and real buffer
    let resource;
    let buffer: Buffer;
    try {
      resource = await storage.getResource(file.cloudinaryPublicId, resourceType);
      buffer = await storage.fetchBuffer(
        file.cloudinaryPublicId,
        resourceType,
        resource.format || file.cloudinaryFormat
      );
    } catch {
      return NextResponse.json({ error: "ASSET_NOT_FOUND_IN_STORAGE" }, { status: 404 });
    }

    // 2. Size check against plan
    const plan = getPlan(authContext.workspace.planId);
    const maxSizeBytes = plan.maxFileMb * 1024 * 1024;
    const realSize = buffer.length;

    if (realSize > maxSizeBytes || resource.bytes > maxSizeBytes) {
      await storage.deleteResource(file.cloudinaryPublicId, resourceType);
      await prisma.file.update({
        where: { id: file.id },
        data: { status: "deleted", deletedAt: new Date() },
      });
      return NextResponse.json({ error: "UPLOAD_TOO_LARGE" }, { status: 413 });
    }

    // 3. Magic bytes format check using file-type
    const detected = await fileTypeFromBuffer(buffer);

    // If declared as PDF or image, inspect magic bytes strictly
    const isDeclaredPdf =
      file.mimeType.toLowerCase() === "application/pdf" ||
      file.name.toLowerCase().endsWith(".pdf");

    if (isDeclaredPdf) {
      // Must be PDF. If detected exists and is not pdf, or if detected mime is png/jpeg/etc.
      if (detected && detected.mime !== "application/pdf") {
        await storage.deleteResource(file.cloudinaryPublicId, resourceType);
        await prisma.file.update({
          where: { id: file.id },
          data: { status: "deleted", deletedAt: new Date() },
        });
        return NextResponse.json({ error: "UPLOAD_TYPE_MISMATCH" }, { status: 400 });
      }
      // Check PDF header
      if (!buffer.toString("utf8", 0, 5).startsWith("%PDF-")) {
        await storage.deleteResource(file.cloudinaryPublicId, resourceType);
        await prisma.file.update({
          where: { id: file.id },
          data: { status: "deleted", deletedAt: new Date() },
        });
        return NextResponse.json({ error: "UPLOAD_TYPE_MISMATCH" }, { status: 400 });
      }
    } else if (file.mimeType.toLowerCase().startsWith("image/")) {
      if (detected && !detected.mime.startsWith("image/")) {
        await storage.deleteResource(file.cloudinaryPublicId, resourceType);
        await prisma.file.update({
          where: { id: file.id },
          data: { status: "deleted", deletedAt: new Date() },
        });
        return NextResponse.json({ error: "UPLOAD_TYPE_MISMATCH" }, { status: 400 });
      }
    }

    // 4. Virus scan (no-op stub with TODO)
    const scanResult = await virusScanner.scan(buffer);
    if (!scanResult.isClean) {
      await storage.deleteResource(file.cloudinaryPublicId, resourceType);
      await prisma.file.update({
        where: { id: file.id },
        data: { status: "deleted", deletedAt: new Date() },
      });
      return NextResponse.json({ error: "VIRUS_DETECTED" }, { status: 400 });
    }

    // 5. Store sha256 (computed or from Cloudinary)
    const computedSha256 = crypto.createHash("sha256").update(buffer).digest("hex");
    const sha256 = resource.sha256 || computedSha256;

    const updated = await prisma.file.update({
      where: { id: file.id },
      data: {
        status: "ready",
        sizeBytes: realSize,
        sha256,
        cloudinaryFormat: resource.format || file.cloudinaryFormat,
      },
    });

    return NextResponse.json({
      success: true,
      file: {
        id: updated.id,
        name: updated.name,
        sizeBytes: updated.sizeBytes,
        mimeType: updated.mimeType,
        status: updated.status,
        sha256: updated.sha256,
      },
    });
  } catch (error) {
    return NextResponse.json({ error: "INTERNAL_SERVER_ERROR" }, { status: 500 });
  }
}
