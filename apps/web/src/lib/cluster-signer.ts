import { Transaction } from "@solana/web3.js";
import {
  CHAIN_FOR_CLUSTER,
  SCOPE_FOR_CLUSTER,
  WalletNetworkMismatchError,
  activeNetworkMismatchMessage,
  assessActiveNetwork,
  assessWalletNetwork,
  labelForActiveScope,
  type ElfCluster,
  type WalletNetworkAssessment,
} from "@elf/solana";

/**
 * Network-safe signing.
 *
 * What was proven about MetaMask's Wallet Standard implementation (read from its injected code):
 *  - `standard:connect` takes no network argument and always creates a session for Solana MAINNET;
 *  - every `solana:signMessage` / `solana:signTransaction` is sent with `scope: wallet.scope` (that
 *    session scope). `solana:signMessage` has no `chain` field at all, and `signTransaction` IGNORES the
 *    `chain` it is given.
 * So the network MetaMask shows is decided by the session scope, not by ELF's RPC or by any per-call
 * parameter. This module therefore (1) reads the wallet's active scope, (2) refuses to request ANY
 * signature — message or transaction — unless it matches the configured cluster, and (3) offers an
 * explicit, user-approved switch that asks the wallet for a session on the configured cluster through the
 * wallet's own session API (the same call its `connect` makes, with a different scope).
 *
 * The wallet still performs every signature; ELF never sees a key, and still submits the raw transaction
 * itself to its own connection with simulation on.
 */

interface StandardAccount {
  address: string;
  chains: readonly string[];
}
interface SessionLike {
  sessionScopes?: Record<string, { accounts?: string[] } | undefined>;
}
interface StandardWalletLike {
  chains?: readonly string[];
  accounts: readonly StandardAccount[];
  features: Record<string, unknown>;
  /** MetaMask-specific (non-standard) active session scope, e.g. "solana:5eykt4Us…" (Mainnet). */
  scope?: string;
  /** MetaMask-specific session API, used only by the explicit switch. */
  client?: { createSession(input: unknown): Promise<SessionLike> };
  updateSession?: (session: SessionLike) => void;
}
interface SignFeature {
  signTransaction(input: { account: StandardAccount; chain: string; transaction: Uint8Array }): Promise<readonly { signedTransaction: Uint8Array }[]>;
}

/** The adapter instance from `useWallet().wallet?.adapter` (typed loosely on purpose: only what we read). */
export interface WalletAdapterLike {
  name?: string;
  wallet?: StandardWalletLike;
  signTransaction?: (tx: Transaction) => Promise<Transaction>;
  signMessage?: (message: Uint8Array) => Promise<Uint8Array>;
}

const SIGN_FEATURE = "solana:signTransaction";

export const standardWalletOf = (adapter: WalletAdapterLike | null | undefined): StandardWalletLike | null =>
  adapter?.wallet && typeof adapter.wallet === "object" && adapter.wallet.features ? adapter.wallet : null;

export type SignOperation = "signMessage" | "signTransaction" | "switchNetwork";

/** Only public information: never keys, seeds, message text or transaction bytes. */
export interface WalletDiagnostic {
  operation: SignOperation;
  configuredCluster: ElfCluster;
  walletAdvertisedChains: readonly string[] | null;
  walletActiveScope: string | null;
  requestedChain: string;
  publicKey: string | null;
  allowed: boolean;
}
export type DiagnosticSink = (d: WalletDiagnostic) => void;
const defaultSink: DiagnosticSink = (d) => console.info("[elf:wallet-network]", JSON.stringify(d));

function diagnostic(
  adapter: WalletAdapterLike | null | undefined,
  publicKey: string | null,
  cluster: ElfCluster,
  operation: SignOperation,
  allowed: boolean,
): WalletDiagnostic {
  const wallet = standardWalletOf(adapter);
  const account = wallet?.accounts.find((a) => a.address === publicKey) ?? null;
  return {
    operation,
    configuredCluster: cluster,
    walletAdvertisedChains: account?.chains ?? wallet?.chains ?? null,
    walletActiveScope: typeof wallet?.scope === "string" ? wallet.scope : null,
    requestedChain: CHAIN_FOR_CLUSTER[cluster],
    publicKey,
    allowed,
  };
}

/** Which network the wallet will actually present, plus whether it advertises the configured cluster. */
export function assessAdapter(adapter: WalletAdapterLike | null | undefined, publicKey: string | null, expectedCluster: ElfCluster): WalletNetworkAssessment {
  const wallet = standardWalletOf(adapter);

  // The active session scope decides what the wallet displays: check it first.
  const active = assessActiveNetwork({ walletName: adapter?.name ?? "The wallet", expectedCluster, activeScope: wallet?.scope });
  if (active.status === "mismatch") return { status: "mismatch", chain: CHAIN_FOR_CLUSTER[expectedCluster], message: active.message };

  const account = wallet?.accounts.find((a) => a.address === publicKey) ?? null;
  return assessWalletNetwork({ expectedCluster, accountChains: account?.chains ?? null, walletChains: wallet?.chains ?? null });
}

function assertAllowed(
  adapter: WalletAdapterLike | null | undefined,
  publicKey: string | null,
  expectedCluster: ElfCluster,
  operation: SignOperation,
  sink: DiagnosticSink,
): WalletNetworkAssessment {
  if (!adapter || !publicKey) throw new Error("Connect a wallet first.");
  const assessment = assessAdapter(adapter, publicKey, expectedCluster);
  sink(diagnostic(adapter, publicKey, expectedCluster, operation, assessment.status !== "mismatch"));
  if (assessment.status === "mismatch") throw new WalletNetworkMismatchError(assessment.message);
  return assessment;
}

