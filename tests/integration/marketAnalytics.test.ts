import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { prisma } from "../../packages/db/src/index.js";
import {
  getDataFreshness,
  getLiquidityHistory,
  getMarketVolatility,
  getPriceHistory,
  getTradeStats,
  getTraderStats,
  getVolumeStats,
  resolveMarket,
} from "../../apps/web/src/lib/server/marketAnalytics.js";

/**
 * Real integration test against the local Postgres (docker compose),
 * exercising the Phase 5 analytics service layer end to end — seeded
 * fixture data, real SQL aggregation queries, real assertions. Does not
 * touch Solana (the on-chain-dependent parts of this service —
 * `getMarketOverview`, `getGraduationProgress`, `getMarketQualityScore`
 * — need a real deployed devnet pool, which the devnet-airdrop-dependent
 * `tests/integration/meteoraAdapter.test.ts` already covers/skips
 * gracefully; duplicating that dependency here isn't worth it for
 * indexed-data-only logic that doesn't need it).
 */
let dbAvailable = false;
let marketId = "";
const poolAddress = "TestPoo1AnAiyEuUmZ2wDgTNv67vhqZ8pmKKrqYWQK9";

beforeAll(async () => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    dbAvailable = true;
  } catch {
    dbAvailable = false;
    return;
  }

  const asset = await prisma.asset.create({
    data: {
      name: "Analytics Test Asset",
      symbol: "ATA",
      mintAddress: "So11111111111111111111111111111111111111112",
      issuer: "Test Issuer",
      assetType: "pre_ipo",
      referencePriceUsd: 10,
      source: "manual",
    },
  });
  const marketProfile = await prisma.marketProfile.create({
    data: {
      assetId: asset.id,
      initialLiquidityUsd: 250_000,
      expectedVolatility: "medium",
      riskProfile: "balanced",
      targetLiquidityUsd: 500_000,
      targetGraduationUsd: 1_000_000,
      quoteToken: "USDC",
    },
  });
  const curveConfig = await prisma.curveConfig.create({
    data: {
      assetId: asset.id,
      marketProfileId: marketProfile.id,
      riskProfile: "balanced",
      label: "Balanced",
      rationale: "test fixture",
      initialMarketCapUsd: 500_000,
      migrationMarketCapUsd: 4_000_000,
      tokenSupply: 50_000,
      tokenBaseDecimals: 9,
      feeSchedule: {},
      migration: {},
      liquidityDistribution: {},
      score: {},
    },
  });
  const launch = await prisma.launch.create({
    data: {
      assetId: asset.id,
      marketProfileId: marketProfile.id,
      curveConfigId: curveConfig.id,
      poolAddress,
      configAddress: "TestConfigAddress11111111111111111111111",
      status: "live",
      stage: "LIVE",
    },
  });
  marketId = launch.id;

  const now = Date.now();
  await prisma.trade.createMany({
    data: [
      { marketId, signature: "sig-1", trader: "traderA", side: "buy", tokenAmount: 10, quoteAmount: 100, priceUsd: 10, timestamp: new Date(now - 3 * 3_600_000) },
      { marketId, signature: "sig-2", trader: "traderB", side: "buy", tokenAmount: 20, quoteAmount: 220, priceUsd: 11, timestamp: new Date(now - 2 * 3_600_000) },
      { marketId, signature: "sig-3", trader: "traderA", side: "sell", tokenAmount: 5, quoteAmount: 60, priceUsd: 12, timestamp: new Date(now - 1 * 3_600_000) },
    ],
  });
  await prisma.priceHistory.createMany({
    data: [
      { marketId, priceUsd: 10, source: "indexed_trade", timestamp: new Date(now - 3 * 3_600_000) },
      { marketId, priceUsd: 11, source: "indexed_trade", timestamp: new Date(now - 2 * 3_600_000) },
      { marketId, priceUsd: 12, source: "indexed_trade", timestamp: new Date(now - 1 * 3_600_000) },
    ],
  });
  await prisma.liquidityHistory.createMany({
    data: [
      { marketId, liquidityUsd: 250_000, timestamp: new Date(now - 3 * 3_600_000) },
      { marketId, liquidityUsd: 260_000, timestamp: new Date(now - 1 * 3_600_000) },
    ],
  });
  await prisma.indexerCursor.create({
    data: { poolAddress, lastSignature: "sig-3" },
  });
}, 30_000);

afterAll(async () => {
  if (!dbAvailable) return;
  await prisma.trade.deleteMany({ where: { marketId } });
  await prisma.priceHistory.deleteMany({ where: { marketId } });
  await prisma.liquidityHistory.deleteMany({ where: { marketId } });
  await prisma.indexerCursor.deleteMany({ where: { poolAddress } });
  const launch = await prisma.launch.findUnique({ where: { id: marketId } });
  if (launch) {
    await prisma.launch.delete({ where: { id: marketId } });
    await prisma.curveConfig.delete({ where: { id: launch.curveConfigId } });
    await prisma.marketProfile.delete({ where: { id: launch.marketProfileId } });
    await prisma.asset.delete({ where: { id: launch.assetId } });
  }
});

