import bs58 from "bs58";
import type { Connection, SignatureStatus, Transaction } from "@solana/web3.js";
import { classifyRpcError, type RpcFailure } from "./connection";

/**
 * Transaction confirmation over plain HTTP.
 *
 * `connection.confirmTransaction` waits on a WebSocket `signatureSubscribe`. Some RPC providers (Alchemy on Solana)
 * accept the socket but answer every subscription with -32601 "Method not found", so a transaction that landed is
 * never noticed. This polls `getSignatureStatuses` instead and bounds the wait by the transaction's own lifetime
 * (`lastValidBlockHeight`) and a hard time limit, so the UI can neither hang nor call a landed transaction failed.
 *
 * THIS MODULE CAN NEVER SEND A TRANSACTION. The only connection surface it accepts is read-only (`ConfirmationRpc`),
 * so a confirmation problem cannot turn into a second, duplicate transaction.
 */
export type ConfirmationRpc = Pick<Connection, "getSignatureStatuses" | "getBlockHeight" | "getTransaction">;

export type ConfirmationCommitment = "confirmed" | "finalized";

export type ConfirmationOutcome =
  /** The chain reports the transaction at the requested commitment, with no error. */
  | { state: "confirmed"; commitment: ConfirmationCommitment; slot: number | null }
  /** The transaction executed on-chain and FAILED. `err` is the cluster's own error. */
  | { state: "failed"; err: unknown }
  /** Its block height passed `lastValidBlockHeight` and the last look-ups (status incl. history, getTransaction) found nothing: it can never land. */
  | { state: "expired" }
  /** Our hard time limit was reached while it was still valid. It may yet land: it was neither rejected nor expired. */
  | { state: "timed_out"; lastStatus: "not_seen" | "processed" }
  /** The RPC could not be reached well enough to tell. The transaction may or may not have landed. */
  | { state: "rpc_unavailable"; lastError: RpcFailure };

export type ConfirmationProgress =
  | { phase: "waiting"; attempt: number; elapsedMs: number }
  | { phase: "processed"; attempt: number; elapsedMs: number }
  | { phase: "rpc_retry"; attempt: number; elapsedMs: number; error: RpcFailure };

export interface ConfirmationOptions {
  signature: string;
  /** From the same build that produced the transaction (`prepareForWalletSignature`). */
  lastValidBlockHeight: number;
  commitment?: ConfirmationCommitment;
  /** Hard upper bound; a transaction lives ~60-90s, so the default comfortably covers expiry. */
  timeoutMs?: number;
  initialIntervalMs?: number;
  maxIntervalMs?: number;
  /** Fraction of each interval added or removed at random, so many tabs do not poll in lock-step. */
  jitter?: number;
  /** At the deadline, a successful RPC round-trip newer than this means "timed out"; older means "RPC unavailable". */
  rpcFailureWindowMs?: number;
  signal?: AbortSignal;
  onProgress?: (progress: ConfirmationProgress) => void;
  /** Test seams. */
  now?: () => number;
  sleep?: (ms: number, signal?: AbortSignal) => Promise<void>;
  random?: () => number;
}

const DEFAULTS = { timeoutMs: 120_000, initialIntervalMs: 1_000, maxIntervalMs: 4_000, jitter: 0.2, rpcFailureWindowMs: 15_000 } as const;

const defaultSleep = (ms: number, signal?: AbortSignal) =>
  new Promise<void>((resolve) => {
    const timer = setTimeout(resolve, ms);
    signal?.addEventListener("abort", () => (clearTimeout(timer), resolve()), { once: true });
  });

/** The transaction's signature (its first, the fee payer's), from the signed transaction itself — known before it is sent. */
export function transactionSignature(signed: Transaction): string {
  const signature = signed.signature;
  if (!signature) throw new Error("The transaction has no signature yet.");
  return bs58.encode(signature);
}

/**
 * Did `sendRawTransaction` fail in a way that proves the transaction was NOT accepted (preflight simulation failed,
 * blockhash unknown), or in a way that leaves it unknown (timeout, dropped connection, rate limit)? Only the second
 * kind must be followed by a look-up of the signature; neither is ever a reason to send again.
 */
export function classifySendError(error: unknown): "rejected" | "unknown_outcome" {
  const name = error instanceof Error ? error.name : "";
  const message = error instanceof Error ? error.message : String(error);
  if (name === "SendTransactionError" || /simulation failed|blockhash not found|custom program error|insufficient funds for/i.test(message)) return "rejected";
  return "unknown_outcome";
}

const reached = (status: SignatureStatus, target: ConfirmationCommitment): boolean => {
  const level = status.confirmationStatus ?? (status.confirmations === null ? "finalized" : "processed");
  return target === "confirmed" ? level === "confirmed" || level === "finalized" : level === "finalized";
};

