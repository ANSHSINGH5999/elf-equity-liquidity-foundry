import type {
  CurveCandidate,
  CurveCandidateScore,
  CurveObjectiveWeights,
  MarketProfile,
  RiskProfile,
  TokenizedAsset,
} from "@elf/shared";
import { DEFAULT_OBJECTIVE_WEIGHTS } from "@elf/shared";
import { RISK_PRESETS, VOLATILITY_MULTIPLIER, type RiskPreset } from "./presets";

/**
 * The Meteora DBC program's on-chain `validateTokenSupply` check requires
 * total supply to cover the swap-curve reserve, the migration reserve, and
 * a 25%-of-swap-reserve rounding buffer (`SWAP_BUFFER_PERCENTAGE`), all in
 * raw base-token units. Below roughly 10^5 tokens this reliably trips
 * `InvalidTokenSupply` (Anchor custom error 6020) even for economically
 * ordinary initial/migration market-cap ratios — confirmed empirically
 * against the real installed `@meteora-ag/dynamic-bonding-curve-sdk` and a
 * live devnet simulation, not just theoretical. 1,000,000 gives comfortable
 * headroom above that failure point.
 */
const MIN_TOKEN_SUPPLY = 1_000_000;
const MAX_TOKEN_SUPPLY = 10_000_000_000;

function clamp(value: number, min = 0, max = 100): number {
  return Math.min(max, Math.max(min, value));
}

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

/**
 * Six display metrics (0-100, higher is better) shown in the /design
 * configuration comparison table. These are a superset of the five
 * curve-compiler objectives: fee generation and stress resilience are
 * transparency metrics, not scoring inputs, by design (see composite()).
 */
function computeMetrics(
  profile: MarketProfile,
  preset: RiskPreset,
  initialMarketCapUsd: number,
): {
  priceImpact: number;
  discoverySpeed: number;
  liquidityEfficiency: number;
  feeGeneration: number;
  stressResilience: number;
  graduationReadiness: number;
  volatilityDampening: number;
} {
  const volatilityMultiple = VOLATILITY_MULTIPLIER[profile.expectedVolatility];

  // Proxy for how much a mid-size ($10k) trade moves price against the
  // profile's declared initial liquidity depth. Actual on-curve slippage is
  // computed later by the simulation engine against the real built curve;
  // this heuristic exists only to rank candidates before deployment.
  const tradeImpactProxy = (10_000 / profile.initialLiquidityUsd) * 100 * volatilityMultiple;
  const priceImpact = clamp(100 - tradeImpactProxy);

  const discoverySpeed = clamp(
    40 + preset.initialMcapMultiple * 12 - preset.numberOfFeePeriods * 1.5,
  );

  // Rewards designs whose starting valuation lands close to what the
  // issuer ultimately wants in liquidity — too far below undervalues the
  // asset, too far above starves early trading of headroom.
  const mcapToTargetLiquidityRatio = initialMarketCapUsd / profile.targetLiquidityUsd;
  const liquidityEfficiency = clamp(100 - Math.abs(mcapToTargetLiquidityRatio - 1) * 40);

  const feeGeneration = clamp(
    (preset.startingFeeBps / 400) * 60 + preset.numberOfFeePeriods * 2,
  );

  const stressResilience = clamp(
    preset.creatorPermanentLockedLiquidityPercentage * 1.2 +
      (10 - preset.migrationMcapMultiple) * 3,
  );

  const graduationReadiness = clamp(
    preset.initialMcapMultiple * 12 +
      (100 - preset.startingFeeBps / 4) * 0.4 +
      60 / (preset.migrationMcapMultiple / 2),
  );

  // Composite-only signal for the "minimize excessive volatility
  // amplification" objective; deliberately not surfaced in the comparison
  // table, which mirrors the PRD's six named metrics exactly.
  const dampeningBase = 100 - preset.dynamicFeeMaxPriceChangeBps / 10;
  const volatilityDampening = clamp(dampeningBase - (volatilityMultiple - 1) * 20);

  return {
    priceImpact: round2(priceImpact),
    discoverySpeed: round2(discoverySpeed),
    liquidityEfficiency: round2(liquidityEfficiency),
    feeGeneration: round2(feeGeneration),
    stressResilience: round2(stressResilience),
    graduationReadiness: round2(graduationReadiness),
    volatilityDampening: round2(volatilityDampening),
  };
}

function composite(
  metrics: ReturnType<typeof computeMetrics>,
  weights: CurveObjectiveWeights,
): number {
  const weightSum =
    weights.minimizePriceImpact +
    weights.minimizeVolatilityAmplification +
    weights.maximizeLiquidityEfficiency +
    weights.maximizeDiscoverySpeed +
    weights.maximizeGraduationProbability;

  if (weightSum <= 0) return 0;

  const weighted =
    metrics.priceImpact * weights.minimizePriceImpact +
    metrics.volatilityDampening * weights.minimizeVolatilityAmplification +
    metrics.liquidityEfficiency * weights.maximizeLiquidityEfficiency +
    metrics.discoverySpeed * weights.maximizeDiscoverySpeed +
    metrics.graduationReadiness * weights.maximizeGraduationProbability;

  return round2(weighted / weightSum);
}

