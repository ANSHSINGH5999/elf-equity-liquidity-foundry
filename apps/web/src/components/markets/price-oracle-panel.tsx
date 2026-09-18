"use client";

import { useSyncExternalStore } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatUsd } from "@/lib/utils";
import type { PriceOracleFeed, PythUnavailableReason } from "@elf/shared";

const REASON_COPY: Record<PythUnavailableReason, { badge: string; explanation: string }> = {
  not_configured: {
    badge: "no key",
    explanation: "PYTH_API_KEY isn't configured — this feed was never requested.",
  },
  unauthenticated: {
    badge: "auth failed",
    explanation: "Pyth rejected the configured key itself (missing or malformed) — not an entitlement issue.",
  },
  entitlement_restricted: {
    badge: "restricted",
    explanation: "Authentication succeeded, but this feed is not included in the current key's entitlement/plan.",
  },
  rate_limited: {
    badge: "rate limited",
    explanation: "Pyth is throttling this key right now — try again shortly.",
  },
  unavailable: {
    badge: "unavailable",
    explanation: "The feed didn't return a price — network issue or the feed itself is temporarily down.",
  },
};

/**
 * Live DBC price vs. every public Pyth feed for this ticker — the
 * regulated equity market, the xStock wrapper, and the Ondo tokenized
 * stock, side by side. Every non-live state is reported for exactly what
 * it is (see PythUnavailableReason) — this panel never says "rejected"
 * for something that's actually "not configured," and never fabricates
 * a price when Pyth doesn't return one.
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
              publishTime={feed.publishTime}
              deltaFrom={onChainPriceUsd}
              unavailableReason={feed.unavailableReason}
            />
          ))
        )}
      </CardContent>
    </Card>
  );
}

function formatAge(nowSecond: number, iso: string): string {
  const seconds = Math.max(0, nowSecond - Math.floor(new Date(iso).getTime() / 1000));
  if (seconds < 60) return `${seconds}s ago`;
  if (seconds < 3600) return `${Math.round(seconds / 60)}m ago`;
  return `${Math.round(seconds / 3600)}h ago`;
}

// React's own textbook pattern for subscribing to a ticking external clock
// (see https://react.dev/reference/react/useSyncExternalStore) — the only
// impure call (Date.now, via the second-bucketed snapshot below) lives in
// the subscription/snapshot functions React manages, never in the render
// body or in a synchronous setState-in-effect call.
function subscribeToClock(onTick: () => void): () => void {
  const interval = setInterval(onTick, 1000);
  return () => clearInterval(interval);
}

// Bucketed to whole seconds (not raw Date.now()) so repeated calls within
// the same second return an identical value — required for useSyncExternalStore's
// snapshot to be stable between renders instead of "changing" every call.
function getClockSecond(): number {
  return Math.floor(Date.now() / 1000);
}

function useRelativeAge(iso: string | null): string | null {
  const nowSecond = useSyncExternalStore(subscribeToClock, getClockSecond, getClockSecond);
  if (!iso) return null;
  return formatAge(nowSecond, iso);
}

function Row({
  label,
  sublabel,
  value,
  publishTime = null,
  deltaFrom,
  highlight = false,
  unavailableReason = null,
}: {
  label: string;
  sublabel: string;
  value: number | null;
  publishTime?: string | null;
  deltaFrom?: number;
  highlight?: boolean;
  unavailableReason?: PythUnavailableReason | null;
}) {
  const deltaPct = value !== null && deltaFrom ? ((value - deltaFrom) / deltaFrom) * 100 : null;
  const age = useRelativeAge(publishTime);
  const reason = unavailableReason ? REASON_COPY[unavailableReason] : null;

  return (
    <div className="rounded-[var(--radius-sm)] border border-border bg-surface-elevated px-3 py-2.5">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className={`text-xs font-medium ${highlight ? "text-accent-strong" : "text-foreground"}`}>{label}</p>
          <p className="truncate text-[10px] text-muted-foreground/70">{sublabel}</p>
        </div>
        <div className="shrink-0 text-right">
          {value === null ? (
            <Badge variant={unavailableReason === "not_configured" ? "outline" : unavailableReason === "entitlement_restricted" ? "warning" : "negative"}>
              {reason?.badge}
            </Badge>
          ) : (
            <>
              <div className="flex items-center justify-end gap-1.5">
                {!highlight && <Badge variant="positive">verified</Badge>}
                <p className="font-tabular text-sm text-foreground">{formatUsd(value)}</p>
              </div>
              {deltaPct !== null && (
                <p className={`font-tabular text-[10px] ${Math.abs(deltaPct) < 0.5 ? "text-muted-foreground" : deltaPct > 0 ? "text-positive" : "text-negative"}`}>
                  {deltaPct >= 0 ? "+" : ""}
                  {deltaPct.toFixed(2)}% vs DBC
                </p>
              )}
              {age && <p className="text-[10px] text-muted-foreground/70">updated {age}</p>}
            </>
          )}
        </div>
      </div>
      {reason && <p className="mt-1.5 text-[10px] leading-relaxed text-muted-foreground">{reason.explanation}</p>}
    </div>
  );
}
