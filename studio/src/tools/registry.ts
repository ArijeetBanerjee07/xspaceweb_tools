import { z, ZodType } from "zod";
import { StorageAdapter, storage } from "@/lib/storage/cloudinary";
import { Job, File } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getEnv } from "@/lib/env";
import { getPlan } from "@/config/plans";

export type StudioId =
  | "pdf"
  | "ai-doc"
  | "hub"
  | "security"
  | "qr"
  | "background"
  | "office"
  | "compress"
  | "trendrank";

export interface ToolExecutionContext {
  job: Job;
  inputs: unknown;
  storage: StorageAdapter;
  log: (msg: string) => void;
}

export interface ToolExecutionResult {
  outputs: string[]; // output file IDs
}

export interface ToolDefinition<TInputs = unknown> {
  id: string;
  studio: StudioId;
  name: string;
  description: string;
  phase: 1 | 2 | 3;
  inputs: ZodType<TInputs>;
  quotaMetric: "imageCredits" | "aiCredits" | "qrCodes" | "batchRows";
  creditCost: number;
  planGate: "free" | "starter" | "pro" | "growth" | "business";
  timeoutMs?: number;
  handler: (context: ToolExecutionContext) => Promise<ToolExecutionResult>;
}

export const toolsRegistry = new Map<string, ToolDefinition<any>>();

export function registerTool<T>(tool: ToolDefinition<T>) {
  toolsRegistry.set(tool.id, tool);
}

// -------------------------------------------------------------
// DUMMY "ECHO" TOOL FOR TESTING PIPELINE END-TO-END
// -------------------------------------------------------------
const echoInputsSchema = z.object({
  message: z.string().default("Hello XSPACEWEB"),
  forceFail: z.boolean().optional().default(false),
  inputFileId: z.string().optional(),
});

registerTool({
  id: "echo",
  studio: "hub",
  name: "Echo Pipeline Test",
  description: "Echoes input text or file to verify end-to-end pipeline execution.",
  phase: 1,
  inputs: echoInputsSchema,
  quotaMetric: "imageCredits",
  creditCost: 1,
  planGate: "free",
  timeoutMs: 15000,
  handler: async ({ job, inputs, storage, log }) => {
    const data = echoInputsSchema.parse(inputs);
    log(`Starting echo tool with message: ${data.message}`);

    if (data.forceFail) {
      throw new Error("FORCED_FAILURE_FOR_TESTING");
    }

    const env = getEnv();
    const workspace = await prisma.workspace.findUnique({
      where: { id: job.workspaceId },
    });
    const plan = getPlan(workspace?.planId);
    const retentionMs = plan.retentionHours * 60 * 60 * 1000;
    const expiresAt = new Date(Date.now() + retentionMs);

    const outputContent = `Echo output: ${data.message} | Job: ${job.id}`;
    const buffer = Buffer.from(outputContent, "utf8");

    const folder = `${env.CLOUDINARY_FOLDER}/${job.workspaceId}/outputs/${job.id}`;
    const resource = await storage.uploadBuffer({
      buffer,
      folder,
      publicId: "1",
      resourceType: "raw",
      format: "txt",
    });

    const outputFile = await prisma.file.create({
      data: {
        workspaceId: job.workspaceId,
        name: `echo-${job.id}.txt`,
        mimeType: "text/plain",
        sizeBytes: buffer.length,
        cloudinaryPublicId: resource.publicId,
        cloudinaryResourceType: "raw",
        cloudinaryFormat: "txt",
        status: "ready",
        expiresAt,
      },
    });

    log(`Echo tool complete, created output file ${outputFile.id}`);
    return {
      outputs: [outputFile.id],
    };
  },
});

export function getTool(toolId: string): ToolDefinition | undefined {
  return toolsRegistry.get(toolId);
}

export function listTools(): ToolDefinition[] {
  return Array.from(toolsRegistry.values());
}
