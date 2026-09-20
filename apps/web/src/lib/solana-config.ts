import { PUBLIC_DEVNET_RPC_URL, resolveClusterFromRpcUrl, type ElfCluster } from "@elf/solana";

/** Client-safe Solana config. Never import a server-only RPC URL here. */
export const CLIENT_RPC_URL = process.env.NEXT_PUBLIC_SOLANA_RPC_URL || PUBLIC_DEVNET_RPC_URL;

/**
 * The cluster ELF is configured for. Derived from the RPC URL by the same function the
 * server uses (`resolveClusterFromRpcUrl`), so there is a single definition of "which network".
 */
export const CLUSTER: ElfCluster = resolveClusterFromRpcUrl(CLIENT_RPC_URL);
