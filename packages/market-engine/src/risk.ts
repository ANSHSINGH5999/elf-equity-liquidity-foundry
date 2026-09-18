import type { PythUnavailableReason, RiskIndicator, RiskStatus } from "@elf/shared";

/**
 * ELF-defined WATCH cutoffs for the issuer risk indicators.
 *
 * These are analytical parameters chosen by ELF, NOT Meteora protocol values
 * and NOT industry standards — they exist only because a status needs a
 * line to be drawn somewhere. They are kept in one exported object so the
 * dashboard, the docs and the tests all reference the same numbers, and
 * every indicator also exposes its raw measured value so an issuer can
 * apply their own judgement.
 *
 * Deliberately absent: any composite LOW/MEDIUM/HIGH "risk score". No
 * defensible aggregation formula exists, so none is invented.
 */
export const RISK_THRESHOLDS = {
  /** WATCH when live liquidity is below this fraction of the issuer's own declared `targetLiquidityUsd`. */
  liquidityBelowTargetFraction: 0.5,
  /** WATCH when |DBC price − reference price| / reference price exceeds this percentage. */
  priceDeviationPct: 10,
  /** WATCH when a single wallet accounts for more than this fraction of the period's volume (a simple majority). */
  topTraderVolumeShare: 0.5,
  /** WATCH when the largest single trade exceeds this fraction of current pool liquidity. */
  largeTradeLiquidityShare: 0.1,
} as const;

export interface RiskOracleFeedInput {
  priceUsd: number | null;
  unavailableReason: PythUnavailableReason | null;
}

export interface RiskInputs {
  liquidityUsd: number;
  /** The issuer's declared liquidity target (MarketProfile.targetLiquidityUsd); null/≤0 means it is unknown. */
  targetLiquidityUsd: number | null;
  priceUsd: number;
  /** Reference price used for the deviation figure; null/≤0 means none is available. */
  referencePriceUsd: number | null;
  referenceSource: "pyth" | "issuer_declared";
  oracleFeeds: RiskOracleFeedInput[];
  tradeCount24h: number;
  indexerStatus: "live" | "delayed" | "unavailable";
  /** Share (0–1) of the period's volume traded by the single largest wallet; null when there was no volume. */
  topTraderVolumeShare: number | null;
  /** Largest single trade in the period, in USD; null when there were no trades. */
  largestTradeUsd: number | null;
}

const round2 = (n: number) => Math.round(n * 100) / 100;

function indicator(
  id: RiskIndicator["id"],
  label: string,
  status: RiskStatus,
  value: number | null,
  unit: RiskIndicator["unit"],
  formula: string,
  note: string | null = null,
): RiskIndicator {
  return { id, label, status, value, unit, formula, note };
}

const ORACLE_REASON_NOTE: Record<PythUnavailableReason, string> = {
  not_configured: "Pyth is not configured on this deployment (no PYTH_API_KEY).",
  unauthenticated: "Pyth rejected the configured API key.",
  entitlement_restricted: "Restricted — Pyth entitlement required",
  rate_limited: "Pyth is rate-limiting this key right now.",
  unavailable: "Pyth returned no price for these feeds.",
};

export type OracleState = "live" | "no_feed" | PythUnavailableReason;

export interface OracleSummary {
  state: OracleState;
  liveCount: number;
  total: number;
  /** Full explanation, used by the risk indicator. */
  note: string;
  /** Short label for compact UI (market header). Never claims Pyth verification unless a feed is actually live. */
  headline: string;
}

const ORACLE_HEADLINE: Record<PythUnavailableReason, string> = {
  not_configured: "Not configured",
  unauthenticated: "Auth failed",
  entitlement_restricted: "Restricted — Pyth entitlement required",
  rate_limited: "Rate limited",
  unavailable: "Unavailable",
};

/**
 * Single source of truth for "what is the oracle doing right now", shared by
 * the risk indicators and the market header so the two can never disagree.
 * Entitlement restriction wins over other failure reasons because it is the
 * most actionable one.
 */
export function summarizeOracleFeeds(feeds: RiskOracleFeedInput[]): OracleSummary {
  const liveCount = feeds.filter((f) => f.priceUsd !== null).length;
  if (liveCount > 0) {
    return {
      state: "live",
      liveCount,
      total: feeds.length,
      note: `${liveCount} of ${feeds.length} Pyth feeds live.`,
      headline: `Live (${liveCount}/${feeds.length} Pyth feeds)`,
    };
  }
  if (feeds.length === 0) {
    return {
      state: "no_feed",
      liveCount: 0,
      total: 0,
      note: "No public Pyth feed exists for this ticker (expected for a private pre-IPO issuer).",
      headline: "No public feed",
    };
  }
  const reason: PythUnavailableReason = feeds.some((f) => f.unavailableReason === "entitlement_restricted")
    ? "entitlement_restricted"
    : (feeds[0]?.unavailableReason ?? "unavailable");
  return { state: reason, liveCount: 0, total: feeds.length, note: ORACLE_REASON_NOTE[reason], headline: ORACLE_HEADLINE[reason] };
}

/**
 * Turns already-computed platform data into the issuer risk indicators.
 * Pure: no I/O, no clock, no randomness. Every indicator reports
 * DATA_UNAVAILABLE rather than a guess when its inputs are missing.
 */
