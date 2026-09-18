import { ApiError } from "@/lib/api-client";

/**
 * Pure state model for the trading terminal (no React, no I/O) so every
 * state the UI can show is unit-testable. The five phases the product must
 * keep distinct: QUOTE → SIGNING → SUBMITTED → CONFIRMED, or FAILED.
 * "confirmed" is only ever reached after the RPC reports the transaction
 * confirmed with no on-chain error — never on mere submission.
 */
export type TradeStatus = "idle" | "building" | "signing" | "submitted" | "confirmed" | "failed";

export const TRADE_STEPS = ["Quote", "Sign", "Submitted", "Confirmed"] as const;

export interface TradeStatusView {
  /** Index into TRADE_STEPS currently highlighted. */
  activeStep: number;
  label: string;
  detail: string | null;
  tone: "neutral" | "progress" | "success" | "danger";
  /** True while something is in flight — the trade button must be disabled. */
  busy: boolean;
}

export function describeTradeStatus(status: TradeStatus, hasQuote: boolean, failedAtStep = 0): TradeStatusView {
  switch (status) {
    case "idle":
      return {
        activeStep: 0,
        label: hasQuote ? "Quote ready" : "Enter an amount to get a quote",
        detail: hasQuote ? "Nothing has been sent. Review the numbers, then trade." : null,
        tone: "neutral",
        busy: false,
      };
    case "building":
      return {
        activeStep: 1,
        label: "Preparing transaction",
        detail: "ELF is building and simulating the swap before your wallet is asked to sign.",
        tone: "progress",
        busy: true,
      };
    case "signing":
      return {
        activeStep: 1,
        label: "Waiting for wallet signature",
        detail: "Approve the transaction in your wallet. Nothing is sent until you do.",
        tone: "progress",
        busy: true,
      };
    case "submitted":
      return {
        activeStep: 2,
        label: "Submitted — not confirmed yet",
        detail: "The transaction has been sent to the network. It is not final until confirmation.",
        tone: "progress",
        busy: true,
      };
    case "confirmed":
      return {
        activeStep: 3,
        label: "Confirmed on-chain",
        detail: "The network confirmed this transaction with no error.",
        tone: "success",
        busy: false,
      };
    case "failed":
      return {
        activeStep: failedAtStep,
        label: "Failed",
        detail: null,
        tone: "danger",
        busy: false,
      };
  }
}

/** Thrown when a transaction was submitted and confirmed by the cluster but executed with an error. */
export class TradeOnChainFailure extends Error {
  readonly signature: string;
  constructor(signature: string, cause: unknown) {
    super(`The transaction executed on-chain but failed: ${typeof cause === "string" ? cause : JSON.stringify(cause)}`);
    this.name = "TradeOnChainFailure";
    this.signature = signature;
  }
}

export type TradeFailureKind =
  | "wallet_rejected"
  | "insufficient_funds"
  | "simulation_failed"
  | "on_chain_failed"
  | "expired"
  | "unavailable"
  | "validation"
  | "unknown";

export interface TradeFailure {
  kind: TradeFailureKind;
  message: string;
  /** Present when a real transaction signature exists for the failed attempt (so the explorer link is real). */
  signature: string | null;
}

/** Turns anything thrown during quote/build/sign/send/confirm into a precise, honest message. */
export function classifyTradeFailure(err: unknown): TradeFailure {
  if (err instanceof TradeOnChainFailure) {
    return { kind: "on_chain_failed", message: err.message, signature: err.signature };
  }

  if (err instanceof ApiError) {
    switch (err.code) {
      case "simulation_failed":
        return {
          kind: "simulation_failed",
          message: `This trade would fail on-chain, so it was not sent to your wallet. ${err.message}`,
          signature: null,
        };
      case "validation_error":
        return { kind: "validation", message: err.message, signature: null };
      case "not_found":
        return { kind: "unavailable", message: "This pool has no live on-chain state to trade against.", signature: null };
      case "provider_unavailable":
      case "rpc_unavailable":
      case "database_unavailable":
        return { kind: "unavailable", message: "A required service is temporarily unavailable. Try again shortly.", signature: null };
      default:
        return { kind: "unknown", message: err.message, signature: null };
    }
  }

  const name = err instanceof Error ? err.name : "";
  const message = err instanceof Error ? err.message : typeof err === "string" ? err : "";

  // Only the wallet's own wording proves a rejection; a bare WalletSignTransactionError name could be any signing fault.
  if (/user rejected|rejected the request|declined|denied/i.test(message)) {
    return { kind: "wallet_rejected", message: "You rejected the request in your wallet. Nothing was sent.", signature: null };
  }
  if (name === "TransactionExpiredBlockheightExceededError" || /block ?height exceeded|blockhash.*(expired|not found)/i.test(message)) {
    return {
      kind: "expired",
      message:
        "The transaction was not confirmed before its blockhash expired. It may not have landed — check the explorer before retrying.",
      signature: null,
    };
  }
  if (/insufficient (funds|lamports)|insufficient balance/i.test(message)) {
    return { kind: "insufficient_funds", message: "Insufficient balance to cover this trade and its network fee.", signature: null };
  }

  return { kind: "unknown", message: message || "The trade failed for an unknown reason.", signature: null };
}

export type BalanceReadStatus = "disconnected" | "loading" | "ready" | "partial" | "error";

/**
 * Status of a wallet-balance read. `values` are the balances that were
 * *expected* to be readable (null = the read failed or was not possible);
 * an unreadable balance is never treated as zero, so partial/error states
 * are surfaced instead of silently showing an empty wallet.
 */
export function deriveBalanceStatus(input: {
  connected: boolean;
  loadedForThisWallet: boolean;
  expected: { sol: boolean; base: boolean; quote: boolean };
  values: { sol: number | null; base: number | null; quote: number | null };
}): BalanceReadStatus {
  if (!input.connected) return "disconnected";
  if (!input.loadedForThisWallet) return "loading";

  const wanted = (["sol", "base", "quote"] as const).filter((k) => input.expected[k]);
  const failed = wanted.filter((k) => input.values[k] === null).length;
  if (failed === 0) return "ready";
  return failed === wanted.length ? "error" : "partial";
}
