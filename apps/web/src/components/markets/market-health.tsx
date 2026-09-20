import { Badge } from "@/components/ui/badge";
import { formatUsd } from "@/lib/utils";
import type { HealthCheck, HealthEvent, HealthSignalId, HealthUnit, MarketHealth as MarketHealthData, RiskStatus } from "@elf/shared";

const STATUS_VARIANT: Record<RiskStatus, "positive" | "warning" | "neutral"> = { NORMAL: "positive", WATCH: "warning", DATA_UNAVAILABLE: "neutral" };
const STATUS_TEXT: Record<RiskStatus, string> = { NORMAL: "NORMAL", WATCH: "WATCH", DATA_UNAVAILABLE: "DATA UNAVAILABLE" };
const STATUS_TONE: Record<RiskStatus, string> = { NORMAL: "text-positive", WATCH: "text-warning", DATA_UNAVAILABLE: "text-muted-foreground" };
const CHECK_GLYPH: Record<RiskStatus, string> = { NORMAL: "✓", WATCH: "⚠", DATA_UNAVAILABLE: "?" };

const EVENT_TITLE: Record<HealthEvent["type"], string> = {
  LIQUIDITY_DROP: "Liquidity decreased",
  VOLUME_SPIKE: "Volume increased",
  TRADE_FREQUENCY_SPIKE: "Trade frequency increased",
  LARGE_TRADE: "Large trade",
  TRADE_CONCENTRATION: "Volume concentrated in one wallet",
  PRICE_DEVIATION: "Price/reference deviation",
  ORACLE_UNAVAILABLE: "Oracle unavailable",
  ORACLE_RESTRICTED: "Oracle restricted",
  INDEXER_LAG: "Indexer lagging",
  GRADUATION_REACHED: "Graduation condition reached",
};

const SOURCE_TEXT = { ON_CHAIN: "On-chain (DBC)", INDEXED: "Indexed trades", PYTH: "Pyth" } as const;

function formatValue(value: number | null, unit: HealthUnit | null): string {
  if (value === null || unit === null) return "—";
  switch (unit) {
    case "usd":
      return formatUsd(value);
    case "pct":
      return `${+value.toFixed(2)}%`;
    case "multiple":
      return `${+value.toFixed(2)}×`;
    case "seconds":
      return `${value}s`;
    case "count":
      return value.toLocaleString("en-US");
  }
}

const formatTime = (iso: string) =>
  new Date(iso).toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false, timeZoneName: "short" });

/** Bracketed micro-label used across the health panel. */
const Label = ({ children }: { children: React.ReactNode }) => (
  <span className="font-tabular text-[10px] uppercase tracking-[0.18em] text-muted-foreground">[ {children} ]</span>
);

/**
 * Renders the MarketHealth exactly as `evaluateMarketHealth`
 * (packages/market-engine) produced it. It adds no thresholds, scores or
 * judgement of its own, and it never suggests an action.
 */
