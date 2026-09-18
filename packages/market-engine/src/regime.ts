import type { MarketRegime } from "@elf/shared";

/**
 * Analytics-only classification. Per product spec, ELF never mutates a
 * deployed DBC configuration in response to a regime change — this is a
 * read-only recommendation label for the dashboard, nothing more.
 */
export interface RegimeInputs {
  graduationPercentageComplete: number;
  marketQualityTotal: number; // 0-100
  priceVolatility: number; // fraction, e.g. 0.02 = 2%
  volume24hUsd: number;
}

export function classifyRegime(inputs: RegimeInputs): MarketRegime {
  if (inputs.graduationPercentageComplete >= 85) return "mature";

  if (inputs.marketQualityTotal < 40 || inputs.priceVolatility > 0.2) {
    return inputs.volume24hUsd > 0 ? "stressed" : "recovery";
  }

  if (inputs.graduationPercentageComplete < 15 && inputs.marketQualityTotal < 60) {
    return "discovery";
  }

  return "healthy";
}
