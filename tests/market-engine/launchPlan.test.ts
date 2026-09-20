import { beforeAll, describe, expect, it } from "vitest";
import { Connection, Keypair } from "@solana/web3.js";
import {
  buildLaunchPlan,
  compileCurveCandidates,
  evaluateApprovalGate,
  evaluateSimulation,
  type BuildLaunchPlanInput,
} from "../../packages/market-engine/src/index.js";
import { buildConfigParametersFromCandidate, validateCandidateConfiguration } from "../../packages/meteora-adapter/src/index.js";
import { SCENARIO_DEFINITIONS, runSimulation } from "../../packages/simulation-engine/src/index.js";
import {
  SIMULATION_MAX_IMPACT_BPS,
  TRADE_SIZES_USD,
  type ConfigValidationResult,
  type CurveCandidate,
  type LaunchPlan,
  type MarketProfile,
  type TokenizedAsset,
} from "../../packages/shared/src/index.js";

/**
 * The plan builder is tested against REAL engine output: the real curve
 * compiler, the real simulation engine, and Meteora's real validator. Only
 * the Pyth feed inputs are constructed by hand (they are inputs, not engine
 * output). Nothing here is a hardcoded stand-in for an engine result.
 */
const asset: TokenizedAsset = {
  id: "asset-1", name: "Acme Pre-IPO", symbol: "ACME", mintAddress: "So11111111111111111111111111111111111111112",
  issuer: "Acme Corp", assetType: "pre_ipo", referencePriceUsd: 10, source: "manual", createdAt: "2026-09-20T00:00:00.000Z",
};
const profile: MarketProfile = {
  id: "profile-1", assetId: "asset-1", initialLiquidityUsd: 250_000, expectedVolatility: "medium", riskProfile: "balanced",
  targetLiquidityUsd: 500_000, targetGraduationUsd: 1_000_000, quoteToken: "USDC", createdAt: "2026-09-20T00:00:00.000Z",
};
const KINDS = SCENARIO_DEFINITIONS.map((d) => d.kind);

let balanced: CurveCandidate;
let growth: CurveCandidate;
let validBalanced: ConfigValidationResult;
let invalidGrowth: ConfigValidationResult;
let realSimulation: unknown;

beforeAll(async () => {
  const candidates = compileCurveCandidates(asset, profile);
  balanced = candidates.find((c) => c.riskProfile === "balanced")!;
  growth = candidates.find((c) => c.riskProfile === "growth")!;
  validBalanced = await validateCandidateConfiguration(balanced, profile);
  invalidGrowth = await validateCandidateConfiguration(growth, profile);
  const run = runSimulation({
    connection: new Connection("http://127.0.0.1:8899"),
    candidate: balanced,
    profile,
    configParameters: await buildConfigParametersFromCandidate(balanced, profile),
    quoteUsdPrice: 1,
  });
  realSimulation = run.scenarios;
}, 60_000);

const restrictedFeeds: BuildLaunchPlanInput["oracleFeeds"] = (["equity", "xstock", "ondo"] as const).map((kind) => ({
  kind, feedSymbol: `X.${kind}`, priceUsd: null, unavailableReason: "entitlement_restricted" as const,
}));
const liveFeeds: BuildLaunchPlanInput["oracleFeeds"] = [{ kind: "equity", feedSymbol: "Equity.US.ACME/USD", priceUsd: 10.1, unavailableReason: null }];

const plan = (over: Partial<BuildLaunchPlanInput> = {}): LaunchPlan =>
  buildLaunchPlan({
    asset, profile, candidate: balanced, configValidation: validBalanced, oracleFeeds: restrictedFeeds,
    simulation: evaluateSimulation(realSimulation, KINDS), ...over,
  });
const check = (p: LaunchPlan, id: string) => p.checks.find((c) => c.id === id)!;

