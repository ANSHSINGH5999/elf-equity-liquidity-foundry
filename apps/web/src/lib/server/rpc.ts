import "server-only";
import { createConnection } from "@elf/solana";
import type { Connection } from "@solana/web3.js";

/** Server-only RPC connection. Reads SOLANA_RPC_URL, which may embed an API key. */
export function getServerConnection(): Connection {
  const rpcUrl = process.env.SOLANA_RPC_URL ?? "https://api.devnet.solana.com";
  return createConnection(rpcUrl, "confirmed");
}

export function getServerRpcUrl(): string {
  return process.env.SOLANA_RPC_URL ?? "https://api.devnet.solana.com";
}
