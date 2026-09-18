"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { Transaction } from "@solana/web3.js";
import bs58 from "bs58";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input, Label } from "@/components/ui/input";
import { apiFetch, ApiError } from "@/lib/api-client";
import type { AssetDto, CurveConfigDto } from "@/lib/api-types";
import { explorerAddressUrl, explorerTxUrl, buildOwnershipMessage } from "@elf/solana";
import { CLUSTER } from "@/lib/solana-config";
import { cn, formatUsd, truncateAddress } from "@/lib/utils";

type StepStatus =
  | "idle"
  | "preparing"
  | "awaiting_wallet"
  | "submitted"
  | "confirming"
  | "confirmed"
  | "error";

const STATUS_LABEL: Record<StepStatus, string> = {
  idle: "Not started",
  preparing: "Preparing transaction…",
  awaiting_wallet: "Waiting for wallet…",
  submitted: "Transaction submitted…",
  confirming: "Confirming…",
  confirmed: "Confirmed",
  error: "Failed",
};

// Presentation only — does not affect step logic or transitions.
const STATUS_DOT_CLASS: Record<StepStatus, string> = {
  idle: "bg-border-strong",
  preparing: "bg-accent animate-pulse",
  awaiting_wallet: "bg-accent animate-pulse",
  submitted: "bg-accent animate-pulse",
  confirming: "bg-accent animate-pulse",
  confirmed: "bg-positive",
  error: "bg-negative",
};

interface ConfigResponse {
  launchId: string;
  configAddress: string;
  quoteMint: string;
  transactionBase64: string | null;
  alreadyConfirmed: boolean;
}

interface PoolResponse {
  poolAddress: string;
  baseMint: string;
  transactionBase64: string | null;
  alreadyConfirmed: boolean;
}

interface LaunchDto {
  id: string;
  stage: string;
  configAddress: string | null;
  poolAddress: string | null;
  baseMint: string | null;
}

const LAUNCH_STORAGE_KEY = (candidateId: string) => `elf.launchId.${candidateId}`;

function friendlyTxError(error: unknown): string {
  const message = error instanceof Error ? error.message : String(error);
  if (message.includes("User rejected") || message.includes("rejected")) {
    return "Transaction was rejected in your wallet.";
  }
  if (message.includes("insufficient") || message.includes("Insufficient")) {
    return "Insufficient funds to cover this transaction.";
  }
  if (message.includes("block height exceeded") || message.includes("expired")) {
    return "This transaction's blockhash expired before it could be sent. Please try again.";
  }
  if (message.includes("Failed to fetch") || message.includes("network")) {
    return "The Solana RPC endpoint is temporarily unreachable. Please try again.";
  }
  return message;
}

function apiErrorMessage(err: unknown): string {
  if (err instanceof ApiError) {
    switch (err.code) {
      case "network_mismatch":
        return "ELF's RPC endpoint does not match the expected network. Deployment blocked for safety — this is a server configuration issue, not something you can fix by retrying.";
      case "invalid_account":
        return "One of the accounts this transaction targets doesn't look like a real Meteora DBC account. Deployment blocked for safety.";
      case "simulation_failed":
        return "This transaction would fail on-chain, so ELF didn't send it to your wallet. " + err.message;
      case "duplicate_deployment":
        return "This configuration has already been deployed.";
      case "forbidden":
        return "This deployment belongs to a different wallet. Connect the wallet that originally started it.";
      case "unauthorized":
        return err.message;
      default:
        return err.message;
    }
  }
  return friendlyTxError(err);
}

