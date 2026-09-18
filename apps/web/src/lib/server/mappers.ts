import "server-only";
import type { CurveConfig as CurveConfigRow, MarketProfile as MarketProfileRow, Asset as AssetRow } from "@elf/db";
import type {
  CurveCandidate,
  CurveCandidateScore,
  FeeScheduleSummary,
  LiquidityDistributionSummary,
  MarketProfile,
  MigrationSummary,
  TokenizedAsset,
} from "@elf/shared";

export function assetRowToDomain(row: AssetRow): TokenizedAsset {
  return {
    id: row.id,
    name: row.name,
    symbol: row.symbol,
    mintAddress: row.mintAddress,
    issuer: row.issuer,
    assetType: row.assetType,
    referencePriceUsd: row.referencePriceUsd,
    source: row.source,
    externalId: row.externalId ?? undefined,
    createdAt: row.createdAt.toISOString(),
  };
}

export function marketProfileRowToDomain(row: MarketProfileRow): MarketProfile {
  return {
    id: row.id,
    assetId: row.assetId,
    initialLiquidityUsd: row.initialLiquidityUsd,
    expectedVolatility: row.expectedVolatility as MarketProfile["expectedVolatility"],
    riskProfile: row.riskProfile,
    targetLiquidityUsd: row.targetLiquidityUsd,
    targetGraduationUsd: row.targetGraduationUsd,
    quoteToken: row.quoteToken,
    createdAt: row.createdAt.toISOString(),
  };
}

export function curveConfigRowToDomain(row: CurveConfigRow): CurveCandidate {
  return {
    id: row.id,
    riskProfile: row.riskProfile,
    label: row.label,
    rationale: row.rationale,
    initialMarketCapUsd: row.initialMarketCapUsd,
    migrationMarketCapUsd: row.migrationMarketCapUsd,
    tokenSupply: row.tokenSupply,
    tokenBaseDecimals: row.tokenBaseDecimals as 9,
    feeSchedule: row.feeSchedule as unknown as FeeScheduleSummary,
    migration: row.migration as unknown as MigrationSummary,
    liquidityDistribution: row.liquidityDistribution as unknown as LiquidityDistributionSummary,
    score: row.score as unknown as CurveCandidateScore,
    isRecommended: row.isRecommended,
  };
}
