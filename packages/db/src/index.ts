import { PrismaClient } from "../generated/index.js";

/**
 * Standard Next.js-safe singleton: avoids exhausting Postgres connections
 * across hot-reloads in dev, where the module can be re-evaluated without
 * the process restarting.
 */
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export * from "../generated/index.js";
export * from "./maintenance";
