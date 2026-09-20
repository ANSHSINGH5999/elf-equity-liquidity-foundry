import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { Connection, Keypair, PublicKey, SystemProgram, Transaction } from "@solana/web3.js";
import {
  CHAIN_FOR_CLUSTER,
  SCOPE_FOR_CLUSTER,
  WalletNetworkMismatchError,
  activeNetworkMismatchMessage,
  assessActiveNetwork,
  assessWalletNetwork,
  labelForActiveScope,
  explorerAddressUrl,
  explorerTxUrl,
  networkMismatchMessage,
  resolveClusterFromRpcUrl,
} from "../../packages/solana/src/index.js";
import {
  assessAdapter,
  canSwitchNetwork,
  signMessageForCluster,
  signTransactionForCluster,
  switchWalletToCluster,
  type WalletAdapterLike,
  type WalletDiagnostic,
} from "../../apps/web/src/lib/cluster-signer.js";
import { CLUSTER, CLIENT_RPC_URL } from "../../apps/web/src/lib/solana-config.js";

/**
 * Network guard. The model:
 *   ELF's configured cluster -> is the connected wallet able to sign for it? -> sign WITH that chain, or refuse.
 * A Mainnet wallet must never be handed a Devnet transaction to sign blindly.
 */
const root = join(__dirname, "../..");
beforeEach(() => {
  vi.spyOn(console, "info").mockImplementation(() => {}); // the default diagnostic sink logs; keep test output quiet
});
const W = Keypair.generate().publicKey.toBase58();
const ALL = ["solana:mainnet", "solana:devnet", "solana:testnet"];

const tx = () => {
  const t = new Transaction().add(SystemProgram.transfer({ fromPubkey: new PublicKey(W), toPubkey: Keypair.generate().publicKey, lamports: 1 }));
  t.recentBlockhash = Keypair.generate().publicKey.toBase58();
  t.feePayer = new PublicKey(W);
  return t;
};

/** A Wallet Standard wallet double that records exactly what ELF asks it to sign. */
function fakeWallet(chains: string[], opts: { accountChains?: string[]; address?: string; withFeature?: boolean } = {}) {
  const calls: { chain: string; account: string; bytes: number[] }[] = [];
  const account = { address: opts.address ?? W, chains: opts.accountChains ?? chains };
  const adapter: WalletAdapterLike = {
    name: "FakeWallet",
    wallet: {
      chains,
      accounts: [account],
      features:
        opts.withFeature === false
          ? {}
          : {
              "solana:signTransaction": {
                signTransaction: async (input: { account: { address: string }; chain: string; transaction: Uint8Array }) => {
                  calls.push({ chain: input.chain, account: input.account.address, bytes: [...input.transaction] });
                  return [{ signedTransaction: input.transaction }];
                },
              },
            },
    },
    signTransaction: async () => {
      throw new Error("the chain-less adapter.signTransaction must never be used for a Wallet Standard wallet");
    },
  };
  return { adapter, calls };
}

describe("cluster configuration", () => {
  it("devnet configuration: the client cluster is derived from the RPC URL, and defaults to devnet", () => {
    expect(resolveClusterFromRpcUrl("https://api.devnet.solana.com")).toBe("devnet");
    expect(resolveClusterFromRpcUrl("https://api.mainnet-beta.solana.com")).toBe("mainnet-beta");
    expect(CLUSTER).toBe(resolveClusterFromRpcUrl(CLIENT_RPC_URL));
    expect(CLUSTER).toBe("devnet");
    expect(CHAIN_FOR_CLUSTER.devnet).toBe("solana:devnet");
    expect(CHAIN_FOR_CLUSTER["mainnet-beta"]).toBe("solana:mainnet");
  });
});

