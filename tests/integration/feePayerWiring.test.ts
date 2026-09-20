import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { Connection, Keypair, PublicKey, Transaction } from "@solana/web3.js";
import { compileCurveCandidates } from "../../packages/market-engine/src/index.js";
import { buildCreateConfigTransaction } from "../../packages/meteora-adapter/src/index.js";
import { prepareForWalletSignature } from "../../apps/web/src/lib/server/transaction.js";
import type { MarketProfile, TokenizedAsset } from "../../packages/shared/src/index.js";

/**
 * Wallet / fee-payer wiring. The model under test:
 *
 *   connected wallet W -> request payerPublicKey -> server builds an UNSIGNED
 *   transaction with feePayer = W -> browser wallet signs -> send.
 *
 * The fee payer must be the wallet that connected — never a hardcoded, test,
 * server or admin wallet — and the server must not sign for the user (the only
 * server-side signature is the ephemeral config keypair the transaction creates).
 */
const root = join(__dirname, "../..");
const asset: TokenizedAsset = {
  id: "asset-1", name: "Acme Pre-IPO", symbol: "ACME", mintAddress: "So11111111111111111111111111111111111111112",
  issuer: "Acme Corp", assetType: "pre_ipo", referencePriceUsd: 10, source: "manual", createdAt: "2026-09-20T00:00:00.000Z",
};
const profile: MarketProfile = {
  id: "profile-1", assetId: "asset-1", initialLiquidityUsd: 250_000, expectedVolatility: "medium", riskProfile: "balanced",
  targetLiquidityUsd: 500_000, targetGraduationUsd: 1_000_000, quoteToken: "USDC", createdAt: "2026-09-20T00:00:00.000Z",
};
const candidate = () => compileCurveCandidates(asset, profile).find((c) => c.riskProfile === "balanced")!;

/** Records the order of RPC seams so we can prove simulation still runs, once, before the transaction leaves the server. */
class SeamConnection extends Connection {
  events: string[] = [];
  simulated: Transaction[] = [];
  constructor() {
    super("http://127.0.0.1:1", "confirmed");
  }
  override async getLatestBlockhash() {
    this.events.push("getLatestBlockhash");
    return { blockhash: Keypair.generate().publicKey.toBase58(), lastValidBlockHeight: 123 };
  }
  override async simulateTransaction(tx: any) {
    this.events.push("simulate");
    this.simulated.push(tx as Transaction);
    return { context: { slot: 1 }, value: { err: null, logs: [], accounts: null, unitsConsumed: 0, returnData: null } } as any;
  }
}

async function buildFor(wallet: PublicKey, feeClaimer: PublicKey = wallet) {
  const connection = new SeamConnection();
  const built = await buildCreateConfigTransaction({ connection, candidate: candidate(), profile, payer: wallet, feeClaimer, rpcUrl: "https://api.devnet.solana.com" });
  const prepared = await prepareForWalletSignature(connection, built.transaction, wallet, [built.configKeypair]);
  return { connection, built, tx: Transaction.from(Buffer.from(prepared.transactionBase64, "base64")) };
}

describe("fee payer is the connected wallet", () => {
  it.each(Array.from({ length: 5 }, (_, i) => i))("random wallet #%i becomes the fee payer, and nothing else pays or signs for the user", async () => {
    const W = Keypair.generate().publicKey;
    const { connection, built, tx } = await buildFor(W);

    expect(tx.feePayer!.equals(W)).toBe(true);
    const message = tx.compileMessage();
    expect(message.accountKeys[0]!.equals(W)).toBe(true);

    // Exactly two required signers: the user's wallet and the ephemeral config account being created. No server/test/admin wallet.
    expect(message.header.numRequiredSignatures).toBe(2);
    const signers = new Set(message.accountKeys.slice(0, message.header.numRequiredSignatures).map((k) => k.toBase58()));
    expect(signers).toEqual(new Set([W.toBase58(), built.configKeypair.publicKey.toBase58()]));

    // The server did NOT sign for the user: W's signature slot is empty; only the ephemeral config keypair signed.
    const sigFor = (k: PublicKey) => tx.signatures.find((s) => s.publicKey.equals(k))!.signature;
    expect(sigFor(W)).toBeNull();
    expect(sigFor(built.configKeypair.publicKey)).not.toBeNull();

    // Simulation is preserved: it ran once, after the blockhash was attached, on a transaction paid by W.
    expect(connection.events).toEqual(["getLatestBlockhash", "simulate"]);
    expect(connection.simulated).toHaveLength(1);
    expect(connection.simulated[0]!.feePayer!.equals(W)).toBe(true);
  });

  it("the fee claimer (a different role) never becomes the fee payer", async () => {
    const W = Keypair.generate().publicKey;
    const claimer = Keypair.generate().publicKey;
    const { tx } = await buildFor(W, claimer);
    expect(tx.feePayer!.equals(W)).toBe(true);
    expect(tx.feePayer!.equals(claimer)).toBe(false);
  });

  it("two different wallets produce two different fee payers (nothing is cached or fixed)", async () => {
    const a = Keypair.generate().publicKey;
    const b = Keypair.generate().publicKey;
    const [ta, tb] = [(await buildFor(a)).tx, (await buildFor(b)).tx];
    expect(ta.feePayer!.equals(a)).toBe(true);
    expect(tb.feePayer!.equals(b)).toBe(true);
    expect(ta.feePayer!.equals(tb.feePayer!)).toBe(false);
  });
});

