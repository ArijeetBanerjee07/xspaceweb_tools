import { prisma } from "@/lib/prisma";
import { getPlan, PlanQuotas } from "@/config/plans";

export function getStartOfMonth(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1);
}

export async function getMonthUsage(workspaceId: string): Promise<Record<keyof PlanQuotas, number>> {
  const startOfMonth = getStartOfMonth();
  const events = await prisma.usageEvent.findMany({
    where: {
      workspaceId,
      createdAt: { gte: startOfMonth },
    },
  });

  const usage: Record<keyof PlanQuotas, number> = {
    imageCredits: 0,
    aiCredits: 0,
    qrCodes: 0,
    batchRows: 0,
  };

  for (const event of events) {
    const key = event.metric as keyof PlanQuotas;
    if (key in usage) {
      usage[key] += event.quantity;
    }
  }

  return usage;
}

export async function checkAndReserveQuota(options: {
  workspaceId: string;
  planId: string;
  metric: keyof PlanQuotas;
  cost: number;
}): Promise<{ ok: boolean; remaining: number; maxAllowed: number; currentUsage: number }> {
  const plan = getPlan(options.planId);
  const maxAllowed = plan.quotas[options.metric] ?? 0;

  const currentUsageMap = await getMonthUsage(options.workspaceId);
  const currentUsage = currentUsageMap[options.metric] || 0;

  // Also include currently running/queued jobs as active reservation
  const activeJobs = await prisma.job.aggregate({
    where: {
      workspaceId: options.workspaceId,
      status: { in: ["queued", "running"] },
    },
    _sum: {
      costUnits: true,
    },
  });

  const reserved = activeJobs._sum.costUnits || 0;
  const projectedTotal = currentUsage + reserved + options.cost;

  if (projectedTotal > maxAllowed) {
    return {
      ok: false,
      remaining: Math.max(0, maxAllowed - currentUsage - reserved),
      maxAllowed,
      currentUsage,
    };
  }

  return {
    ok: true,
    remaining: Math.max(0, maxAllowed - projectedTotal),
    maxAllowed,
    currentUsage,
  };
}

export async function recordUsageEvent(options: {
  workspaceId: string;
  jobId?: string;
  metric: string;
  quantity: number;
}) {
  return prisma.usageEvent.create({
    data: {
      workspaceId: options.workspaceId,
      jobId: options.jobId || null,
      metric: options.metric,
      quantity: options.quantity,
    },
  });
}
