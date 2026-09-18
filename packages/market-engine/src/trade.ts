/**
 * Pure trade-preview math for the trading terminal. No I/O. Inputs come
 * from a real on-chain quote (Meteora `swapQuote2` via the quote route) and
 * the pool's real spot price — nothing here estimates a market.
 */

export interface ExecutionMetricsInput {
  side: "buy" | "sell";
  /** Pre-trade DBC spot price, USD per base token. */
  spotPriceUsd: number;
  /** Base tokens involved: buy → tokens received, sell → tokens sold. */
  tokenAmount: number;
  /** USD value of the quote-token leg: buy → USD spent, sell → USD received. */
  quoteLegUsd: number;
}

export interface ExecutionMetrics {
  /** USD per base token actually paid/received, fees included. Null when it cannot be computed. */
  executionPriceUsd: number | null;
  /**
   * How much worse than spot the fill is, in percent, fees included. Positive
   * = worse for the trader on BOTH sides (buy pays above spot, sell receives
   * below spot). Null when spot or the fill is unusable.
   */
  priceImpactPct: number | null;
}

export function computeExecutionMetrics(input: ExecutionMetricsInput): ExecutionMetrics {
  if (!(input.tokenAmount > 0) || !(input.quoteLegUsd > 0)) {
    return { executionPriceUsd: null, priceImpactPct: null };
  }
  const executionPriceUsd = input.quoteLegUsd / input.tokenAmount;
  if (!(input.spotPriceUsd > 0)) return { executionPriceUsd, priceImpactPct: null };

  const worseByUsd =
    input.side === "buy" ? executionPriceUsd - input.spotPriceUsd : input.spotPriceUsd - executionPriceUsd;
  return { executionPriceUsd, priceImpactPct: (worseByUsd / input.spotPriceUsd) * 100 };
}

/** Floor the on-chain `minimumAmountOut` guard would enforce for a given slippage tolerance. */
export function minimumReceived(expectedOutput: number, slippageBps: number): number {
  const bps = Math.min(10_000, Math.max(0, slippageBps));
  return expectedOutput * (1 - bps / 10_000);
}

export type BalanceCheck =
  | { state: "ok" }
  | { state: "insufficient"; shortfall: number }
  /** Balance could not be read (wallet disconnected or RPC failure) — never treated as zero. */
  | { state: "unknown" };

export function checkSufficientBalance(balance: number | null, required: number): BalanceCheck {
  if (balance === null || !Number.isFinite(balance)) return { state: "unknown" };
  if (!(required > 0)) return { state: "ok" };
  return balance >= required ? { state: "ok" } : { state: "insufficient", shortfall: required - balance };
}
