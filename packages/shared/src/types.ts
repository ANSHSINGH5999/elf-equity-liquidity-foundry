/**
 * Core domain types shared across the ELF platform: web app, API routes,
 * market-engine, simulation-engine, and the meteora-adapter.
 *
 * These types describe ELF's own domain model. They are intentionally
 * decoupled from the Meteora SDK's on-chain account/instruction shapes —
 * packages/meteora-adapter is the only place that shape is allowed to leak.
 */

export type AssetType = "equity" | "pre_ipo" | "fund" | "other";

export type AssetSource = "manual" | "prestocks" | "tessera";

export type RiskProfile = "conservative" | "balanced" | "growth";

export type QuoteToken = "SOL" | "USDC";

/** ELF's post-launch analytics classification. Never mutates the deployed DBC config. */
export type MarketRegime =
  | "discovery"
  | "healthy"
  | "mature"
  | "stressed"
  | "recovery";

export type PoolStatus =
  | "not_deployed"
  | "pending_deployment"
  | "live"
  | "near_graduation"
  | "graduated";

export type SimulationScenarioKind =
  | "normal_demand"
  | "strong_buy_pressure"
  | "strong_sell_pressure"
  | "low_liquidity"
  | "high_volatility"
  | "graduation_approach";

export const TRADE_SIZES_USD = [1_000, 5_000, 10_000, 25_000] as const;
export type TradeSizeUsd = (typeof TRADE_SIZES_USD)[number];

export interface TokenizedAsset {
  id: string;
  name: string;
  symbol: string;
  mintAddress: string;
  issuer: string;
  assetType: AssetType;
  referencePriceUsd: number;
  source: AssetSource;
  /** Present only when `source !== "manual"`. Raw provider id for traceability. */
  externalId?: string;
  createdAt: string;
}

