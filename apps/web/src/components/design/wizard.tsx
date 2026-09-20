"use client";

import { useState } from "react";
import { AssetStep } from "./asset-step";
import { ProfileStep } from "./profile-step";
import { ConfigStep } from "./config-step";
import { SimulateStep } from "./simulate-step";
import { ReviewStep } from "./review-step";
import type { AssetDto, CurveConfigDto } from "@/lib/api-types";
import { cn } from "@/lib/utils";

const STEPS = ["Asset", "Profile", "Configuration", "Simulation", "Deploy"];

export function DesignWizard({ preselectedMint }: { preselectedMint?: string }) {
  const [stepIndex, setStepIndex] = useState(0);
  const [asset, setAsset] = useState<AssetDto | null>(null);
  const [curveConfigs, setCurveConfigs] = useState<CurveConfigDto[] | null>(null);
  const [selectedCandidate, setSelectedCandidate] = useState<CurveConfigDto | null>(null);

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      <div className="mb-10 flex items-center gap-2">
        {STEPS.map((label, i) => (
          <div key={label} className="flex flex-1 items-center gap-2.5">
            <div
              className={cn(
                "flex h-7 w-7 shrink-0 items-center justify-center rounded-full font-tabular text-[11px] font-medium transition-all duration-[var(--duration-base)] ease-[var(--ease-premium)]",
                i < stepIndex
                  ? "bg-[#ffe2b2]/20 border border-[#ffe2b2]/50 text-gold-light"
                  : i === stepIndex
                    ? "border border-[#ffe2b2]/70 bg-[rgba(255,226,178,0.08)] text-gold-light shadow-[0_0_12px_rgba(255,226,178,0.3)]"
                    : "border border-border-strong text-subtle-foreground bg-surface",
              )}
            >
              {i < stepIndex ? "✓" : i + 1}
            </div>
            <span
              className={cn(
                "hidden text-xs transition-colors duration-[var(--duration-base)] sm:inline font-medium",
                i === stepIndex ? "text-white" : i < stepIndex ? "text-gold-light" : "text-subtle-foreground",
              )}
            >
              {label}
            </span>
            {i < STEPS.length - 1 && (
              <div className="h-px flex-1 bg-white/10">
                <div
                  className="h-px bg-gradient-to-r from-[#ffe2b2] to-[#9fe0ff] transition-all duration-500 ease-[var(--ease-premium)]"
                  style={{ width: i < stepIndex ? "100%" : "0%" }}
                />
              </div>
            )}
          </div>
        ))}
      </div>

      {stepIndex === 0 && (
        <AssetStep
          preselectedMint={preselectedMint}
          onComplete={(a) => {
            setAsset(a);
            setStepIndex(1);
          }}
        />
      )}

      {stepIndex === 1 && asset && (
        <ProfileStep
          asset={asset}
          onComplete={(_profile, configs) => {
            setCurveConfigs(configs);
            setStepIndex(2);
          }}
        />
      )}

      {stepIndex === 2 && curveConfigs && (
        <ConfigStep
          curveConfigs={curveConfigs}
          onComplete={(candidate) => {
            setSelectedCandidate(candidate);
            setStepIndex(3);
          }}
        />
      )}

      {stepIndex === 3 && selectedCandidate && (
        <SimulateStep candidate={selectedCandidate} onComplete={() => setStepIndex(4)} />
      )}

      {stepIndex === 4 && asset && selectedCandidate && <ReviewStep asset={asset} candidate={selectedCandidate} />}
    </div>
  );
}
