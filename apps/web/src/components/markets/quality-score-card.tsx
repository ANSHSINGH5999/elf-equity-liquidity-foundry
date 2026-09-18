"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Info } from "lucide-react";
import type { MarketQualityScoreBreakdown } from "@elf/shared";

const ROWS: { key: keyof MarketQualityScoreBreakdown; label: string; max: number }[] = [
  { key: "liquidityDepth", label: "Liquidity depth", max: 25 },
  { key: "priceStability", label: "Price stability", max: 20 },
  { key: "volumeQuality", label: "Volume quality", max: 15 },
  { key: "slippage", label: "Slippage", max: 20 },
  { key: "holderDistribution", label: "Holder distribution", max: 10 },
  { key: "referencePriceAlignment", label: "Reference-price alignment", max: 10 },
];

export function QualityScoreCard({ score }: { score: MarketQualityScoreBreakdown }) {
  const [showInfo, setShowInfo] = useState(false);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <CardTitle>ELF Market Quality Score</CardTitle>
          <button onClick={() => setShowInfo((v) => !v)} className="text-muted-foreground hover:text-foreground">
            <Info size={14} />
          </button>
        </div>
        <span className="font-display text-3xl text-foreground">{score.total.toFixed(0)}</span>
      </CardHeader>
      <CardContent>
        {showInfo && (
          <p className="mb-5 rounded-[var(--radius-sm)] border border-border-strong bg-surface-elevated p-3.5 text-xs leading-relaxed text-muted-foreground">
            A deterministic, in-house 100-point score — not an industry-standard metric. Liquidity depth compares current
            liquidity to the issuer&rsquo;s declared target; price stability penalizes recent volatility; volume quality
            compares 24h volume to expected turnover; slippage scores a live $10k quote; holder distribution rewards a broad,
            unconcentrated holder base (sampled from the 20 largest accounts, not a full census); reference-price alignment
            penalizes drift from the asset&rsquo;s declared reference price.
          </p>
        )}
        <div className="space-y-3">
          {ROWS.map((row) => (
            <div key={row.key}>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">{row.label}</span>
                <span className="font-tabular text-foreground">
                  {score[row.key].toFixed(1)} / {row.max}
                </span>
              </div>
              <div className="mt-1.5 h-1 w-full overflow-hidden rounded-full bg-surface-elevated">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-accent to-accent-strong transition-[width] duration-700 ease-[var(--ease-premium)]"
                  style={{ width: `${Math.min(100, (score[row.key] / row.max) * 100)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
