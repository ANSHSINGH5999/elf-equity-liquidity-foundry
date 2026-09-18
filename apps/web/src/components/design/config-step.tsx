"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn, formatUsd } from "@/lib/utils";
import type { CurveConfigDto } from "@/lib/api-types";

const METRIC_ROWS: { key: keyof CurveConfigDto["score"]; label: string }[] = [
  { key: "priceImpact", label: "Price Impact" },
  { key: "discoverySpeed", label: "Discovery Speed" },
  { key: "liquidityEfficiency", label: "Liquidity Efficiency" },
  { key: "feeGeneration", label: "Fee Generation" },
  { key: "stressResilience", label: "Stress Resilience" },
  { key: "graduationReadiness", label: "Graduation Readiness" },
];

export function ConfigStep({
  curveConfigs,
  onComplete,
}: {
  curveConfigs: CurveConfigDto[];
  onComplete: (selected: CurveConfigDto) => void;
}) {
  const recommended = curveConfigs.find((c) => c.isRecommended) ?? curveConfigs[0]!;
  const [selectedId, setSelectedId] = useState(recommended.id);
  const selected = curveConfigs.find((c) => c.id === selectedId) ?? recommended;

  const ordered = ["conservative", "balanced", "growth"] as const;
  const byProfile = Object.fromEntries(curveConfigs.map((c) => [c.riskProfile, c]));

  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle className="font-display text-xl font-normal">Step 3 — Configuration</CardTitle>
          <CardDescription>
            Three deterministic candidates, scored against your stated objectives. ELF recommends one — the recommendation is
            explainable, not a black box.
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3 sm:grid-cols-3">
          {ordered.map((profile) => {
            const candidate = byProfile[profile];
            if (!candidate) return null;
            const isSelected = candidate.id === selectedId;
            return (
              <button
                key={candidate.id}
                onClick={() => setSelectedId(candidate.id)}
                className={cn(
                  "rounded-[var(--radius-md)] border p-4 text-left transition-colors",
                  isSelected ? "border-accent bg-accent-muted" : "border-border-strong bg-surface-elevated hover:border-accent/50",
                )}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-foreground">{candidate.label}</span>
                  {candidate.isRecommended && <Badge variant="positive">Recommended</Badge>}
                </div>
                <p className="mt-2 font-tabular text-2xl text-foreground">{candidate.score.composite.toFixed(1)}</p>
                <p className="text-xs text-muted-foreground">composite score</p>
              </button>
            );
          })}
        </div>

        <div className="mt-6 overflow-x-auto rounded-[var(--radius-md)] border border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                <th className="px-4 py-3">Metric</th>
                {ordered.map((p) => (
                  <th key={p} className="px-4 py-3 font-tabular capitalize">
                    {p}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {METRIC_ROWS.map((row) => (
                <tr key={row.key} className="border-b border-border last:border-0">
                  <td className="px-4 py-2.5 text-muted-foreground">{row.label}</td>
                  {ordered.map((p) => {
                    const candidate = byProfile[p];
                    const value = candidate ? (candidate.score[row.key] as number) : null;
                    return (
                      <td
                        key={p}
                        className={cn(
                          "px-4 py-2.5 font-tabular",
                          candidate?.isRecommended && "text-accent font-medium",
                        )}
                      >
                        {value !== null ? value.toFixed(1) : "—"}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-6 rounded-[var(--radius-md)] border border-border bg-surface-elevated p-5">
          <h3 className="text-sm font-medium text-foreground">{selected.label} — parameters</h3>
          <div className="mt-3 grid gap-4 text-sm sm:grid-cols-2">
            <div>
              <p className="text-xs text-muted-foreground">Initial market cap</p>
              <p className="font-tabular text-foreground">{formatUsd(selected.initialMarketCapUsd, { compact: true })}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Migration market cap</p>
              <p className="font-tabular text-foreground">{formatUsd(selected.migrationMarketCapUsd, { compact: true })}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Fee schedule</p>
              <p className="font-tabular text-foreground">
                {(selected.feeSchedule.startingFeeBps / 100).toFixed(2)}% → {(selected.feeSchedule.endingFeeBps / 100).toFixed(2)}% over{" "}
                {selected.feeSchedule.numberOfPeriods} periods
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Dynamic fee</p>
              <p className="font-tabular text-foreground">{selected.feeSchedule.dynamicFeeEnabled ? "Enabled" : "Disabled"}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Migration fee</p>
              <p className="font-tabular text-foreground">{(selected.migration.migrationFeeOptionBps / 100).toFixed(2)}%</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Liquidity distribution</p>
              <p className="font-tabular text-foreground">
                {selected.liquidityDistribution.creatorLiquidityPercentage}% creator, {selected.liquidityDistribution.creatorPermanentLockedLiquidityPercentage}% permanently locked
              </p>
            </div>
          </div>
          <p className="mt-4 text-sm text-muted-foreground">{selected.rationale}</p>
        </div>

        <div className="mt-6">
          <Button onClick={() => onComplete(selected)}>Simulate this configuration</Button>
        </div>
      </CardContent>
    </Card>
  );
}
