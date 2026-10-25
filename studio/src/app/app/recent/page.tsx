import { getAuthContext } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { RecentJobsClient } from "./RecentJobsClient";

export const dynamic = "force-dynamic";

export default async function RecentJobsPage() {
  let dbJobs: any[] = [];

  try {
    const auth = await getAuthContext();
    if (auth?.workspaceId) {
      const [jobs, activities] = await Promise.all([
        prisma.job.findMany({
          where: { workspaceId: auth.workspaceId },
          orderBy: { createdAt: "desc" },
          take: 50,
        }).catch(() => []),
        prisma.activity.findMany({
          where: { workspaceId: auth.workspaceId },
          orderBy: { createdAt: "desc" },
          take: 50,
        }).catch(() => []),
      ]);

      const mappedJobs = (jobs || []).map((j: any) => ({
        id: j.id.startsWith("job-") ? j.id : `job-${j.id.slice(0, 8)}`,
        toolId: j.toolId,
        status: j.status,
        costUnits: j.costUnits || 0,
        startedAt: j.startedAt ? new Date(j.startedAt).toISOString() : null,
        finishedAt: j.finishedAt ? new Date(j.finishedAt).toISOString() : null,
        createdAt: j.createdAt ? new Date(j.createdAt).toISOString() : new Date().toISOString(),
      }));

      const mappedActivities = (activities || []).map((act: any) => {
        let toolId = "doc-upload";
        if (act.type === "folder_created") toolId = "folder-create";
        else if (act.type === "file_uploaded") toolId = "file-upload";

        return {
          id: act.id,
          toolId,
          toolName: act.description || "Workspace File Upload",
          status: "succeeded",
          costUnits: 0,
          startedAt: null,
          finishedAt: null,
          createdAt: act.createdAt ? new Date(act.createdAt).toISOString() : new Date().toISOString(),
        };
      });

      dbJobs = [...mappedJobs, ...mappedActivities];
    }
  } catch (err) {
    console.warn("[RecentJobsPage] Non-critical error loading workspace jobs:", err);
  }

  return <RecentJobsClient initialDbJobs={dbJobs} />;
}
