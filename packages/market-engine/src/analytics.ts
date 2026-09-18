import type {
  AnalyticsPeriod,
  DataSource,
  MarketQualityScoreBreakdown,
  MarketQualityScoreResult,
  MetricOrInsufficient,
  VolatilityResult,
} from "@elf/shared";
import { MARKET_QUALITY_SCORE_VERSION } from "@elf/shared";

/**
 * Pure, deterministic analytics calculations (ELF V1 Phase 5). No
 * database or network access — every function here takes already-fetched
 * plain data and returns a result, so it stays unit-testable the same
 * way the rest of this package is. The DB-querying orchestration lives
 * in `apps/web/src/lib/server/marketAnalytics.ts`, matching how
 * `simulation-engine` calls into `meteora-adapter` rather than doing
 * chain reads itself.
 */

const MIN_VOLATILITY_OBSERVATIONS = 3; // need >= 2 log returns for a stddev to mean anything

export interface PricePointInput {
  timestamp: Date | string;
  priceUsd: number;
}

/**
 * Log-return standard deviation, NOT annualized. Indexed trade
 * timestamps are irregularly spaced (they happen when trades happen),
 * so annualizing would imply a sampling regularity this data doesn't
 * have — see docs/analytics.md. Returns `available: false` below the
 * minimum observation count rather than a misleadingly precise number
 * from too little data.
 */
export function computeVolatility(
  points: PricePointInput[],
  period: AnalyticsPeriod,
  source: DataSource = "INDEXED",
): VolatilityResult | { available: false; reason: string } {
  const sorted = [...points]
    .map((p) => ({ timestamp: new Date(p.timestamp), priceUsd: p.priceUsd }))
    .filter((p) => p.priceUsd > 0)
    .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

  if (sorted.length < MIN_VOLATILITY_OBSERVATIONS) {
    return {
      available: false,
      reason: `Need at least ${MIN_VOLATILITY_OBSERVATIONS} price observations, have ${sorted.length}.`,
    };
  }

  const logReturns: number[] = [];
  for (let i = 1; i < sorted.length; i++) {
    const prev = sorted[i - 1]!.priceUsd;
    const curr = sorted[i]!.priceUsd;
    logReturns.push(Math.log(curr / prev));
  }

  const mean = logReturns.reduce((sum, r) => sum + r, 0) / logReturns.length;
  const variance = logReturns.reduce((sum, r) => sum + (r - mean) ** 2, 0) / (logReturns.length - 1); // sample stddev
  const standardDeviationOfLogReturns = Math.sqrt(variance);

  return {
    period,
    standardDeviationOfLogReturns: Math.round(standardDeviationOfLogReturns * 1_000_000) / 1_000_000,
    observationCount: sorted.length,
    methodology: "log_returns_stddev_non_annualized",
    source,
  };
}

/**
 * Never invents a baseline (Phase 5.8): a null/zero/missing `past` value
 * means "we don't have a real prior observation," which returns
 * insufficient-data rather than a 0%, ±Infinity%, or otherwise fabricated
 * change.
 */
export function computePercentChange(
  current: number,
  past: number | null | undefined,
  source: DataSource = "INDEXED",
): MetricOrInsufficient {
  if (past === null || past === undefined || past === 0) {
    return { available: false, reason: "No prior observation available for this period." };
  }
  const percent = ((current - past) / past) * 100;
  return { value: Math.round(percent * 100) / 100, timestamp: new Date().toISOString(), source };
}

export function computeAbsoluteChange(
  current: number,
  past: number | null | undefined,
  source: DataSource = "INDEXED",
): MetricOrInsufficient {
  if (past === null || past === undefined) {
    return { available: false, reason: "No prior observation available for this period." };
  }
  return { value: Math.round((current - past) * 100) / 100, timestamp: new Date().toISOString(), source };
}

export interface TradeSideInput {
  side: "buy" | "sell";
  quoteAmountUsd: number;
}

