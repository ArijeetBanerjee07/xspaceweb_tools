"use client";

import React, { createContext, useContext, useEffect } from "react";

export interface WorkspaceContextValue {
  user: {
    name?: string | null;
    email: string;
  };
  workspace: {
    name: string;
    planId: string;
  };
  role: string;
  isPro: boolean;
}

export const WorkspaceContext = createContext<WorkspaceContextValue | null>(null);

export function WorkspaceProvider({
  value,
  children,
}: {
  value: WorkspaceContextValue;
  children: React.ReactNode;
}) {
  useEffect(() => {
    if (value.workspace?.planId) {
      if (value.workspace.planId !== "free") {
        try {
          localStorage.setItem("otk_is_pro", "true");
          window.dispatchEvent(
            new CustomEvent("otk_plan_updated", { detail: { planId: value.workspace.planId } })
          );
        } catch {}
      } else {
        const local = localStorage.getItem("otk_is_pro") === "true";
        const expiresAt = Number(localStorage.getItem("otk_pro_expires_at") || 0);
        if (local && expiresAt > 0 && Date.now() > expiresAt) {
          localStorage.removeItem("otk_is_pro");
          localStorage.removeItem("otk_pro_expires_at");
          window.dispatchEvent(
            new CustomEvent("otk_plan_updated", { detail: { planId: "free" } })
          );
        }
      }
    }
  }, [value.workspace?.planId]);

  return <WorkspaceContext.Provider value={value}>{children}</WorkspaceContext.Provider>;
}

export function useWorkspace() {
  return useContext(WorkspaceContext);
}
