"use client";

import Link from "next/link";
import { useReducer, useRef, useState } from "react";
import { evaluateApprovalGate } from "@elf/market-engine";
import type { LaunchPlan } from "@elf/shared";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AssetStep } from "@/components/design/asset-step";
import { ProfileStep } from "@/components/design/profile-step";
import { ReviewStep } from "@/components/design/review-step";
import { LaunchPlanView } from "@/components/design/launch-plan-view";
import { LaunchReadinessPanel } from "@/components/design/launch-readiness-panel";
import { copilotReducer, initialCopilotState, type CopilotPhase } from "@/components/design/launch-copilot-state";
import { apiFetch, ApiError } from "@/lib/api-client";
import type { AssetDto, CurveConfigDto, SimulationRunDto } from "@/lib/api-types";
import { cn } from "@/lib/utils";

const STEPS = ["Asset", "Profile", "Launch plan", "Approval", "Deploy"];
const STEP_OF_PHASE: Record<CopilotPhase, number> = { asset: 0, parameters: 1, plan: 2, approval: 3, review: 4 };

const errorMessage = (err: unknown, fallback: string) => (err instanceof ApiError ? err.message : fallback);

/**
 * Market Launch Copilot — a guided front door to ELF's existing issuer
 * workflow. It composes the existing Asset, Profile and Review/Deploy steps
 * unchanged and adds one thing between them: a transparent launch PLAN built
 * by the deterministic engines, a simulation you run yourself, validation
 * checks, and an explicit approval.
 *
 * It never deploys. The only route from a plan to the wallet-approval step is
 * the reducer's APPROVE event (explicit acknowledgement + an open,
 * engine-evaluated gate); that step then still requires the user's own wallet
 * to sign every transaction. Nothing here calls a deployment endpoint.
 */