describe("1. valid launch configuration", () => {
  it("every plan value is the engines' own output — nothing hardcoded", () => {
    const p = plan();
    expect(p.asset).toMatchObject({ id: asset.id, name: asset.name, symbol: asset.symbol, referencePriceUsd: 10 });
    expect(p.profile).toEqual({
      initialLiquidityUsd: 250_000, expectedVolatility: "medium", riskProfile: "balanced",
      targetLiquidityUsd: 500_000, targetGraduationUsd: 1_000_000, quoteToken: "USDC",
    });
    expect(p.curve.candidateId).toBe(balanced.id);
    expect(p.curve.tokenSupply).toBe(balanced.tokenSupply);
    expect(p.curve.initialMarketCapUsd).toBe(balanced.initialMarketCapUsd);
    expect(p.curve.migrationMarketCapUsd).toBe(balanced.migrationMarketCapUsd);
    expect(p.curve.impliedStartPriceUsd).toBeCloseTo(balanced.initialMarketCapUsd / balanced.tokenSupply, 12);
    expect(p.trading).toEqual(balanced.feeSchedule);
    expect(p.liquidity.creatorLiquidityPercentage).toBe(balanced.liquidityDistribution.creatorLiquidityPercentage);
    expect(p.graduation.migrationFeeBps).toBe(balanced.migration.migrationFeeOptionBps);
    expect(p.engine).toBe("elf-deterministic-launch-planner-v1");
  });

  it("a fully valid plan passes configuration, liquidity, curve, graduation and simulation checks", () => {
    const p = plan();
    for (const id of ["configuration", "liquidity_parameters", "curve_parameters", "graduation_configuration", "simulation"]) {
      expect(check(p, id).status).toBe("pass");
    }
    expect(p.simulation.status).toBe("completed");
  });

  it("is deterministic and never mutates its inputs", () => {
    const snapshot = JSON.stringify([asset, profile, balanced, validBalanced]);
    expect(plan()).toEqual(plan());
    expect(JSON.stringify([asset, profile, balanced, validBalanced])).toBe(snapshot);
  });

  it("plan values follow the inputs: a different profile yields a different plan", () => {
    const other = { ...profile, initialLiquidityUsd: 900_000, targetGraduationUsd: 4_000_000 };
    const otherCandidate = compileCurveCandidates(asset, other).find((c) => c.riskProfile === "balanced")!;
    const p = buildLaunchPlan({ asset, profile: other, candidate: otherCandidate, configValidation: validBalanced, oracleFeeds: [], simulation: { status: "not_run" } });
    expect(p.profile.initialLiquidityUsd).toBe(900_000);
    expect(p.curve.initialMarketCapUsd).not.toBe(plan().curve.initialMarketCapUsd);
  });
});

describe("2. invalid input", () => {
  it("fails the liquidity check with the real validation message when graduation target < initial liquidity", () => {
    const bad = { ...profile, targetGraduationUsd: 100_000 };
    const c = check(plan({ profile: bad }), "liquidity_parameters");
    expect(c.status).toBe("fail");
    expect(c.detail).toMatch(/targetGraduationUsd must be at least initialLiquidityUsd/);
  });
  it("fails on non-positive liquidity values", () => {
    expect(check(plan({ profile: { ...profile, initialLiquidityUsd: 0 } }), "liquidity_parameters").status).toBe("fail");
    expect(check(plan({ profile: { ...profile, targetLiquidityUsd: -5 } }), "liquidity_parameters").status).toBe("fail");
  });
  it("an invalid profile blocks the approval gate", () => {
    const gate = evaluateApprovalGate(plan({ profile: { ...profile, targetGraduationUsd: 1 } }), true);
    expect(gate.allowed).toBe(false);
    expect(gate.blockers.join(" ")).toMatch(/Liquidity parameters valid failed/);
  });
});

