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

/** Price impact (bps) above which the simulation flags a trade — the same cutoff the design-flow simulation step has always used. */
export const PRICE_IMPACT_WATCH_BPS = 500;

export interface SimulationTradeResult {
  tradeSizeUsd: TradeSizeUsd;
  side: "buy" | "sell";
  estimatedExecutionPrice: number;
  estimatedPriceImpactBps: number;
  postTradePrice: number;
  /** Quote reserve (USD) after this trade, from the SDK's own curve integral; null when the trade could not be filled. */
  reserveQuoteAfter: number | null;
  /** Not calculated by the engine. */
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
  /**
   * Optional: absent on results stored before the Simulation Lab existed.
   * `curveProgressFraction` is ELF's positioning heuristic (linear in sqrt-price
   * space) — NOT quote-reserve progress; use `startQuoteReserveUsd` for that.
   */
  curveProgressFraction?: number;
  startPriceUsd?: number;
  /** Real quote reserve (USD) at the scenario's start position (SDK curve integral). */
  startQuoteReserveUsd?: number;
  /** Real DBC graduation trigger: the quote reserve (USD) the pool must reach. */
  migrationThresholdUsd?: number;
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

/**
 * `not_applicable` is a first-class state (not a missing one): Meteora DBC
 * graduation is triggered by exactly one on-chain condition — quote reserve
 * reaching `migrationQuoteThreshold` — so "volume" and "market cap" are
 * reported as not-applicable rather than invented as extra gates.
 */
export type GraduationConditionState = "satisfied" | "unsatisfied" | "not_applicable" | "unavailable";

export interface GraduationCondition {
  id: "quote_reserve_threshold" | "volume_requirement" | "market_cap_requirement" | "migration_executed";
  label: string;
  state: GraduationConditionState;
  /** Static explanatory sentence — never contains a live number; the UI formats numbers from `GraduationStatus` itself. */
  detail: string;
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

/**
 * Precise reason a feed has no live price — see `classifyHermesError` in
 * apps/web/src/lib/server/pyth.ts, which live-verified (2026-09-18) that
 * Hermes returns 403 for both a malformed key and a valid key lacking a
 * feed's entitlement, distinguished only by response body text.
 */
export type PythUnavailableReason = "not_configured" | "unauthenticated" | "entitlement_restricted" | "rate_limited" | "unavailable";

export interface PriceOracleFeed {
  kind: PythFeedKind;
  label: string;
  feedSymbol: string;
  feedId: string;
  /** null when the feed exists but PYTH_API_KEY isn't configured, or the pull failed. */
  priceUsd: number | null;
  publishTime: string | null;
  unavailableReason: PythUnavailableReason | null;
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
  graduationChecklist: GraduationCondition[];
  marketQualityScore: MarketQualityScoreResult;
  referencePriceUsd: number;
  /** "pyth" only when a live Hermes feed matched the asset's ticker; otherwise the issuer-declared value. */
  referencePriceSource: "pyth" | "issuer_declared";
  referencePriceFeedSymbol: string | null;
  priceOracle: PriceOracleFeed[];
  freshness: DataFreshness;
}

/**
 * Issuer risk indicators (Feature E). Statuses are deliberately limited to
 * three: there is no LOW/MEDIUM/HIGH composite "risk score" because no
 * defensible aggregate formula exists. Every indicator carries the formula
 * that produced it (`formula`) so the number on screen is auditable.
 */
export type RiskStatus = "NORMAL" | "WATCH" | "DATA_UNAVAILABLE";

export interface RiskIndicator {
  id:
    | "liquidity"
    | "price_deviation"
    | "oracle"
    | "trading_activity"
    | "volume_concentration"
    | "large_trades"
    | "indexer_health";
  label: string;
  status: RiskStatus;
  /** The measured value behind the status, or null when it could not be measured. */
  value: number | null;
  unit: "pct" | "count" | null;
  /** How `value` and `status` were derived — shown to the issuer, kept in sync with the tests. */
  formula: string;
  /** Extra context (e.g. the exact Pyth restriction reason); null when there is nothing to add. */
  note: string | null;
}

/** Indexer lag (seconds) beyond which data is "delayed" — one definition for the freshness badge, the risk indicator and market health. */
export const INDEXER_DELAYED_AFTER_SECONDS = 300;

/**
 * Market Health & Anomaly Engine. Events describe MEASURABLE conditions only —
 * never fraud, manipulation or intent — and there is no composite score.
 * `INFO` events report data-availability facts (oracle, graduation) and do not
 * change the market's status; only `WATCH` events do.
 */
export type HealthEventType =
  | "LIQUIDITY_DROP"
  | "VOLUME_SPIKE"
  | "TRADE_FREQUENCY_SPIKE"
  | "LARGE_TRADE"
  | "TRADE_CONCENTRATION"
  | "PRICE_DEVIATION"
  | "ORACLE_UNAVAILABLE"
  | "ORACLE_RESTRICTED"
  | "INDEXER_LAG"
  | "GRADUATION_REACHED";

export type HealthEventSeverity = "WATCH" | "INFO";
export type HealthDataSource = "ON_CHAIN" | "INDEXED" | "PYTH";
export type HealthUnit = "usd" | "pct" | "count" | "multiple" | "seconds";

export interface HealthEvent {
  /** Stable id: type plus the data point it is anchored to. */
  id: string;
  type: HealthEventType;
  severity: HealthEventSeverity;
  /** When the underlying data point happened (trade / liquidity reading / event time); null for a current-state condition. */
  occurredAt: string | null;
  metric: string;
  unit: HealthUnit | null;
  observed: number | null;
  reference: number | null;
  /** What `reference` is and its unit (it can differ from `unit`, which describes `observed` and `threshold`). */
  referenceLabel: string | null;
  referenceUnit: HealthUnit | null;
  threshold: number | null;
  explanation: string;
  dataSources: HealthDataSource[];
  /** On-chain signature of the transaction behind the event, when there is one. */
  signature: string | null;
}

export type HealthSignalId =
  | "liquidity"
  | "volume"
  | "trade_frequency"
  | "large_trades"
  | "concentration"
  | "price_reference"
  | "oracle"
  | "indexer"
  | "graduation";

export interface HealthCheck {
  id: HealthSignalId;
  label: string;
  status: RiskStatus;
  detail: string;
}

export interface HealthThresholds {
  /** Window (hours) the latest activity is measured over. */
  recentWindowHours: number;
  /** Window (hours) before the recent window used as the market's own baseline. */
  baselineWindowHours: number;
  /** WATCH when liquidity falls more than this % from its peak within the recent window. */
  liquidityDropPct: number;
  /** WATCH when recent hourly volume / baseline hourly volume exceeds this. */
  volumeSpikeMultiple: number;
  /** WATCH when recent trades-per-hour / baseline trades-per-hour exceeds this. */
  tradeFrequencyMultiple: number;
  /** Minimum trades for a comparison to be evaluated at all (baseline, recent, concentration). */
  minSampleTrades: number;
  /** Reused from RISK_THRESHOLDS: WATCH when |DBC − live Pyth reference| / reference exceeds this %. */
  priceDeviationPct: number;
  /** Reused from RISK_THRESHOLDS: LARGE_TRADE when a trade exceeds this fraction of current liquidity. */
  largeTradeLiquidityShare: number;
  /** Reused from RISK_THRESHOLDS: TRADE_CONCENTRATION when one wallet exceeds this fraction of 24h volume. */
  topTraderVolumeShare: number;
  /** Reused: INDEXER_DELAYED_AFTER_SECONDS. */
  indexerLagSeconds: number;
}

export interface MarketHealth {
  engine: "elf-deterministic-market-health-v1";
  status: RiskStatus;
  evaluatedAt: string;
  events: HealthEvent[];
  watchEventCount: number;
  checks: HealthCheck[];
  /** Events that carry a real timestamp, oldest first. Only observed events — no inferred status changes. */
  timeline: HealthEvent[];
  thresholds: HealthThresholds;
  disclaimer: string;
}

export interface IssuerDashboard {
  overview: MarketOverview;
  totalTrades: number;
  uniqueTradersAllTime: number;
  targetLiquidityUsd: number;
  indicators: RiskIndicator[];
  health: MarketHealth;
}

/**
 * Market analyst (Feature D). The analysis is a descriptive reading of real
 * ELF data — never advice and never a forecast. Every claim is traceable:
 * `dataUsed` lists the exact values the analysis read, `dataSources` says
 * which platform sources were actually available, and `unavailableData`
 * names what could not be measured instead of guessing.
 */
export type AnalystSourceId = "dbc" | "indexer" | "pyth" | "market_config";

export interface AnalysisSection {
  id: "overview" | "liquidity" | "trading_activity" | "oracle" | "graduation";
  heading: string;
  lines: string[];
}

export interface AnalysisObservation {
  text: string;
  sources: AnalystSourceId[];
}

export interface AnalysisDataSource {
  id: AnalystSourceId;
  label: string;
  available: boolean;
  detail: string;
}

export interface MarketAnalysis {
  /** `rule_based` = deterministic ELF logic over live data (no LLM). `llm` is reserved for a future provider. */
  provider: { id: string; kind: "rule_based" | "llm" };
  sections: AnalysisSection[];
  observations: AnalysisObservation[];
  dataSources: AnalysisDataSource[];
  /** Things that could not be measured — always includes live market cap, which ELF does not read on-chain. */
  unavailableData: string[];
  /** The exact input values the analysis read, so any number in the prose can be checked. */
  dataUsed: Record<string, string | number | boolean | null>;
  disclaimer: string;
}

// --- Market Launch Copilot -------------------------------------------------
// A deterministic launch PLAN assembled from ELF's existing engines (curve
// compiler, simulation engine, Meteora SDK validation, Pyth integration).
// It is a proposal only: nothing here deploys anything.

/**
 * The simulation engine reports a trade it cannot fill against the remaining
 * curve depth as exactly this impact (100%, in basis points). Single source of
 * truth for both the engine that emits it and the plan that warns about it.
 */
export const SIMULATION_MAX_IMPACT_BPS = 10_000;

/** pass / fail are real verdicts; unavailable = could not be evaluated (never a guess); not_run = a step the user has not run yet. */
export type LaunchCheckStatus = "pass" | "fail" | "unavailable" | "not_run";

export interface LaunchCheck {
  id: "configuration" | "liquidity_parameters" | "curve_parameters" | "graduation_configuration" | "oracle_configuration" | "simulation";
  label: string;
  status: LaunchCheckStatus;
  detail: string;
}

/** Outcome of running Meteora's own config validation on a compiled candidate (packages/meteora-adapter/src/validate.ts). */
export type ConfigValidationResult =
  | { status: "valid"; derivedThresholdQuote: number | null; derivedThresholdUsd: number | null }
  | { status: "invalid"; error: string }
  | { status: "unavailable"; reason: string };

export type LaunchOracleState = "live" | "no_feed" | PythUnavailableReason;

export interface LaunchPlanOracleFeed {
  kind: PythFeedKind;
  feedSymbol: string;
  state: "live" | PythUnavailableReason;
  priceUsd: number | null;
}

export interface LaunchScenarioSummary {
  scenario: SimulationScenarioKind;
  description: string;
  worstCasePriceImpactBps: number;
  /** Simulated trades that hit the engine's impact cap, i.e. could not be filled against the curve's depth. */
  unfillableTrades: number;
}

export type SimulationEvaluation =
  | { status: "not_run" }
  | { status: "completed"; label: "SIMULATED"; scenarios: LaunchScenarioSummary[] }
  | { status: "invalid"; reasons: string[] };

export interface LaunchPlan {
  engine: "elf-deterministic-launch-planner-v1";
  asset: Pick<TokenizedAsset, "id" | "name" | "symbol" | "issuer" | "assetType" | "referencePriceUsd" | "source" | "mintAddress">;
  profile: Pick<
    MarketProfile,
    "initialLiquidityUsd" | "expectedVolatility" | "riskProfile" | "targetLiquidityUsd" | "targetGraduationUsd" | "quoteToken"
  >;
  curve: {
    candidateId: string;
    label: string;
    riskProfile: RiskProfile;
    rationale: string;
    isRecommended: boolean;
    initialMarketCapUsd: number;
    migrationMarketCapUsd: number;
    tokenSupply: number;
    /** initialMarketCapUsd ÷ tokenSupply — the curve's actual starting price. */
    impliedStartPriceUsd: number;
    referencePriceUsd: number;
    scoreComposite: number;
  };
  liquidity: LiquidityDistributionSummary & Pick<MarketProfile, "initialLiquidityUsd" | "targetLiquidityUsd" | "quoteToken">;
  trading: FeeScheduleSummary;
  graduation: {
    /** The one on-chain condition. There is no separate volume or market-cap gate. */
    trigger: string;
    declaredTargetUsd: number;
    /** The threshold Meteora's own curve builder derived, in quote-token units / USD; null when it could not be derived. */
    derivedThresholdQuote: number | null;
    derivedThresholdUsd: number | null;
    quoteToken: QuoteToken;
    migrationOption: MigrationSummary["migrationOption"];
    migrationFeeBps: number;
    percentageSupplyOnMigration: number;
  };
  oracle: { state: LaunchOracleState; headline: string; note: string; feeds: LaunchPlanOracleFeed[] };
  simulation: SimulationEvaluation;
  checks: LaunchCheck[];
  warnings: string[];
  assumptions: string[];
}

export interface ApprovalGate {
  allowed: boolean;
  /** Empty when allowed; otherwise every reason the user cannot proceed to wallet review yet. */
  blockers: string[];
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

/**
 * ELF SIMULATION LAB — an OFF-CHAIN analytical view of ONE stored curve
 * configuration under ONE supported scenario. Nothing here is a blockchain
 * result: every value comes from ELF's simulation engine (Meteora's curve math
 * evaluated at an assumed position), and every result carries the label.
 */
export type LabCheckStatus = "pass" | "warn" | "fail" | "unavailable";

export interface LabCheck {
  id: "configuration" | "simulation_output" | "price_impact" | "fillable" | "reserve_change" | "live_indicators";
  label: string;
  status: LabCheckStatus;
  detail: string;
}

export interface SimulatedGraduationState {
  label: "SIMULATED GRADUATION STATE";
  /** The one real DBC condition being evaluated. */
  condition: "quote_reserve_reaches_migration_threshold";
  migrationThresholdUsd: number;
  startQuoteReserveUsd: number;
  /** computeGraduationStatus applied to the scenario's start position. */
  startPercentComplete: number;
  /** Per trade, in scenario order: would the pool's quote reserve reach the threshold after it? null = trade could not be filled. */
  trades: { tradeSizeUsd: number; side: "buy" | "sell"; reserveAfterUsd: number | null; percentAfter: number | null; reachesThreshold: boolean | null }[];
  anyTradeReachesThreshold: boolean;
}

export interface LabRunParameters {
  curveProgressFraction: number;
  sides: ("buy" | "sell")[];
  /** True when the user changed anything from the scenario's own definition. */
  customised: boolean;
}

export interface LabRunResult {
  label: "SIMULATION — OFF-CHAIN";
  runId: string;
  curveCandidateId: string;
  curveLabel: string;
  scenario: SimulationScenarioKind;
  parameters: LabRunParameters;
  result: SimulationScenarioResult;
  graduation: SimulatedGraduationState | null;
  checks: LabCheck[];
  warnings: string[];
  createdAt: string;
}

// --- External market context (CoinCap) ---------------------------------------
// EXTERNAL crypto market context only. It never replaces the on-chain Meteora DBC price.

/** Only fields CoinCap actually returned are numbers; anything absent or non-numeric is null (never 0). */
export interface ExternalMarketData {
  provider: "CoinCap";
  assetId: string;
  symbol: string;
  priceUsd: number;
  marketCapUsd: number | null;
  volume24hUsd: number | null;
  changePercent24h: number | null;
  /** The provider's own timestamp (ISO 8601). */
  timestamp: string;
}

export type ExternalMarketUnavailableReason = "not_configured" | "not_listed" | "rate_limited" | "unavailable" | "malformed";

export type ExternalMarketResult =
  | { status: "ok"; data: ExternalMarketData }
  | { status: "unavailable"; reason: ExternalMarketUnavailableReason; message: string };

export interface ExternalMarketContext {
  marketId: string;
  /** The market's quote token (SOL / USDC) priced by CoinCap. */
  quote: { token: string; result: ExternalMarketResult };
  /** The market's own asset, only when CoinCap lists an asset with the same symbol AND name. */
  asset: { symbol: string; result: ExternalMarketResult };
}

// --- AI market analysis (Groq) -----------------------------------------------
// Groq explains a server-built snapshot of verified ELF data. It is never a source of truth.

export interface AiMarketAnalysis {
  summary: string;
  marketObservations: string[];
  riskObservations: string[];
  liquidityObservations: string[];
  activityObservations: string[];
  graduationObservations: string[];
  /** Built by the server from the verified snapshot — never written by the model. */
  evidence: string[];
  limitations: string[];
}

export interface AiMarketAnalysisResponse {
  status: "ok";
  analysis: AiMarketAnalysis;
  meta: {
    provider: "Groq";
    model: string;
    generatedAt: string;
    /** When the verified snapshot the analysis explains was taken. */
    snapshotAt: string;
    dataSource: string;
    cached: boolean;
    /** Model statements dropped because they cited a number, address or claim not in the snapshot. */
    droppedUngrounded: number;
  };
}
