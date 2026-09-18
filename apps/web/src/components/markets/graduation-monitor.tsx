import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { formatUsd } from "@/lib/utils";
import type { GraduationCondition, GraduationConditionState, GraduationStatus, PoolStatus } from "@elf/shared";

const STATE_VISUAL: Record<GraduationConditionState, { glyph: string; className: string; label: string }> = {
  satisfied: { glyph: "✓", className: "text-positive", label: "Satisfied" },
  unsatisfied: { glyph: "○", className: "text-muted-foreground", label: "Not yet satisfied" },
  not_applicable: { glyph: "—", className: "text-muted-foreground/60", label: "Not applicable" },
  unavailable: { glyph: "?", className: "text-warning", label: "Data unavailable" },
};

const STATUS_LABEL: Record<PoolStatus, string> = {
  not_deployed: "Not deployed",
  pending_deployment: "Pending deployment",
  live: "Live on curve",
  near_graduation: "Near graduation",
  graduated: "Graduated to DAMM v2",
};

/**
 * Graduation monitor (Feature C). Every number comes from the live
 * `GraduationStatus` (on-chain quote reserve vs the market's actual
 * configured migration threshold); every checklist row comes from
 * `buildGraduationChecklist` (packages/market-engine). This component
 * contains no thresholds of its own. Volume is shown for context only —
 * DBC graduation has no volume gate — and market cap is reported as
 * unavailable because ELF does not read circulating supply on-chain.
 */
export function GraduationMonitor({
  graduation,
  checklist,
  status,
  volume24hUsd,
}: {
  graduation: GraduationStatus;
  checklist: GraduationCondition[];
  status: PoolStatus;
  volume24hUsd: number | null;
}) {
  const thresholdKnown = graduation.migrationThresholdUsd > 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Graduation monitor</CardTitle>
        <Badge variant={status === "graduated" ? "positive" : "accent"}>{STATUS_LABEL[status]}</Badge>
      </CardHeader>
      <CardContent className="space-y-5">
        <div>
          <div className="flex items-baseline justify-between gap-3">
            <span className="text-xs text-muted-foreground">Quote reserve → migration threshold</span>
            <span className="font-tabular text-sm text-muted-foreground">
              {thresholdKnown ? `${graduation.percentageComplete.toFixed(1)}%` : "Data unavailable"}
            </span>
          </div>
          <p className="mt-1 font-tabular text-xl text-foreground">
            {formatUsd(graduation.quoteReserveUsd, { compact: true })}
            {thresholdKnown && (
              <span className="text-muted-foreground"> / {formatUsd(graduation.migrationThresholdUsd, { compact: true })}</span>
            )}
          </p>
          {thresholdKnown && <Progress value={graduation.percentageComplete} className="mt-3" />}
          {thresholdKnown && (
            <p className="mt-2 text-xs capitalize text-muted-foreground">Readiness: {graduation.estimatedReadiness.replace("_", " ")}</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <ContextStat
            label="24H volume (context only)"
            value={volume24hUsd === null ? "Data unavailable" : formatUsd(volume24hUsd, { compact: true })}
          />
          <ContextStat label="Live market cap" value="Data unavailable" />
        </div>

        <div>
          <p className="mb-2 text-[11px] uppercase tracking-wide text-muted-foreground">Checklist</p>
          <ul className="space-y-2.5">
            {checklist.map((c) => {
              const visual = STATE_VISUAL[c.state];
              return (
                <li key={c.id} className="flex gap-3">
                  <span aria-hidden className={`mt-0.5 w-4 shrink-0 text-center font-tabular text-sm ${visual.className}`}>
                    {visual.glyph}
                  </span>
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-foreground">
                      {c.label} <span className="sr-only">— {visual.label}</span>
                    </p>
                    <p className="text-[11px] leading-relaxed text-muted-foreground">{c.detail}</p>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}

function ContextStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[var(--radius-sm)] border border-border bg-surface-elevated px-3 py-2">
      <p className="text-[10px] uppercase tracking-wide text-muted-foreground/70">{label}</p>
      <p className="mt-0.5 font-tabular text-sm text-foreground">{value}</p>
    </div>
  );
}
