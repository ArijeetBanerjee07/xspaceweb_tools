import { prisma } from "@/lib/prisma";
import { storage } from "@/lib/storage/cloudinary";
import { getPlan } from "@/config/plans";

export async function runCleanupJob(): Promise<{
  cleanedCount: number;
  purgedCount: number;
}> {
  const now = new Date();
  let cleanedCount = 0;
  let purgedCount = 0;

  // 1. Delete Cloudinary assets whose expiresAt has passed
  const expiredFiles = await prisma.file.findMany({
    where: {
      expiresAt: { lt: now },
      status: { not: "deleted" },
    },
  });

  for (const file of expiredFiles) {
    const success = await storage.deleteResource(
      file.cloudinaryPublicId,
      file.cloudinaryResourceType as "image" | "raw"
    );

    if (success) {
      await prisma.file.update({
        where: { id: file.id },
        data: {
          status: "deleted",
          deletedAt: new Date(),
        },
      });
      cleanedCount++;
    }
  }

  // 2. Purge trash past trashDays
  const workspaces = await prisma.workspace.findMany();
  for (const ws of workspaces) {
    const plan = getPlan(ws.planId);
    const trashLimitDate = new Date(
      now.getTime() - plan.trashDays * 24 * 60 * 60 * 1000
    );

    const trashedFiles = await prisma.file.findMany({
      where: {
        workspaceId: ws.id,
        status: "deleted",
        deletedAt: { lt: trashLimitDate },
      },
    });

    for (const file of trashedFiles) {
      // Ensure Cloudinary asset is removed
      await storage.deleteResource(
        file.cloudinaryPublicId,
        file.cloudinaryResourceType as "image" | "raw"
      );

      await prisma.file.delete({
        where: { id: file.id },
      });
      purgedCount++;
    }
  }

  return { cleanedCount, purgedCount };
}
