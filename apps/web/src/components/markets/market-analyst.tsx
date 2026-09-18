"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { apiFetch, ApiError } from "@/lib/api-client";
import type { MarketAnalysis } from "@elf/shared";

type State =
  | { phase: "idle" }
  | { phase: "loading" }
  | { phase: "ready"; analysis: MarketAnalysis; generatedAt: string }
  | { phase: "error"; message: string };

/**
 * "Analyze market" (Feature D). Calls POST /api/markets/:id/analyze, which
 * reads the market itself server-side — nothing is sent from here that could
 * influence the numbers. The panel is explicit about what produced the
 * text: the provider label, which data sources were actually available, what
 * could not be measured, and the exact values used.
 */
export function MarketAnalyst({ marketId }: { marketId: string }) {
  const [state, setState] = useState<State>({ phase: "idle" });

  async function analyze() {
    setState({ phase: "loading" });
    try {
      const res = await apiFetch<{ analysis: MarketAnalysis; generatedAt: string }>(`/api/markets/${marketId}/analyze`, { method: "POST" });
      setState({ phase: "ready", analysis: res.analysis, generatedAt: res.generatedAt });
    } catch (err) {
      const message =
        err instanceof ApiError && err.status === 429
          ? "Too many analysis requests — wait a moment and try again."
          : err instanceof ApiError && err.status === 404
            ? "This market has no deployed pool to analyze yet."
            : "The analysis could not be produced right now. Try again shortly.";
      setState({ phase: "error", message });
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Market analyst</CardTitle>
        <Button size="sm" variant="secondary" onClick={analyze} disabled={state.phase === "loading"} aria-busy={state.phase === "loading"}>
          {state.phase === "loading" ? "Analyzing…" : state.phase === "ready" ? "Re-analyze" : "Analyze market"}
        </Button>
      </CardHeader>
      <CardContent className="space-y-5">
        {state.phase === "idle" && (
          <p className="text-xs leading-relaxed text-muted-foreground">
            Generates a plain-language reading of this market&rsquo;s live on-chain, indexed and oracle data. It describes what the data shows — it
            does not give investment advice or predict prices.
          </p>
        )}
        {state.phase === "loading" && <p className="text-xs text-muted-foreground" role="status">Reading live market data…</p>}
        {state.phase === "error" && (
          <p className="text-xs text-negative" role="alert">
            {state.message}
          </p>
        )}
        {state.phase === "ready" && <AnalysisView analysis={state.analysis} generatedAt={state.generatedAt} />}
      </CardContent>
    </Card>
  );
}

function AnalysisView({ analysis, generatedAt }: { analysis: MarketAnalysis; generatedAt: string }) {
  return (
    <>
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="neutral">{analysis.provider.kind === "rule_based" ? "Rule-based · no language model" : "Language model"}</Badge>
        <span className="text-[10px] uppercase tracking-wide text-muted-foreground/70">
          {analysis.provider.id} · {new Date(generatedAt).toLocaleString()}
        </span>
      </div>

      {analysis.sections.map((section) => (
        <section key={section.id}>
          <h3 className="text-[11px] font-semibold uppercase tracking-[0.15em] text-muted-foreground">{section.heading}</h3>
          <ul className="mt-1.5 space-y-1.5">
            {section.lines.map((line) => (
              <li key={line} className="text-xs leading-relaxed text-foreground">
                {line}
              </li>
            ))}
          </ul>
        </section>
      ))}

      <section>
        <h3 className="text-[11px] font-semibold uppercase tracking-[0.15em] text-muted-foreground">Notable observations</h3>
        <ol className="mt-1.5 list-decimal space-y-1.5 pl-4">
          {analysis.observations.map((o) => (
            <li key={o.text} className="text-xs leading-relaxed text-foreground">
              {o.text} <span className="text-[10px] text-muted-foreground/70">[{o.sources.join(", ")}]</span>
            </li>
          ))}
        </ol>
      </section>

      <section>
        <h3 className="text-[11px] font-semibold uppercase tracking-[0.15em] text-muted-foreground">Data sources</h3>
        <ul className="mt-1.5 space-y-1">
          {analysis.dataSources.map((s) => (
            <li key={s.id} className="flex gap-2 text-xs">
              <span aria-hidden className={s.available ? "text-positive" : "text-warning"}>
                {s.available ? "✓" : "✕"}
              </span>
              <span>
                <span className="text-foreground">
                  {s.label}
                  <span className="sr-only"> — {s.available ? "available" : "unavailable"}</span>
                </span>
                <span className="text-muted-foreground"> — {s.detail}</span>
              </span>
            </li>
          ))}
        </ul>
      </section>

      {analysis.unavailableData.length > 0 && (
        <section>
          <h3 className="text-[11px] font-semibold uppercase tracking-[0.15em] text-muted-foreground">Could not be measured</h3>
          <ul className="mt-1.5 list-disc space-y-1 pl-4">
            {analysis.unavailableData.map((u) => (
              <li key={u} className="text-xs text-muted-foreground">
                {u}
              </li>
            ))}
          </ul>
        </section>
      )}

      <details>
        <summary className="cursor-pointer text-[10px] uppercase tracking-wide text-muted-foreground/70 hover:text-muted-foreground">
          Data used (every number above comes from these values)
        </summary>
        <dl className="mt-2 grid gap-x-4 gap-y-1 text-[11px] sm:grid-cols-2">
          {Object.entries(analysis.dataUsed).map(([key, value]) => (
            <div key={key} className="flex justify-between gap-3 border-b border-border/50 py-0.5">
              <dt className="text-muted-foreground">{key}</dt>
              <dd className="font-tabular text-foreground">{value === null ? "unavailable" : String(value)}</dd>
            </div>
          ))}
        </dl>
      </details>

      <p className="border-t border-border pt-3 text-[11px] leading-relaxed text-muted-foreground">{analysis.disclaimer}</p>
    </>
  );
}
