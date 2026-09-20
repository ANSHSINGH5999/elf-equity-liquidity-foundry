"use client";

import { useEffect, useMemo, useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { evaluateLaunchReadiness, type ReadinessStatus } from "@elf/market-engine";
import type { LaunchPlan } from "@elf/shared";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LAUNCH_STORAGE_KEY } from "@/components/design/review-step";
import { useWalletBalances } from "@/components/markets/use-wallet-balances";
import { useClusterSigner } from "@/components/providers/use-cluster-signer";
import { apiFetch } from "@/lib/api-client";
import { CLUSTER } from "@/lib/solana-config";
import { cn } from "@/lib/utils";

type ServerNetwork = { cluster: string | null; verified: boolean | null } | null;
type Deployment = { state: "none" | "in_progress" | "deployed" | "unknown"; poolAddress: string | null };

const NO_DEPLOYMENT: Deployment = { state: "none", poolAddress: null };

const MARK: Record<ReadinessStatus, { glyph: string; className: string; label: string }> = {
  pass: { glyph: "✓", className: "text-positive", label: "ready" },
  warn: { glyph: "!", className: "text-warning", label: "warning" },
  fail: { glyph: "✕", className: "text-negative", label: "blocked" },
  unavailable: { glyph: "–", className: "text-muted-foreground", label: "unavailable" },
};

/**
 * Launch readiness for the plan on screen. READ-ONLY: it reads the connected wallet's public state, the SOL balance,
 * the server's reported network and any existing deployment of this configuration, and feeds them to the pure
 * `evaluateLaunchReadiness`. It never asks the wallet to sign, never builds or sends a transaction and calls no
 * deployment endpoint — the flow is still plan -> user review -> wallet approval -> HTTP-polling confirmation.
 */
export function LaunchReadinessPanel({ plan }: { plan: LaunchPlan }) {
  const { publicKey } = useWallet();
  const clusterSigner = useClusterSigner();
  const balances = useWalletBalances(null, null);
  const [server, setServer] = useState<ServerNetwork>(null);
  const [found, setFound] = useState<{ candidateId: string; deployment: Deployment } | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/health", { cache: "no-store" })
      .then((r) => r.json() as Promise<{ cluster?: string; clusterVerified?: boolean | null }>)
      .then((h) => !cancelled && setServer({ cluster: h.cluster ?? null, verified: h.clusterVerified ?? null }))
      .catch(() => !cancelled && setServer({ cluster: null, verified: null }));
    return () => {
      cancelled = true;
    };
  }, []);

  const candidateId = plan.curve.candidateId;
  useEffect(() => {
    let cancelled = false;
    let stored: string | null = null;
    try {
      stored = localStorage.getItem(LAUNCH_STORAGE_KEY(candidateId));
    } catch {
      /* storage unavailable: treated as no recorded deployment */
    }
    if (!stored) return;
    const remember = (deployment: Deployment) => !cancelled && setFound({ candidateId, deployment });
    apiFetch<{ launch: { stage: string; poolAddress: string | null } }>(`/api/launches/${encodeURIComponent(stored)}`)
      .then(({ launch }) => {
        if (["POOL_CREATED", "LIVE", "GRADUATED"].includes(launch.stage)) remember({ state: "deployed", poolAddress: launch.poolAddress });
        else if (["CONFIG_CREATED", "AWAITING_POOL_SIGNATURE"].includes(launch.stage)) remember({ state: "in_progress", poolAddress: null });
        else remember(NO_DEPLOYMENT);
      })
      .catch(() => remember({ state: "unknown", poolAddress: null }));
    return () => {
      cancelled = true;
    };
  }, [candidateId]);
  const deployment = found && found.candidateId === candidateId ? found.deployment : NO_DEPLOYMENT;

  const readiness = useMemo(
    () =>
      evaluateLaunchReadiness({
        network: {
          configuredCluster: CLUSTER,
          serverCluster: server?.cluster ?? null,
          serverClusterVerified: server?.verified ?? null,
          walletAssessment: clusterSigner.assessment?.status ?? null,
          walletMessage: clusterSigner.assessment && clusterSigner.assessment.status !== "compatible" ? clusterSigner.assessment.message : null,
        },
        wallet: { connected: Boolean(publicKey), solBalance: balances.sol, balanceProblem: balances.problem },
        plan,
        deployment,
      }),
    [server, clusterSigner.assessment, publicKey, balances.sol, balances.problem, plan, deployment],
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Launch readiness</CardTitle>
        <Badge variant="neutral">Advisory · nothing is signed or sent</Badge>
      </CardHeader>
      <CardContent className="space-y-3">
        <ul className="space-y-2">
          {readiness.items.map((i) => (
            <li key={i.id} className="flex gap-2 text-xs">
              <span aria-hidden className={cn("w-3 shrink-0 text-center font-semibold", MARK[i.status].className)}>
                {MARK[i.status].glyph}
              </span>
              <span>
                <span className="text-foreground">
                  {i.label}
                  <span className="sr-only"> — {MARK[i.status].label}</span>
                </span>
                {i.basis === "design" && <span className="ml-1.5 text-[10px] uppercase tracking-wide text-muted-foreground/70">by design</span>}
                <span className="text-muted-foreground"> — {i.detail}</span>
              </span>
            </li>
          ))}
        </ul>
        <p className={cn("border-t border-border pt-3 text-xs font-medium", readiness.ready ? "text-positive" : "text-warning")} role="status">
          Action: {readiness.action}
        </p>
        <p className="text-[11px] leading-relaxed text-muted-foreground">
          This report reads live state and is not a guarantee. Wallet approval re-checks the network, shows each transaction&rsquo;s exact fee, and only you can approve it.
        </p>
      </CardContent>
    </Card>
  );
}
