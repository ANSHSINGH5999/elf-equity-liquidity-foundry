import { describe, expect, it } from "vitest";
import { Connection } from "@solana/web3.js";
import { compileCurveCandidates } from "../../packages/market-engine/src/index.js";
import { buildConfigParametersFromCandidate } from "../../packages/meteora-adapter/src/index.js";
import { runSimulation } from "../../packages/simulation-engine/src/index.js";
import { TRADE_SIZES_USD, type MarketProfile, type TokenizedAsset } from "../../packages/shared/src/index.js";

const asset: TokenizedAsset = {
  id: "asset-1",
  name: "Acme Pre-IPO",
  symbol: "ACME",
  mintAddress: "So11111111111111111111111111111111111111112",
  issuer: "Acme Corp",
  assetType: "pre_ipo",
  referencePriceUsd: 10,
  source: "manual",
  createdAt: new Date().toISOString(),
};

// USDC quote avoids any live price-fetch network call in candidateToBuildCurveParams.
const profile: MarketProfile = {
  id: "profile-1",
  assetId: "asset-1",
  initialLiquidityUsd: 250_000,
  expectedVolatility: "medium",
  riskProfile: "balanced",
  targetLiquidityUsd: 500_000,
  targetGraduationUsd: 1_000_000,
  quoteToken: "USDC",
  createdAt: new Date().toISOString(),
};

// Never actually opens a socket — every quote call used here is pure math.
const connection = new Connection("http://127.0.0.1:8899");

describe("runSimulation", () => {
  it("produces all six scenarios, each labeled SIMULATED, each with four trade sizes", async () => {
    const candidate = compileCurveCandidates(asset, profile).find((c) => c.riskProfile === "balanced")!;
    const configParameters = await buildConfigParametersFromCandidate(candidate, profile);

    const run = runSimulation({ connection, candidate, profile, configParameters, quoteUsdPrice: 1 });

    expect(run.label).toBe("SIMULATED");
    expect(run.scenarios).toHaveLength(6);

    for (const scenario of run.scenarios) {
      expect(scenario.label).toBe("SIMULATED");
      expect(scenario.trades).toHaveLength(TRADE_SIZES_USD.length);
      for (const trade of scenario.trades) {
        expect(trade.label).toBe("SIMULATED");
        expect(trade.estimatedExecutionPrice).toBeGreaterThan(0);
        expect(trade.estimatedPriceImpactBps).toBeGreaterThanOrEqual(0);
        expect(Number.isFinite(trade.feeUsd)).toBe(true);
      }
    }
  });

  it("shows non-decreasing price impact as trade size grows, within each same-direction run of a scenario", async () => {
    // A monotonic bonding curve guarantees this regardless of exactly how
    // liquidity is distributed along the curve (which is Meteora's
    // internal curve-construction choice, not something ELF controls or
    // should assume a specific shape for) — a safer property to assert
    // than "deeper in the curve always means worse impact," which isn't
    // actually guaranteed by the DBC's liquidity distribution.
    const candidate = compileCurveCandidates(asset, profile).find((c) => c.riskProfile === "balanced")!;
    const configParameters = await buildConfigParametersFromCandidate(candidate, profile);
    const run = runSimulation({ connection, candidate, profile, configParameters, quoteUsdPrice: 1 });

    for (const scenario of run.scenarios) {
      let lastImpactBySide: Partial<Record<"buy" | "sell", number>> = {};
      for (const trade of scenario.trades) {
        const previous = lastImpactBySide[trade.side];
        if (previous !== undefined) {
          expect(trade.estimatedPriceImpactBps).toBeGreaterThanOrEqual(previous - 0.01);
        }
        lastImpactBySide = { ...lastImpactBySide, [trade.side]: trade.estimatedPriceImpactBps };
      }
    }
  });

  it("produces meaningfully different results across scenarios rather than one flat answer", async () => {
    const candidate = compileCurveCandidates(asset, profile).find((c) => c.riskProfile === "balanced")!;
    const configParameters = await buildConfigParametersFromCandidate(candidate, profile);
    const run = runSimulation({ connection, candidate, profile, configParameters, quoteUsdPrice: 1 });

    const worstCaseValues = new Set(run.scenarios.map((s) => s.worstCasePriceImpactBps));
    expect(worstCaseValues.size).toBeGreaterThan(1);
  });

  it("is deterministic for identical inputs", async () => {
    const candidate = compileCurveCandidates(asset, profile).find((c) => c.riskProfile === "balanced")!;
    const configParameters = await buildConfigParametersFromCandidate(candidate, profile);

    const runA = runSimulation({ connection, candidate, profile, configParameters, quoteUsdPrice: 1 });
    const runB = runSimulation({ connection, candidate, profile, configParameters, quoteUsdPrice: 1 });

    const stripVolatileIds = (run: typeof runA) => ({ ...run, id: "x", createdAt: "x" });
    expect(stripVolatileIds(runA)).toEqual(stripVolatileIds(runB));
  });
});
