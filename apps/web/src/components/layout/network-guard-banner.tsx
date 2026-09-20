"use client";

import { useState } from "react";
import { CLUSTER_LABEL, type ElfCluster, type WalletNetworkAssessment } from "@elf/solana";
import { Button } from "@/components/ui/button";

/**
 * Shows whether the connected wallet is on the cluster ELF is configured for.
 * Mismatch blocks signing (the caller disables its sign buttons); when the wallet supports it, an explicit
 * button asks the wallet for a session on the right network (the wallet shows its own approval prompt).
 */
export function NetworkGuardBanner({
  assessment,
  cluster,
  walletName,
  canSwitch = false,
  onSwitch,
}: {
  assessment: WalletNetworkAssessment | null;
  cluster: ElfCluster;
  walletName?: string | null;
  canSwitch?: boolean;
  onSwitch?: () => Promise<void>;
}) {
  const [switching, setSwitching] = useState(false);
  const [switchError, setSwitchError] = useState<string | null>(null);

  if (!assessment) return null;

  if (assessment.status === "mismatch") {
    return (
      <div role="alert" className="space-y-3 rounded-[var(--radius-md)] border border-negative/40 bg-negative-muted p-4 text-xs leading-relaxed text-negative">
        <p className="whitespace-pre-line">{assessment.message}</p>
        <p className="text-negative/80">Signing is disabled until the wallet is on {CLUSTER_LABEL[cluster]}.</p>
        {canSwitch && onSwitch && (
          <div className="space-y-2">
            <Button
              variant="secondary"
              size="sm"
              disabled={switching}
              onClick={async () => {
                setSwitching(true);
                setSwitchError(null);
                try {
                  await onSwitch();
                } catch (err) {
                  setSwitchError(err instanceof Error ? err.message : "The network switch failed.");
                } finally {
                  setSwitching(false);
                }
              }}
            >
              {switching ? `Waiting for ${walletName ?? "the wallet"}…` : `Switch ${walletName ?? "wallet"} to ${CLUSTER_LABEL[cluster]}`}
            </Button>
            <p className="text-[11px] text-negative/80">{walletName ?? "The wallet"} will ask you to approve a connection on {CLUSTER_LABEL[cluster]}. Nothing is signed.</p>
            {switchError && <p className="whitespace-pre-line">{switchError}</p>}
          </div>
        )}
      </div>
    );
  }
  if (assessment.status === "unverifiable") {
    return (
      <p role="status" className="rounded-[var(--radius-sm)] border border-warning/30 bg-warning-muted px-3 py-2 text-[11px] leading-relaxed text-warning">
        {assessment.message}
      </p>
    );
  }
  return (
    <p role="status" className="text-[11px] text-muted-foreground">
      Signing for <span className="text-foreground">{CLUSTER_LABEL[cluster]}</span> — the wallet advertises support for it.
    </p>
  );
}
