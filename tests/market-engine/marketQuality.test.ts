import { describe, expect, it } from "vitest";
import { scoreMarketQuality, type MarketQualityInputs } from "../../packages/market-engine/src/index.js";

function baseInputs(overrides: Partial<MarketQualityInputs> = {}): MarketQualityInputs {
  return {
    liquidityUsd: 500_000,
    targetLiquidityUsd: 500_000,
    priceVolatility: 0,
    volume24hUsd: 50_000,
    targetLiquidityForVolumeUsd: 500_000,
    estimatedSlippageBpsAt10k: 0,
    holderCount: 500,
    top10HolderConcentrationPct: 0,
    currentPriceUsd: 10,
    referencePriceUsd: 10,
    ...overrides,
  };
}

describe("scoreMarketQuality", () => {
  it("awards full marks (100) for a textbook-perfect market", () => {
    const score = scoreMarketQuality(baseInputs());
    expect(score.total).toBe(100);
    expect(score.liquidityDepth).toBe(25);
    expect(score.priceStability).toBe(20);
    expect(score.volumeQuality).toBe(15);
    expect(score.slippage).toBe(20);
    expect(score.holderDistribution).toBe(10);
    expect(score.referencePriceAlignment).toBe(10);
  });

  it("never exceeds the fixed point allocation per component", () => {
    const score = scoreMarketQuality(
      baseInputs({ liquidityUsd: 10_000_000, volume24hUsd: 10_000_000, holderCount: 100_000 }),
    );
    expect(score.liquidityDepth).toBeLessThanOrEqual(25);
    expect(score.volumeQuality).toBeLessThanOrEqual(15);
    expect(score.holderDistribution).toBeLessThanOrEqual(10);
    expect(score.total).toBeLessThanOrEqual(100);
  });

  it("never goes negative for a maximally unhealthy market", () => {
    const score = scoreMarketQuality(
      baseInputs({
        liquidityUsd: 0,
        priceVolatility: 5,
        volume24hUsd: 0,
        estimatedSlippageBpsAt10k: 10_000,
        holderCount: 0,
        top10HolderConcentrationPct: 100,
        currentPriceUsd: 1000,
        referencePriceUsd: 10,
      }),
    );
    expect(score.total).toBe(0);
    expect(score.liquidityDepth).toBeGreaterThanOrEqual(0);
    expect(score.slippage).toBeGreaterThanOrEqual(0);
  });

  it("penalizes high slippage more than low slippage", () => {
    const lowSlippage = scoreMarketQuality(baseInputs({ estimatedSlippageBpsAt10k: 10 }));
    const highSlippage = scoreMarketQuality(baseInputs({ estimatedSlippageBpsAt10k: 250 }));
    expect(lowSlippage.slippage).toBeGreaterThan(highSlippage.slippage);
  });

  it("penalizes holder concentration", () => {
    const distributed = scoreMarketQuality(baseInputs({ top10HolderConcentrationPct: 10 }));
    const concentrated = scoreMarketQuality(baseInputs({ top10HolderConcentrationPct: 90 }));
    expect(distributed.holderDistribution).toBeGreaterThan(concentrated.holderDistribution);
  });
});
