import { PublicKey } from "@solana/web3.js";
import type { ElfCluster } from "./connection";

/** Native SOL's wrapped-SOL sentinel mint — identical on every cluster. */
export const NATIVE_SOL_MINT = new PublicKey("So11111111111111111111111111111111111111112");

/** Circle's official USDC mint on mainnet-beta. */
export const USDC_MINT_MAINNET = new PublicKey("EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v");

/**
 * Circle's official devnet-USDC mint (obtainable via the Circle faucet).
 * https://developers.circle.com/stablecoins/quickstart-transfer-10-usdc-on-solana
 */
export const USDC_MINT_DEVNET = new PublicKey("4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU");

/** The Associated Token Account program (a program, not a wallet) — used to tell whether a token account is the standard ATA. */
export const ASSOCIATED_TOKEN_PROGRAM_ID = new PublicKey("ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL");

export type QuoteTokenSymbol = "SOL" | "USDC";

/** Resolves an ELF quote-token selection to the correct mint for the active cluster. */
export function resolveQuoteMint(token: QuoteTokenSymbol, cluster: ElfCluster): PublicKey {
  if (token === "SOL") return NATIVE_SOL_MINT;
  return cluster === "devnet" ? USDC_MINT_DEVNET : USDC_MINT_MAINNET;
}
