import { createRequire } from "node:module";
import { describe, expect, it } from "vitest";
import { Connection, Keypair, PublicKey } from "@solana/web3.js";
import { compileCurveCandidates } from "../../packages/market-engine/src/index.js";
import {
  SUPPLY_LEFTOVER_FRACTION,
  TransactionSimulationError,
  buildConfigParametersFromCandidate,
  buildCreateConfigTransaction,
  simulateBeforeSigning,
  supplyLeftoverTokens,
} from "../../packages/meteora-adapter/src/index.js";
import type { CurveCandidate, MarketProfile, TokenizedAsset } from "../../packages/shared/src/index.js";

/**
 * Regression tests for the real-devnet "AccountNotFound" investigation.
 *
 * Two independent root causes were proven on devnet:
 *  1. AccountNotFound: the connected wallet (fee payer) had no account on the
 *     cluster, so the runtime rejected the transaction before running any
 *     instruction. The simulation error now names the wallet to fund.
 *  2. InvalidTokenSupply (6020): the SDK sizes the curve to fill the supply
 *     with ZERO slack, and the deployed program demands slightly more. ELF now
 *     reserves a tiny `leftover`, so the supply has headroom.
 *
 * The offline tests run everywhere. The devnet tests only SIMULATE (nothing is
 * signed or sent) and skip when the cluster is unreachable. The "funded payer"
 * test needs a devnet account that already exists with SOL; supply its PUBLIC
 * key via TEST_FUNDED_PUBKEY (no secret is needed to simulate).
 */
const RPC = process.env.SOLANA_RPC_URL ?? "https://api.devnet.solana.com";
const sdk: any = createRequire(new URL("../../packages/meteora-adapter/package.json", import.meta.url).pathname)("@meteora-ag/dynamic-bonding-curve-sdk");
const Decimal: any = createRequire(new URL("../../packages/meteora-adapter/package.json", import.meta.url).pathname)("decimal.js");

const asset: TokenizedAsset = {
  id: "asset-1", name: "Acme Pre-IPO", symbol: "ACME", mintAddress: "So11111111111111111111111111111111111111112",
  issuer: "Acme Corp", assetType: "pre_ipo", referencePriceUsd: 10, source: "manual", createdAt: "2026-09-20T00:00:00.000Z",
};
const profile: MarketProfile = {
  id: "profile-1", assetId: "asset-1", initialLiquidityUsd: 250_000, expectedVolatility: "medium", riskProfile: "balanced",
  targetLiquidityUsd: 500_000, targetGraduationUsd: 1_000_000, quoteToken: "USDC", createdAt: "2026-09-20T00:00:00.000Z",
};
const deployable = () => compileCurveCandidates(asset, profile).filter((c) => c.riskProfile !== "growth");

async function reachable(connection: Connection): Promise<boolean> {
  try {
    await connection.getLatestBlockhash("confirmed");
    return true;
  } catch {
    return false;
  }
}

describe("token-supply headroom (offline)", () => {
  it("reserves one part per billion of the supply, rounded to the token's 9 decimals", () => {
    expect(SUPPLY_LEFTOVER_FRACTION).toBe(1e-9);
    expect(supplyLeftoverTokens(1_000_000)).toBe(0.001);
    expect(supplyLeftoverTokens(2_000_000_000)).toBe(2);
    expect(supplyLeftoverTokens(1_234_567)).toBe(0.001234567);
    expect(supplyLeftoverTokens(1_000_000)).toBeGreaterThan(0);
  });

  it.each([1_000_000, 5_000_000, 100_000_000, 2_000_000_000])(
    "the curve leaves strictly positive slack below preMigrationTokenSupply (was exactly 0) at supply %i",
    async (supply) => {
      for (const c of deployable()) {
        const candidate: CurveCandidate = { ...c, tokenSupply: supply };
        const p: any = await buildConfigParametersFromCandidate(candidate, profile);
        const sqrtMigration = sdk.getMigrationThresholdPrice(p.migrationQuoteThreshold, p.sqrtStartPrice, p.curve);
        const swapBase = sdk.getBaseTokenForSwap(p.sqrtStartPrice, sqrtMigration, p.curve);
        const migrationQuote = sdk.convertDecimalToBN(
          sdk.getMigrationQuoteAmountFromMigrationQuoteThreshold(new Decimal(p.migrationQuoteThreshold.toString()), p.migrationFee.feePercentage),
        );
        const migrationBase = sdk.getMigrationBaseToken(migrationQuote, sqrtMigration, p.migrationOption);
        const swapBuffer = sdk.getSwapAmountWithBuffer(swapBase, p.sqrtStartPrice, p.curve);
        const minWithBuffer = sdk.getTotalTokenSupply(swapBuffer, migrationBase, p.lockedVesting);
        const slack = p.tokenSupply.preMigrationTokenSupply.sub(minWithBuffer);
        // The shortfall the program was observed to demand is a few hundred raw units at 1M supply; the slack must dwarf it.
        expect(slack.gtn(1_000)).toBe(true);
      }
    },
  );
});

describe("createConfig simulation on the real cluster (simulation only — nothing signed or sent)", () => {
  it("an unfunded fee payer gets an actionable AccountNotFound naming the wallet", async () => {
    const connection = new Connection(RPC, "confirmed");
    if (!(await reachable(connection))) return console.warn("Skipping: cluster unreachable.");

    const payer = Keypair.generate().publicKey; // never funded, so it has no account on the cluster
    const candidate = deployable()[0]!;
    const { transaction, configKeypair } = await buildCreateConfigTransaction({ connection, candidate, profile, payer, feeClaimer: payer, rpcUrl: RPC });
    transaction.recentBlockhash = (await connection.getLatestBlockhash("confirmed")).blockhash;
    transaction.feePayer = payer;
    transaction.partialSign(configKeypair);

    const error = await simulateBeforeSigning(connection, transaction).then(
      () => null,
      (e: unknown) => e,
    );
    expect(error).toBeInstanceOf(TransactionSimulationError);
    const message = (error as Error).message;
    expect(message).toContain("AccountNotFound");
    expect(message).toContain(payer.toBase58());
    expect(message).toMatch(/Fund that wallet/);
  }, 60_000);

  const fundedPubkey = process.env.TEST_FUNDED_PUBKEY;
  it.each(["conservative", "balanced"] as const)(
    "a funded fee payer passes createConfig simulation for the %s candidate (needs TEST_FUNDED_PUBKEY)",
    async (riskProfile) => {
      if (!fundedPubkey) return console.warn("Skipping: set TEST_FUNDED_PUBKEY to an existing, funded devnet account (public key only).");
      const connection = new Connection(RPC, "confirmed");
      if (!(await reachable(connection))) return console.warn("Skipping: cluster unreachable.");
      const payer = new PublicKey(fundedPubkey);
      if ((await connection.getAccountInfo(payer, "confirmed")) === null) return console.warn("Skipping: TEST_FUNDED_PUBKEY has no account on this cluster.");

      const candidate = deployable().find((c) => c.riskProfile === riskProfile)!;
      const { transaction, configKeypair } = await buildCreateConfigTransaction({ connection, candidate, profile, payer, feeClaimer: payer, rpcUrl: RPC });
      transaction.recentBlockhash = (await connection.getLatestBlockhash("confirmed")).blockhash;
      transaction.feePayer = payer;
      transaction.partialSign(configKeypair);

      await expect(simulateBeforeSigning(connection, transaction)).resolves.toBeUndefined();
    },
    60_000,
  );
});