function buildRationale(preset: RiskPreset, profile: MarketProfile, metrics: ReturnType<typeof computeMetrics>): string {
  const parts = [
    `${preset.label} prices the curve at ${preset.initialMcapMultiple}x the declared initial liquidity, migrating around ${preset.migrationMcapMultiple}x the $${profile.targetGraduationUsd.toLocaleString("en-US")} graduation target, with a ${preset.startingFeeBps / 100}%→${preset.endingFeeBps / 100}% decaying fee over ${preset.numberOfFeePeriods} periods.`,
    `${preset.creatorPermanentLockedLiquidityPercentage}% of creator liquidity is permanently locked to signal commitment.`,
    `Against a declared $${profile.initialLiquidityUsd.toLocaleString("en-US")} initial liquidity and ${profile.expectedVolatility} expected volatility, this design scores ${metrics.priceImpact}/100 on price impact and ${metrics.graduationReadiness}/100 on graduation readiness.`,
  ];
  return parts.join(" ");
}

function buildCandidate(
  asset: TokenizedAsset,
  profile: MarketProfile,
  riskProfile: RiskProfile,
  weights: CurveObjectiveWeights,
): CurveCandidate {
  const preset = RISK_PRESETS[riskProfile];

  // Market cap is anchored to what the issuer actually declared in Step 2
  // — not to the underlying real-world asset's reference price, which
  // describes a different instrument (the tokenized equity) than the new
  // DBC base token this curve prices. See docs/market-model.md.
  const initialMarketCapUsd = round2(profile.initialLiquidityUsd * preset.initialMcapMultiple);
  const migrationMarketCapUsd = round2(profile.targetGraduationUsd * preset.migrationMcapMultiple);

  // Total supply is then back-solved so the curve's STARTING price lands
  // near the asset's reference price — a deliberate UX choice (the new
  // market opens in the same neighborhood as the reference price) that
  // has no bearing on the market cap itself, which stays anchored above.
  const tokenSupply = Math.round(
    Math.min(
      MAX_TOKEN_SUPPLY,
      Math.max(MIN_TOKEN_SUPPLY, initialMarketCapUsd / Math.max(asset.referencePriceUsd, 0.000001)),
    ),
  );

  const metrics = computeMetrics(profile, preset, initialMarketCapUsd);

  const score: CurveCandidateScore = {
    priceImpact: metrics.priceImpact,
    discoverySpeed: metrics.discoverySpeed,
    liquidityEfficiency: metrics.liquidityEfficiency,
    feeGeneration: metrics.feeGeneration,
    stressResilience: metrics.stressResilience,
    graduationReadiness: metrics.graduationReadiness,
    composite: composite(metrics, weights),
  };

  return {
    id: `${asset.id}-${riskProfile}`,
    riskProfile,
    label: preset.label,
    rationale: buildRationale(preset, profile, metrics),
    initialMarketCapUsd,
    migrationMarketCapUsd,
    tokenSupply,
    tokenBaseDecimals: 9,
    feeSchedule: {
      startingFeeBps: preset.startingFeeBps,
      endingFeeBps: preset.endingFeeBps,
      numberOfPeriods: preset.numberOfFeePeriods,
      totalDurationSeconds: preset.feeScheduleTotalDurationSeconds,
      dynamicFeeEnabled: true,
      dynamicFeeMaxPriceChangeBps: preset.dynamicFeeMaxPriceChangeBps,
      collectFeeMode: "quote_token",
    },
    migration: {
      migrationOption: "damm_v2",
      migrationQuoteThreshold: profile.targetGraduationUsd,
      migrationFeeOptionBps: preset.migrationFeeBps,
      percentageSupplyOnMigration: round2((initialMarketCapUsd / migrationMarketCapUsd) * 100),
    },
    liquidityDistribution: {
      creatorLiquidityPercentage: preset.creatorLiquidityPercentage,
      creatorPermanentLockedLiquidityPercentage: preset.creatorPermanentLockedLiquidityPercentage,
      partnerLiquidityPercentage: 0,
      partnerPermanentLockedLiquidityPercentage: 0,
    },
    score,
    isRecommended: false,
  };
}

/**
 * Deterministically compiles the three standard candidates (conservative,
 * balanced, growth) for a market profile and marks the highest-composite
 * one as recommended. Same inputs always produce the same outputs — no
 * randomness, no network calls.
 *
 * All three candidates are scored against the SAME objective weight vector
 * — the one implied by the issuer's chosen risk profile (or an explicit
 * override) — so "recommended" reflects which design best serves the
 * issuer's stated objectives, not merely a name match.
 */
export function compileCurveCandidates(
  asset: TokenizedAsset,
  profile: MarketProfile,
  weightOverride?: CurveObjectiveWeights,
): CurveCandidate[] {
  const riskProfiles: RiskProfile[] = ["conservative", "balanced", "growth"];
  const weights = weightOverride ?? DEFAULT_OBJECTIVE_WEIGHTS[profile.riskProfile];

  const candidates = riskProfiles.map((rp) => buildCandidate(asset, profile, rp, weights));

  const best = candidates.reduce((a, b) => (b.score.composite > a.score.composite ? b : a));
  best.isRecommended = true;

  return candidates;
}
