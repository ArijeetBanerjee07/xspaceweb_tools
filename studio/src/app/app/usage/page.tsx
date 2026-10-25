import { getAuthContext } from "@/lib/auth/session";
import { getMonthUsage } from "@/lib/quota/ledger";
import { getEnv } from "@/lib/env";
import { prisma } from "@/lib/prisma";
import { UsageClient } from "./UsageClient";

export const dynamic = "force-dynamic";

export default async function UsagePage() {
  const auth = (await getAuthContext())!;
  const env = getEnv();

  const activeSubscription = await prisma.subscription.findFirst({
    where: { workspaceId: auth.workspaceId },
    orderBy: { createdAt: "desc" },
  });

  const isPro = auth.workspace.planId === "pro" || activeSubscription?.status === "active";
  const usage = await getMonthUsage(auth.workspaceId);

  let formattedEndDate: string | null = null;
  let daysRemaining: number | null = null;
  if (activeSubscription?.currentPeriodEnd) {
    const end = new Date(activeSubscription.currentPeriodEnd);
    formattedEndDate = end.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
    const diffMs = end.getTime() - Date.now();
    daysRemaining = Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
  }

  const isRazorpayConfigured = Boolean(
    env.RAZORPAY_KEY_ID &&
    env.RAZORPAY_KEY_ID.trim() !== "" &&
    env.RAZORPAY_KEY_SECRET &&
    env.RAZORPAY_KEY_SECRET.trim() !== ""
  );

  return (
    <UsageClient
      initialIsPro={isPro}
      workspaceName={auth.workspace.name}
      initialEndDate={formattedEndDate}
      initialDaysRemaining={daysRemaining}
      usage={usage}
      isRazorpayConfigured={isRazorpayConfigured}
      subscriptionCreatedAt={activeSubscription?.createdAt ? new Date(activeSubscription.createdAt).toISOString() : null}
    />
  );
}