export interface MarketProfile {
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

export type CurveObjectiveKey =
  | "minimizePriceImpact"
  | "minimizeVolatilityAmplification"
  | "maximizeLiquidityEfficiency"
  | "maximizeDiscoverySpeed"
  | "maximizeGraduationProbability";

export type CurveObjectiveWeights = Record<CurveObjectiveKey, number>;

export interface FeeScheduleSummary {
  startingFeeBps: number;
  endingFeeBps: number;
  numberOfPeriods: number;
  totalDurationSeconds: number;
  dynamicFeeEnabled: boolean;
  dynamicFeeMaxPriceChangeBps: number;
  collectFeeMode: "quote_token" | "output_token";
}

export interface MigrationSummary {
  migrationOption: "damm_v2";
  migrationQuoteThreshold: number;
  migrationFeeOptionBps: number;
  percentageSupplyOnMigration: number;
}

export interface LiquidityDistributionSummary {
  creatorLiquidityPercentage: number;
  creatorPermanentLockedLiquidityPercentage: number;
  partnerLiquidityPercentage: number;
  partnerPermanentLockedLiquidityPercentage: number;
}

export interface CurveCandidateScore {
  priceImpact: number;
  discoverySpeed: number;
  liquidityEfficiency: number;
  feeGeneration: number;
  stressResilience: number;
  graduationReadiness: number;
  /** Weighted composite in [0, 100]. Deterministic given the same inputs and weights. */
  composite: number;
}

/**
 * A candidate market design. `sqrtPrices`/`liquidityWeights` are the exact
 * values ELF passed into the Meteora SDK's `buildCurve` family — the same
 * values are re-used, unmodified, when the user approves this candidate and
 * ELF constructs the real Meteora config transaction.
 */
export interface CurveCandidate {
  id: string;
  riskProfile: RiskProfile;
  label: string;
  rationale: string;
  initialMarketCapUsd: number;
  migrationMarketCapUsd: number;
  /** Fixed base-token supply convention ELF uses for every generated curve. See docs/market-model.md. */
  tokenSupply: number;
  tokenBaseDecimals: 9;
  feeSchedule: FeeScheduleSummary;
  migration: MigrationSummary;
  liquidityDistribution: LiquidityDistributionSummary;
  score: CurveCandidateScore;
  isRecommended: boolean;
}

export interface SimulationTradeResult {
  tradeSizeUsd: TradeSizeUsd;
  side: "buy" | "sell";
  estimatedExecutionPrice: number;
  estimatedPriceImpactBps: number;
  postTradePrice: number;
  reserveQuoteAfter: number | null;
  reserveBaseAfter: number | null;
  feeUsd: number;
  marketQualityEffect: number;
  label: "SIMULATED";
}

export interface SimulationScenarioResult {
  scenario: SimulationScenarioKind;
  description: string;
  trades: SimulationTradeResult[];
  worstCasePriceImpactBps: number;
  label: "SIMULATED";
}

export interface SimulationRun {
  id: string;
  curveCandidateId: string;
  scenarios: SimulationScenarioResult[];
  createdAt: string;
  label: "SIMULATED";
}

export interface MarketQualityScoreBreakdown {
  liquidityDepth: number; // 0-25
  priceStability: number; // 0-20
  volumeQuality: number; // 0-15
  slippage: number; // 0-20
  holderDistribution: number; // 0-10
  referencePriceAlignment: number; // 0-10
  total: number; // 0-100
}

export interface GraduationStatus {
  quoteReserveUsd: number;
  migrationThresholdUsd: number;
  percentageComplete: number;
  estimatedReadiness: "not_started" | "early" | "mid" | "near" | "ready";
}

export interface PoolMetrics {
  poolAddress: string;
  priceUsd: number;
  volume24hUsd: number;
  liquidityUsd: number;
  quoteReserve: number;
  baseReserve: number;
  curveProgress: number; // 0-1
  migrationThresholdUsd: number;
  graduationProgress: number; // 0-100
  estimatedSlippageBps: number;
  marketQualityScore: MarketQualityScoreBreakdown;
  regime: MarketRegime;
  status: PoolStatus;
  updatedAt: string;
}

export interface LaunchRecord {
  id: string;
  assetId: string;
  marketProfileId: string;
  curveConfigId: string;
  configAddress: string | null;
  poolAddress: string | null;
  baseMint: string | null;
  quoteMint: string | null;
  configTxSignature: string | null;
  poolTxSignature: string | null;
  status: PoolStatus;
  createdAt: string;
}

// --- ELF V1 Phase 5: historical analytics ---

/**
 * Every analytics figure must declare where it came from (Phase 5.13).
 * `ON_CHAIN`: read live from Solana just now. `INDEXED`: derived from
 * blockchain data ELF's indexer already stored. `SIMULATED`: produced by
 * the simulation engine and never mistakeable for real activity.
 */
export type DataSource = "ON_CHAIN" | "INDEXED" | "SIMULATED";

export type AnalyticsPeriod = "1H" | "24H" | "7D" | "30D" | "ALL";

export interface MetricValue<T = number> {
  value: T;
  timestamp: string;
  source: DataSource;
}

/** Returned instead of a MetricValue when there isn't enough history to compute one honestly. */
export interface InsufficientData {
  available: false;
  reason: string;
}

export type MetricOrInsufficient<T = number> = MetricValue<T> | InsufficientData;

export function isInsufficientData(value: unknown): value is InsufficientData {
  return typeof value === "object" && value !== null && (value as InsufficientData).available === false;
}

export interface PricePoint {
  timestamp: string;
  priceUsd: number;
  source: DataSource;
}

export interface LiquidityPoint {
  timestamp: string;
  liquidityUsd: number;
  source: DataSource;
}

export interface PriceHistoryResult {
  period: AnalyticsPeriod;
  points: PricePoint[];
  dataAvailableSince: string | null;
  source: DataSource;
}

export interface LiquidityHistoryResult {
  period: AnalyticsPeriod;
  points: LiquidityPoint[];
  current: number;
  high: number;
  low: number;
  absoluteChange: MetricOrInsufficient;
  percentChange: MetricOrInsufficient;
  source: DataSource;
}

export interface VolumeStats {
  period: AnalyticsPeriod;
  buyVolumeUsd: number;
  sellVolumeUsd: number;
  totalVolumeUsd: number;
  buyCount: number;
  sellCount: number;
  buySellRatio: number | null; // null when sellCount is 0 — a ratio would be undefined, not infinite
  source: DataSource;
}

export interface TradeStats {
  period: AnalyticsPeriod;
  totalTrades: number;
  buyTrades: number;
  sellTrades: number;
  averageTradeSizeUsd: number;
  largestTradeUsd: number;
  tradesPerHour: number;
  source: DataSource;
}

export interface TraderStats {
  period: AnalyticsPeriod;
  uniqueTraders: number;
  source: DataSource;
}

/**
 * Log-return volatility over indexed price observations. Documented
 * methodology (see docs/analytics.md): `r_t = ln(P_t / P_(t-1))` over
 * consecutive indexed trade prices within the period, standard deviation
 * of those returns, NOT annualized (observations are irregularly spaced
 * — annualizing would imply a sampling regularity that doesn't exist).
 */
export interface VolatilityResult {
  period: AnalyticsPeriod;
  standardDeviationOfLogReturns: number;
  observationCount: number;
  methodology: "log_returns_stddev_non_annualized";
  source: DataSource;
}

export const MARKET_QUALITY_SCORE_VERSION = "MQS v1";

export interface MarketQualityScoreResult {
  breakdown: MarketQualityScoreBreakdown;
  version: typeof MARKET_QUALITY_SCORE_VERSION;
  /** Deterministic, rule-based — never generated by an LLM or randomized. */
  primarySignal: string;
  riskSignal: string | null;
  dataPeriodLabel: string;
  label: "ELF-defined analytical metric";
}

export interface DataFreshness {
  status: "live" | "delayed" | "unavailable";
  lastIndexedAt: string | null;
  lagSeconds: number | null;
}

/** Three ways Pyth prices the same underlying company — see apps/web/src/lib/server/pyth.ts. */
export type PythFeedKind = "equity" | "xstock" | "ondo";

export interface PriceOracleFeed {
  kind: PythFeedKind;
  label: string;
  feedSymbol: string;
  feedId: string;
  /** null when the feed exists but PYTH_API_KEY isn't configured, or the pull failed. */
  priceUsd: number | null;
  publishTime: string | null;
}

export interface MarketOverview {
  marketId: string;
  poolAddress: string | null;
  status: PoolStatus;
  regime: MarketRegime;
  priceUsd: MetricValue;
  liquidityUsd: MetricValue;
  volume24hUsd: MetricValue;
  volume7dUsd: MetricValue;
  tradeCount24h: number;
  uniqueTraders24h: number;
  buyVolumeUsd24h: number;
  sellVolumeUsd24h: number;
  buySellRatio24h: number | null;
  priceChange24h: MetricOrInsufficient;
  liquidityChange24h: MetricOrInsufficient;
  graduation: GraduationStatus;
  marketQualityScore: MarketQualityScoreResult;
  referencePriceUsd: number;
  /** "pyth" only when a live Hermes feed matched the asset's ticker; otherwise the issuer-declared value. */
  referencePriceSource: "pyth" | "issuer_declared";
  referencePriceFeedSymbol: string | null;
  priceOracle: PriceOracleFeed[];
  freshness: DataFreshness;
}

export const DEFAULT_OBJECTIVE_WEIGHTS: Record<RiskProfile, CurveObjectiveWeights> = {
  conservative: {
    minimizePriceImpact: 0.3,
    minimizeVolatilityAmplification: 0.3,
    maximizeLiquidityEfficiency: 0.2,
    maximizeDiscoverySpeed: 0.05,
    maximizeGraduationProbability: 0.15,
  },
  balanced: {
    minimizePriceImpact: 0.2,
    minimizeVolatilityAmplification: 0.2,
    maximizeLiquidityEfficiency: 0.2,
    maximizeDiscoverySpeed: 0.2,
    maximizeGraduationProbability: 0.2,
  },
  growth: {
    minimizePriceImpact: 0.1,
    minimizeVolatilityAmplification: 0.1,
    maximizeLiquidityEfficiency: 0.15,
    maximizeDiscoverySpeed: 0.35,
    maximizeGraduationProbability: 0.3,
  },
};
