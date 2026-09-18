import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { RiskIndicator, RiskStatus } from "@elf/shared";

const STATUS_VARIANT: Record<RiskStatus, "positive" | "warning" | "neutral"> = {
  NORMAL: "positive",
  WATCH: "warning",
  DATA_UNAVAILABLE: "neutral",
};

const STATUS_TEXT: Record<RiskStatus, string> = {
  NORMAL: "NORMAL",
  WATCH: "WATCH",
  DATA_UNAVAILABLE: "DATA UNAVAILABLE",
};

export function formatIndicatorValue(indicator: Pick<RiskIndicator, "value" | "unit">): string {
  if (indicator.value === null) return "Data unavailable";
  if (indicator.unit === "pct") return `${indicator.value.toFixed(1)}%`;
  if (indicator.unit === "count") return indicator.value.toLocaleString("en-US");
  return "";
}

/**
 * Renders the issuer risk indicators exactly as computed by
 * `computeRiskIndicators` (packages/market-engine) — this component adds no
 * thresholds or judgement of its own. Each card shows the formula behind
 * its number, so nothing on screen is unexplained.
 */
export function RiskIndicators({ indicators }: { indicators: RiskIndicator[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Risk indicators</CardTitle>
        <span className="text-[11px] uppercase tracking-wide text-muted-foreground">NORMAL · WATCH · DATA UNAVAILABLE</span>
      </CardHeader>
      <CardContent>
        <ul className="grid gap-3 sm:grid-cols-2">
          {indicators.map((indicator) => (
            <li key={indicator.id} className="rounded-[var(--radius-sm)] border border-border bg-surface-elevated p-3.5">
              <div className="flex items-start justify-between gap-3">
                <p className="text-xs font-medium text-foreground">{indicator.label}</p>
                <Badge variant={STATUS_VARIANT[indicator.status]}>{STATUS_TEXT[indicator.status]}</Badge>
              </div>
              {indicator.unit !== null && (
                <p className="mt-2 font-tabular text-lg text-foreground">{formatIndicatorValue(indicator)}</p>
              )}
              {indicator.note && <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">{indicator.note}</p>}
              <details className="mt-2">
                <summary className="cursor-pointer text-[10px] uppercase tracking-wide text-muted-foreground/70 hover:text-muted-foreground">
                  How this is calculated
                </summary>
                <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">{indicator.formula}</p>
              </details>
            </li>
          ))}
        </ul>
        <p className="mt-4 text-[11px] leading-relaxed text-muted-foreground/80">
          WATCH cutoffs are ELF-defined analytical parameters, not protocol values or investment guidance. Every measured
          value is shown so you can apply your own judgement.
        </p>
      </CardContent>
    </Card>
  );
}
