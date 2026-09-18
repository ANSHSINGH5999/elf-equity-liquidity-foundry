import { describe, expect, it } from "vitest";
import { checkSufficientBalance, computeExecutionMetrics, minimumReceived } from "../../packages/market-engine/src/index.js";

describe("computeExecutionMetrics", () => {
  it("buy: executing above spot is a positive price impact", () => {
    // Spent $1,010 for 100 tokens while spot is $10 -> paid $10.10/token.
    const m = computeExecutionMetrics({ side: "buy", spotPriceUsd: 10, tokenAmount: 100, quoteLegUsd: 1010 });
    expect(m.executionPriceUsd).toBeCloseTo(10.1, 10);
    expect(m.priceImpactPct).toBeCloseTo(1, 10);
  });

  it("sell: receiving below spot is ALSO a positive price impact (worse for the trader)", () => {
    // Sold 100 tokens for $990 while spot is $10 -> got $9.90/token.
    const m = computeExecutionMetrics({ side: "sell", spotPriceUsd: 10, tokenAmount: 100, quoteLegUsd: 990 });
    expect(m.executionPriceUsd).toBeCloseTo(9.9, 10);
    expect(m.priceImpactPct).toBeCloseTo(1, 10);
  });

  it("a fill better than spot yields a negative impact rather than being clamped to zero", () => {
    const m = computeExecutionMetrics({ side: "buy", spotPriceUsd: 10, tokenAmount: 100, quoteLegUsd: 990 });
    expect(m.priceImpactPct).toBeCloseTo(-1, 10);
  });

  it("returns nulls (never 0) when the fill is unusable", () => {
    expect(computeExecutionMetrics({ side: "buy", spotPriceUsd: 10, tokenAmount: 0, quoteLegUsd: 100 })).toEqual({
      executionPriceUsd: null,
      priceImpactPct: null,
    });
    expect(computeExecutionMetrics({ side: "sell", spotPriceUsd: 10, tokenAmount: 5, quoteLegUsd: 0 })).toEqual({
      executionPriceUsd: null,
      priceImpactPct: null,
    });
    expect(computeExecutionMetrics({ side: "buy", spotPriceUsd: 10, tokenAmount: NaN, quoteLegUsd: 100 }).executionPriceUsd).toBeNull();
  });

  it("still reports the execution price but a null impact when spot is unknown", () => {
    const m = computeExecutionMetrics({ side: "buy", spotPriceUsd: 0, tokenAmount: 10, quoteLegUsd: 100 });
    expect(m.executionPriceUsd).toBe(10);
    expect(m.priceImpactPct).toBeNull();
  });
});

describe("minimumReceived", () => {
  it("applies the slippage tolerance in basis points", () => {
    expect(minimumReceived(1000, 100)).toBe(990);
    expect(minimumReceived(1000, 50)).toBe(995);
  });
  it("clamps nonsense tolerances instead of going negative or growing the output", () => {
    expect(minimumReceived(1000, 20_000)).toBe(0);
    expect(minimumReceived(1000, -50)).toBe(1000);
  });
});

describe("checkSufficientBalance", () => {
  it("is ok when the balance covers the requirement exactly or with room to spare", () => {
    expect(checkSufficientBalance(100, 100)).toEqual({ state: "ok" });
    expect(checkSufficientBalance(150, 100)).toEqual({ state: "ok" });
  });
  it("reports the exact shortfall when insufficient", () => {
    expect(checkSufficientBalance(40, 100)).toEqual({ state: "insufficient", shortfall: 60 });
  });
  it("treats an unreadable balance as unknown — never as zero", () => {
    expect(checkSufficientBalance(null, 100)).toEqual({ state: "unknown" });
    expect(checkSufficientBalance(NaN, 100)).toEqual({ state: "unknown" });
  });
  it("needs nothing when nothing is required", () => {
    expect(checkSufficientBalance(0, 0)).toEqual({ state: "ok" });
  });
});
