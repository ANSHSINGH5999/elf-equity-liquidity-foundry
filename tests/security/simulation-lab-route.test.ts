import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { prisma, Prisma } from "../../packages/db/src/index.js";
import { compileCurveCandidates } from "../../packages/market-engine/src/index.js";
import { GET as getContext, POST as postLab } from "../../apps/web/src/app/api/markets/simulation-lab/route.js";

/**
 * Simulation Lab route: strict input validation, no client-supplied curve
 * parameters, no database writes (results are session-scoped on the client),
 * and no secret leakage. Real Postgres + real compiler/engine.
 */
let dbAvailable = false;
const ids = { assets: [] as string[], profiles: [] as string[], curves: [] as string[] };
let balancedId = "";
let growthId = "";

const post = (body: unknown, raw = false) =>
  postLab(new Request("http://localhost/api/markets/simulation-lab", { method: "POST", body: raw ? (body as string) : JSON.stringify(body) }));
const get = (query: string) => getContext(new Request(`http://localhost/api/markets/simulation-lab${query}`));

beforeAll(async () => {
  try { await prisma.$queryRaw`SELECT 1`; dbAvailable = true; } catch { dbAvailable = false; return; }
  const asset = await prisma.asset.create({
    data: { name: "Lab Asset", symbol: "LABX", mintAddress: "So11111111111111111111111111111111111111112", issuer: "Test Issuer", assetType: "pre_ipo", referencePriceUsd: 10, source: "manual" },
  });
  const profile = await prisma.marketProfile.create({
    data: { assetId: asset.id, initialLiquidityUsd: 250_000, expectedVolatility: "medium", riskProfile: "balanced", targetLiquidityUsd: 500_000, targetGraduationUsd: 1_000_000, quoteToken: "USDC" },
  });
  ids.assets.push(asset.id); ids.profiles.push(profile.id);
  for (const c of compileCurveCandidates({ ...asset, createdAt: asset.createdAt.toISOString() } as any, { ...profile, createdAt: profile.createdAt.toISOString() } as any)) {
    const row = await prisma.curveConfig.create({
      data: {
        assetId: asset.id, marketProfileId: profile.id, riskProfile: c.riskProfile, label: c.label, rationale: c.rationale,
        initialMarketCapUsd: c.initialMarketCapUsd, migrationMarketCapUsd: c.migrationMarketCapUsd, tokenSupply: c.tokenSupply, tokenBaseDecimals: c.tokenBaseDecimals,
        feeSchedule: c.feeSchedule as unknown as Prisma.InputJsonValue, migration: c.migration as unknown as Prisma.InputJsonValue,
        liquidityDistribution: c.liquidityDistribution as unknown as Prisma.InputJsonValue, score: c.score as unknown as Prisma.InputJsonValue, isRecommended: c.isRecommended,
      },
    });
    ids.curves.push(row.id);
    if (c.riskProfile === "balanced") balancedId = row.id;
    if (c.riskProfile === "growth") growthId = row.id;
  }
}, 60_000);

afterAll(async () => {
  if (!dbAvailable) return;
  await prisma.curveConfig.deleteMany({ where: { id: { in: ids.curves } } });
  await prisma.marketProfile.deleteMany({ where: { id: { in: ids.profiles } } });
  await prisma.asset.deleteMany({ where: { id: { in: ids.assets } } });
});

describe("POST /api/markets/simulation-lab — validation (no database needed)", () => {
  it.each([
    ["malformed JSON", "{not json", true],
    ["missing everything", {}],
    ["unsupported scenario (volume increase)", { curveCandidateId: "x", scenario: "volume_increase" }],
    ["unsupported scenario (liquidity change)", { curveCandidateId: "x", scenario: "liquidity_change" }],
    ["curve position above the cap", { curveCandidateId: "x", scenario: "normal_demand", curveProgressPct: 96 }],
    ["negative curve position", { curveCandidateId: "x", scenario: "normal_demand", curveProgressPct: -1 }],
    ["non-numeric curve position", { curveCandidateId: "x", scenario: "normal_demand", curveProgressPct: "50" }],
    ["wrong number of sides", { curveCandidateId: "x", scenario: "normal_demand", sides: ["buy"] }],
    ["invalid side", { curveCandidateId: "x", scenario: "normal_demand", sides: ["buy", "buy", "buy", "hold"] }],
    ["client-supplied curve parameters", { curveCandidateId: "x", scenario: "normal_demand", curve: [{ sqrtPrice: "1" }] }],
    ["client-supplied liquidity", { curveCandidateId: "x", scenario: "normal_demand", initialLiquidityUsd: 1 }],
    ["oversized id", { curveCandidateId: "x".repeat(65), scenario: "normal_demand" }],
  ])("400 for %s", async (_name, body, raw) => {
    const res = await post(body, raw === true);
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error.code).toBe("validation_error");
    expect(json.error.requestId).toBeTruthy();
  });

  it("GET requires a bounded curveCandidateId", async () => {
    expect((await get("")).status).toBe(400);
    expect((await get(`?curveCandidateId=${"x".repeat(65)}`)).status).toBe(400);
  });
});

