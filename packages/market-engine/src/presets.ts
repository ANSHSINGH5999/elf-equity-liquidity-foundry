import type { RiskProfile } from "@elf/shared";

/**
 * Deterministic per-risk-profile market-design presets.
 *
 * These are ELF's own design heuristics, not a claim of financial
 * optimality. They translate a risk profile into concrete Meteora DBC
 * inputs: fee schedule shape, migration fee tier, liquidity lock-up, and
 * how aggressively the curve prices the asset relative to what the issuer
 * actually declared. See docs/market-model.md for the full rationale.
 */
export interface RiskPreset {
  riskProfile: RiskProfile;
  label: string;
  /**
   * Initial market cap = the issuer's declared `initialLiquidityUsd`
   * times this multiple. Anchoring to the issuer's own number (rather
   * than the reference price of the underlying real-world asset) keeps
   * the DBC token's starting valuation grounded in what they're actually
   * funding the curve with — see docs/market-model.md.
   */
  initialMcapMultiple: number;
  /**
   * Migration market cap = the issuer's declared `targetGraduationUsd`
   * times this multiple. A higher multiple implies less base-token
   * dilution to reach the same raise (faster price appreciation, more
   * aggressive); a lower multiple implies more dilution for a gentler
   * curve.
   */
  migrationMcapMultiple: number;
  startingFeeBps: number;
  endingFeeBps: number;
  numberOfFeePeriods: number;
  feeScheduleTotalDurationSeconds: number;
  dynamicFeeMaxPriceChangeBps: number;
  migrationFeeBps: 25 | 30 | 100 | 200 | 400 | 600;
  /**
   * These two — plus the (always zero, no-partner) partner equivalents —
   * must sum to exactly 100: Meteora enforces this as one pool's total LP
   * allocation, not "percentage locked out of the creator's own share."
   */
  creatorPermanentLockedLiquidityPercentage: number;
  creatorLiquidityPercentage: number;
}

export const RISK_PRESETS: Record<RiskProfile, RiskPreset> = {
  conservative: {
    riskProfile: "conservative",
    label: "Conservative",
    initialMcapMultiple: 1.3,
    migrationMcapMultiple: 2,
    startingFeeBps: 400,
    endingFeeBps: 100,
    numberOfFeePeriods: 12,
    feeScheduleTotalDurationSeconds: 60 * 60 * 24, // 1 day
    dynamicFeeMaxPriceChangeBps: 300,
    migrationFeeBps: 200,
    creatorPermanentLockedLiquidityPercentage: 50,
    creatorLiquidityPercentage: 50,
  },
  balanced: {
    riskProfile: "balanced",
    label: "Balanced",
    initialMcapMultiple: 2,
    migrationMcapMultiple: 4,
    startingFeeBps: 300,
    endingFeeBps: 60,
    numberOfFeePeriods: 10,
    feeScheduleTotalDurationSeconds: 60 * 60 * 12, // 12 hours
    dynamicFeeMaxPriceChangeBps: 500,
    migrationFeeBps: 100,
    creatorPermanentLockedLiquidityPercentage: 25,
    creatorLiquidityPercentage: 75,
  },
  growth: {
    riskProfile: "growth",
    label: "Growth",
    initialMcapMultiple: 3,
    migrationMcapMultiple: 7,
    startingFeeBps: 150,
    endingFeeBps: 30,
    numberOfFeePeriods: 6,
    feeScheduleTotalDurationSeconds: 60 * 60 * 4, // 4 hours
    dynamicFeeMaxPriceChangeBps: 800,
    migrationFeeBps: 30,
    creatorPermanentLockedLiquidityPercentage: 10,
    creatorLiquidityPercentage: 90,
  },
};

export const VOLATILITY_MULTIPLIER: Record<"low" | "medium" | "high", number> = {
  low: 0.85,
  medium: 1,
  high: 1.25,
};
