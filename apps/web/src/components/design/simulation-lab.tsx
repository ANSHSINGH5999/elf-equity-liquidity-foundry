"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { compareLabRuns, LAB_SCENARIO_LABELS } from "@elf/market-engine";
import { SIMULATION_LAB_MAX_PROGRESS_PCT, TRADE_SIZES_USD, type LabRunResult, type SimulationScenarioKind } from "@elf/shared";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LabComparisonTable, LabResultView } from "@/components/design/simulation-lab-result";
import {
  addRun,
  getServerRunsSnapshot,
  getSessionRunsSnapshot,
  parseStoredRuns,
  removeRun,
  saveSessionRuns,
  subscribeSessionRuns,
  toggleId,
} from "@/components/design/lab-state";
import { apiFetch, ApiError } from "@/lib/api-client";
import { cn, formatUsd } from "@/lib/utils";

interface LabContext {
  asset: { name: string; symbol: string };
  selectedId: string;
  candidates: { id: string; label: string; riskProfile: string; isRecommended: boolean }[];
  scenarios: { id: SimulationScenarioKind; label: string; description: string; curveProgressPct: number; sides: ("buy" | "sell")[] }[];
  assumptions: string[];
  notModelled: string[];
}

type Side = "buy" | "sell";

const Label = ({ children }: { children: React.ReactNode }) => (
  <span className="font-tabular text-[10px] uppercase tracking-[0.18em] text-muted-foreground">[ {children} ]</span>
);

const errorText = (err: unknown, fallback: string) => (err instanceof ApiError ? err.message : fallback);

/**
 * ELF Simulation Lab. Evaluates a STORED curve configuration under scenarios
 * the existing simulation engine can represent, entirely off-chain: it never
 * builds or signs a transaction and never writes to the server. Completed runs
 * are kept for this browser session only.
 */
