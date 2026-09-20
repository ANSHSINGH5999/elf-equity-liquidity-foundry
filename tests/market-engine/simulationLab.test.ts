import { beforeAll, describe, expect, it } from "vitest";
import { Connection } from "@solana/web3.js";
import {
  LAB_NOT_MODELLED,
  LAB_SCENARIO_LABELS,
  compareLabRuns,
  compileCurveCandidates,
  computeGraduationStatus,
  evaluateLabRun,
  evaluateSimulatedGraduation,
  type EvaluateLabRunInput,
} from "../../packages/market-engine/src/index.js";
import { buildConfigParametersFromCandidate, validateCandidateConfiguration } from "../../packages/meteora-adapter/src/index.js";
import {
  LabParameterError,
  SCENARIO_DEFINITIONS,
  UnsupportedScenarioError,
  resolveLabScenario,
  runScenario,
  runSimulation,
} from "../../packages/simulation-engine/src/index.js";
import {
  PRICE_IMPACT_WATCH_BPS,
  SIMULATION_MAX_IMPACT_BPS,
  type ConfigValidationResult,
  type CurveCandidate,
  type LabRunResult,
  type MarketProfile,
  type SimulationScenarioKind,
  type SimulationScenarioResult,
  type TokenizedAsset,
} from "../../packages/shared/src/index.js";

/**
 * The Lab is tested against REAL engine output: the real compiler, the real
 * simulation engine and Meteora's real validator. Only boundary cases hand-edit
 * an engine result, and they say so.
 */
const asset: TokenizedAsset = {
  id: "asset-1", name: "Acme Pre-IPO", symbol: "ACME", mintAddress: "So11111111111111111111111111111111111111112",
  issuer: "Acme Corp", assetType: "pre_ipo", referencePriceUsd: 10, source: "manual", createdAt: "2026-09-20T00:00:00.000Z",
};
const profile: MarketProfile = {
  id: "profile-1", assetId: "asset-1", initialLiquidityUsd: 250_000, expectedVolatility: "medium", riskProfile: "balanced",
  targetLiquidityUsd: 500_000, targetGraduationUsd: 1_000_000, quoteToken: "USDC", createdAt: "2026-09-20T00:00:00.000Z",
};

/** A connection that fails loudly on ANY use: proves the simulation performs no RPC and cannot touch chain state. */
const forbiddenConnection = new Proxy({}, { get: (_t, prop) => { throw new Error(`Simulation attempted RPC: connection.${String(prop)}`); } }) as unknown as Connection;

let balanced: CurveCandidate;
let growth: CurveCandidate;
let validCfg: ConfigValidationResult;
let invalidCfg: ConfigValidationResult;
let params: Awaited<ReturnType<typeof paramsFor>>;
let growthParams: Awaited<ReturnType<typeof paramsFor>>;

async function paramsFor(candidate: CurveCandidate) {
  return { connection: forbiddenConnection, candidate, profile, configParameters: await buildConfigParametersFromCandidate(candidate, profile), quoteUsdPrice: 1 };
}

beforeAll(async () => {
  const c = compileCurveCandidates(asset, profile);
  balanced = c.find((x) => x.riskProfile === "balanced")!;
  growth = c.find((x) => x.riskProfile === "growth")!;
  validCfg = await validateCandidateConfiguration(balanced, profile);
  invalidCfg = await validateCandidateConfiguration(growth, profile);
  params = await paramsFor(balanced);
  growthParams = await paramsFor(growth);
}, 60_000);

const run = (scenario: string, overrides: { curveProgressPct?: number; sides?: string[] } = {}, p = () => params, cfg = () => validCfg): LabRunResult => {
  const { definition, parameters } = resolveLabScenario({ scenario, ...overrides });
  const result = runScenario(p(), definition);
  return {
    label: "SIMULATION — OFF-CHAIN",
    runId: `run-${Math.random().toString(36).slice(2)}`,
    curveCandidateId: p().candidate.id,
    curveLabel: p().candidate.label,
    scenario: definition.kind,
    parameters,
    result,
    ...evaluateLabRun({ result, configValidation: cfg() }),
    createdAt: "2026-09-20T00:00:00.000Z",
  };
};
const check = (r: LabRunResult, id: string) => r.checks.find((c) => c.id === id)!;