describe("wallet/cluster assessment", () => {
  it("Devnet wallet + Devnet ELF → compatible", () => {
    expect(assessWalletNetwork({ expectedCluster: "devnet", accountChains: ALL, walletChains: ALL })).toEqual({ status: "compatible", chain: "solana:devnet" });
  });

  it("Mainnet-only wallet + Devnet ELF → mismatch with the standard wording", () => {
    const a = assessWalletNetwork({ expectedCluster: "devnet", accountChains: ["solana:mainnet"], walletChains: ["solana:mainnet"] });
    expect(a.status).toBe("mismatch");
    if (a.status !== "mismatch") return;
    expect(a.message).toBe(
      [
        "NETWORK MISMATCH",
        "",
        "ELF is configured for:",
        "Solana Devnet",
        "",
        "Connected wallet:",
        "Solana Mainnet",
        "",
        "Please switch the connected wallet/dapp network to Solana Devnet or connect a compatible Devnet wallet.",
      ].join("\n"),
    );
  });

  it("Devnet-only wallet + Mainnet ELF → blocked (Mainnet is never assumed)", () => {
    const a = assessWalletNetwork({ expectedCluster: "mainnet-beta", accountChains: ["solana:devnet"], walletChains: ["solana:devnet"] });
    expect(a.status).toBe("mismatch");
    expect(a.status === "mismatch" && a.message).toContain("ELF is configured for:\nSolana Mainnet");
  });

  it("Mainnet wallet + Mainnet ELF → compatible (Mainnet support is not removed)", () => {
    expect(assessWalletNetwork({ expectedCluster: "mainnet-beta", accountChains: ["solana:mainnet"], walletChains: null }).status).toBe("compatible");
  });

  it("the connected account's own chains win over the wallet's advertised list", () => {
    expect(assessWalletNetwork({ expectedCluster: "devnet", accountChains: ["solana:mainnet"], walletChains: ALL }).status).toBe("mismatch");
    expect(assessWalletNetwork({ expectedCluster: "devnet", accountChains: null, walletChains: ALL }).status).toBe("compatible");
  });

  it("a wallet that reports no chains is unverifiable, not silently 'compatible'", () => {
    for (const chains of [null, []] as const) {
      const a = assessWalletNetwork({ expectedCluster: "devnet", accountChains: chains, walletChains: chains });
      expect(a.status).toBe("unverifiable");
      expect(a.status === "unverifiable" && a.message).toMatch(/cannot confirm it is on Solana Devnet/);
    }
  });

  it("the message lists every non-matching network and never claims a fix", () => {
    const m = networkMismatchMessage("devnet", ["solana:mainnet", "solana:testnet"]);
    expect(m).toContain("Solana Mainnet, Solana Testnet");
    expect(m).not.toMatch(/fund|send .*SOL|airdrop/i);
  });
});

describe("signing goes to the wallet WITH ELF's chain, or not at all", () => {
  it("correct Devnet transaction: the wallet is asked to sign for solana:devnet, for the connected account, with the exact bytes", async () => {
    const { adapter, calls } = fakeWallet(ALL);
    const t = tx();
    const original = [...t.serialize({ requireAllSignatures: false, verifySignatures: false })];
    const signed = await signTransactionForCluster({ adapter, publicKey: W, transaction: t, expectedCluster: "devnet" });

    expect(calls).toHaveLength(1);
    expect(calls[0]!.chain).toBe("solana:devnet");
    expect(calls[0]!.account).toBe(W);
    expect(calls[0]!.bytes).toEqual(original); // ELF does not alter the transaction to make it pass
    expect(signed.feePayer!.toBase58()).toBe(W);
  });

  it("Mainnet ELF (explicitly configured) asks for solana:mainnet — the chain follows configuration, never a default", async () => {
    const { adapter, calls } = fakeWallet(ALL);
    await signTransactionForCluster({ adapter, publicKey: W, transaction: tx(), expectedCluster: "mainnet-beta" });
    expect(calls[0]!.chain).toBe("solana:mainnet");
  });

  it("Mainnet wallet + Devnet ELF → blocked BEFORE the wallet is ever asked to sign", async () => {
    const { adapter, calls } = fakeWallet(["solana:mainnet"]);
    await expect(signTransactionForCluster({ adapter, publicKey: W, transaction: tx(), expectedCluster: "devnet" })).rejects.toBeInstanceOf(WalletNetworkMismatchError);
    expect(calls).toHaveLength(0);
  });

  it("Devnet wallet + Mainnet ELF → blocked before signing", async () => {
    const { adapter, calls } = fakeWallet(["solana:devnet"]);
    await expect(signTransactionForCluster({ adapter, publicKey: W, transaction: tx(), expectedCluster: "mainnet-beta" })).rejects.toThrow(/NETWORK MISMATCH/);
    expect(calls).toHaveLength(0);
  });

  it("an account whose own chains exclude devnet is blocked even if the wallet advertises it", async () => {
    const { adapter, calls } = fakeWallet(ALL, { accountChains: ["solana:mainnet"] });
    await expect(signTransactionForCluster({ adapter, publicKey: W, transaction: tx(), expectedCluster: "devnet" })).rejects.toBeInstanceOf(WalletNetworkMismatchError);
    expect(calls).toHaveLength(0);
  });

  it("never falls back to the chain-less adapter.signTransaction for a Wallet Standard wallet", async () => {
    const noFeature = fakeWallet(ALL, { withFeature: false });
    await expect(signTransactionForCluster({ adapter: noFeature.adapter, publicKey: W, transaction: tx(), expectedCluster: "devnet" })).rejects.toThrow(/does not support signing/);
    const otherAccount = fakeWallet(ALL, { address: Keypair.generate().publicKey.toBase58() });
    await expect(signTransactionForCluster({ adapter: otherAccount.adapter, publicKey: W, transaction: tx(), expectedCluster: "devnet" })).rejects.toThrow(/Reconnect the wallet/);
  });

  it("a legacy wallet with no Wallet Standard interface is 'unverifiable' and uses its own signer", async () => {
    let used = false;
    const legacy: WalletAdapterLike = { name: "Legacy", signTransaction: async (t) => ((used = true), t) };
    expect(assessAdapter(legacy, W, "devnet").status).toBe("unverifiable");
    await signTransactionForCluster({ adapter: legacy, publicKey: W, transaction: tx(), expectedCluster: "devnet" });
    expect(used).toBe(true);
  });

  it("no wallet connected → 'Connect a wallet first.'", async () => {
    await expect(signTransactionForCluster({ adapter: null, publicKey: null, transaction: tx(), expectedCluster: "devnet" })).rejects.toThrow("Connect a wallet first.");
  });
});

