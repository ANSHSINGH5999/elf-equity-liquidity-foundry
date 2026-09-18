import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { MarketQualityScoreResult } from "@elf/shared";

const ROWS: { key: keyof MarketQualityScoreResult["breakdown"]; label: string; max: number }[] = [
  { key: "liquidityDepth", label: "Liquidity depth", max: 25 },
  { key: "priceStability", label: "Price stability", max: 20 },
  { key: "volumeQuality", label: "Volume quality", max: 15 },
  { key: "slippage", label: "Slippage", max: 20 },
  { key: "holderDistribution", label: "Holder distribution", max: 10 },
  { key: "referencePriceAlignment", label: "Reference-price alignment", max: 10 },
];

/**
 * Phase 5's explainability layer over the existing (Phase 1) score —
 * a distinct component from `quality-score-card.tsx` (used by the
 * pool-address-keyed dashboard) rather than a modification to it, so the
 * original page's behavior is untouched.
 */
interface MarketQualityCardProps {
  score: MarketQualityScoreResult;
  referencePriceSource?: "pyth" | "issuer_declared";
  referencePriceFeedSymbol?: string | null;
}

export function MarketQualityCard({ score, referencePriceSource, referencePriceFeedSymbol }: MarketQualityCardProps) {
  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>ELF Market Quality Score</CardTitle>
          <p className="mt-0.5 text-[11px] uppercase tracking-[0.08em] text-subtle-foreground">{score.label} · {score.version}</p>
        </div>
        <span className="font-display text-3xl text-foreground">{score.breakdown.total.toFixed(0)}</span>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {ROWS.map((row) => (
            <div key={row.key}>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">{row.label}</span>
                <span className="font-tabular text-foreground">
                  {score.breakdown[row.key].toFixed(1)} / {row.max}
                </span>
              </div>
              <div className="mt-1.5 h-1 w-full overflow-hidden rounded-full bg-surface-elevated">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-accent to-accent-strong transition-[width] duration-700 ease-[var(--ease-premium)]"
                  style={{ width: `${Math.min(100, (score.breakdown[row.key] / row.max) * 100)}%` }}
                />
              </div>
              {row.key === "referencePriceAlignment" && referencePriceSource && (
                <p className="mt-1 text-[10px] text-subtle-foreground">
                  {referencePriceSource === "pyth" ? (
                    <>
                      Live Pyth feed
                      {referencePriceFeedSymbol ? ` (${referencePriceFeedSymbol})` : ""}, not the issuer-declared price.
                    </>
                  ) : (
                    "Issuer-declared reference price — no public Pyth equity feed for this ticker."
                  )}
                </p>
              )}
            </div>
          ))}
        </div>

        <div className="mt-4 space-y-2 border-t border-border pt-3 text-xs">
          <div className="flex items-start gap-2">
            <Badge variant="positive" className="mt-0.5 shrink-0">
              Signal
            </Badge>
            <span className="text-muted-foreground">{score.primarySignal}</span>
          </div>
          {score.riskSignal && (
            <div className="flex items-start gap-2">
              <Badge variant="warning" className="mt-0.5 shrink-0">
                Risk
              </Badge>
              <span className="text-muted-foreground">{score.riskSignal}</span>
            </div>
          )}
          <p className="pt-1 text-[11px] text-muted-foreground">Data period: {score.dataPeriodLabel}</p>
        </div>
      </CardContent>
    </Card>
  );
}