describe("supported scenarios", () => {
  it("exposes exactly the engine's own six scenarios, each with a lab label", () => {
    expect(SCENARIO_DEFINITIONS.map((d) => d.kind).sort()).toEqual(Object.keys(LAB_SCENARIO_LABELS).sort());
  });

  it("states what the engine cannot model instead of faking it", () => {
    const text = LAB_NOT_MODELLED.join(" ").toLowerCase();
    for (const term of ["volume", "liquidity change", "price path"]) expect(text).toContain(term);
  });

  it("baseline: real, labelled, four filled trades with prices, impacts and reserves", () => {
    const r = run("normal_demand");
    expect(r.label).toBe("SIMULATION — OFF-CHAIN");
    expect(r.result.label).toBe("SIMULATED");
    expect(r.parameters.customised).toBe(false);
    expect(r.result.trades).toHaveLength(4);
    expect(r.result.trades.every((t) => t.label === "SIMULATED")).toBe(true);
    expect(r.result.startPriceUsd).toBeGreaterThan(0);
    expect(check(r, "simulation_output").status).toBe("pass");
    expect(check(r, "configuration").status).toBe("pass");
  });

  it("buy pressure: every trade fills and raises the quote reserve above the start", () => {
    const r = run("strong_buy_pressure");
    expect(r.result.trades.every((t) => t.side === "buy" && t.estimatedPriceImpactBps < SIMULATION_MAX_IMPACT_BPS)).toBe(true);
    for (const t of r.result.trades) expect(t.reserveQuoteAfter!).toBeGreaterThan(r.result.startQuoteReserveUsd!);
    expect(r.result.trades.map((t) => t.estimatedPriceImpactBps)).toEqual([...r.result.trades.map((t) => t.estimatedPriceImpactBps)].sort((a, b) => a - b));
  });

  it("sell pressure: sells now FILL (regression) and take the reserve below the start", () => {
    const r = run("strong_sell_pressure");
    expect(r.result.trades.every((t) => t.side === "sell")).toBe(true);
    expect(r.result.trades.filter((t) => t.estimatedPriceImpactBps >= SIMULATION_MAX_IMPACT_BPS)).toEqual([]);
    for (const t of r.result.trades) {
      expect(t.reserveQuoteAfter!).toBeLessThan(r.result.startQuoteReserveUsd!);
      expect(t.postTradePrice).toBeLessThan(r.result.startPriceUsd!);
    }
  });

  it("the sell fix did not change buy results (byte-identical to the standard run)", () => {
    const standard = runSimulation(params).scenarios.find((s) => s.scenario === "strong_buy_pressure")!;
    const lab = run("strong_buy_pressure").result;
    expect(lab.trades).toEqual(standard.trades);
  });

  it("every one of the six scenarios runs through the same engine without any RPC", () => {
    for (const d of SCENARIO_DEFINITIONS) expect(() => run(d.kind)).not.toThrow();
  });

  it("is deterministic for identical inputs", () => {
    const strip = (r: LabRunResult) => ({ ...r, runId: "x" });
    expect(strip(run("high_volatility"))).toEqual(strip(run("high_volatility")));
  });
});

