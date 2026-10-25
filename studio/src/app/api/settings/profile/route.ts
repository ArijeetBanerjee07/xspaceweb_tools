import { NextResponse } from "next/server";
import { z } from "zod";
import { getAuthContext } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";

const updateProfileSchema = z.object({
  name: z.string().min(1).optional(),
  workspaceName: z.string().min(1).optional(),
});

export async function POST(req: Request) {
  try {
    const authContext = await getAuthContext();
    if (!authContext) {
      return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = updateProfileSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "VALIDATION_FAILED" }, { status: 400 });
    }

    const { name, workspaceName } = parsed.data;

    await prisma.$transaction(async (tx: any) => {
      if (name) {
        await tx.user.update({
          where: { id: authContext.userId },
          data: { name: name.trim() },
        });
      }
      if (workspaceName) {
        await tx.workspace.update({
          where: { id: authContext.workspaceId },
          data: { name: workspaceName.trim() },
        });
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "INTERNAL_SERVER_ERROR" }, { status: 500 });
  }
}
