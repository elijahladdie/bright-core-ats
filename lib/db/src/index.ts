import { PrismaClient } from "@prisma/client";

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

const prismaGlobal = globalThis as typeof globalThis & {
  brightcorePrisma?: PrismaClient;
};

export const prisma =
  prismaGlobal.brightcorePrisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  prismaGlobal.brightcorePrisma = prisma;
}

export { Prisma } from "@prisma/client";