export interface SignForClusterInput {
  adapter: WalletAdapterLike | null | undefined;
  publicKey: string | null;
  transaction: Transaction;
  expectedCluster: ElfCluster;
  log?: DiagnosticSink;
}

export async function signTransactionForCluster({ adapter, publicKey, transaction, expectedCluster, log = defaultSink }: SignForClusterInput): Promise<Transaction> {
  assertAllowed(adapter, publicKey, expectedCluster, "signTransaction", log);

  const wallet = standardWalletOf(adapter);
  if (wallet) {
    // A Wallet Standard wallet MUST be signed through its own feature so the chain travels with the request
    // (wallets that honour it use it; MetaMask ignores it and is governed by the session scope checked above).
    // Never fall back to the adapter's chain-less signTransaction for these.
    const feature = wallet.features[SIGN_FEATURE] as SignFeature | undefined;
    const account = wallet.accounts.find((a) => a.address === publicKey);
    if (!feature) throw new Error("The connected wallet does not support signing transactions.");
    if (!account) throw new Error("The connected wallet no longer exposes the account ELF was connected with. Reconnect the wallet.");

    const [out] = await feature.signTransaction({
      account,
      chain: CHAIN_FOR_CLUSTER[expectedCluster],
      transaction: new Uint8Array(transaction.serialize({ requireAllSignatures: false, verifySignatures: false })),
    });
    if (!out) throw new Error("The wallet returned no signed transaction.");
    return Transaction.from(out.signedTransaction);
  }

  // A wallet with no Wallet Standard interface cannot be told which chain to use. Its network was reported as
  // unverifiable above; the UI shows that advisory before signing.
  if (adapter!.signTransaction) return adapter!.signTransaction(transaction);
  throw new Error("The connected wallet cannot sign transactions.");
}

export interface SignMessageForClusterInput {
  adapter: WalletAdapterLike | null | undefined;
  publicKey: string | null;
  message: Uint8Array;
  expectedCluster: ElfCluster;
  log?: DiagnosticSink;
}

/** The ownership-proof signature. Same guard as transactions: no message signature on the wrong network either. */
export async function signMessageForCluster({ adapter, publicKey, message, expectedCluster, log = defaultSink }: SignMessageForClusterInput): Promise<Uint8Array> {
  assertAllowed(adapter, publicKey, expectedCluster, "signMessage", log);
  if (!adapter!.signMessage) throw new Error("This wallet does not support message signing, which ELF needs to prove deployment ownership.");
  return adapter!.signMessage(message);
}

export interface SwitchNetworkInput {
  adapter: WalletAdapterLike | null | undefined;
  publicKey: string | null;
  expectedCluster: ElfCluster;
  log?: DiagnosticSink;
}

/** Whether the wallet exposes the session API needed to request a session on another cluster. */
export const canSwitchNetwork = (adapter: WalletAdapterLike | null | undefined): boolean => {
  const w = standardWalletOf(adapter);
  return Boolean(w && typeof w.scope === "string" && typeof w.client?.createSession === "function" && typeof w.updateSession === "function");
};

/**
 * Explicit, user-initiated. MetaMask's session normally already GRANTS several networks to the dapp (its default
 * priority activates Mainnet first), so this:
 *  1. asks the wallet, through its own session API, for a session that includes the configured cluster for the
 *     connected account (the same call its `connect` makes, with the configured scope) — the wallet shows its own
 *     prompt if it needs consent;
 *  2. if the wallet's active scope is still not the configured one, selects the configured scope ONLY if the granted
 *     session really contains it for this exact account (the assignment MetaMask's own `updateSession` performs);
 *  3. re-reads the active scope and throws unless it is now the configured cluster.
 * Nothing is signed. If the wallet later resets its scope, the sign-time guard blocks again.
 */
export async function switchWalletToCluster({ adapter, publicKey, expectedCluster, log = defaultSink }: SwitchNetworkInput): Promise<void> {
  if (!adapter || !publicKey) throw new Error("Connect a wallet first.");
  const wallet = standardWalletOf(adapter);
  if (!wallet || !canSwitchNetwork(adapter)) throw new Error("This wallet does not let a dapp change its network. Change the network inside the wallet, then reconnect.");

  const scope = SCOPE_FOR_CLUSTER[expectedCluster];
  const walletName = adapter.name ?? "The wallet";
  const isActive = () => assessActiveNetwork({ walletName, expectedCluster, activeScope: wallet.scope }).status === "compatible";
  log(diagnostic(adapter, publicKey, expectedCluster, "switchNetwork", true));

  const session = await wallet.client!.createSession({
    optionalScopes: { [scope]: { accounts: [`${scope}:${publicKey}`], methods: [], notifications: [] } },
    sessionProperties: { solana_accountChanged_notifications: true },
  });
  wallet.updateSession!(session);

  if (!isActive() && session.sessionScopes?.[scope]?.accounts?.includes(`${scope}:${publicKey}`)) {
    wallet.scope = scope; // the configured scope IS granted to this account; make it the one requests use
  }

  if (!isActive()) {
    const now = labelForActiveScope(wallet.scope) ?? "another network";
    throw new WalletNetworkMismatchError(`${activeNetworkMismatchMessage(walletName, now, expectedCluster)} The wallet did not grant a session on ${expectedCluster} for this account.`);
  }
}
