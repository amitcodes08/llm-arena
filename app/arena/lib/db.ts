/**
 * Prisma client singleton.
 *
 * In development, the client is cached on `globalThis` to survive
 * hot-module reloads without leaking connections.
 *
 * DATABASE_URL is validated by env.ts at import time.
 * Prisma 7 requires an explicit driver adapter.
 */

import { PrismaClient } from "@/app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { env } from "@/app/env";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient(): PrismaClient {
  const adapter = new PrismaPg({ connectionString: env.DATABASE_URL });
  return new PrismaClient({ adapter });
}

export const db: PrismaClient =
  globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = db;
}
