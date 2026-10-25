import { NextResponse } from "next/server";
import { z } from "zod";
import { getAuthContext } from "@/lib/auth/session";
import { getTool } from "@/tools/registry";
import { checkAndReserveQuota } from "@/lib/quota/ledger";
import { prisma } from "@/lib/prisma";
import { executeJob, getJobsQueue } from "@/lib/queue/jobs";

const createJobSchema = z.object({
  toolId: z.string().min(1),
  inputs: z.record(z.string(), z.any()).default({}),
  idempotencyKey: z.string().optional(),
});

export async function POST(req: Request) {
  try {
    const authContext = await getAuthContext();
    if (!authContext) {
      return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = createJobSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "VALIDATION_FAILED", details: parsed.error.issues },
        { status: 400 }
      );
    }

    const { toolId, inputs, idempotencyKey } = parsed.data;
    const workspaceId = authContext.workspaceId;

    const tool = getTool(toolId);
    if (!tool) {
      return NextResponse.json({ error: "TOOL_NOT_FOUND" }, { status: 404 });
    }

    // Validate inputs with tool's specific zod schema
    const toolInputValidation = tool.inputs.safeParse(inputs);
    if (!toolInputValidation.success) {
      return NextResponse.json(
        { error: "INVALID_TOOL_INPUTS", details: toolInputValidation.error.issues },
        { status: 400 }
      );
    }

    // Honour idempotencyKey
    if (idempotencyKey) {
      const existing = await prisma.job.findUnique({
        where: {
          workspaceId_idempotencyKey: {
            workspaceId,
            idempotencyKey,
          },
        },
      });

      if (existing) {
        return NextResponse.json({ success: true, job: existing, idempotent: true });
      }
    }

    // Check plan monthly quota and reserve
    const quota = await checkAndReserveQuota({
      workspaceId,
      planId: authContext.workspace.planId,
      metric: tool.quotaMetric,
      cost: tool.creditCost,
    });

    if (!quota.ok) {
      return NextResponse.json(
        {
          error: "QUOTA_EXCEEDED",
          metric: tool.quotaMetric,
          maxAllowed: quota.maxAllowed,
          currentUsage: quota.currentUsage,
        },
        { status: 403 }
      );
    }

    // Create the Job
    const job = await prisma.job.create({
      data: {
        workspaceId,
        toolId,
        status: "queued",
        progress: 0,
        costUnits: tool.creditCost,
        idempotencyKey: idempotencyKey || null,
        inputFileIds: inputs,
      },
    });

    // Enqueue job via BullMQ or execute synchronously if sync execution requested/test mode
    if (process.env.SYNC_JOBS === "true") {
      await executeJob(job.id);
    } else {
      try {
        const queue = getJobsQueue();
        await queue.add(
          "run-tool",
          { jobId: job.id },
          {
            jobId: job.id,
            removeOnComplete: 1000,
            removeOnFail: 1000,
          }
        );
      } catch {
        // Fallback to inline execution if Redis queue cannot be reached
        executeJob(job.id).catch((err) => {
          console.error("Inline job execution error:", err);
        });
      }
    }

    const latest = await prisma.job.findUnique({ where: { id: job.id } });

    return NextResponse.json({ success: true, job: latest || job }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "INTERNAL_SERVER_ERROR" }, { status: 500 });
  }
}
