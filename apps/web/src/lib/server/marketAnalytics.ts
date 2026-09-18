import "server-only";
import { prisma } from "@elf/db";
import {
  buildGraduationChecklist,
  computeAbsoluteChange,
  computeRiskIndicators,
  computePercentChange,
  computeVolatility,
  explainMarketQualityScore,
} from "@elf/market-engine";
import type {
  AnalyticsPeriod,
  DataFreshness,
  DataSource,
  IssuerDashboard,
  LiquidityHistoryResult,
  MarketOverview,
  MetricOrInsufficient,
  PriceHistoryResult,
  TradeStats,
  TraderStats,
  VolatilityResult,
  VolumeStats,
} from "@elf/shared";
import { getPoolAnalytics } from "./poolAnalytics";

/**
 * DB-aggregation service layer for ELF V1 Phase 5 — the orchestration
 * counterpart to `@elf/market-engine`'s pure calculation functions,
 * matching the existing split (simulation-engine calls into
 * meteora-adapter for chain math; this calls into market-engine for
 * statistics math). Every query here is time-bounded and capped —
 * never loads a market's entire trade history into memory.
 *
 * `marketId` throughout is `Launch.id` (see docs/architecture.md,
 * "The Launch IS the Market decision").
 */

const ROW_CAP = 5000;

function periodToSince(period: AnalyticsPeriod): Date | null {
  const now = Date.now();
  switch (period) {
    case "1H":
      return new Date(now - 60 * 60 * 1000);
    case "24H":
      return new Date(now - 24 * 60 * 60 * 1000);
    case "7D":
      return new Date(now - 7 * 24 * 60 * 60 * 1000);
    case "30D":
      return new Date(now - 30 * 24 * 60 * 60 * 1000);
    case "ALL":
      return null;
  }
}

export function periodLabel(period: AnalyticsPeriod): string {
  switch (period) {
    case "1H":
      return "Last 1 hour";
    case "24H":
      return "Last 24 hours";
    case "7D":
      return "Last 7 days";
    case "30D":
      return "Last 30 days";
    case "ALL":
      return "All time";
  }
}

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

export async function resolveMarket(marketId: string) {
  return prisma.launch.findUnique({
    where: { id: marketId },
    include: { asset: true, marketProfile: true },
  });
}

/** Reports how stale the indexer's view of this market is (Phase 5.12 / 5.15). */
export async function getDataFreshness(poolAddress: string | null): Promise<DataFreshness> {
  if (!poolAddress) return { status: "unavailable", lastIndexedAt: null, lagSeconds: null };

  const cursor = await prisma.indexerCursor.findUnique({ where: { poolAddress } });
  if (!cursor) return { status: "unavailable", lastIndexedAt: null, lagSeconds: null };

  const lagSeconds = Math.round((Date.now() - cursor.lastIndexedAt.getTime()) / 1000);
  return {
    status: lagSeconds > 300 ? "delayed" : "live",
    lastIndexedAt: cursor.lastIndexedAt.toISOString(),
    lagSeconds,
  };
}

export async function getPriceHistory(marketId: string, period: AnalyticsPeriod): Promise<PriceHistoryResult> {
  const since = periodToSince(period);
  const [rows, firstEver] = await Promise.all([
    prisma.priceHistory.findMany({
      where: { marketId, ...(since ? { timestamp: { gte: since } } : {}) },
      orderBy: { timestamp: "asc" },
      take: ROW_CAP,
    }),
    prisma.priceHistory.findFirst({ where: { marketId }, orderBy: { timestamp: "asc" }, select: { timestamp: true } }),
  ]);

  return {
    period,
    points: rows.map((r) => ({ timestamp: r.timestamp.toISOString(), priceUsd: r.priceUsd, source: "INDEXED" as const })),
    dataAvailableSince: firstEver?.timestamp.toISOString() ?? null,
    source: "INDEXED",
  };
}

