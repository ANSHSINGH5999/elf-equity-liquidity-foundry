-- CreateEnum
CREATE TYPE "AssetType" AS ENUM ('equity', 'pre_ipo', 'fund', 'other');

-- CreateEnum
CREATE TYPE "AssetSource" AS ENUM ('manual', 'prestocks', 'tessera');

-- CreateEnum
CREATE TYPE "RiskProfile" AS ENUM ('conservative', 'balanced', 'growth');

-- CreateEnum
CREATE TYPE "QuoteToken" AS ENUM ('SOL', 'USDC');

-- CreateEnum
CREATE TYPE "PoolStatus" AS ENUM ('not_deployed', 'pending_deployment', 'live', 'near_graduation', 'graduated');

-- CreateEnum
CREATE TYPE "MarketRegime" AS ENUM ('discovery', 'healthy', 'mature', 'stressed', 'recovery');

-- CreateTable
CREATE TABLE "assets" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "symbol" TEXT NOT NULL,
    "mint_address" TEXT NOT NULL,
    "issuer" TEXT NOT NULL,
    "asset_type" "AssetType" NOT NULL,
    "reference_price_usd" DOUBLE PRECISION NOT NULL,
    "source" "AssetSource" NOT NULL,
    "external_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "assets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "market_profiles" (
    "id" TEXT NOT NULL,
    "asset_id" TEXT NOT NULL,
    "initial_liquidity_usd" DOUBLE PRECISION NOT NULL,
    "expected_volatility" TEXT NOT NULL,
    "risk_profile" "RiskProfile" NOT NULL,
    "target_liquidity_usd" DOUBLE PRECISION NOT NULL,
    "target_graduation_usd" DOUBLE PRECISION NOT NULL,
    "quote_token" "QuoteToken" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "market_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "curve_configs" (
    "id" TEXT NOT NULL,
    "asset_id" TEXT NOT NULL,
    "market_profile_id" TEXT NOT NULL,
    "risk_profile" "RiskProfile" NOT NULL,
    "label" TEXT NOT NULL,
    "rationale" TEXT NOT NULL,
    "initial_market_cap_usd" DOUBLE PRECISION NOT NULL,
    "migration_market_cap_usd" DOUBLE PRECISION NOT NULL,
    "token_supply" DOUBLE PRECISION NOT NULL,
    "token_base_decimals" INTEGER NOT NULL,
    "fee_schedule" JSONB NOT NULL,
    "migration" JSONB NOT NULL,
    "liquidity_distribution" JSONB NOT NULL,
    "score" JSONB NOT NULL,
    "is_recommended" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "curve_configs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "simulation_runs" (
    "id" TEXT NOT NULL,
    "curve_config_id" TEXT NOT NULL,
    "scenarios" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "simulation_runs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "launches" (
    "id" TEXT NOT NULL,
    "asset_id" TEXT NOT NULL,
    "market_profile_id" TEXT NOT NULL,
    "curve_config_id" TEXT NOT NULL,
    "config_address" TEXT,
    "pool_address" TEXT,
    "base_mint" TEXT,
    "quote_mint" TEXT,
    "config_tx_signature" TEXT,
    "pool_tx_signature" TEXT,
    "status" "PoolStatus" NOT NULL DEFAULT 'not_deployed',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "launches_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pools" (
    "id" TEXT NOT NULL,
    "launch_id" TEXT NOT NULL,
    "pool_address" TEXT NOT NULL,
    "config_address" TEXT NOT NULL,
    "base_mint" TEXT NOT NULL,
    "quote_mint" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pools_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "market_snapshots" (
    "id" TEXT NOT NULL,
    "pool_address" TEXT NOT NULL,
    "price_usd" DOUBLE PRECISION NOT NULL,
    "volume_24h_usd" DOUBLE PRECISION NOT NULL,
    "liquidity_usd" DOUBLE PRECISION NOT NULL,
    "quote_reserve" DOUBLE PRECISION NOT NULL,
    "base_reserve" DOUBLE PRECISION NOT NULL,
    "curve_progress" DOUBLE PRECISION NOT NULL,
    "migration_threshold_usd" DOUBLE PRECISION NOT NULL,
    "graduation_progress" DOUBLE PRECISION NOT NULL,
    "estimated_slippage_bps" DOUBLE PRECISION NOT NULL,
    "market_quality_score" JSONB NOT NULL,
    "regime" "MarketRegime" NOT NULL,
    "status" "PoolStatus" NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "market_snapshots_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "idx_assets_mint_address" ON "assets"("mint_address");

-- CreateIndex
CREATE INDEX "idx_market_profiles_asset_id" ON "market_profiles"("asset_id");

-- CreateIndex
CREATE INDEX "idx_curve_configs_asset_id" ON "curve_configs"("asset_id");

-- CreateIndex
CREATE INDEX "idx_simulation_runs_curve_config_id" ON "simulation_runs"("curve_config_id");

-- CreateIndex
CREATE INDEX "idx_simulation_runs_timestamp" ON "simulation_runs"("created_at");

-- CreateIndex
CREATE INDEX "idx_launches_asset_id" ON "launches"("asset_id");

-- CreateIndex
CREATE INDEX "idx_launches_pool_address" ON "launches"("pool_address");

-- CreateIndex
CREATE UNIQUE INDEX "pools_launch_id_key" ON "pools"("launch_id");

-- CreateIndex
CREATE UNIQUE INDEX "pools_pool_address_key" ON "pools"("pool_address");

-- CreateIndex
CREATE INDEX "idx_pools_pool_address" ON "pools"("pool_address");

-- CreateIndex
CREATE INDEX "idx_market_snapshots_pool_address" ON "market_snapshots"("pool_address");

-- CreateIndex
CREATE INDEX "idx_market_snapshots_timestamp" ON "market_snapshots"("timestamp");

-- AddForeignKey
ALTER TABLE "market_profiles" ADD CONSTRAINT "market_profiles_asset_id_fkey" FOREIGN KEY ("asset_id") REFERENCES "assets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "curve_configs" ADD CONSTRAINT "curve_configs_asset_id_fkey" FOREIGN KEY ("asset_id") REFERENCES "assets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "curve_configs" ADD CONSTRAINT "curve_configs_market_profile_id_fkey" FOREIGN KEY ("market_profile_id") REFERENCES "market_profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "simulation_runs" ADD CONSTRAINT "simulation_runs_curve_config_id_fkey" FOREIGN KEY ("curve_config_id") REFERENCES "curve_configs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "launches" ADD CONSTRAINT "launches_asset_id_fkey" FOREIGN KEY ("asset_id") REFERENCES "assets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "launches" ADD CONSTRAINT "launches_market_profile_id_fkey" FOREIGN KEY ("market_profile_id") REFERENCES "market_profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "launches" ADD CONSTRAINT "launches_curve_config_id_fkey" FOREIGN KEY ("curve_config_id") REFERENCES "curve_configs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pools" ADD CONSTRAINT "pools_launch_id_fkey" FOREIGN KEY ("launch_id") REFERENCES "launches"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "market_snapshots" ADD CONSTRAINT "market_snapshots_pool_address_fkey" FOREIGN KEY ("pool_address") REFERENCES "pools"("pool_address") ON DELETE RESTRICT ON UPDATE CASCADE;
