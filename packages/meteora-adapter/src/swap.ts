import { PublicKey, type Connection, type Transaction } from "@solana/web3.js";
import BN from "bn.js";
import { getDbcClient } from "./client";

export interface BuildSwapTransactionResult {
  transaction: Transaction;
}

/**
 * Builds (does not send) a real `swap` transaction against a live, already
 * deployed DBC pool. Unlike config/pool creation, this needs no ephemeral
 * keypair — the only signer is the caller's own wallet (`owner`), which the
 * browser signs client-side, same pattern as every other transaction in
 * this app (see `prepareForWalletSignature`).
 */
export async function buildSwapTransaction(params: {
  connection: Connection;
  poolAddress: PublicKey;
  owner: PublicKey;
  amountIn: BN;
  minimumAmountOut: BN;
  /** true = spend the pool's base (project) token to receive quote; false = spend quote to receive base. */
  swapBaseForQuote: boolean;
}): Promise<BuildSwapTransactionResult> {
  const { connection, poolAddress, owner, amountIn, minimumAmountOut, swapBaseForQuote } = params;
  const client = getDbcClient(connection);

  const transaction = await client.pool.swap({
    owner,
    pool: poolAddress,
    amountIn,
    minimumAmountOut,
    swapBaseForQuote,
    referralTokenAccount: null,
  });

  return { transaction };
}

export interface SwapAmountInInput {
  side: "buy" | "sell";
  /** USD-denominated input (either side). */
  amountUsd?: number;
  /** Exact base-token input (sells only; the schema enforces this before we get here). */
  amountTokens?: number;
  /** Pool spot price in quote-token units per base token. */
  priceInQuote: number;
  quoteUsdPrice: number;
  tokenBaseDecimal: number;
  tokenQuoteDecimal: number;
}

/**
 * Converts the human-readable amount a user typed into the raw integer
 * `amountIn` the DBC program expects (base units of the INPUT token).
 * Shared by the quote and swap routes so a preview can never drift from
 * the transaction actually built. Built from a BigInt string rather than
 * `new BN(number)`, which throws above 2^53. Anything non-finite or
 * non-positive collapses to 0 so callers can reject it uniformly.
 */
export function computeSwapAmountIn(input: SwapAmountInInput): BN {
  const humanAmount =
    input.side === "sell"
      ? (input.amountTokens ?? (input.amountUsd ?? 0) / (input.priceInQuote * input.quoteUsdPrice))
      : (input.amountUsd ?? 0) / input.quoteUsdPrice;
  const decimals = input.side === "sell" ? input.tokenBaseDecimal : input.tokenQuoteDecimal;

  const raw = Math.round(humanAmount * 10 ** decimals);
  if (!Number.isFinite(raw) || raw <= 0) return new BN(0);
  return new BN(BigInt(raw).toString());
}
