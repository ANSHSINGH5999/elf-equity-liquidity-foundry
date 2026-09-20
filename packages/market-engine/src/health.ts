import {
  INDEXER_DELAYED_AFTER_SECONDS,
  type HealthCheck,
  type HealthEvent,
  type HealthThresholds,
  type MarketHealth,
  type RiskStatus,
} from "@elf/shared";
import { RISK_THRESHOLDS, summarizeOracleFeeds, type RiskOracleFeedInput } from "./risk";

/**
 * Market Health & Anomaly Engine — pure, deterministic, no I/O, no clock
 * (the evaluation time is an input), no randomness, no LLM.
 *
 * It reports MEASURABLE conditions as explainable events. It does not detect
 * fraud, manipulation or intent, produces no composite score, and never says
 * what to do. Where a value already had a cutoff in ELF (price deviation,
 * large trades, concentration, indexer lag) that cutoff is reused; the few new
 * ones are explicit, documented and overridable below. Temporal signals are
 * measured against the market's OWN recent history, never a global constant.
 */
export const HEALTH_THRESHOLDS: HealthThresholds = {
  recentWindowHours: 1,
  baselineWindowHours: 24,
  liquidityDropPct: 20,
  volumeSpikeMultiple: 3,
  tradeFrequencyMultiple: 3,
  minSampleTrades: 5,
  priceDeviationPct: RISK_THRESHOLDS.priceDeviationPct,
  largeTradeLiquidityShare: RISK_THRESHOLDS.largeTradeLiquidityShare,
  topTraderVolumeShare: RISK_THRESHOLDS.topTraderVolumeShare,
  indexerLagSeconds: INDEXER_DELAYED_AFTER_SECONDS,
};

export const HEALTH_DISCLAIMER =
  "Market Health reports measurable conditions in ELF's own indexed and on-chain data. It does not determine fraud, manipulation or intent, and it is not investment advice.";

const HOUR_MS = 3_600_000;
const MAX_LARGE_TRADE_EVENTS = 3;

export interface HealthTradeTotals {
  tradeCount: number;
  volumeUsd: number;
  lastTradeAt: string | null;
}

export interface HealthLargeTrade {
  signature: string;
  timestamp: string;
  side: "buy" | "sell";
  valueUsd: number;
}

export interface HealthInputs {
  /** ISO evaluation time. */
  now: string;
  indexer: { status: "live" | "delayed" | "unavailable"; lagSeconds: number | null };
  /** Indexed liquidity readings, oldest first: the last reading before the recent window (if any), then those inside it. */
  liquidityReadings: { timestamp: string; liquidityUsd: number }[];
  /** Current pool liquidity in USD (used to size large trades). */
  currentLiquidityUsd: number;
  trades: {
    firstTradeAt: string | null;
    /** Totals since (now − recent − baseline hours). */
    sinceBaselineStart: HealthTradeTotals;
    /** Totals since (now − recent hours). */
    sinceRecentStart: HealthTradeTotals;
    /** The largest trades of the last 24h by USD value, any order. */
    largest24h: HealthLargeTrade[];
    count24h: number;
    /** Share (0–1) of 24h volume from the largest wallet; null when there was no volume. */
    topTraderVolumeShare24h: number | null;
  };
  price: { dbcUsd: number; referenceUsd: number | null; referenceSource: "pyth" | "issuer_declared"; referenceFeedSymbol: string | null };
  oracleFeeds: RiskOracleFeedInput[];
  graduation: { percentComplete: number; event: { timestamp: string; signature: string } | null };
}

const isNum = (n: unknown): n is number => typeof n === "number" && Number.isFinite(n);
const ms = (iso: unknown): number | null => {
  if (typeof iso !== "string") return null;
  const t = Date.parse(iso);
  return Number.isNaN(t) ? null : t;
};
const usd = (n: number) => `$${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: Math.abs(n) < 1 ? 4 : 2 })}`;
const pct = (n: number) => `${+n.toFixed(2)}%`;
const times = (n: number) => `${+n.toFixed(2)}×`;
const hours = (n: number) => `${+n.toFixed(2)} hour${n === 1 ? "" : "s"}`;

