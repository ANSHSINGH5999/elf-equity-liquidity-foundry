import { minimumReceived } from "@elf/market-engine";
import { formatUsd } from "@/lib/utils";

export interface TradeQuote {
  side: "buy" | "sell";
  quoteToken: string;
  amountUsd: number;
  inputAmount: number;
  outputAmount: number;
  spotPriceUsd: number;
  executionPriceUsd: number | null;
  priceImpactPct: number | null;
}

export type QuoteStatus = "idle" | "loading" | "ready" | "error";

function fmtAmount(n: number): string {
  const digits = Math.abs(n) >= 1000 ? 2 : Math.abs(n) >= 1 ? 4 : 6;
  return n.toLocaleString("en-US", { maximumFractionDigits: digits });
}

/**
 * The numbers behind a trade, straight from the on-chain quote. Anything the
 * quote could not produce shows "Data unavailable" — never a placeholder 0.
 */
export function TradePreview({
  quote,
  quoteStatus,
  tokenSymbol,
  slippageBps,
  networkFeeSol,
}: {
  quote: TradeQuote | null;
  quoteStatus: QuoteStatus;
  tokenSymbol: string;
  slippageBps: number;
  networkFeeSol: number | null;
}) {
  if (quoteStatus === "idle") {
    return <p className="rounded-[var(--radius-sm)] border border-border bg-surface-elevated px-3 py-2.5 text-xs text-muted-foreground">Enter an amount to preview the live on-chain quote.</p>;
  }
  if (quoteStatus === "loading" && !quote) {
    return <p className="rounded-[var(--radius-sm)] border border-border bg-surface-elevated px-3 py-2.5 text-xs text-muted-foreground" aria-live="polite">Fetching quote…</p>;
  }
  if (quoteStatus === "error" || !quote) {
    return (
      <p className="rounded-[var(--radius-sm)] border border-warning/30 bg-warning-muted px-3 py-2.5 text-xs text-warning" role="status">
        Quote unavailable — the pool may lack depth for this size, or the RPC is temporarily unreachable.
      </p>
    );
  }

  const isBuy = quote.side === "buy";
  const inSymbol = isBuy ? quote.quoteToken : tokenSymbol;
  const outSymbol = isBuy ? tokenSymbol : quote.quoteToken;
  const impact = quote.priceImpactPct;

  return (
    <dl className="divide-y divide-border rounded-[var(--radius-sm)] border border-border bg-surface-elevated text-xs" aria-busy={quoteStatus === "loading"}>
      <Row label="You pay" value={`${fmtAmount(quote.inputAmount)} ${inSymbol}`} sub={formatUsd(quote.amountUsd)} />
      <Row label="You receive (est.)" value={`${fmtAmount(quote.outputAmount)} ${outSymbol}`} strong />
      <Row label={`Minimum received (${(slippageBps / 100).toString()}% slippage)`} value={`${fmtAmount(minimumReceived(quote.outputAmount, slippageBps))} ${outSymbol}`} />
      <Row label="Spot price" value={formatUsd(quote.spotPriceUsd)} />
      <Row label="Execution price" value={quote.executionPriceUsd === null ? "Data unavailable" : formatUsd(quote.executionPriceUsd)} />
      <Row
        label="Price impact (incl. fees)"
        value={impact === null ? "Data unavailable" : `${impact >= 0 ? "" : "−"}${Math.abs(impact).toFixed(2)}%`}
        tone={impact === null ? undefined : impact > 5 ? "danger" : impact > 1 ? "warning" : undefined}
      />
      <Row
        label="Network fee"
        value={networkFeeSol === null ? "Shown once the transaction is prepared" : `${networkFeeSol.toFixed(6)} SOL`}
      />
    </dl>
  );
}

function Row({
  label,
  value,
  sub,
  strong = false,
  tone,
}: {
  label: string;
  value: string;
  sub?: string;
  strong?: boolean;
  tone?: "warning" | "danger";
}) {
  return (
    <div className="flex items-baseline justify-between gap-3 px-3 py-2">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className={`text-right font-tabular ${strong ? "text-sm text-foreground" : "text-foreground"} ${tone === "danger" ? "text-negative" : tone === "warning" ? "text-warning" : ""}`}>
        {value}
        {sub && <span className="block text-[10px] text-muted-foreground/70">{sub}</span>}
      </dd>
    </div>
  );
}
