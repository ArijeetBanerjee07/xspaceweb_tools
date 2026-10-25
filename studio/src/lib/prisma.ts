import { PrismaClient } from "@prisma/client";
import { createDevPrismaClient } from "./dev-db";

const globalForPrisma = globalThis as unknown as {
  prisma: any;
};

// Use file-backed dev database unless explicitly configured to use live PostgreSQL
const useDevDb = process.env.USE_MOCK_DB !== "false";

if (useDevDb) {
  // Overwrite any stale PrismaClient instances in the running dev server
  globalForPrisma.prisma = createDevPrismaClient();
} else if (!globalForPrisma.prisma) {
  globalForPrisma.prisma = new PrismaClient({
    log: ["error"],
  });
}

export const prisma = globalForPrisma.prisma;