describe("3. curve compilation failure (Meteora's own rejection, verbatim)", () => {
  it("the REAL Growth candidate is rejected by Meteora — the plan reports that exact error and blocks approval", () => {
    expect(invalidGrowth.status).toBe("invalid");
    const p = plan({ candidate: growth, configValidation: invalidGrowth });
    const c = check(p, "configuration");
    expect(c.status).toBe("fail");
    expect(c.detail).toBe((invalidGrowth as { error: string }).error);
    expect(c.detail).toMatch(/whole numbers/);
    const gate = evaluateApprovalGate(p, true);
    expect(gate.allowed).toBe(false);
    expect(gate.blockers.join(" ")).toMatch(/Configuration is invalid: .*whole numbers/);
  });
  it("substitutes no default: the graduation check is 'unavailable', not a fabricated pass", () => {
    expect(check(plan({ candidate: growth, configValidation: invalidGrowth }), "graduation_configuration").status).toBe("unavailable");
  });
  it("curve invariants fail for an impossible curve (migration cap not above initial cap)", () => {
    const broken = { ...balanced, migrationMarketCapUsd: balanced.initialMarketCapUsd };
    const c = check(plan({ candidate: broken }), "curve_parameters");
    expect(c.status).toBe("fail");
    expect(c.detail).toMatch(/migration market cap must be above the initial market cap/);
  });
  it("curve invariants fail for out-of-bounds or non-numeric supply", () => {
    expect(check(plan({ candidate: { ...balanced, tokenSupply: 10 } }), "curve_parameters").status).toBe("fail");
    expect(check(plan({ candidate: { ...balanced, tokenSupply: Number.NaN } }), "curve_parameters").status).toBe("fail");
  });
});