describe("explorer links follow the configured cluster", () => {
  const SIG = "5VERv8NMvzbJMEkV8xnrLkEaWRtSz9CosKDYjCJjBRnbJLgp8uirBgmQpjKhoR4tjF3ZpRzrFmBV6UjKdiSZkQUW";
  it("devnet transactions and addresses carry ?cluster=devnet", () => {
    expect(explorerTxUrl(SIG, "devnet")).toBe(`https://explorer.solana.com/tx/${SIG}?cluster=devnet`);
    expect(explorerAddressUrl(W, "devnet")).toBe(`https://explorer.solana.com/address/${W}?cluster=devnet`);
  });
  it("mainnet links never carry a devnet cluster parameter", () => {
    expect(explorerTxUrl(SIG, "mainnet-beta")).toBe(`https://explorer.solana.com/tx/${SIG}`);
    expect(explorerAddressUrl(W, "mainnet-beta")).not.toContain("cluster=");
  });
});

describe("static guarantees", () => {
  const walk = (d: string): string[] =>
    readdirSync(d).flatMap((f) => {
      const p = join(d, f);
      return f === "node_modules" || f === ".next" ? [] : statSync(p).isDirectory() ? walk(p) : /\.(ts|tsx)$/.test(f) ? [p] : [];
    });
  const web = walk(join(root, "apps/web/src"));
  const read = (f: string) => readFileSync(f, "utf8").replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "");

  it("both signing sites sign through the cluster guard and never destructure the chain-less signTransaction", () => {
    for (const f of ["components/design/review-step.tsx", "components/markets/trade-panel.tsx"]) {
      const src = read(join(root, "apps/web/src", f));
      expect(src, f).toContain("clusterSigner.sign(");
      expect(src, f).not.toMatch(/const\s*\{[^}]*\bsignTransaction\b[^}]*\}\s*=\s*useWallet\(\)/);
      expect(src, f).toContain("clusterSigner.blocked");
    }
  });

  it("no code anywhere in the app calls the wallet's chain-less signTransaction directly", () => {
    const offenders = web.filter((f) => /useWallet\(\)/.test(read(f)) && /\bsignTransaction\b/.test(read(f)) && !f.endsWith("cluster-signer.ts"));
    expect(offenders.map((f) => f.slice(root.length + 1))).toEqual([]);
  });

  it("simulation is never skipped in the app (no skipPreflight: true)", () => {
    expect(web.filter((f) => /skipPreflight:\s*true/.test(read(f)))).toEqual([]);
  });

  it("explorer URLs are built only by the shared helpers — no hardcoded cluster in the UI", () => {
    const offenders = web.filter((f) => /explorer\.solana\.com/.test(read(f)) || /cluster=devnet/.test(read(f)));
    expect(offenders.map((f) => f.slice(root.length + 1))).toEqual([]);
  });

  it("the client cluster has one definition (resolveClusterFromRpcUrl), not a second copy of the rule", () => {
    expect(read(join(root, "apps/web/src/lib/solana-config.ts"))).toContain("resolveClusterFromRpcUrl(CLIENT_RPC_URL)");
    expect(read(join(root, "apps/web/src/lib/solana-config.ts"))).not.toMatch(/includes\("devnet"\)/);
  });
});

