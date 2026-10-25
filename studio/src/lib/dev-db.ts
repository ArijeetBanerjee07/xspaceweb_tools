import fs from "fs";
import path from "path";

// File-backed mock database for local development without Postgres
const DB_FILE = path.join(process.cwd(), ".dev-data.json");

interface DbData {
  users: any[];
  workspaces: any[];
  memberships: any[];
  files: any[];
  folders: any[];
  activities: any[];
  jobs: any[];
  usageEvents: any[];
  subscriptions: any[];
  passwordResetTokens: any[];
}

function loadData(): DbData {
  try {
    if (fs.existsSync(DB_FILE)) {
      const raw = fs.readFileSync(DB_FILE, "utf-8");
      const parsed = JSON.parse(raw);
      return {
        users: parsed.users || [],
        workspaces: parsed.workspaces || [],
        memberships: parsed.memberships || [],
        files: parsed.files || [],
        folders: parsed.folders || [],
        activities: parsed.activities || [],
        jobs: parsed.jobs || [],
        usageEvents: parsed.usageEvents || [],
        subscriptions: parsed.subscriptions || [],
        passwordResetTokens: parsed.passwordResetTokens || [],
      };
    }
  } catch {}
  return {
    users: [],
    workspaces: [],
    memberships: [],
    files: [],
    folders: [],
    activities: [],
    jobs: [],
    usageEvents: [],
    subscriptions: [],
    passwordResetTokens: [],
  };
}

function saveData(data: DbData) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), "utf-8");
  } catch {}
}

