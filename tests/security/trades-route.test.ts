import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { prisma } from "../../packages/db/src/index.js";
import { GET as getTrades } from "../../apps/web/src/app/api/markets/[id]/trades/route.js";
import { GET as getRisk } from "../../apps/web/src/app/api/markets/[id]/risk/route.js";

/**
 * GET /api/markets/:id/trades serializes data derived from the Launch row
 * (pool, token, quote token) and now feeds the transaction explorer. Like
 * every route that touches Launch, it must never surface keypair secrets —
 * asserted on the literal secret VALUES, not just field names, so an
 * accidental spread anywhere in the payload is caught. Also covers the
 * explorer contract (real signature, status, no fabricated fields) and
 * input validation. The risk route shares the same guarantees for the 404
 * and validation paths (its 200 path needs a live on-chain pool).
 */
const FAKE_BASE_SECRET = "FAKE_TEST_SECRET_NOT_A_REAL_KEY_trades_bmks";
const FAKE_CONFIG_SECRET = "FAKE_TEST_SECRET_NOT_A_REAL_KEY_trades_cks";
const launchId = "test-trades-route-launch";
const poolAddress = "TradesRoutePoo1AnAiyEuUmZ2wDgTNv67vhqZ8pmKK";
const SIGNATURE = "test-sig-trades-route-1";

let dbAvailable = false;
let assetId = "";
let marketProfileId = "";
let curveConfigId = "";

const call = (handler: typeof getTrades, id: string, query = "") =>
  handler(new Request(`http://localhost/api/markets/${id}/trades${query}`), { params: Promise.resolve({ id }) });

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
      name: "Trades Route Asset",
      symbol: "TRTA",
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
  const curve = await prisma.curveConfig.create({
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
  curveConfigId = curve.id;

  await prisma.launch.create({
    data: {
      id: launchId,
      assetId,
      marketProfileId,
      curveConfigId,
      poolAddress,
      baseMintKeypairSecret: FAKE_BASE_SECRET,
      configKeypairSecret: FAKE_CONFIG_SECRET,
      status: "live",
      stage: "LIVE",
      ownerWallet: "FakeOwnerWallet1111111111111111111111111",
    },
  });
  await prisma.trade.create({
    data: {
      marketId: launchId,
      signature: SIGNATURE,
      trader: "TraderWallet1111111111111111111111111111",
      side: "buy",
      tokenAmount: 10,
      quoteAmount: 100,
      priceUsd: 10,
      timestamp: new Date(),
    },
  });
}, 30_000);

afterAll(async () => {
  if (!dbAvailable) return;
  await prisma.trade.deleteMany({ where: { marketId: launchId } });
  await prisma.launch.deleteMany({ where: { id: launchId } });
  await prisma.curveConfig.deleteMany({ where: { id: curveConfigId } });
  await prisma.marketProfile.deleteMany({ where: { id: marketProfileId } });
  await prisma.asset.deleteMany({ where: { id: assetId } });
});

describe("GET /api/markets/[id]/trades (transaction explorer contract)", () => {
  it("never leaks Launch secret values anywhere in the payload", async () => {
    if (!dbAvailable) return;
    const response = await call(getTrades, launchId);
    expect(response.status).toBe(200);
    const raw = JSON.stringify(await response.json());
    expect(raw).not.toContain(FAKE_BASE_SECRET);
    expect(raw).not.toContain(FAKE_CONFIG_SECRET);
    expect(raw).not.toContain("baseMintKeypairSecret");
    expect(raw).not.toContain("configKeypairSecret");
    expect(raw).not.toContain("ownerWallet");
  });

  it("returns the real indexed signature plus pool/token identity, and marks indexed rows confirmed", async () => {
    if (!dbAvailable) return;
    const body = await (await call(getTrades, launchId)).json();
    expect(body.poolAddress).toBe(poolAddress);
    expect(body.tokenSymbol).toBe("TRTA");
    expect(body.quoteToken).toBe("USDC");
    expect(body.trades).toHaveLength(1);
    expect(body.trades[0].signature).toBe(SIGNATURE);
    expect(body.trades[0].side).toBe("buy");
    expect(body.trades[0].status).toBe("confirmed");
    expect(body.trades[0].source).toBe("INDEXED");
  });

  it("returns an empty list (not an error, not fabricated rows) for a market with no trades", async () => {
    if (!dbAvailable) return;
    await prisma.trade.deleteMany({ where: { marketId: launchId } });
    const response = await call(getTrades, launchId);
    expect(response.status).toBe(200);
    expect((await response.json()).trades).toEqual([]);
    await prisma.trade.create({
      data: {
        marketId: launchId,
        signature: SIGNATURE,
        trader: "TraderWallet1111111111111111111111111111",
        side: "buy",
        tokenAmount: 10,
        quoteAmount: 100,
        priceUsd: 10,
        timestamp: new Date(),
      },
    });
  });

  it("404s an unknown market without leaking anything", async () => {
    if (!dbAvailable) return;
    const response = await call(getTrades, "no-such-market");
    expect(response.status).toBe(404);
    const raw = JSON.stringify(await response.json());
    expect(raw).not.toContain(FAKE_BASE_SECRET);
  });

  it("rejects malformed limit values with a 400", async () => {
    if (!dbAvailable) return;
    for (const bad of ["0", "-1", "1.5", "abc", "101"]) {
      const response = await call(getTrades, launchId, `?limit=${bad}`);
      expect(response.status).toBe(400);
    }
  });
});

describe("GET /api/markets/[id]/risk", () => {
  it("404s an unknown market", async () => {
    if (!dbAvailable) return;
    const response = await getRisk(new Request("http://localhost/api/markets/none/risk"), {
      params: Promise.resolve({ id: "no-such-market-risk" }),
    });
    expect(response.status).toBe(404);
  });
});

import { POST as postAnalyze } from "../../apps/web/src/app/api/markets/[id]/analyze/route.js";

describe("POST /api/markets/[id]/analyze", () => {
  it("404s an unknown market", async () => {
    if (!dbAvailable) return;
    const response = await postAnalyze(new Request("http://localhost/api/markets/none/analyze", { method: "POST" }), {
      params: Promise.resolve({ id: "no-such-market-analyze" }),
    });
    expect(response.status).toBe(404);
  });

  it("does not echo request-supplied data — the analyst reads the market itself, never the body", async () => {
    if (!dbAvailable) return;
    const response = await postAnalyze(
      new Request("http://localhost/api/markets/x/analyze", { method: "POST", body: JSON.stringify({ liquidityUsd: 1e12, secret: FAKE_BASE_SECRET }) }),
      { params: Promise.resolve({ id: "no-such-market-analyze-2" }) },
    );
    const raw = JSON.stringify(await response.json());
    expect(raw).not.toContain(FAKE_BASE_SECRET);
    expect(raw).not.toContain("1000000000000");
  });
});
