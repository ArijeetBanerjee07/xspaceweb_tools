import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export interface AuthenticatedContext {
  userId: string;
  workspaceId: string;
  role: "owner" | "admin" | "member";
  user: {
    id: string;
    email: string;
    name?: string | null;
  };
  workspace: {
    id: string;
    name: string;
    planId: string;
  };
}

export async function getAuthContext(targetWorkspaceId?: string): Promise<AuthenticatedContext | null> {
  const session = await auth();
  if (!session?.user?.id) {
    return null;
  }

  const userId = session.user.id;
  const preferredWorkspaceId =
    targetWorkspaceId || (session.user as unknown as { workspaceId?: string }).workspaceId;

  const membership = await prisma.membership.findFirst({
    where: {
      userId,
      ...(preferredWorkspaceId ? { workspaceId: preferredWorkspaceId } : {}),
    },
    include: {
      workspace: true,
      user: true,
    },
    orderBy: { id: "asc" },
  });

  if (!membership) {
    return null;
  }

  let planId = membership.workspace.planId;
  // Auto-downgrade back to free tier if 1-month subscription period has expired
  if (planId !== "free") {
    try {
      const activeSub = await prisma.subscription.findFirst({
        where: { workspaceId: membership.workspaceId, status: "active" },
        orderBy: { currentPeriodEnd: "desc" },
      });
      if (activeSub?.currentPeriodEnd && new Date() > new Date(activeSub.currentPeriodEnd)) {
        await prisma.$transaction([
          prisma.workspace.update({
            where: { id: membership.workspaceId },
            data: { planId: "free" },
          }),
          prisma.subscription.update({
            where: { id: activeSub.id },
            data: { status: "expired" },
          }),
        ]);
        planId = "free";
      }
    } catch (err) {
      console.warn("[session] Expiry check non-critical error:", err);
    }
  }

  return {
    userId,
    workspaceId: membership.workspaceId,
    role: membership.role as "owner" | "admin" | "member",
    user: {
      id: membership.user.id,
      email: membership.user.email,
      name: membership.user.name,
    },
    workspace: {
      id: membership.workspace.id,
      name: membership.workspace.name,
      planId,
    },
  };
}