export function computeBuySellStats(trades: TradeSideInput[]): {
  buyVolumeUsd: number;
  sellVolumeUsd: number;
  totalVolumeUsd: number;
  buyCount: number;
  sellCount: number;
  buySellRatio: number | null;
} {
  let buyVolumeUsd = 0;
  let sellVolumeUsd = 0;
  let buyCount = 0;
  let sellCount = 0;

  for (const trade of trades) {
    if (trade.side === "buy") {
      buyVolumeUsd += trade.quoteAmountUsd;
      buyCount += 1;
    } else {
      sellVolumeUsd += trade.quoteAmountUsd;
      sellCount += 1;
    }
  }

  return {
    buyVolumeUsd: Math.round(buyVolumeUsd * 100) / 100,
    sellVolumeUsd: Math.round(sellVolumeUsd * 100) / 100,
    totalVolumeUsd: Math.round((buyVolumeUsd + sellVolumeUsd) * 100) / 100,
    buyCount,
    sellCount,
    // A ratio against zero sells is undefined, not infinite — surfaced as null, not a fabricated number.
    buySellRatio: sellCount > 0 ? Math.round((buyCount / sellCount) * 100) / 100 : null,
  };
}

const COMPONENT_MAX: Record<keyof Omit<MarketQualityScoreBreakdown, "total">, number> = {
  liquidityDepth: 25,
  priceStability: 20,
  volumeQuality: 15,
  slippage: 20,
  holderDistribution: 10,
  referencePriceAlignment: 10,
};

const STRENGTH_SENTENCE: Record<keyof typeof COMPONENT_MAX, string> = {
  liquidityDepth: "Strong liquidity relative to the declared target.",
  priceStability: "Price has been stable relative to its recent history.",
  volumeQuality: "Trading volume is healthy relative to available liquidity.",
  slippage: "A representative $10k trade would execute with low slippage.",
  holderDistribution: "Holdings are reasonably distributed across sampled accounts.",
  referencePriceAlignment: "Current price is closely aligned with the asset's reference price.",
};

const RISK_SENTENCE: Record<keyof typeof COMPONENT_MAX, string> = {
  liquidityDepth: "Liquidity is thin relative to the declared target.",
  priceStability: "Price has been volatile relative to its recent history.",
  volumeQuality: "Trading volume is low relative to available liquidity.",
  slippage: "A representative $10k trade would face high slippage.",
  holderDistribution: "Holdings are concentrated among a small number of sampled accounts.",
  referencePriceAlignment: "Current price has drifted from the asset's reference price.",
};

const RISK_THRESHOLD_FRACTION = 0.5;

/**
 * Deterministic, rule-based explanation layer over the existing (Phase 1)
 * `scoreMarketQuality` output — deliberately not a replacement for it.
 * The six-component point allocation is unchanged; this only adds a
 * version tag and a primary/risk narrative derived from which component
 * scored best/worst as a fraction of its own maximum, so the same
 * breakdown always produces the same sentences (no LLM, no randomness).
 */
export function explainMarketQualityScore(
  breakdown: MarketQualityScoreBreakdown,
  dataPeriodLabel: string,
): MarketQualityScoreResult {
  const components = Object.keys(COMPONENT_MAX) as Array<keyof typeof COMPONENT_MAX>;

  let best = components[0]!;
  let worst = components[0]!;
  for (const key of components) {
    const fraction = breakdown[key] / COMPONENT_MAX[key];
    if (fraction > breakdown[best] / COMPONENT_MAX[best]) best = key;
    if (fraction < breakdown[worst] / COMPONENT_MAX[worst]) worst = key;
  }

  const worstFraction = breakdown[worst] / COMPONENT_MAX[worst];

  return {
    breakdown,
    version: MARKET_QUALITY_SCORE_VERSION,
    primarySignal: STRENGTH_SENTENCE[best],
    riskSignal: worstFraction < RISK_THRESHOLD_FRACTION ? RISK_SENTENCE[worst] : null,
    dataPeriodLabel,
    label: "ELF-defined analytical metric",
  };
}