describe("no hardcoded, test, server or admin wallet in the app", () => {
  const walk = (dir: string): string[] =>
    readdirSync(dir).flatMap((f) => {
      const p = join(dir, f);
      if (f === "node_modules" || f === ".next" || f === "generated") return [];
      return statSync(p).isDirectory() ? walk(p) : /\.(ts|tsx)$/.test(f) ? [p] : [];
    });
  const sources = [...walk(join(root, "apps/web/src")), ...walk(join(root, "packages"))].filter((f) => f.includes("/src/"));
  const read = (f: string) => readFileSync(f, "utf8").replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "");

  it("`feePayer` is assigned in exactly one place: prepareForWalletSignature", () => {
    const assigners = sources.filter((f) => /\.feePayer\s*=(?!=)/.test(read(f))).map((f) => f.slice(root.length + 1));
    expect(assigners).toEqual(["apps/web/src/lib/server/transaction.ts"]);
  });

  it.each(["apps/web/src/app/api/dbc/config/route.ts", "apps/web/src/app/api/dbc/pool/route.ts", "apps/web/src/app/api/dbc/[poolAddress]/swap/route.ts"])(
    "%s uses the wallet from the request as the fee payer",
    (route) => {
      const src = read(join(root, route));
      expect(src).toMatch(/parsePublicKeyOrThrow\(parsed\.data\.payerPublicKey, "payerPublicKey"\)/);
      expect(src).toMatch(/prepareForWalletSignature\(\s*connection,\s*transaction,\s*(payer|owner),/);
    },
  );

  it("no server wallet, test key or fixed signer is read by app code", () => {
    const offenders = sources.filter((f) => /TEST_FUNDED|SERVER_WALLET|TREASURY|ADMIN_WALLET|FEE_PAYER_(SECRET|KEY)|process\.env\.[A-Z_]*(KEYPAIR|WALLET)/.test(read(f)));
    expect(offenders.map((f) => f.slice(root.length + 1))).toEqual([]);
  });

  it("the only base58 address literals are well-known mints / cluster genesis hashes — never a wallet", () => {
    const allowed = new Set([
      "So11111111111111111111111111111111111111112", // wrapped SOL mint
      "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v", // mainnet USDC mint
      "4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU", // devnet USDC mint
      "5eykt4UsFv8P8NJdTREpY1vzqKqZKvdpKuc147dw2N9d", // mainnet genesis hash
      "EtWTRABZaYq6iMfeYKouRu166VU2xqa1wcaWoxPkrZBG", // devnet genesis hash
      "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL", // Associated Token Account program (a program, not a wallet)
    ]);
    const found = new Set<string>();
    for (const f of sources) for (const m of read(f).matchAll(/["'`]([1-9A-HJ-NP-Za-km-z]{43,44})["'`]/g)) found.add(m[1]!);
    expect([...found].filter((a) => !allowed.has(a))).toEqual([]);
  });
});

describe("real cluster (needs TEST_FUNDED_PUBKEY = the connected wallet's PUBLIC key; simulation only)", () => {
  const funded = process.env.TEST_FUNDED_PUBKEY;
  it("the actual connected wallet is the fee payer and the real simulation passes", async () => {
    if (!funded) return console.warn("Skipping: set TEST_FUNDED_PUBKEY to the connected wallet's public key.");
    const RPC = process.env.SOLANA_RPC_URL ?? "https://api.devnet.solana.com";
    const connection = new Connection(RPC, "confirmed");
    try {
      await connection.getLatestBlockhash("confirmed");
    } catch {
      return console.warn("Skipping: cluster unreachable.");
    }
    const W = new PublicKey(funded);
    if ((await connection.getAccountInfo(W, "confirmed")) === null) return console.warn("Skipping: that wallet has no account on this cluster.");

    const built = await buildCreateConfigTransaction({ connection, candidate: candidate(), profile, payer: W, feeClaimer: W, rpcUrl: RPC });
    const prepared = await prepareForWalletSignature(connection, built.transaction, W, [built.configKeypair]); // real simulation — throws on failure
    const tx = Transaction.from(Buffer.from(prepared.transactionBase64, "base64"));
    expect(tx.feePayer!.toBase58()).toBe(W.toBase58());
    expect(tx.signatures.find((s) => s.publicKey.equals(W))!.signature).toBeNull();
  }, 60_000);
});
