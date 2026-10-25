import { NextResponse } from "next/server";
import { getAuthContext } from "@/lib/auth/session";
import { storage } from "@/lib/storage/cloudinary";
import { prisma } from "@/lib/prisma";

export async function DELETE(
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
        status: { not: "deleted" },
      },
    });

    if (!file) {
      return NextResponse.json({ error: "FILE_NOT_FOUND" }, { status: 404 });
    }

    // Call Cloudinary destroy first
    const confirmed = await storage.deleteResource(
      file.cloudinaryPublicId,
      file.cloudinaryResourceType as "image" | "raw"
    );

    if (!confirmed) {
      return NextResponse.json(
        { error: "STORAGE_DELETION_FAILED" },
        { status: 502 }
      );
    }

    // Mark the File deleted only after Cloudinary confirms
    await prisma.file.update({
      where: { id: file.id },
      data: {
        status: "deleted",
        deletedAt: new Date(),
      },
    });

    return NextResponse.json({ success: true, deletedId: file.id });
  } catch (error) {
    return NextResponse.json({ error: "INTERNAL_SERVER_ERROR" }, { status: 500 });
  }
}
