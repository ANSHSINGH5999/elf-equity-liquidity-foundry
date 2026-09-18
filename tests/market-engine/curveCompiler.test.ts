import { describe, expect, it } from "vitest";
import { compileCurveCandidates } from "../../packages/market-engine/src/index.js";
import type { MarketProfile, TokenizedAsset } from "../../packages/shared/src/index.js";

function makeAsset(): TokenizedAsset {
  return {
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
}

function makeProfile(overrides: Partial<MarketProfile> = {}): MarketProfile {
  return {
    id: "profile-1",
    assetId: "asset-1",
    initialLiquidityUsd: 250_000,
    expectedVolatility: "medium",
    riskProfile: "balanced",
    targetLiquidityUsd: 500_000,
    targetGraduationUsd: 1_000_000,
    quoteToken: "USDC",
    createdAt: new Date().toISOString(),
    ...overrides,
  };
}

describe("compileCurveCandidates", () => {
  it("is deterministic for identical inputs", () => {
    const asset = makeAsset();
    const profile = makeProfile();

    const a = compileCurveCandidates(asset, profile);
    const b = compileCurveCandidates(asset, profile);

    expect(a).toEqual(b);
  });

  it("always returns exactly conservative, balanced, and growth candidates", () => {
    const candidates = compileCurveCandidates(makeAsset(), makeProfile());
    const profiles = candidates.map((c) => c.riskProfile).sort();
    expect(profiles).toEqual(["balanced", "conservative", "growth"]);
  });

  it("marks exactly one candidate as recommended", () => {
    const candidates = compileCurveCandidates(makeAsset(), makeProfile());
    expect(candidates.filter((c) => c.isRecommended)).toHaveLength(1);
  });

  it("gives conservative the best price-impact score and growth the best graduation-readiness score", () => {
    const candidates = compileCurveCandidates(makeAsset(), makeProfile());
    const byProfile = Object.fromEntries(candidates.map((c) => [c.riskProfile, c]));

    expect(byProfile.conservative!.score.priceImpact).toBeGreaterThanOrEqual(
      byProfile.growth!.score.priceImpact,
    );
    expect(byProfile.growth!.score.graduationReadiness).toBeGreaterThanOrEqual(
      byProfile.conservative!.score.graduationReadiness,
    );
  });

  it("increases the growth composite score relative to conservative when weights favor discovery speed", () => {
    const asset = makeAsset();
    const profile = makeProfile();

    const growthWeighted = compileCurveCandidates(asset, profile, {
      minimizePriceImpact: 0,
      minimizeVolatilityAmplification: 0,
      maximizeLiquidityEfficiency: 0,
      maximizeDiscoverySpeed: 1,
      maximizeGraduationProbability: 0,
    });

    const byProfile = Object.fromEntries(growthWeighted.map((c) => [c.riskProfile, c]));
    expect(byProfile.growth!.score.composite).toBeGreaterThan(byProfile.conservative!.score.composite);
    expect(byProfile.growth!.isRecommended).toBe(true);
  });

  it("scales market cap with the issuer's declared liquidity, not the asset's reference price", () => {
    // Market cap must track what the issuer actually asked for — a
    // regression here previously produced multi-billion-dollar curves for
    // ordinary reference prices, completely disconnected from the
    // declared initial liquidity. See docs/market-model.md.
    const lowLiquidity = compileCurveCandidates(makeAsset(), makeProfile({ initialLiquidityUsd: 50_000 }));
    const highLiquidity = compileCurveCandidates(makeAsset(), makeProfile({ initialLiquidityUsd: 500_000 }));

    const lowBalanced = lowLiquidity.find((c) => c.riskProfile === "balanced")!;
    const highBalanced = highLiquidity.find((c) => c.riskProfile === "balanced")!;

    expect(highBalanced.initialMarketCapUsd).toBeGreaterThan(lowBalanced.initialMarketCapUsd);
    // A $10 reference price against a realistic $250k-scale initial market
    // cap must not blow up into a billion-dollar valuation.
    expect(lowBalanced.initialMarketCapUsd).toBeLessThan(10_000_000);
  });

  it("derives total supply so the starting price lands near the asset's reference price, when the back-solved supply clears the on-chain minimum", () => {
    // MIN_TOKEN_SUPPLY exists so the on-chain program's validateTokenSupply
    // check (swap reserve + migration reserve + rounding buffer) never
    // rejects the deployment — confirmed empirically against the real SDK
    // and a live devnet simulation. Below that floor, price-alignment is
    // not guaranteed to hold; this test exercises a large-enough initial
    // market cap that the floor isn't the binding constraint, so the
    // "starts near reference price" nicety is actually being tested.
    const asset = { ...makeAsset(), referencePriceUsd: 25 };
    const profile = makeProfile({ initialLiquidityUsd: 15_000_000 });
    const candidate = compileCurveCandidates(asset, profile).find((c) => c.riskProfile === "balanced")!;
    const impliedStartPrice = candidate.initialMarketCapUsd / candidate.tokenSupply;

    expect(impliedStartPrice).toBeGreaterThan(asset.referencePriceUsd * 0.1);
    expect(impliedStartPrice).toBeLessThan(asset.referencePriceUsd * 10);
  });

  it("floors total supply at MIN_TOKEN_SUPPLY for small markets, even though this decouples starting price from the reference price", () => {
    // The floor takes priority over the price-alignment nicety — an
    // undeployable curve is a worse outcome than a starting price that
    // doesn't closely track the reference price. Market cap (the actual
    // pricing anchor, per docs/market-model.md) is unaffected either way.
    const asset = { ...makeAsset(), referencePriceUsd: 25 };
    const candidate = compileCurveCandidates(asset, makeProfile()).find((c) => c.riskProfile === "balanced")!;

    expect(candidate.tokenSupply).toBe(1_000_000);
    expect(candidate.initialMarketCapUsd).toBe(500_000); // unaffected by the supply floor
  });
});
