import { PrismaClient } from "@prisma/client";
import { createDevPrismaClient } from "./dev-db";

const globalForPrisma = globalThis as unknown as {
  prisma: any;
};

// Use file-backed dev database only if explicitly requested or if no DATABASE_URL is provided in development
const useDevDb =
  process.env.USE_MOCK_DB === "true" ||
  (!process.env.DATABASE_URL && process.env.NODE_ENV !== "production");

function createPrismaClient() {
  if (useDevDb) {
    return createDevPrismaClient();
  }

  // Ensure Neon Pooled URL has pgbouncer=true and connection_limit=1
  if (process.env.DATABASE_URL && process.env.DATABASE_URL.includes("-pooler")) {
    if (!process.env.DATABASE_URL.includes("pgbouncer=true")) {
      const sep = process.env.DATABASE_URL.includes("?") ? "&" : "?";
      process.env.DATABASE_URL = `${process.env.DATABASE_URL}${sep}pgbouncer=true&connection_limit=1`;
    }
  }

  const baseClient = new PrismaClient({
    log: ["error"],
  });

  // Resilient retry extension for Neon serverless / PgBouncer closed connection drops
  return baseClient.$extends({
    query: {
      $allModels: {
        async $allOperations({ query, args }: { query: any; args: any }) {
          try {
            return await query(args);
          } catch (err: any) {
            const errStr = String(err?.message || err || "");
            const isConnectionDrop =
              errStr.includes("Closed") ||
              errStr.includes("kind: Closed") ||
              errStr.includes("P1017") ||
              errStr.includes("P1001") ||
              errStr.includes("Connection reset") ||
              errStr.includes("Connection terminated");

            if (isConnectionDrop) {
              // Retry once after brief reconnect backoff
              await new Promise((r) => setTimeout(r, 400));
              try {
                await baseClient.$disconnect().catch(() => {});
                await baseClient.$connect().catch(() => {});
              } catch {}
              return await query(args);
            }
            throw err;
          }
        },
      },
    },
  });
}

if (!globalForPrisma.prisma) {
  globalForPrisma.prisma = createPrismaClient();
}

export const prisma = globalForPrisma.prisma;
