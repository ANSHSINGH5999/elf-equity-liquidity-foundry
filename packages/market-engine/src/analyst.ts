import type {
  AnalysisDataSource,
  AnalysisObservation,
  AnalysisSection,
  IssuerDashboard,
  MarketAnalysis,
  MetricOrInsufficient,
  RiskIndicator,
} from "@elf/shared";
import { summarizeOracleFeeds } from "./risk";

/**
 * Market analyst: a descriptive reading of real ELF data. Pure and
 * deterministic — no I/O, no clock, no randomness, and no LLM. The provider
 * interface below exists so a language-model provider can be plugged in
 * later; whatever a provider returns is checked by `findAdviceViolations`
 * before it is ever shown.
 */
export interface MarketAnalystProvider {
  id: string;
  kind: "rule_based" | "llm";
  analyze(dashboard: IssuerDashboard): Promise<MarketAnalysis>;
}

export const ANALYST_DISCLAIMER =
  "Descriptive analysis of platform data only. It is not investment advice; ELF does not predict prices or recommend trades.";

// --- formatting (deterministic, locale-independent) -------------------------

function usd(n: number): string {
  const abs = Math.abs(n);
  if (abs >= 1e9) return `$${(n / 1e9).toFixed(2)}B`;
  if (abs >= 1e6) return `$${(n / 1e6).toFixed(2)}M`;
  if (abs >= 1e3) return `$${(n / 1e3).toFixed(1)}K`;
  return `$${n.toFixed(2)}`;
}
const pct = (n: number) => `${n.toFixed(1)}%`;
const signedPct = (n: number) => `${n >= 0 ? "+" : "−"}${Math.abs(n).toFixed(1)}%`;
const plural = (n: number, one: string, many: string) => `${n.toLocaleString("en-US")} ${n === 1 ? one : many}`;

function metricValue(m: MetricOrInsufficient): number | null {
  return "value" in m && typeof m.value === "number" ? m.value : null;
}

const indicatorOf = (list: RiskIndicator[], id: RiskIndicator["id"]) => list.find((i) => i.id === id);

// --- the rule-based analysis ------------------------------------------------

