import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { Keypair } from "@solana/web3.js";
import nacl from "tweetnacl";
import bs58 from "bs58";
import { prisma } from "../../packages/db/src/index.js";
import { buildOwnershipMessage } from "../../packages/solana/src/index.js";
import { POST as postConfig } from "../../apps/web/src/app/api/dbc/config/route.js";
import { startStubRpc, type StubRpc } from "../helpers/stubRpc.js";

/**
 * Regression test for duplicate/replayed deployment *requests* (as
 * opposed to replayed *signatures*, covered in ownership.test.ts): the
 * legitimate owner double-clicking, refreshing mid-flow, or retrying
 * after a timeout must still resolve to the already-confirmed cached
 * result — HIGH-1's ownership binding must not break the pre-existing
 * idempotency guarantee (`Launch.@@unique([curveConfigId])`, ELF V1
 * Phase 3) it now sits in front of. Each retry needs its own fresh
 * signature (a new timestamp) — HIGH-1's replay protection means the
 * exact same signature can't just be resent.
 */
// The config route verifies the cluster (genesis hash) before it does anything else. This test is about idempotency,
// not the network, so that handshake is answered locally: the guard still runs, and a busy public RPC cannot flake it.
let stubRpc: StubRpc | null = null;
const ORIGINAL_RPC = process.env.SOLANA_RPC_URL;
let dbAvailable = false;
let assetId = "";
let marketProfileId = "";
let curveConfigId = "";
const owner = Keypair.generate();
const LAUNCH_ID = "test-idempotency-launch";

function signFor(route: string, resourceId: string) {
  const timestamp = Date.now();
  const message = buildOwnershipMessage({ route, resourceId, payerPublicKey: owner.publicKey.toBase58(), timestamp });
  const signature = bs58.encode(nacl.sign.detached(new TextEncoder().encode(message), owner.secretKey));
  return { signature, authTimestamp: timestamp };
}

beforeAll(async () => {
  stubRpc = await startStubRpc({ genesisOf: "devnet" });
  process.env.SOLANA_RPC_URL = stubRpc.url;
  try {
    await prisma.$queryRaw`SELECT 1`;
    dbAvailable = true;
  } catch {
    dbAvailable = false;
    return;
  }

  const asset = await prisma.asset.create({
    data: {
      name: "Idempotency Test Asset",
      symbol: "ITA",
      mintAddress: "So11111111111111111111111111111111111111112",
      issuer: "Test Issuer",
      assetType: "pre_ipo",
      referencePriceUsd: 10,
      source: "manual",
    },
  });
  assetId = asset.id;

  const profile = await prisma.marketProfile.create({
    data: {
      assetId,
      initialLiquidityUsd: 250_000,
      expectedVolatility: "medium",
      riskProfile: "balanced",
      targetLiquidityUsd: 500_000,
      targetGraduationUsd: 1_000_000,
      quoteToken: "USDC",
    },
  });
  marketProfileId = profile.id;

  const curveConfig = await prisma.curveConfig.create({
    data: {
      assetId,
      marketProfileId,
      riskProfile: "balanced",
      label: "Balanced",
      rationale: "test",
      initialMarketCapUsd: 500_000,
      migrationMarketCapUsd: 4_000_000,
      tokenSupply: 1_000_000,
      tokenBaseDecimals: 9,
      feeSchedule: {},
      migration: {},
      liquidityDistribution: {},
      score: {},
    },
  });
  curveConfigId = curveConfig.id;

  // Already past the config step (a prior call confirmed on-chain) — the
  // route should short-circuit to the cached result, never rebuild or
  // resimulate anything.
  await prisma.launch.create({
    data: {
      id: LAUNCH_ID,
      assetId,
      marketProfileId,
      curveConfigId,
      configAddress: "FakeConfirmedConfigAddress11111111111111111",
      quoteMint: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
      status: "pending_deployment",
      stage: "CONFIG_CREATED",
      ownerWallet: owner.publicKey.toBase58(),
      lastAuthTimestamp: new Date(Date.now() - 60_000),
    },
  });
});

afterAll(async () => {
  await stubRpc?.close();
  if (ORIGINAL_RPC === undefined) delete process.env.SOLANA_RPC_URL;
  else process.env.SOLANA_RPC_URL = ORIGINAL_RPC;
  if (!dbAvailable) return;
  await prisma.launch.deleteMany({ where: { id: LAUNCH_ID } });
  await prisma.curveConfig.deleteMany({ where: { id: curveConfigId } });
  await prisma.marketProfile.deleteMany({ where: { id: marketProfileId } });
  await prisma.asset.deleteMany({ where: { id: assetId } });
});

describe("duplicate deployment requests remain idempotent after HIGH-1", () => {
  it("a retry from the SAME owner with a fresh signature returns the cached alreadyConfirmed result", async () => {
    if (!dbAvailable) return;

    const { signature, authTimestamp } = signFor("dbc/config", curveConfigId);
    const response = await postConfig(
      new Request("http://localhost/api/dbc/config", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          assetId,
          curveCandidateId: curveConfigId,
          payerPublicKey: owner.publicKey.toBase58(),
          feeClaimerPublicKey: owner.publicKey.toBase58(),
          signature,
          authTimestamp,
        }),
      }),
    );

    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.alreadyConfirmed).toBe(true);
    expect(body.launchId).toBe(LAUNCH_ID);
    expect(body.transactionBase64).toBeNull();
  });
});
