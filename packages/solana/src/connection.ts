import { Connection, type Commitment } from "@solana/web3.js";

/**
 * Creates a Connection from an explicit RPC URL. Callers own the choice of
 * env var: server code should read `SOLANA_RPC_URL` (may embed an API key),
 * browser code should read `NEXT_PUBLIC_SOLANA_RPC_URL` (a public endpoint
 * with no embedded secret). This module never reads process.env itself so
 * it stays safe to import from either side.
 */
export function createConnection(rpcUrl: string, commitment: Commitment = "confirmed"): Connection {
  if (!rpcUrl) {
    throw new Error("A Solana RPC URL is required to create a connection.");
  }
  return new Connection(rpcUrl, commitment);
}

export type ElfCluster = "mainnet-beta" | "devnet";

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