export function analyzeMarketRuleBased(dashboard: IssuerDashboard): MarketAnalysis {
  const { overview: o, indicators } = dashboard;

  const priceChange = metricValue(o.priceChange24h);
  const liquidityChange = metricValue(o.liquidityChange24h);
  const indexerUp = o.freshness.status !== "unavailable";
  const oracle = summarizeOracleFeeds(o.priceOracle.map((f) => ({ priceUsd: f.priceUsd, unavailableReason: f.unavailableReason })));
  const deviation = indicatorOf(indicators, "price_deviation");
  const concentration = indicatorOf(indicators, "volume_concentration");
  const largeTrades = indicatorOf(indicators, "large_trades");
  const liquidityIndicator = indicatorOf(indicators, "liquidity");
  const migrated = o.status === "graduated";
  const targetKnown = dashboard.targetLiquidityUsd > 0;
  const liquidityPctOfTarget = targetKnown ? (o.liquidityUsd.value / dashboard.targetLiquidityUsd) * 100 : null;
  const thresholdKnown = o.graduation.migrationThresholdUsd > 0;

  // ---- sections ----
  const overview: string[] = [
    `The pool is ${o.status.replace(/_/g, " ")} and ELF classifies its regime as "${o.regime}".`,
    `The current DBC price is ${usd(o.priceUsd.value)}.`,
    priceChange === null
      ? "24h price change: data unavailable (not enough indexed price history yet)."
      : `Over the last 24 hours the DBC price moved ${signedPct(priceChange)}.`,
    indexerUp
      ? `The indexer has recorded ${plural(dashboard.totalTrades, "trade", "trades")} from ${plural(dashboard.uniqueTradersAllTime, "wallet", "wallets")} in total.`
      : "All-time trade totals are unavailable because the indexer has no data for this pool yet.",
  ];

  const liquidity: string[] = [
    targetKnown && liquidityPctOfTarget !== null
      ? `Live liquidity is ${usd(o.liquidityUsd.value)}, which is ${pct(liquidityPctOfTarget)} of the issuer's declared target of ${usd(dashboard.targetLiquidityUsd)}.`
      : `Live liquidity is ${usd(o.liquidityUsd.value)}. No liquidity target is recorded for this market, so it cannot be compared to a goal.`,
    liquidityChange === null
      ? "24h liquidity change: data unavailable (not enough indexed liquidity history yet)."
      : `Liquidity changed ${signedPct(liquidityChange)} over the last 24 hours.`,
  ];

  const trading: string[] = [];
  if (!indexerUp) {
    trading.push("Indexed trading activity is unavailable: the indexer has no cursor for this pool yet.");
  } else if (o.tradeCount24h === 0) {
    trading.push("There were no indexed trades in the last 24 hours.");
  } else {
    trading.push(
      `${plural(o.tradeCount24h, "trade", "trades")} from ${plural(o.uniqueTraders24h, "unique wallet", "unique wallets")} in the last 24 hours, totalling ${usd(o.volume24hUsd.value)} of volume (buys ${usd(o.buyVolumeUsd24h)}, sells ${usd(o.sellVolumeUsd24h)}).`,
    );
    trading.push(
      o.buySellRatio24h === null
        ? "Buy/sell trade-count ratio: not defined because there were no sells in the window."
        : `The buy/sell trade-count ratio is ${o.buySellRatio24h.toFixed(2)}.`,
    );
    if (concentration && concentration.value !== null) {
      trading.push(`The largest single wallet accounted for ${pct(concentration.value)} of 24h volume.`);
    }
    if (largeTrades && largeTrades.value !== null) {
      trading.push(`The largest 24h trade was ${pct(largeTrades.value)} of current pool liquidity.`);
    }
  }

  const oracleLines: string[] = [
    oracle.state === "live"
      ? `${oracle.liveCount} of ${oracle.total} Pyth feeds returned a live price.`
      : oracle.state === "entitlement_restricted"
        ? "Restricted — Pyth entitlement required. No Pyth-verified price is available for this asset."
        : `Pyth pricing is unavailable: ${oracle.note}`,
    deviation && deviation.value !== null
      ? `The DBC price differs from the reference price by ${pct(deviation.value)}. ${deviation.note ?? ""}`.trim()
      : "Deviation from a reference price: data unavailable.",
  ];

  const graduation: string[] = thresholdKnown
    ? [
        `The pool's quote reserve is ${usd(o.graduation.quoteReserveUsd)} of a ${usd(o.graduation.migrationThresholdUsd)} migration threshold (${pct(o.graduation.percentageComplete)}). Readiness: ${o.graduation.estimatedReadiness.replace(/_/g, " ")}.`,
        migrated
          ? "Migration to a DAMM v2 pool has been executed."
          : o.graduation.percentageComplete >= 100
            ? "The threshold has been reached; migration itself is a separate on-chain step that has not been executed yet."
            : "Migration has not been executed.",
        "DBC graduation has a single trigger — the quote reserve reaching the threshold. Volume and market cap are not graduation conditions.",
      ]
    : ["The migration threshold could not be read, so graduation progress is unavailable."];

  const sections: AnalysisSection[] = [
    { id: "overview", heading: "Market overview", lines: overview },
    { id: "liquidity", heading: "Liquidity", lines: liquidity },
    { id: "trading_activity", heading: "Trading activity", lines: trading },
    { id: "oracle", heading: "Oracle / reference price", lines: oracleLines },
    { id: "graduation", heading: "Graduation progress", lines: graduation },
  ];

  // ---- observations: only what the data actually supports ----
  const observations: AnalysisObservation[] = [];
  if (thresholdKnown) {
    observations.push({
      text: `Quote reserve stands at ${pct(o.graduation.percentageComplete)} of the migration threshold${migrated ? ", and migration has been executed" : ""}.`,
      sources: ["dbc"],
    });
  }
  if (liquidityIndicator && liquidityIndicator.status === "WATCH" && liquidityPctOfTarget !== null) {
    observations.push({
      text: `Liquidity is below half of the issuer's own target (${pct(liquidityPctOfTarget)} of ${usd(dashboard.targetLiquidityUsd)}), so the risk indicator is on WATCH.`,
      sources: ["dbc", "market_config"],
    });
  }
  if (deviation && deviation.status === "WATCH" && deviation.value !== null) {
    observations.push({
      text: `The DBC price is ${pct(deviation.value)} away from the reference price — beyond the ELF watch cutoff. ${deviation.note ?? ""}`.trim(),
      sources: ["dbc", o.referencePriceSource === "pyth" ? "pyth" : "market_config"],
    });
  }
  if (indexerUp && o.tradeCount24h === 0) {
    observations.push({ text: "No trades were indexed in the last 24 hours.", sources: ["indexer"] });
  }
  if (concentration && concentration.status === "WATCH" && concentration.value !== null) {
    observations.push({
      text: `A single wallet accounts for ${pct(concentration.value)} of 24h volume, which is a majority of activity.`,
      sources: ["indexer"],
    });
  }
  if (largeTrades && largeTrades.status === "WATCH" && largeTrades.value !== null) {
    observations.push({
      text: `The largest 24h trade equals ${pct(largeTrades.value)} of pool liquidity, above the ELF large-trade watch cutoff.`,
      sources: ["indexer", "dbc"],
    });
  }
  if (oracle.state === "entitlement_restricted") {
    observations.push({
      text: "Pyth pricing is restricted (entitlement required), so this market has no Pyth-verified reference price.",
      sources: ["pyth"],
    });
  } else if (oracle.state === "live" && deviation && deviation.value !== null) {
    observations.push({
      text: `${oracle.liveCount} Pyth ${oracle.liveCount === 1 ? "feed is" : "feeds are"} live and the DBC price deviates ${pct(deviation.value)} from the reference.`,
      sources: ["pyth", "dbc"],
    });
  }
  if (o.freshness.status === "delayed") {
    observations.push({
      text: "The indexer is behind, so indexed figures (volume, trades, history) may lag the on-chain state.",
      sources: ["indexer"],
    });
  }
  if (observations.length === 0) {
    observations.push({ text: "No notable observations beyond the figures above.", sources: ["dbc"] });
  }

  // ---- data sources: reflect what was truly available ----
  const dataSources: AnalysisDataSource[] = [
    { id: "dbc", label: "DBC (on-chain pool state)", available: true, detail: "Live pool state was read for this analysis." },
    {
      id: "indexer",
      label: "Indexer",
      available: indexerUp,
      detail: indexerUp
        ? `Indexer status: ${o.freshness.status}${o.freshness.lagSeconds !== null ? ` (${o.freshness.lagSeconds}s behind)` : ""}.`
        : "No indexer cursor exists for this pool yet.",
    },
    { id: "pyth", label: "Pyth oracle", available: oracle.state === "live", detail: oracle.state === "live" ? oracle.note : oracle.headline },
    {
      id: "market_config",
      label: "Market configuration",
      available: targetKnown,
      detail: targetKnown ? "Issuer-declared liquidity target is recorded." : "No liquidity target is recorded.",
    },
  ];

  const unavailableData: string[] = ["Live market cap (ELF does not read circulating supply on-chain)"];
  if (priceChange === null) unavailableData.push("24h price change");
  if (liquidityChange === null) unavailableData.push("24h liquidity change");
  if (!indexerUp) unavailableData.push("Indexed trading activity");
  if (oracle.state !== "live") unavailableData.push(`Pyth-verified price (${oracle.headline})`);
  if (!targetKnown) unavailableData.push("Issuer liquidity target");
  if (!thresholdKnown) unavailableData.push("Graduation threshold");

  const dataUsed: MarketAnalysis["dataUsed"] = {
    poolStatus: o.status,
    regime: o.regime,
    priceUsd: o.priceUsd.value,
    priceChange24hPct: priceChange,
    liquidityUsd: o.liquidityUsd.value,
    targetLiquidityUsd: targetKnown ? dashboard.targetLiquidityUsd : null,
    liquidityChange24hPct: liquidityChange,
    volume24hUsd: o.volume24hUsd.value,
    buyVolume24hUsd: o.buyVolumeUsd24h,
    sellVolume24hUsd: o.sellVolumeUsd24h,
    trades24h: o.tradeCount24h,
    uniqueTraders24h: o.uniqueTraders24h,
    totalTradesAllTime: dashboard.totalTrades,
    uniqueTradersAllTime: dashboard.uniqueTradersAllTime,
    quoteReserveUsd: o.graduation.quoteReserveUsd,
    migrationThresholdUsd: o.graduation.migrationThresholdUsd,
    graduationPct: o.graduation.percentageComplete,
    migrated,
    referencePriceUsd: o.referencePriceUsd,
    referencePriceSource: o.referencePriceSource,
    priceDeviationPct: deviation?.value ?? null,
    oracleState: oracle.state,
    oracleLiveFeeds: oracle.liveCount,
    oracleTotalFeeds: oracle.total,
    indexerStatus: o.freshness.status,
    indexerLagSeconds: o.freshness.lagSeconds,
    topTraderVolumeSharePct: concentration?.value ?? null,
    largestTradePctOfLiquidity: largeTrades?.value ?? null,
  };

  return {
    provider: { id: "elf-rule-based-v1", kind: "rule_based" },
    sections,
    observations,
    dataSources,
    unavailableData,
    dataUsed,
    disclaimer: ANALYST_DISCLAIMER,
  };
}