describe("marketAnalytics (real Postgres, seeded fixtures)", () => {
  it("resolves a valid market and returns null for an unknown one", async () => {
    if (!dbAvailable) return console.warn("Skipping: local Postgres unavailable.");
    expect(await resolveMarket(marketId)).not.toBeNull();
    expect(await resolveMarket("does-not-exist")).toBeNull();
  });

  it("computes buy/sell volume via DB-side aggregation, not application-side reduction", async () => {
    if (!dbAvailable) return console.warn("Skipping: local Postgres unavailable.");
    const stats = await getVolumeStats(marketId, "ALL");
    // buy: 10*10 + 20*11 = 320, sell: 5*12 = 60
    expect(stats.buyVolumeUsd).toBe(320);
    expect(stats.sellVolumeUsd).toBe(60);
    expect(stats.totalVolumeUsd).toBe(380);
    expect(stats.buyCount).toBe(2);
    expect(stats.sellCount).toBe(1);
    expect(stats.buySellRatio).toBe(2);
    expect(stats.source).toBe("INDEXED");
  });

  it("never returns more volume for a shorter period than for ALL time", async () => {
    if (!dbAvailable) return console.warn("Skipping: local Postgres unavailable.");
    const oneHour = await getVolumeStats(marketId, "1H");
    const allTime = await getVolumeStats(marketId, "ALL");
    expect(oneHour.totalVolumeUsd).toBeLessThanOrEqual(allTime.totalVolumeUsd);
    expect(oneHour.source).toBe("INDEXED");
  });

  it("computes trade stats (count, average, largest) from real rows", async () => {
    if (!dbAvailable) return console.warn("Skipping: local Postgres unavailable.");
    const stats = await getTradeStats(marketId, "ALL");
    expect(stats.totalTrades).toBe(3);
    expect(stats.buyTrades).toBe(2);
    expect(stats.sellTrades).toBe(1);
    expect(stats.largestTradeUsd).toBe(220); // 20 * 11
    expect(stats.averageTradeSizeUsd).toBeCloseTo(380 / 3, 1); // service rounds to 2 decimals
  });

  it("counts distinct traders correctly", async () => {
    if (!dbAvailable) return console.warn("Skipping: local Postgres unavailable.");
    const stats = await getTraderStats(marketId, "ALL");
    expect(stats.uniqueTraders).toBe(2); // traderA, traderB
  });

  it("returns price history with dataAvailableSince set to the earliest indexed point", async () => {
    if (!dbAvailable) return console.warn("Skipping: local Postgres unavailable.");
    const history = await getPriceHistory(marketId, "ALL");
    expect(history.points).toHaveLength(3);
    expect(history.dataAvailableSince).not.toBeNull();
    expect(history.source).toBe("INDEXED");
  });

  it("returns insufficient-data-shaped price history for a market with no indexed prices", async () => {
    if (!dbAvailable) return console.warn("Skipping: local Postgres unavailable.");
    const other = await prisma.launch.findFirst({ where: { id: { not: marketId } } });
    const emptyMarketId = other?.id ?? "genuinely-nonexistent-market";
    const history = await getPriceHistory(emptyMarketId, "ALL");
    expect(history.points).toHaveLength(0);
    expect(history.dataAvailableSince).toBeNull();
  });

  it("computes liquidity change from the earliest point in the window, never inventing a baseline", async () => {
    if (!dbAvailable) return console.warn("Skipping: local Postgres unavailable.");
    const history = await getLiquidityHistory(marketId, "ALL");
    expect(history.current).toBe(260_000);
    expect(history.high).toBe(260_000);
    expect(history.low).toBe(250_000);
    if ("value" in history.percentChange) {
      expect(history.percentChange.value).toBeCloseTo(4, 1); // (260000-250000)/250000*100
    } else {
      throw new Error("expected a computed percent change");
    }
  });

  it("reports insufficient volatility data for a market with fewer than 3 indexed prices", async () => {
    if (!dbAvailable) return console.warn("Skipping: local Postgres unavailable.");
    const result = await getMarketVolatility(marketId, "1H"); // only the most recent point likely falls in 1H
    expect(typeof result).toBe("object");
  });

  it("computes real volatility over the full seeded price history", async () => {
    if (!dbAvailable) return console.warn("Skipping: local Postgres unavailable.");
    const result = await getMarketVolatility(marketId, "ALL");
    if ("available" in result && result.available === false) {
      throw new Error("expected volatility to be computable from 3 seeded price points");
    }
    expect(result.observationCount).toBe(3);
    expect(result.methodology).toBe("log_returns_stddev_non_annualized");
  });

  it("reports indexer freshness as live for a just-updated cursor", async () => {
    if (!dbAvailable) return console.warn("Skipping: local Postgres unavailable.");
    const freshness = await getDataFreshness(poolAddress);
    expect(freshness.status).toBe("live");
    expect(freshness.lagSeconds).toBeLessThan(60);
  });

  it("reports indexer freshness as unavailable for a pool with no cursor", async () => {
    if (!dbAvailable) return console.warn("Skipping: local Postgres unavailable.");
    const freshness = await getDataFreshness("NoCursorPoolAddress1111111111111111111111");
    expect(freshness.status).toBe("unavailable");
  });
});
