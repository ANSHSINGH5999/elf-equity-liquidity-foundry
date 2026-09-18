import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";
import { prisma } from "../../packages/db/src/index.js";
import { GET as getPools } from "../../apps/web/src/app/api/pools/route.js";
import { GET as getLaunchById } from "../../apps/web/src/app/api/launches/[id]/route.js";

/**
 * HIGH-2 regression test (security remediation): GET /api/pools must
 * never serialize Launch.baseMintKeypairSecret or Launch.configKeypairSecret.
 * Also covers the /api/launches/[id] resumability endpoint, which handles
 * the same model and already had the correct `select` pattern before this
 * remediation — kept here as a sibling assertion so both stay in sync if
 * the schema changes. See docs/security-remediation.md.
 */
const FAKE_BASE_SECRET = "THIS_IS_A_FAKE_TEST_SECRET_NOT_A_REAL_KEY_bmks";
const FAKE_CONFIG_SECRET = "THIS_IS_A_FAKE_TEST_SECRET_NOT_A_REAL_KEY_cks";
const SECRET_FIELD_NAMES = ["baseMintKeypairSecret", "configKeypairSecret"];

let dbAvailable = false;
let assetId = "";
let marketProfileId = "";
let curveConfigId = "";
const launchId = "test-secret-exposure-launch";

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
      name: "Secret Exposure Test Asset",
      symbol: "SETA",
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
});

afterEach(async () => {
  if (!dbAvailable) return;
  await prisma.launch.deleteMany({ where: { id: launchId } });
});

afterAll(async () => {
  if (!dbAvailable) return;
  await prisma.launch.deleteMany({ where: { id: launchId } });
  await prisma.curveConfig.deleteMany({ where: { id: curveConfigId } });
  await prisma.marketProfile.deleteMany({ where: { id: marketProfileId } });
  await prisma.asset.deleteMany({ where: { id: assetId } });
});

describe("GET /api/pools never leaks Launch secret columns (HIGH-2)", () => {
  it("excludes baseMintKeypairSecret / configKeypairSecret even when they're set on a live row", async () => {
    if (!dbAvailable) return;

    await prisma.launch.create({
      data: {
        id: launchId,
        assetId,
        marketProfileId,
        curveConfigId,
        poolAddress: "FakePoolAddressForTest11111111111111111111",
        baseMintKeypairSecret: FAKE_BASE_SECRET,
        configKeypairSecret: FAKE_CONFIG_SECRET,
        status: "live",
        stage: "LIVE",
        ownerWallet: "FakeOwnerWallet1111111111111111111111111",
      },
    });

    const response = await getPools();
    expect(response.status).toBe(200);
    const body = await response.json();
    const raw = JSON.stringify(body);

    // The strongest possible assertion: the literal secret values must not
    // appear anywhere in the serialized payload, not just "under a field
    // named X" — this also catches an accidental spread elsewhere.
    expect(raw).not.toContain(FAKE_BASE_SECRET);
    expect(raw).not.toContain(FAKE_CONFIG_SECRET);

    const entry = body.pools.find((p: { launch: { id: string } }) => p.launch.id === launchId);
    expect(entry).toBeTruthy();
    for (const field of SECRET_FIELD_NAMES) {
      expect(Object.keys(entry.launch)).not.toContain(field);
    }
  });
});

describe("GET /api/launches/[id] never leaks Launch secret columns", () => {
  it("excludes baseMintKeypairSecret / configKeypairSecret from the resumability response", async () => {
    if (!dbAvailable) return;

    await prisma.launch.create({
      data: {
        id: launchId,
        assetId,
        marketProfileId,
        curveConfigId,
        configAddress: "FakeConfigAddress111111111111111111111111",
        baseMintKeypairSecret: FAKE_BASE_SECRET,
        configKeypairSecret: FAKE_CONFIG_SECRET,
        status: "pending_deployment",
        stage: "AWAITING_CONFIG_SIGNATURE",
        ownerWallet: "FakeOwnerWallet1111111111111111111111111",
      },
    });

    const response = await getLaunchById(new Request(`http://localhost/api/launches/${launchId}`), {
      params: Promise.resolve({ id: launchId }),
    });
    expect(response.status).toBe(200);
    const body = await response.json();
    const raw = JSON.stringify(body);

    expect(raw).not.toContain(FAKE_BASE_SECRET);
    expect(raw).not.toContain(FAKE_CONFIG_SECRET);
    for (const field of SECRET_FIELD_NAMES) {
      expect(Object.keys(body.launch)).not.toContain(field);
    }
  });
});
