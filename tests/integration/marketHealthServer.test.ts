import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { prisma } from "../../packages/db/src/index.js";
import { computeMarketHealth } from "../../apps/web/src/lib/server/marketAnalytics.js";
import type { MarketOverview } from "../../packages/shared/src/index.js";

/**
 * Real Postgres: exercises the SQL and windowing behind Market Health
 * end-to-end with seeded indexed rows. The only stand-in is the `overview`
 * argument — in production it comes from a live on-chain pool (which needs a
 * funded devnet wallet), so a minimal one is supplied here as an explicit INPUT.
 */
let dbAvailable = false;
const created = { assetId: "", profileId: "", curveIds: [] as string[], quietId: "", activeId: "" };
const hoursAgo = (h: number) => new Date(Date.now() - h * 3_600_000);

const overviewStub = (liquidity: number, freshness: MarketOverview["freshness"]): MarketOverview =>
  ({
    freshness,
    liquidityUsd: { value: liquidity },
    priceUsd: { value: 1 },
    referencePriceUsd: 42.5,
    referencePriceSource: "issuer_declared",
    referencePriceFeedSymbol: null,
    priceOracle: [{ kind: "equity", label: "x", feedSymbol: "Equity.US.X/USD", feedId: "id", priceUsd: null, publishTime: null, unavailableReason: "entitlement_restricted" }],
    graduation: { percentageComplete: 30 },
  }) as unknown as MarketOverview;

async function makeLaunch(suffix: string) {
  const curve = await prisma.curveConfig.create({
    data: { assetId: created.assetId, marketProfileId: created.profileId, riskProfile: "balanced", label: "Balanced", rationale: "t", initialMarketCapUsd: 5e5, migrationMarketCapUsd: 4e6, tokenSupply: 5e4, tokenBaseDecimals: 9, feeSchedule: {}, migration: {}, liquidityDistribution: {}, score: {} },
  });
  created.curveIds.push(curve.id);
  const launch = await prisma.launch.create({
    data: {
      assetId: created.assetId, marketProfileId: created.profileId, curveConfigId: curve.id,
      poolAddress: `HealthIntPool${suffix}${Date.now()}`, configAddress: "HealthIntCfg", status: "live", stage: "LIVE",
    },
  });
  return launch.id;
}

beforeAll(async () => {
  try { await prisma.$queryRaw`SELECT 1`; dbAvailable = true; } catch { dbAvailable = false; return; }
  const asset = await prisma.asset.create({ data: { name: "Health Int", symbol: "HLTH", mintAddress: "So11111111111111111111111111111111111111112", issuer: "T", assetType: "pre_ipo", referencePriceUsd: 10, source: "manual" } });
  const profile = await prisma.marketProfile.create({ data: { assetId: asset.id, initialLiquidityUsd: 250_000, expectedVolatility: "medium", riskProfile: "balanced", targetLiquidityUsd: 500_000, targetGraduationUsd: 1_000_000, quoteToken: "USDC" } });
  Object.assign(created, { assetId: asset.id, profileId: profile.id });

  created.quietId = await makeLaunch("Q");
  created.activeId = await makeLaunch("A");
  const m = created.activeId;

  // Baseline: 40 trades of $100 across the prior ~21h.
  await prisma.trade.createMany({
    data: Array.from({ length: 40 }, (_, i) => ({ marketId: m, signature: `health-int-base-${m}-${i}`, trader: `t${i % 7}`, side: "buy" as const, tokenAmount: 10, quoteAmount: 100, priceUsd: 10, timestamp: hoursAgo(22 - i * 0.5) })),
  });
  // Recent hour: 8 trades of $500, one large $9,000 sell.
  await prisma.trade.createMany({
    data: [
      ...Array.from({ length: 7 }, (_, i) => ({ marketId: m, signature: `health-int-recent-${m}-${i}`, trader: "whale", side: "buy" as const, tokenAmount: 50, quoteAmount: 500, priceUsd: 10, timestamp: hoursAgo(0.8 - i * 0.05) })),
      { marketId: m, signature: `health-int-large-${m}`, trader: "whale", side: "sell" as const, tokenAmount: 900, quoteAmount: 9000, priceUsd: 10, timestamp: hoursAgo(0.1) },
    ],
  });
  await prisma.liquidityHistory.createMany({
    data: [
      { marketId: m, liquidityUsd: 100_000, timestamp: hoursAgo(3) }, // opening reading, before the window
      { marketId: m, liquidityUsd: 95_000, timestamp: hoursAgo(0.7) },
      { marketId: m, liquidityUsd: 60_000, timestamp: hoursAgo(0.1) },
    ],
  });
}, 60_000);

