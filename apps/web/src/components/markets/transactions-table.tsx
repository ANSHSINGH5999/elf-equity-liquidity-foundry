"use client";

import { Fragment, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { explorerAddressUrl, explorerTxUrl } from "@elf/solana";
import { CLUSTER } from "@/lib/solana-config";
import { formatUsd, truncateAddress } from "@/lib/utils";

export interface IndexedTrade {
  signature: string;
  trader: string;
  side: "buy" | "sell";
  tokenAmount: number;
  quoteAmount: number;
  priceUsd: number;
  timestamp: string;
  /** Every row from GET /api/markets/:id/trades is, by construction, an already-confirmed on-chain event — the indexer never writes a pending/failed row. */
  status: "confirmed";
}

/**
 * On-chain transaction explorer (Feature B) — reuses the exact indexed
 * `Trade` rows the analytics endpoints already return; adds no new
 * queries. Every field shown here traces to a real column (Trade.signature,
 * Trade.trader, etc.) or is derived from them (input/output side); nothing
 * is fabricated, and a trade only ever appears here once the indexer has
 * decoded a real confirmed EvtSwap event for it.
 */
export function TransactionsTable({
  trades,
  poolAddress,
  tokenSymbol,
  quoteToken,
}: {
  trades: IndexedTrade[];
  poolAddress: string | null;
  tokenSymbol: string;
  quoteToken: string;
}) {
  const [expanded, setExpanded] = useState<string | null>(null);

  if (trades.length === 0) {
    return <p className="text-sm text-muted-foreground">No indexed trades yet for this market.</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-xs uppercase tracking-wide text-muted-foreground">
            <th className="px-2 py-2">Type</th>
            <th className="px-2 py-2">Input</th>
            <th className="px-2 py-2">Output</th>
            <th className="px-2 py-2">Exec. price</th>
            <th className="px-2 py-2">Trader</th>
            <th className="px-2 py-2">Status</th>
            <th className="px-2 py-2">Time</th>
          </tr>
        </thead>
        <tbody>
          {trades.map((t) => {
            const isBuy = t.side === "buy";
            const input = isBuy ? { amount: t.quoteAmount, symbol: quoteToken } : { amount: t.tokenAmount, symbol: tokenSymbol };
            const output = isBuy ? { amount: t.tokenAmount, symbol: tokenSymbol } : { amount: t.quoteAmount, symbol: quoteToken };
            const isOpen = expanded === t.signature;

            return (
              <Fragment key={t.signature}>
                <tr
                  className="cursor-pointer border-t border-border transition-colors hover:bg-surface-hover/50"
                  onClick={() => setExpanded(isOpen ? null : t.signature)}
                >
                  <td className="px-2 py-2">
                    <Badge variant={isBuy ? "positive" : "negative"}>{t.side}</Badge>
                  </td>
                  <td className="px-2 py-2 font-tabular">
                    {input.amount.toLocaleString("en-US", { maximumFractionDigits: 4 })} {input.symbol}
                  </td>
                  <td className="px-2 py-2 font-tabular">
                    {output.amount.toLocaleString("en-US", { maximumFractionDigits: 4 })} {output.symbol}
                  </td>
                  <td className="px-2 py-2 font-tabular">{formatUsd(t.priceUsd)}</td>
                  <td className="px-2 py-2 font-tabular text-muted-foreground">{truncateAddress(t.trader)}</td>
                  <td className="px-2 py-2">
                    <Badge variant="positive" dot>
                      confirmed
                    </Badge>
                  </td>
                  <td className="px-2 py-2 text-muted-foreground">{new Date(t.timestamp).toLocaleTimeString()}</td>
                </tr>
                {isOpen && (
                  <tr className="border-t border-border/50 bg-surface-elevated/40">
                    <td colSpan={7} className="px-2 py-3">
                      <div className="grid gap-2 text-xs sm:grid-cols-2 lg:grid-cols-4">
                        <DetailField label="Signature" value={truncateAddress(t.signature, 8)} />
                        <DetailField label="Pool" value={poolAddress ? truncateAddress(poolAddress, 6) : "—"} />
                        <DetailField label="Full timestamp" value={new Date(t.timestamp).toLocaleString()} />
                        <DetailField label="Network" value={CLUSTER} />
                      </div>
                      <div className="mt-3 flex flex-wrap gap-4">
                        <a
                          href={explorerTxUrl(t.signature, CLUSTER)}
                          target="_blank"
                          rel="noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="text-xs font-medium text-accent-strong hover:underline"
                        >
                          View transaction on Solana Explorer →
                        </a>
                        {poolAddress && (
                          <a
                            href={explorerAddressUrl(poolAddress, CLUSTER)}
                            target="_blank"
                            rel="noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="text-xs font-medium text-accent-strong hover:underline"
                          >
                            View pool on Solana Explorer →
                          </a>
                        )}
                      </div>
                    </td>
                  </tr>
                )}
              </Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function DetailField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-wide text-muted-foreground/70">{label}</p>
      <p className="mt-0.5 font-tabular text-foreground">{value}</p>
    </div>
  );
}