describe("POST /api/markets/simulation-lab — with a stored configuration", () => {
  it("404 for an unknown curve config", async () => {
    if (!dbAvailable) return;
    expect((await post({ curveCandidateId: "does-not-exist", scenario: "normal_demand" })).status).toBe(404);
    expect((await get("?curveCandidateId=does-not-exist")).status).toBe(404);
  });

  it("GET lists the sibling configurations of the same profile", async () => {
    if (!dbAvailable) return;
    const json = await (await get(`?curveCandidateId=${balancedId}`)).json();
    expect(json.asset).toEqual({ name: "Lab Asset", symbol: "LABX" });
    expect(json.candidates.map((c: any) => c.riskProfile).sort()).toEqual(["balanced", "conservative", "growth"]);
    expect(json.selectedId).toBe(balancedId);
  });

  it("runs the engine off-chain: labelled result, real values, and NO database writes (scoped to this test's own rows, so parallel files can't interfere)", async () => {
    if (!dbAvailable) return;
    const mine = async () => ({ runs: await prisma.simulationRun.count({ where: { curveConfigId: { in: ids.curves } } }), launches: await prisma.launch.count({ where: { curveConfigId: { in: ids.curves } } }), curves: await prisma.curveConfig.count({ where: { id: { in: ids.curves } } }), profiles: await prisma.marketProfile.count({ where: { id: { in: ids.profiles } } }) });
    const before = await mine();
    const res = await post({ curveCandidateId: balancedId, scenario: "strong_sell_pressure" });
    expect(res.status).toBe(200);
    const run = await res.json();
    expect(run.label).toBe("SIMULATION — OFF-CHAIN");
    expect(run.result.label).toBe("SIMULATED");
    expect(run.scenario).toBe("strong_sell_pressure");
    expect(run.curveCandidateId).toBe(balancedId);
    expect(run.result.trades).toHaveLength(4);
    expect(run.result.trades.every((t: any) => t.side === "sell" && t.label === "SIMULATED")).toBe(true);
    expect(run.graduation.label).toBe("SIMULATED GRADUATION STATE");
    expect(run.checks.find((c: any) => c.id === "configuration").status).toBe("pass");
    expect(run.checks.find((c: any) => c.id === "live_indicators").status).toBe("unavailable");
    const after = await mine();
    expect(after).toEqual(before);
  });

  it("applies validated overrides and reports them back", async () => {
    if (!dbAvailable) return;
    const run = await (await post({ curveCandidateId: balancedId, scenario: "normal_demand", curveProgressPct: 40, sides: ["sell", "buy", "sell", "buy"] })).json();
    expect(run.parameters).toEqual({ curveProgressFraction: 0.4, sides: ["sell", "buy", "sell", "buy"], customised: true });
  });

  it("reports the real Meteora rejection of the Growth candidate as a failed check, while still simulating", async () => {
    if (!dbAvailable) return;
    const run = await (await post({ curveCandidateId: growthId, scenario: "normal_demand" })).json();
    expect(run.checks.find((c: any) => c.id === "configuration").status).toBe("fail");
    expect(run.checks.find((c: any) => c.id === "simulation_output").status).toBe("pass");
  });

  it("never serializes keypair secrets or database rows", async () => {
    if (!dbAvailable) return;
    const text = JSON.stringify(await (await post({ curveCandidateId: balancedId, scenario: "normal_demand" })).json());
    expect(text).not.toMatch(/secretKey|privateKey|seed|mnemonic|baseMintKeypair|configKeypair|PYTH_API_KEY|DATABASE_URL/i);
    expect(text).not.toContain("marketProfileId");
  });
});

// Last on purpose: it exhausts the in-memory limiter for this client key.
describe("POST /api/markets/simulation-lab — rate limiting", () => {
  it("is rate-limited", async () => {
    const statuses: number[] = [];
    for (let i = 0; i < 40; i++) statuses.push((await post({})).status);
    expect(statuses).toContain(429);
  });
});