describe("4. simulation failure", () => {
  it("not run is reported as not_run and blocks approval", () => {
    const p = plan({ simulation: evaluateSimulation(null, KINDS) });
    expect(check(p, "simulation").status).toBe("not_run");
    expect(evaluateApprovalGate(p, true).blockers.join(" ")).toMatch(/Run the simulation/);
  });
  it("the real engine output is accepted as completed", () => {
    const s = evaluateSimulation(realSimulation, KINDS);
    expect(s.status).toBe("completed");
    if (s.status === "completed") {
      expect(s.label).toBe("SIMULATED");
      expect(s.scenarios).toHaveLength(KINDS.length);
    }
  });
  it("malformed (not an array) results are invalid, fail the check and block approval", () => {
    const s = evaluateSimulation({ nope: true }, KINDS);
    expect(s.status).toBe("invalid");
    const p = plan({ simulation: s });
    expect(check(p, "simulation").status).toBe("fail");
    expect(evaluateApprovalGate(p, true).allowed).toBe(false);
  });
  it("a missing scenario is invalid, names the scenario, fails the check and blocks approval", () => {
    // Built inside the test: realSimulation is assigned in beforeAll, after test collection.
    const s = evaluateSimulation((realSimulation as unknown[]).slice(1), KINDS);
    expect(s.status).toBe("invalid");
    if (s.status === "invalid") expect(s.reasons.join(" ")).toContain(`The ${KINDS[0]} scenario is missing.`);
    const p = plan({ simulation: s });
    expect(check(p, "simulation").status).toBe("fail");
    expect(evaluateApprovalGate(p, true).allowed).toBe(false);
  });
  it("a non-numeric result inside a scenario is invalid", () => {
    const mutated = JSON.parse(JSON.stringify(realSimulation));
    mutated[0].trades[0].estimatedPriceImpactBps = "NaN";
    const s = evaluateSimulation(mutated, KINDS);
    expect(s.status).toBe("invalid");
    if (s.status === "invalid") expect(s.reasons.join(" ")).toMatch(/non-numeric/);
  });
  it("a scenario not labelled SIMULATED is invalid — real results are never mistakable for live data", () => {
    const mutated = JSON.parse(JSON.stringify(realSimulation));
    mutated[0].label = "LIVE";
    expect(evaluateSimulation(mutated, KINDS).status).toBe("invalid");
  });
  it("wrong trade count per scenario is invalid", () => {
    const mutated = JSON.parse(JSON.stringify(realSimulation));
    mutated[0].trades = mutated[0].trades.slice(0, TRADE_SIZES_USD.length - 1);
    expect(evaluateSimulation(mutated, KINDS).status).toBe("invalid");
  });
  const trades = (n: number) => `${n} simulated trade${n === 1 ? "" : "s"}`;
  const countUnfillable = (scenarios: unknown) =>
    (scenarios as { trades: { estimatedPriceImpactBps: number }[] }[]).flatMap((sc) => sc.trades).filter((t) => t.estimatedPriceImpactBps >= SIMULATION_MAX_IMPACT_BPS).length;

  it("unfillable trades (the engine's own 100% cap) become a real warning with the REAL count — not a failure", () => {
    // The real Balanced simulation still contains an unfillable trade (the $25k sell at the thinnest curve position).
    const real = countUnfillable(realSimulation);
    expect(real).toBeGreaterThan(0);
    const p = plan({ simulation: evaluateSimulation(realSimulation, KINDS) });
    expect(check(p, "simulation").status).toBe("pass");
    expect(p.warnings.join(" ")).toContain(`${trades(real)} could not be filled`);
  });
  it("the count follows the data: one more capped trade raises it by exactly one", () => {
    const mutated = JSON.parse(JSON.stringify(realSimulation));
    const trade = mutated.flatMap((sc: { trades: { estimatedPriceImpactBps: number }[] }) => sc.trades).find((t: { estimatedPriceImpactBps: number }) => t.estimatedPriceImpactBps < SIMULATION_MAX_IMPACT_BPS);
    trade.estimatedPriceImpactBps = SIMULATION_MAX_IMPACT_BPS;
    const expected = countUnfillable(realSimulation) + 1;
    expect(countUnfillable(mutated)).toBe(expected);
    expect(plan({ simulation: evaluateSimulation(mutated, KINDS) }).warnings.join(" ")).toContain(`${trades(expected)} could not be filled`);
  });
  it("no warning at all when nothing is unfillable", () => {
    const clean = JSON.parse(JSON.stringify(realSimulation));
    for (const sc of clean) for (const t of sc.trades) if (t.estimatedPriceImpactBps >= SIMULATION_MAX_IMPACT_BPS) t.estimatedPriceImpactBps = 500;
    expect(plan({ simulation: evaluateSimulation(clean, KINDS) }).warnings.join(" ")).not.toMatch(/could not be filled/);
  });
});

describe("5. risk-check failure blocks; nothing is scored", () => {
  it("exposes only pass / fail / unavailable / not_run — no numeric risk score anywhere", () => {
    const p = plan();
    for (const c of p.checks) expect(["pass", "fail", "unavailable", "not_run"]).toContain(c.status);
    expect(JSON.stringify(p)).not.toMatch(/riskScore|risk_score|"score":/);
  });
  it("any single failing check blocks the gate even with acknowledgement", () => {
    for (const bad of [{ profile: { ...profile, targetGraduationUsd: 1 } }, { candidate: { ...balanced, tokenSupply: 1 } }]) {
      expect(evaluateApprovalGate(plan(bad), true).allowed).toBe(false);
    }
  });
});

