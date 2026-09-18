import type { Connection } from "@solana/web3.js";
import { prisma } from "@elf/db";
import { indexPool, type IndexPoolResult } from "./indexPool";

export interface RunIndexerResult {
  poolsProcessed: number;
  pools: Array<{ poolAddress: string } & IndexPoolResult>;
  errors: Array<{ poolAddress: string; message: string }>;
}

/**
 * One indexing pass over every deployed pool. Designed to be called
 * either from a scheduled HTTP route (Vercel Cron hitting
 * `/api/indexer/run`) or a standalone long-running process
 * (`packages/indexer/src/cli.ts`, e.g. on Railway/Render) — see
 * docs/indexer.md for the tradeoffs of each. One pool's failure never
 * stops the others from being indexed.
 */
export async function runIndexerOnce(connection: Connection): Promise<RunIndexerResult> {
  const launches = await prisma.launch.findMany({
    where: { poolAddress: { not: null } },
    select: { poolAddress: true },
  });

  const pools: RunIndexerResult["pools"] = [];
  const errors: RunIndexerResult["errors"] = [];

  for (const { poolAddress } of launches) {
    if (!poolAddress) continue;
    try {
      const result = await indexPool(connection, poolAddress);
      pools.push({ poolAddress, ...result });
    } catch (error) {
      errors.push({ poolAddress, message: error instanceof Error ? error.message : String(error) });
    }
  }

  return { poolsProcessed: pools.length, pools, errors };
}
