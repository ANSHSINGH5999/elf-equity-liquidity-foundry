"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { DataFreshnessBadge } from "@/components/markets/data-freshness-badge";
import { MarketAnalyst } from "@/components/markets/market-analyst";
import { RiskIndicators, formatIndicatorValue } from "@/components/markets/risk-indicators";
import { apiFetch, ApiError } from "@/lib/api-client";
import { formatUsd, truncateAddress } from "@/lib/utils";
import type { IssuerDashboard as IssuerDashboardData } from "@elf/shared";

const POLL_MS = 30_000;

/**
 * Issuer-facing analytics (Feature E). One request to
 * GET /api/markets/:id/risk supplies both the overview numbers and the
 * derived risk indicators — nothing here is computed client-side.
 */
export function IssuerDashboard({ marketId }: { marketId: string }) {
  const [data, setData] = useState<IssuerDashboardData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const res = await apiFetch<IssuerDashboardData>(`/api/markets/${marketId}/risk`);
        if (cancelled) return;
        setData(res);
        setError(null);
        setNotFound(false);
      } catch (err) {
        if (cancelled) return;
        if (err instanceof ApiError && err.status === 404) setNotFound(true);
        else if (err instanceof ApiError && err.status === 429) setError("Too many requests — retrying shortly.");
        else setError("The Solana RPC endpoint or ELF database is temporarily unavailable.");
      }
    }

    load();
    const interval = setInterval(load, POLL_MS);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [marketId]);

  if (notFound) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center sm:px-6">
        <h1 className="text-xl font-semibold text-foreground">Market not found</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          No market with id <span className="font-tabular">{marketId}</span> has a deployed pool yet.
        </p>
      </div>
    );
  }
  if (!data && !error) {
    return <p className="mx-auto max-w-7xl px-4 py-20 text-sm text-muted-foreground sm:px-6">Loading issuer analytics…</p>;
  }
  if (!data) {
    return <p className="mx-auto max-w-7xl px-4 py-20 text-sm text-negative sm:px-6">{error}</p>;
  }

  const { overview: o, indicators } = data;
  const deviation = indicators.find((i) => i.id === "price_deviation");

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link href={`/markets/${marketId}`} className="text-xs text-accent-strong hover:underline">
            ← Market &amp; trading
          </Link>
          <div className="mt-2 flex items-center gap-2">
            <h1 className="font-display text-2xl text-foreground">Issuer analytics</h1>
            <Badge variant="neutral">{o.status.replace("_", " ")}</Badge>
          </div>
          <p className="mt-1 font-tabular text-xs text-muted-foreground">Pool {truncateAddress(o.poolAddress ?? o.marketId, 6)}</p>
        </div>
        <DataFreshnessBadge freshness={o.freshness} />
      </div>

      {error && <p className="mt-4 text-sm text-negative">{error}</p>}

      <h2 className="mt-8 text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">Market overview</h2>
      <div className="mt-3 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        <Stat label="Total liquidity" value={formatUsd(o.liquidityUsd.value, { compact: true })} source={o.liquidityUsd.source} />
        <Stat label="24H volume" value={formatUsd(o.volume24hUsd.value, { compact: true })} source={o.volume24hUsd.source} />
        <Stat label="Total trades (all time)" value={data.totalTrades.toLocaleString("en-US")} source="INDEXED" />
        <Stat label="Unique traders (all time)" value={data.uniqueTradersAllTime.toLocaleString("en-US")} source="INDEXED" />
        <Stat label="Current price" value={formatUsd(o.priceUsd.value)} source={o.priceUsd.source} />
        <Stat
          label={`Deviation from ${o.referencePriceSource === "pyth" ? "Pyth" : "issuer-declared"} reference`}
          value={deviation ? formatIndicatorValue(deviation) : "Data unavailable"}
          source="ON_CHAIN"
        />
        <Stat label="Market status" value={o.status.replace("_", " ")} source="ON_CHAIN" />
        <Stat label="Graduation progress" value={`${o.graduation.percentageComplete.toFixed(1)}%`} source="ON_CHAIN" />
      </div>

      <div className="mt-8 grid gap-4 lg:grid-cols-2">
        <RiskIndicators indicators={indicators} />
        <MarketAnalyst marketId={marketId} />
      </div>
    </div>
  );
}

function Stat({ label, value, source }: { label: string; value: string; source: "ON_CHAIN" | "INDEXED" | "SIMULATED" }) {
  return (
    <Card>
      <CardContent className="py-3">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="mt-1 font-tabular text-base capitalize text-foreground">{value}</p>
        <p className="mt-0.5 text-[10px] uppercase tracking-wide text-muted-foreground/70">{source.replace("_", "-")}</p>
      </CardContent>
    </Card>
  );
}