export function LaunchCopilot() {
  const [flow, dispatch] = useReducer(copilotReducer, initialCopilotState);
  const [asset, setAsset] = useState<AssetDto | null>(null);
  const [curveConfigs, setCurveConfigs] = useState<CurveConfigDto[] | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [plan, setPlan] = useState<LaunchPlan | null>(null);
  const [planLoading, setPlanLoading] = useState(false);
  const [planError, setPlanError] = useState<string | null>(null);
  const [simRunning, setSimRunning] = useState(false);
  const [simError, setSimError] = useState<string | null>(null);
  const requestSeq = useRef(0);

  async function loadPlan(curveCandidateId: string, simulationRunId: string | null) {
    const seq = ++requestSeq.current;
    setPlanLoading(true);
    setPlanError(null);
    try {
      const res = await apiFetch<{ plan: LaunchPlan }>("/api/markets/launch-plan", {
        method: "POST",
        body: JSON.stringify({ curveCandidateId, ...(simulationRunId ? { simulationRunId } : {}) }),
      });
      if (seq === requestSeq.current) setPlan(res.plan);
    } catch (err) {
      if (seq === requestSeq.current) setPlanError(errorMessage(err, "The launch plan could not be assembled."));
    } finally {
      if (seq === requestSeq.current) setPlanLoading(false);
    }
  }

  function chooseCandidate(id: string) {
    if (id === selectedId || simRunning) return;
    setSelectedId(id);
    setPlan(null);
    setSimError(null);
    dispatch({ type: "CANDIDATE_CHANGED" });
    void loadPlan(id, null);
  }

  async function runSimulation() {
    if (!selectedId) return;
    setSimRunning(true);
    setSimError(null);
    try {
      const run = await apiFetch<SimulationRunDto>("/api/markets/simulate", {
        method: "POST",
        body: JSON.stringify({ curveCandidateId: selectedId }),
      });
      dispatch({ type: "SIMULATION_COMPLETED", simulationRunId: run.id });
      await loadPlan(selectedId, run.id);
    } catch (err) {
      setSimError(errorMessage(err, "The simulation could not be completed."));
    } finally {
      setSimRunning(false);
    }
  }

  const selectedCandidate = curveConfigs?.find((c) => c.id === selectedId) ?? null;
  const gate = plan ? evaluateApprovalGate(plan, flow.acknowledged) : null;
  const stepIndex = STEP_OF_PHASE[flow.phase];

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      <header className="mb-8">
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="font-display text-3xl text-foreground">Market Launch Copilot</h1>
          <Badge variant="neutral">Deterministic · no AI</Badge>
        </div>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          A guided path through ELF&rsquo;s existing engines: it compiles a curve, shows you the resulting plan, runs the simulation you ask for, validates the
          configuration against Meteora, and only then — after your explicit approval — hands off to the normal wallet approval. It never deploys on its own.
        </p>
      </header>

      <ol className="mb-10 flex items-center gap-2" aria-label="Progress">
        {STEPS.map((label, i) => (
          <li key={label} className="flex flex-1 items-center gap-2.5" aria-current={i === stepIndex ? "step" : undefined}>
            <div
              className={cn(
                "flex h-7 w-7 shrink-0 items-center justify-center rounded-full font-tabular text-[11px] font-medium",
                i < stepIndex
                  ? "border border-[#ffe2b2]/50 bg-[#ffe2b2]/20 text-gold-light"
                  : i === stepIndex
                    ? "border border-[#ffe2b2]/70 bg-[rgba(255,226,178,0.08)] text-gold-light"
                    : "border border-border-strong bg-surface text-subtle-foreground",
              )}
            >
              {i < stepIndex ? "✓" : i + 1}
            </div>
            <span className={cn("hidden text-xs font-medium sm:inline", i === stepIndex ? "text-white" : i < stepIndex ? "text-gold-light" : "text-subtle-foreground")}>
              {label}
            </span>
            {i < STEPS.length - 1 && <div className="h-px flex-1 bg-white/10" />}
          </li>
        ))}
      </ol>

      {flow.phase === "asset" && (
        <AssetStep
          onComplete={(a) => {
            setAsset(a);
            dispatch({ type: "ASSET_SELECTED" });
          }}
        />
      )}

      {flow.phase === "parameters" && asset && (
        <ProfileStep
          asset={asset}
          onComplete={(_profile, configs) => {
            const recommended = configs.find((c) => c.isRecommended) ?? configs[0];
            if (!recommended) return;
            setCurveConfigs(configs);
            setSelectedId(recommended.id);
            setPlan(null);
            setSimError(null);
            dispatch({ type: "PLAN_GENERATED" });
            void loadPlan(recommended.id, null);
          }}
        />
      )}

      {(flow.phase === "plan" || flow.phase === "approval") && curveConfigs && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Curve configuration</CardTitle>
              <span className="text-[11px] uppercase tracking-wide text-muted-foreground">Compiled by ELF&rsquo;s curve compiler</span>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Curve configuration">
                {curveConfigs.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    role="radio"
                    aria-checked={c.id === selectedId}
                    disabled={simRunning}
                    onClick={() => chooseCandidate(c.id)}
                    className={cn(
                      "rounded-[var(--radius-sm)] border px-3 py-2 text-left text-xs transition-colors disabled:opacity-50",
                      c.id === selectedId ? "border-accent/60 bg-accent-muted text-accent-strong" : "border-border-strong text-muted-foreground hover:text-foreground",
                    )}
                  >
                    <span className="font-medium">{c.label}</span>
                    {c.isRecommended && <span className="ml-1.5 text-[10px] uppercase tracking-wide">recommended</span>}
                  </button>
                ))}
              </div>
              <p className="mt-2 text-[11px] text-muted-foreground">Switching configuration discards any simulation and approval — they apply only to the curve they were made for.</p>
            </CardContent>
          </Card>

          {planLoading && !plan && <p className="text-sm text-muted-foreground" role="status">Assembling launch plan from the engines…</p>}
          {planError && (
            <div className="rounded-[var(--radius-sm)] border border-negative/30 bg-negative-muted p-4 text-sm text-negative" role="alert">
              {planError}
              {selectedId && (
                <Button className="ml-3" size="sm" variant="secondary" onClick={() => void loadPlan(selectedId, flow.simulationRunId)}>
                  Retry
                </Button>
              )}
            </div>
          )}

          {plan && <LaunchPlanView plan={plan} />}
          {plan && <LaunchReadinessPanel plan={plan} />}

          {plan && flow.phase === "plan" && (
            <Card>
              <CardHeader>
                <CardTitle>Next</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {simError && (
                  <p className="text-xs text-negative" role="alert">
                    {simError}
                  </p>
                )}
                <div className="flex flex-wrap gap-3">
                  <Button variant="secondary" onClick={runSimulation} disabled={simRunning || planLoading} aria-busy={simRunning}>
                    {simRunning ? "Running simulation…" : plan.simulation.status === "completed" ? "Re-run simulation" : "Run simulation"}
                  </Button>
                  <Button
                    onClick={() => dispatch({ type: "CONTINUE_TO_APPROVAL", plan })}
                    disabled={plan.simulation.status !== "completed" || simRunning || planLoading}
                  >
                    Continue to approval
                  </Button>
                  <Button variant="ghost" onClick={() => dispatch({ type: "BACK" })} disabled={simRunning}>
                    Change parameters
                  </Button>
                  {selectedId && (
                    <Link href={`/design/lab?curve=${encodeURIComponent(selectedId)}`} className="inline-flex h-10 items-center text-xs text-accent-strong hover:underline">
                      Open in Simulation Lab →
                    </Link>
                  )}
                </div>
                {plan.simulation.status !== "completed" && <p className="text-[11px] text-muted-foreground">Run the simulation and review the checks above to continue.</p>}
              </CardContent>
            </Card>
          )}

          {plan && flow.phase === "approval" && gate && (
            <Card gold>
              <CardHeader>
                <CardTitle>Explicit approval</CardTitle>
                <span className="text-[11px] uppercase tracking-wide text-muted-foreground">Nothing is deployed by this step</span>
              </CardHeader>
              <CardContent className="space-y-4">
                <label className="flex cursor-pointer items-start gap-3 text-xs leading-relaxed text-foreground">
                  <input
                    type="checkbox"
                    className="mt-0.5 h-4 w-4 accent-[var(--accent)]"
                    checked={flow.acknowledged}
                    onChange={(e) => dispatch({ type: "ACKNOWLEDGE", value: e.target.checked })}
                  />
                  <span>
                    I have reviewed this plan, its warnings and its checks. I understand it is a proposal and that continuing only opens ELF&rsquo;s existing wallet
                    approval, where I will separately review and sign each transaction myself.
                  </span>
                </label>

                {gate.blockers.length > 0 && (
                  <ul className="list-disc space-y-1 pl-4">
                    {gate.blockers.map((b) => (
                      <li key={b} className="text-xs text-negative">
                        {b}
                      </li>
                    ))}
                  </ul>
                )}

                <div className="flex flex-wrap gap-3">
                  <Button variant="gold" disabled={!gate.allowed} onClick={() => dispatch({ type: "APPROVE", plan })}>
                    Review configuration
                  </Button>
                  <Button variant="ghost" onClick={() => dispatch({ type: "BACK" })}>
                    Back to plan
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {flow.phase === "review" && asset && selectedCandidate && (
        <div className="space-y-4">
          <Button variant="ghost" size="sm" onClick={() => dispatch({ type: "BACK" })}>
            ← Back to approval
          </Button>
          <ReviewStep asset={asset} candidate={selectedCandidate} />
        </div>
      )}
    </div>
  );
}
