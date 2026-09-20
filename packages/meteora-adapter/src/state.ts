import type { Connection, PublicKey } from "@solana/web3.js";
import { getBaseTokenForSwap, getPriceFromSqrtPrice, type PoolConfig, type TokenDecimal, type VirtualPool } from "@meteora-ag/dynamic-bonding-curve-sdk";
import Decimal from "decimal.js";
import BN from "bn.js";
import { getDbcClient } from "./client";

export interface LivePoolState {
  poolAddress: string;
  configAddress: string;
  baseMint: string;
  quoteMint: string;
  /** Raw lamports/native-decimal amounts, as strings to avoid float precision loss upstream. */
  quoteReserveRaw: string;
  baseReserveRaw: string;
  sqrtPriceRaw: string;
  tokenBaseDecimal: number;
  tokenQuoteDecimal: number;
  priceInQuote: number;
  quoteTokenCurveProgress: number;
  baseTokenCurveProgress: number;
  migrationQuoteThresholdRaw: string;
  isMigrated: boolean;
}

// A mint's decimals never change, so one read per mint is enough (this runs on every pool-state read).
const mintDecimalsCache = new Map<string, number>();

/** Decimals of an SPL mint, read from the chain. Throws rather than guessing when the mint cannot be read. */
export async function readMintDecimals(connection: Connection, mint: PublicKey): Promise<number> {
  const cached = mintDecimalsCache.get(mint.toBase58());
  if (cached !== undefined) return cached;
  const info = await connection.getParsedAccountInfo(mint, "confirmed");
  const data = info.value?.data;
  const decimals = data && typeof data === "object" && "parsed" in data ? (data.parsed as { info?: { decimals?: unknown } })?.info?.decimals : undefined;
  if (typeof decimals !== "number") throw new Error(`Could not read the decimals of mint ${mint.toBase58()} from the chain.`);
  mintDecimalsCache.set(mint.toBase58(), decimals);
  return decimals;
}

/** Pool price (quote per base) at a given sqrt price — the SDK's own conversion. */
export function sqrtPriceToPrice(sqrtPrice: BN, baseDecimals: number, quoteDecimals: number): number {
  return getPriceFromSqrtPrice(sqrtPrice, baseDecimals as TokenDecimal, quoteDecimals as TokenDecimal).toNumber();
}

const clamp01 = (n: number) => Math.min(Math.max(n, 0), 1);

/**
 * The SDK's own curve-progress formulas, evaluated on the pool and config already in hand. The SDK's
 * `getPool*CurveProgress` helpers re-fetch both accounts on every call, which tripled the RPC cost of a state read.
 */
export function curveProgress(pool: Pick<VirtualPool["poolState"], "quoteReserve" | "sqrtPrice">, config: Pick<PoolConfig, "migrationQuoteThreshold" | "sqrtStartPrice" | "migrationSqrtPrice" | "curve">): { quote: number; base: number } {
  const quote = clamp01(new Decimal(pool.quoteReserve.toString()).div(new Decimal(config.migrationQuoteThreshold.toString())).toNumber());
  const baseSold = new Decimal(getBaseTokenForSwap(config.sqrtStartPrice, pool.sqrtPrice, config.curve).toString());
  const baseTotal = new Decimal(getBaseTokenForSwap(config.sqrtStartPrice, config.migrationSqrtPrice, config.curve).toString());
  return { quote, base: clamp01(baseSold.div(baseTotal).toNumber()) };
}

function decimalAmountToNumber(raw: BN, decimals: number): number {
  return Number(raw.toString()) / 10 ** decimals;
}

/**
 * Reads real on-chain state for a deployed pool: reserves, price, curve
 * progress toward migration. Returns `null` if the pool does not exist —
 * callers must render a "Pool not found" state, never fabricated data.
 */
export async function getLivePoolState(connection: Connection, poolAddress: PublicKey): Promise<LivePoolState | null> {
  const client = getDbcClient(connection);
  const pool = await client.state.getPool(poolAddress);
  if (!pool) return null;

  const config: PoolConfig | null = await client.state.getPoolConfig(pool.poolState.config);
  if (!config) return null;

  const tokenBaseDecimal = config.tokenDecimal as unknown as TokenDecimal;
  const tokenQuoteDecimal = await readMintDecimals(connection, config.quoteMint);

  const priceDecimal = getPriceFromSqrtPrice(pool.poolState.sqrtPrice, tokenBaseDecimal, tokenQuoteDecimal as TokenDecimal);

  const { quote: quoteTokenCurveProgress, base: baseTokenCurveProgress } = curveProgress(pool.poolState, config);

  return {
    poolAddress: poolAddress.toBase58(),
    configAddress: pool.poolState.config.toBase58(),
    baseMint: pool.poolState.baseMint.toBase58(),
    quoteMint: config.quoteMint.toBase58(),
    quoteReserveRaw: pool.poolState.quoteReserve.toString(),
    baseReserveRaw: pool.poolState.baseReserve.toString(),
    sqrtPriceRaw: pool.poolState.sqrtPrice.toString(),
    tokenBaseDecimal,
    tokenQuoteDecimal,
    priceInQuote: priceDecimal.toNumber(),
    quoteTokenCurveProgress,
    baseTokenCurveProgress,
    migrationQuoteThresholdRaw: config.migrationQuoteThreshold.toString(),
    isMigrated: quoteTokenCurveProgress >= 1,
  };
}

export function reserveToNumber(raw: string, decimals: number): number {
  return decimalAmountToNumber(new BN(raw), decimals);
}

/**
 * Real on-chain existence check for a DBC config account — used (ELF V1
 * Phase 3) to confirm a `createConfig` transaction actually landed
 * before building a dependent `createPoolWithFirstBuy` transaction,
 * rather than trusting a client's self-report that it sent + confirmed.
 */
export async function configExistsOnChain(connection: Connection, configAddress: PublicKey): Promise<boolean> {
  const client = getDbcClient(connection);
  const config = await client.state.getPoolConfig(configAddress);
  return config !== null;
}
