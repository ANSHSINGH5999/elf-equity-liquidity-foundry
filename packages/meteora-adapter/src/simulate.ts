import type { Connection, Transaction } from "@solana/web3.js";

export class TransactionSimulationError extends Error {
  logs: string[] | null;
  constructor(message: string, logs: string[] | null) {
    super(message);
    this.name = "TransactionSimulationError";
    this.logs = logs;
  }
}

/**
 * Simulates a fully-assembled transaction (blockhash set, ephemeral
 * server-side signers already attached) before it's returned to the
 * browser for wallet signing. Calling `simulateTransaction` on a legacy
 * `Transaction` with no `signers` argument makes web3.js omit
 * `sigVerify` entirely (RPC default: false) — required here since the
 * wallet's own signature isn't present yet. web3.js also transparently
 * refetches its own blockhash for this simulation-only copy; that's
 * fine, since a blockhash swap doesn't change whether the instructions
 * themselves would execute successfully.
 *
 * Throws `TransactionSimulationError` on failure so callers can surface
 * a specific, actionable message instead of only discovering the
 * problem after a wallet round-trip.
 */
export async function simulateBeforeSigning(connection: Connection, transaction: Transaction): Promise<void> {
  const result = await connection.simulateTransaction(transaction);

  if (result.value.err === "AccountNotFound" && transaction.feePayer) {
    // The runtime rejects a transaction whose fee payer has no account before running any
    // instruction (no logs, 0 compute units). Confirm that against the chain instead of assuming it,
    // so the user is told which wallet to fund rather than shown a bare "AccountNotFound".
    const feePayerInfo = await connection.getAccountInfo(transaction.feePayer, "confirmed");
    if (feePayerInfo === null) {
      throw new TransactionSimulationError(
        `Transaction simulation failed: AccountNotFound — the fee payer ${transaction.feePayer.toBase58()} has no account on this network (it has never received SOL here). Fund that wallet on this network, or connect a funded wallet, and try again.`,
        result.value.logs,
      );
    }
  }

  if (result.value.err) {
    throw new TransactionSimulationError(
      `Transaction simulation failed: ${JSON.stringify(result.value.err)}`,
      result.value.logs,
    );
  }
}