export function MarketHealth({ health }: { health: MarketHealthData }) {
  const byId = new Map<HealthSignalId, HealthCheck>(health.checks.map((c) => [c.id, c]));
  const summary: [string, HealthSignalId][] = [
    ["Liquidity", "liquidity"],
    ["Oracle", "oracle"],
    ["Indexer", "indexer"],
  ];

  return (
    <section aria-labelledby="market-health-title" className="surface-card overflow-hidden rounded-[var(--radius-sm)]">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-border/70 px-6 py-4">
        <div>
          <Label>MARKET_HEALTH</Label>
          <h2 id="market-health-title" className="mt-1 text-sm font-medium text-foreground">
            Market health
          </h2>
        </div>
        <p className="text-[11px] text-muted-foreground">
          Evaluated <time dateTime={health.evaluatedAt}>{formatTime(health.evaluatedAt)}</time> · deterministic rules · no AI
        </p>
      </header>

      <div className="grid gap-px bg-border/60 sm:grid-cols-2 lg:grid-cols-6">
        <SummaryCell label="Status" className="lg:col-span-2">
          <Badge variant={STATUS_VARIANT[health.status]}>{STATUS_TEXT[health.status]}</Badge>
        </SummaryCell>
        <SummaryCell label="Active events">
          <span className="font-tabular text-lg text-foreground">{health.events.length}</span>
          <span className="ml-1.5 text-[11px] text-muted-foreground">{health.watchEventCount} watch</span>
        </SummaryCell>
        {summary.map(([label, id]) => {
          const c = byId.get(id);
          return (
            <SummaryCell key={id} label={label}>
              {c ? <span className={`text-xs font-medium ${STATUS_TONE[c.status]}`}>{STATUS_TEXT[c.status]}</span> : <span className="text-xs text-muted-foreground">—</span>}
            </SummaryCell>
          );
        })}
      </div>

      <div className="grid gap-8 px-6 py-6 lg:grid-cols-2">
        <div>
          <Label>ACTIVE_EVENTS</Label>
          {health.events.length === 0 ? (
            <p className="mt-3 text-xs leading-relaxed text-muted-foreground">No active events. Nothing measurable is outside its cutoff right now.</p>
          ) : (
            <ul className="mt-3 space-y-2">
              {health.events.map((event) => (
                <EventRow key={event.id} event={event} />
              ))}
            </ul>
          )}
        </div>

        <div>
          <Label>SIGNAL_CHECKS</Label>
          <ul className="mt-3 space-y-2">
            {health.checks.map((c) => (
              <li key={c.id} className="flex gap-3">
                <span aria-hidden className={`mt-px w-4 shrink-0 text-center text-sm ${STATUS_TONE[c.status]}`}>
                  {CHECK_GLYPH[c.status]}
                </span>
                <div className="min-w-0">
                  <p className="text-xs text-foreground">
                    {c.label} <span className={`ml-1 text-[10px] uppercase tracking-wide ${STATUS_TONE[c.status]}`}>{STATUS_TEXT[c.status]}</span>
                  </p>
                  <p className="text-[11px] leading-relaxed text-muted-foreground">{c.detail}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="border-t border-border/70 px-6 py-6">
        <Label>MARKET_EVENT_TIMELINE</Label>
        {health.timeline.length === 0 ? (
          <p className="mt-3 text-xs text-muted-foreground">No timestamped events in the monitored windows. Only observed events appear here — status changes are not inferred.</p>
        ) : (
          <ol className="mt-3 space-y-3 border-l border-border-strong pl-4">
            {health.timeline.map((event) => (
              <li key={event.id} className="relative">
                <span aria-hidden className={`absolute -left-[21px] top-1.5 h-2 w-2 ${event.severity === "WATCH" ? "bg-warning" : "bg-muted-foreground"}`} />
                <time dateTime={event.occurredAt!} className="font-tabular text-[11px] text-muted-foreground">
                  {formatTime(event.occurredAt!)}
                </time>
                <p className="text-xs text-foreground">{EVENT_TITLE[event.type]}</p>
              </li>
            ))}
          </ol>
        )}
      </div>

      <footer className="border-t border-border/70 px-6 py-4">
        <p className="text-[11px] leading-relaxed text-muted-foreground/80">
          {health.disclaimer} Cutoffs: liquidity drop &gt; {health.thresholds.liquidityDropPct}% in {health.thresholds.recentWindowHours}h; volume and trade-frequency &gt;{" "}
          {health.thresholds.volumeSpikeMultiple}× the market&rsquo;s own {health.thresholds.baselineWindowHours}h baseline (min {health.thresholds.minSampleTrades} trades). They are ELF-defined analytical
          parameters, not protocol values.
        </p>
      </footer>
    </section>
  );
}

function SummaryCell({ label, children, className = "" }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-surface px-6 py-3.5 ${className}`}>
      <p className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground">{label}</p>
      <div className="mt-1.5 flex items-baseline">{children}</div>
    </div>
  );
}

function EventRow({ event }: { event: HealthEvent }) {
  const watch = event.severity === "WATCH";
  return (
    <li>
      <details className="group border border-border bg-surface-elevated">
        <summary className="flex cursor-pointer list-none items-start gap-3 px-3.5 py-2.5">
          <span aria-hidden className={`mt-px w-4 shrink-0 text-center text-sm ${watch ? "text-warning" : "text-muted-foreground"}`}>
            {watch ? "⚠" : "ℹ"}
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-xs font-medium text-foreground">{EVENT_TITLE[event.type]}</span>
            <span className="block text-[11px] text-muted-foreground">
              {event.observed !== null ? `${formatValue(event.observed, event.unit)} · ` : ""}
              {event.occurredAt ? formatTime(event.occurredAt) : "current reading"}
            </span>
          </span>
          <span aria-hidden className="text-[10px] text-muted-foreground/70 group-open:rotate-90">
            ▸
          </span>
        </summary>
        <dl className="space-y-1.5 border-t border-border px-3.5 py-3 text-xs">
          <Row label="Event" value={EVENT_TITLE[event.type]} />
          <Row label="Metric" value={event.metric} />
          {event.observed !== null && <Row label="Observed" value={formatValue(event.observed, event.unit)} />}
          {event.reference !== null && <Row label={event.referenceLabel ?? "Reference"} value={formatValue(event.reference, event.referenceUnit)} />}
          {event.threshold !== null && <Row label="Cutoff" value={formatValue(event.threshold, event.unit)} />}
          <Row label="Detected" value={event.occurredAt ? formatTime(event.occurredAt) : "Current reading (no event timestamp)"} />
          <Row label="Data source" value={event.dataSources.map((s) => SOURCE_TEXT[s]).join(" + ")} />
          {event.signature && <Row label="Signature" value={<span className="break-all font-tabular">{event.signature}</span>} />}
          <p className="pt-1.5 text-[11px] leading-relaxed text-muted-foreground">{event.explanation}</p>
        </dl>
      </details>
    </li>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-4">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="text-right font-tabular text-foreground">{value}</dd>
    </div>
  );
}
