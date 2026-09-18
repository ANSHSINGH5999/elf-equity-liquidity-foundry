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
