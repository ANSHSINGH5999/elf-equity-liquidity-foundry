import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { prisma, expireStaleLaunchSecrets } from "../../packages/db/src/index.js";

/**
 * LOW-5 regression test (security remediation): abandoned launches
 * (never reached LIVE) have their ephemeral keypair secrets cleared once
 * stale; fresh in-progress launches and already-live launches are left
 * alone. See docs/security-remediation.md.
 */
let dbAvailable = false;
let assetId = "";
let marketProfileId = "";

const STALE_ID = "test-lifecycle-stale";
const FRESH_ID = "test-lifecycle-fresh";
const LIVE_ID = "test-lifecycle-live";
const ALL_IDS = [STALE_ID, FRESH_ID, LIVE_ID];

async function makeCurveConfig(riskProfile: "conservative" | "balanced" | "growth") {
  return prisma.curveConfig.create({
    data: {
      assetId,
      marketProfileId,
      riskProfile,
      label: riskProfile,
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
}

beforeAll(async () => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    dbAvailable = true;
  } catch {
    dbAvailable = false;
    return;
  }

  const asset = await prisma.asset.create({
    data: {
      name: "Lifecycle Test Asset",
      symbol: "LTA",
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

  const [ccStale, ccFresh, ccLive] = await Promise.all([
    makeCurveConfig("conservative"),
    makeCurveConfig("balanced"),
    makeCurveConfig("growth"),
  ]);

  const THIRTY_HOURS_AGO = new Date(Date.now() - 30 * 60 * 60 * 1000);
  const ONE_HOUR_AGO = new Date(Date.now() - 60 * 60 * 1000);

  await Promise.all([
    // Abandoned, stale: stuck AWAITING_CONFIG_SIGNATURE for 30 hours — should be cleared.
    prisma.launch.create({
      data: {
        id: STALE_ID,
        assetId,
        marketProfileId,
        curveConfigId: ccStale.id,
        status: "pending_deployment",
        stage: "AWAITING_CONFIG_SIGNATURE",
        configKeypairSecret: "fake-stale-config-secret",
        ownerWallet: "FakeOwnerWallet1111111111111111111111111",
        updatedAt: THIRTY_HOURS_AGO,
      },
    }),
    // In-progress, recent: same stage, but touched an hour ago — must NOT be cleared.
    prisma.launch.create({
      data: {
        id: FRESH_ID,
        assetId,
        marketProfileId,
        curveConfigId: ccFresh.id,
        status: "pending_deployment",
        stage: "AWAITING_CONFIG_SIGNATURE",
        configKeypairSecret: "fake-fresh-config-secret",
        ownerWallet: "FakeOwnerWallet1111111111111111111111111",
        updatedAt: ONE_HOUR_AGO,
      },
    }),
    // Live and stale by time, but already has no secrets to clear (the
    // normal on-chain-confirmed clearing path already ran) — confirms
    // this is a genuine no-op for a healthy live launch, not just
    // "stage is excluded".
    prisma.launch.create({
      data: {
        id: LIVE_ID,
        assetId,
        marketProfileId,
        curveConfigId: ccLive.id,
        status: "live",
        stage: "LIVE",
        configKeypairSecret: null,
        baseMintKeypairSecret: null,
        ownerWallet: "FakeOwnerWallet1111111111111111111111111",
        updatedAt: THIRTY_HOURS_AGO,
      },
    }),
  ]);
});

afterAll(async () => {
  if (!dbAvailable) return;
  await prisma.launch.deleteMany({ where: { id: { in: ALL_IDS } } });
  await prisma.curveConfig.deleteMany({ where: { marketProfileId } });
  await prisma.marketProfile.deleteMany({ where: { id: marketProfileId } });
  await prisma.asset.deleteMany({ where: { id: assetId } });
});

describe("expireStaleLaunchSecrets (LOW-5)", () => {
  it("clears secrets on a stale, abandoned launch but leaves fresh/live launches alone", async () => {
    if (!dbAvailable) return;

    const result = await expireStaleLaunchSecrets(prisma, 24 * 60 * 60 * 1000);
    expect(result.expiredCount).toBeGreaterThanOrEqual(1);

    const stale = await prisma.launch.findUniqueOrThrow({ where: { id: STALE_ID } });
    expect(stale.configKeypairSecret).toBeNull();

    const fresh = await prisma.launch.findUniqueOrThrow({ where: { id: FRESH_ID } });
    expect(fresh.configKeypairSecret).toBe("fake-fresh-config-secret");

    const live = await prisma.launch.findUniqueOrThrow({ where: { id: LIVE_ID } });
    expect(live.configKeypairSecret).toBeNull();
    expect(live.baseMintKeypairSecret).toBeNull();
  });

  it("is idempotent — running it again finds nothing left to expire for the same rows", async () => {
    if (!dbAvailable) return;
    const result = await expireStaleLaunchSecrets(prisma, 24 * 60 * 60 * 1000);
    expect(result.expiredCount).toBe(0);
  });
});