function resolveThresholds(overrides: Partial<HealthThresholds> | undefined): HealthThresholds {
  const out: HealthThresholds = { ...HEALTH_THRESHOLDS };
  for (const key of Object.keys(HEALTH_THRESHOLDS) as (keyof HealthThresholds)[]) {
    const v = overrides?.[key];
    if (isNum(v) && v > 0) out[key] = v;
  }
  return out;
}

const check = (id: HealthCheck["id"], label: string, status: RiskStatus, detail: string): HealthCheck => ({ id, label, status, detail });

interface Evaluated {
  check: HealthCheck;
  events: HealthEvent[];
}

const unavailable = (id: HealthCheck["id"], label: string, detail: string): Evaluated => ({ check: check(id, label, "DATA_UNAVAILABLE", detail), events: [] });

export function evaluateMarketHealth(input: HealthInputs, thresholdOverrides?: Partial<HealthThresholds>): MarketHealth {
  const t = resolveThresholds(thresholdOverrides);
  const nowMs = ms(input.now);
  const evaluated: Evaluated[] = [
    evaluateIndexer(input, t),
    evaluateLiquidity(input, t, nowMs),
    ...evaluateVolumeAndFrequency(input, t, nowMs),
    evaluateLargeTrades(input, t),
    evaluateConcentration(input, t),
    evaluatePriceReference(input, t),
    evaluateOracle(input),
    evaluateGraduation(input),
  ];

  const checks = evaluated.map((e) => e.check);
  const events = evaluated
    .flatMap((e) => e.events)
    .sort(
      (a, b) =>
        Number(b.severity === "WATCH") - Number(a.severity === "WATCH") ||
        (b.occurredAt ?? "").localeCompare(a.occurredAt ?? "") ||
        a.id.localeCompare(b.id),
    );
  const watchEventCount = events.filter((e) => e.severity === "WATCH").length;

  const activityIds: HealthCheck["id"][] = ["liquidity", "volume", "trade_frequency", "large_trades"];
  const activityUnavailable = checks.filter((c) => activityIds.includes(c.id)).every((c) => c.status === "DATA_UNAVAILABLE");
  const indexerUnavailable = input.indexer?.status === "unavailable";
  const status: RiskStatus = watchEventCount > 0 ? "WATCH" : indexerUnavailable || activityUnavailable ? "DATA_UNAVAILABLE" : "NORMAL";

  return {
    engine: "elf-deterministic-market-health-v1",
    status,
    evaluatedAt: nowMs === null ? input.now : new Date(nowMs).toISOString(),
    events,
    watchEventCount,
    checks,
    timeline: events.filter((e) => e.occurredAt !== null).sort((a, b) => a.occurredAt!.localeCompare(b.occurredAt!) || a.id.localeCompare(b.id)),
    thresholds: t,
    disclaimer: HEALTH_DISCLAIMER,
  };
}

// --- indexer -----------------------------------------------------------------

function evaluateIndexer(input: HealthInputs, t: HealthThresholds): Evaluated {
  const label = "Indexer";
  const { status, lagSeconds } = input.indexer ?? {};
  if (status === "live") return { check: check("indexer", label, "NORMAL", "Indexer synchronized."), events: [] };
  if (status === "delayed" && isNum(lagSeconds)) {
    const event: HealthEvent = {
      id: "INDEXER_LAG",
      type: "INDEXER_LAG",
      severity: "WATCH",
      occurredAt: null,
      metric: "Indexer lag",
      unit: "seconds",
      observed: lagSeconds,
      reference: null,
      referenceLabel: null,
      referenceUnit: null,
      threshold: t.indexerLagSeconds,
      explanation: `The indexer last processed this pool ${lagSeconds}s ago (delayed beyond ${t.indexerLagSeconds}s), so indexed metrics may not yet include the latest activity.`,
      dataSources: ["INDEXED"],
      signature: null,
    };
    return { check: check("indexer", label, "WATCH", `Indexer is ${lagSeconds}s behind.`), events: [event] };
  }
  return unavailable("indexer", label, "The indexer has no cursor for this pool yet, so indexed activity cannot be read.");
}

// --- liquidity ---------------------------------------------------------------

