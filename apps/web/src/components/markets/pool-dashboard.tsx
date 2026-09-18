"use client";

import { useCallback, useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { PriceChart, type PricePoint } from "@/components/charts/price-chart";
import { QualityScoreCard } from "@/components/markets/quality-score-card";
import { TradePanel } from "@/components/markets/trade-panel";
import { apiFetch } from "@/lib/api-client";
import { formatBps, formatPercent, formatUsd, truncateAddress } from "@/lib/utils";
import type { GraduationStatus, MarketQualityScoreBreakdown, MarketRegime, PoolStatus } from "@elf/shared";

interface Analytics {
  poolAddress: string;
  priceUsd: number;
  volume24hUsd: number;
  liquidityUsd: number;
  quoteReserveUsd: number;
  baseReserveTokens: number;
  curveProgress: number;
  migrationThresholdUsd: number;
  graduation: GraduationStatus;
  estimatedSlippageBpsAt10k: number;
  marketQualityScore: MarketQualityScoreBreakdown;
  regime: MarketRegime;
  status: PoolStatus;
  holderCountSampled: number;
  top10HolderConcentrationPct: number;
}

const POLL_MS = 15_000;

export function PoolDashboard({ poolAddress }: { poolAddress: string }) {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [history, setHistory] = useState<PricePoint[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);

  const poll = useCallback(async () => {
    try {
      const data = await apiFetch<Analytics>(`/api/pools/${poolAddress}/metrics`);
      setAnalytics(data);
      setError(null);
      setNotFound(false);
    } catch (err: unknown) {
      if (err && typeof err === "object" && "status" in err && (err as { status: number }).status === 404) {
        setNotFound(true);
      } else {
        setError("The Solana RPC endpoint is temporarily unavailable.");
      }
    }

    try {
      const { snapshots } = await apiFetch<{ snapshots: { timestamp: string; priceUsd: number }[] }>(
        `/api/pools/${poolAddress}/history`,
      );
      setHistory(snapshots.map((s) => ({ timestamp: s.timestamp, priceUsd: s.priceUsd })));
    } catch {
      // History is supplementary — a failure here shouldn't blank out the live metrics above.
    }
  }, [poolAddress]);

  useEffect(() => {
    let cancelled = false;
    const run = () => {
      if (!cancelled) poll();
    };
    run();
    const interval = setInterval(run, POLL_MS);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [poll]);

  if (notFound) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center sm:px-6">
        <h1 className="text-xl font-semibold text-foreground">Pool not found</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          No Meteora DBC pool exists at <span className="font-tabular">{truncateAddress(poolAddress, 6)}</span> on this
          network.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="font-tabular text-lg text-foreground">{truncateAddress(poolAddress, 6)}</h1>
          {analytics && <Badge variant="accent">{analytics.regime}</Badge>}
        </div>
        {analytics && <Badge variant={analytics.status === "graduated" ? "positive" : "neutral"}>{analytics.status}</Badge>}
      </div>

      {error && <p className="mt-4 text-sm text-negative">{error}</p>}

      {!analytics && !error && <p className="mt-8 text-sm text-muted-foreground">Loading live pool state…</p>}

      {analytics && (
        <div className="mt-8 grid gap-4 lg:grid-cols-3">
          <div className="space-y-4 lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Price</CardTitle>
                <span className="font-display text-3xl text-foreground">{formatUsd(analytics.priceUsd)}</span>
              </CardHeader>
              <CardContent>
                <PriceChart data={history} />
              </CardContent>
            </Card>

            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <Metric label="24h volume" value={formatUsd(analytics.volume24hUsd, { compact: true })} />
              <Metric label="Liquidity" value={formatUsd(analytics.liquidityUsd, { compact: true })} />
              <Metric label="Quote reserve" value={formatUsd(analytics.quoteReserveUsd, { compact: true })} />
              <Metric label="Base reserve" value={analytics.baseReserveTokens.toLocaleString("en-US", { maximumFractionDigits: 0 })} />
              <Metric label="Curve progress" value={formatPercent(analytics.curveProgress * 100)} />
              <Metric label="Est. slippage ($10k)" value={formatBps(analytics.estimatedSlippageBpsAt10k)} />
              <Metric label="Holders sampled" value={String(analytics.holderCountSampled)} />
              <Metric label="Top-10 concentration" value={formatPercent(analytics.top10HolderConcentrationPct)} />
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Graduation monitor</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-baseline justify-between">
                  <span className="font-tabular text-xl text-foreground">
                    {formatUsd(analytics.graduation.quoteReserveUsd, { compact: true })} / {formatUsd(analytics.graduation.migrationThresholdUsd, { compact: true })}
                  </span>
                  <span className="font-tabular text-sm text-muted-foreground">
                    {analytics.graduation.percentageComplete.toFixed(1)}%
                  </span>
                </div>
                <Progress value={analytics.graduation.percentageComplete} className="mt-3" />
                <p className="mt-2 text-xs capitalize text-muted-foreground">Readiness: {analytics.graduation.estimatedReadiness}</p>
                {analytics.status === "graduated" && (
                  <p className="mt-3 text-xs text-muted-foreground">
                    This pool has reached its migration threshold. Once migrated, liquidity moves into a permanent DAMM v2
                    pool per Meteora&rsquo;s configured migration rules — see docs/market-model.md for how that transition
                    works.
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-4">
            {(analytics.status === "live" || analytics.status === "near_graduation") && (
              <TradePanel poolAddress={poolAddress} onTradeConfirmed={poll} />
            )}
            <QualityScoreCard score={analytics.marketQualityScore} />
          </div>
        </div>
      )}
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <Card>
      <CardContent className="py-3">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="mt-1 font-tabular text-base text-foreground">{value}</p>
      </CardContent>
    </Card>
  );
}