export function SimulationLab({ curveCandidateId }: { curveCandidateId: string | null }) {
  const [ctx, setCtx] = useState<LabContext | null>(null);
  const [ctxError, setCtxError] = useState<string | null>(null);
  const [configId, setConfigId] = useState<string | null>(curveCandidateId);
  const [scenarioId, setScenarioId] = useState<SimulationScenarioKind>("normal_demand");
  const [progressOverride, setProgressOverride] = useState<number | null>(null);
  const [sidesOverride, setSidesOverride] = useState<Side[] | null>(null);
  const [running, setRunning] = useState(false);
  const [runError, setRunError] = useState<string | null>(null);
  const [activeRunId, setActiveRunId] = useState<string | null>(null);
  const [compareIds, setCompareIds] = useState<string[]>([]);
  const [showCompare, setShowCompare] = useState(false);

  const stored = useSyncExternalStore(subscribeSessionRuns, getSessionRunsSnapshot, getServerRunsSnapshot);
  const runs = useMemo(() => parseStoredRuns(stored), [stored]);

  useEffect(() => {
    if (!curveCandidateId) return;
    let cancelled = false;
    apiFetch<LabContext>(`/api/markets/simulation-lab?curveCandidateId=${encodeURIComponent(curveCandidateId)}`)
      .then((res) => {
        if (!cancelled) setCtx(res);
      })
      .catch((err) => {
        if (!cancelled) setCtxError(errorText(err, "The Simulation Lab could not load this configuration."));
      });
    return () => {
      cancelled = true;
    };
  }, [curveCandidateId]);

  if (!curveCandidateId) {
    return (
      <Shell>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Open the Simulation Lab from a configuration you have designed: finish <Link href="/design" className="text-accent-strong hover:underline">Market design</Link> and use
          &ldquo;Open in Simulation Lab&rdquo; on the simulation step. The Lab evaluates a stored configuration — it never accepts curve parameters typed in by hand.
        </p>
      </Shell>
    );
  }
  if (ctxError) {
    return (
      <Shell>
        <p className="text-sm text-negative" role="alert">
          {ctxError}
        </p>
      </Shell>
    );
  }
  if (!ctx) {
    return (
      <Shell>
        <p className="text-sm text-muted-foreground" role="status">
          Loading configuration…
        </p>
      </Shell>
    );
  }

  const scenario = ctx.scenarios.find((s) => s.id === scenarioId) ?? ctx.scenarios[0]!;
  const progress = progressOverride ?? scenario.curveProgressPct;
  const sides = sidesOverride ?? scenario.sides;
  const activeConfigId = configId ?? ctx.selectedId;
  const activeConfig = ctx.candidates.find((c) => c.id === activeConfigId);
  const customised = progressOverride !== null || sidesOverride !== null;
  const activeRun: LabRunResult | undefined = runs.find((r) => r.runId === activeRunId) ?? runs[0];
  const comparison = showCompare ? compareLabRuns(runs.filter((r) => compareIds.includes(r.runId))) : null;

  function chooseScenario(id: SimulationScenarioKind) {
    setScenarioId(id);
    setProgressOverride(null);
    setSidesOverride(null);
    setRunError(null);
  }

  async function runSimulation() {
    setRunning(true);
    setRunError(null);
    try {
      const run = await apiFetch<LabRunResult>("/api/markets/simulation-lab", {
        method: "POST",
        body: JSON.stringify({
          curveCandidateId: activeConfigId,
          scenario: scenarioId,
          ...(progressOverride !== null ? { curveProgressPct: progressOverride } : {}),
          ...(sidesOverride !== null ? { sides: sidesOverride } : {}),
        }),
      });
      saveSessionRuns(addRun(runs, run));
      setActiveRunId(run.runId);
    } catch (err) {
      setRunError(errorText(err, "The simulation could not be completed."));
    } finally {
      setRunning(false);
    }
  }

  return (
    <Shell>
      <div className="grid gap-8 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
        <div className="space-y-7">
          <div>
            <Label>MARKET</Label>
            <p className="mt-2 text-sm text-foreground">
              {ctx.asset.name} <span className="font-tabular text-muted-foreground">[ {ctx.asset.symbol} ]</span>
            </p>
          </div>

          <div>
            <Label>CONFIGURATION</Label>
            <div className="mt-2 flex flex-wrap gap-2" role="radiogroup" aria-label="Curve configuration">
              {ctx.candidates.map((c) => (
                <Choice key={c.id} checked={c.id === activeConfigId} disabled={running} onClick={() => setConfigId(c.id)}>
                  {c.label}
                  {c.isRecommended && <span className="ml-1.5 text-[10px] uppercase tracking-wide">recommended</span>}
                </Choice>
              ))}
            </div>
          </div>

          <div>
            <Label>SCENARIOS</Label>
            <div className="mt-2 grid gap-2 sm:grid-cols-2" role="radiogroup" aria-label="Scenario">
              {ctx.scenarios.map((s) => (
                <Choice key={s.id} checked={s.id === scenarioId} disabled={running} onClick={() => chooseScenario(s.id)} block>
                  <span className="block text-xs font-medium">{s.label}</span>
                </Choice>
              ))}
            </div>
            <p className="mt-2 text-[11px] leading-relaxed text-muted-foreground">{scenario.description}</p>
          </div>

          <div>
            <div className="flex items-center justify-between">
              <Label>ASSUMPTIONS</Label>
              {customised && (
                <button
                  type="button"
                  className="text-[11px] text-accent-strong hover:underline"
                  onClick={() => {
                    setProgressOverride(null);
                    setSidesOverride(null);
                  }}
                >
                  Reset to scenario defaults
                </button>
              )}
            </div>

            <div className="mt-3 space-y-4">
              <div>
                <label htmlFor="lab-progress" className="flex items-baseline justify-between text-xs text-foreground">
                  <span>Assumed position on the curve</span>
                  <span className="font-tabular">{+progress.toFixed(1)}%</span>
                </label>
                <input
                  id="lab-progress"
                  type="range"
                  min={0}
                  max={SIMULATION_LAB_MAX_PROGRESS_PCT}
                  step={1}
                  value={progress}
                  disabled={running}
                  onChange={(e) => setProgressOverride(Number(e.target.value))}
                  className="mt-1.5 w-full accent-[var(--warning)]"
                />
                <p className="text-[11px] text-muted-foreground">ELF&rsquo;s positioning heuristic (linear in sqrt-price space) — a starting point for the quotes, not a forecast.</p>
              </div>

              <fieldset>
                <legend className="text-xs text-foreground">Side of each standard trade</legend>
                <div className="mt-1.5 grid grid-cols-4 gap-2">
                  {TRADE_SIZES_USD.map((size, i) => (
                    <button
                      key={size}
                      type="button"
                      disabled={running}
                      aria-label={`${formatUsd(size, { compact: true })} trade: ${sides[i]}. Toggle side.`}
                      onClick={() => setSidesOverride(sides.map((s, j) => (j === i ? (s === "buy" ? "sell" : "buy") : s)) as Side[])}
                      className="border border-border-strong px-2 py-1.5 text-center text-[11px] transition-colors hover:bg-surface-hover disabled:opacity-50"
                    >
                      <span className="block font-tabular text-muted-foreground">{formatUsd(size, { compact: true })}</span>
                      <span className={cn("block font-medium uppercase", sides[i] === "buy" ? "text-positive" : "text-negative")}>{sides[i]}</span>
                    </button>
                  ))}
                </div>
              </fieldset>
            </div>

            <ul className="mt-4 list-disc space-y-1 pl-4">
              {ctx.assumptions.map((a) => (
                <li key={a} className="text-[11px] leading-relaxed text-muted-foreground">
                  {a}
                </li>
              ))}
            </ul>
            <details className="mt-3">
              <summary className="cursor-pointer text-[11px] uppercase tracking-wide text-muted-foreground/80 hover:text-muted-foreground">Not modelled by the engine</summary>
              <ul className="mt-2 list-disc space-y-1 pl-4">
                {ctx.notModelled.map((n) => (
                  <li key={n} className="text-[11px] leading-relaxed text-muted-foreground">
                    {n}
                  </li>
                ))}
              </ul>
            </details>
          </div>

          <div className="space-y-2 border-t border-border pt-5">
            <Button variant="gold" onClick={runSimulation} disabled={running} aria-busy={running} className="w-full">
              {running ? "Running simulation…" : "[ RUN SIMULATION ]"}
            </Button>
            <p className="text-center text-[11px] text-muted-foreground">
              {activeConfig?.label ?? "Configuration"} · {LAB_SCENARIO_LABELS[scenarioId]}
              {customised ? " · custom parameters" : ""} · off-chain. Simulation — no blockchain transaction is executed.
            </p>
            {runError && (
              <p className="text-xs text-negative" role="alert">
                {runError}
              </p>
            )}
          </div>
        </div>

        <div className="space-y-8">
          {running && !activeRun && (
            <p className="text-sm text-muted-foreground" role="status">
              Running the scenario against the curve…
            </p>
          )}
          {!activeRun && !running && (
            <div className="border border-dashed border-border-strong p-8 text-center">
              <p className="text-sm text-muted-foreground">No simulation yet. Choose a scenario and run it — results appear here, always labelled SIMULATION — OFF-CHAIN.</p>
            </div>
          )}
          {activeRun && <LabResultView run={activeRun} />}

          {runs.length > 0 && (
            <div className="border-t border-border pt-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <Label>SESSION_RUNS</Label>
                <p className="text-[11px] text-muted-foreground">Kept in this tab only — never sent to a server.</p>
              </div>
              <ul className="mt-3 space-y-1.5">
                {runs.map((r) => (
                  <li key={r.runId} className="flex items-center gap-3 text-xs">
                    <input
                      type="checkbox"
                      aria-label={`Include ${LAB_SCENARIO_LABELS[r.scenario]} (${r.curveLabel}) in comparison`}
                      checked={compareIds.includes(r.runId)}
                      onChange={() => setCompareIds(toggleId(compareIds, r.runId))}
                      className="h-3.5 w-3.5 accent-[var(--warning)]"
                    />
                    <button type="button" onClick={() => setActiveRunId(r.runId)} className={cn("min-w-0 flex-1 truncate text-left hover:text-foreground", r.runId === activeRun?.runId ? "text-foreground" : "text-muted-foreground")}>
                      {LAB_SCENARIO_LABELS[r.scenario]} · {r.curveLabel}
                      {r.parameters.customised ? " · custom" : ""} · <time dateTime={r.createdAt}>{new Date(r.createdAt).toLocaleTimeString("en-US", { hour12: false })}</time>
                    </button>
                    <Badge variant="warning">SIMULATED</Badge>
                    <button
                      type="button"
                      aria-label="Remove this run"
                      onClick={() => {
                        saveSessionRuns(removeRun(runs, r.runId));
                        setCompareIds(compareIds.filter((id) => id !== r.runId));
                      }}
                      className="text-muted-foreground hover:text-negative"
                    >
                      ✕
                    </button>
                  </li>
                ))}
              </ul>
              <div className="mt-4">
                <Button variant="secondary" size="sm" onClick={() => setShowCompare((v) => !v)} aria-pressed={showCompare}>
                  [ COMPARE SCENARIOS ]
                </Button>
                {comparison && (
                  <div className="mt-4">
                    <Label>SCENARIO_COMPARISON</Label>
                    <div className="mt-3">
                      <LabComparisonTable comparison={comparison} />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
      <header className="mb-10">
        <Label>ELF_SIMULATION_LAB</Label>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <h1 className="font-display text-3xl text-foreground">Simulation Lab</h1>
          <Badge variant="warning">SIMULATION — OFF-CHAIN</Badge>
          <Badge variant="neutral">Deterministic · no AI</Badge>
        </div>
        <p className="mt-3 max-w-3xl text-sm leading-relaxed text-muted-foreground">
          Before committing liquidity on-chain, see how a configuration behaves under the scenarios ELF&rsquo;s simulation engine can represent. Every number is Meteora&rsquo;s curve math evaluated at an
          assumed position — a simulation, not a prediction and not the state of any live pool. Simulation — no blockchain transaction is executed.
        </p>
      </header>
      {children}
    </div>
  );
}

function Choice({ checked, disabled, onClick, children, block = false }: { checked: boolean; disabled?: boolean; onClick: () => void; children: React.ReactNode; block?: boolean }) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={checked}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "border px-3 py-2 text-left text-xs transition-colors disabled:opacity-50",
        block && "w-full",
        checked ? "border-warning/60 bg-warning-muted text-foreground" : "border-border-strong text-muted-foreground hover:text-foreground",
      )}
    >
      {children}
    </button>
  );
}
