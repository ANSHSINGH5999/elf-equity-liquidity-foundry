"use client";

import * as React from "react";
import { BondingCurve3D } from "@/components/motion/bonding-curve-3d";
import { Badge } from "@/components/ui/badge";
import { formatUsd } from "@/lib/utils";

type PresetKey = "conservative" | "balanced" | "growth";

const PRESET_DATA = {
  conservative: {
    title: "Conservative DBC",
    tagline: "High stability, deep initial reserves, low price volatility",
    initialMcapMult: 2.5,
    migrationMcapMult: 12.0,
    dynamicFeeMax: "1.5%",
    curveExponent: "1.4x",
    liquidityEfficiency: 92,
    stressResilience: 96,
  },
  balanced: {
    title: "Balanced DBC",
    tagline: "ELF Recommended: optimal balance of price discovery & depth",
    initialMcapMult: 3.5,
    migrationMcapMult: 18.0,
    dynamicFeeMax: "2.5%",
    curveExponent: "1.9x",
    liquidityEfficiency: 88,
    stressResilience: 89,
  },
  growth: {
    title: "Growth DBC",
    tagline: "Accelerated price discovery with higher early-stage incentives",
    initialMcapMult: 5.0,
    migrationMcapMult: 30.0,
    dynamicFeeMax: "4.0%",
    curveExponent: "2.5x",
    liquidityEfficiency: 81,
    stressResilience: 78,
  },
};

export function InteractiveCurveSimulator() {
  const [preset, setPreset] = React.useState<PresetKey>("balanced");
  const [liquidityUsd, setLiquidityUsd] = React.useState<number>(250000);

  const active = PRESET_DATA[preset];
  const initialMcap = liquidityUsd * active.initialMcapMult;
  const migrationTarget = liquidityUsd * active.migrationMcapMult;

  return (
    <div className="surface-card rounded-2xl border border-white/10 p-6 sm:p-8">
      <div className="flex flex-col justify-between gap-4 border-b border-white/10 pb-6 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2">
            <Badge variant="gold">Meteora DBC Architecture</Badge>
            <Badge variant="neutral">Interactive Compiler Preview</Badge>
          </div>
          <h3 className="font-display mt-2 text-2xl font-medium text-foreground sm:text-3xl">
            {active.title}
          </h3>
          <p className="text-xs text-muted-foreground">{active.tagline}</p>
        </div>

        {/* Preset Selector Tabs */}
        <div className="flex rounded-lg border border-white/10 bg-[#080b12] p-1">
          {(["conservative", "balanced", "growth"] as PresetKey[]).map((key) => (
            <button
              key={key}
              onClick={() => setPreset(key)}
              className={`rounded-md px-3 py-1.5 text-xs font-medium capitalize transition-all ${
                preset === key
                  ? "bg-accent text-accent-foreground shadow"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {key}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6 grid gap-8 lg:grid-cols-12">
        {/* 3D Curve Display */}
        <div className="lg:col-span-7">
          <BondingCurve3D preset={preset} />
        </div>

        {/* Controls & Metrics Telemetry */}
        <div className="flex flex-col justify-between gap-6 lg:col-span-5">
          <div>
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium text-muted-foreground">Declared Initial Liquidity</span>
              <span className="font-mono font-semibold text-gold-light">
                {formatUsd(liquidityUsd)}
              </span>
            </div>
            <input
              type="range"
              min={50000}
              max={1000000}
              step={25000}
              value={liquidityUsd}
              onChange={(e) => setLiquidityUsd(Number(e.target.value))}
              className="mt-2.5 h-1.5 w-full cursor-pointer appearance-none rounded-lg bg-surface-elevated accent-accent"
            />
            <div className="mt-1 flex justify-between font-mono text-[10px] text-subtle-foreground">
              <span>$50,000</span>
              <span>$500,000</span>
              <span>$1,000,000</span>
            </div>
          </div>

          {/* Compiled Telemetry Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-white/5 bg-[#080b12]/80 p-3">
              <div className="text-[10px] font-medium uppercase tracking-wider text-subtle-foreground">
                Initial Market Cap
              </div>
              <div className="mt-1 font-mono text-base font-semibold text-foreground">
                {formatUsd(initialMcap, { compact: true })}
              </div>
              <div className="mt-0.5 text-[10px] text-muted-foreground">
                {active.initialMcapMult}x initial liquidity
              </div>
            </div>

            <div className="rounded-xl border border-white/5 bg-[#080b12]/80 p-3">
              <div className="text-[10px] font-medium uppercase tracking-wider text-subtle-foreground">
                DAMM v2 Target
              </div>
              <div className="mt-1 font-mono text-base font-semibold text-emerald-400">
                {formatUsd(migrationTarget, { compact: true })}
              </div>
              <div className="mt-0.5 text-[10px] text-muted-foreground">
                Graduation threshold
              </div>
            </div>

            <div className="rounded-xl border border-white/5 bg-[#080b12]/80 p-3">
              <div className="text-[10px] font-medium uppercase tracking-wider text-subtle-foreground">
                Max Dynamic Fee
              </div>
              <div className="mt-1 font-mono text-base font-semibold text-indigo-300">
                {active.dynamicFeeMax}
              </div>
              <div className="mt-0.5 text-[10px] text-muted-foreground">
                Volatility dampener
              </div>
            </div>

            <div className="rounded-xl border border-white/5 bg-[#080b12]/80 p-3">
              <div className="text-[10px] font-medium uppercase tracking-wider text-subtle-foreground">
                Resilience Index
              </div>
              <div className="mt-1 font-mono text-base font-semibold text-gold-light">
                {active.stressResilience} / 100
              </div>
              <div className="mt-0.5 text-[10px] text-muted-foreground">
                6-scenario rating
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-white/5 bg-gradient-to-r from-indigo-950/40 to-[#080b12] p-3 text-xs text-muted-foreground">
            <span className="font-semibold text-foreground">Deterministic Execution: </span>
            Compiled with Meteora Dynamic Bonding Curve SDK without custom AMM risks.
          </div>
        </div>
      </div>
    </div>
  );
}
