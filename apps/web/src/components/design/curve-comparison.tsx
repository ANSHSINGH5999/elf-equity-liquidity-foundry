"use client";

import * as React from "react";
import { Badge } from "@/components/ui/badge";

const WIDTH = 640;
const HEIGHT = 280;
const PAD = 28;
const GRAD_T = 0.62; // where the DBC curve reaches its migration threshold

/** Deterministic pseudo-noise — same shape every render, no Math.random(). */
function noise(t: number, seed: number): number {
  return Math.sin(t * 37.1 + seed) * Math.sin(t * 91.7 + seed * 2) * 0.5;
}

function pathFromPoints(points: [number, number][]): string {
  return points.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(2)},${y.toFixed(2)}`).join(" ");
}

/** Naive/unmanaged launch curve: steep instant pump, no fee decay, no defined
 *  graduation — price keeps reflexively swinging on thin, unlocked liquidity. */
function naiveCurvePoints(): [number, number][] {
  const pts: [number, number][] = [];
  const n = 80;
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    let y = 1 - Math.pow(1 - Math.min(t / 0.35, 1), 2.2); // near-instant early pump
    if (t > 0.35) y = 1 + noise(t, 4.1) * 0.55; // unanchored volatility after
    const x = PAD + t * (WIDTH - PAD * 2);
    const yPix = HEIGHT - PAD - Math.max(0.02, Math.min(1.45, y)) * (HEIGHT - PAD * 2) * 0.62;
    pts.push([x, yPix]);
  }
  return pts;
}

/** DBC curve: same exponential price-discovery shape used by the 3D curve
 *  model, decaying fees, smooth ascent to a deterministic migration
 *  threshold, then flat — permanently locked in a DAMM v2 pool. */
function dbcCurvePoints(): [number, number][] {
  const pts: [number, number][] = [];
  const n = 80;
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    const graduated = t >= GRAD_T;
    const tt = Math.min(t, GRAD_T) / GRAD_T;
    const y = graduated ? 1 : Math.pow(tt, 1.9);
    const x = PAD + t * (WIDTH - PAD * 2);
    const yPix = HEIGHT - PAD - y * (HEIGHT - PAD * 2) * 0.62;
    pts.push([x, yPix]);
  }
  return pts;
}

const DIFFERENTIATORS = [
  {
    label: "Decaying fee schedule",
    naive: "Flat or absent fee — no defense against snipe bots at launch.",
    dbc: "Configurable linear/exponential decay across N fee periods, compiled per risk profile.",
  },
  {
    label: "Volatility dampening",
    naive: "No circuit breaker — a single large trade can move price without limit.",
    dbc: "Dynamic fee cap bounds abnormal price swings via `dynamicFeeMaxPriceChangeBps`.",
  },
  {
    label: "Graduation path",
    naive: "No defined migration — liquidity either never consolidates or exits unpredictably.",
    dbc: "Deterministic quote-reserve threshold migrates into a permanent DAMM v2 pool.",
  },
  {
    label: "Curve math",
    naive: "Often hand-rolled per launch — a recurring source of AMM exploits.",
    dbc: "Zero custom AMM math — every config/pool/quote runs through the audited Meteora DBC SDK.",
  },
];

export function CurveComparison() {
  const naive = React.useMemo(() => naiveCurvePoints(), []);
  const dbc = React.useMemo(() => dbcCurvePoints(), []);
  const gradX = PAD + GRAD_T * (WIDTH - PAD * 2);

  return (
    <div className="surface-card rounded-2xl border border-white/10 p-6 sm:p-8">
      <div className="flex flex-wrap items-center gap-2.5">
        <Badge variant="gold" dot>
          Why a compiled DBC, not a naive curve
        </Badge>
      </div>
      <h3 className="font-display mt-3 max-w-2xl text-2xl font-medium text-foreground sm:text-3xl">
        Same price-discovery goal. Structurally different risk.
      </h3>
      <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
        An unmanaged bonding curve prices attention. A compiled Meteora DBC prices a security-adjacent
        asset — deterministically, with fee decay, volatility dampening, and a defined exit into
        permanent liquidity.
      </p>

      <div className="mt-8 grid gap-8 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <svg
            viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
            className="w-full rounded-xl border border-white/5 bg-[#080b12]"
            role="img"
            aria-label="Illustrative comparison of a naive bonding curve versus a compiled Meteora Dynamic Bonding Curve"
          >
            {Array.from({ length: 5 }).map((_, i) => (
              <line
                key={i}
                x1={PAD}
                x2={WIDTH - PAD}
                y1={PAD + (i * (HEIGHT - PAD * 2)) / 4}
                y2={PAD + (i * (HEIGHT - PAD * 2)) / 4}
                stroke="rgba(255,255,255,0.05)"
              />
            ))}

            {/* Graduation threshold marker for the DBC line */}
            <line x1={gradX} x2={gradX} y1={PAD} y2={HEIGHT - PAD} stroke="rgba(34,197,94,0.25)" strokeDasharray="3 4" />
            <text x={gradX + 6} y={PAD + 12} fill="#4ade80" fontSize="9" fontFamily="var(--font-mono)">
              DAMM v2 graduation
            </text>

            <path d={pathFromPoints(naive)} fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" opacity={0.85} />
            <path d={pathFromPoints(dbc)} fill="none" stroke="#c9a227" strokeWidth="2.5" strokeLinecap="round" />

            <text x={PAD} y={HEIGHT - 8} fill="#64748b" fontSize="9" fontFamily="var(--font-mono)">
              Launch
            </text>
            <text x={WIDTH - PAD - 60} y={HEIGHT - 8} fill="#64748b" fontSize="9" fontFamily="var(--font-mono)">
              Time / demand →
            </text>
          </svg>

          <div className="mt-3 flex flex-wrap items-center gap-5 text-[11px]">
            <span className="flex items-center gap-1.5 text-muted-foreground">
              <span className="h-0.5 w-4 rounded-full bg-[#ef4444]" /> Naive / unmanaged curve
            </span>
            <span className="flex items-center gap-1.5 text-muted-foreground">
              <span className="h-0.5 w-4 rounded-full bg-[#c9a227]" /> Compiled Meteora DBC (ELF)
            </span>
          </div>
          <p className="mt-2 text-[11px] leading-relaxed text-subtle-foreground">
            Illustrative price-shape model, not a live quote — real curve parameters are compiled
            deterministically in Step 3 (Curve Compiler) against the installed{" "}
            <code className="font-mono">@meteora-ag/dynamic-bonding-curve-sdk</code>.
          </p>
        </div>

        <div className="flex flex-col gap-4 lg:col-span-5">
          {DIFFERENTIATORS.map((d) => (
            <div key={d.label} className="rounded-xl border border-white/5 bg-[#080b12]/80 p-3.5">
              <div className="text-xs font-semibold text-white">{d.label}</div>
              <div className="mt-1.5 flex gap-2 text-[11px] leading-relaxed text-muted-foreground">
                <span className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-red-500/70" />
                <span>{d.naive}</span>
              </div>
              <div className="mt-1.5 flex gap-2 text-[11px] leading-relaxed text-foreground/90">
                <span className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-400" />
                <span>{d.dbc}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