type Lookup = { kind: "found"; outcome: ConfirmationOutcome } | { kind: "seen_not_yet" } | { kind: "none" } | { kind: "error"; error: RpcFailure };

/** The last look before giving up: the status including ledger history, then the transaction itself. Never resends. */
async function lastLookup(rpc: ConfirmationRpc, signature: string, target: ConfirmationCommitment): Promise<Lookup> {
  try {
    const { value } = await rpc.getSignatureStatuses([signature], { searchTransactionHistory: true });
    const status = value[0];
    if (status) {
      if (status.err) return { kind: "found", outcome: { state: "failed", err: status.err } };
      return reached(status, target) ? { kind: "found", outcome: { state: "confirmed", commitment: status.confirmationStatus === "finalized" ? "finalized" : "confirmed", slot: status.slot } } : { kind: "seen_not_yet" };
    }
    const tx = await rpc.getTransaction(signature, { commitment: "confirmed", maxSupportedTransactionVersion: 0 });
    if (tx) {
      if (tx.meta?.err) return { kind: "found", outcome: { state: "failed", err: tx.meta.err } };
      // Found at "confirmed": enough unless the caller asked for "finalized".
      return target === "confirmed" ? { kind: "found", outcome: { state: "confirmed", commitment: "confirmed", slot: tx.slot } } : { kind: "seen_not_yet" };
    }
    return { kind: "none" };
  } catch (error) {
    return { kind: "error", error: classifyRpcError(error) };
  }
}

export async function confirmTransactionByPolling(rpc: ConfirmationRpc, options: ConfirmationOptions): Promise<ConfirmationOutcome> {
  const { signature, lastValidBlockHeight, onProgress, signal } = options;
  const target = options.commitment ?? "confirmed";
  const timeoutMs = options.timeoutMs ?? DEFAULTS.timeoutMs;
  const maxInterval = options.maxIntervalMs ?? DEFAULTS.maxIntervalMs;
  const jitter = options.jitter ?? DEFAULTS.jitter;
  const failureWindow = options.rpcFailureWindowMs ?? DEFAULTS.rpcFailureWindowMs;
  const now = options.now ?? Date.now;
  const sleep = options.sleep ?? defaultSleep;
  const random = options.random ?? Math.random;

  const startedAt = now();
  let interval = options.initialIntervalMs ?? DEFAULTS.initialIntervalMs;
  let lastSuccessAt: number | null = null;
  let lastError: RpcFailure = "unavailable";
  let sawProcessed = false;

  // Settles the outcome when polling can no longer help (expired or out of time) by looking once more.
  const settle = async (whenNothingFound: () => ConfirmationOutcome): Promise<ConfirmationOutcome> => {
    const last = await lastLookup(rpc, signature, target);
    if (last.kind === "found") return last.outcome;
    if (last.kind === "seen_not_yet") return { state: "timed_out", lastStatus: "processed" };
    if (last.kind === "error") return { state: "rpc_unavailable", lastError: last.error };
    lastSuccessAt = now();
    return whenNothingFound();
  };

  for (let attempt = 1; ; attempt++) {
    const elapsedMs = now() - startedAt;
    try {
      const { value } = await rpc.getSignatureStatuses([signature]);
      const status = value[0];
      lastSuccessAt = now();
      if (status) {
        if (status.err) return { state: "failed", err: status.err };
        if (reached(status, target)) return { state: "confirmed", commitment: status.confirmationStatus === "finalized" ? "finalized" : "confirmed", slot: status.slot };
        sawProcessed = true;
        onProgress?.({ phase: "processed", attempt, elapsedMs });
      } else {
        onProgress?.({ phase: "waiting", attempt, elapsedMs });
      }

      // A transaction whose blockhash has expired can never land: only then is "it did not happen" a fact.
      const blockHeight = await rpc.getBlockHeight("confirmed");
      if (blockHeight > lastValidBlockHeight) return await settle(() => ({ state: "expired" }));
    } catch (error) {
      lastError = classifyRpcError(error);
      onProgress?.({ phase: "rpc_retry", attempt, elapsedMs, error: lastError });
    }

    if (signal?.aborted || now() - startedAt >= timeoutMs) {
      return await settle(() =>
        lastSuccessAt !== null && now() - lastSuccessAt <= failureWindow ? { state: "timed_out", lastStatus: sawProcessed ? "processed" : "not_seen" } : { state: "rpc_unavailable", lastError },
      );
    }

    const wait = interval * (1 + (random() * 2 - 1) * jitter);
    await sleep(Math.max(0, Math.min(wait, timeoutMs - (now() - startedAt))), signal);
    interval = Math.min(maxInterval, interval * 1.5);
  }
}
