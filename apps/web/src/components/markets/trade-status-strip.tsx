import { cn } from "@/lib/utils";
import { TRADE_STEPS, type TradeStatusView } from "@/components/markets/trade-state";

/**
 * Visual QUOTE → SIGN → SUBMITTED → CONFIRMED progress. State is conveyed by
 * text and shape, never colour alone; the live region announces changes to
 * assistive tech. A failed trade marks the step it failed at.
 */
export function TradeStatusStrip({ view }: { view: TradeStatusView }) {
  return (
    <div>
      <ol className="flex items-center gap-1.5" aria-label="Trade progress">
        {TRADE_STEPS.map((step, i) => {
          const done = view.tone === "success" ? i <= view.activeStep : i < view.activeStep;
          const current = i === view.activeStep && view.tone !== "success";
          const failedHere = view.tone === "danger" && current;
          return (
            <li key={step} className="flex flex-1 flex-col gap-1" aria-current={current ? "step" : undefined}>
              <span
                className={cn(
                  "h-1 rounded-full transition-colors duration-[var(--duration-base)]",
                  done ? "bg-positive" : failedHere ? "bg-negative" : current ? "bg-accent animate-pulse" : "bg-border-strong",
                )}
              />
              <span className={cn("text-[10px] uppercase tracking-wide", current || done ? "text-foreground" : "text-muted-foreground/60")}>
                {failedHere ? `${step} — failed` : step}
              </span>
            </li>
          );
        })}
      </ol>
      <p
        className={cn(
          "mt-2 text-xs font-medium",
          view.tone === "success" ? "text-positive" : view.tone === "danger" ? "text-negative" : view.tone === "progress" ? "text-accent-strong" : "text-muted-foreground",
        )}
        role="status"
        aria-live="polite"
      >
        {view.label}
      </p>
      {view.detail && <p className="mt-0.5 text-[11px] leading-relaxed text-muted-foreground">{view.detail}</p>}
    </div>
  );
}
