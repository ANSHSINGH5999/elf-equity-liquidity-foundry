import { describe, expect, it } from "vitest";
import { dbcSwapRequestSchema } from "../../packages/shared/src/index.js";

const base = {
  poolAddress: "TradesRoutePoo1AnAiyEuUmZ2wDgTNv67vhqZ8pmKK",
  payerPublicKey: "DRkMYoUBVRMvXpsv8yvURJBgzr3jC5NM17eu2TncW1Hk",
  side: "buy" as const,
};

describe("dbcSwapRequestSchema (public, unauthenticated swap route input)", () => {
  it("accepts a USD-denominated buy and defaults slippage to 100 bps", () => {
    const r = dbcSwapRequestSchema.parse({ ...base, amountUsd: 250 });
    expect(r.slippageBps).toBe(100);
  });

  it("accepts an exact-token sell", () => {
    expect(dbcSwapRequestSchema.safeParse({ ...base, side: "sell", amountTokens: 12.5 }).success).toBe(true);
  });

  it("rejects sending both amountUsd and amountTokens", () => {
    expect(dbcSwapRequestSchema.safeParse({ ...base, side: "sell", amountUsd: 100, amountTokens: 5 }).success).toBe(false);
  });

  it("rejects sending neither amount", () => {
    expect(dbcSwapRequestSchema.safeParse({ ...base }).success).toBe(false);
  });

  it("rejects an exact-token BUY — buys are denominated in the quote token", () => {
    expect(dbcSwapRequestSchema.safeParse({ ...base, side: "buy", amountTokens: 5 }).success).toBe(false);
  });

  it.each([0, -1, Number.NaN, Number.POSITIVE_INFINITY, 1_000_001])("rejects out-of-range amountUsd %s", (amountUsd) => {
    expect(dbcSwapRequestSchema.safeParse({ ...base, amountUsd }).success).toBe(false);
  });

  it.each([0, -3, Number.NaN, Number.POSITIVE_INFINITY])("rejects out-of-range amountTokens %s", (amountTokens) => {
    expect(dbcSwapRequestSchema.safeParse({ ...base, side: "sell", amountTokens }).success).toBe(false);
  });

  it.each([0, -1, 5_001, 1.5])("rejects out-of-range or non-integer slippageBps %s", (slippageBps) => {
    expect(dbcSwapRequestSchema.safeParse({ ...base, amountUsd: 10, slippageBps }).success).toBe(false);
  });

  it("rejects malformed public keys", () => {
    expect(dbcSwapRequestSchema.safeParse({ ...base, amountUsd: 10, payerPublicKey: "not-a-key" }).success).toBe(false);
    expect(dbcSwapRequestSchema.safeParse({ ...base, amountUsd: 10, poolAddress: "0OIl" }).success).toBe(false);
  });

  it("rejects an unknown side", () => {
    expect(dbcSwapRequestSchema.safeParse({ ...base, side: "hold", amountUsd: 10 }).success).toBe(false);
  });
});
