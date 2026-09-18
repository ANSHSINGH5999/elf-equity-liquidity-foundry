import type { Connection, PublicKey } from "@solana/web3.js";
import BN from "bn.js";
import {
  MAX_SQRT_PRICE,
  SwapMode,
  getPriceFromSqrtPrice,
  type ConfigParameters,
  type SwapQuote2Result,
  type TokenDecimal,
} from "@meteora-ag/dynamic-bonding-curve-sdk";
import { getDbcClient } from "./client";

export interface SimulatedQuoteInput {
  configParameters: ConfigParameters;
  /** Trade direction from the trader's perspective: true = selling base for quote. */
  swapBaseForQuote: boolean;
  amountIn: BN;
  /** Slot/timestamp point simulating how far into the fee schedule the trade happens. Defaults to 0 (pool just launched). */
  currentPoint?: BN;
  slippageBps?: number;
}

/**
 * Quotes a trade against a curve BEFORE any pool exists on-chain, using
 * Meteora's own `getQuoteFromInputAmount` math against the built
 * `ConfigParameters`. This is the real curve math the deployed pool will
 * use — not an approximation — which is why ELF's simulation step can
 * legitimately claim its numbers come from the actual bonding curve.
 */
export function simulatePreDeploymentQuote(
  connection: Connection,
  input: SimulatedQuoteInput,
): SwapQuote2Result {
  const client = getDbcClient(connection);
  return client.pool.getQuoteFromInputAmount({
    config: input.configParameters,
    swapBaseForQuote: input.swapBaseForQuote,
    amountIn: input.amountIn,
    swapMode: SwapMode.ExactIn,
    hasReferral: false,
    currentPoint: input.currentPoint ?? new BN(0),
    eligibleForFirstSwapWithMinFee: false,
    slippageBps: input.slippageBps,
  });
}

export interface CurvePositionQuoteInput {
  configParameters: ConfigParameters;
  /**
   * ELF's own scenario-positioning heuristic, in [0, 1]: how far along the
   * price range from `sqrtStartPrice` to the curve's final checkpoint this
   * scenario assumes the market has already moved, before the simulated
   * trade happens. Linear in sqrt-price space, not in tokens sold — a
   * deliberate approximation for ranking scenarios relative to each other,
   * not a claim of exact historical path. The swap math itself
   * (`calculateBaseToQuoteFromAmountIn`/`calculateQuoteToBaseFromAmountIn`)
   * depends only on the config and the current sqrt price, not on
   * reserves, so repositioning `sqrtStartPrice` is sufficient and correct.
   */
  curveProgressFraction: number;
  swapBaseForQuote: boolean;
  amountIn: BN;
  currentPoint?: BN;
  tokenBaseDecimal: TokenDecimal;
  tokenQuoteDecimal: TokenDecimal;
}

export interface CurvePositionQuoteResult {
  quote: SwapQuote2Result;
  startSqrtPrice: BN;
  /** Quote-per-base price at the scenario's assumed starting curve position. */
  startPriceInQuote: number;
  /** Quote-per-base price after the simulated trade executes. */
  postTradePriceInQuote: number;
}

/** Computes just the sqrt-price and human price at a curve position, with no swap. */
export function getCurvePositionStartPrice(
  configParameters: ConfigParameters,
  curveProgressFraction: number,
  tokenBaseDecimal: TokenDecimal,
  tokenQuoteDecimal: TokenDecimal,
): { startSqrtPrice: BN; startPriceInQuote: number; sqrtEnd: BN } {
  const curve = configParameters.curve;
  if (!curve || curve.length === 0) {
    throw new Error("configParameters.curve is empty — build the curve before simulating.");
  }
  const clampedFraction = Math.min(1, Math.max(0, curveProgressFraction));
  const percent = new BN(Math.round(clampedFraction * 10_000));
  const sqrtStart = configParameters.sqrtStartPrice;
  // `buildCurve` appends a trailing { sqrtPrice: MAX_SQRT_PRICE, ... }
  // segment to absorb rounding leftovers, when there is any. That sentinel
  // is not "the migration price" — it's a ceiling far beyond it — so skip
  // it when picking the checkpoint we treat as the curve's practical end.
  const lastCheckpoint = curve[curve.length - 1]!.sqrtPrice;
  const sqrtEnd =
    lastCheckpoint.eq(MAX_SQRT_PRICE) && curve.length > 1 ? curve[curve.length - 2]!.sqrtPrice : lastCheckpoint;
  const startSqrtPrice = sqrtStart.add(sqrtEnd.sub(sqrtStart).mul(percent).div(new BN(10_000)));
  const startPriceInQuote = getPriceFromSqrtPrice(startSqrtPrice, tokenBaseDecimal, tokenQuoteDecimal).toNumber();
  return { startSqrtPrice, startPriceInQuote, sqrtEnd };
}

export function simulateAtCurvePosition(
  connection: Connection,
  input: CurvePositionQuoteInput,
): CurvePositionQuoteResult {
  const { configParameters, curveProgressFraction, swapBaseForQuote, amountIn, tokenBaseDecimal, tokenQuoteDecimal } = input;

  const { startSqrtPrice, startPriceInQuote, sqrtEnd } = getCurvePositionStartPrice(
    configParameters,
    curveProgressFraction,
    tokenBaseDecimal,
    tokenQuoteDecimal,
  );

  const client = getDbcClient(connection);
  const quote = client.pool.getQuoteFromInputAmount({
    // `migrationSqrtPrice` is passed explicitly (rather than left for the
    // SDK to derive from `curve` + `migrationQuoteThreshold`) because that
    // derivation assumes `sqrtStartPrice` is the curve's true genesis
    // price; once we've repositioned it to simulate a later curve
    // position, re-deriving from it underflows. `sqrtEnd` is the same
    // curve-final checkpoint used to compute `startSqrtPrice` above, so
    // this stays consistent with the interpolation itself.
    config: { ...configParameters, sqrtStartPrice: startSqrtPrice, migrationSqrtPrice: sqrtEnd },
    swapBaseForQuote,
    amountIn,
    swapMode: SwapMode.ExactIn,
    hasReferral: false,
    currentPoint: input.currentPoint ?? new BN(0),
    eligibleForFirstSwapWithMinFee: false,
  });

  const postTradePriceInQuote = getPriceFromSqrtPrice(quote.nextSqrtPrice, tokenBaseDecimal, tokenQuoteDecimal).toNumber();

  return { quote, startSqrtPrice, startPriceInQuote, postTradePriceInQuote };
}

/**
 * Quotes a trade against a real, deployed pool's current on-chain state.
 * Used by the live market-analytics endpoints to report current
 * estimated slippage — always reflects the pool's actual reserves.
 */
export async function getOnchainSwapQuote(
  connection: Connection,
  poolAddress: PublicKey,
  amountIn: BN,
  swapBaseForQuote: boolean,
): Promise<SwapQuote2Result | null> {
  const client = getDbcClient(connection);
  const pool = await client.state.getPool(poolAddress);
  if (!pool) return null;

  const config = await client.state.getPoolConfig(pool.poolState.config);
  if (!config) return null;

  return client.pool.swapQuote2({
    virtualPool: pool,
    config,
    swapBaseForQuote,
    amountIn,
    swapMode: SwapMode.ExactIn,
    hasReferral: false,
    currentPoint: new BN(Math.floor(Date.now() / 1000)),
    eligibleForFirstSwapWithMinFee: false,
  });
}
