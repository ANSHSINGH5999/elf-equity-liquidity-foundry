import { describe, expect, it } from "vitest";
import {
  computeVolatility,
  computePercentChange,
  computeAbsoluteChange,
  computeBuySellStats,
  explainMarketQualityScore,
} from "../../packages/market-engine/src/index.js";
import type { MarketQualityScoreBreakdown } from "../../packages/shared/src/index.js";

describe("computeVolatility", () => {
  it("returns insufficient data below the minimum observation count", () => {
    const result = computeVolatility(
      [
        { timestamp: "2026-01-01T00:00:00Z", priceUsd: 10 },
        { timestamp: "2026-01-01T01:00:00Z", priceUsd: 10.5 },
      ],
      "24H",
    );
    expect(result.available).toBe(false);
  });

  it("computes a deterministic, non-negative standard deviation from real log returns", () => {
    const result = computeVolatility(
      [
        { timestamp: "2026-01-01T00:00:00Z", priceUsd: 10 },
        { timestamp: "2026-01-01T01:00:00Z", priceUsd: 10.5 },
        { timestamp: "2026-01-01T02:00:00Z", priceUsd: 9.8 },
        { timestamp: "2026-01-01T03:00:00Z", priceUsd: 10.2 },
      ],
      "24H",
    );
    if (!("available" in result)) {
      expect(result.standardDeviationOfLogReturns).toBeGreaterThan(0);
      expect(result.observationCount).toBe(4);
      expect(result.methodology).toBe("log_returns_stddev_non_annualized");
    } else {
      throw new Error("expected a computed result");
    }
  });

  it("is order-independent of input array ordering (sorts by timestamp internally)", () => {
    const points = [
      { timestamp: "2026-01-01T02:00:00Z", priceUsd: 9.8 },
      { timestamp: "2026-01-01T00:00:00Z", priceUsd: 10 },
      { timestamp: "2026-01-01T03:00:00Z", priceUsd: 10.2 },
      { timestamp: "2026-01-01T01:00:00Z", priceUsd: 10.5 },
    ];
    const sorted = [...points].sort((a, b) => a.timestamp.localeCompare(b.timestamp));
    const a = computeVolatility(points, "24H");
    const b = computeVolatility(sorted, "24H");
    expect(a).toEqual(b);
  });

  it("ignores non-positive prices rather than computing ln of zero/negative", () => {
    const result = computeVolatility(
      [
        { timestamp: "2026-01-01T00:00:00Z", priceUsd: 10 },
        { timestamp: "2026-01-01T01:00:00Z", priceUsd: 0 },
        { timestamp: "2026-01-01T02:00:00Z", priceUsd: 10.5 },
        { timestamp: "2026-01-01T03:00:00Z", priceUsd: 9.8 },
      ],
      "24H",
    );
    if (!("available" in result)) {
      expect(Number.isFinite(result.standardDeviationOfLogReturns)).toBe(true);
    }
  });
});

describe("computePercentChange / computeAbsoluteChange", () => {
  it("never invents a baseline: null/undefined/zero past values return insufficient data", () => {
    expect(computePercentChange(100, null).available).toBe(false);
    expect(computePercentChange(100, undefined).available).toBe(false);
    expect(computePercentChange(100, 0).available).toBe(false);
    expect(computeAbsoluteChange(100, null).available).toBe(false);
  });

  it("computes a correct positive and negative percent change", () => {
    const up = computePercentChange(110, 100);
    const down = computePercentChange(90, 100);
    if ("value" in up && "value" in down) {
      expect(up.value).toBe(10);
      expect(down.value).toBe(-10);
    } else {
      throw new Error("expected computed values");
    }
  });
});

describe("computeBuySellStats", () => {
  it("returns a null ratio (not Infinity) when there are zero sells", () => {
    const stats = computeBuySellStats([
      { side: "buy", quoteAmountUsd: 100 },
      { side: "buy", quoteAmountUsd: 200 },
    ]);
    expect(stats.sellCount).toBe(0);
    expect(stats.buySellRatio).toBeNull();
    expect(stats.totalVolumeUsd).toBe(300);
  });

  it("computes buy/sell volumes and ratio correctly", () => {
    const stats = computeBuySellStats([
      { side: "buy", quoteAmountUsd: 100 },
      { side: "sell", quoteAmountUsd: 50 },
      { side: "buy", quoteAmountUsd: 100 },
    ]);
    expect(stats.buyVolumeUsd).toBe(200);
    expect(stats.sellVolumeUsd).toBe(50);
    expect(stats.buyCount).toBe(2);
    expect(stats.sellCount).toBe(1);
    expect(stats.buySellRatio).toBe(2);
  });
});

describe("explainMarketQualityScore", () => {
  const perfect: MarketQualityScoreBreakdown = {
    liquidityDepth: 25,
    priceStability: 20,
    volumeQuality: 15,
    slippage: 20,
    holderDistribution: 10,
    referencePriceAlignment: 10,
    total: 100,
  };

  it("never mutates the underlying breakdown values", () => {
    const result = explainMarketQualityScore(perfect, "Last 24 hours");
    expect(result.breakdown).toEqual(perfect);
  });

  it("reports no risk signal when every component is healthy", () => {
    const result = explainMarketQualityScore(perfect, "Last 24 hours");
    expect(result.riskSignal).toBeNull();
  });

  it("flags the worst-scoring component (as a fraction of its own max) as the risk signal", () => {
    const weakHolderDistribution: MarketQualityScoreBreakdown = { ...perfect, holderDistribution: 2, total: 92 };
    const result = explainMarketQualityScore(weakHolderDistribution, "Last 24 hours");
    expect(result.riskSignal).toMatch(/concentrated/i);
  });

  it("is deterministic for identical input", () => {
    const a = explainMarketQualityScore(perfect, "Last 24 hours");
    const b = explainMarketQualityScore(perfect, "Last 24 hours");
    expect(a).toEqual(b);
  });

  it("always tags the current model version", () => {
    const result = explainMarketQualityScore(perfect, "Last 24 hours");
    expect(result.version).toBe("MQS v1");
    expect(result.label).toBe("ELF-defined analytical metric");
  });
});