export function computeRiskIndicators(input: RiskInputs): RiskIndicator[] {
  // 1. Liquidity vs the issuer's own target.
  const liquidity =
    input.targetLiquidityUsd === null || input.targetLiquidityUsd <= 0
      ? indicator(
          "liquidity",
          "Liquidity",
          "DATA_UNAVAILABLE",
          null,
          "pct",
          "liquidityUsd ÷ targetLiquidityUsd × 100 (issuer-declared target)",
          "No liquidity target is recorded for this market.",
        )
      : (() => {
          // Decide on the exact value; round only what is displayed.
          const exactPct = (input.liquidityUsd / input.targetLiquidityUsd) * 100;
          return indicator(
            "liquidity",
            "Liquidity",
            exactPct < RISK_THRESHOLDS.liquidityBelowTargetFraction * 100 ? "WATCH" : "NORMAL",
            round2(exactPct),
            "pct",
            `liquidityUsd ÷ targetLiquidityUsd × 100; WATCH below ${RISK_THRESHOLDS.liquidityBelowTargetFraction * 100}% of the issuer's own target`,
          );
        })();

  // 2. Price deviation from the reference price.
  const deviation =
    input.referencePriceUsd === null || input.referencePriceUsd <= 0
      ? indicator(
          "price_deviation",
          "Price deviation",
          "DATA_UNAVAILABLE",
          null,
          "pct",
          "|priceUsd − referencePriceUsd| ÷ referencePriceUsd × 100",
          "No reference price is available.",
        )
      : (() => {
          const exactPct = (Math.abs(input.priceUsd - input.referencePriceUsd) / input.referencePriceUsd) * 100;
          return indicator(
            "price_deviation",
            "Price deviation",
            exactPct > RISK_THRESHOLDS.priceDeviationPct ? "WATCH" : "NORMAL",
            round2(exactPct),
            "pct",
            `|priceUsd − referencePriceUsd| ÷ referencePriceUsd × 100; WATCH above ${RISK_THRESHOLDS.priceDeviationPct}%`,
            input.referenceSource === "pyth"
              ? "Reference: live Pyth price."
              : "Reference: issuer-declared price (a static number entered at asset creation, not a live market feed).",
          );
        })();

  // 3. Oracle health — honest about exactly why a feed is missing.
  const oracleSummary = summarizeOracleFeeds(input.oracleFeeds);
  const ORACLE_FORMULA = "Count of Pyth feeds returning a live price; NORMAL when at least one does";
  const oracle =
    oracleSummary.state === "live"
      ? indicator("oracle", "Oracle status", "NORMAL", oracleSummary.liveCount, "count", ORACLE_FORMULA, oracleSummary.note)
      : indicator(
          "oracle",
          "Oracle status",
          "DATA_UNAVAILABLE",
          oracleSummary.state === "no_feed" ? null : 0,
          "count",
          ORACLE_FORMULA,
          oracleSummary.note,
        );

  // 4. Trading activity — only meaningful if the indexer can actually see the pool.
  const activity =
    input.indexerStatus === "unavailable"
      ? indicator(
          "trading_activity",
          "Trading activity",
          "DATA_UNAVAILABLE",
          null,
          "count",
          "Indexed trades in the last 24h; WATCH when there are none",
          "The indexer has no cursor for this pool yet, so activity cannot be measured.",
        )
      : indicator(
          "trading_activity",
          "Trading activity",
          input.tradeCount24h > 0 ? "NORMAL" : "WATCH",
          input.tradeCount24h,
          "count",
          "Indexed trades in the last 24h; WATCH when there are none",
        );

  // 5. Volume concentration — genuinely calculable from indexed trades.
  const concentration =
    input.topTraderVolumeShare === null
      ? indicator(
          "volume_concentration",
          "Volume concentration",
          "DATA_UNAVAILABLE",
          null,
          "pct",
          "Largest single wallet's volume ÷ total 24h volume × 100",
          "No trading volume in the last 24h.",
        )
      : indicator(
          "volume_concentration",
          "Volume concentration",
          input.topTraderVolumeShare > RISK_THRESHOLDS.topTraderVolumeShare ? "WATCH" : "NORMAL",
          round2(input.topTraderVolumeShare * 100),
          "pct",
          `Largest single wallet's volume ÷ total 24h volume × 100; WATCH above ${RISK_THRESHOLDS.topTraderVolumeShare * 100}%`,
        );

  // 6. Large trades relative to pool depth.
  const largeTrades =
    input.largestTradeUsd === null || input.liquidityUsd <= 0
      ? indicator(
          "large_trades",
          "Large-trade exposure",
          "DATA_UNAVAILABLE",
          null,
          "pct",
          "Largest 24h trade ÷ current liquidity × 100",
          input.largestTradeUsd === null ? "No trades in the last 24h." : "Current liquidity is unavailable.",
        )
      : (() => {
          const exactPct = (input.largestTradeUsd / input.liquidityUsd) * 100;
          return indicator(
            "large_trades",
            "Large-trade exposure",
            exactPct > RISK_THRESHOLDS.largeTradeLiquidityShare * 100 ? "WATCH" : "NORMAL",
            round2(exactPct),
            "pct",
            `Largest 24h trade ÷ current liquidity × 100; WATCH above ${RISK_THRESHOLDS.largeTradeLiquidityShare * 100}%`,
          );
        })();

  // 7. Indexer health — reuses the existing freshness classification unchanged.
  const indexer = indicator(
    "indexer_health",
    "Indexer health",
    input.indexerStatus === "live" ? "NORMAL" : input.indexerStatus === "delayed" ? "WATCH" : "DATA_UNAVAILABLE",
    null,
    null,
    "Indexer freshness: live (lag ≤ 300s) → NORMAL, delayed → WATCH, no cursor → DATA_UNAVAILABLE",
  );

  return [liquidity, deviation, oracle, activity, concentration, largeTrades, indexer];
}
