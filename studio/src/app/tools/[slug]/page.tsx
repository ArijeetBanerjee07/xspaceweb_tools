import { Metadata } from "next";
import { redirect } from "next/navigation";
import { getPublicTool, AI_TOOL_ROUTES } from "@/config/publicTools";
import { ToolRunnerClient } from "@/components/tools/ToolRunnerClient";
import { getAuthContext } from "@/lib/auth/session";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const tool = getPublicTool(slug);

  return {
    title: `${tool.name} | Free Online Tool - XSW Tools`,
    description: tool.description,
  };
}

export default async function ToolPage({ params }: PageProps) {
  const { slug } = await params;
  const normalizedSlug = slug.toLowerCase().trim();
  const authContext = await getAuthContext();

  const studioRoute = AI_TOOL_ROUTES[normalizedSlug];
  if (studioRoute) {
    if (authContext) {
      redirect(studioRoute);
    } else {
      redirect(`/signup?redirect=${encodeURIComponent(studioRoute)}&feature=${normalizedSlug}`);
    }
  }

  const tool = getPublicTool(slug);
  return <ToolRunnerClient tool={tool} isAuthenticated={Boolean(authContext)} />;
}
