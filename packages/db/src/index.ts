import { existsSync } from "node:fs";
import path from "node:path";
import { PrismaClient } from "../generated/index.js";

// Next bundles this client, so Prisma looks for its engine under process.cwd() (apps/web on Vercel),
// while file tracing places it at the monorepo root. Point Prisma at the traced copy explicitly.
const linuxEngine = path.resolve(process.cwd(), "../../packages/db/generated/libquery_engine-rhel-openssl-3.0.x.so.node");
if (process.platform === "linux" && !process.env.PRISMA_QUERY_ENGINE_LIBRARY && existsSync(linuxEngine)) {
  process.env.PRISMA_QUERY_ENGINE_LIBRARY = linuxEngine;
}

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
