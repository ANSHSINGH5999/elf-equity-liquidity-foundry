import type {
  AssetType,
  CurveCandidateScore,
  FeeScheduleSummary,
  LiquidityDistributionSummary,
  MigrationSummary,
  QuoteToken,
  RiskProfile,
  SimulationScenarioResult,
} from "@elf/shared";

/** Client-side shapes for API responses — dates are ISO strings over the wire. */

export interface AssetDto {
  id: string;
  name: string;
  symbol: string;
  mintAddress: string;
  issuer: string;
  assetType: AssetType;
  referencePriceUsd: number;
  source: "manual" | "prestocks" | "tessera";
  externalId?: string | null;
  createdAt: string;
}

export interface MarketProfileDto {
  id: string;
  assetId: string;
  initialLiquidityUsd: number;
  expectedVolatility: "low" | "medium" | "high";
  riskProfile: RiskProfile;
  targetLiquidityUsd: number;
  targetGraduationUsd: number;
  quoteToken: QuoteToken;
  createdAt: string;
}

export interface CurveConfigDto {
  id: string;
  assetId: string;
  marketProfileId: string;
  riskProfile: RiskProfile;
  label: string;
  rationale: string;
  initialMarketCapUsd: number;
  migrationMarketCapUsd: number;
  tokenSupply: number;
  tokenBaseDecimals: number;
  feeSchedule: FeeScheduleSummary;
  migration: MigrationSummary;
  liquidityDistribution: LiquidityDistributionSummary;
  score: CurveCandidateScore;
  isRecommended: boolean;
}

export interface SimulationRunDto {
  id: string;
  scenarios: SimulationScenarioResult[];
  label: "SIMULATED";
}

export interface ApiErrorBody {
  error: { code: string; message: string; requestId: string; details?: unknown };
}
