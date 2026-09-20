"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import type { Transaction } from "@solana/web3.js";
import { NetworkMismatchError, WalletNetworkMismatchError, assertClusterMatches, createConnection, type WalletNetworkAssessment } from "@elf/solana";
import { assessAdapter, canSwitchNetwork, signMessageForCluster, signTransactionForCluster, standardWalletOf, switchWalletToCluster, type WalletAdapterLike } from "@/lib/cluster-signer";
import { CLIENT_RPC_URL, CLUSTER } from "@/lib/solana-config";

/**
 * The server and the browser each read their own RPC env var. If they ever point at different
 * clusters, ELF would be building transactions for one network and signing for another, so this
 * compares them (the server reports its cluster on /api/health) before anything is signed.
 * The result is cached for the session; if the check itself cannot run, the server's own
 * genesis-hash verification (which runs before every transaction build) still applies.
 */
let serverCluster: Promise<string | null> | null = null;
async function assertServerClusterMatches(): Promise<void> {
  serverCluster ??= fetch("/api/health", { cache: "no-store" })
    .then((r) => r.json() as Promise<{ cluster?: string }>)
    .then((j) => j.cluster ?? null)
    .catch(() => null);
  const server = await serverCluster;
  if (server === null) {
    serverCluster = null; // do not cache a failed check
    return;
  }
  if (server !== CLUSTER) {
    throw new WalletNetworkMismatchError(
      `NETWORK MISMATCH\n\nELF's server is configured for:\n${server}\n\nELF's browser is configured for:\n${CLUSTER}\n\nSOLANA_RPC_URL and NEXT_PUBLIC_SOLANA_RPC_URL must point at the same cluster. Nothing was signed.`,
    );
  }
}

/**
 * The browser's own RPC must really be the cluster its URL claims (genesis hash), exactly as the server's is before
 * every transaction build — a URL that merely contains "devnet" proves nothing. A separate no-retry connection is used
 * so a throttled endpoint (HTTP 429) cannot stall the signing prompt; if the check cannot run, the server's own
 * genesis verification still applies. The genesis hash is cached per endpoint for a minute.
 */
let browserVerifier: ReturnType<typeof createConnection> | null = null;
async function assertBrowserRpcIsCluster(): Promise<void> {
  browserVerifier ??= createConnection(CLIENT_RPC_URL, "confirmed", { disableRetryOnRateLimit: true });
  try {
    await assertClusterMatches(browserVerifier, CLUSTER);
  } catch (error) {
    if (error instanceof NetworkMismatchError) {
      throw new WalletNetworkMismatchError(
        `NETWORK MISMATCH\n\nThe browser's RPC endpoint (NEXT_PUBLIC_SOLANA_RPC_URL) does not serve ${CLUSTER}: its genesis hash belongs to another network. Nothing was signed.`,
      );
    }
  }
}

export interface ClusterSigner {
  /** null until a wallet is connected. */
  assessment: WalletNetworkAssessment | null;
  /** True when the wallet cannot sign for ELF's cluster (or its ACTIVE network is another one): no signature may be requested. */
  blocked: boolean;
  /** The connected wallet's name, for messages. */
  walletName: string | null;
  /** Signs a transaction for ELF's cluster, or throws WalletNetworkMismatchError instead of asking the wallet. */
  sign: (transaction: Transaction) => Promise<Transaction>;
  /** Signs a message (the ownership proof) under the same guard. */
  signMessage: (message: Uint8Array) => Promise<Uint8Array>;
  /** True when the wallet lets a dapp request a session on another cluster. */
  canSwitch: boolean;
  /** Explicit, user-initiated: requests a session on ELF's cluster through the wallet's own session API. */
  switchNetwork: () => Promise<void>;
}

/** How often the wallet's active scope is re-read while connected (MetaMask emits no event for a scope-only change). */
const SCOPE_POLL_MS = 1000;

export function useClusterSigner(): ClusterSigner {
  const { publicKey, wallet } = useWallet();
  const adapter = wallet?.adapter as unknown as WalletAdapterLike | undefined;
  const key = publicKey?.toBase58() ?? null;
  const [version, setVersion] = useState(0);

  // Re-assess when the wallet reports a change, and when its active scope changes without one.
  useEffect(() => {
    if (!adapter || !key) return;
    const bump = () => setVersion((v) => v + 1);
    const events = standardWalletOf(adapter)?.features["standard:events"] as { on(event: "change", cb: () => void): () => void } | undefined;
    const off = events?.on("change", bump);
    let lastScope = standardWalletOf(adapter)?.scope;
    const timer = window.setInterval(() => {
      const scope = standardWalletOf(adapter)?.scope;
      if (scope !== lastScope) {
        lastScope = scope;
        bump();
      }
    }, SCOPE_POLL_MS);
    return () => {
      off?.();
      window.clearInterval(timer);
    };
  }, [adapter, key]);

  // `version` is intentionally a dependency: it forces a fresh read of the wallet's live state.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const assessment = useMemo(() => (key ? assessAdapter(adapter, key, CLUSTER) : null), [adapter, key, version]);

  const sign = useCallback(
    async (transaction: Transaction) => {
      await assertServerClusterMatches();
      await assertBrowserRpcIsCluster();
      return signTransactionForCluster({ adapter, publicKey: key, transaction, expectedCluster: CLUSTER });
    },
    [adapter, key],
  );

  const signMessage = useCallback(
    async (message: Uint8Array) => {
      await assertServerClusterMatches();
      await assertBrowserRpcIsCluster();
      return signMessageForCluster({ adapter, publicKey: key, message, expectedCluster: CLUSTER });
    },
    [adapter, key],
  );

  const switchNetwork = useCallback(async () => {
    try {
      await switchWalletToCluster({ adapter, publicKey: key, expectedCluster: CLUSTER });
    } finally {
      setVersion((v) => v + 1);
    }
  }, [adapter, key]);

  return {
    assessment,
    blocked: assessment?.status === "mismatch",
    walletName: adapter?.name ?? null,
    sign,
    signMessage,
    canSwitch: canSwitchNetwork(adapter),
    switchNetwork,
  };
}