export function createDevPrismaClient() {
  const data = loadData();

  const syncData = () => {
    try {
      const disk = loadData();
      Object.assign(data, disk);
    } catch {}
    return data;
  };

  const client: any = {
    _data: data,

    user: {
      create: async ({ data: input }: any) => {
        syncData();
        const u = {
          id: input.id || `u_${Date.now()}_${Math.random().toString(36).slice(2)}`,
          createdAt: new Date().toISOString(),
          ...input,
        };
        data.users.push(u);
        saveData(data);
        return u;
      },
      findFirst: async ({ where }: any = {}) => {
        if (!where) return data.users[0] || null;
        return data.users.find(
          (x) => (where.id && x.id === where.id) || (where.email && x.email === where.email)
        ) || null;
      },
      findUnique: async ({ where, include }: any) => {
        syncData();
        const u = data.users.find(
          (x: any) => (where.id && x.id === where.id) || (where.email && x.email === where.email)
        );
        if (!u) return null;
        const res = { ...u };
        if (include?.memberships) {
          res.memberships = data.memberships
            .filter((m) => m.userId === u.id)
            .map((m) => {
              const ws = data.workspaces.find((w) => w.id === m.workspaceId);
              return { ...m, workspace: ws || null };
            });
        }
        return res;
      },
      update: async ({ where, data: updates }: any) => {
        const idx = data.users.findIndex(
          (u) => (where.id && u.id === where.id) || (where.email && u.email === where.email)
        );
        if (idx >= 0) {
          data.users[idx] = { ...data.users[idx], ...updates };
          saveData(data);
          return data.users[idx];
        }
        throw new Error("User not found");
      },
    },

    workspace: {
      create: async ({ data: input }: any) => {
        syncData();
        const w = {
          id: input.id || `ws_${Date.now()}_${Math.random().toString(36).slice(2)}`,
          planId: "free",
          createdAt: new Date().toISOString(),
          ...input,
        };
        data.workspaces.push(w);
        saveData(data);
        return w;
      },
      findFirst: async ({ where }: any = {}) => {
        if (!where) return data.workspaces[0] || null;
        return data.workspaces.find((w) => (where.id ? w.id === where.id : true)) || null;
      },
      findUnique: async ({ where }: any) => {
        return data.workspaces.find((w) => w.id === where.id) || null;
      },
      findMany: async () => [...data.workspaces],
      update: async ({ where, data: updates }: any) => {
        const idx = data.workspaces.findIndex((w) => w.id === where.id);
        if (idx >= 0) {
          data.workspaces[idx] = { ...data.workspaces[idx], ...updates };
          saveData(data);
          return data.workspaces[idx];
        }
        throw new Error("Workspace not found");
      },
    },

    membership: {
      create: async ({ data: input }: any) => {
        syncData();
        const m = {
          id: `m_${Date.now()}_${Math.random().toString(36).slice(2)}`,
          role: "member",
          ...input,
        };
        data.memberships.push(m);
        saveData(data);
        return m;
      },
      findFirst: async ({ where, include }: any) => {
        syncData();
        const m = data.memberships.find((x: any) => {
          if (where.userId && x.userId !== where.userId) return false;
          if (where.workspaceId && x.workspaceId !== where.workspaceId) return false;
          return true;
        });
        if (!m) return null;
        const res = { ...m };
        if (include?.workspace) {
          res.workspace = data.workspaces.find((w) => w.id === m.workspaceId) || null;
        }
        if (include?.user) {
          res.user = data.users.find((u) => u.id === m.userId) || null;
        }
        return res;
      },
      findMany: async ({ where }: any) => {
        return data.memberships.filter((m) => {
          if (where?.userId && m.userId !== where.userId) return false;
          if (where?.workspaceId && m.workspaceId !== where.workspaceId) return false;
          return true;
        });
      },
    },

    file: {
      create: async ({ data: input }: any) => {
        const f = {
          id: input.id || `f_${Date.now()}_${Math.random().toString(36).slice(2)}`,
          createdAt: new Date().toISOString(),
          status: "uploading",
          ...input,
        };
        data.files.push(f);
        saveData(data);
        return f;
      },
      findFirst: async ({ where }: any) => {
        return (
          data.files.find((f) => {
            if (where.id && f.id !== where.id) return false;
            if (where.workspaceId && f.workspaceId !== where.workspaceId) return false;
            if (where.status && typeof where.status === "string" && f.status !== where.status)
              return false;
            if (where.status?.not && f.status === where.status.not) return false;
            return true;
          }) || null
        );
      },
      findMany: async ({ where }: any = {}) => {
        return data.files.filter((f) => {
          if (where?.workspaceId && f.workspaceId !== where.workspaceId) return false;
          if (where?.id?.in && !where.id.in.includes(f.id)) return false;
          if (where?.status?.not && f.status === where.status.not) return false;
          if (where?.expiresAt?.lt && !(f.expiresAt && new Date(f.expiresAt) < where.expiresAt.lt))
            return false;
          if (where?.deletedAt?.lt && !(f.deletedAt && new Date(f.deletedAt) < where.deletedAt.lt))
            return false;
          return true;
        });
      },
      count: async ({ where }: any) => {
        return data.files.filter((f) => {
          if (where?.workspaceId && f.workspaceId !== where.workspaceId) return false;
          if (where?.status && f.status !== where.status) return false;
          return true;
        }).length;
      },
      aggregate: async ({ where }: any = {}) => {
        const matching = data.files.filter((f) => {
          if (where?.workspaceId && f.workspaceId !== where.workspaceId) return false;
          if (where?.status?.not && f.status === where.status.not) return false;
          return true;
        });
        const totalBytes = matching.reduce((acc: number, f: any) => acc + (f.sizeBytes || 0), 0);
        return {
          _sum: {
            sizeBytes: totalBytes,
          },
        };
      },
      update: async ({ where, data: updates }: any) => {
        const idx = data.files.findIndex((f) => f.id === where.id);
        if (idx >= 0) {
          data.files[idx] = { ...data.files[idx], ...updates };
          saveData(data);
          return data.files[idx];
        }
        throw new Error("File not found");
      },
      delete: async ({ where }: any) => {
        const idx = data.files.findIndex((f) => f.id === where.id);
        if (idx >= 0) {
          const deleted = data.files.splice(idx, 1)[0];
          saveData(data);
          return deleted;
        }
        throw new Error("File not found");
      },
    },

    folder: {
      create: async ({ data: input }: any) => {
        if (!data.folders) data.folders = [];
        const f = {
          id: input.id || `fld_${Date.now()}_${Math.random().toString(36).slice(2)}`,
          createdAt: new Date().toISOString(),
          ...input,
        };
        data.folders.push(f);
        saveData(data);
        return f;
      },
      findMany: async ({ where }: any = {}) => {
        if (!data.folders) data.folders = [];
        return data.folders.filter((f) => {
          if (where?.workspaceId && f.workspaceId !== where.workspaceId) return false;
          return true;
        });
      },
      count: async ({ where }: any = {}) => {
        if (!data.folders) data.folders = [];
        return data.folders.filter((f) => {
          if (where?.workspaceId && f.workspaceId !== where.workspaceId) return false;
          return true;
        }).length;
      },
      delete: async ({ where }: any) => {
        if (!data.folders) data.folders = [];
        const idx = data.folders.findIndex((f) => f.id === where.id);
        if (idx >= 0) {
          const deleted = data.folders.splice(idx, 1)[0];
          // Unassign files in this folder
          data.files.forEach((file) => {
            if (file.folderId === where.id) {
              file.folderId = null;
              file.folderName = null;
            }
          });
          saveData(data);
          return deleted;
        }
        throw new Error("Folder not found");
      },
    },

    activity: {
      create: async ({ data: input }: any) => {
        if (!data.activities) data.activities = [];
        const a = {
          id: input.id || `act_${Date.now()}_${Math.random().toString(36).slice(2)}`,
          createdAt: new Date().toISOString(),
          ...input,
        };
        data.activities.unshift(a);
        if (data.activities.length > 50) data.activities.pop();
        saveData(data);
        return a;
      },
      findMany: async ({ where, take = 20 }: any = {}) => {
        if (!data.activities) data.activities = [];
        return data.activities
          .filter((a) => {
            if (where?.workspaceId && a.workspaceId !== where.workspaceId) return false;
            return true;
          })
          .slice(0, take);
      },
    },

    job: {
      create: async ({ data: input }: any) => {
        const j = {
          id: input.id || `j_${Date.now()}_${Math.random().toString(36).slice(2)}`,
          createdAt: new Date().toISOString(),
          attempts: 0,
          progress: 0,
          ...input,
        };
        data.jobs.push(j);
        saveData(data);
        return j;
      },
      findUnique: async ({ where }: any) => {
        if (where.id) return data.jobs.find((j) => j.id === where.id) || null;
        if (where.workspaceId_idempotencyKey) {
          return (
            data.jobs.find(
              (j) =>
                j.workspaceId === where.workspaceId_idempotencyKey.workspaceId &&
                j.idempotencyKey === where.workspaceId_idempotencyKey.idempotencyKey
            ) || null
          );
        }
        return null;
      },
      findFirst: async ({ where }: any) => {
        return (
          data.jobs.find((j) => {
            if (where.id && j.id !== where.id) return false;
            if (where.workspaceId && j.workspaceId !== where.workspaceId) return false;
            return true;
          }) || null
        );
      },
      findMany: async ({ where, orderBy, take }: any = {}) => {
        let list = data.jobs.filter((j) => {
          if (where?.workspaceId && j.workspaceId !== where.workspaceId) return false;
          return true;
        });
        if (orderBy?.createdAt === "desc") {
          list = list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        }
        if (take) {
          list = list.slice(0, take);
        }
        return list;
      },
      aggregate: async ({ where }: any) => {
        const matching = data.jobs.filter((j) => {
          if (where?.workspaceId && j.workspaceId !== where.workspaceId) return false;
          if (where?.status?.in && !where.status.in.includes(j.status)) return false;
          return true;
        });
        const sum = matching.reduce((acc, curr) => acc + (curr.costUnits || 0), 0);
        return { _sum: { costUnits: sum } };
      },
      update: async ({ where, data: updates }: any) => {
        const idx = data.jobs.findIndex((j) => j.id === where.id);
        if (idx >= 0) {
          data.jobs[idx] = { ...data.jobs[idx], ...updates };
          saveData(data);
          return data.jobs[idx];
        }
        throw new Error("Job not found");
      },
    },

    usageEvent: {
      create: async ({ data: input }: any) => {
        const e = {
          id: `ue_${Date.now()}_${Math.random().toString(36).slice(2)}`,
          createdAt: new Date().toISOString(),
          ...input,
        };
        data.usageEvents.push(e);
        saveData(data);
        return e;
      },
      findMany: async ({ where }: any = {}) => {
        return data.usageEvents.filter((e) => {
          if (where?.workspaceId && e.workspaceId !== where.workspaceId) return false;
          if (where?.createdAt?.gte && new Date(e.createdAt) < where.createdAt.gte) return false;
          return true;
        });
      },
    },

    subscription: {
      create: async ({ data: input }: any) => {
        const s = { id: `sub_${Date.now()}`, createdAt: new Date().toISOString(), ...input };
        data.subscriptions.push(s);
        saveData(data);
        return s;
      },
      findFirst: async ({ where, orderBy }: any = {}) => {
        const subs = data.subscriptions.filter((s) => {
          if (where?.workspaceId && s.workspaceId !== where.workspaceId) return false;
          if (where?.status && s.status !== where.status) return false;
          if (where?.providerRef && s.providerRef !== where.providerRef) return false;
          return true;
        });
        if (orderBy?.createdAt === "desc" || orderBy?.currentPeriodEnd === "desc") {
          subs.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
        }
        return subs[0] || null;
      },
      findMany: async ({ where }: any = {}) => {
        return data.subscriptions.filter((s) => {
          if (where?.workspaceId && s.workspaceId !== where.workspaceId) return false;
          if (where?.status && s.status !== where.status) return false;
          return true;
        });
      },
      updateMany: async ({ where, data: updates }: any) => {
        let count = 0;
        data.subscriptions.forEach((s) => {
          if (!where || s.workspaceId === where.workspaceId) {
            Object.assign(s, updates);
            count++;
          }
        });
        saveData(data);
        return { count };
      },
    },

    passwordResetToken: {
      create: async ({ data: input }: any) => {
        const t = { id: `t_${Date.now()}`, createdAt: new Date().toISOString(), ...input };
        data.passwordResetTokens.push(t);
        saveData(data);
        return t;
      },
      findUnique: async ({ where }: any) => {
        return data.passwordResetTokens.find((t) => t.token === where.token) || null;
      },
      delete: async ({ where }: any) => {
        const idx = data.passwordResetTokens.findIndex((t) => t.id === where.id);
        if (idx >= 0) {
          const deleted = data.passwordResetTokens.splice(idx, 1)[0];
          saveData(data);
          return deleted;
        }
        return null;
      },
    },

    $transaction: async (arg: any) => {
      if (Array.isArray(arg)) {
        return Promise.all(arg);
      }
      if (typeof arg === "function") {
        return arg(client);
      }
      return arg;
    },
  };

  return client;
}
