import {
  PRICE_IMPACT_WATCH_BPS,
  SIMULATION_MAX_IMPACT_BPS,
  TRADE_SIZES_USD,
  type ConfigValidationResult,
  type LabCheck,
  type LabCheckStatus,
  type LabRunResult,
  type SimulatedGraduationState,
  type SimulationScenarioKind,
  type SimulationScenarioResult,
} from "@elf/shared";
import { computeGraduationStatus } from "./graduation";
import { HEALTH_THRESHOLDS } from "./health";
import { configurationCheck } from "./launchPlan";

/**
 * Simulation Lab — pure evaluation of ONE engine scenario result. It computes
 * nothing about markets itself: prices, impacts, fees and reserves are the
 * simulation engine's; graduation reuses `computeGraduationStatus` and the
 * single real DBC condition; cutoffs reuse PRICE_IMPACT_WATCH_BPS (the design
 * flow's own), SIMULATION_MAX_IMPACT_BPS (unfillable) and the Market Health
 * liquidity-drop cutoff. No score, no invented threshold, no I/O.
 */

export const LAB_SCENARIO_LABELS: Record<SimulationScenarioKind, string> = {
  normal_demand: "Baseline",
  strong_buy_pressure: "Buy pressure",
  strong_sell_pressure: "Sell pressure",
  low_liquidity: "Low liquidity (early curve)",
  high_volatility: "High volatility",
  graduation_approach: "Graduation approach",
};

/** What the engine cannot represent — shown to the user instead of being approximated. */
export const LAB_NOT_MODELLED = [
  "Volume increase — the engine quotes four independent trades; it has no volume time series.",
  "Free-form liquidity change — a different initial liquidity is a different configuration (re-run the compiler); the engine only varies where on the curve the market sits.",
  "Price path over time — each trade is quoted from the scenario's start position, not applied in sequence.",
  "Number of trades and buy/sell ratio beyond the four standard trades.",
] as const;

export const LAB_ASSUMPTIONS = [
  "Each scenario assumes the market already sits at a position on the curve (linear in sqrt-price space — an ELF heuristic, not a forecast).",
  "The four standard trades ($1k, $5k, $10k, $25k) are quoted independently from that position, not one after another.",
  "Quotes use Meteora's own curve math; the quote token's USD price is the current one.",
  "Fee schedule position is fixed by the scenario (slots since launch).",
  "Nothing here is a blockchain transaction, and no pool exists or changes.",
] as const;

const isNum = (n: unknown): n is number => typeof n === "number" && Number.isFinite(n);
const usd = (n: number) => `$${n.toLocaleString("en-US", { maximumFractionDigits: Math.abs(n) < 1 ? 4 : 2 })}`;
const pct = (n: number) => `${+n.toFixed(2)}%`;
const bps = (n: number) => `${+n.toFixed(2)} bps`;
const tradeName = (t: { side: string; tradeSizeUsd: number }) => `${t.side} ${usd(t.tradeSizeUsd)}`;

/** Structural validation of an engine result; returns the reasons it can't be trusted (empty when fine). */
export function validateScenarioResult(result: unknown): string[] {
  const r = result as Partial<SimulationScenarioResult> | null;
  if (!r || typeof r !== "object" || !Array.isArray(r.trades)) return ["The simulation returned no trade results."];
  const reasons: string[] = [];
  if (r.label !== "SIMULATED") reasons.push("The result is not labelled SIMULATED.");
  if (r.trades.length !== TRADE_SIZES_USD.length) reasons.push(`Expected ${TRADE_SIZES_USD.length} trades, got ${r.trades.length}.`);
  for (const t of r.trades) {
    const fields = [t?.estimatedExecutionPrice, t?.estimatedPriceImpactBps, t?.postTradePrice, t?.feeUsd];
    if (!fields.every(isNum) || t?.label !== "SIMULATED") {
      reasons.push("A trade result is non-numeric or unlabelled.");
      break;
    }
  }
  if (!isNum(r.worstCasePriceImpactBps)) reasons.push("The worst-case price impact is missing.");
  return reasons;
}

