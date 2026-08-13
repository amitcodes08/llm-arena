import { PrismaClient } from "@/app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { env } from "@/app/env";

declare global {
  var prismaGlobal: PrismaClient | undefined;
}

const createPrismaClient = () => {
  const adapter = new PrismaPg({ connectionString: env.DATABASE_URL });
  return new PrismaClient({ adapter });
};

export const database = (): PrismaClient => {
  if (process.env.NODE_ENV === "production") {
    return createPrismaClient();
  }

  if (!globalThis.prismaGlobal) {
    globalThis.prismaGlobal = createPrismaClient();
  }

  return globalThis.prismaGlobal;
};