export function ReviewStep({ asset, candidate }: { asset: AssetDto; candidate: CurveConfigDto }) {
  const { publicKey, signTransaction, signMessage, connected } = useWallet();
  const { connection } = useConnection();
  const router = useRouter();

  /**
   * Signs the deployment-ownership proof the server requires on every
   * mutating call (HIGH-1 security remediation) — see
   * @elf/solana#buildOwnershipMessage / docs/security-remediation.md.
   * Must produce byte-identical message text to the server's own
   * `buildOwnershipMessage`, field order included.
   */
  async function signOwnership(route: string, resourceId: string): Promise<{ signature: string; authTimestamp: number }> {
    if (!publicKey) throw new Error("Connect a wallet first.");
    if (!signMessage) {
      throw new Error(
        "This wallet does not support message signing, which ELF requires to verify you control this deployment. Please use a different wallet.",
      );
    }
    const authTimestamp = Date.now();
    const message = buildOwnershipMessage({
      route,
      resourceId,
      payerPublicKey: publicKey.toBase58(),
      timestamp: authTimestamp,
    });
    const signatureBytes = await signMessage(new TextEncoder().encode(message));
    return { signature: bs58.encode(signatureBytes), authTimestamp };
  }

  const [launchId, setLaunchId] = useState<string | null>(null);
  const [configStatus, setConfigStatus] = useState<StepStatus>("idle");
  const [poolStatus, setPoolStatus] = useState<StepStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const [configSig, setConfigSig] = useState<string | null>(null);
  const [poolSig, setPoolSig] = useState<string | null>(null);
  const [configAddress, setConfigAddress] = useState<string | null>(null);
  const [poolAddress, setPoolAddress] = useState<string | null>(null);
  const [firstBuyUsd, setFirstBuyUsd] = useState("0");
  const [estimatedFeeSol, setEstimatedFeeSol] = useState<number | null>(null);

  // Resume an interrupted deployment after a refresh (ELF V1 Phase 3).
  useEffect(() => {
    const stored = typeof window !== "undefined" ? localStorage.getItem(LAUNCH_STORAGE_KEY(candidate.id)) : null;
    if (!stored) return;
    let cancelled = false;
    apiFetch<{ launch: LaunchDto }>(`/api/launches/${stored}`)
      .then(({ launch }) => {
        if (cancelled) return;
        setLaunchId(launch.id);
        if (launch.configAddress) setConfigAddress(launch.configAddress);
        if (launch.poolAddress) setPoolAddress(launch.poolAddress);
        if (
          ["CONFIG_CREATED", "AWAITING_POOL_SIGNATURE", "POOL_CREATED", "LIVE", "GRADUATED"].includes(launch.stage)
        ) {
          setConfigStatus("confirmed");
        }
        if (["POOL_CREATED", "LIVE", "GRADUATED"].includes(launch.stage)) {
          setPoolStatus("confirmed");
        }
      })
      .catch(() => {
        // Stale/invalid stored id — clear it so a fresh deployment isn't blocked by it.
        localStorage.removeItem(LAUNCH_STORAGE_KEY(candidate.id));
      });
    return () => {
      cancelled = true;
    };
  }, [candidate.id]);

  async function estimateFee(transactionBase64: string) {
    try {
      const transaction = Transaction.from(Buffer.from(transactionBase64, "base64"));
      const message = transaction.compileMessage();
      const fee = await connection.getFeeForMessage(message, "confirmed");
      if (fee.value !== null) setEstimatedFeeSol(fee.value / 1_000_000_000);
    } catch {
      // Fee estimation is a nicety, not a correctness requirement — never block the flow on it.
    }
  }

  async function signAndSend(transactionBase64: string, onStatus: (s: StepStatus) => void): Promise<string> {
    if (!publicKey || !signTransaction) throw new Error("Connect a wallet first.");
    const transaction = Transaction.from(Buffer.from(transactionBase64, "base64"));
    onStatus("awaiting_wallet");
    const signed = await signTransaction(transaction);
    onStatus("submitted");
    const signature = await connection.sendRawTransaction(signed.serialize(), { skipPreflight: false });
    onStatus("confirming");
    await connection.confirmTransaction(signature, "confirmed");
    return signature;
  }

  async function deployConfig() {
    if (!publicKey) return;
    setError(null);
    setConfigStatus("preparing");
    try {
      const { signature: ownershipSignature, authTimestamp } = await signOwnership("dbc/config", candidate.id);
      const result = await apiFetch<ConfigResponse>("/api/dbc/config", {
        method: "POST",
        body: JSON.stringify({
          assetId: asset.id,
          curveCandidateId: candidate.id,
          payerPublicKey: publicKey.toBase58(),
          feeClaimerPublicKey: publicKey.toBase58(),
          signature: ownershipSignature,
          authTimestamp,
        }),
      });
      setLaunchId(result.launchId);
      setConfigAddress(result.configAddress);
      localStorage.setItem(LAUNCH_STORAGE_KEY(candidate.id), result.launchId);

      if (result.alreadyConfirmed || !result.transactionBase64) {
        setConfigStatus("confirmed");
        return;
      }

      estimateFee(result.transactionBase64);
      const signature = await signAndSend(result.transactionBase64, setConfigStatus);
      setConfigSig(signature);
      setConfigStatus("confirmed");
    } catch (err) {
      setError(apiErrorMessage(err));
      setConfigStatus("error");
    }
  }

  async function deployPool() {
    if (!publicKey || !launchId) return;
    setError(null);
    setPoolStatus("preparing");
    try {
      const { signature: ownershipSignature, authTimestamp } = await signOwnership("dbc/pool", launchId);
      const result = await apiFetch<PoolResponse>("/api/dbc/pool", {
        method: "POST",
        body: JSON.stringify({
          launchId,
          payerPublicKey: publicKey.toBase58(),
          poolCreatorPublicKey: publicKey.toBase58(),
          firstBuyUsd: Number(firstBuyUsd) || 0,
          signature: ownershipSignature,
          authTimestamp,
        }),
      });
      setPoolAddress(result.poolAddress);

      if (result.alreadyConfirmed || !result.transactionBase64) {
        setPoolStatus("confirmed");
        return;
      }

      estimateFee(result.transactionBase64);
      const signature = await signAndSend(result.transactionBase64, setPoolStatus);
      setPoolSig(signature);
      setPoolStatus("confirmed");
    } catch (err) {
      setError(apiErrorMessage(err));
      setPoolStatus("error");
    }
  }

  const configBusy = configStatus !== "idle" && configStatus !== "confirmed" && configStatus !== "error";
  const poolBusy = poolStatus !== "idle" && poolStatus !== "confirmed" && poolStatus !== "error";

  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle className="font-display text-xl font-normal">Step 5 — Wallet approval &amp; deployment</CardTitle>
          <CardDescription>
            Two real Solana transactions, built with the official Meteora DBC SDK, simulated before you ever see a
            signature prompt. Review each before signing — ELF never touches your private key.
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="surface-glass rounded-[var(--radius-md)] p-6 text-sm">
          <dl className="grid gap-4 sm:grid-cols-2">
            <div>
              <dt className="text-xs tracking-[0.02em] text-subtle-foreground">Asset</dt>
              <dd className="font-tabular mt-1 text-foreground">
                {asset.name} ({asset.symbol})
              </dd>
            </div>
            <div>
              <dt className="text-xs tracking-[0.02em] text-subtle-foreground">Reference mint</dt>
              <dd className="font-tabular mt-1 text-foreground">{truncateAddress(asset.mintAddress)}</dd>
            </div>
            <div>
              <dt className="text-xs tracking-[0.02em] text-subtle-foreground">Configuration</dt>
              <dd className="font-tabular mt-1 text-foreground">{candidate.label}</dd>
            </div>
            <div>
              <dt className="text-xs tracking-[0.02em] text-subtle-foreground">Network</dt>
              <dd className="font-tabular mt-1 capitalize text-foreground">{CLUSTER}</dd>
            </div>
            <div>
              <dt className="text-xs tracking-[0.02em] text-subtle-foreground">Migration threshold</dt>
              <dd className="font-tabular mt-1 text-foreground">{formatUsd(candidate.migrationMarketCapUsd, { compact: true })}</dd>
            </div>
            <div>
              <dt className="text-xs tracking-[0.02em] text-subtle-foreground">Estimated network fee</dt>
              <dd className="font-tabular mt-1 text-foreground">
                {estimatedFeeSol !== null ? `${estimatedFeeSol.toFixed(6)} SOL` : "Shown once a transaction is prepared"}
              </dd>
            </div>
            {configAddress && (
              <div>
                <dt className="text-xs tracking-[0.02em] text-subtle-foreground">Config address</dt>
                <dd className="font-tabular mt-1 text-foreground">{truncateAddress(configAddress)}</dd>
              </div>
            )}
            {poolAddress && (
              <div>
                <dt className="text-xs tracking-[0.02em] text-subtle-foreground">Pool address</dt>
                <dd className="font-tabular mt-1 text-foreground">{truncateAddress(poolAddress)}</dd>
              </div>
            )}
          </dl>
        </div>

        {!connected && (
          <div className="flex flex-col items-center justify-between gap-4 rounded-xl border border-purple-500/30 bg-gradient-to-r from-[#141029] to-[#0c101a] p-5 sm:flex-row">
            <div className="flex items-center gap-3.5">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#282147] shadow-[0_0_15px_rgba(171,159,242,0.3)]">
                <svg viewBox="0 0 128 128" fill="none" className="h-6 w-6">
                  <rect width="128" height="128" rx="28" fill="#AB9FF2" />
                  <path
                    d="M110.6 66.8C108.6 44.5 89.8 28 66.9 28C41.7 28 21.2 48.5 21.2 73.7C21.2 87.2 27.2 99.3 36.7 107.5C39.4 109.8 43.4 108.2 43.8 104.7L44.8 96.6C45.1 94.1 46.8 92 49.2 91.4C55.3 89.8 61.7 88.9 68.3 88.9C89.4 88.9 107.4 75.3 110.6 66.8Z"
                    fill="white"
                  />
                  <circle cx="51.5" cy="58.5" r="6.5" fill="#2C233D" />
                  <circle cx="79.5" cy="58.5" r="6.5" fill="#2C233D" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-semibold text-white">Connect Phantom Wallet to Deploy</p>
                <p className="text-xs text-muted-foreground">
                  Sign real Meteora DBC config &amp; pool transactions on Solana {CLUSTER}. Non-custodial.
                </p>
              </div>
            </div>
            <div className="shrink-0">
              <Button
                variant="gold"
                onClick={() => {
                  const el = document.querySelector(".wallet-adapter-button") as HTMLElement;
                  if (el) el.click();
                }}
              >
                Connect Phantom
              </Button>
            </div>
          </div>
        )}
        {connected && !publicKey && (
          <p className="text-sm text-negative">Wallet disconnected mid-flow — reconnect to continue.</p>
        )}

        {error && (
          <div className="rounded-[var(--radius-sm)] border border-negative/30 bg-negative-muted p-4 text-sm text-negative">
            {error}
          </div>
        )}

        <div className="space-y-3">
          <div className="flex items-center justify-between gap-4 rounded-[var(--radius-md)] border border-border-strong bg-surface-elevated/40 p-5 transition-colors duration-[var(--duration-base)] hover:bg-surface-elevated/70">
            <div>
              <p className="text-sm font-medium text-foreground">1. Create pool configuration</p>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                Transaction purpose: creates the on-chain Meteora DBC config account. Expected result: a new config address
                owned by your wallet.
              </p>
              <p className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
                <span className={cn("h-1.5 w-1.5 rounded-full", STATUS_DOT_CLASS[configStatus])} />
                {STATUS_LABEL[configStatus]}
              </p>
              {configSig && (
                <a
                  href={explorerTxUrl(configSig, CLUSTER)}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-1 inline-block text-xs text-accent underline decoration-accent/40 underline-offset-2 hover:decoration-accent"
                >
                  View transaction on Solana Explorer
                </a>
              )}
            </div>
            <Button
              disabled={!publicKey || configBusy || configStatus === "confirmed" || poolBusy}
              onClick={deployConfig}
            >
              {configBusy ? STATUS_LABEL[configStatus] : configStatus === "confirmed" ? "Done" : "Open in wallet"}
            </Button>
          </div>

          <div className="flex items-center justify-between gap-4 rounded-[var(--radius-md)] border border-border-strong bg-surface-elevated/40 p-5 transition-colors duration-[var(--duration-base)] hover:bg-surface-elevated/70">
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">2. Create pool &amp; optional first buy</p>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                Transaction purpose: initializes the live Meteora DBC pool and mints its base token. Optionally include an
                initial buy.
              </p>
              <div className="mt-3 flex items-center gap-2">
                <Label className="mb-0">First buy (USD, optional)</Label>
                <Input
                  type="number"
                  min={0}
                  className="w-28"
                  value={firstBuyUsd}
                  onChange={(e) => setFirstBuyUsd(e.target.value)}
                  disabled={poolStatus === "confirmed"}
                />
              </div>
              <p className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
                <span className={cn("h-1.5 w-1.5 rounded-full", STATUS_DOT_CLASS[poolStatus])} />
                {STATUS_LABEL[poolStatus]}
              </p>
              {poolSig && poolAddress && (
                <div className="mt-1 flex flex-col gap-1">
                  <a
                    href={explorerTxUrl(poolSig, CLUSTER)}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-accent underline decoration-accent/40 underline-offset-2 hover:decoration-accent"
                  >
                    View transaction on Solana Explorer
                  </a>
                  <a
                    href={explorerAddressUrl(poolAddress, CLUSTER)}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-accent underline decoration-accent/40 underline-offset-2 hover:decoration-accent"
                  >
                    View pool account on Solana Explorer
                  </a>
                </div>
              )}
            </div>
            <Button
              disabled={!launchId || configStatus !== "confirmed" || poolBusy || poolStatus === "confirmed"}
              onClick={deployPool}
            >
              {poolBusy ? STATUS_LABEL[poolStatus] : poolStatus === "confirmed" ? "Done" : "Open in wallet"}
            </Button>
          </div>
        </div>

        {poolStatus === "confirmed" && poolAddress && (
          <div className="flex items-center justify-between rounded-[var(--radius-md)] border border-positive/30 bg-positive-muted p-5">
            <div>
              <p className="text-sm font-medium text-foreground">Market deployed</p>
              <Badge variant="positive" className="mt-1.5">
                Live on {CLUSTER}
              </Badge>
            </div>
            <Button onClick={() => router.push(`/markets/${launchId}`)}>View live market</Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
