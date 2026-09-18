"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { apiFetch } from "@/lib/api-client";
import { formatUsd, truncateAddress } from "@/lib/utils";
import type { AssetDto, CurveConfigDto } from "@/lib/api-types";
import type { MarketRegime, PoolStatus } from "@elf/shared";

interface PoolEntry {
  launch: {
    id: string;
    poolAddress: string;
    asset: AssetDto;
    curveConfig: CurveConfigDto;
    status: PoolStatus;
  };
  analytics: {
    priceUsd: number;
    volume24hUsd: number;
    liquidityUsd: number;
    marketQualityScore: { total: number };
    graduation: { percentageComplete: number };
    regime: MarketRegime;
    status: PoolStatus;
  } | null;
}

type MarketFilterKey = "all" | "healthy" | "discovery" | "stressed" | "near_graduation" | "graduated";

const FILTERS: { key: MarketFilterKey; label: string }[] = [
  { key: "all", label: "All Markets" },
  { key: "healthy", label: "Healthy" },
  { key: "discovery", label: "Discovery" },
  { key: "stressed", label: "Stressed" },
  { key: "near_graduation", label: "Near Graduation" },
  { key: "graduated", label: "Graduated (DAMM v2)" },
];

function matchesFilter(entry: PoolEntry, filter: MarketFilterKey): boolean {
  if (filter === "all") return true;
  if (filter === "near_graduation" || filter === "graduated") {
    return entry.analytics?.status === filter;
  }
  return entry.analytics?.regime === filter;
}

export function MarketList() {
  const [pools, setPools] = useState<PoolEntry[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<MarketFilterKey>("all");

  useEffect(() => {
    apiFetch<{ pools: PoolEntry[] }>("/api/pools")
      .then((res) => setPools(res.pools))
      .catch(() => setError("Unable to load live markets right now."));
  }, []);

  const filtered = useMemo(() => {
    if (!pools) return [];
    return pools.filter((p) => matchesFilter(p, filter));
  }, [pools, filter]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Badge variant="gold" dot>Live Telemetry</Badge>
            <Badge variant="neutral">Meteora DBC</Badge>
          </div>
          <h1 className="font-display mt-2 text-3xl font-medium tracking-tight text-foreground sm:text-4xl">
            Live Markets
          </h1>
        </div>

        <Link
          href="/design"
          className="inline-flex items-center gap-2 rounded-lg border border-amber-400/40 bg-[#161208] px-4 py-2 text-xs font-semibold text-gold-light transition-all hover:bg-[#201a0a] hover:shadow-[0_0_15px_rgba(201,162,39,0.3)]"
        >
          <span>⚡ Launch New Market</span>
        </Link>
      </div>

      <div className="mt-6 flex flex-wrap gap-2 border-b border-white/10 pb-4">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`rounded-full border px-3.5 py-1 text-xs font-medium transition-all ${
              filter === f.key
                ? "border-amber-400/60 bg-amber-400/10 text-gold-light shadow-sm"
                : "border-white/10 text-muted-foreground hover:border-white/20 hover:text-white"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {error && <p className="mt-8 text-sm text-negative">{error}</p>}
      {!pools && !error && (
        <div className="mt-12 flex items-center justify-center text-sm text-muted-foreground">
          Fetching live indexed markets from Solana Devnet…
        </div>
      )}
      {pools && filtered.length === 0 && (
        <div className="mt-12 rounded-xl border border-white/5 bg-[#0c101a] p-8 text-center text-sm text-muted-foreground">
          No markets match this filter yet.
        </div>
      )}

      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map(({ launch, analytics }) => (
          <Link key={launch.id} href={`/markets/${launch.id}`} className="group">
            <Card className="h-full border border-white/10 bg-[#0c101a] transition-all duration-[var(--duration-base)] hover:-translate-y-1 hover:border-amber-400/40 hover:shadow-[0_12px_30px_rgba(0,0,0,0.6)]">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-sm font-semibold tracking-tight text-white group-hover:text-gold-light transition-colors">
                      {launch.asset.name}
                    </span>
                    <span className="ml-1.5 font-mono text-xs text-muted-foreground">
                      ({launch.asset.symbol})
                    </span>
                  </div>
                  <Badge variant={analytics?.status === "graduated" ? "gold" : "positive"}>
                    {analytics?.status ?? launch.status}
                  </Badge>
                </div>
                <p className="mt-1 font-mono text-[11px] text-subtle-foreground">
                  {truncateAddress(launch.poolAddress)}
                </p>

                {analytics ? (
                  <>
                    <div className="mt-4 flex items-baseline justify-between border-t border-white/5 pt-3">
                      <span className="text-xs text-muted-foreground">Current Price</span>
                      <span className="font-mono text-xl font-bold text-white">
                        {formatUsd(analytics.priceUsd)}
                      </span>
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-3 rounded-lg bg-[#070910] p-3 text-xs">
                      <div>
                        <p className="text-[10px] uppercase text-subtle-foreground">24h Volume</p>
                        <p className="mt-0.5 font-mono font-medium text-foreground">
                          {formatUsd(analytics.volume24hUsd, { compact: true })}
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] uppercase text-subtle-foreground">Liquidity</p>
                        <p className="mt-0.5 font-mono font-medium text-foreground">
                          {formatUsd(analytics.liquidityUsd, { compact: true })}
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] uppercase text-subtle-foreground">MQS Score</p>
                        <p className="mt-0.5 font-mono font-medium text-gold-light">
                          {analytics.marketQualityScore.total.toFixed(0)}/100
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] uppercase text-subtle-foreground">Market Regime</p>
                        <p className="mt-0.5 font-mono font-medium capitalize text-foreground">
                          {analytics.regime}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4">
                      <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                        <span>DAMM v2 Graduation Progress</span>
                        <span className="font-mono text-gold-light font-medium">
                          {analytics.graduation.percentageComplete.toFixed(1)}%
                        </span>
                      </div>
                      <Progress value={analytics.graduation.percentageComplete} className="mt-1.5" />
                    </div>
                  </>
                ) : (
                  <p className="mt-4 text-xs text-muted-foreground">Live analytics indexing…</p>
                )}
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
