import { NextResponse } from "next/server";
import { getAuthContext } from "@/lib/auth/session";
import { storage } from "@/lib/storage/cloudinary";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authContext = await getAuthContext();
    if (!authContext) {
      return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
    }

    const { id } = await params;
    const file = await prisma.file.findFirst({
      where: {
        id,
        workspaceId: authContext.workspaceId,
        status: "ready",
      },
    });

    if (!file) {
      return NextResponse.json({ error: "FILE_NOT_FOUND" }, { status: 404 });
    }

    const expiresInSeconds = 300; // 5 minutes
    const expiresAt = new Date(Date.now() + expiresInSeconds * 1000).toISOString();

    const downloadUrl = storage.getDownloadUrl({
      publicId: file.cloudinaryPublicId,
      format: file.cloudinaryFormat,
      resourceType: file.cloudinaryResourceType as "image" | "raw",
      expiresInSeconds,
    });

    return NextResponse.json({
      downloadUrl,
      expiresAt,
      name: file.name,
      mimeType: file.mimeType,
      sizeBytes: file.sizeBytes,
    });
  } catch (error) {
    return NextResponse.json({ error: "INTERNAL_SERVER_ERROR" }, { status: 500 });
  }
}