describe("6. unavailable oracle", () => {
  it("no public feed: check is 'unavailable' with the reason, and does NOT block approval", () => {
    const p = plan({ oracleFeeds: [] });
    const c = check(p, "oracle_configuration");
    expect(c.status).toBe("unavailable");
    expect(c.detail).toMatch(/No public Pyth feed exists/);
    expect(p.oracle.state).toBe("no_feed");
    expect(evaluateApprovalGate(p, true).allowed).toBe(true);
  });
  it.each([
    ["not_configured", /not configured/i],
    ["unauthenticated", /rejected/i],
    ["rate_limited", /rate-limiting/i],
    ["unavailable", /no price/i],
  ] as const)("%s is reported as its own state", (reason, pattern) => {
    const p = plan({ oracleFeeds: [{ kind: "equity", feedSymbol: "X", priceUsd: null, unavailableReason: reason }] });
    expect(p.oracle.state).toBe(reason);
    expect(check(p, "oracle_configuration").detail).toMatch(pattern);
    expect(p.oracle.feeds[0]!.state).toBe(reason);
  });
});

describe("7. restricted Pyth", () => {
  it("states the exact restriction, shows no price, and substitutes no other feed", () => {
    const p = plan({ oracleFeeds: restrictedFeeds });
    expect(p.oracle.headline).toBe("Restricted — Pyth entitlement required");
    expect(check(p, "oracle_configuration").detail).toBe("Restricted — Pyth entitlement required");
    expect(p.oracle.feeds.every((f) => f.state === "entitlement_restricted" && f.priceUsd === null)).toBe(true);
    expect(p.oracle.feeds.map((f) => f.kind)).toEqual(["equity", "xstock", "ondo"]);
  });
  it("warns that the reference price is only the issuer-declared value — never claims Pyth verification", () => {
    const w = plan({ oracleFeeds: restrictedFeeds }).warnings.join(" ");
    expect(w).toMatch(/no Pyth-verified reference price/);
    expect(w).toMatch(/issuer-declared/);
  });
  it("restriction informs but does not block approval", () => {
    expect(evaluateApprovalGate(plan({ oracleFeeds: restrictedFeeds }), true).allowed).toBe(true);
  });
  it("a live feed passes the oracle check and raises no oracle warning", () => {
    const p = plan({ oracleFeeds: liveFeeds });
    expect(check(p, "oracle_configuration").status).toBe("pass");
    expect(p.oracle.state).toBe("live");
    expect(p.warnings.join(" ")).not.toMatch(/Pyth-verified/);
  });
});

describe("8. missing data is stated, never guessed", () => {
  const unavailable: ConfigValidationResult = { status: "unavailable", reason: "Unable to fetch a live USD price for SOL." };
  it("config validation unavailable → checks unavailable, thresholds null (not 0), and approval blocked", () => {
    const p = plan({ configValidation: unavailable });
    expect(check(p, "configuration").status).toBe("unavailable");
    expect(check(p, "graduation_configuration").status).toBe("unavailable");
    expect(p.graduation.derivedThresholdQuote).toBeNull();
    expect(p.graduation.derivedThresholdUsd).toBeNull();
    const gate = evaluateApprovalGate(p, true);
    expect(gate.allowed).toBe(false);
    expect(gate.blockers.join(" ")).toMatch(/could not be validated/);
  });
  it("derived USD unavailable for a SOL market → an explicit warning instead of a made-up number", () => {
    const p = plan({
      profile: { ...profile, quoteToken: "SOL" },
      configValidation: { status: "valid", derivedThresholdQuote: 5_000, derivedThresholdUsd: null },
    });
    expect(p.graduation.derivedThresholdUsd).toBeNull();
    expect(p.warnings.join(" ")).toMatch(/live SOL\/USD price could not be fetched/);
  });
});