describe("real cluster (needs TEST_FUNDED_PUBKEY; read-only)", () => {
  it("the transaction ELF hands to the wallet is Devnet-derived: valid blockhash on Devnet, unknown on Mainnet", async () => {
    const funded = process.env.TEST_FUNDED_PUBKEY;
    if (!funded) return console.warn("Skipping: set TEST_FUNDED_PUBKEY to the connected wallet's public key.");
    const dev = new Connection("https://api.devnet.solana.com", "confirmed");
    const main = new Connection("https://api.mainnet-beta.solana.com", "confirmed");
    try {
      const { blockhash } = await dev.getLatestBlockhash("confirmed");
      expect((await dev.isBlockhashValid(blockhash, { commitment: "confirmed" })).value).toBe(true);
      expect((await main.isBlockhashValid(blockhash, { commitment: "confirmed" })).value).toBe(false);
    } catch {
      return console.warn("Skipping: cluster unreachable.");
    }
  }, 60_000);
});

// ---------------------------------------------------------------------------------------------
// MetaMask: the SESSION SCOPE decides the network (chain params are ignored, signMessage has none).
// ---------------------------------------------------------------------------------------------
const MAINNET_SCOPE = "solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp";
const DEVNET_SCOPE = SCOPE_FOR_CLUSTER.devnet;

/** A MetaMask-shaped wallet: advertises all chains, but every request goes to `scope`. */
function fakeMetaMask(initialScope: string | undefined) {
  const calls = { signTransaction: 0, signMessage: 0, createSession: [] as unknown[] };
  const account = { address: W, chains: ALL };
  const wallet: NonNullable<WalletAdapterLike["wallet"]> = {
    chains: ALL,
    accounts: [account],
    scope: initialScope,
    features: {
      "solana:signTransaction": {
        signTransaction: async (input: { transaction: Uint8Array }) => {
          calls.signTransaction++;
          return [{ signedTransaction: input.transaction }];
        },
      },
    },
    client: {
      createSession: async (input: unknown) => {
        calls.createSession.push(input);
        // Like the real MetaMask session: it keeps granting Mainnet AND includes what was requested.
        const requested = (input as { optionalScopes: Record<string, { accounts?: string[] }> }).optionalScopes;
        return { sessionScopes: { [MAINNET_SCOPE]: { accounts: [`${MAINNET_SCOPE}:${W}`] }, ...requested } };
      },
    },
    updateSession(session) {
      // MetaMask's own rule: the first supported scope present in the session becomes the active scope.
      const order = [MAINNET_SCOPE, DEVNET_SCOPE, "solana:4uhcVJyU9pJkvQyS88uRDiswHXSCkY3z"];
      this.scope = order.find((sc) => sc in (session.sessionScopes ?? {}));
    },
  };
  const adapter: WalletAdapterLike = {
    name: "MetaMask",
    wallet,
    signMessage: async () => {
      calls.signMessage++;
      return new Uint8Array(64);
    },
  };
  return { adapter, wallet, calls };
}

