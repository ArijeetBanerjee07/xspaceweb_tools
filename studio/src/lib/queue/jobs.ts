import { Queue } from "bullmq";
import { prisma } from "@/lib/prisma";
import { getTool } from "@/tools/registry";
import { storage } from "@/lib/storage/cloudinary";
import { recordUsageEvent } from "@/lib/quota/ledger";
import { getEnv } from "@/lib/env";

export const JOBS_QUEUE_NAME = "jobs";

let jobsQueueInstance: Queue | null = null;

export function getJobsQueue(): Queue {
  if (!jobsQueueInstance) {
    const env = getEnv();
    const redisUrl = new URL(env.REDIS_URL);
    jobsQueueInstance = new Queue(JOBS_QUEUE_NAME, {
      connection: {
        host: redisUrl.hostname,
        port: Number(redisUrl.port) || 6379,
        password: redisUrl.password || undefined,
        username: redisUrl.username || undefined,
        maxRetriesPerRequest: null,
      },
    });
  }
  return jobsQueueInstance;
}

export async function executeJob(jobId: string): Promise<void> {
  const job = await prisma.job.findUnique({ where: { id: jobId } });
  if (!job || job.status === "cancelled" || job.status === "succeeded") {
    return;
  }

  const tool = getTool(job.toolId);
  if (!tool) {
    await prisma.job.update({
      where: { id: jobId },
      data: {
        status: "failed",
        errorCode: "TOOL_NOT_FOUND",
        errorMessage: `Tool ${job.toolId} is not registered`,
        costUnits: 0, // release reservation
        finishedAt: new Date(),
      },
    });
    return;
  }

  await prisma.job.update({
    where: { id: jobId },
    data: {
      status: "running",
      startedAt: new Date(),
      progress: 10,
      attempts: { increment: 1 },
    },
  });

  const logs: string[] = [];
  const logFn = (msg: string) => {
    logs.push(`[${new Date().toISOString()}] ${msg}`);
  };

  try {
    const inputs = typeof job.inputFileIds === "object" ? job.inputFileIds : {};
    
    // Per-tool timeout handling
    const timeoutMs = tool.timeoutMs || 60000;
    const executionPromise = tool.handler({
      job,
      inputs,
      storage,
      log: logFn,
    });

    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error("JOB_TIMEOUT")), timeoutMs);
    });

    const result = await Promise.race([executionPromise, timeoutPromise]);

    // Success: mark succeeded, save outputs, record UsageEvent
    await prisma.job.update({
      where: { id: jobId },
      data: {
        status: "succeeded",
        progress: 100,
        outputFileIds: result.outputs,
        finishedAt: new Date(),
      },
    });

    if (job.costUnits > 0) {
      await recordUsageEvent({
        workspaceId: job.workspaceId,
        jobId: job.id,
        metric: tool.quotaMetric,
        quantity: job.costUnits,
      });
    }
  } catch (err: unknown) {
    const error = err as Error;
    const isTimeout = error.message === "JOB_TIMEOUT";
    const errorCode = isTimeout ? "JOB_TIMEOUT" : "JOB_FAILED";
    const cleanMessage = isTimeout
      ? "Job exceeded maximum execution time"
      : error.message || "An error occurred during tool execution";

    // Release reservation on failure by zeroing costUnits
    await prisma.job.update({
      where: { id: jobId },
      data: {
        status: "failed",
        progress: 0,
        errorCode,
        errorMessage: cleanMessage,
        costUnits: 0,
        finishedAt: new Date(),
      },
    });
  }
}