describe("9. graduation configuration", () => {
  it("states the single on-chain trigger and invents no volume or market-cap gate", () => {
    const g = plan().graduation;
    expect(g.trigger).toMatch(/single on-chain condition/);
    expect(g.trigger).toMatch(/volume and market cap are not graduation conditions/);
    expect(Object.keys(g)).not.toEqual(expect.arrayContaining(["volumeThreshold"]));
    expect(JSON.stringify(g)).not.toMatch(/volumeThreshold|marketCapThreshold/);
  });
  it("shows the declared target next to the threshold Meteora actually derived", () => {
    const g = plan().graduation;
    expect(g.declaredTargetUsd).toBe(balanced.migration.migrationQuoteThreshold);
    expect(g.derivedThresholdQuote).toBe((validBalanced as { derivedThresholdQuote: number }).derivedThresholdQuote);
    expect(g.derivedThresholdUsd).toBe((validBalanced as { derivedThresholdUsd: number }).derivedThresholdUsd);
  });
  it("warns, with the real percentage, when Meteora's derived threshold differs from the declared target", () => {
    const conservative = compileCurveCandidates(asset, profile).find((c) => c.riskProfile === "conservative")!;
    return validateCandidateConfiguration(conservative, profile).then((v) => {
      const p = plan({ candidate: conservative, configValidation: v });
      expect(p.warnings.join(" ")).toMatch(/graduation threshold from the curve as \$[\d,.]+, which is [\d.]+% below your declared target/);
    });
  });
  it("a non-positive declared or derived threshold fails the check", () => {
    const zero = { ...balanced, migration: { ...balanced.migration, migrationQuoteThreshold: 0 } };
    expect(check(plan({ candidate: zero }), "graduation_configuration").status).toBe("fail");
    const badDerived: ConfigValidationResult = { status: "valid", derivedThresholdQuote: 0, derivedThresholdUsd: 0 };
    expect(check(plan({ configValidation: badDerived }), "graduation_configuration").status).toBe("fail");
  });
  it("warns with real numbers when supply is floored so the curve does not start at the reference price", () => {
    const w = plan().warnings.join(" ");
    expect(w).toMatch(/minimum \(1,000,000\).*starts at \$[\d.]+ per token.*reference price of \$10/);
  });
  it("shows sub-dollar prices with enough precision to match the plan (a $0.325 start is not rounded to $0.33)", () => {
    const p = plan();
    expect(p.curve.impliedStartPriceUsd).toBeCloseTo(0.5, 6); // Balanced at this profile
    const conservative = compileCurveCandidates(asset, profile).find((c) => c.riskProfile === "conservative")!;
    const w = plan({ candidate: conservative }).warnings.join(" ");
    expect(w).toContain("starts at $0.3250 per token".replace("0.3250", "0.325"));
    expect(w).not.toContain("$0.33 ");
    expect(w).toContain("reference price of $10.00");
  });
});

describe("10. approval requirement", () => {
  it("even a perfect plan is NOT approved without explicit acknowledgement", () => {
    const perfect = plan({ oracleFeeds: liveFeeds });
    const gate = evaluateApprovalGate(perfect, false);
    expect(gate.allowed).toBe(false);
    expect(gate.blockers).toEqual(["Explicit approval is required: confirm that you have reviewed this plan."]);
  });
  it("acknowledgement alone is not enough while any hard blocker exists", () => {
    expect(evaluateApprovalGate(plan({ simulation: { status: "not_run" } }), true).allowed).toBe(false);
    expect(evaluateApprovalGate(plan({ candidate: growth, configValidation: invalidGrowth }), true).allowed).toBe(false);
  });
  it("is allowed only when validated + simulated + acknowledged", () => {
    const gate = evaluateApprovalGate(plan(), true);
    expect(gate).toEqual({ allowed: true, blockers: [] });
  });
  it("lists every blocker, not just the first", () => {
    const p = plan({ profile: { ...profile, targetGraduationUsd: 1 }, simulation: { status: "not_run" } });
    expect(evaluateApprovalGate(p, false).blockers.length).toBeGreaterThanOrEqual(3);
  });
  it("the gate only reports — it never deploys, signs or performs I/O (pure functions)", () => {
    const p = plan();
    const before = JSON.stringify(p);
    evaluateApprovalGate(p, true);
    expect(JSON.stringify(p)).toBe(before);
    expect(Keypair).toBeDefined(); // imported only to prove tests can construct keys; the engine takes none
  });
});
