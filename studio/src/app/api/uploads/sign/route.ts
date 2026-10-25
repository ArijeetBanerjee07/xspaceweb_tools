import { NextResponse } from "next/server";
import { z } from "zod";
import crypto from "crypto";
import { getAuthContext } from "@/lib/auth/session";
import { getPlan } from "@/config/plans";
import { getResourceType, storage } from "@/lib/storage/cloudinary";
import { prisma } from "@/lib/prisma";

const signUploadSchema = z.object({
  fileName: z.string().min(1),
  mimeType: z.string().min(1),
  sizeBytes: z.number().positive(),
  folderId: z.string().nullable().optional(),
  workspaceId: z.string().optional(),
});

export async function POST(req: Request) {
  try {
    const authContext = await getAuthContext();
    if (!authContext) {
      return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = signUploadSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "VALIDATION_FAILED", details: parsed.error.issues },
        { status: 400 }
      );
    }

    const { fileName, mimeType, sizeBytes, folderId } = parsed.data;
    const workspaceId = authContext.workspaceId;

    const plan = getPlan(authContext.workspace.planId);
    const maxSizeBytes = plan.maxFileMb * 1024 * 1024;
    if (sizeBytes > maxSizeBytes) {
      return NextResponse.json(
        { error: "UPLOAD_TOO_LARGE", maxFileMb: plan.maxFileMb },
        { status: 413 }
      );
    }

    const resourceType = getResourceType(mimeType, fileName);
    const fileId = crypto.randomUUID();

    const signedParams = storage.createUploadSignature({
      workspaceId,
      fileId,
      resourceType,
    });

    // Store File record in database with status "uploading"
    const fullPublicId = `${signedParams.folder}/${signedParams.publicId}`;
    const ext = fileName.includes(".") ? fileName.split(".").pop() || "" : "";

    const file = await prisma.file.create({
      data: {
        id: fileId,
        workspaceId,
        folderId: folderId || null,
        name: fileName,
        mimeType,
        sizeBytes,
        cloudinaryPublicId: fullPublicId,
        cloudinaryResourceType: resourceType,
        cloudinaryFormat: ext,
        status: "uploading",
      },
    });

    return NextResponse.json({
      fileId: file.id,
      timestamp: signedParams.timestamp,
      signature: signedParams.signature,
      apiKey: signedParams.apiKey,
      cloudName: signedParams.cloudName,
      folder: signedParams.folder,
      publicId: signedParams.publicId,
      resourceType: signedParams.resourceType,
      type: "authenticated",
      allowed_formats: signedParams.allowed_formats,
    });
  } catch (error) {
    return NextResponse.json({ error: "INTERNAL_SERVER_ERROR" }, { status: 500 });
  }
}
