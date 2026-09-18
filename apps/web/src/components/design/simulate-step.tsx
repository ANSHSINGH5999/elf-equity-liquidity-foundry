"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatUsd, formatBps } from "@/lib/utils";
import { apiFetch, ApiError } from "@/lib/api-client";
import type { CurveConfigDto, SimulationRunDto } from "@/lib/api-types";

const SCENARIO_LABELS: Record<string, string> = {
  normal_demand: "Normal demand",
  strong_buy_pressure: "Strong buy pressure",
  strong_sell_pressure: "Strong sell pressure",
  low_liquidity: "Low liquidity",
  high_volatility: "High volatility",
  graduation_approach: "Graduation approach",
};

export function SimulateStep({ candidate, onComplete }: { candidate: CurveConfigDto; onComplete: () => void }) {
  const [run, setRun] = useState<SimulationRunDto | null>(null);
  const [error, setError] = useState<string | null>(null);
  const loading = run === null && error === null;

  useEffect(() => {
    let cancelled = false;
    apiFetch<SimulationRunDto>("/api/markets/simulate", {
      method: "POST",
      body: JSON.stringify({ curveCandidateId: candidate.id }),
    })
      .then((res) => {
        if (!cancelled) setRun(res);
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof ApiError ? err.message : "Simulation failed.");
      });
    return () => {
      cancelled = true;
    };
  }, [candidate.id]);

  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle className="font-display text-xl font-normal">Step 4 — Simulation</CardTitle>
          <CardDescription>
            Six demand scenarios, four trade sizes each, run against the real Meteora curve math for {candidate.label}. Every
            figure below is <Badge variant="warning">SIMULATED</Badge> — never live market data.
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        {loading && <p className="text-sm text-muted-foreground">Running scenarios against the curve…</p>}
        {error && (
          <div className="rounded-[var(--radius-sm)] border border-negative/30 bg-negative-muted p-4 text-sm text-negative">
            {error}
          </div>
        )}

        {run && (
          <div className="space-y-4">
            {run.scenarios.map((scenario) => (
              <div key={scenario.scenario} className="rounded-[var(--radius-md)] border border-border">
                <div className="flex items-center justify-between border-b border-border px-4 py-3">
                  <div>
                    <p className="text-sm font-medium text-foreground">{SCENARIO_LABELS[scenario.scenario] ?? scenario.scenario}</p>
                    <p className="text-xs text-muted-foreground">{scenario.description}</p>
                  </div>
                  <Badge variant={scenario.worstCasePriceImpactBps > 500 ? "negative" : "neutral"}>
                    worst impact {formatBps(scenario.worstCasePriceImpactBps)}
                  </Badge>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-xs uppercase tracking-wide text-muted-foreground">
                        <th className="px-4 py-2">Trade size</th>
                        <th className="px-4 py-2">Side</th>
                        <th className="px-4 py-2">Exec. price</th>
                        <th className="px-4 py-2">Price impact</th>
                        <th className="px-4 py-2">Post-trade price</th>
                        <th className="px-4 py-2">Fee</th>
                      </tr>
                    </thead>
                    <tbody>
                      {scenario.trades.map((trade, i) => (
                        <tr key={i} className="border-t border-border">
                          <td className="px-4 py-2 font-tabular">{formatUsd(trade.tradeSizeUsd, { compact: true })}</td>
                          <td className="px-4 py-2 capitalize text-muted-foreground">{trade.side}</td>
                          <td className="px-4 py-2 font-tabular">{formatUsd(trade.estimatedExecutionPrice)}</td>
                          <td className="px-4 py-2 font-tabular">{formatBps(trade.estimatedPriceImpactBps)}</td>
                          <td className="px-4 py-2 font-tabular">{formatUsd(trade.postTradePrice)}</td>
                          <td className="px-4 py-2 font-tabular text-muted-foreground">{formatUsd(trade.feeUsd)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}

            <Button onClick={onComplete}>Review configuration for deployment</Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
