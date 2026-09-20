import { beforeAll, describe, expect, it } from "vitest";
import { Connection } from "@solana/web3.js";
import {
  MIN_DEPLOYMENT_SOL,
  buildLaunchPlan,
  compileCurveCandidates,
  evaluateLaunchReadiness,
  evaluateSimulation,
  type LaunchReadinessInput,
} from "../../packages/market-engine/src/index.js";
import { buildConfigParametersFromCandidate, validateCandidateConfiguration } from "../../packages/meteora-adapter/src/index.js";
import { SCENARIO_DEFINITIONS, runSimulation } from "../../packages/simulation-engine/src/index.js";
import type { ConfigValidationResult, CurveCandidate, LaunchPlan, MarketProfile, TokenizedAsset } from "../../packages/shared/src/index.js";

/** Readiness is a pure function over real state; the plan comes from the real engines (same setup as launchPlan.test.ts). */
const asset: TokenizedAsset = {
  id: "asset-1", name: "Acme Pre-IPO", symbol: "ACME", mintAddress: "So11111111111111111111111111111111111111112",
  issuer: "Acme Corp", assetType: "pre_ipo", referencePriceUsd: 10, source: "manual", createdAt: "2026-09-20T00:00:00.000Z",
};
const profile: MarketProfile = {
  id: "profile-1", assetId: "asset-1", initialLiquidityUsd: 250_000, expectedVolatility: "medium", riskProfile: "balanced",
  targetLiquidityUsd: 500_000, targetGraduationUsd: 1_000_000, quoteToken: "USDC", createdAt: "2026-09-20T00:00:00.000Z",
};
const KINDS = SCENARIO_DEFINITIONS.map((d) => d.kind);

let candidate: CurveCandidate;
let growth: CurveCandidate;
let valid: ConfigValidationResult;
let invalid: ConfigValidationResult;
let scenarios: unknown;

beforeAll(async () => {
  const candidates = compileCurveCandidates(asset, profile);
  candidate = candidates.find((c) => c.riskProfile === "balanced")!;
  growth = candidates.find((c) => c.riskProfile === "growth")!;
  valid = await validateCandidateConfiguration(candidate, profile);
  invalid = await validateCandidateConfiguration(growth, profile);
  scenarios = runSimulation({
    connection: new Connection("http://127.0.0.1:8899"),
    candidate,
    profile,
    configParameters: await buildConfigParametersFromCandidate(candidate, profile),
    quoteUsdPrice: 1,
  }).scenarios;
}, 60_000);

const plan = (over: Partial<Parameters<typeof buildLaunchPlan>[0]> = {}): LaunchPlan =>
  buildLaunchPlan({ asset, profile, candidate, configValidation: valid, oracleFeeds: [], simulation: evaluateSimulation(scenarios, KINDS), ...over });

const ready = (over: Partial<LaunchReadinessInput> = {}): LaunchReadinessInput => ({
  network: { configuredCluster: "devnet", serverCluster: "devnet", serverClusterVerified: true, walletAssessment: "compatible", walletMessage: null },
  wallet: { connected: true, solBalance: 1.5, balanceProblem: null },
  plan: plan(),
  deployment: { state: "none" },
  ...over,
});
const item = (input: LaunchReadinessInput, id: string) => evaluateLaunchReadiness(input).items.find((i) => i.id === id)!;

