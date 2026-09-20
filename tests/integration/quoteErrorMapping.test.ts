import { describe, expect, it } from "vitest";
import { mapInsufficientLiquidity } from "../../apps/web/src/lib/server/api-error.js";

/**
 * Regression: a SELL quote on a brand-new pool (quote reserve 0) makes the DBC SDK throw "Insufficient Liquidity".
 * The quote route used to answer every failure with "The Solana RPC endpoint is temporarily unavailable" (503),
 * which sent the investigation to the RPC when the pool simply could not pay.
 */
describe("mapInsufficientLiquidity", () => {
  it("turns the SDK's Insufficient Liquidity into a 422 that names the real cause", async () => {
    const res = mapInsufficientLiquidity(new Error("Insufficient Liquidity"))!;
    expect(res.status).toBe(422);
    const body = (await res.json()) as { error: { code: string; message: string } };
    expect(body.error.message).toMatch(/does not hold enough quote-token liquidity/);
    expect(body.error.message).not.toMatch(/RPC/);
  });

  it("leaves every other error alone", () => {
    expect(mapInsufficientLiquidity(new Error("429 Too Many Requests"))).toBeNull();
    expect(mapInsufficientLiquidity("Insufficient Liquidity")).toBeNull();
  });
});
