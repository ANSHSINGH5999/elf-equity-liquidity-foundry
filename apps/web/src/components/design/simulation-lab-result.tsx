import { Badge } from "@/components/ui/badge";
import { LabCharts } from "@/components/design/lab-charts";
import { LAB_SCENARIO_LABELS, type LabComparison } from "@elf/market-engine";
import { PRICE_IMPACT_WATCH_BPS, SIMULATION_MAX_IMPACT_BPS, type LabCheckStatus, type LabRunResult } from "@elf/shared";
import { formatBps, formatUsd } from "@/lib/utils";

const CHECK_VISUAL: Record<LabCheckStatus, { glyph: string; tone: string; text: string }> = {
  pass: { glyph: "✓", tone: "text-positive", text: "Passed" },
  warn: { glyph: "⚠", tone: "text-warning", text: "Warning" },
  fail: { glyph: "✕", tone: "text-negative", text: "Failed" },
  unavailable: { glyph: "?", tone: "text-muted-foreground", text: "DATA UNAVAILABLE" },
};

const Label = ({ children }: { children: React.ReactNode }) => (
  <span className="font-tabular text-[10px] uppercase tracking-[0.18em] text-muted-foreground">[ {children} ]</span>
);

const unfillable = (bps: number) => bps >= SIMULATION_MAX_IMPACT_BPS;

/**
 * Renders one completed run exactly as the engine and the Lab evaluator
 * produced it. No value here is computed client-side except formatting.
 */