export async function getLiquidityHistory(marketId: string, period: AnalyticsPeriod): Promise<LiquidityHistoryResult> {
  const since = periodToSince(period);
  const rows = await prisma.liquidityHistory.findMany({
    where: { marketId, ...(since ? { timestamp: { gte: since } } : {}) },
    orderBy: { timestamp: "asc" },
    take: ROW_CAP,
  });

  if (rows.length === 0) {
    const noData: MetricOrInsufficient = { available: false, reason: "No indexed liquidity history yet for this period." };
    return { period, points: [], current: 0, high: 0, low: 0, absoluteChange: noData, percentChange: noData, source: "INDEXED" };
  }

  const values = rows.map((r) => r.liquidityUsd);
  const current = values.at(-1)!;
  const past = rows.length > 1 ? values[0]! : null; // a single point has no prior observation to compare against

  return {
    period,
    points: rows.map((r) => ({ timestamp: r.timestamp.toISOString(), liquidityUsd: r.liquidityUsd, source: "INDEXED" as const })),
    current,
    high: Math.max(...values),
    low: Math.min(...values),
    absoluteChange: computeAbsoluteChange(current, past),
    percentChange: computePercentChange(current, past),
    source: "INDEXED",
  };
}

interface TradeAggregateRow {
  side: "buy" | "sell";
  count: number;
  volume_usd: number;
  avg_usd: number;
  max_usd: number;
}

/**
 * One grouped, DB-side aggregation query backing both `getVolumeStats`
 * and `getTradeStats` — real trade USD value is `token_amount *
 * price_usd` (both stored per-trade by the indexer), computed in SQL
 * rather than pulled into JS and reduced, per the Phase 5 performance
 * requirement.
 */
async function getTradeAggregatesBySide(marketId: string, since: Date): Promise<TradeAggregateRow[]> {
  return prisma.$queryRaw<TradeAggregateRow[]>`
    SELECT
      side::text as side,
      COUNT(*)::int as count,
      COALESCE(SUM(token_amount * price_usd), 0)::float as volume_usd,
      COALESCE(AVG(token_amount * price_usd), 0)::float as avg_usd,
      COALESCE(MAX(token_amount * price_usd), 0)::float as max_usd
    FROM trades
    WHERE market_id = ${marketId} AND timestamp >= ${since}
    GROUP BY side
  `;
}

export async function getVolumeStats(marketId: string, period: AnalyticsPeriod): Promise<VolumeStats> {
  const since = periodToSince(period) ?? new Date(0);
  const rows = await getTradeAggregatesBySide(marketId, since);
  const buy = rows.find((r) => r.side === "buy");
  const sell = rows.find((r) => r.side === "sell");
  const buyVolumeUsd = round2(buy?.volume_usd ?? 0);
  const sellVolumeUsd = round2(sell?.volume_usd ?? 0);
  const buyCount = buy?.count ?? 0;
  const sellCount = sell?.count ?? 0;

  return {
    period,
    buyVolumeUsd,
    sellVolumeUsd,
    totalVolumeUsd: round2(buyVolumeUsd + sellVolumeUsd),
    buyCount,
    sellCount,
    buySellRatio: sellCount > 0 ? round2(buyCount / sellCount) : null,
    source: "INDEXED",
  };
}

export async function getTradeStats(marketId: string, period: AnalyticsPeriod): Promise<TradeStats> {
  const since = periodToSince(period) ?? new Date(0);
  const rows = await getTradeAggregatesBySide(marketId, since);

  const totalTrades = rows.reduce((sum, r) => sum + r.count, 0);
  const buyTrades = rows.find((r) => r.side === "buy")?.count ?? 0;
  const sellTrades = rows.find((r) => r.side === "sell")?.count ?? 0;
  const totalVolumeUsd = rows.reduce((sum, r) => sum + r.volume_usd, 0);
  const largestTradeUsd = rows.reduce((max, r) => Math.max(max, r.max_usd), 0);
  const averageTradeSizeUsd = totalTrades > 0 ? totalVolumeUsd / totalTrades : 0;

  let hoursElapsed = period === "1H" ? 1 : period === "24H" ? 24 : period === "7D" ? 168 : period === "30D" ? 720 : null;
  if (hoursElapsed === null) {
    const first = await prisma.trade.findFirst({ where: { marketId }, orderBy: { timestamp: "asc" }, select: { timestamp: true } });
    hoursElapsed = first ? Math.max(1, (Date.now() - first.timestamp.getTime()) / 3_600_000) : 1;
  }

  return {
    period,
    totalTrades,
    buyTrades,
    sellTrades,
    averageTradeSizeUsd: round2(averageTradeSizeUsd),
    largestTradeUsd: round2(largestTradeUsd),
    tradesPerHour: round2(totalTrades > 0 ? totalTrades / hoursElapsed : 0),
    source: "INDEXED",
  };
}

