export function createMockPrisma() {
  const users: any[] = [];
  const workspaces: any[] = [];
  const memberships: any[] = [];
  const files: any[] = [];
  const jobs: any[] = [];
  const usageEvents: any[] = [];
  const subscriptions: any[] = [];
  const passwordResetTokens: any[] = [];

  const mock = {
    _data: { users, workspaces, memberships, files, jobs, usageEvents, subscriptions, passwordResetTokens },

    user: {
      create: async ({ data }: any) => {
        const u = { id: data.id || `u_${Date.now()}_${Math.random().toString(36).slice(2)}`, createdAt: new Date(), ...data };
        users.push(u);
        return u;
      },
      findUnique: async ({ where }: any) => {
        if (where.id) return users.find((u) => u.id === where.id) || null;
        if (where.email) return users.find((u) => u.email === where.email) || null;
        return null;
      },
      update: async ({ where, data }: any) => {
        const idx = users.findIndex((u) => u.id === where.id || u.email === where.email);
        if (idx >= 0) {
          users[idx] = { ...users[idx], ...data };
          return users[idx];
        }
        throw new Error("User not found");
      },
    },

    workspace: {
      create: async ({ data }: any) => {
        const w = { id: data.id || `ws_${Date.now()}_${Math.random().toString(36).slice(2)}`, planId: "free", createdAt: new Date(), ...data };
        workspaces.push(w);
        return w;
      },
      findUnique: async ({ where }: any) => {
        return workspaces.find((w) => w.id === where.id) || null;
      },
      findMany: async () => [...workspaces],
      update: async ({ where, data }: any) => {
        const idx = workspaces.findIndex((w) => w.id === where.id);
        if (idx >= 0) {
          workspaces[idx] = { ...workspaces[idx], ...data };
          return workspaces[idx];
        }
        throw new Error("Workspace not found");
      },
    },

    membership: {
      create: async ({ data }: any) => {
        const m = { id: `m_${Date.now()}_${Math.random().toString(36).slice(2)}`, role: "member", ...data };
        memberships.push(m);
        return m;
      },
      findFirst: async ({ where }: any) => {
        return memberships.find((m) => {
          if (where.userId && m.userId !== where.userId) return false;
          if (where.workspaceId && m.workspaceId !== where.workspaceId) return false;
          return true;
        }) || null;
      },
      findMany: async ({ where }: any) => {
        return memberships.filter((m) => {
          if (where?.userId && m.userId !== where.userId) return false;
          if (where?.workspaceId && m.workspaceId !== where.workspaceId) return false;
          return true;
        });
      },
    },

    file: {
      create: async ({ data }: any) => {
        const f = { id: data.id || `f_${Date.now()}_${Math.random().toString(36).slice(2)}`, createdAt: new Date(), status: "uploading", ...data };
        files.push(f);
        return f;
      },
      findFirst: async ({ where }: any) => {
        return files.find((f) => {
          if (where.id && f.id !== where.id) return false;
          if (where.workspaceId && f.workspaceId !== where.workspaceId) return false;
          if (where.status && typeof where.status === "string" && f.status !== where.status) return false;
          if (where.status?.not && f.status === where.status.not) return false;
          return true;
        }) || null;
      },
      findMany: async ({ where }: any = {}) => {
        return files.filter((f) => {
          if (where?.workspaceId && f.workspaceId !== where.workspaceId) return false;
          if (where?.id?.in && !where.id.in.includes(f.id)) return false;
          if (where?.status?.not && f.status === where.status.not) return false;
          if (where?.expiresAt?.lt && !(f.expiresAt && f.expiresAt < where.expiresAt.lt)) return false;
          if (where?.deletedAt?.lt && !(f.deletedAt && f.deletedAt < where.deletedAt.lt)) return false;
          return true;
        });
      },
      count: async ({ where }: any) => {
        return files.filter((f) => {
          if (where?.workspaceId && f.workspaceId !== where.workspaceId) return false;
          if (where?.status && f.status !== where.status) return false;
          return true;
        }).length;
      },
      update: async ({ where, data }: any) => {
        const idx = files.findIndex((f) => f.id === where.id);
        if (idx >= 0) {
          files[idx] = { ...files[idx], ...data };
          return files[idx];
        }
        throw new Error("File not found");
      },
      delete: async ({ where }: any) => {
        const idx = files.findIndex((f) => f.id === where.id);
        if (idx >= 0) {
          const deleted = files.splice(idx, 1)[0];
          return deleted;
        }
        throw new Error("File not found");
      },
    },

    job: {
      create: async ({ data }: any) => {
        const j = { id: data.id || `j_${Date.now()}_${Math.random().toString(36).slice(2)}`, createdAt: new Date(), attempts: 0, progress: 0, ...data };
        jobs.push(j);
        return j;
      },
      findUnique: async ({ where }: any) => {
        if (where.id) return jobs.find((j) => j.id === where.id) || null;
        if (where.workspaceId_idempotencyKey) {
          return jobs.find(
            (j) =>
              j.workspaceId === where.workspaceId_idempotencyKey.workspaceId &&
              j.idempotencyKey === where.workspaceId_idempotencyKey.idempotencyKey
          ) || null;
        }
        return null;
      },
      findFirst: async ({ where }: any) => {
        return jobs.find((j) => {
          if (where.id && j.id !== where.id) return false;
          if (where.workspaceId && j.workspaceId !== where.workspaceId) return false;
          return true;
        }) || null;
      },
      findMany: async ({ where }: any = {}) => {
        return jobs.filter((j) => {
          if (where?.workspaceId && j.workspaceId !== where.workspaceId) return false;
          return true;
        });
      },
      aggregate: async ({ where }: any) => {
        const matching = jobs.filter((j) => {
          if (where?.workspaceId && j.workspaceId !== where.workspaceId) return false;
          if (where?.status?.in && !where.status.in.includes(j.status)) return false;
          return true;
        });
        const sum = matching.reduce((acc, curr) => acc + (curr.costUnits || 0), 0);
        return { _sum: { costUnits: sum } };
      },
      update: async ({ where, data }: any) => {
        const idx = jobs.findIndex((j) => j.id === where.id);
        if (idx >= 0) {
          jobs[idx] = { ...jobs[idx], ...data };
          return jobs[idx];
        }
        throw new Error("Job not found");
      },
    },

    usageEvent: {
      create: async ({ data }: any) => {
        const e = { id: `ue_${Date.now()}_${Math.random().toString(36).slice(2)}`, createdAt: new Date(), ...data };
        usageEvents.push(e);
        return e;
      },
      findMany: async ({ where }: any = {}) => {
        return usageEvents.filter((e) => {
          if (where?.workspaceId && e.workspaceId !== where.workspaceId) return false;
          if (where?.createdAt?.gte && e.createdAt < where.createdAt.gte) return false;
          return true;
        });
      },
    },

    subscription: {
      create: async ({ data }: any) => {
        const s = { id: `sub_${Date.now()}`, createdAt: new Date(), ...data };
        subscriptions.push(s);
        return s;
      },
      updateMany: async ({ where, data }: any) => {
        let count = 0;
        subscriptions.forEach((s) => {
          if (s.workspaceId === where.workspaceId) {
            Object.assign(s, data);
            count++;
          }
        });
        return { count };
      },
    },

    passwordResetToken: {
      create: async ({ data }: any) => {
        const t = { id: `t_${Date.now()}`, createdAt: new Date(), ...data };
        passwordResetTokens.push(t);
        return t;
      },
      findUnique: async ({ where }: any) => {
        return passwordResetTokens.find((t) => t.token === where.token) || null;
      },
      delete: async ({ where }: any) => {
        const idx = passwordResetTokens.findIndex((t) => t.id === where.id);
        if (idx >= 0) return passwordResetTokens.splice(idx, 1)[0];
        return null;
      },
    },

    $transaction: async (arg: any) => {
      if (Array.isArray(arg)) {
        return Promise.all(arg);
      }
      if (typeof arg === "function") {
        return arg(mock);
      }
      return arg;
    },
  };

  return mock;
}