describe("launch readiness", () => {
  it("valid launch: nothing blocks and the action is 'Ready for wallet approval'", () => {
    const r = evaluateLaunchReadiness(ready());
    expect(r.items.map((i) => i.id)).toEqual(["network", "wallet", "asset", "curve", "simulation", "meteora", "security", "deployment"]);
    // The real simulation's stress scenarios can hit the impact cap; that is a warning about the curve, not a blocker.
    for (const i of r.items) expect(i.id === "simulation" ? ["pass", "warn"] : ["pass"]).toContain(i.status);
    expect(r.ready).toBe(true);
    expect(r.action).toBe("Ready for wallet approval");
  });

  it("a simulation with unfillable trades warns and says so; one without them passes", () => {
    const real = evaluateLaunchReadiness(ready()).items.find((i) => i.id === "simulation")!;
    if (real.status === "warn") expect(real.detail).toMatch(/price-impact cap/);

    const scenario = (kind: (typeof KINDS)[number], unfillableTrades: number) => ({ scenario: kind, description: "d", worstCasePriceImpactBps: 10, unfillableTrades });
    const clean = plan({ simulation: { status: "completed", label: "SIMULATED", scenarios: KINDS.map((k) => scenario(k, 0)) } });
    expect(item(ready({ plan: clean }), "simulation").status).toBe("pass");
    const capped = plan({ simulation: { status: "completed", label: "SIMULATED", scenarios: KINDS.map((k, n) => scenario(k, n === 0 ? 2 : 0)) } });
    expect(item(ready({ plan: capped }), "simulation").status).toBe("warn");
  });

  it("the security item is labelled as by-design, never as measured", () => {
    expect(item(ready(), "security").basis).toBe("design");
    expect(item(ready(), "network").basis).toBe("measured");
  });

  it("insufficient SOL blocks and names the real balance and the minimum", () => {
    const r = evaluateLaunchReadiness(ready({ wallet: { connected: true, solBalance: 0.01, balanceProblem: null } }));
    expect(r.ready).toBe(false);
    const wallet = r.items.find((i) => i.id === "wallet")!;
    expect(wallet.status).toBe("fail");
    expect(wallet.detail).toContain("0.01 SOL");
    expect(wallet.detail).toContain(String(MIN_DEPLOYMENT_SOL));
    expect(r.action).toMatch(/^Not ready — Wallet:/);
  });

  it("an unreadable SOL balance is 'unavailable', never treated as zero or as enough", () => {
    const r = evaluateLaunchReadiness(ready({ wallet: { connected: true, solBalance: null, balanceProblem: "rate_limited" } }));
    expect(r.items.find((i) => i.id === "wallet")).toMatchObject({ status: "unavailable" });
    expect(r.ready).toBe(false);
  });

  it("wrong wallet network blocks with the wallet's own message", () => {
    const r = evaluateLaunchReadiness(ready({ network: { configuredCluster: "devnet", serverCluster: "devnet", serverClusterVerified: true, walletAssessment: "mismatch", walletMessage: "The wallet is on Mainnet." } }));
    expect(r.items.find((i) => i.id === "wallet")).toMatchObject({ status: "fail", detail: "The wallet is on Mainnet." });
    expect(r.ready).toBe(false);
  });

  it("server/browser cluster mismatch blocks at the network item", () => {
    const r = evaluateLaunchReadiness(ready({ network: { configuredCluster: "devnet", serverCluster: "mainnet-beta", serverClusterVerified: true, walletAssessment: "compatible", walletMessage: null } }));
    expect(r.items[0]).toMatchObject({ id: "network", status: "fail" });
    expect(r.ready).toBe(false);
  });

  it("a server RPC that failed its genesis check blocks; an unknown server network is 'unavailable'", () => {
    expect(item(ready({ network: { configuredCluster: "devnet", serverCluster: "devnet", serverClusterVerified: false, walletAssessment: "compatible", walletMessage: null } }), "network").status).toBe("fail");
    expect(item(ready({ network: { configuredCluster: "devnet", serverCluster: null, serverClusterVerified: null, walletAssessment: "compatible", walletMessage: null } }), "network").status).toBe("unavailable");
  });

  it("wallet disconnected blocks", () => {
    const r = evaluateLaunchReadiness(ready({ wallet: { connected: false, solBalance: null, balanceProblem: null }, network: { configuredCluster: "devnet", serverCluster: "devnet", serverClusterVerified: true, walletAssessment: null, walletMessage: null } }));
    expect(r.items.find((i) => i.id === "wallet")).toMatchObject({ status: "fail", detail: "No wallet is connected." });
    expect(r.ready).toBe(false);
  });

  it("an unverifiable wallet network is only a warning (the approval step still guards signing)", () => {
    const r = evaluateLaunchReadiness(ready({ network: { configuredCluster: "devnet", serverCluster: "devnet", serverClusterVerified: true, walletAssessment: "unverifiable", walletMessage: "x" } }));
    expect(r.items.find((i) => i.id === "wallet")!.status).toBe("warn");
    expect(r.ready).toBe(true);
  });

  it("an invalid curve configuration (Meteora rejects it) blocks at the Meteora item", () => {
    expect(invalid.status).toBe("invalid");
    const r = evaluateLaunchReadiness(ready({ plan: plan({ candidate: growth, configValidation: invalid }) }));
    expect(r.items.find((i) => i.id === "meteora")!.status).toBe("fail");
    expect(r.ready).toBe(false);
  });

  it("a curve with no valid starting price blocks at the curve item", () => {
    const bad = plan();
    bad.curve.impliedStartPriceUsd = 0;
    expect(item(ready({ plan: bad }), "curve").status).toBe("fail");
  });

  it("simulation not run blocks, and its detail carries the off-chain label", () => {
    const i = item(ready({ plan: plan({ simulation: { status: "not_run" } }) }), "simulation");
    expect(i.status).toBe("fail");
    expect(i.detail).toContain("Simulation — no blockchain transaction is executed.");
  });

  it("a failed (invalid) simulation blocks and reports the reasons", () => {
    const i = item(ready({ plan: plan({ simulation: { status: "invalid", reasons: ["scenario missing"] } }) }), "simulation");
    expect(i.status).toBe("fail");
    expect(i.detail).toContain("scenario missing");
  });

  it("already deployed blocks with the pool address; in-progress only warns", () => {
    const deployed = evaluateLaunchReadiness(ready({ deployment: { state: "deployed", poolAddress: "PoolAddr111" } }));
    expect(deployed.items.find((i) => i.id === "deployment")).toMatchObject({ status: "fail" });
    expect(deployed.items.find((i) => i.id === "deployment")!.detail).toContain("PoolAddr111");
    expect(deployed.ready).toBe(false);

    const resuming = evaluateLaunchReadiness(ready({ deployment: { state: "in_progress" } }));
    expect(resuming.items.find((i) => i.id === "deployment")!.status).toBe("warn");
    expect(resuming.ready).toBe(true);
  });

  it("no plan yet: plan-derived items are unavailable and the launch is not ready", () => {
    const r = evaluateLaunchReadiness(ready({ plan: null }));
    for (const id of ["asset", "curve", "simulation", "meteora"]) expect(r.items.find((i) => i.id === id)!.status).toBe("unavailable");
    expect(r.ready).toBe(false);
  });

  it("is pure and deterministic", () => {
    const input = ready();
    const snapshot = JSON.stringify(input);
    expect(evaluateLaunchReadiness(input)).toEqual(evaluateLaunchReadiness(input));
    expect(JSON.stringify(input)).toBe(snapshot);
  });
});