function evaluateLiquidity(input: HealthInputs, t: HealthThresholds, nowMs: number | null): Evaluated {
  const label = "Liquidity";
  const readings = Array.isArray(input.liquidityReadings) ? input.liquidityReadings : [];
  const valid = readings.filter((r) => r && ms(r.timestamp) !== null && isNum(r.liquidityUsd) && r.liquidityUsd >= 0);
  if (nowMs === null || valid.length !== readings.length) return unavailable("liquidity", label, "Liquidity history is malformed, so it cannot be evaluated.");
  if (valid.length === 0) return unavailable("liquidity", label, "No indexed liquidity history yet.");

  const windowStart = nowMs - t.recentWindowHours * HOUR_MS;
  const hasOpening = ms(valid[0]!.timestamp)! < windowStart;
  const inWindow = valid.filter((r) => ms(r.timestamp)! >= windowStart);
  if (hasOpening && inWindow.length === 0) {
    return { check: check("liquidity", label, "NORMAL", `No indexed liquidity movement in the last ${hours(t.recentWindowHours)}.`), events: [] };
  }
  if (valid.length < 2) return unavailable("liquidity", label, "Only one indexed liquidity reading exists, so no change can be measured.");

  const series = hasOpening ? [valid[0]!, ...inWindow] : inWindow;
  const latest = series.at(-1)!;
  const peak = series.reduce((best, r) => (r.liquidityUsd > best.liquidityUsd ? r : best), series[0]!);
  if (peak.liquidityUsd <= 0) return unavailable("liquidity", label, "Liquidity readings are zero, so a percentage change is undefined.");

  const dropPct = ((peak.liquidityUsd - latest.liquidityUsd) / peak.liquidityUsd) * 100;
  if (dropPct > t.liquidityDropPct) {
    const event: HealthEvent = {
      id: `LIQUIDITY_DROP:${latest.timestamp}`,
      type: "LIQUIDITY_DROP",
      severity: "WATCH",
      occurredAt: new Date(ms(latest.timestamp)!).toISOString(),
      metric: "Liquidity change from window peak",
      unit: "pct",
      observed: dropPct,
      reference: peak.liquidityUsd,
      referenceLabel: "Liquidity at window peak",
      referenceUnit: "usd",
      threshold: t.liquidityDropPct,
      explanation: `Indexed pool liquidity fell from ${usd(peak.liquidityUsd)} to ${usd(latest.liquidityUsd)} — a ${pct(dropPct)} decrease within the last ${hours(t.recentWindowHours)} (cutoff: ${pct(t.liquidityDropPct)}).`,
      dataSources: ["INDEXED"],
      signature: null,
    };
    return { check: check("liquidity", label, "WATCH", `Down ${pct(dropPct)} from its ${hours(t.recentWindowHours)} peak.`), events: [event] };
  }
  return { check: check("liquidity", label, "NORMAL", `Down ${pct(Math.max(0, dropPct))} from its ${hours(t.recentWindowHours)} peak (cutoff ${pct(t.liquidityDropPct)}).`), events: [] };
}

// --- volume and trade frequency ---------------------------------------------

