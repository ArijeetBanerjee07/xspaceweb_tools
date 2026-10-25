import { redirect } from "next/navigation";
import { getAuthContext } from "@/lib/auth/session";
import { StudioShell } from "@/components/studio/StudioShell";

export const dynamic = "force-dynamic";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const authContext = await getAuthContext();
  if (!authContext) {
    redirect("/login");
  }

  return (
    <StudioShell
      user={{
        name: authContext.user.name,
        email: authContext.user.email,
      }}
      workspace={{
        name: authContext.workspace.name,
        planId: authContext.workspace.planId,
      }}
      role={authContext.role}
    >
      {children}
    </StudioShell>
  );
}
