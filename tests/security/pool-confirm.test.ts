import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { Keypair } from "@solana/web3.js";
import { prisma } from "../../packages/db/src/index.js";
import { POST as confirmPool } from "../../apps/web/src/app/api/dbc/pool/confirm/route.js";

/**
 * POST /api/dbc/pool/confirm moves a launch to LIVE only from on-chain truth. These cases need no RPC: they cover
 * the guards that run before the chain is consulted. (The on-chain path was verified against real Devnet pools.)
 */
const NEW_LAUNCH = "test-pool-confirm-no-pool";
const LIVE_LAUNCH = "test-pool-confirm-live";
let dbAvailable = false;
let assetId = "";
let marketProfileId = "";
const curveConfigIds: string[] = [];

const post = (body: unknown) =>
  confirmPool(new Request("http://localhost/api/dbc/pool/confirm", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) }));

beforeAll(async () => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    dbAvailable = true;
  } catch {
    return;
  }
  const asset = await prisma.asset.create({ data: { name: "Pool Confirm Test", symbol: "PCNF", mintAddress: Keypair.generate().publicKey.toBase58(), issuer: "Test", assetType: "pre_ipo", referencePriceUsd: 10, source: "manual" } });
  assetId = asset.id;
  const profile = await prisma.marketProfile.create({ data: { assetId, initialLiquidityUsd: 1, expectedVolatility: "medium", riskProfile: "balanced", targetLiquidityUsd: 2, targetGraduationUsd: 3, quoteToken: "USDC" } });
  marketProfileId = profile.id;
  const curve = () => prisma.curveConfig.create({ data: { assetId, marketProfileId, riskProfile: "balanced", label: "B", rationale: "t", initialMarketCapUsd: 1, migrationMarketCapUsd: 2, tokenSupply: 1, tokenBaseDecimals: 9, feeSchedule: {}, migration: {}, liquidityDistribution: {}, score: {} } });
  const [c1, c2] = [await curve(), await curve()];
  curveConfigIds.push(c1.id, c2.id);
  const base = { assetId, marketProfileId, ownerWallet: "TestOwner" };
  await prisma.launch.create({ data: { ...base, curveConfigId: c1.id, id: NEW_LAUNCH, status: "pending_deployment", stage: "CONFIG_CREATED" } });
  await prisma.launch.create({ data: { ...base, curveConfigId: c2.id, id: LIVE_LAUNCH, status: "live", stage: "LIVE" } });
});

afterAll(async () => {
  if (!dbAvailable) return;
  await prisma.launch.deleteMany({ where: { id: { in: [NEW_LAUNCH, LIVE_LAUNCH] } } });
  await prisma.curveConfig.deleteMany({ where: { id: { in: curveConfigIds } } });
  await prisma.marketProfile.deleteMany({ where: { id: marketProfileId } });
  await prisma.asset.deleteMany({ where: { id: assetId } });
});

describe("POST /api/dbc/pool/confirm guards", () => {
  it("rejects a malformed body", async () => {
    expect((await post({})).status).toBe(400);
    expect((await post({ launchId: 5 })).status).toBe(400);
  });

  it("404s an unknown launch", async () => {
    if (!dbAvailable) return;
    expect((await post({ launchId: "does-not-exist-confirm" })).status).toBe(404);
  });

  it("refuses to advance a launch that has no pool recorded", async () => {
    if (!dbAvailable) return;
    const res = await post({ launchId: NEW_LAUNCH });
    expect(res.status).toBe(409);
    expect((await prisma.launch.findUnique({ where: { id: NEW_LAUNCH } }))!.stage).toBe("CONFIG_CREATED");
  });

  it("is idempotent for a launch that is already LIVE", async () => {
    if (!dbAvailable) return;
    const res = await post({ launchId: LIVE_LAUNCH });
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ stage: "LIVE" });
  });
});