function evaluateVolumeAndFrequency(input: HealthInputs, t: HealthThresholds, nowMs: number | null): [Evaluated, Evaluated] {
  const vLabel = "Trading volume";
  const fLabel = "Trade frequency";
  const both = (detail: string): [Evaluated, Evaluated] => [unavailable("volume", vLabel, detail), unavailable("trade_frequency", fLabel, detail)];

  const tr = input.trades;
  const recent = tr?.sinceRecentStart;
  const all = tr?.sinceBaselineStart;
  const totalsOk = (x: unknown): x is HealthTradeTotals =>
    !!x && isNum((x as HealthTradeTotals).tradeCount) && isNum((x as HealthTradeTotals).volumeUsd) && (x as HealthTradeTotals).tradeCount >= 0 && (x as HealthTradeTotals).volumeUsd >= 0;
  if (nowMs === null || !totalsOk(recent) || !totalsOk(all) || all.tradeCount < recent.tradeCount || all.volumeUsd < recent.volumeUsd) {
    return both("Trade totals are malformed, so activity cannot be compared.");
  }
  const firstMs = ms(tr.firstTradeAt);
  if (firstMs === null) return both("No indexed trades yet, so there is no baseline to compare against.");

  const recentStart = nowMs - t.recentWindowHours * HOUR_MS;
  const baselineHours = Math.min(t.baselineWindowHours, (recentStart - firstMs) / HOUR_MS);
  const baseline = { tradeCount: all.tradeCount - recent.tradeCount, volumeUsd: all.volumeUsd - recent.volumeUsd };
  if (baselineHours <= 0 || baseline.tradeCount < t.minSampleTrades) {
    return both(`Fewer than ${t.minSampleTrades} trades before the last ${hours(t.recentWindowHours)} (${baseline.tradeCount} found), so there is no baseline to compare against.`);
  }

  const occurredAt = ms(recent.lastTradeAt) === null ? null : new Date(ms(recent.lastTradeAt)!).toISOString();
  const evaluateRatio = (
    id: "volume" | "trade_frequency",
    label: string,
    type: "VOLUME_SPIKE" | "TRADE_FREQUENCY_SPIKE",
    metric: string,
    unit: "usd" | "count",
    recentTotal: number,
    baselineTotal: number,
    cutoff: number,
    noun: string,
    fmt: (n: number) => string,
  ): Evaluated => {
    const baselineRate = baselineTotal / baselineHours;
    if (baselineRate <= 0) return unavailable(id, label, `The baseline ${noun} is zero, so a multiple is undefined.`);
    const recentRate = recentTotal / t.recentWindowHours;
    const multiple = recentRate / baselineRate;
    if (recent.tradeCount < t.minSampleTrades) {
      return { check: check(id, label, "NORMAL", `Only ${recent.tradeCount} trade${recent.tradeCount === 1 ? "" : "s"} in the last ${hours(t.recentWindowHours)} — fewer than the ${t.minSampleTrades} needed to call a spike.`), events: [] };
    }
    if (multiple > cutoff) {
      const event: HealthEvent = {
        id: `${type}:${occurredAt ?? "current"}`,
        type,
        severity: "WATCH",
        occurredAt,
        metric,
        unit: "multiple",
        observed: multiple,
        reference: baselineRate,
        referenceLabel: `Baseline ${noun} per hour`,
        referenceUnit: unit,
        threshold: cutoff,
        explanation: `${noun[0]!.toUpperCase()}${noun.slice(1)} over the last ${hours(t.recentWindowHours)} ran at ${fmt(recentRate)} per hour — ${times(multiple)} this market's own baseline of ${fmt(baselineRate)} per hour over the previous ${hours(baselineHours)} (cutoff: ${times(cutoff)}).`,
        dataSources: ["INDEXED"],
        signature: null,
      };
      return { check: check(id, label, "WATCH", `${times(multiple)} its own baseline (cutoff ${times(cutoff)}).`), events: [event] };
    }
    return { check: check(id, label, "NORMAL", `${times(multiple)} its own baseline (cutoff ${times(cutoff)}).`), events: [] };
  };

  return [
    evaluateRatio("volume", vLabel, "VOLUME_SPIKE", "Hourly volume vs own baseline", "usd", recent.volumeUsd, baseline.volumeUsd, t.volumeSpikeMultiple, "volume", usd),
    evaluateRatio("trade_frequency", fLabel, "TRADE_FREQUENCY_SPIKE", "Trades per hour vs own baseline", "count", recent.tradeCount, baseline.tradeCount, t.tradeFrequencyMultiple, "trade count", (n) => `${+n.toFixed(2)} trades`),
  ];
}

// --- large trades ------------------------------------------------------------