afterAll(async () => {
  if (!dbAvailable) return;
  const ids = [created.quietId, created.activeId];
  await prisma.trade.deleteMany({ where: { marketId: { in: ids } } });
  await prisma.liquidityHistory.deleteMany({ where: { marketId: { in: ids } } });
  await prisma.launch.deleteMany({ where: { id: { in: ids } } });
  await prisma.curveConfig.deleteMany({ where: { id: { in: created.curveIds } } });
  await prisma.marketProfile.deleteMany({ where: { id: created.profileId } });
  await prisma.asset.deleteMany({ where: { id: created.assetId } });
});

describe("computeMarketHealth against real indexed rows", () => {
  it("detects liquidity drop, volume/frequency spike, large trade and concentration from real SQL", async () => {
    if (!dbAvailable) return;
    const h = await computeMarketHealth(created.activeId, overviewStub(60_000, { status: "live", lastIndexedAt: new Date().toISOString(), lagSeconds: 5 }), 48, 0.6);
    const types = h.events.map((e) => e.type);
    expect(h.status).toBe("WATCH");
    expect(types).toEqual(expect.arrayContaining(["LIQUIDITY_DROP", "VOLUME_SPIKE", "TRADE_FREQUENCY_SPIKE", "LARGE_TRADE", "TRADE_CONCENTRATION", "ORACLE_RESTRICTED"]));

    const drop = h.events.find((e) => e.type === "LIQUIDITY_DROP")!;
    expect(drop.observed).toBeCloseTo(40, 3); // 100k -> 60k across the opening reading + window
    const large = h.events.find((e) => e.type === "LARGE_TRADE")!;
    expect(large.signature).toBe(`health-int-large-${created.activeId}`);
    expect(large.observed).toBeCloseTo(15, 3); // $9,000 of $60,000
    expect(h.timeline.every((e) => e.occurredAt !== null)).toBe(true);
    expect(h.timeline.map((e) => e.occurredAt)).toEqual([...h.timeline.map((e) => e.occurredAt)].sort());
  });

  it("a market with no indexed rows is DATA_UNAVAILABLE with no events (no fabricated history)", async () => {
    if (!dbAvailable) return;
    const h = await computeMarketHealth(created.quietId, overviewStub(0, { status: "live", lastIndexedAt: new Date().toISOString(), lagSeconds: 5 }), 0, null);
    expect(h.status).toBe("DATA_UNAVAILABLE");
    expect(h.events.map((e) => e.type)).toEqual(["ORACLE_RESTRICTED"]);
    expect(h.events[0]!.severity).toBe("INFO");
    expect(h.timeline).toEqual([]);
  });

  it("reports a lagging indexer from the freshness the dashboard already computes", async () => {
    if (!dbAvailable) return;
    const h = await computeMarketHealth(created.quietId, overviewStub(0, { status: "delayed", lastIndexedAt: new Date().toISOString(), lagSeconds: 900 }), 0, null);
    expect(h.events.some((e) => e.type === "INDEXER_LAG" && e.observed === 900)).toBe(true);
    expect(h.status).toBe("WATCH");
  });
});
