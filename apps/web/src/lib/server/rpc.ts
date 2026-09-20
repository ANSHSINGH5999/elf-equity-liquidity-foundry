import "server-only";
import { PUBLIC_DEVNET_RPC_URL, createConnection } from "@elf/solana";
import type { Connection } from "@solana/web3.js";

/** The one server-side RPC URL: SOLANA_RPC_URL (may embed an API key), else the public devnet endpoint. */
export function getServerRpcUrl(): string {
  return process.env.SOLANA_RPC_URL || PUBLIC_DEVNET_RPC_URL;
}

export function getServerConnection(): Connection {
  return createConnection(getServerRpcUrl(), "confirmed");
}