export function evaluateSimulatedGraduation(result: SimulationScenarioResult): SimulatedGraduationState | null {
  const threshold = result.migrationThresholdUsd;
  const startReserve = result.startQuoteReserveUsd;
  if (!isNum(threshold) || threshold <= 0 || !isNum(startReserve)) return null;

  const trades = result.trades.map((t) => {
    const after = isNum(t.reserveQuoteAfter) ? t.reserveQuoteAfter : null;
    return {
      tradeSizeUsd: t.tradeSizeUsd,
      side: t.side,
      reserveAfterUsd: after,
      percentAfter: after === null ? null : computeGraduationStatus(after, threshold).percentageComplete,
      reachesThreshold: after === null ? null : after >= threshold,
    };
  });
  return {
    label: "SIMULATED GRADUATION STATE",
    condition: "quote_reserve_reaches_migration_threshold",
    migrationThresholdUsd: threshold,
    startQuoteReserveUsd: startReserve,
    startPercentComplete: computeGraduationStatus(startReserve, threshold).percentageComplete,
    trades,
    anyTradeReachesThreshold: trades.some((t) => t.reachesThreshold === true),
  };
}

export interface EvaluateLabRunInput {
  result: SimulationScenarioResult;
  configValidation: ConfigValidationResult;
}

export function evaluateLabRun({ result, configValidation }: EvaluateLabRunInput): Pick<LabRunResult, "checks" | "warnings" | "graduation"> {
  const cfg = configurationCheck(configValidation);
  const configuration: LabCheck = { id: "configuration", label: cfg.label, status: cfg.status === "not_run" ? "unavailable" : cfg.status, detail: cfg.detail };

  const invalid = validateScenarioResult(result);
  const simulationOutput: LabCheck =
    invalid.length === 0
      ? { id: "simulation_output", label: "Simulation output valid", status: "pass", detail: "Every trade result is numeric and labelled SIMULATED." }
      : { id: "simulation_output", label: "Simulation output valid", status: "fail", detail: invalid.join(" ") };

  const liveIndicators: LabCheck = {
    id: "live_indicators",
    label: "Liquidity, volume, oracle and indexer indicators",
    status: "unavailable",
    detail: "These need live market data. A simulation has none, so they are not evaluated here — they apply once the market is live.",
  };

  // Everything below reads engine numbers, so it is only meaningful for a structurally valid result.
  if (invalid.length > 0) return { checks: [configuration, simulationOutput, liveIndicators], warnings: invalid, graduation: null };

  const warnings: string[] = [];
  const unfillable = result.trades.filter((t) => t.estimatedPriceImpactBps >= SIMULATION_MAX_IMPACT_BPS);
  const impactful = result.trades.filter((t) => t.estimatedPriceImpactBps >= PRICE_IMPACT_WATCH_BPS && t.estimatedPriceImpactBps < SIMULATION_MAX_IMPACT_BPS);

  const priceImpact: LabCheck =
    impactful.length === 0
      ? { id: "price_impact", label: "Price impact", status: "pass", detail: `No filled trade exceeds ${PRICE_IMPACT_WATCH_BPS} bps (largest: ${bps(Math.max(0, ...result.trades.filter((t) => !unfillable.includes(t)).map((t) => t.estimatedPriceImpactBps)))}).` }
      : { id: "price_impact", label: "Price impact", status: "warn", detail: `${impactful.length} filled trade${impactful.length === 1 ? "" : "s"} exceed ${PRICE_IMPACT_WATCH_BPS} bps: ${impactful.map((t) => `${tradeName(t)} (${bps(t.estimatedPriceImpactBps)})`).join(", ")}.` };
  if (impactful.length > 0) warnings.push(`Price impact increased: ${priceImpact.detail}`);

  const fillable: LabCheck =
    unfillable.length === 0
      ? { id: "fillable", label: "Trades fillable", status: "pass", detail: "All four trades can be filled from this position." }
      : { id: "fillable", label: "Trades fillable", status: "warn", detail: `${unfillable.length} trade${unfillable.length === 1 ? "" : "s"} exceed the curve's remaining depth in that direction and cannot be filled: ${unfillable.map(tradeName).join(", ")}.` };
  if (unfillable.length > 0) warnings.push(`Not fillable: ${fillable.detail}`);

  const start = result.startQuoteReserveUsd;
  const reserves = result.trades.map((t) => t.reserveQuoteAfter).filter(isNum);
  let reserveChange: LabCheck;
  if (!isNum(start) || start <= 0 || reserves.length === 0) {
    reserveChange = { id: "reserve_change", label: "Liquidity change", status: "unavailable", detail: "Quote reserves are not available for this result." };
  } else {
    const lowest = Math.min(...reserves);
    const dropPct = ((start - lowest) / start) * 100;
    reserveChange =
      dropPct > HEALTH_THRESHOLDS.liquidityDropPct
        ? { id: "reserve_change", label: "Liquidity change", status: "warn", detail: `The largest single sell would take the quote reserve from ${usd(start)} to ${usd(lowest)} (${pct(-dropPct)}; cutoff ${pct(HEALTH_THRESHOLDS.liquidityDropPct)}).` }
        : { id: "reserve_change", label: "Liquidity change", status: "pass", detail: dropPct <= 0 ? `No single trade lowers the quote reserve from ${usd(start)}.` : `Quote reserve moves at most ${pct(dropPct)} down from ${usd(start)} on any single trade (cutoff ${pct(HEALTH_THRESHOLDS.liquidityDropPct)}).` };
    if (reserveChange.status === "warn") warnings.push(`Liquidity decreased: ${reserveChange.detail}`);
  }

  return {
    checks: [configuration, simulationOutput, priceImpact, fillable, reserveChange, liveIndicators],
    warnings,
    graduation: evaluateSimulatedGraduation(result),
  };
}

