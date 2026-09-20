import type { Connection, Transaction } from "@solana/web3.js";
import { classifySendError, confirmTransactionByPolling, transactionSignature, type ConfirmationOptions, type ConfirmationOutcome, type ConfirmationRpc } from "@elf/solana";

type SubmitConnection = Pick<Connection, "sendRawTransaction"> & ConfirmationRpc;
type FollowUp = Omit<ConfirmationOptions, "signature" | "lastValidBlockHeight">;

export interface SubmitResult {
  signature: string;
  outcome: ConfirmationOutcome;
}

/**
 * Sends a wallet-signed transaction exactly ONCE and then only ever looks it up by signature.
 *
 * The signature is read from the signed transaction itself, so it is known even if the send request times out after the
 * cluster accepted it. A send that fails in a way that proves rejection (preflight simulation failed) is rethrown; a
 * send that fails in an unknown way (timeout, dropped connection, rate limit) is NOT retried — the signature is looked
 * up instead, and the transaction either shows up, expires, or is reported as unresolved. Preflight stays ON.
 */
export async function submitAndConfirm(
  connection: SubmitConnection,
  signed: Transaction,
  options: { lastValidBlockHeight: number; onSubmitted: (signature: string) => void } & FollowUp,
): Promise<SubmitResult> {
  const { lastValidBlockHeight, onSubmitted, ...followUp } = options;
  let signature = transactionSignature(signed);
  try {
    signature = await connection.sendRawTransaction(signed.serialize(), { skipPreflight: false });
  } catch (error) {
    if (classifySendError(error) === "rejected") throw error;
  }
  onSubmitted(signature);
  return { signature, outcome: await confirmTransactionByPolling(connection, { ...followUp, signature, lastValidBlockHeight }) };
}

/** "Check status again": a look-up only. It has no way to send, so it cannot create a second transaction. */
export function checkStatusAgain(connection: ConfirmationRpc, signature: string, lastValidBlockHeight: number, options: FollowUp = {}): Promise<ConfirmationOutcome> {
  return confirmTransactionByPolling(connection, { timeoutMs: 20_000, ...options, signature, lastValidBlockHeight });
}