describe("active network (session scope)", () => {
  it("maps CAIP-2 scopes to clusters", () => {
    expect(labelForActiveScope(MAINNET_SCOPE)).toBe("Solana Mainnet");
    expect(labelForActiveScope(DEVNET_SCOPE)).toBe("Solana Devnet");
    expect(labelForActiveScope("solana:devnet")).toBe("Solana Devnet");
    expect(labelForActiveScope(undefined)).toBeNull();
    expect(assessActiveNetwork({ walletName: "MetaMask", expectedCluster: "devnet", activeScope: DEVNET_SCOPE }).status).toBe("compatible");
    expect(assessActiveNetwork({ walletName: "MetaMask", expectedCluster: "devnet", activeScope: undefined }).status).toBe("unknown");
  });

  it("uses the exact refusal wording for a Mainnet session", () => {
    const a = assessActiveNetwork({ walletName: "MetaMask", expectedCluster: "devnet", activeScope: MAINNET_SCOPE });
    expect(a.status === "mismatch" && a.message).toBe("MetaMask is connected to Solana Mainnet. Switch this dapp to Solana Devnet before continuing.");
    expect(activeNetworkMismatchMessage("MetaMask", "Solana Mainnet", "devnet")).toBe("MetaMask is connected to Solana Mainnet. Switch this dapp to Solana Devnet before continuing.");
  });

  it("a wallet that advertises devnet but whose ACTIVE session is Mainnet is a mismatch (the real MetaMask case)", () => {
    const { adapter } = fakeMetaMask(MAINNET_SCOPE);
    expect(assessAdapter(adapter, W, "devnet").status).toBe("mismatch");
    expect(assessAdapter(fakeMetaMask(DEVNET_SCOPE).adapter, W, "devnet").status).toBe("compatible");
  });

  it("Mainnet session + Devnet ELF → signMessage is NOT called", async () => {
    const { adapter, calls } = fakeMetaMask(MAINNET_SCOPE);
    await expect(signMessageForCluster({ adapter, publicKey: W, message: new Uint8Array([1, 2, 3]), expectedCluster: "devnet" })).rejects.toThrow(
      "MetaMask is connected to Solana Mainnet. Switch this dapp to Solana Devnet before continuing.",
    );
    expect(calls.signMessage).toBe(0);
  });

  it("Mainnet session + Devnet ELF → signTransaction is NOT called", async () => {
    const { adapter, calls } = fakeMetaMask(MAINNET_SCOPE);
    await expect(signTransactionForCluster({ adapter, publicKey: W, transaction: tx(), expectedCluster: "devnet" })).rejects.toBeInstanceOf(WalletNetworkMismatchError);
    expect(calls.signTransaction).toBe(0);
  });

  it("Devnet session + Devnet ELF → both requests are allowed", async () => {
    const { adapter, calls } = fakeMetaMask(DEVNET_SCOPE);
    await signMessageForCluster({ adapter, publicKey: W, message: new Uint8Array([1]), expectedCluster: "devnet" });
    await signTransactionForCluster({ adapter, publicKey: W, transaction: tx(), expectedCluster: "devnet" });
    expect(calls.signMessage).toBe(1);
    expect(calls.signTransaction).toBe(1);
  });

  it("Devnet session + Mainnet ELF → blocked (the guard follows configuration, never a default)", async () => {
    const { adapter, calls } = fakeMetaMask(DEVNET_SCOPE);
    await expect(signMessageForCluster({ adapter, publicKey: W, message: new Uint8Array([1]), expectedCluster: "mainnet-beta" })).rejects.toThrow(/Switch this dapp to Solana Mainnet/);
    expect(calls.signMessage).toBe(0);
  });

  it("a wallet with no active-scope state falls back to the advertised-chains check (unchanged)", () => {
    expect(assessAdapter(fakeMetaMask(undefined).adapter, W, "devnet").status).toBe("compatible");
    expect(assessAdapter(fakeWallet(["solana:mainnet"]).adapter, W, "devnet").status).toBe("mismatch");
  });
});

