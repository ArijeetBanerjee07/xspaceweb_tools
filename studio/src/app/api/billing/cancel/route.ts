import { NextResponse } from "next/server";
import { getAuthContext } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";

export async function POST() {
  try {
    const authContext = await getAuthContext();
    let workspaceId = authContext?.workspaceId;

    if (!workspaceId) {
      const firstWs = await prisma.workspace.findFirst({
        where: { planId: "pro" },
      });
      workspaceId = firstWs?.id;
    }

    if (!workspaceId) {
      return NextResponse.json(
        { error: "NOT_FOUND", message: "No active workspace found to cancel." },
        { status: 404 }
      );
    }

    await prisma.$transaction([
      prisma.workspace.update({
        where: { id: workspaceId },
        data: { planId: "free" },
      }),
      prisma.subscription.updateMany({
        where: { workspaceId },
        data: { status: "cancelled" },
      }),
    ]);

    return NextResponse.json({
      success: true,
      message: "Pro subscription successfully cancelled. Workspace returned to Free tier.",
    });
  } catch (error: any) {
    console.error("[BILLING_CANCEL_ERROR]", error);
    return NextResponse.json(
      { error: "INTERNAL_SERVER_ERROR", message: error?.message || "Cancellation failed." },
      { status: 500 }
    );
  }
}
