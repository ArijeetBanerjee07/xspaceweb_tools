import { PrismaClient } from "@prisma/client";
import { createDevPrismaClient } from "./dev-db";

const globalForPrisma = globalThis as unknown as {
  prisma: any;
};

// Use file-backed dev database only if explicitly requested or if no DATABASE_URL is provided in development
const useDevDb =
  process.env.USE_MOCK_DB === "true" ||
  (!process.env.DATABASE_URL && process.env.NODE_ENV !== "production");

if (useDevDb) {
  // Overwrite any stale PrismaClient instances in the running dev server
  globalForPrisma.prisma = createDevPrismaClient();
} else if (!globalForPrisma.prisma) {
  globalForPrisma.prisma = new PrismaClient({
    log: ["error"],
  });
}

export const prisma = globalForPrisma.prisma;
