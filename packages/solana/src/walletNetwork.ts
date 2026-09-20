import type { ElfCluster } from "./connection.js";

/**
 * Wallet / cluster compatibility. ELF's cluster comes from ONE place — the RPC URL
 * (`resolveClusterFromRpcUrl`, verified server-side against the genesis hash). This module
 * decides whether a connected wallet can be asked to sign for that cluster, and words the
 * refusal when it cannot. Pure: no I/O, no wallet library imports.
 */

/** Wallet Standard chain identifiers. */
export const CHAIN_FOR_CLUSTER: Record<ElfCluster, string> = {
  devnet: "solana:devnet",
  "mainnet-beta": "solana:mainnet",
};

export const CLUSTER_LABEL: Record<ElfCluster, string> = {
  devnet: "Solana Devnet",
  "mainnet-beta": "Solana Mainnet",
};

const CHAIN_LABEL: Record<string, string> = {
  "solana:mainnet": "Solana Mainnet",
  "solana:devnet": "Solana Devnet",
  "solana:testnet": "Solana Testnet",
  "solana:localnet": "Solana Localnet",
};

export const chainLabel = (chain: string): string => CHAIN_LABEL[chain] ?? chain;

export interface WalletNetworkInput {
  expectedCluster: ElfCluster;
  /** Chains the connected ACCOUNT can sign for (Wallet Standard `account.chains`); null when unknown. */
  accountChains: readonly string[] | null;
  /** Chains the wallet advertises; used when the account does not list its own. Null when unknown. */
  walletChains: readonly string[] | null;
}

export type WalletNetworkAssessment =
  | { status: "compatible"; chain: string }
  | { status: "unverifiable"; chain: string; message: string }
  | { status: "mismatch"; chain: string; message: string };

/** The refusal shown to the user, in the wording ELF standardises on. */
export function networkMismatchMessage(expectedCluster: ElfCluster, walletNetworks: readonly string[]): string {
  const expected = CLUSTER_LABEL[expectedCluster];
  const connected = walletNetworks.length > 0 ? walletNetworks.map(chainLabel).join(", ") : "an unknown network";
  return [
    "NETWORK MISMATCH",
    "",
    "ELF is configured for:",
    expected,
    "",
    "Connected wallet:",
    connected,
    "",
    `Please switch the connected wallet/dapp network to ${expected} or connect a compatible ${expectedCluster === "devnet" ? "Devnet" : "Mainnet"} wallet.`,
  ].join("\n");
}

export class WalletNetworkMismatchError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "WalletNetworkMismatchError";
  }
}

/**
 * compatible   — the wallet/account advertises the cluster ELF is configured for.
 * mismatch     — it advertises chains, but not that one: signing is blocked.
 * unverifiable — the wallet exposes no chain information (e.g. a legacy native adapter), so
 *                compatibility cannot be checked; the caller may proceed but should say so.
 */
export function assessWalletNetwork({ expectedCluster, accountChains, walletChains }: WalletNetworkInput): WalletNetworkAssessment {
  const chain = CHAIN_FOR_CLUSTER[expectedCluster];
  const advertised = accountChains && accountChains.length > 0 ? accountChains : walletChains && walletChains.length > 0 ? walletChains : null;

  if (advertised === null) {
    return {
      status: "unverifiable",
      chain,
      message: `This wallet does not report which Solana network it uses, so ELF cannot confirm it is on ${CLUSTER_LABEL[expectedCluster]}. Check the network shown in the wallet's approval window before signing.`,
    };
  }
  if (advertised.includes(chain)) return { status: "compatible", chain };
  return { status: "mismatch", chain, message: networkMismatchMessage(expectedCluster, advertised) };
}

// ---------------------------------------------------------------------------------------------
// Active network (session scope)
//
// Some wallets (MetaMask) bind every request to a SESSION scope chosen when the dapp connects and
// ignore the `chain` field of individual Wallet Standard calls — and `solana:signMessage` has no
// chain field at all. For those wallets the only thing that decides which network the approval
// window shows is the session scope, so ELF reads it and refuses to request a signature unless it
// matches the configured cluster.
// ---------------------------------------------------------------------------------------------

/** CAIP-2 scope ids: `solana:` + the first 32 characters of the cluster's genesis hash. */
export const SCOPE_FOR_CLUSTER: Record<ElfCluster, string> = {
  devnet: "solana:EtWTRABZaYq6iMfeYKouRu166VU2xqa1",
  "mainnet-beta": "solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp",
};

const CLUSTER_FOR_SCOPE: Record<string, string> = {
  "solana:EtWTRABZaYq6iMfeYKouRu166VU2xqa1": "Solana Devnet",
  "solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp": "Solana Mainnet",
  "solana:4uhcVJyU9pJkvQyS88uRDiswHXSCkY3z": "Solana Testnet",
};

/** Human label for a wallet's active scope (CAIP-2 id or Wallet Standard chain name); null when unrecognised. */
export function labelForActiveScope(scope: string | null | undefined): string | null {
  if (!scope) return null;
  return CLUSTER_FOR_SCOPE[scope] ?? CHAIN_LABEL[scope] ?? null;
}

/** True when the wallet's active scope is the one ELF is configured for. */
export function scopeMatchesCluster(scope: string | null | undefined, cluster: ElfCluster): boolean {
  return scope === SCOPE_FOR_CLUSTER[cluster] || scope === CHAIN_FOR_CLUSTER[cluster];
}

/** The refusal shown when a wallet's ACTIVE network is not the configured one. */
export function activeNetworkMismatchMessage(walletName: string, activeLabel: string, expectedCluster: ElfCluster): string {
  return `${walletName} is connected to ${activeLabel}. Switch this dapp to ${CLUSTER_LABEL[expectedCluster]} before continuing.`;
}

export type ActiveNetworkAssessment =
  | { status: "compatible"; scope: string }
  | { status: "mismatch"; scope: string; message: string }
  | { status: "unknown" };

/** `unknown` = the wallet exposes no active-network state; the advertised-chains assessment then applies. */
export function assessActiveNetwork(input: { walletName: string; expectedCluster: ElfCluster; activeScope: string | null | undefined }): ActiveNetworkAssessment {
  const { walletName, expectedCluster, activeScope } = input;
  if (!activeScope) return { status: "unknown" };
  if (scopeMatchesCluster(activeScope, expectedCluster)) return { status: "compatible", scope: activeScope };
  const label = labelForActiveScope(activeScope) ?? `an unrecognised network (${activeScope})`;
  return { status: "mismatch", scope: activeScope, message: activeNetworkMismatchMessage(walletName, label, expectedCluster) };
}
