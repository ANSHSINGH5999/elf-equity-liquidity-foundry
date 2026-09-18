import { describe, expect, it } from "vitest";
import { marketProfileSchema, designMarketSchema } from "../../packages/shared/src/index.js";
import { POST as designMarket } from "../../apps/web/src/app/api/markets/design/route.js";

/**
 * LOW-6 regression test (security remediation): the curve-design input
 * schema rejects a market profile whose declared graduation target is
 * below its declared initial liquidity — a combination that produces a
 * migration market cap below the initial market cap, which the on-chain
 * Meteora program's curve math assumes never happens (see
 * packages/market-engine/src/curveCompiler.ts and
 * docs/security-remediation.md, LOW-6).
 */
const VALID_PROFILE = {
  assetId: "asset-1",
  initialLiquidityUsd: 250_000,
  expectedVolatility: "medium" as const,
  riskProfile: "balanced" as const,
  targetLiquidityUsd: 500_000,
  targetGraduationUsd: 1_000_000,
  quoteToken: "USDC" as const,
};

describe("marketProfileSchema (LOW-6)", () => {
  it("accepts a coherent profile where the graduation target exceeds initial liquidity", () => {
    const result = marketProfileSchema.safeParse(VALID_PROFILE);
    expect(result.success).toBe(true);
  });

  it("rejects a graduation target below the declared initial liquidity", () => {
    const result = marketProfileSchema.safeParse({
      ...VALID_PROFILE,
      initialLiquidityUsd: 5_000_000,
      targetGraduationUsd: 100, // would migrate to a LOWER cap than it starts at
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.flatten().fieldErrors.targetGraduationUsd?.[0]).toMatch(/at least initialLiquidityUsd/);
    }
  });

  it("accepts a graduation target exactly equal to initial liquidity (boundary)", () => {
    const result = marketProfileSchema.safeParse({ ...VALID_PROFILE, initialLiquidityUsd: 100_000, targetGraduationUsd: 100_000 });
    expect(result.success).toBe(true);
  });

  it("still rejects non-positive liquidity, out-of-range values, and invalid enums (unchanged bounds)", () => {
    expect(marketProfileSchema.safeParse({ ...VALID_PROFILE, initialLiquidityUsd: 0 }).success).toBe(false);
    expect(marketProfileSchema.safeParse({ ...VALID_PROFILE, initialLiquidityUsd: -100 }).success).toBe(false);
    expect(marketProfileSchema.safeParse({ ...VALID_PROFILE, initialLiquidityUsd: 999_000_000 }).success).toBe(false);
    expect(marketProfileSchema.safeParse({ ...VALID_PROFILE, expectedVolatility: "extreme" }).success).toBe(false);
    expect(marketProfileSchema.safeParse({ ...VALID_PROFILE, riskProfile: "yolo" }).success).toBe(false);
    expect(marketProfileSchema.safeParse({ ...VALID_PROFILE, quoteToken: "DOGE" }).success).toBe(false);
  });
});

describe("designMarketSchema (LOW-6 — the composed schema POST /api/markets/design actually uses)", () => {
  it("rejects the same incoherent graduation-target combination when nested under marketProfile", () => {
    const { assetId: _assetId, ...profileWithoutAssetId } = VALID_PROFILE;
    const result = designMarketSchema.safeParse({
      assetId: "asset-1",
      marketProfile: { ...profileWithoutAssetId, initialLiquidityUsd: 5_000_000, targetGraduationUsd: 100 },
    });
    expect(result.success).toBe(false);
  });
});

describe("POST /api/markets/design end-to-end validation (LOW-6)", () => {
  it("returns a 400 validation_error for an incoherent profile rather than persisting it", async () => {
    const { assetId: _assetId, ...profileWithoutAssetId } = VALID_PROFILE;
    const response = await designMarket(
      new Request("http://localhost/api/markets/design", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          assetId: "nonexistent-asset-id-doesnt-matter-validation-runs-first",
          marketProfile: { ...profileWithoutAssetId, initialLiquidityUsd: 5_000_000, targetGraduationUsd: 100 },
        }),
      }),
    );
    expect(response.status).toBe(400);
    const body = await response.json();
    expect(body.error.code).toBe("validation_error");
  });
});