describe("overrides and invalid input", () => {
  it("accepts a valid position and sides and marks the run customised", () => {
    const r = run("normal_demand", { curveProgressPct: 40, sides: ["sell", "sell", "buy", "buy"] });
    expect(r.parameters).toEqual({ curveProgressFraction: 0.4, sides: ["sell", "sell", "buy", "buy"], customised: true });
    expect(r.result.curveProgressFraction).toBe(0.4);
    expect(r.result.trades.map((t) => t.side)).toEqual(["sell", "sell", "buy", "buy"]);
  });

  it("a higher position on the curve means a higher start price", () => {
    expect(run("normal_demand", { curveProgressPct: 60 }).result.startPriceUsd!).toBeGreaterThan(run("normal_demand", { curveProgressPct: 10 }).result.startPriceUsd!);
  });

  it("explicitly passing the scenario's own values is not 'customised'", () => {
    expect(run("normal_demand", { curveProgressPct: 5 }).parameters.customised).toBe(false);
  });

  it.each([-1, 95.01, 100, Number.NaN, Number.POSITIVE_INFINITY])("rejects curve position %s", (pct) => {
    expect(() => resolveLabScenario({ scenario: "normal_demand", curveProgressPct: pct })).toThrow(LabParameterError);
  });

  it.each([[[]], [["buy", "buy", "buy"]], [["buy", "buy", "buy", "buy", "buy"]], [["buy", "hold", "buy", "buy"]]])("rejects sides %j", (sides) => {
    expect(() => resolveLabScenario({ scenario: "normal_demand", sides })).toThrow(LabParameterError);
  });

  it.each(["volume_increase", "liquidity_change", "", "__proto__", "NORMAL_DEMAND"])("rejects unsupported scenario %j — it is not approximated", (scenario) => {
    expect(() => resolveLabScenario({ scenario })).toThrow(UnsupportedScenarioError);
  });
});

describe("extreme values", () => {
  it("0% position works", () => {
    expect(() => run("normal_demand", { curveProgressPct: 0 })).not.toThrow();
  });

  it("95% position with all buys reports unfillable trades honestly instead of throwing or inventing prices", () => {
    const r = run("normal_demand", { curveProgressPct: 95, sides: ["buy", "buy", "buy", "buy"] });
    for (const t of r.result.trades) {
      if (t.estimatedPriceImpactBps >= SIMULATION_MAX_IMPACT_BPS) expect(t.reserveQuoteAfter).toBeNull();
      else expect(Number.isFinite(t.reserveQuoteAfter!)).toBe(true);
    }
    expect(check(r, "simulation_output").status).toBe("pass");
  });

  it("an oversized sell at a thin position is flagged unfillable, not filled", () => {
    const r = run("low_liquidity", { sides: ["sell", "sell", "sell", "sell"] });
    expect(r.result.trades.at(-1)!.estimatedPriceImpactBps).toBe(SIMULATION_MAX_IMPACT_BPS);
    expect(check(r, "fillable").status).toBe("warn");
    expect(r.warnings.some((w) => w.startsWith("Not fillable"))).toBe(true);
  });
});

describe("risk integration", () => {
  it("passes a clean scenario and marks live-only indicators DATA UNAVAILABLE", () => {
    const r = run("strong_buy_pressure");
    expect(check(r, "price_impact").status).not.toBe("fail");
    expect(check(r, "live_indicators").status).toBe("unavailable");
    expect(check(r, "live_indicators").detail).toMatch(/need live market data/);
  });

  it("reports a configuration Meteora rejects as a failed check (the Growth candidate)", () => {
    const r = run("normal_demand", {}, () => growthParams, () => invalidCfg);
    expect(invalidCfg.status).toBe("invalid");
    expect(check(r, "configuration").status).toBe("fail");
    expect(check(r, "configuration").detail).toBe((invalidCfg as { error: string }).error);
    expect(check(r, "simulation_output").status).toBe("pass"); // the simulation itself still ran
  });

  it("reports an unavailable validation as unavailable, never as a pass", () => {
    const r = run("normal_demand", {}, () => params, () => ({ status: "unavailable", reason: "quote price down" }));
    expect(check(r, "configuration").status).toBe("unavailable");
  });

  it("applies the reused price-impact cutoff at its boundary (hand-edited engine result)", () => {
    const base = run("normal_demand").result;
    const withImpact = (bps: number): SimulationScenarioResult => ({ ...base, trades: base.trades.map((t, i) => (i === 3 ? { ...t, estimatedPriceImpactBps: bps } : { ...t, estimatedPriceImpactBps: 1 })) });
    const evalImpact = (bps: number) => evaluateLabRun({ result: withImpact(bps), configValidation: validCfg }).checks.find((c) => c.id === "price_impact")!;
    expect(evalImpact(PRICE_IMPACT_WATCH_BPS - 0.01).status).toBe("pass");
    expect(evalImpact(PRICE_IMPACT_WATCH_BPS).status).toBe("warn");
    expect(evalImpact(SIMULATION_MAX_IMPACT_BPS).status).toBe("pass"); // unfillable is reported by its own check, not double-counted
  });

  it("flags a liquidity decrease using the shared Market Health cutoff", () => {
    const r = run("strong_sell_pressure", {}, () => params);
    const big = { ...r.result, trades: r.result.trades.map((t, i) => (i === 3 ? { ...t, reserveQuoteAfter: r.result.startQuoteReserveUsd! * 0.5 } : t)) };
    const out = evaluateLabRun({ result: big, configValidation: validCfg });
    expect(out.checks.find((c) => c.id === "reserve_change")!.status).toBe("warn");
    expect(out.warnings.some((w) => w.startsWith("Liquidity decreased"))).toBe(true);
  });

  it("produces no score: only pass / warn / fail / unavailable", () => {
    const r = run("high_volatility");
    expect(r.checks.every((c) => ["pass", "warn", "fail", "unavailable"].includes(c.status))).toBe(true);
    expect(JSON.stringify(r)).not.toMatch(/"score"|riskScore/i);
  });
});

