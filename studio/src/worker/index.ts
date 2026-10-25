import "dotenv/config";
import { Worker } from "bullmq";
import { executeJob, JOBS_QUEUE_NAME } from "@/lib/queue/jobs";
import { runCleanupJob } from "@/lib/cleanup";
import { getEnv } from "@/lib/env";

console.log("[Worker] Starting XSW Tools Job Worker...");

const env = getEnv();
const redisUrl = new URL(env.REDIS_URL);

const worker = new Worker(
  JOBS_QUEUE_NAME,
  async (job) => {
    console.log(`[Worker] Processing BullMQ job ${job.id} for studio jobId: ${job.data.jobId}`);
    await executeJob(job.data.jobId);
  },
  {
    connection: {
      host: redisUrl.hostname,
      port: Number(redisUrl.port) || 6379,
      password: redisUrl.password || undefined,
      username: redisUrl.username || undefined,
      maxRetriesPerRequest: null,
    },
    concurrency: 5,
  }
);

worker.on("completed", (job) => {
  console.log(`[Worker] Job ${job.id} finished successfully`);
});

worker.on("failed", (job, err) => {
  console.error(`[Worker] Job ${job?.id} failed with error:`, err.message);
});

// Hourly cleanup runner
const CLEANUP_INTERVAL_MS = 60 * 60 * 1000;
const cleanupTimer = setInterval(async () => {
  try {
    console.log("[Worker] Running scheduled cleanup job...");
    const stats = await runCleanupJob();
    console.log(`[Worker] Cleanup completed: ${stats.cleanedCount} expired files deleted, ${stats.purgedCount} purged.`);
  } catch (err: unknown) {
    console.error("[Worker] Scheduled cleanup encountered an error:", (err as Error).message);
  }
}, CLEANUP_INTERVAL_MS);

// Run initial cleanup on startup
runCleanupJob().catch((err) => {
  console.error("[Worker] Initial cleanup failed:", err.message);
});

async function shutdown() {
  console.log("[Worker] Shutting down gracefully...");
  clearInterval(cleanupTimer);
  await worker.close();
  process.exit(0);
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
