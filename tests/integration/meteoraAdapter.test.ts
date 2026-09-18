import { describe, expect, it, beforeAll } from "vitest";
import { Connection, Keypair } from "@solana/web3.js";
import bs58 from "bs58";
import BN from "bn.js";
import { compileCurveCandidates } from "../../packages/market-engine/src/index.js";
import {
  buildCreateConfigTransaction,
  buildCreatePoolWithFirstBuyTransaction,
  buildSwapTransaction,
  getLivePoolState,
  getOnchainSwapQuote,
} from "../../packages/meteora-adapter/src/index.js";
import type { MarketProfile, TokenizedAsset } from "../../packages/shared/src/index.js";

/**
 * Real, end-to-end integration test against Solana devnet — no mocks.
 * Funds a fresh keypair, sends and confirms the real `createConfig`
 * transaction, then (only once that's confirmed — Meteora's
 * `createPoolWithFirstBuy` reads the config account back from chain to
 * build the pool instruction, so these two steps cannot be built
 * upfront the way `createConfig` alone can) sends and confirms the real
 * `createPoolWithFirstBuy` transaction, then reads the live pool state
 * and a live swap quote back from chain.
 *
 * Skips gracefully — never fails the suite — when devnet or its faucet is
 * unreachable from this environment, per product spec: infra the runner
 * doesn't control shouldn't block CI, but nothing here is faked.
 */
const RPC_URL = process.env.SOLANA_RPC_URL ?? "https://api.devnet.solana.com";
const TEST_TIMEOUT_MS = 90_000;

let devnetReachable = false;

beforeAll(async () => {
  try {
    const connection = new Connection(RPC_URL, "confirmed");
    await connection.getLatestBlockhash();
    devnetReachable = true;
  } catch {
    devnetReachable = false;
  }
}, 15_000);

const asset: TokenizedAsset = {
  id: "asset-1",
  name: "Acme Pre-IPO",
  symbol: "ACME",
  mintAddress: "So11111111111111111111111111111111111111112",
  issuer: "Acme Corp",
  assetType: "pre_ipo",
  referencePriceUsd: 10,
  source: "manual",
  createdAt: new Date().toISOString(),
};

const profile: MarketProfile = {
  id: "profile-1",
  assetId: "asset-1",
  initialLiquidityUsd: 250_000,
  expectedVolatility: "medium",
  riskProfile: "balanced",
  targetLiquidityUsd: 500_000,
  targetGraduationUsd: 1_000_000,
  quoteToken: "SOL", // avoids needing a funded USDC token account for the first buy
  createdAt: new Date().toISOString(),
};

describe("Meteora DBC adapter (live devnet, real transactions)", () => {
  it("deploys a real config + pool, then reads live state and a live quote back from chain", async () => {
    if (!devnetReachable) {
      console.warn(`Skipping: devnet RPC (${RPC_URL}) is unreachable from this environment.`);
      return;
    }

    const connection = new Connection(RPC_URL, "confirmed");

    // Prefer a pre-funded keypair (TEST_FUNDED_KEYPAIR_SECRET, a base58
    // secret key) when available — the public devnet airdrop faucet is
    // aggressively rate-limited per source IP and routinely exhausted in
    // shared/CI environments, which is an infra limitation, not a defect
    // in this test or the code it exercises.
    const fundedSecret = process.env.TEST_FUNDED_KEYPAIR_SECRET;
    const payer = fundedSecret ? Keypair.fromSecretKey(bs58.decode(fundedSecret)) : Keypair.generate();

    if (!fundedSecret) {
      try {
        const airdropSig = await connection.requestAirdrop(payer.publicKey, 2_000_000_000);
        await connection.confirmTransaction(airdropSig, "confirmed");
      } catch (error) {
        console.warn(`Skipping: devnet faucet unavailable (${(error as Error).message}). Set TEST_FUNDED_KEYPAIR_SECRET to run this test with a pre-funded devnet wallet instead.`);
        return;
      }
    }

    const balance = await connection.getBalance(payer.publicKey);
    if (balance < 100_000_000) {
      console.warn(`Skipping: payer balance (${balance} lamports) is too low to cover this test's transactions.`);
      return;
    }

    const candidate = compileCurveCandidates(asset, profile).find((c) => c.riskProfile === "balanced")!;

    // --- Step 1: create config, for real ---
    const configResult = await buildCreateConfigTransaction({
      connection,
      candidate,
      profile,
      payer: payer.publicKey,
      feeClaimer: payer.publicKey,
      rpcUrl: RPC_URL,
    });
    expect(configResult.transaction.instructions.length).toBeGreaterThan(0);

    configResult.transaction.partialSign(payer);
    const configSig = await connection.sendRawTransaction(configResult.transaction.serialize());
    await connection.confirmTransaction(configSig, "confirmed");

    // --- Step 2: create pool + first buy, for real (needs step 1 confirmed on-chain) ---
    const poolResult = await buildCreatePoolWithFirstBuyTransaction({
      connection,
      config: configResult.configKeypair.publicKey,
      quoteMint: configResult.quoteMint,
      payer: payer.publicKey,
      poolCreator: payer.publicKey,
      name: asset.name,
      symbol: asset.symbol,
      metadataUri: "https://example.com/metadata.json",
      firstBuyAmountInQuoteLamports: new BN(10_000_000), // 0.01 SOL
    });
    expect(poolResult.transaction.instructions.length).toBeGreaterThan(0);

    poolResult.transaction.partialSign(payer);
    const poolSig = await connection.sendRawTransaction(poolResult.transaction.serialize());
    await connection.confirmTransaction(poolSig, "confirmed");

    // --- Step 3: read real on-chain pool state back ---
    const liveState = await getLivePoolState(connection, poolResult.poolAddress);
    expect(liveState).not.toBeNull();
    expect(liveState!.poolAddress).toBe(poolResult.poolAddress.toBase58());
    expect(Number(liveState!.quoteReserveRaw)).toBeGreaterThan(0); // the first buy landed

    // --- Step 4: a real quote against the now-live pool ---
    const quote = await getOnchainSwapQuote(connection, poolResult.poolAddress, new BN(1_000_000), false);
    expect(quote).not.toBeNull();
    expect(quote!.outputAmount.gtn(0)).toBe(true);

    // --- Step 5: a real swap, for real — the same builder the Trade panel calls (POST /api/dbc/:poolAddress/swap) ---
    const { transaction: swapTransaction } = await buildSwapTransaction({
      connection,
      poolAddress: poolResult.poolAddress,
      owner: payer.publicKey,
      amountIn: new BN(1_000_000),
      minimumAmountOut: quote!.outputAmount.mul(new BN(99)).div(new BN(100)), // 1% slippage tolerance
      swapBaseForQuote: false,
    });
    expect(swapTransaction.instructions.length).toBeGreaterThan(0);

    swapTransaction.recentBlockhash = (await connection.getLatestBlockhash("confirmed")).blockhash;
    swapTransaction.feePayer = payer.publicKey;
    swapTransaction.partialSign(payer);
    const swapSig = await connection.sendRawTransaction(swapTransaction.serialize());
    await connection.confirmTransaction(swapSig, "confirmed");

    const postSwapState = await getLivePoolState(connection, poolResult.poolAddress);
    expect(postSwapState).not.toBeNull();
    expect(Number(postSwapState!.baseReserveRaw)).toBeGreaterThan(0); // the swap moved real base-token reserve
  }, TEST_TIMEOUT_MS);
});