export const ruleBasedAnalystProvider: MarketAnalystProvider = {
  id: "elf-rule-based-v1",
  kind: "rule_based",
  analyze: async (dashboard) => analyzeMarketRuleBased(dashboard),
};

// --- guardrail: applied to EVERY provider's output --------------------------

/** Every user-visible sentence of an analysis, excluding the fixed disclaimer. */
export function analysisText(analysis: MarketAnalysis): string {
  return [...analysis.sections.flatMap((s) => [s.heading, ...s.lines]), ...analysis.observations.map((o) => o.text)].join("\n");
}

const ADVICE_PATTERNS: { name: string; pattern: RegExp }[] = [
  { name: "trade instruction", pattern: /\b(you|traders?|investors?|holders?|users?)\s+(should|must|ought to|need to|could|might want to)\s+(buy|sell|hold|accumulate|exit|enter|short|long|dump|add|reduce|trim)\b/i },
  { name: "recommendation", pattern: /\b(we|i|elf)?\s*(recommend|advise|suggest|urge)s?\w*\s+(buying|selling|holding|accumulating|to buy|to sell|to hold|exiting|entering)\b/i },
  { name: "buy/sell/hold rating", pattern: /\b(buy|sell|hold)\s+(now|signal|rating|recommendation|opportunity|zone)\b/i },
  // "strong buy", "rated sell", "this is a buy" — but not descriptive uses like "strong buy pressure" or "the buy/sell ratio".
  { name: "rating label", pattern: /\b(strong|rated|top|clear)\s+(buy|sell|hold)\b(?!\s+(pressure|volume|activity|flow|side|orders?|trades?|interest|demand|ratio|count))/i },
  { name: "rating label", pattern: /\b(is|as)\s+an?\s+(buy|sell|hold)\b(?!\s+(pressure|volume|activity|flow|side|orders?|trades?|interest|demand|ratio|count))/i },
  { name: "imperative trade call", pattern: /(^|[.!?]\s+)(buy|sell|hold|accumulate|dump)\s+(now|today|the dip|more|all|before|immediately)\b/i },
  { name: "price prediction", pattern: /\b(will|is going to|is set to|is likely to|is expected to|are expected to|should)\s+(rise|fall|increase|decrease|go up|go down|rally|crash|drop|surge|moon|pump|reach|hit|climb|decline|appreciate|depreciate)\b/i },
  { name: "price target / forecast", pattern: /\b(price target|target price|price prediction|forecast(ed)?\s+price|bullish|bearish|to the moon)\b/i },
  { name: "guarantee", pattern: /\b(guaranteed|risk[- ]free|can'?t lose|sure (thing|bet)|no risk)\b/i },
];

/**
 * Returns the names of any advice / prediction patterns found in `text`
 * (empty = clean). Deliberately targets *giving* advice and *forecasting* —
 * descriptive uses of "buy" and "sell" ("buy volume", "sell pressure
 * ratio") are allowed because buy/sell activity is core data.
 */
export function findAdviceViolations(text: string): string[] {
  return [...new Set(ADVICE_PATTERNS.filter(({ pattern }) => pattern.test(text)).map(({ name }) => name))];
}
