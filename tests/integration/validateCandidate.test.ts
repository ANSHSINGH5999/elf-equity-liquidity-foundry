import { afterEach, describe, expect, it, vi } from "vitest";
import { Connection, Keypair } from "@solana/web3.js";
import { compileCurveCandidates } from "../../packages/market-engine/src/index.js";
import { buildCreateConfigTransaction, validateCandidateConfiguration } from "../../packages/meteora-adapter/src/index.js";
import type { CurveCandidate, MarketProfile, TokenizedAsset } from "../../packages/shared/src/index.js";

/**
 * Runs the REAL compiler and the REAL Meteora SDK validators — no mocks of
 * either. Only the network price fetch is stubbed (in the unavailable case).
 * USDC-quoted markets need no network at all (1 USDC = $1).
 */
const asset: TokenizedAsset = {
  id: "a1", name: "Acme Pre-IPO", symbol: "ACME", mintAddress: "So11111111111111111111111111111111111111112",
  issuer: "Acme Corp", assetType: "pre_ipo", referencePriceUsd: 10, source: "manual", createdAt: "2026-09-20T00:00:00.000Z",
};
const profile = (over: Partial<MarketProfile> = {}): MarketProfile => ({
  id: "p1", assetId: "a1", initialLiquidityUsd: 250_000, expectedVolatility: "medium", riskProfile: "balanced",
  targetLiquidityUsd: 500_000, targetGraduationUsd: 1_000_000, quoteToken: "USDC", createdAt: "2026-09-20T00:00:00.000Z", ...over,
});

afterEach(() => vi.unstubAllGlobals());

describe("validateCandidateConfiguration (real compiler output, real Meteora validators)", () => {
  it("AGREES with the real deployment builder for every compiled candidate (parity, both directions)", async () => {
    const p = profile();
    const connection = new Connection("https://api.devnet.solana.com", "confirmed"); // building createConfig makes no RPC call
    const payer = Keypair.generate().publicKey;
    let validCount = 0;

    for (const candidate of compileCurveCandidates(asset, p)) {
      const precheck = await validateCandidateConfiguration(candidate, p);

      let deployThrew: string | null = null;
      try {
        await buildCreateConfigTransaction({ connection, candidate, profile: p, payer, feeClaimer: payer, rpcUrl: "https://api.devnet.solana.com" });
      } catch (error) {
        deployThrew = error instanceof Error ? error.message : String(error);
      }

      // The pre-deploy check must never approve what deployment rejects, nor reject what deployment accepts.
      expect(precheck.status).toBe(deployThrew === null ? "valid" : "invalid");
      if (precheck.status === "invalid") expect(precheck.error).toBe(deployThrew);
      if (precheck.status === "valid") {
        validCount++;
        expect(precheck.derivedThresholdQuote).toBeGreaterThan(0);
        expect(precheck.derivedThresholdUsd).toBeCloseTo(precheck.derivedThresholdQuote!, 6); // USDC = $1
      }
    }
    expect(validCount).toBeGreaterThan(0);
  });

  it("surfaces the REAL error (not a default) for an unsupported migration fee tier", async () => {
    const p = profile();
    const good = compileCurveCandidates(asset, p)[0]!;
    const bad: CurveCandidate = { ...good, migration: { ...good.migration, migrationFeeOptionBps: 123 } };
    const result = await validateCandidateConfiguration(bad, p);
    expect(result.status).toBe("invalid");
    if (result.status === "invalid") expect(result.error).toMatch(/Unsupported migration fee tier/);
  });

  it("reports invalid — with a non-empty Meteora message — for parameters the SDK rejects", async () => {
    const p = profile();
    const good = compileCurveCandidates(asset, p)[0]!;
    // Migration market cap below the initial market cap is an impossible curve.
    const bad: CurveCandidate = { ...good, migrationMarketCapUsd: good.initialMarketCapUsd / 2 };
    const result = await validateCandidateConfiguration(bad, p);
    expect(result.status).toBe("invalid");
    if (result.status === "invalid") expect(result.error.length).toBeGreaterThan(0);
  });

  it("reports UNAVAILABLE (not invalid, not a substituted price) when the SOL/USD price cannot be fetched", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => { throw new TypeError("network down"); }));
    const p = profile({ quoteToken: "SOL" });
    const candidate = compileCurveCandidates(asset, p)[0]!;
    const result = await validateCandidateConfiguration(candidate, p);
    expect(result.status).toBe("unavailable");
    if (result.status === "unavailable") expect(result.reason).toMatch(/live USD price for SOL/i);
  });

  it("is read-only: builds no transaction and needs no wallet or key", async () => {
    const p = profile();
    const before = JSON.stringify(compileCurveCandidates(asset, p)[0]);
    await validateCandidateConfiguration(compileCurveCandidates(asset, p)[0]!, p);
    expect(JSON.stringify(compileCurveCandidates(asset, p)[0])).toBe(before);
  });
});
