import { Connection, type Commitment } from "@solana/web3.js";

/**
 * Creates a Connection from an explicit RPC URL. Callers own the choice of
 * env var: server code should read `SOLANA_RPC_URL` (may embed an API key),
 * browser code should read `NEXT_PUBLIC_SOLANA_RPC_URL` (a public endpoint
 * with no embedded secret). This module never reads process.env itself so
 * it stays safe to import from either side.
 */
export function createConnection(rpcUrl: string, commitment: Commitment = "confirmed", options: { disableRetryOnRateLimit?: boolean } = {}): Connection {
  if (!rpcUrl) {
    throw new Error("A Solana RPC URL is required to create a connection.");
  }
  // web3.js retries a throttled (429) request with backoff, which hides the throttling behind seconds of latency.
  // A diagnostic that must SEE the 429 turns that off.
  return new Connection(rpcUrl, { commitment, disableRetryOnRateLimit: options.disableRetryOnRateLimit ?? false });
}

export type ElfCluster = "mainnet-beta" | "devnet";

/** The free shared devnet endpoint: fine as a default, but it rate-limits bursts (HTTP 429). */
export const PUBLIC_DEVNET_RPC_URL = "https://api.devnet.solana.com";

export const isPublicDefaultRpc = (rpcUrl: string): boolean => rpcUrl.replace(/\/+$/, "") === PUBLIC_DEVNET_RPC_URL;

/**
 * Who serves this RPC, safe to display: the registrable domain only ("helius-rpc.com"). The full hostname can carry an
 * endpoint identifier and the path or query carries the API key, so neither is ever returned.
 */
export function rpcProviderHost(rpcUrl: string): string {
  try {
    const host = new URL(rpcUrl).hostname;
    if (host === "localhost" || host.includes(":") || /^\d{1,3}(\.\d{1,3}){3}$/.test(host)) return "local/ip";
    return host.split(".").slice(-2).join(".");
  } catch {
    return "invalid-url";
  }
}

export type RpcFailure = "rate_limited" | "unavailable";

/** Tells a throttled endpoint (429) apart from any other RPC failure, so callers never present either as "zero". */
export function classifyRpcError(error: unknown): RpcFailure {
  const text = error instanceof Error ? error.message : String(error);
  return /\b429\b|too many requests|rate.?limit/i.test(text) ? "rate_limited" : "unavailable";
}

export function resolveClusterFromRpcUrl(rpcUrl: string): ElfCluster {
  return rpcUrl.includes("devnet") ? "devnet" : "mainnet-beta";
}

export function explorerTxUrl(signature: string, cluster: ElfCluster): string {
  const suffix = cluster === "devnet" ? "?cluster=devnet" : "";
  return `https://explorer.solana.com/tx/${signature}${suffix}`;
}

export function explorerAddressUrl(address: string, cluster: ElfCluster): string {
  const suffix = cluster === "devnet" ? "?cluster=devnet" : "";
  return `https://explorer.solana.com/address/${address}${suffix}`;
}
