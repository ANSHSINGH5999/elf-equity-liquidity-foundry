import { describe, expect, it } from "vitest";
import { computeSwapAmountIn } from "../../packages/meteora-adapter/src/index.js";

const pool = { priceInQuote: 0.5, quoteUsdPrice: 2, tokenBaseDecimal: 9, tokenQuoteDecimal: 6 };

describe("computeSwapAmountIn", () => {
  it("buy: converts USD to raw quote-token units using the quote token's decimals", () => {
    // $100 / $1 per USDC = 100 USDC = 100_000_000 raw (6 decimals)
    expect(computeSwapAmountIn({ side: "buy", amountUsd: 100, ...pool, quoteUsdPrice: 1 }).toString()).toBe("100000000");
  });

  it("buy: a SOL-quoted pool uses the live SOL/USD price", () => {
    // $200 / $200 per SOL = 1 SOL = 1_000_000_000 lamports
    expect(computeSwapAmountIn({ side: "buy", amountUsd: 200, ...pool, quoteUsdPrice: 200, tokenQuoteDecimal: 9 }).toString()).toBe(
      "1000000000",
    );
  });

  it("sell: an exact token amount is used verbatim, not re-derived from a USD price", () => {
    expect(computeSwapAmountIn({ side: "sell", amountTokens: 12.5, ...pool }).toString()).toBe("12500000000");
  });

  it("sell: a USD amount is converted via the pool's spot price", () => {
    // spot = 0.5 quote * $2 = $1/token, so $100 = 100 tokens = 100e9 raw
    expect(computeSwapAmountIn({ side: "sell", amountUsd: 100, ...pool }).toString()).toBe("100000000000");
  });

  it("prefers amountTokens over amountUsd when a caller somehow supplies both (schema forbids it upstream)", () => {
    expect(computeSwapAmountIn({ side: "sell", amountTokens: 1, amountUsd: 999, ...pool }).toString()).toBe("1000000000");
  });

  it("does not throw for amounts beyond 2^53 raw units (new BN(number) would)", () => {
    const big = computeSwapAmountIn({ side: "sell", amountTokens: 5_000_000_000, ...pool });
    expect(big.gtn(0)).toBe(true);
  });

  it.each([0, -5, Number.NaN, Number.POSITIVE_INFINITY])("collapses unusable amount %s to zero", (amountTokens) => {
    expect(computeSwapAmountIn({ side: "sell", amountTokens, ...pool }).isZero()).toBe(true);
  });

  it("collapses a zero/invalid spot price on a USD-denominated sell to zero instead of Infinity", () => {
    expect(computeSwapAmountIn({ side: "sell", amountUsd: 100, ...pool, priceInQuote: 0 }).isZero()).toBe(true);
  });

  it("collapses a missing amount to zero", () => {
    expect(computeSwapAmountIn({ side: "buy", ...pool }).isZero()).toBe(true);
  });
});
