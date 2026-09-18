import "server-only";
import { prisma, Prisma } from "@elf/db";
import { getLivePoolState, getOnchainSwapQuote, getQuoteUsdPrice, reserveToNumber } from "@elf/meteora-adapter";
import { parsePublicKeyOrThrow } from "@elf/solana";
import BN from "bn.js";
import { scoreMarketQuality, computeGraduationStatus, classifyRegime } from "@elf/market-engine";
import type { GraduationStatus, MarketQualityScoreBreakdown, MarketRegime, PoolStatus, PriceOracleFeed, QuoteToken } from "@elf/shared";
import { getServerConnection } from "./rpc";
import { getPythPriceComparison, getPythReferencePrice } from "./pyth";

export interface PoolAnalytics {
  poolAddress: string;
  priceUsd: number;
  volume24hUsd: number;
  liquidityUsd: number;
  quoteReserveUsd: number;
  baseReserveTokens: number;
  curveProgress: number;
  migrationThresholdUsd: number;
  graduation: GraduationStatus;
  estimatedSlippageBpsAt10k: number;
  marketQualityScore: MarketQualityScoreBreakdown;
  regime: MarketRegime;
  status: PoolStatus;
  holderCountSampled: number;
  top10HolderConcentrationPct: number;
  referencePriceUsd: number;
  /** "pyth" only when a live Hermes feed matched the asset's ticker; otherwise the issuer-declared value at asset creation. */
  referencePriceSource: "pyth" | "issuer_declared";
  referencePriceFeedSymbol: string | null;
  priceOracle: PriceOracleFeed[];
  updatedAt: string;
}

/**
 * Reads real on-chain pool state and derives every analytics figure from
 * it, snapshotting to Postgres so 24h volume and price stability have a
 * time series to draw from. Returns `null` if the pool truly doesn't
 * exist on-chain — callers must render "Pool not found," never a guess.
 */
