import { NextResponse } from "next/server";
import { getAuthContext } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { storage } from "@/lib/storage/cloudinary";

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
    const job = await prisma.job.findFirst({
      where: {
        id,
        workspaceId: authContext.workspaceId,
      },
    });

    if (!job) {
      return NextResponse.json({ error: "JOB_NOT_FOUND" }, { status: 404 });
    }

    // If job succeeded, resolve outputs to signed download URLs
    const outputFiles: Array<{
      fileId: string;
      name: string;
      downloadUrl: string;
      expiresAt: string;
    }> = [];

    if (job.status === "succeeded" && Array.isArray(job.outputFileIds)) {
      const fileIds = job.outputFileIds as string[];
      if (fileIds.length > 0) {
        const files = await prisma.file.findMany({
          where: {
            id: { in: fileIds },
            workspaceId: authContext.workspaceId,
          },
        });

        for (const f of files) {
          const expiresInSeconds = 300;
          const downloadUrl = storage.getDownloadUrl({
            publicId: f.cloudinaryPublicId,
            format: f.cloudinaryFormat,
            resourceType: f.cloudinaryResourceType as "image" | "raw",
            expiresInSeconds,
          });

          outputFiles.push({
            fileId: f.id,
            name: f.name,
            downloadUrl,
            expiresAt: new Date(Date.now() + expiresInSeconds * 1000).toISOString(),
          });
        }
      }
    }

    return NextResponse.json({
      id: job.id,
      toolId: job.toolId,
      status: job.status,
      progress: job.progress,
      errorCode: job.errorCode,
      errorMessage: job.errorMessage,
      outputs: outputFiles,
      createdAt: job.createdAt.toISOString(),
      startedAt: job.startedAt?.toISOString() || null,
      finishedAt: job.finishedAt?.toISOString() || null,
    });
  } catch (error) {
    return NextResponse.json({ error: "INTERNAL_SERVER_ERROR" }, { status: 500 });
  }
}
