import type { MarketQualityScoreBreakdown } from "@elf/shared";

/**
 * ELF Market Quality Score — a deterministic, in-house heuristic, not an
 * industry-standard metric. Point allocation is fixed by product spec:
 * liquidity depth (25), price stability (20), volume quality (15),
 * slippage (20), holder distribution (10), reference-price alignment (10).
 */
export interface MarketQualityInputs {
  liquidityUsd: number;
  targetLiquidityUsd: number;
  /** Standard deviation of recent trade prices as a fraction of mean price, e.g. 0.02 = 2%. */
  priceVolatility: number;
  volume24hUsd: number;
  targetLiquidityForVolumeUsd: number;
  estimatedSlippageBpsAt10k: number;
  holderCount: number;
  top10HolderConcentrationPct: number; // 0-100
  currentPriceUsd: number;
  referencePriceUsd: number;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function scoreMarketQuality(inputs: MarketQualityInputs): MarketQualityScoreBreakdown {
  const liquidityDepth = clamp(
    (inputs.liquidityUsd / Math.max(inputs.targetLiquidityUsd, 1)) * 25,
    0,
    25,
  );

  // Volatility of 0% -> full marks; 15%+ intraday swing -> zero.
  const priceStability = clamp(20 * (1 - inputs.priceVolatility / 0.15), 0, 20);

  // Healthy volume is proxied as ~10% of liquidity turning over per day.
  const targetVolume = inputs.targetLiquidityForVolumeUsd * 0.1;
  const volumeRatio = targetVolume > 0 ? inputs.volume24hUsd / targetVolume : 0;
  const volumeQuality = clamp(15 * Math.min(volumeRatio, 1), 0, 15);

  // 0 bps slippage on a $10k trade -> full marks; 300+ bps -> zero.
  const slippage = clamp(20 * (1 - inputs.estimatedSlippageBpsAt10k / 300), 0, 20);

  // Reward distributed holders and penalize concentration.
  const holderCountScore = clamp((inputs.holderCount / 500) * 5, 0, 5);
  const concentrationScore = clamp(5 * (1 - inputs.top10HolderConcentrationPct / 100), 0, 5);
  const holderDistribution = clamp(holderCountScore + concentrationScore, 0, 10);

  const deviation =
    inputs.referencePriceUsd > 0
      ? Math.abs(inputs.currentPriceUsd - inputs.referencePriceUsd) / inputs.referencePriceUsd
      : 0;
  const referencePriceAlignment = clamp(10 * (1 - deviation / 0.5), 0, 10);

  const total =
    liquidityDepth + priceStability + volumeQuality + slippage + holderDistribution + referencePriceAlignment;

  return {
    liquidityDepth: Math.round(liquidityDepth * 100) / 100,
    priceStability: Math.round(priceStability * 100) / 100,
    volumeQuality: Math.round(volumeQuality * 100) / 100,
    slippage: Math.round(slippage * 100) / 100,
    holderDistribution: Math.round(holderDistribution * 100) / 100,
    referencePriceAlignment: Math.round(referencePriceAlignment * 100) / 100,
    total: Math.round(total * 100) / 100,
  };
}