function evaluateLargeTrades(input: HealthInputs, t: HealthThresholds): Evaluated {
  const label = "Large trades";
  const liquidity = input.currentLiquidityUsd;
  const trades = Array.isArray(input.trades?.largest24h) ? input.trades.largest24h : [];
  const valid = trades.filter((x) => x && typeof x.signature === "string" && ms(x.timestamp) !== null && isNum(x.valueUsd) && x.valueUsd >= 0 && (x.side === "buy" || x.side === "sell"));
  if (valid.length !== trades.length) return unavailable("large_trades", label, "Trade data is malformed, so trade sizes cannot be evaluated.");
  if (valid.length === 0) return unavailable("large_trades", label, "No indexed trades in the last 24 hours.");
  if (!isNum(liquidity) || liquidity <= 0) return unavailable("large_trades", label, "Current liquidity is unavailable, so trade size cannot be compared to it.");

  const cutoffUsd = t.largeTradeLiquidityShare * liquidity;
  const large = valid
    .filter((x) => x.valueUsd > cutoffUsd)
    .sort((a, b) => b.valueUsd - a.valueUsd || a.signature.localeCompare(b.signature))
    .slice(0, MAX_LARGE_TRADE_EVENTS);
  if (large.length === 0) {
    const biggest = Math.max(...valid.map((x) => x.valueUsd));
    return { check: check("large_trades", label, "NORMAL", `Largest 24h trade is ${pct((biggest / liquidity) * 100)} of current liquidity (cutoff ${pct(t.largeTradeLiquidityShare * 100)}).`), events: [] };
  }
  const events = large.map<HealthEvent>((x) => ({
    id: `LARGE_TRADE:${x.signature}`,
    type: "LARGE_TRADE",
    severity: "WATCH",
    occurredAt: new Date(ms(x.timestamp)!).toISOString(),
    metric: "Trade size vs current liquidity",
    unit: "pct",
    observed: (x.valueUsd / liquidity) * 100,
    reference: liquidity,
    referenceLabel: "Current pool liquidity",
    referenceUnit: "usd",
    threshold: t.largeTradeLiquidityShare * 100,
    explanation: `A ${x.side} of ${usd(x.valueUsd)} was ${pct((x.valueUsd / liquidity) * 100)} of current pool liquidity (${usd(liquidity)}); the cutoff is ${pct(t.largeTradeLiquidityShare * 100)}.`,
    dataSources: ["INDEXED", "ON_CHAIN"],
    signature: x.signature,
  }));
  return { check: check("large_trades", label, "WATCH", `${large.length} trade${large.length === 1 ? "" : "s"} above ${pct(t.largeTradeLiquidityShare * 100)} of current liquidity in the last 24h.`), events };
}

// --- concentration -----------------------------------------------------------

function evaluateConcentration(input: HealthInputs, t: HealthThresholds): Evaluated {
  const label = "Volume concentration";
  const share = input.trades?.topTraderVolumeShare24h;
  const count = input.trades?.count24h;
  if (!isNum(count) || count < 0) return unavailable("concentration", label, "Trade count is malformed, so concentration cannot be evaluated.");
  if (share === null || share === undefined) return unavailable("concentration", label, "No trading volume in the last 24 hours.");
  if (!isNum(share) || share < 0 || share > 1) return unavailable("concentration", label, "Concentration data is malformed.");
  if (count < t.minSampleTrades) {
    return unavailable("concentration", label, `Only ${count} trade${count === 1 ? "" : "s"} in 24h — fewer than the ${t.minSampleTrades} needed for wallet concentration to be meaningful.`);
  }
  if (share > t.topTraderVolumeShare) {
    const event: HealthEvent = {
      id: "TRADE_CONCENTRATION",
      type: "TRADE_CONCENTRATION",
      severity: "WATCH",
      occurredAt: null,
      metric: "Largest wallet's share of 24h volume",
      unit: "pct",
      observed: share * 100,
      reference: null,
      referenceLabel: null,
      referenceUnit: null,
      threshold: t.topTraderVolumeShare * 100,
      explanation: `One wallet accounts for ${pct(share * 100)} of the last 24 hours' traded volume across ${count} trades (cutoff: ${pct(t.topTraderVolumeShare * 100)}). This describes how volume is distributed; it says nothing about intent.`,
      dataSources: ["INDEXED"],
      signature: null,
    };
    return { check: check("concentration", label, "WATCH", `Largest wallet is ${pct(share * 100)} of 24h volume.`), events: [event] };
  }
  return { check: check("concentration", label, "NORMAL", `Largest wallet is ${pct(share * 100)} of 24h volume (cutoff ${pct(t.topTraderVolumeShare * 100)}).`), events: [] };
}

// --- price reference ---------------------------------------------------------