describe("graduation integration", () => {
  it("evaluates the single real DBC condition with the existing graduation logic", () => {
    const g = run("graduation_approach").graduation!;
    expect(g.label).toBe("SIMULATED GRADUATION STATE");
    expect(g.condition).toBe("quote_reserve_reaches_migration_threshold");
    expect(g.startPercentComplete).toBe(computeGraduationStatus(g.startQuoteReserveUsd, g.migrationThresholdUsd).percentageComplete);
    for (const t of g.trades) {
      if (t.reserveAfterUsd === null) expect(t.reachesThreshold).toBeNull();
      else expect(t.reachesThreshold).toBe(t.reserveAfterUsd >= g.migrationThresholdUsd);
    }
    expect(g.anyTradeReachesThreshold).toBe(g.trades.some((t) => t.reachesThreshold === true));
  });

  it("uses the threshold Meteora derives from the config, not the issuer's declared target", () => {
    const g = run("normal_demand").graduation!;
    expect(validCfg.status).toBe("valid");
    expect(g.migrationThresholdUsd).toBeCloseTo((validCfg as { derivedThresholdUsd: number }).derivedThresholdUsd, 0);
    expect(g.migrationThresholdUsd).not.toBe(profile.targetGraduationUsd);
  });

  it("does not claim a graduation condition is met early in the curve", () => {
    expect(run("low_liquidity").graduation!.anyTradeReachesThreshold).toBe(false);
  });

  it("is null (not invented) when the result predates reserve tracking", () => {
    const { startQuoteReserveUsd: _a, migrationThresholdUsd: _b, ...legacy } = run("normal_demand").result;
    expect(evaluateSimulatedGraduation(legacy as SimulationScenarioResult)).toBeNull();
  });
});

describe("missing data and simulation failure", () => {
  it("legacy results without reserves: reserve check is unavailable and no graduation state is shown", () => {
    const { startQuoteReserveUsd: _a, migrationThresholdUsd: _b, ...legacy } = run("normal_demand").result;
    const out = evaluateLabRun({ result: legacy as SimulationScenarioResult, configValidation: validCfg });
    expect(out.graduation).toBeNull();
    expect(out.checks.find((c) => c.id === "reserve_change")!.status).toBe("unavailable");
  });

  it.each([
    ["no trades", { trades: undefined }],
    ["wrong trade count", { trades: [] }],
    ["unlabelled", { label: "LIVE" }],
  ])("a malformed result (%s) is a failed output check with no derived values", (_name, patch) => {
    const bad = { ...run("normal_demand").result, ...patch } as unknown as SimulationScenarioResult;
    const out = evaluateLabRun({ result: bad, configValidation: validCfg });
    expect(out.checks.find((c) => c.id === "simulation_output")!.status).toBe("fail");
    expect(out.graduation).toBeNull();
    expect(out.checks.some((c) => c.id === "price_impact")).toBe(false);
  });

  it("a NaN in a trade fails validation rather than propagating", () => {
    const r = run("normal_demand").result;
    const bad = { ...r, trades: r.trades.map((t, i) => (i === 0 ? { ...t, estimatedPriceImpactBps: Number.NaN } : t)) };
    expect(evaluateLabRun({ result: bad, configValidation: validCfg }).checks.find((c) => c.id === "simulation_output")!.status).toBe("fail");
  });
});

