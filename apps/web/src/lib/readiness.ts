export type ReadinessStatus = "pass" | "fail" | "warn" | "unavailable" | "skipped";
export type ReadinessId = "metamask" | "network" | "wallet" | "sol" | "quote" | "base" | "rpc" | "pool" | "oracle" | "simulation";

export type TradeSide = "buy" | "sell";

export interface ReadinessCheck {
  id: ReadinessId;
  label: string;
  status: ReadinessStatus;
  detail: string;
}

/** The oracle is informational (many issuers have no public feed); every other check gates the trade. */
const NON_BLOCKING: ReadonlySet<ReadinessId> = new Set(["oracle"]);

export type ReadinessVerdict = "ready" | "not_ready" | "unverified";

/**
 * ready: every blocking check passed. not_ready: at least one blocking check failed.
 * unverified: nothing failed, but something could not be read (e.g. a rate-limited RPC) — never treated as ready.
 */
export function readinessVerdict(checks: readonly ReadinessCheck[]): ReadinessVerdict {
  const blocking = checks.filter((c) => !NON_BLOCKING.has(c.id));
  if (blocking.some((c) => c.status === "fail")) return "not_ready";
  return blocking.every((c) => c.status === "pass") ? "ready" : "unverified";
}

/** The verdict in the words of the trade the user is looking at ("READY for SELL"), never another side's. */
export function readinessHeadline(verdict: ReadinessVerdict, side: TradeSide): string {
  const action = side === "buy" ? "BUY" : "SELL";
  if (verdict === "ready") return `READY for ${action}`;
  if (verdict === "not_ready") return `NOT READY for ${action}`;
  return `UNVERIFIED — something could not be read; not treated as ready for ${action}`;
}

/** Why a trade is not ready: the first blocking check that failed (else the first that could not be read), or null. */
export function readinessReason(checks: readonly ReadinessCheck[]): string | null {
  const blocking = checks.filter((c) => !NON_BLOCKING.has(c.id));
  const culprit = blocking.find((c) => c.status === "fail") ?? blocking.find((c) => c.status !== "pass");
  return culprit ? `${culprit.label} — ${culprit.detail}` : null;
}
