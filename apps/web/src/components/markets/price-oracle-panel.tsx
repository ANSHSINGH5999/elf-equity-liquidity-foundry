import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatUsd } from "@/lib/utils";
import type { PriceOracleFeed } from "@elf/shared";

/**
 * Live DBC price vs. every public Pyth feed for this ticker — the
 * regulated equity market, the xStock wrapper, and the Ondo tokenized
 * stock, side by side. Deliberately shows its own "not configured" /
 * "no public feed" states rather than hiding — a private pre-IPO asset
 * genuinely has no equity feed, and that's informative, not an error.
 */
export function PriceOraclePanel({ onChainPriceUsd, feeds }: { onChainPriceUsd: number; feeds: PriceOracleFeed[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Price oracle</CardTitle>
        <span className="text-[11px] uppercase tracking-wide text-muted-foreground">Pyth Network</span>
      </CardHeader>
      <CardContent className="space-y-3">
        <Row label="ELF / Meteora DBC" sublabel="This pool, live on-chain" value={onChainPriceUsd} highlight />

        {feeds.length === 0 ? (
          <p className="text-xs text-muted-foreground">
            No public Pyth feed exists for this ticker — expected for a private pre-IPO issuer, not a bug.
          </p>
        ) : (
          feeds.map((feed) => (
            <Row
              key={feed.feedId}
              label={feed.label}
              sublabel={feed.feedSymbol}
              value={feed.priceUsd}
              deltaFrom={onChainPriceUsd}
              unconfigured={feed.priceUsd === null}
            />
          ))
        )}

        {feeds.length > 0 && feeds.every((f) => f.priceUsd === null) && (
          <p className="text-xs text-muted-foreground">
            Feeds found but not pulled — set <span className="font-tabular">PYTH_API_KEY</span> to see live prices.
          </p>
        )}
      </CardContent>
    </Card>
  );
}

function Row({
  label,
  sublabel,
  value,
  deltaFrom,
  highlight = false,
  unconfigured = false,
}: {
  label: string;
  sublabel: string;
  value: number | null;
  deltaFrom?: number;
  highlight?: boolean;
  unconfigured?: boolean;
}) {
  const deltaPct = value !== null && deltaFrom ? ((value - deltaFrom) / deltaFrom) * 100 : null;

  return (
    <div className="flex items-center justify-between gap-3 rounded-[var(--radius-sm)] border border-border bg-surface-elevated px-3 py-2.5">
      <div className="min-w-0">
        <p className={`text-xs font-medium ${highlight ? "text-accent-strong" : "text-foreground"}`}>{label}</p>
        <p className="truncate text-[10px] text-muted-foreground/70">{sublabel}</p>
      </div>
      <div className="shrink-0 text-right">
        {value === null ? (
          <Badge variant={unconfigured ? "outline" : "neutral"}>{unconfigured ? "no key" : "unavailable"}</Badge>
        ) : (
          <>
            <p className="font-tabular text-sm text-foreground">{formatUsd(value)}</p>
            {deltaPct !== null && (
              <p className={`font-tabular text-[10px] ${Math.abs(deltaPct) < 0.5 ? "text-muted-foreground" : deltaPct > 0 ? "text-positive" : "text-negative"}`}>
                {deltaPct >= 0 ? "+" : ""}
                {deltaPct.toFixed(2)}% vs DBC
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
}
