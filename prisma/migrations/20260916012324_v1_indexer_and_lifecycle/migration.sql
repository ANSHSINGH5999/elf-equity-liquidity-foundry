-- CreateEnum
CREATE TYPE "LaunchStage" AS ENUM ('DRAFT', 'CONFIGURED', 'AWAITING_CONFIG_SIGNATURE', 'CONFIG_CREATED', 'AWAITING_POOL_SIGNATURE', 'POOL_CREATED', 'LIVE', 'GRADUATED', 'CLOSED', 'FAILED');

-- CreateEnum
CREATE TYPE "TradeSide" AS ENUM ('buy', 'sell');

-- AlterTable
ALTER TABLE "launches" ADD COLUMN     "base_mint_keypair_secret" TEXT,
ADD COLUMN     "config_keypair_secret" TEXT,
ADD COLUMN     "stage" "LaunchStage" NOT NULL DEFAULT 'DRAFT';

-- CreateTable
CREATE TABLE "trades" (
    "id" TEXT NOT NULL,
    "market_id" TEXT NOT NULL,
    "signature" TEXT NOT NULL,
    "trader" TEXT NOT NULL,
    "side" "TradeSide" NOT NULL,
    "token_amount" DOUBLE PRECISION NOT NULL,
    "quote_amount" DOUBLE PRECISION NOT NULL,
    "price_usd" DOUBLE PRECISION NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "trades_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "price_history" (
    "id" TEXT NOT NULL,
    "market_id" TEXT NOT NULL,
    "price_usd" DOUBLE PRECISION NOT NULL,
    "source" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "price_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "liquidity_history" (
    "id" TEXT NOT NULL,
    "market_id" TEXT NOT NULL,
    "liquidity_usd" DOUBLE PRECISION NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "liquidity_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "graduation_events" (
    "id" TEXT NOT NULL,
    "market_id" TEXT NOT NULL,
    "signature" TEXT NOT NULL,
    "final_state" JSONB NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "graduation_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "indexer_cursors" (
    "pool_address" TEXT NOT NULL,
    "last_signature" TEXT,
    "last_indexed_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "indexer_cursors_pkey" PRIMARY KEY ("pool_address")
);

-- CreateIndex
CREATE UNIQUE INDEX "trades_signature_key" ON "trades"("signature");

-- CreateIndex
CREATE INDEX "idx_trades_market_timestamp" ON "trades"("market_id", "timestamp");

-- CreateIndex
CREATE INDEX "idx_price_history_market_timestamp" ON "price_history"("market_id", "timestamp");

-- CreateIndex
CREATE INDEX "idx_liquidity_history_market_timestamp" ON "liquidity_history"("market_id", "timestamp");

-- CreateIndex
CREATE UNIQUE INDEX "graduation_events_signature_key" ON "graduation_events"("signature");

-- CreateIndex
CREATE INDEX "idx_graduation_events_market_id" ON "graduation_events"("market_id");

-- CreateIndex
CREATE UNIQUE INDEX "launches_curve_config_id_key" ON "launches"("curve_config_id");

-- AddForeignKey
ALTER TABLE "trades" ADD CONSTRAINT "trades_market_id_fkey" FOREIGN KEY ("market_id") REFERENCES "launches"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "price_history" ADD CONSTRAINT "price_history_market_id_fkey" FOREIGN KEY ("market_id") REFERENCES "launches"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "liquidity_history" ADD CONSTRAINT "liquidity_history_market_id_fkey" FOREIGN KEY ("market_id") REFERENCES "launches"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "graduation_events" ADD CONSTRAINT "graduation_events_market_id_fkey" FOREIGN KEY ("market_id") REFERENCES "launches"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