export function LabResultView({ run }: { run: LabRunResult }) {
  const { result, graduation } = run;
  const filled = result.trades.filter((t) => !unfillable(t.estimatedPriceImpactBps));
  const totalFees = filled.reduce((sum, t) => sum + t.feeUsd, 0);

  return (
    <section aria-labelledby="lab-result-title" className="space-y-5">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Label>SIMULATION_RESULT</Label>
          <h2 id="lab-result-title" className="mt-1 text-sm font-medium text-foreground">
            {LAB_SCENARIO_LABELS[run.scenario]} · {run.curveLabel}
            {run.parameters.customised && <span className="ml-2 text-[11px] text-warning">custom parameters</span>}
          </h2>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="positive">Status: Completed</Badge>
          <Badge variant="warning">{run.label}</Badge>
        </div>
      </header>

      <dl className="grid grid-cols-2 gap-px border border-border bg-border/60 sm:grid-cols-4">
        <Metric label="Start price" value={result.startPriceUsd === undefined ? "Data unavailable" : formatUsd(result.startPriceUsd)} />
        <Metric label="Worst-case impact" value={unfillable(result.worstCasePriceImpactBps) ? "Not fillable" : formatBps(result.worstCasePriceImpactBps)} />
        <Metric label="Fees (filled trades)" value={formatUsd(totalFees)} />
        <Metric label="Curve position" value={result.curveProgressFraction === undefined ? "Data unavailable" : `${+(result.curveProgressFraction * 100).toFixed(1)}%`} />
      </dl>

      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <caption className="sr-only">Simulated trades</caption>
          <thead>
            <tr className="text-left uppercase tracking-wide text-muted-foreground">
              <th className="py-2 pr-3 font-medium">Trade</th>
              <th className="py-2 pr-3 font-medium">Exec. price</th>
              <th className="py-2 pr-3 font-medium">Impact</th>
              <th className="py-2 pr-3 font-medium">Post-trade price</th>
              <th className="py-2 pr-3 font-medium">Fee</th>
              <th className="py-2 font-medium">Quote reserve after</th>
            </tr>
          </thead>
          <tbody>
            {result.trades.map((t, i) => {
              const bad = unfillable(t.estimatedPriceImpactBps);
              return (
                <tr key={i} className="border-t border-border">
                  <td className="py-2 pr-3 font-tabular capitalize text-foreground">
                    {t.side} {formatUsd(t.tradeSizeUsd, { compact: true })}
                  </td>
                  {bad ? (
                    <td colSpan={5} className="py-2 text-negative">
                      Could not be filled — exceeds the curve&rsquo;s remaining depth in this direction
                    </td>
                  ) : (
                    <>
                      <td className="py-2 pr-3 font-tabular">{formatUsd(t.estimatedExecutionPrice)}</td>
                      <td className={`py-2 pr-3 font-tabular ${t.estimatedPriceImpactBps >= PRICE_IMPACT_WATCH_BPS ? "text-warning" : ""}`}>{formatBps(t.estimatedPriceImpactBps)}</td>
                      <td className="py-2 pr-3 font-tabular">{formatUsd(t.postTradePrice)}</td>
                      <td className="py-2 pr-3 font-tabular text-muted-foreground">{formatUsd(t.feeUsd)}</td>
                      <td className="py-2 font-tabular">{t.reserveQuoteAfter === null ? "Data unavailable" : formatUsd(t.reserveQuoteAfter)}</td>
                    </>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <LabCharts run={run}>
      <div>
        <Label>SIMULATED_GRADUATION_STATE</Label>
        {graduation === null ? (
          <p className="mt-2 text-xs text-muted-foreground">DATA UNAVAILABLE — this result does not carry quote-reserve data.</p>
        ) : (
          <div className="mt-2 space-y-1.5 text-xs">
            <p className="leading-relaxed text-muted-foreground">
              The one real DBC condition — the pool&rsquo;s quote reserve reaching the migration threshold — evaluated on the <span className="text-foreground">simulated</span> reserve. This is not the state of any
              on-chain pool.
            </p>
            <Row label="Migration threshold (Meteora-derived)" value={formatUsd(graduation.migrationThresholdUsd)} />
            <Row label="Simulated reserve at start position" value={`${formatUsd(graduation.startQuoteReserveUsd)} (${graduation.startPercentComplete}%)`} />
            <Row
              label="Condition met after any single trade"
              value={graduation.anyTradeReachesThreshold ? "Yes — in this simulation" : "No"}
            />
          </div>
        )}
      </div>
      </LabCharts>

      <div>
        <Label>RISK_CHECKS</Label>
        <ul className="mt-2 space-y-2">
          {run.checks.map((c) => {
            const v = CHECK_VISUAL[c.status];
            return (
              <li key={c.id} className="flex gap-3">
                <span aria-hidden className={`mt-px w-4 shrink-0 text-center text-sm ${v.tone}`}>
                  {v.glyph}
                </span>
                <div className="min-w-0">
                  <p className="text-xs text-foreground">
                    {c.label} <span className={`ml-1 text-[10px] uppercase tracking-wide ${v.tone}`}>{v.text}</span>
                  </p>
                  <p className="text-[11px] leading-relaxed text-muted-foreground">{c.detail}</p>
                </div>
              </li>
            );
          })}
        </ul>
        <p className="mt-3 text-[11px] leading-relaxed text-muted-foreground/80">No score — each check is pass, warning, fail or unavailable. Cutoffs are ELF-defined analytical parameters, not protocol values.</p>
      </div>

      {run.warnings.length > 0 && (
        <div>
          <Label>WARNINGS</Label>
          <ul className="mt-2 list-disc space-y-1 pl-4">
            {run.warnings.map((w) => (
              <li key={w} className="text-xs leading-relaxed text-warning">
                {w}
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}

/** Side-by-side comparison of runs of ONE configuration. Refuses incompatible sets with the engine's own reason. */
export function LabComparisonTable({ comparison }: { comparison: LabComparison }) {
  if (!comparison.compatible) {
    return (
      <p className="text-xs text-warning" role="status">
        {comparison.reason}
      </p>
    );
  }
  const { runs } = comparison;
  const rows: [string, (r: (typeof runs)[number]) => string][] = [
    ["Start price", (r) => (r.startPriceUsd === null ? "Data unavailable" : formatUsd(r.startPriceUsd))],
    ["Worst-case impact", (r) => (unfillable(r.worstImpactBps) ? "Not fillable" : formatBps(r.worstImpactBps))],
    ["Mean impact (filled trades)", (r) => (r.meanFilledImpactBps === null ? "None filled" : formatBps(r.meanFilledImpactBps))],
    ["Unfillable trades", (r) => `${r.unfillableTrades} of 4`],
    ["Fees (filled trades)", (r) => formatUsd(r.totalFeesUsd)],
    ["Simulated graduation progress", (r) => (r.startReservePercent === null ? "Data unavailable" : `${r.startReservePercent}%`)],
    ["Threshold reached by a trade", (r) => (r.anyTradeReachesThreshold === null ? "Data unavailable" : r.anyTradeReachesThreshold ? "Yes" : "No")],
    ["Checks (pass / warn / fail / n.a.)", (r) => `${r.checkCounts.pass} / ${r.checkCounts.warn} / ${r.checkCounts.fail} / ${r.checkCounts.unavailable}`],
  ];
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs">
        <caption className="pb-2 text-left text-[11px] text-muted-foreground">
          {comparison.curveLabel} · every column was produced by the same simulation engine · <span className="text-warning">SIMULATED</span>
        </caption>
        <thead>
          <tr className="text-left uppercase tracking-wide text-muted-foreground">
            <th className="py-2 pr-3 font-medium" />
            {runs.map((r) => (
              <th key={r.runId} className="py-2 pr-3 font-medium">
                {r.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map(([label, cell]) => (
            <tr key={label} className="border-t border-border">
              <th scope="row" className="py-2 pr-3 text-left font-normal text-muted-foreground">
                {label}
              </th>
              {runs.map((r) => (
                <td key={r.runId} className="py-2 pr-3 font-tabular text-foreground">
                  {cell(r)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-surface px-4 py-3">
      <dt className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground">{label}</dt>
      <dd className="mt-1 font-tabular text-sm text-foreground">{value}</dd>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right font-tabular text-foreground">{value}</span>
    </div>
  );
}