// --- comparison ---------------------------------------------------------------

export interface LabComparisonRun {
  runId: string;
  label: string;
  customised: boolean;
  startPriceUsd: number | null;
  worstImpactBps: number;
  meanFilledImpactBps: number | null;
  unfillableTrades: number;
  totalFeesUsd: number;
  startReservePercent: number | null;
  anyTradeReachesThreshold: boolean | null;
  checkCounts: Record<LabCheckStatus, number>;
}

export type LabComparison =
  | { compatible: true; curveLabel: string; runs: LabComparisonRun[] }
  | { compatible: false; reason: string };

/**
 * Compares completed runs of the SAME configuration only. Runs of different
 * configurations measure different curves, so mixing them would compare
 * incompatible things — that is refused rather than shown.
 */
export function compareLabRuns(runs: LabRunResult[]): LabComparison {
  if (runs.length < 2) return { compatible: false, reason: "Select at least two completed simulations to compare." };
  const first = runs[0]!;
  if (runs.some((r) => r.curveCandidateId !== first.curveCandidateId)) {
    return { compatible: false, reason: "These runs use different curve configurations, so their metrics are not comparable." };
  }
  if (new Set(runs.map((r) => r.runId)).size !== runs.length) return { compatible: false, reason: "The same run was selected twice." };

  return {
    compatible: true,
    curveLabel: first.curveLabel,
    runs: runs.map((r) => {
      const filled = r.result.trades.filter((t) => t.estimatedPriceImpactBps < SIMULATION_MAX_IMPACT_BPS);
      const counts: Record<LabCheckStatus, number> = { pass: 0, warn: 0, fail: 0, unavailable: 0 };
      for (const c of r.checks) counts[c.status] += 1;
      return {
        runId: r.runId,
        label: LAB_SCENARIO_LABELS[r.scenario] + (r.parameters.customised ? " (custom)" : ""),
        customised: r.parameters.customised,
        startPriceUsd: isNum(r.result.startPriceUsd) ? r.result.startPriceUsd : null,
        worstImpactBps: r.result.worstCasePriceImpactBps,
        meanFilledImpactBps: filled.length === 0 ? null : filled.reduce((sum, t) => sum + t.estimatedPriceImpactBps, 0) / filled.length,
        unfillableTrades: r.result.trades.length - filled.length,
        totalFeesUsd: filled.reduce((sum, t) => sum + t.feeUsd, 0),
        startReservePercent: r.graduation?.startPercentComplete ?? null,
        anyTradeReachesThreshold: r.graduation ? r.graduation.anyTradeReachesThreshold : null,
        checkCounts: counts,
      };
    }),
  };
}
