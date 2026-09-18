"use client";

import { useCallback, useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { PriceChart } from "@/components/charts/price-chart";
import { LiquidityChart } from "@/components/charts/liquidity-chart";
import { MarketQualityCard } from "@/components/markets/market-quality-card";
import { DataFreshnessBadge } from "@/components/markets/data-freshness-badge";
import { TradePanel } from "@/components/markets/trade-panel";
import { PriceOraclePanel } from "@/components/markets/price-oracle-panel";
import { apiFetch, ApiError } from "@/lib/api-client";
import { formatUsd, truncateAddress } from "@/lib/utils";
import type {
  DataFreshness,
  GraduationStatus,
  MarketOverview,
  MarketQualityScoreResult,
  MetricOrInsufficient,
  PoolStatus,
} from "@elf/shared";

interface OverviewDto extends Omit<MarketOverview, "marketQualityScore" | "freshness"> {
  marketQualityScore: MarketQualityScoreResult;
  freshness: DataFreshness;
}

interface RecentTrade {
  signature: string;
  trader: string;
  side: "buy" | "sell";
  tokenAmount: number;
  quoteAmount: number;
  priceUsd: number;
  timestamp: string;
  source: "INDEXED";
}

function formatChange(change: MetricOrInsufficient): { text: string; positive: boolean | null } {
  if ("available" in change && change.available === false) return { text: "N/A", positive: null };
  const value = (change as { value: number }).value;
  return { text: `${value >= 0 ? "+" : ""}${value.toFixed(1)}%`, positive: value >= 0 };
}

const STATUS_VARIANT: Record<PoolStatus, "positive" | "accent" | "neutral"> = {
  not_deployed: "neutral",
  pending_deployment: "neutral",
  live: "accent",
  near_graduation: "accent",
  graduated: "positive",
};

export function MarketDetail({ marketId }: { marketId: string }) {
  const [overview, setOverview] = useState<OverviewDto | null>(null);
  const [priceHistory, setPriceHistory] = useState<{ timestamp: string; priceUsd: number }[]>([]);
  const [liquidityHistory, setLiquidityHistory] = useState<{ timestamp: string; liquidityUsd: number }[]>([]);
  const [trades, setTrades] = useState<RecentTrade[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);

  const load = useCallback(async () => {
    try {
      const data = await apiFetch<OverviewDto>(`/api/markets/${marketId}`);
      setOverview(data);
      setNotFound(false);
      setError(null);
    } catch (err) {
      if (err instanceof ApiError && err.status === 404) setNotFound(true);
      else setError("The Solana RPC endpoint or ELF database is temporarily unavailable.");
    }

    try {
      const [price, liquidity, tradesRes] = await Promise.all([
        apiFetch<{ points: { timestamp: string; priceUsd: number }[] }>(`/api/markets/${marketId}/price?period=24H`),
        apiFetch<{ points: { timestamp: string; liquidityUsd: number }[] }>(`/api/markets/${marketId}/liquidity?period=24H`),
        apiFetch<{ trades: RecentTrade[] }>(`/api/markets/${marketId}/trades?limit=15`),
      ]);
      setPriceHistory(price.points);
      setLiquidityHistory(liquidity.points);
      setTrades(tradesRes.trades);
    } catch {
      // Charts/activity are supplementary — a failure here shouldn't blank the header stats above.
    }
  }, [marketId]);

  useEffect(() => {
    let cancelled = false;
    const run = () => {
      if (!cancelled) load();
    };
    run();
    const interval = setInterval(run, 20_000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [load]);

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

  if (!overview && !error) {
    return <p className="mx-auto max-w-7xl px-4 py-20 text-sm text-muted-foreground sm:px-6">Loading market…</p>;
  }

  if (error && !overview) {
    return <p className="mx-auto max-w-7xl px-4 py-20 text-sm text-negative sm:px-6">{error}</p>;
  }

  const o = overview!;
  const priceChange = formatChange(o.priceChange24h);
  const graduation: GraduationStatus = o.graduation;

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-tabular text-lg text-foreground">{truncateAddress(o.poolAddress ?? o.marketId, 6)}</h1>
            <Badge variant={STATUS_VARIANT[o.status]}>{o.status.replace("_", " ")}</Badge>
            <Badge variant="neutral">{o.regime}</Badge>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-display text-3xl text-foreground">{formatUsd(o.priceUsd.value)}</span>
            <span className={`font-tabular text-sm ${priceChange.positive === null ? "text-muted-foreground" : priceChange.positive ? "text-positive" : "text-negative"}`}>
              {priceChange.text} 24H
            </span>
          </div>
        </div>
        <DataFreshnessBadge freshness={o.freshness} />
      </div>

      {error && <p className="mt-4 text-sm text-negative">{error}</p>}

      <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        <Stat label="Liquidity" value={formatUsd(o.liquidityUsd.value, { compact: true })} source={o.liquidityUsd.source} />
        <Stat label="24H Volume" value={formatUsd(o.volume24hUsd.value, { compact: true })} source={o.volume24hUsd.source} />
        <Stat label="Trades (24H)" value={o.tradeCount24h.toLocaleString("en-US")} source="INDEXED" />
        <Stat label="Unique traders (24H)" value={o.uniqueTraders24h.toLocaleString("en-US")} source="INDEXED" />
        <Stat label="Graduation" value={`${graduation.percentageComplete.toFixed(1)}%`} source="ON_CHAIN" />
      </div>

      <div className="mt-8 grid gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Price</CardTitle>
              <span className="text-[11px] uppercase tracking-wide text-muted-foreground">Indexed on-chain trades</span>
            </CardHeader>
            <CardContent>
              <PriceChart data={priceHistory} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Liquidity</CardTitle>
              <span className="text-[11px] uppercase tracking-wide text-muted-foreground">Indexed on-chain trades</span>
            </CardHeader>
            <CardContent>
              <LiquidityChart data={liquidityHistory} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Volume (24H)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Buy {formatUsd(o.buyVolumeUsd24h, { compact: true })}</span>
                <span>Sell {formatUsd(o.sellVolumeUsd24h, { compact: true })}</span>
              </div>
              <div className="mt-2 flex h-2 overflow-hidden rounded-full bg-surface-elevated">
                <div
                  className="h-full bg-positive"
                  style={{
                    width: `${o.buyVolumeUsd24h + o.sellVolumeUsd24h > 0 ? (o.buyVolumeUsd24h / (o.buyVolumeUsd24h + o.sellVolumeUsd24h)) * 100 : 50}%`,
                  }}
                />
                <div className="h-full flex-1 bg-negative" />
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                Buy/sell ratio: {o.buySellRatio24h !== null ? o.buySellRatio24h.toFixed(2) : "N/A (no sells yet)"}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Graduation monitor</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline justify-between">
                <span className="font-tabular text-xl text-foreground">
                  {formatUsd(graduation.quoteReserveUsd, { compact: true })} / {formatUsd(graduation.migrationThresholdUsd, { compact: true })}
                </span>
                <span className="font-tabular text-sm text-muted-foreground">{graduation.percentageComplete.toFixed(1)}%</span>
              </div>
              <Progress value={graduation.percentageComplete} className="mt-3" />
              <p className="mt-2 text-xs capitalize text-muted-foreground">Readiness: {graduation.estimatedReadiness}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent activity</CardTitle>
              <span className="text-[11px] uppercase tracking-wide text-muted-foreground">Indexed on-chain data</span>
            </CardHeader>
            <CardContent>
              {trades.length === 0 ? (
                <p className="text-sm text-muted-foreground">No indexed trades yet for this market.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-xs uppercase tracking-wide text-muted-foreground">
                        <th className="px-2 py-2">Side</th>
                        <th className="px-2 py-2">Amount</th>
                        <th className="px-2 py-2">Price</th>
                        <th className="px-2 py-2">Trader</th>
                        <th className="px-2 py-2">Time</th>
                      </tr>
                    </thead>
                    <tbody>
                      {trades.map((t) => (
                        <tr key={t.signature} className="border-t border-border">
                          <td className="px-2 py-2 capitalize text-muted-foreground">{t.side}</td>
                          <td className="px-2 py-2 font-tabular">{formatUsd(t.tokenAmount * t.priceUsd, { compact: true })}</td>
                          <td className="px-2 py-2 font-tabular">{formatUsd(t.priceUsd)}</td>
                          <td className="px-2 py-2 font-tabular text-muted-foreground">{truncateAddress(t.trader)}</td>
                          <td className="px-2 py-2 text-muted-foreground">{new Date(t.timestamp).toLocaleTimeString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          {o.poolAddress && (o.status === "live" || o.status === "near_graduation") && (
            <TradePanel poolAddress={o.poolAddress} onTradeConfirmed={load} />
          )}
          {o.poolAddress && o.status === "graduated" && (
            <Card>
              <CardContent className="py-4 text-xs text-muted-foreground">
                This market has graduated to a permanent DAMM v2 pool — trading now happens outside the DBC curve this
                panel builds transactions against.
              </CardContent>
            </Card>
          )}
          <PriceOraclePanel onChainPriceUsd={o.priceUsd.value} feeds={o.priceOracle} />
          <MarketQualityCard
            score={o.marketQualityScore}
            referencePriceSource={o.referencePriceSource}
            referencePriceFeedSymbol={o.referencePriceFeedSymbol}
          />
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value, source }: { label: string; value: string; source: "ON_CHAIN" | "INDEXED" | "SIMULATED" }) {
  return (
    <Card>
      <CardContent className="py-3">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="mt-1 font-tabular text-base text-foreground">{value}</p>
        <p className="mt-0.5 text-[10px] uppercase tracking-wide text-muted-foreground/70">{source.replace("_", "-")}</p>
      </CardContent>
    </Card>
  );
}