export async function getTraderStats(marketId: string, period: AnalyticsPeriod): Promise<TraderStats> {
  const since = periodToSince(period) ?? new Date(0);
  const rows = await prisma.$queryRaw<{ count: number }[]>`
    SELECT COUNT(DISTINCT trader)::int as count FROM trades WHERE market_id = ${marketId} AND timestamp >= ${since}
  `;
  return { period, uniqueTraders: rows[0]?.count ?? 0, source: "INDEXED" };
}

export async function getMarketVolatility(
  marketId: string,
  period: AnalyticsPeriod,
): Promise<VolatilityResult | { available: false; reason: string }> {
  const priceHistory = await getPriceHistory(marketId, period);
  return computeVolatility(priceHistory.points, period, "INDEXED");
}

/**
 * Recent indexed trades for the market detail page's activity feed
 * (Phase 5.14) — time-bounded and capped, never the full trade table.
 */
export async function getRecentTrades(marketId: string, limit = 25) {
  return prisma.trade.findMany({
    where: { marketId },
    orderBy: { timestamp: "desc" },
    take: Math.min(limit, 100),
  });
}

/** Standalone graduation view for `GET /api/markets/:id/graduation` — the authoritative, live on-chain figure. */
export async function getGraduationProgress(marketId: string) {
  const launch = await resolveMarket(marketId);
  if (!launch?.poolAddress) return null;
  const poolAnalytics = await getPoolAnalytics(launch.poolAddress);
  if (!poolAnalytics) return null;

  const graduationEvent = await prisma.graduationEvent.findFirst({ where: { marketId }, orderBy: { timestamp: "desc" } });

  return {
    ...poolAnalytics.graduation,
    source: "ON_CHAIN" as const,
    graduated: graduationEvent !== null,
    graduationEventSignature: graduationEvent?.signature ?? null,
  };
}

/** Standalone score view for `GET /api/markets/:id/quality`. */
export async function getMarketQualityScore(marketId: string) {
  const launch = await resolveMarket(marketId);
  if (!launch?.poolAddress) return null;
  const poolAnalytics = await getPoolAnalytics(launch.poolAddress);
  if (!poolAnalytics) return null;
  return explainMarketQualityScore(poolAnalytics.marketQualityScore, periodLabel("24H"));
}

/**
 * Composes everything above into one response for the market detail
 * page header (Phase 5.3). Returns `null` if the market has no deployed
 * pool yet — never fabricates figures for a market that isn't live.
 *
 * The ELF Market Quality Score breakdown itself is intentionally left
 * as-is from the existing (Phase 1) `getPoolAnalytics` computation — see
 * docs/analytics.md for why this isn't recomputed from indexed inputs in
 * V1 (a disclosed, deliberate scope boundary, not an oversight). The
 * headline 24h/7d volume figures shown here DO prefer indexed data when
 * the indexer has caught up, independently of the score's own inputs.
 */
export async function getMarketOverview(marketId: string): Promise<MarketOverview | null> {
  const launch = await resolveMarket(marketId);
  if (!launch?.poolAddress) return null;

  const [poolAnalytics, freshness, volume24h, volume7d, tradeStats24h, traderStats24h, priceHistory24h, liquidityHistory24h] =
    await Promise.all([
      getPoolAnalytics(launch.poolAddress),
      getDataFreshness(launch.poolAddress),
      getVolumeStats(marketId, "24H"),
      getVolumeStats(marketId, "7D"),
      getTradeStats(marketId, "24H"),
      getTraderStats(marketId, "24H"),
      getPriceHistory(marketId, "24H"),
      getLiquidityHistory(marketId, "24H"),
    ]);

  if (!poolAnalytics) return null;

  const hasIndexedTrades24h = tradeStats24h.totalTrades > 0;
  const volume24hSource: DataSource = hasIndexedTrades24h ? "INDEXED" : "ON_CHAIN";
  const volume24hUsd = hasIndexedTrades24h ? volume24h.totalVolumeUsd : poolAnalytics.volume24hUsd;

  const earliestPrice24h = priceHistory24h.points[0]?.priceUsd ?? null;
  const earliestLiquidity24h = liquidityHistory24h.points[0]?.liquidityUsd ?? null;

  const nowIso = new Date().toISOString();

  return {
    marketId,
    poolAddress: launch.poolAddress,
    status: poolAnalytics.status,
    regime: poolAnalytics.regime,
    priceUsd: { value: poolAnalytics.priceUsd, timestamp: nowIso, source: "ON_CHAIN" },
    liquidityUsd: { value: poolAnalytics.liquidityUsd, timestamp: nowIso, source: "ON_CHAIN" },
    volume24hUsd: { value: volume24hUsd, timestamp: nowIso, source: volume24hSource },
    volume7dUsd: { value: volume7d.totalVolumeUsd, timestamp: nowIso, source: "INDEXED" },
    tradeCount24h: tradeStats24h.totalTrades,
    uniqueTraders24h: traderStats24h.uniqueTraders,
    buyVolumeUsd24h: volume24h.buyVolumeUsd,
    sellVolumeUsd24h: volume24h.sellVolumeUsd,
    buySellRatio24h: volume24h.buySellRatio,
    priceChange24h: computePercentChange(poolAnalytics.priceUsd, earliestPrice24h),
    liquidityChange24h: computePercentChange(poolAnalytics.liquidityUsd, earliestLiquidity24h),
    graduation: poolAnalytics.graduation,
    graduationChecklist: buildGraduationChecklist({
      graduation: poolAnalytics.graduation,
      migrated: poolAnalytics.status === "graduated",
    }),
    marketQualityScore: explainMarketQualityScore(poolAnalytics.marketQualityScore, periodLabel("24H")),
    referencePriceUsd: poolAnalytics.referencePriceUsd,
    referencePriceSource: poolAnalytics.referencePriceSource,
    referencePriceFeedSymbol: poolAnalytics.referencePriceFeedSymbol,
    priceOracle: poolAnalytics.priceOracle,
    freshness,
  };
}