function evaluatePriceReference(input: HealthInputs, t: HealthThresholds): Evaluated {
  const label = "Price / reference";
  const p = input.price;
  if (!p || p.referenceSource !== "pyth" || !isNum(p.referenceUsd) || p.referenceUsd <= 0) {
    return unavailable(
      "price_reference",
      label,
      "No live reference price. The issuer-declared price is a static number, and a bonding-curve price is set by the curve, so ELF does not flag deviation from it.",
    );
  }
  if (!isNum(p.dbcUsd) || p.dbcUsd < 0) return unavailable("price_reference", label, "The DBC price is unavailable.");

  const deviation = (Math.abs(p.dbcUsd - p.referenceUsd) / p.referenceUsd) * 100;
  if (deviation > t.priceDeviationPct) {
    const event: HealthEvent = {
      id: "PRICE_DEVIATION",
      type: "PRICE_DEVIATION",
      severity: "WATCH",
      occurredAt: null,
      metric: "DBC price vs live Pyth reference",
      unit: "pct",
      observed: deviation,
      reference: p.referenceUsd,
      referenceLabel: "Live Pyth reference price",
      referenceUnit: "usd",
      threshold: t.priceDeviationPct,
      explanation: `The DBC price (${usd(p.dbcUsd)}) differs from the live Pyth reference${p.referenceFeedSymbol ? ` (${p.referenceFeedSymbol})` : ""} of ${usd(p.referenceUsd)} by ${pct(deviation)} (cutoff: ${pct(t.priceDeviationPct)}).`,
      dataSources: ["ON_CHAIN", "PYTH"],
      signature: null,
    };
    return { check: check("price_reference", label, "WATCH", `${pct(deviation)} from the live Pyth reference.`), events: [event] };
  }
  return { check: check("price_reference", label, "NORMAL", `${pct(deviation)} from the live Pyth reference (cutoff ${pct(t.priceDeviationPct)}).`), events: [] };
}

// --- oracle ------------------------------------------------------------------

function evaluateOracle(input: HealthInputs): Evaluated {
  const label = "Oracle";
  const feeds = Array.isArray(input.oracleFeeds) ? input.oracleFeeds : [];
  const summary = summarizeOracleFeeds(feeds);
  if (summary.state === "live") return { check: check("oracle", label, "NORMAL", `Oracle operational — ${summary.note}`), events: [] };
  if (summary.state === "no_feed") return unavailable("oracle", label, summary.note);

  const restricted = summary.state === "entitlement_restricted";
  const type = restricted ? "ORACLE_RESTRICTED" : "ORACLE_UNAVAILABLE";
  const event: HealthEvent = {
    id: type,
    type,
    severity: "INFO",
    occurredAt: null,
    metric: "Live Pyth feeds",
    unit: "count",
    observed: 0,
    reference: summary.total,
    referenceLabel: "Feeds monitored",
    referenceUnit: "count",
    threshold: null,
    explanation: `${summary.headline}. ${summary.note} Price/reference deviation is therefore not evaluated; this is a data-availability fact, not a market anomaly.`,
    dataSources: ["PYTH"],
    signature: null,
  };
  return { check: check("oracle", label, "DATA_UNAVAILABLE", summary.headline), events: [event] };
}

// --- graduation --------------------------------------------------------------

function evaluateGraduation(input: HealthInputs): Evaluated {
  const label = "Graduation";
  const g = input.graduation;
  if (g?.event && ms(g.event.timestamp) !== null) {
    const event: HealthEvent = {
      id: `GRADUATION_REACHED:${g.event.signature}`,
      type: "GRADUATION_REACHED",
      severity: "INFO",
      occurredAt: new Date(ms(g.event.timestamp)!).toISOString(),
      metric: "Curve-complete event",
      unit: null,
      observed: null,
      reference: null,
      referenceLabel: null,
      referenceUnit: null,
      threshold: null,
      explanation: "The DBC program emitted its curve-complete event: the pool's quote reserve reached the migration threshold.",
      dataSources: ["INDEXED", "ON_CHAIN"],
      signature: g.event.signature,
    };
    return { check: check("graduation", label, "NORMAL", "Curve complete — the pool has reached its migration threshold."), events: [event] };
  }
  if (!g || !isNum(g.percentComplete)) return unavailable("graduation", label, "Graduation progress is unavailable.");
  return { check: check("graduation", label, "NORMAL", `Quote reserve is at ${pct(g.percentComplete)} of the migration threshold.`), events: [] };
}
