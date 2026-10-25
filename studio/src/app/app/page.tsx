import { WorkspaceDashboard } from "@/components/studio/WorkspaceDashboard";
import { getAuthContext } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { getMonthUsage } from "@/lib/quota/ledger";
import { getPlan } from "@/config/plans";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  let serverJobs: any[] = [];
  let planUsage: any = null;
  let currentPlan: any = null;
  let workspaceStorageBytes = 0;

  try {
    const auth = await getAuthContext();
    if (auth?.workspaceId) {
      const [jobs, usage, activities, files] = await Promise.all([
        prisma.job.findMany({
          where: { workspaceId: auth.workspaceId },
          orderBy: { createdAt: "desc" },
          take: 200,
        }).catch(() => []),
        getMonthUsage(auth.workspaceId).catch(() => null),
        prisma.activity.findMany({
          where: { workspaceId: auth.workspaceId },
          orderBy: { createdAt: "desc" },
          take: 200,
        }).catch(() => []),
        prisma.file.findMany({
          where: { workspaceId: auth.workspaceId },
        }).catch(() => []),
      ]);

      const mappedJobs = (jobs || []).map((j: any) => ({
        id: j.id.startsWith("job-") ? j.id : `job-${j.id.slice(0, 8)}`,
        toolId: j.toolId,
        status: j.status,
        costUnits: j.costUnits,
        startedAt: j.startedAt ? new Date(j.startedAt).toISOString() : null,
        finishedAt: j.finishedAt ? new Date(j.finishedAt).toISOString() : null,
        createdAt: j.createdAt ? new Date(j.createdAt).toISOString() : new Date().toISOString(),
      }));

      const mappedActivities = (activities || []).map((act: any) => {
        let toolId = "doc-upload";
        let toolName = "Document Hub Upload";
        let studioName = "Document Hub";
        let studioCategory = "pdf";

        if (act.type === "folder_created") {
          toolId = "folder-create";
          toolName = "Folder Creation";
          studioName = "Document Hub";
        } else if (act.type === "file_uploaded") {
          toolId = "file-upload";
          toolName = act.description || "File Upload";
          studioName = "Document Hub";
        }

        return {
          id: act.id,
          toolId,
          toolName,
          studioName,
          studioCategory,
          status: "succeeded",
          costUnits: 0,
          startedAt: null,
          finishedAt: null,
          createdAt: act.createdAt ? new Date(act.createdAt).toISOString() : new Date().toISOString(),
        };
      });

      serverJobs = [...mappedJobs, ...mappedActivities];
      planUsage = usage;
      currentPlan = getPlan(auth.workspace.planId);
      workspaceStorageBytes = (files || []).reduce((acc: number, f: any) => acc + (f.sizeBytes || 0), 0);
    }
  } catch (err) {
    console.warn("[DashboardPage] Non-critical error loading workspace data:", err);
  }

  return (
    <WorkspaceDashboard
      serverJobs={serverJobs}
      planUsage={planUsage}
      currentPlan={currentPlan}
      workspaceStorageBytes={workspaceStorageBytes}
    />
  );
}
