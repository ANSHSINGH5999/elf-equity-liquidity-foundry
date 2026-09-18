/** Client-safe Solana config. Never import a server-only RPC URL here. */
export const CLIENT_RPC_URL =
  process.env.NEXT_PUBLIC_SOLANA_RPC_URL ?? "https://api.devnet.solana.com";

export const CLUSTER: "mainnet-beta" | "devnet" = CLIENT_RPC_URL.includes("devnet")
  ? "devnet"
  : "mainnet-beta";
