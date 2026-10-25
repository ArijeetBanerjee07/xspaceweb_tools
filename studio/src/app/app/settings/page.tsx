import { getAuthContext } from "@/lib/auth/session";
import { SettingsClient } from "./SettingsClient";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const auth = (await getAuthContext())!;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Settings</h1>
        <p className="text-sm text-slate-500 mt-1">
          Manage your account profile, workspace configuration, and security credentials.
        </p>
      </div>

      <SettingsClient
        initialName={auth.user.name || ""}
        initialWorkspaceName={auth.workspace.name}
        email={auth.user.email}
        planId={auth.workspace.planId}
      />
    </div>
  );
}