describe("comparison", () => {
  it("compares runs of the same configuration using the same engine, with real metrics", () => {
    const runs = [run("normal_demand"), run("strong_buy_pressure"), run("strong_sell_pressure")];
    const c = compareLabRuns(runs);
    if (!c.compatible) throw new Error(c.reason);
    expect(c.runs.map((r) => r.label)).toEqual(["Baseline", "Buy pressure", "Sell pressure"]);
    for (const [i, row] of c.runs.entries()) {
      expect(row.worstImpactBps).toBe(runs[i]!.result.worstCasePriceImpactBps);
      expect(row.startPriceUsd).toBe(runs[i]!.result.startPriceUsd);
      expect(row.unfillableTrades).toBe(runs[i]!.result.trades.filter((t) => t.estimatedPriceImpactBps >= SIMULATION_MAX_IMPACT_BPS).length);
      expect(row.checkCounts.pass + row.checkCounts.warn + row.checkCounts.fail + row.checkCounts.unavailable).toBe(runs[i]!.checks.length);
    }
  });

  it("marks customised runs", () => {
    const c = compareLabRuns([run("normal_demand"), run("normal_demand", { curveProgressPct: 50 })]);
    expect(c.compatible && c.runs[1]!.label).toBe("Baseline (custom)");
  });

  it("refuses to compare different configurations (incompatible metrics)", () => {
    const c = compareLabRuns([run("normal_demand"), run("normal_demand", {}, () => growthParams, () => invalidCfg)]);
    expect(c).toEqual({ compatible: false, reason: expect.stringContaining("different curve configurations") });
  });

  it("needs at least two distinct runs", () => {
    const a = run("normal_demand");
    expect(compareLabRuns([a]).compatible).toBe(false);
    expect(compareLabRuns([a, a]).compatible).toBe(false);
    expect(compareLabRuns([]).compatible).toBe(false);
  });

  it("shows unavailable metrics as null, never as zero", () => {
    const a = run("normal_demand");
    const { startPriceUsd: _p, startQuoteReserveUsd: _s, migrationThresholdUsd: _m, ...legacy } = a.result;
    const b: LabRunResult = { ...a, runId: "legacy", result: legacy as SimulationScenarioResult, graduation: null };
    const c = compareLabRuns([a, b]);
    if (!c.compatible) throw new Error(c.reason);
    expect(c.runs[1]).toMatchObject({ startPriceUsd: null, startReservePercent: null, anyTradeReachesThreshold: null });
  });
});

describe("safety: simulation is off-chain", () => {
  it("runs entirely without touching the connection (any RPC call would throw)", () => {
    expect(() => run("graduation_approach")).not.toThrow();
    expect(() => runSimulation(params)).not.toThrow();
  });

  it("every value in a result is labelled simulated", () => {
    const r = run("high_volatility");
    expect(r.label).toBe("SIMULATION — OFF-CHAIN");
    expect(r.result.label).toBe("SIMULATED");
    expect(r.graduation?.label).toBe("SIMULATED GRADUATION STATE");
    expect(r.result.trades.every((t) => t.label === "SIMULATED")).toBe(true);
  });

  it("scenario kinds in results are only ones the engine defines", () => {
    const kinds: SimulationScenarioKind[] = SCENARIO_DEFINITIONS.map((d) => d.kind);
    expect(kinds).toContain(run("low_liquidity").scenario);
  });
});
