"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { apiFetch } from "@/lib/api-client";
import type { ExternalMarketContext, ExternalMarketResult } from "@elf/shared";

type State = { phase: "loading" } | { phase: "ready"; context: ExternalMarketContext } | { phase: "error" };

const usd = (n: number) => n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: n < 10 ? 4 : 2 });
const compact = (n: number) => n.toLocaleString("en-US", { style: "currency", currency: "USD", notation: "compact", maximumFractionDigits: 2 });

/**
 * EXTERNAL crypto market context from CoinCap, fetched through ELF's server (the key never reaches the browser). It
 * is labelled as external and never shown as, or mixed into, the on-chain price — that is always the Meteora DBC price.
 */
export function ExternalMarketPanel({ marketId }: { marketId: string }) {
  const [state, setState] = useState<State>({ phase: "loading" });

  useEffect(() => {
    let cancelled = false;
    apiFetch<ExternalMarketContext>(`/api/market/external?marketId=${encodeURIComponent(marketId)}`)
      .then((context) => !cancelled && setState({ phase: "ready", context }))
      .catch(() => !cancelled && setState({ phase: "error" }));
    return () => {
      cancelled = true;
    };
  }, [marketId]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>External Market Data</CardTitle>
        <Badge variant="neutral">External · CoinCap</Badge>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-[11px] leading-relaxed text-muted-foreground">
          Context from a third-party crypto data provider. The market&rsquo;s price is the on-chain <span className="text-foreground">Meteora DBC</span> price shown elsewhere; nothing here
          replaces it.
        </p>
        {state.phase === "loading" && <p className="text-xs text-muted-foreground" role="status">Loading external data…</p>}
        {state.phase === "error" && <p className="text-xs text-muted-foreground" role="status">External market data could not be loaded.</p>}
        {state.phase === "ready" && (
          <>
            <Row label={`Quote token · ${state.context.quote.token}`} result={state.context.quote.result} />
            <Row label={`Asset · ${state.context.asset.symbol}`} result={state.context.asset.result} />
          </>
        )}
      </CardContent>
    </Card>
  );
}

function Row({ label, result }: { label: string; result: ExternalMarketResult }) {
  return (
    <div className="rounded-[var(--radius-sm)] border border-border p-3">
      <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-muted-foreground">{label}</p>
      {result.status === "unavailable" ? (
        <p className="mt-1.5 text-xs text-muted-foreground">{result.message}</p>
      ) : (
        <>
          <p className="mt-1 font-tabular text-base text-foreground">{usd(result.data.priceUsd)}</p>
          <dl className="mt-1.5 grid grid-cols-3 gap-2 text-[11px]">
            <Field name="24h change" value={result.data.changePercent24h === null ? null : `${result.data.changePercent24h >= 0 ? "+" : "−"}${Math.abs(result.data.changePercent24h).toFixed(2)}%`} />
            <Field name="24h volume" value={result.data.volume24hUsd === null ? null : compact(result.data.volume24hUsd)} />
            <Field name="Market cap" value={result.data.marketCapUsd === null ? null : compact(result.data.marketCapUsd)} />
          </dl>
          <p className="mt-1.5 text-[10px] uppercase tracking-wide text-muted-foreground/70">
            CoinCap · {result.data.symbol} · {new Date(result.data.timestamp).toLocaleTimeString()}
          </p>
        </>
      )}
    </div>
  );
}

function Field({ name, value }: { name: string; value: string | null }) {
  return (
    <div>
      <dt className="text-muted-foreground">{name}</dt>
      <dd className="font-tabular text-foreground">{value ?? "unavailable"}</dd>
    </div>
  );
}
