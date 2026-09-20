import type { ConfirmationOutcome } from "@elf/solana";

/**
 * What the user is told for each way a confirmation can end. The distinction that matters: `failed` is a fact (the
 * chain executed it and it failed, or it can never land), `unresolved` is not (ELF simply does not know yet), and in
 * the unresolved case ELF never sends again by itself.
 */
export type ConfirmationView =
  | { kind: "confirmed" }
  | { kind: "failed"; reason: "on_chain" | "expired"; message: string }
  | { kind: "unresolved"; reason: "timed_out" | "rpc_unavailable"; message: string };

export function interpretConfirmation(outcome: ConfirmationOutcome): ConfirmationView {
  switch (outcome.state) {
    case "confirmed":
      return { kind: "confirmed" };
    case "failed":
      return {
        kind: "failed",
        reason: "on_chain",
        message: `The transaction executed on-chain but failed: ${typeof outcome.err === "string" ? outcome.err : JSON.stringify(outcome.err)}`,
      };
    case "expired":
      return {
        kind: "failed",
        reason: "expired",
        message: "The transaction expired before it was confirmed, and ELF's final check found no trace of it on-chain, so it did not land. It is safe to try again.",
      };
    case "timed_out":
      return {
        kind: "unresolved",
        reason: "timed_out",
        message:
          "ELF has not seen this transaction confirmed yet, but it was not rejected and has not expired, so it may still land. ELF will not send it again. Check its status again, or open it on the explorer, before doing anything else.",
      };
    case "rpc_unavailable":
      return {
        kind: "unresolved",
        reason: "rpc_unavailable",
        message:
          outcome.lastError === "rate_limited"
            ? "The RPC is rate limiting ELF, so it could not confirm this transaction. It may have landed. ELF will not send it again. Check its status again in a moment, or open it on the explorer."
            : "ELF could not reach the RPC to confirm this transaction. It may have landed. ELF will not send it again. Check its status again in a moment, or open it on the explorer.",
      };
  }
}
