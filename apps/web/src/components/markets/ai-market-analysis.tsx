"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { apiFetch, ApiError } from "@/lib/api-client";
import type { AiMarketAnalysis as Analysis, AiMarketAnalysisResponse } from "@elf/shared";

type State = { phase: "idle" } | { phase: "loading" } | { phase: "ready"; response: AiMarketAnalysisResponse } | { phase: "error"; message: string };

const GROUPS: { key: keyof Pick<Analysis, "marketObservations" | "riskObservations" | "liquidityObservations" | "activityObservations" | "graduationObservations">; heading: string }[] = [
  { key: "marketObservations", heading: "Market" },
  { key: "riskObservations", heading: "Risk" },
  { key: "liquidityObservations", heading: "Liquidity" },
  { key: "activityObservations", heading: "Activity" },
  { key: "graduationObservations", heading: "Graduation" },
];

/**
 * AI market analysis. POSTs only the market id to /api/ai/market-analysis: the server builds a snapshot of verified
 * data and asks Groq to explain it, so nothing sent from here can influence a number. The panel says plainly that the
 * text is AI-generated and not a source of truth; the evidence list comes from the server's verified snapshot.
 */
export function AiMarketAnalysis({ marketId }: { marketId: string }) {
  const [state, setState] = useState<State>({ phase: "idle" });

  async function run() {
    setState({ phase: "loading" });
    try {
      const response = await apiFetch<AiMarketAnalysisResponse>("/api/ai/market-analysis", { method: "POST", body: JSON.stringify({ marketId }) });
      setState({ phase: "ready", response });
    } catch (err) {
      const message =
        err instanceof ApiError && err.status === 404
          ? "This market has no deployed pool to analyze yet."
          : err instanceof ApiError
            ? err.message
            : "The AI analysis could not be produced right now. Try again shortly.";
      setState({ phase: "error", message });
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>AI Market Analysis</CardTitle>
        <Button size="sm" variant="secondary" onClick={run} disabled={state.phase === "loading"} aria-busy={state.phase === "loading"}>
          {state.phase === "loading" ? "Analyzing…" : state.phase === "ready" ? "Re-run" : "Explain this market"}
        </Button>
      </CardHeader>
      <CardContent className="space-y-5">
        {state.phase === "idle" && (
          <p className="text-xs leading-relaxed text-muted-foreground">
            An AI model explains ELF&rsquo;s verified on-chain and indexed data for this market in plain language. It only sees a snapshot the server builds; it cannot
            change a number, and it gives no advice or predictions.
          </p>
        )}
        {state.phase === "loading" && (
          <p className="text-xs text-muted-foreground" role="status">
            Building the verified snapshot and asking the model to explain it…
          </p>
        )}
        {state.phase === "error" && (
          <p className="text-xs text-negative" role="alert">
            {state.message}
          </p>
        )}
        {state.phase === "ready" && <AnalysisView response={state.response} />}
      </CardContent>
    </Card>
  );
}

function AnalysisView({ response }: { response: AiMarketAnalysisResponse }) {
  const { analysis, meta } = response;
  return (
    <>
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="warning">AI-generated · not a source of truth</Badge>
        <span className="text-[10px] uppercase tracking-wide text-muted-foreground/70">
          {meta.provider} · {meta.model} · {new Date(meta.generatedAt).toLocaleString()}
          {meta.cached ? " · cached" : ""}
        </span>
      </div>

      <p className="text-sm leading-relaxed text-foreground">{analysis.summary}</p>

      {GROUPS.map(({ key, heading }) =>
        analysis[key].length === 0 ? null : (
          <section key={key}>
            <h3 className="text-[11px] font-semibold uppercase tracking-[0.15em] text-muted-foreground">{heading}</h3>
            <ul className="mt-1.5 list-disc space-y-1.5 pl-4">
              {analysis[key].map((line) => (
                <li key={line} className="text-xs leading-relaxed text-foreground">
                  {line}
                </li>
              ))}
            </ul>
          </section>
        ),
      )}

      <details open className="rounded-[var(--radius-sm)] border border-border p-3">
        <summary className="cursor-pointer text-[11px] font-semibold uppercase tracking-[0.15em] text-muted-foreground">Evidence (verified data the analysis explains)</summary>
        <ul className="mt-2 space-y-1">
          {analysis.evidence.map((line) => (
            <li key={line} className="font-tabular text-xs text-foreground">
              {line}
            </li>
          ))}
        </ul>
      </details>

      <section>
        <h3 className="text-[11px] font-semibold uppercase tracking-[0.15em] text-muted-foreground">Limitations</h3>
        <ul className="mt-1.5 list-disc space-y-1 pl-4">
          {analysis.limitations.map((line) => (
            <li key={line} className="text-xs text-muted-foreground">
              {line}
            </li>
          ))}
        </ul>
      </section>

      <p className="border-t border-border pt-3 text-[11px] leading-relaxed text-muted-foreground">
        Data source: {meta.dataSource}. Snapshot taken {new Date(meta.snapshotAt).toLocaleString()}.
        {meta.droppedUngrounded > 0 && ` ${meta.droppedUngrounded} model statement${meta.droppedUngrounded === 1 ? " was" : "s were"} discarded because ${meta.droppedUngrounded === 1 ? "it" : "they"} did not match the verified data.`}
      </p>
    </>
  );
}