export async function getPoolAnalytics(poolAddress: string): Promise<PoolAnalytics | null> {
  const connection = getServerConnection();
  const poolPk = parsePublicKeyOrThrow(poolAddress, "poolAddress");

  const state = await getLivePoolState(connection, poolPk);
  if (!state) return null;

  const launch = await prisma.launch.findFirst({
    where: { poolAddress },
    include: { asset: true, marketProfile: true },
  });

  const quoteToken: QuoteToken = launch?.marketProfile.quoteToken ?? (state.tokenQuoteDecimal === 9 ? "SOL" : "USDC");
  const quoteUsdPrice = await getQuoteUsdPrice(quoteToken);
  const quoteDecimals = state.tokenQuoteDecimal;
  const baseDecimals = state.tokenBaseDecimal;

  const quoteReserveUsd = reserveToNumber(state.quoteReserveRaw, quoteDecimals) * quoteUsdPrice;
  const migrationThresholdUsd = reserveToNumber(state.migrationQuoteThresholdRaw, quoteDecimals) * quoteUsdPrice;
  const priceUsd = state.priceInQuote * quoteUsdPrice;
  const baseReserveTokens = reserveToNumber(state.baseReserveRaw, baseDecimals);
  const declaredReferencePriceUsd = launch?.asset.referencePriceUsd ?? priceUsd;

  // Prefer a live Pyth market price when the asset's ticker matches a known
  // public equity feed — this measures alignment against real-time market
  // truth instead of a static number declared once at asset creation.
  // Falls back silently to the declared price for anything without a
  // public feed (the common case: most pre-IPO issuers are private).
  const pythPrice = launch?.asset.symbol ? await getPythReferencePrice(launch.asset.symbol) : null;
  const referencePriceUsd = pythPrice?.priceUsd ?? declaredReferencePriceUsd;
  const referencePriceSource: "pyth" | "issuer_declared" = pythPrice ? "pyth" : "issuer_declared";
  const referencePriceFeedSymbol = pythPrice?.feedSymbol ?? null;

  // Every public Pyth feed for this ticker (equity, xStock, Ondo), for the
  // Price Oracle comparison panel — independent of referencePriceUsd above
  // (which only ever uses the single regulated-equity feed for scoring).
  const priceOracle: PriceOracleFeed[] = launch?.asset.symbol ? await getPythPriceComparison(launch.asset.symbol) : [];

  const graduation = computeGraduationStatus(quoteReserveUsd, migrationThresholdUsd);

  // Slippage sample: quote a real $10k buy against current on-chain reserves.
  let estimatedSlippageBpsAt10k = 0;
  try {
    const tenKInQuoteLamports = new BN(Math.round((10_000 / quoteUsdPrice) * 10 ** quoteDecimals));
    const quote = await getOnchainSwapQuote(connection, poolPk, tenKInQuoteLamports, false);
    if (quote) {
      const outBase = Number(quote.outputAmount.toString()) / 10 ** baseDecimals;
      const execPrice = 10_000 / Math.max(outBase, 1e-9);
      estimatedSlippageBpsAt10k = priceUsd > 0 ? Math.abs((execPrice - priceUsd) / priceUsd) * 10_000 : 0;
    }
  } catch {
    // Pool may have insufficient depth for a $10k quote — treat as high slippage rather than fail the whole page.
    estimatedSlippageBpsAt10k = 10_000;
  }

  // Sampled holder concentration from the 20 largest token accounts (real RPC data, not a full census).
  let holderCountSampled = 0;
  let top10HolderConcentrationPct = 0;
  try {
    const largest = await connection.getTokenLargestAccounts(parsePublicKeyOrThrow(state.baseMint, "baseMint"));
    holderCountSampled = largest.value.length;
    const totalSupply = baseReserveTokens > 0 ? baseReserveTokens : 1;
    const top10Amount = largest.value
      .slice(0, 10)
      .reduce((sum, acc) => sum + Number(acc.amount) / 10 ** baseDecimals, 0);
    top10HolderConcentrationPct = Math.min(100, (top10Amount / totalSupply) * 100);
  } catch {
    // Non-fatal — scored as fully concentrated/unknown rather than crashing the page.
    top10HolderConcentrationPct = 100;
  }

  const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const priorSnapshots = await prisma.marketSnapshot.findMany({
    where: { poolAddress, timestamp: { gte: since } },
    orderBy: { timestamp: "asc" },
  });

  let volume24hUsd = 0;
  let prevReserve = priorSnapshots[0]?.quoteReserve ?? quoteReserveUsd;
  for (const snap of priorSnapshots) {
    volume24hUsd += Math.abs(snap.quoteReserve - prevReserve);
    prevReserve = snap.quoteReserve;
  }
  volume24hUsd += Math.abs(quoteReserveUsd - prevReserve);

  const prices = [...priorSnapshots.map((s) => s.priceUsd), priceUsd];
  const meanPrice = prices.reduce((a, b) => a + b, 0) / prices.length;
  const variance = prices.reduce((sum, p) => sum + (p - meanPrice) ** 2, 0) / prices.length;
  const priceVolatility = meanPrice > 0 ? Math.sqrt(variance) / meanPrice : 0;

  const liquidityUsd = quoteReserveUsd;
  const targetLiquidityUsd = launch?.marketProfile.targetLiquidityUsd ?? migrationThresholdUsd;

  const marketQualityScore = scoreMarketQuality({
    liquidityUsd,
    targetLiquidityUsd,
    priceVolatility,
    volume24hUsd,
    targetLiquidityForVolumeUsd: targetLiquidityUsd,
    estimatedSlippageBpsAt10k,
    holderCount: holderCountSampled,
    top10HolderConcentrationPct,
    currentPriceUsd: priceUsd,
    referencePriceUsd,
  });

  const regime = classifyRegime({
    graduationPercentageComplete: graduation.percentageComplete,
    marketQualityTotal: marketQualityScore.total,
    priceVolatility,
    volume24hUsd,
  });

  const status: PoolStatus = state.isMigrated
    ? "graduated"
    : graduation.percentageComplete >= 85
      ? "near_graduation"
      : "live";

  await prisma.pool
    .upsert({
      where: { poolAddress },
      update: {},
      create: {
        launchId: launch?.id ?? "",
        poolAddress,
        configAddress: state.configAddress,
        baseMint: state.baseMint,
        quoteMint: state.quoteMint,
      },
    })
    .catch(() => undefined); // best-effort — analytics still return even if the anchor row can't be created (e.g. no matching launch yet)

  await prisma.marketSnapshot
    .create({
      data: {
        poolAddress,
        priceUsd,
        volume24hUsd,
        liquidityUsd,
        quoteReserve: quoteReserveUsd,
        baseReserve: baseReserveTokens,
        curveProgress: state.quoteTokenCurveProgress,
        migrationThresholdUsd,
        graduationProgress: graduation.percentageComplete,
        estimatedSlippageBps: estimatedSlippageBpsAt10k,
        marketQualityScore: marketQualityScore as unknown as Prisma.InputJsonValue,
        regime,
        status,
      },
    })
    .catch(() => undefined);

  if (launch && launch.status !== "graduated") {
    await prisma.launch.update({ where: { id: launch.id }, data: { status } }).catch(() => undefined);
  }

  return {
    poolAddress,
    priceUsd,
    volume24hUsd,
    liquidityUsd,
    quoteReserveUsd,
    baseReserveTokens,
    curveProgress: state.quoteTokenCurveProgress,
    migrationThresholdUsd,
    graduation,
    estimatedSlippageBpsAt10k,
    marketQualityScore,
    regime,
    status,
    holderCountSampled,
    top10HolderConcentrationPct,
    referencePriceUsd,
    referencePriceSource,
    referencePriceFeedSymbol,
    priceOracle,
    updatedAt: new Date().toISOString(),
  };
}
