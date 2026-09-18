import type { Connection, PublicKey } from "@solana/web3.js";
import { getPriceFromSqrtPrice, type PoolConfig, type TokenDecimal } from "@meteora-ag/dynamic-bonding-curve-sdk";
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
  const tokenQuoteDecimal = 9; // resolved precisely by the caller from the quote mint when needed for display

  const priceDecimal = getPriceFromSqrtPrice(pool.poolState.sqrtPrice, tokenBaseDecimal, tokenQuoteDecimal as TokenDecimal);

  const [quoteTokenCurveProgress, baseTokenCurveProgress] = await Promise.all([
    client.state.getPoolQuoteTokenCurveProgress(poolAddress),
    client.state.getPoolBaseTokenCurveProgress(poolAddress),
  ]);

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