/**
 * Share (0–1) of a period's traded USD volume that came from the single
 * largest wallet, computed DB-side in one grouped query (same convention as
 * getTradeAggregatesBySide: trade USD value = token_amount * price_usd).
 * Returns null when there was no volume — "no concentration" and "cannot
 * measure concentration" are different statements.
 */
export async function getTopTraderVolumeShare(marketId: string, period: AnalyticsPeriod): Promise<number | null> {
  const since = periodToSince(period) ?? new Date(0);
  const rows = await prisma.$queryRaw<{ top_volume: number; total_volume: number }[]>`
    WITH per_trader AS (
      SELECT trader, SUM(token_amount * price_usd)::float AS v
      FROM trades
      WHERE market_id = ${marketId} AND timestamp >= ${since}
      GROUP BY trader
    )
    SELECT COALESCE(MAX(v), 0)::float AS top_volume, COALESCE(SUM(v), 0)::float AS total_volume
    FROM per_trader
  `;
  const row = rows[0];
  if (!row || row.total_volume <= 0) return null;
  return Math.min(1, row.top_volume / row.total_volume);
}

/**
 * Issuer dashboard payload: the existing MarketOverview plus all-time trade
 * counts and the risk indicators derived from it. Reuses getMarketOverview
 * and the existing trade/trader aggregates — the only new query is
 * getTopTraderVolumeShare. Risk math itself lives in
 * `@elf/market-engine` (computeRiskIndicators).
 */
export async function getIssuerDashboard(marketId: string): Promise<IssuerDashboard | null> {
  const launch = await resolveMarket(marketId);
  if (!launch?.poolAddress) return null;

  const [overview, tradeStatsAll, traderStatsAll, tradeStats24h, topShare] = await Promise.all([
    getMarketOverview(marketId),
    getTradeStats(marketId, "ALL"),
    getTraderStats(marketId, "ALL"),
    getTradeStats(marketId, "24H"),
    getTopTraderVolumeShare(marketId, "24H"),
  ]);
  if (!overview) return null;

  const indicators = computeRiskIndicators({
    liquidityUsd: overview.liquidityUsd.value,
    targetLiquidityUsd: launch.marketProfile.targetLiquidityUsd,
    priceUsd: overview.priceUsd.value,
    referencePriceUsd: overview.referencePriceUsd,
    referenceSource: overview.referencePriceSource,
    oracleFeeds: overview.priceOracle.map((f) => ({ priceUsd: f.priceUsd, unavailableReason: f.unavailableReason })),
    tradeCount24h: overview.tradeCount24h,
    indexerStatus: overview.freshness.status,
    topTraderVolumeShare: topShare,
    largestTradeUsd: tradeStats24h.totalTrades > 0 ? tradeStats24h.largestTradeUsd : null,
  });

  return {
    overview,
    totalTrades: tradeStatsAll.totalTrades,
    uniqueTradersAllTime: traderStatsAll.uniqueTraders,
    targetLiquidityUsd: launch.marketProfile.targetLiquidityUsd,
    indicators,
  };
}
