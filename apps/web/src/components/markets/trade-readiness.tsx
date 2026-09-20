"use client";

import { useState } from "react";
import type { WalletNetworkAssessment } from "@elf/solana";
import { Button } from "@/components/ui/button";
import { apiFetch } from "@/lib/api-client";
import { readinessHeadline, readinessReason, readinessVerdict, type ReadinessCheck, type ReadinessStatus, type TradeSide } from "@/lib/readiness";

const MARK: Record<ReadinessStatus, { symbol: string; className: string }> = {
  pass: { symbol: "✓", className: "text-positive" },
  fail: { symbol: "✕", className: "text-negative" },
  warn: { symbol: "!", className: "text-warning" },
  unavailable: { symbol: "?", className: "text-warning" },
  skipped: { symbol: "–", className: "text-muted-foreground" },
};

const VERDICT_CLASS = { ready: "text-positive", not_ready: "text-negative", unverified: "text-warning" } as const;

/** The wallet's own network is only known in the browser; the server cannot see it. */
function metamaskCheck(walletName: string, assessment: WalletNetworkAssessment | null): ReadinessCheck {
  if (!assessment) return { id: "metamask", label: `${walletName} network`, status: "fail", detail: "No wallet connected" };
  if (assessment.status === "compatible") return { id: "metamask", label: `${walletName} network`, status: "pass", detail: "Signing for the configured cluster" };
  if (assessment.status === "mismatch") return { id: "metamask", label: `${walletName} network`, status: "fail", detail: assessment.message.split("\n").filter(Boolean).at(-1) ?? "Wallet is on a different network" };
  return { id: "metamask", label: `${walletName} network`, status: "warn", detail: assessment.message.split("\n").filter(Boolean).at(-1) ?? "Cannot verify the wallet's network" };
}

/**
 * Read-only pre-trade checklist for the side on screen. Sends nothing; the server dry-runs the real swap build +
 * simulation for that side and discards it. `amount` is USD for a BUY and base tokens for a SELL. A result is tied to
 * the side it was run for, so switching tabs never shows a BUY verdict under SELL (or the reverse).
 */
export function TradeReadiness({ poolAddress, wallet, side, amount, walletName, assessment }: { poolAddress: string; wallet: string | null; side: TradeSide; amount: number; walletName: string; assessment: WalletNetworkAssessment | null }) {
  const [state, setState] = useState<{ status: "idle" | "loading" | "error"; checks: ReadinessCheck[] | null; side: TradeSide }>({ status: "idle", checks: null, side });

  async function run() {
    const runSide = side;
    setState((s) => ({ ...s, status: "loading", side: runSide }));
    const params = new URLSearchParams({ side: runSide });
    // With no valid amount typed yet, a BUY is checked at $5 and a SELL at 1 token; the checklist states the amount used.
    if (runSide === "buy") params.set("amountUsd", String(amount > 0 ? amount : 5));
    else params.set("amountTokens", String(amount > 0 ? amount : 1));
    if (wallet) params.set("wallet", wallet);
    try {
      const res = await apiFetch<{ checks: ReadinessCheck[] }>(`/api/dbc/${poolAddress}/readiness?${params}`);
      setState({ status: "idle", checks: res.checks, side: runSide });
    } catch {
      setState({ status: "error", checks: null, side: runSide });
    }
  }

  const current = state.side === side;
  const checks = current && state.checks ? [metamaskCheck(walletName, assessment), ...state.checks] : null;
  const verdictKey = checks ? readinessVerdict(checks) : null;
  const reason = checks && verdictKey !== "ready" ? readinessReason(checks) : null;

  return (
    <div className="rounded-[var(--radius-sm)] border border-border bg-surface-elevated px-3 py-2.5 text-xs">
      <div className="flex items-center justify-between gap-2">
        <span className="font-medium text-muted-foreground">Devnet trade readiness</span>
        <Button type="button" variant="ghost" size="sm" onClick={run} disabled={state.status === "loading" && current}>
          {state.status === "loading" && current ? "Checking…" : checks ? "Re-check" : "Check readiness"}
        </Button>
      </div>
      {state.status === "error" && current && <p className="mt-1.5 text-warning">Could not run the check (RPC temporarily unavailable or rate limited). Nothing was sent.</p>}
      {checks && verdictKey && (
        <>
          <ul className="mt-2 space-y-1">
            {checks.map((c) => (
              <li key={c.id} className="flex gap-2">
                <span className={`w-3 shrink-0 text-center font-medium ${MARK[c.status].className}`} aria-label={c.status}>
                  {MARK[c.status].symbol}
                </span>
                <span>
                  <span className="text-foreground">{c.label}</span> <span className="text-muted-foreground">— {c.detail}</span>
                </span>
              </li>
            ))}
          </ul>
          <p className={`mt-2 font-medium ${VERDICT_CLASS[verdictKey]}`}>{readinessHeadline(verdictKey, side)}</p>
          {reason && <p className="mt-0.5 text-muted-foreground">Reason: {reason}</p>}
          <p className="mt-0.5 text-muted-foreground">Read-only: nothing is signed or sent.</p>
        </>
      )}
    </div>
  );
}
