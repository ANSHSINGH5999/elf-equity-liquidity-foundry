import { NextResponse } from "next/server";
import { prisma } from "@elf/db";

/**
 * Indexer diagnostics (ELF V1 Phase 5.15). Read-only, no secrets or RPC
 * URLs exposed — signatures and pool addresses here are already public
 * on-chain information, not infrastructure detail.
 */
export async function GET() {
  let databaseConnectivity: "ok" | "unavailable";
  try {
    await prisma.$queryRaw`SELECT 1`;
    databaseConnectivity = "ok";
  } catch {
    databaseConnectivity = "unavailable";
  }

  const [cursors, lastTrade, lastGraduationEvent] = await Promise.all([
    prisma.indexerCursor.findMany(),
    prisma.trade.findFirst({ orderBy: { timestamp: "desc" }, select: { marketId: true, signature: true, timestamp: true } }),
    prisma.graduationEvent.findFirst({ orderBy: { timestamp: "desc" }, select: { marketId: true, signature: true, timestamp: true } }),
  ]);

  const now = Date.now();
  const pools = cursors.map((c) => ({
    poolAddress: c.poolAddress,
    lastSignature: c.lastSignature,
    lastIndexedAt: c.lastIndexedAt,
    lagSeconds: Math.round((now - c.lastIndexedAt.getTime()) / 1000),
  }));

  const staleThresholdSeconds = 300;
  const stalePools = pools.filter((p) => p.lagSeconds > staleThresholdSeconds);

  const lastSuccessfulRun = pools.reduce<Date | null>((latest, p) => {
    return !latest || p.lastIndexedAt > latest ? p.lastIndexedAt : latest;
  }, null);

  // Whichever of the two event tables has the more recent row wins — a plain comparison, not a nested ternary.
  const candidates = [
    lastTrade ? { type: "trade" as const, marketId: lastTrade.marketId, timestamp: lastTrade.timestamp } : null,
    lastGraduationEvent
      ? { type: "graduation" as const, marketId: lastGraduationEvent.marketId, timestamp: lastGraduationEvent.timestamp }
      : null,
  ].filter((c): c is NonNullable<typeof c> => c !== null);
  const lastIndexedEvent = candidates.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())[0] ?? null;

  return NextResponse.json({
    status: databaseConnectivity === "unavailable" ? "unavailable" : stalePools.length === 0 ? "ok" : "lagging",
    databaseConnectivity,
    poolsTracked: pools.length,
    stalePools: stalePools.map((p) => p.poolAddress),
    lastSuccessfulRun,
    lastIndexedEvent,
    pools,
  });
}