describe("explicit switch to the configured network", () => {
  it("requests a session on Devnet through the wallet's own API, for the connected account, and signs nothing", async () => {
    const { adapter, wallet, calls } = fakeMetaMask(MAINNET_SCOPE);
    expect(canSwitchNetwork(adapter)).toBe(true);
    await switchWalletToCluster({ adapter, publicKey: W, expectedCluster: "devnet" });

    expect(calls.createSession).toEqual([
      {
        optionalScopes: { [DEVNET_SCOPE]: { accounts: [`${DEVNET_SCOPE}:${W}`], methods: [], notifications: [] } },
        sessionProperties: { solana_accountChanged_notifications: true },
      },
    ]);
    expect(wallet.scope).toBe(DEVNET_SCOPE);
    expect(calls.signMessage + calls.signTransaction).toBe(0);
    expect(assessAdapter(adapter, W, "devnet").status).toBe("compatible");
  });

  it("selects the configured scope when the granted session already contains it for this account (the real MetaMask case)", async () => {
    const { adapter, wallet } = fakeMetaMask(MAINNET_SCOPE);
    await switchWalletToCluster({ adapter, publicKey: W, expectedCluster: "devnet" });
    expect(wallet.scope).toBe(DEVNET_SCOPE); // updateSession alone would have picked Mainnet first
  });

  it("does not pretend: if the session does not grant the configured scope to THIS account, it throws and the scope is unchanged", async () => {
    const { adapter, wallet } = fakeMetaMask(MAINNET_SCOPE);
    const other = Keypair.generate().publicKey.toBase58();
    wallet.client!.createSession = async () => ({ sessionScopes: { [MAINNET_SCOPE]: { accounts: [`${MAINNET_SCOPE}:${W}`] }, [DEVNET_SCOPE]: { accounts: [`${DEVNET_SCOPE}:${other}`] } } });
    await expect(switchWalletToCluster({ adapter, publicKey: W, expectedCluster: "devnet" })).rejects.toThrow(/did not grant a session on devnet for this account/);
    expect(wallet.scope).toBe(MAINNET_SCOPE);
  });

  it("does not pretend: a wallet that refuses to leave Mainnet ends in an error", async () => {
    const { adapter, wallet } = fakeMetaMask(MAINNET_SCOPE);
    wallet.client!.createSession = async () => ({ sessionScopes: { [MAINNET_SCOPE]: { accounts: [`${MAINNET_SCOPE}:${W}`] } } });
    await expect(switchWalletToCluster({ adapter, publicKey: W, expectedCluster: "devnet" })).rejects.toBeInstanceOf(WalletNetworkMismatchError);
    expect(wallet.scope).toBe(MAINNET_SCOPE);
  });

  it("wallets without a session API cannot be switched by a dapp, and say so", async () => {
    const plain = fakeWallet(ALL).adapter;
    expect(canSwitchNetwork(plain)).toBe(false);
    await expect(switchWalletToCluster({ adapter: plain, publicKey: W, expectedCluster: "devnet" })).rejects.toThrow(/does not let a dapp change its network/);
  });
});

describe("diagnostics are sanitized", () => {
  it("logs only public fields, for every operation", async () => {
    const seen: WalletDiagnostic[] = [];
    const { adapter } = fakeMetaMask(DEVNET_SCOPE);
    const secretText = "ELF-OWNERSHIP-MESSAGE-SECRET-MARKER";
    await signMessageForCluster({ adapter, publicKey: W, message: new TextEncoder().encode(secretText), expectedCluster: "devnet", log: (d) => seen.push(d) });
    const t = tx();
    await signTransactionForCluster({ adapter, publicKey: W, transaction: t, expectedCluster: "devnet", log: (d) => seen.push(d) });
    await switchWalletToCluster({ adapter: fakeMetaMask(MAINNET_SCOPE).adapter, publicKey: W, expectedCluster: "devnet", log: (d) => seen.push(d) });

    expect(seen.map((d) => d.operation)).toEqual(["signMessage", "signTransaction", "switchNetwork"]);
    for (const d of seen) {
      expect(Object.keys(d).sort()).toEqual(["allowed", "configuredCluster", "operation", "publicKey", "requestedChain", "walletActiveScope", "walletAdvertisedChains"]);
      expect(d.configuredCluster).toBe("devnet");
      expect(d.requestedChain).toBe("solana:devnet");
      expect(d.publicKey).toBe(W);
    }
    const dump = JSON.stringify(seen);
    expect(dump).not.toContain(secretText);
    expect(dump).not.toContain(Buffer.from(t.serialize({ requireAllSignatures: false, verifySignatures: false })).toString("base64"));
  });

  it("a blocked request is still logged (allowed: false) before it is refused", async () => {
    const seen: WalletDiagnostic[] = [];
    const { adapter } = fakeMetaMask(MAINNET_SCOPE);
    await expect(signMessageForCluster({ adapter, publicKey: W, message: new Uint8Array([1]), expectedCluster: "devnet", log: (d) => seen.push(d) })).rejects.toBeInstanceOf(WalletNetworkMismatchError);
    expect(seen).toHaveLength(1);
    expect(seen[0]).toMatchObject({ operation: "signMessage", allowed: false, walletActiveScope: MAINNET_SCOPE, configuredCluster: "devnet" });
  });
});

describe("static: every signature request goes through the guard", () => {
  const src = (f: string) => readFileSync(join(root, "apps/web/src", f), "utf8").replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "");
  it("the ownership-proof signature uses clusterSigner.signMessage, not the wallet's raw signMessage", () => {
    const review = src("components/design/review-step.tsx");
    expect(review).toContain("clusterSigner.signMessage(");
    expect(review).not.toMatch(/const\s*\{[^}]*\bsignMessage\b[^}]*\}\s*=\s*useWallet\(\)/);
  });
});
