import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { Connection } from "@solana/web3.js";
import { prisma, Prisma } from "../../packages/db/src/index.js";
import { compileCurveCandidates } from "../../packages/market-engine/src/index.js";
import { buildConfigParametersFromCandidate } from "../../packages/meteora-adapter/src/index.js";
import { runSimulation } from "../../packages/simulation-engine/src/index.js";
import { POST as postLaunchPlan } from "../../apps/web/src/app/api/markets/launch-plan/route.js";

/**
 * Real Postgres, real compiler, real simulation, real Meteora validator. The
 * Pyth network calls are stubbed (inside this test only) to exercise the
 * restricted / no-feed states. Also proves the route is read-only and
 * non-deploying: it creates no Launch and no rows of any kind.
 */
const FAKE_SECRET = "FAKE_TEST_SECRET_NOT_A_REAL_KEY_launchplan";
let dbAvailable = false;
const ids = { assets: [] as string[], profiles: [] as string[], curves: [] as string[], runs: [] as string[] };
let balancedId = "";
let growthId = "";
let otherCurveId = "";
let balancedRunId = "";
let otherRunId = "";

const call = (body: unknown, raw = false) =>
  postLaunchPlan(new Request("http://localhost/api/markets/launch-plan", { method: "POST", body: raw ? (body as string) : JSON.stringify(body) }));

async function seed(symbol: string) {
  const asset = await prisma.asset.create({
    data: { name: `LP ${symbol}`, symbol, mintAddress: "So11111111111111111111111111111111111111112", issuer: "Test Issuer", assetType: "pre_ipo", referencePriceUsd: 10, source: "manual" },
  });
  const profile = await prisma.marketProfile.create({
    data: { assetId: asset.id, initialLiquidityUsd: 250_000, expectedVolatility: "medium", riskProfile: "balanced", targetLiquidityUsd: 500_000, targetGraduationUsd: 1_000_000, quoteToken: "USDC" },
  });
  const domainAsset: any = { ...asset, createdAt: asset.createdAt.toISOString() };
  const domainProfile: any = { ...profile, createdAt: profile.createdAt.toISOString() };
  const rows = [];
  for (const c of compileCurveCandidates(domainAsset, domainProfile)) {
    rows.push(
      await prisma.curveConfig.create({
        data: {
          assetId: asset.id, marketProfileId: profile.id, riskProfile: c.riskProfile, label: c.label, rationale: c.rationale,
          initialMarketCapUsd: c.initialMarketCapUsd, migrationMarketCapUsd: c.migrationMarketCapUsd, tokenSupply: c.tokenSupply, tokenBaseDecimals: c.tokenBaseDecimals,
          feeSchedule: c.feeSchedule as unknown as Prisma.InputJsonValue, migration: c.migration as unknown as Prisma.InputJsonValue,
          liquidityDistribution: c.liquidityDistribution as unknown as Prisma.InputJsonValue, score: c.score as unknown as Prisma.InputJsonValue, isRecommended: c.isRecommended,
        },
      }),
    );
  }
  ids.assets.push(asset.id); ids.profiles.push(profile.id); rows.forEach((r) => ids.curves.push(r.id));
  return { asset, profile, rows, domainProfile };
}

async function persistSimulation(curveRowId: string, candidateDomain: any, domainProfile: any) {
  const run = runSimulation({
    connection: new Connection("http://127.0.0.1:8899"), candidate: candidateDomain, profile: domainProfile,
    configParameters: await buildConfigParametersFromCandidate(candidateDomain, domainProfile), quoteUsdPrice: 1,
  });
  const saved = await prisma.simulationRun.create({ data: { curveConfigId: curveRowId, scenarios: run.scenarios as unknown as Prisma.InputJsonValue } });
  ids.runs.push(saved.id);
  return saved.id;
}

beforeAll(async () => {
  try { await prisma.$queryRaw`SELECT 1`; dbAvailable = true; } catch { dbAvailable = false; return; }

  const a = await seed("LPTA");
  const b = a.rows.find((r) => r.riskProfile === "balanced")!;
  balancedId = b.id;
  growthId = a.rows.find((r) => r.riskProfile === "growth")!.id;
  const balancedDomain = { ...b, feeSchedule: b.feeSchedule, migration: b.migration, liquidityDistribution: b.liquidityDistribution, score: b.score };
  balancedRunId = await persistSimulation(b.id, balancedDomain, a.domainProfile);

  const other = await seed("LPTB");
  const ob = other.rows.find((r) => r.riskProfile === "balanced")!;
  otherCurveId = ob.id;
  otherRunId = await persistSimulation(ob.id, { ...ob }, other.domainProfile);
}, 90_000);

afterEach(() => { vi.unstubAllGlobals(); delete process.env.PYTH_API_KEY; });

afterAll(async () => {
  if (!dbAvailable) return;
  await prisma.simulationRun.deleteMany({ where: { id: { in: ids.runs } } });
  await prisma.curveConfig.deleteMany({ where: { id: { in: ids.curves } } });
  await prisma.marketProfile.deleteMany({ where: { id: { in: ids.profiles } } });
  await prisma.asset.deleteMany({ where: { id: { in: ids.assets } } });
});

// Scoped to THIS test's own rows: the database is shared with the live app (a browser session may create rows at any moment),
// so global counts would be racy. A Launch/Pool for any of these curve configs would still be caught.
const counts = async () => {
  const mine = { in: ids.curves };
  return {
    launches: await prisma.launch.count({ where: { curveConfigId: mine } }),
    pools: await prisma.pool.count({ where: { launch: { curveConfigId: mine } } }),
    assets: await prisma.asset.count({ where: { id: { in: ids.assets } } }),
    profiles: await prisma.marketProfile.count({ where: { id: { in: ids.profiles } } }),
    curves: await prisma.curveConfig.count({ where: { id: mine } }),
    runs: await prisma.simulationRun.count({ where: { curveConfigId: mine } }),
  };
};

describe("POST /api/markets/launch-plan", () => {
  it("returns a plan built from the stored candidate, with the simulation not yet run", async () => {
    if (!dbAvailable) return;
    const res = await call({ curveCandidateId: balancedId });
    expect(res.status).toBe(200);
    const { plan } = await res.json();
    expect(plan.engine).toBe("elf-deterministic-launch-planner-v1");
    expect(plan.curve.candidateId).toBe(balancedId);
    expect(plan.asset.symbol).toBe("LPTA");
    expect(plan.simulation.status).toBe("not_run");
    expect(plan.checks.find((c: any) => c.id === "configuration").status).toBe("pass");
    expect(plan.checks.find((c: any) => c.id === "simulation").status).toBe("not_run");
  });

  it("with a real stored simulation: completed, labelled SIMULATED", async () => {
    if (!dbAvailable) return;
    const { plan } = await (await call({ curveCandidateId: balancedId, simulationRunId: balancedRunId })).json();
    expect(plan.simulation.status).toBe("completed");
    expect(plan.simulation.label).toBe("SIMULATED");
    expect(plan.simulation.scenarios).toHaveLength(6);
  });

  it("reports the REAL Meteora rejection for the Growth candidate rather than papering over it", async () => {
    if (!dbAvailable) return;
    const { plan } = await (await call({ curveCandidateId: growthId })).json();
    const c = plan.checks.find((x: any) => x.id === "configuration");
    expect(c.status).toBe("fail");
    expect(c.detail).toMatch(/whole numbers/);
  });

  it("rejects malformed input with 400s", async () => {
    if (!dbAvailable) return;
    for (const bad of [{}, { curveCandidateId: "" }, { curveCandidateId: 5 }, { curveCandidateId: "x".repeat(65) }, { curveCandidateId: "ok", simulationRunId: "" }]) {
      expect((await call(bad)).status).toBe(400);
    }
    expect((await call("not json", true)).status).toBe(400);
  });

  it("404s an unknown candidate", async () => {
    if (!dbAvailable) return;
    expect((await call({ curveCandidateId: "no-such-candidate" })).status).toBe(404);
  });

  it("will NOT accept another configuration's simulation — results can't be borrowed or forged", async () => {
    if (!dbAvailable) return;
    expect((await call({ curveCandidateId: balancedId, simulationRunId: otherRunId })).status).toBe(404);
    expect((await call({ curveCandidateId: balancedId, simulationRunId: "forged-id" })).status).toBe(404);
  });

  it("ignores any simulation data smuggled into the request body", async () => {
    if (!dbAvailable) return;
    const res = await call({ curveCandidateId: balancedId, scenarios: [{ scenario: "normal_demand" }], simulation: { status: "completed" } });
    expect((await res.json()).plan.simulation.status).toBe("not_run");
  });

  it("is read-only and NON-DEPLOYING: no Launch, Pool or any other row is created, nothing is signed", async () => {
    if (!dbAvailable) return;
    const before = await counts();
    await call({ curveCandidateId: balancedId, simulationRunId: balancedRunId });
    await call({ curveCandidateId: growthId });
    expect(await counts()).toEqual(before);
    const withSig = await prisma.launch.count({ where: { OR: [{ configTxSignature: { not: null } }, { poolTxSignature: { not: null } }] } });
    expect(withSig).toBe(0);
  });

  it("never leaks keys or secrets in the response", async () => {
    if (!dbAvailable) return;
    process.env.PYTH_API_KEY = FAKE_SECRET;
    const raw = JSON.stringify(await (await call({ curveCandidateId: balancedId, simulationRunId: balancedRunId })).json());
    expect(raw).not.toContain(FAKE_SECRET);
    expect(raw).not.toMatch(/KeypairSecret|ownerWallet|PYTH_API_KEY|secretKey|privateKey/);
  });

  describe("Pyth states (network stubbed inside this test only)", () => {
    const stubHermes = (ticker: string, discovery: unknown[], price: { status: number; body: string }) =>
      vi.stubGlobal("fetch", vi.fn(async (url: string) =>
        url.includes("/v2/price_feeds") ? new Response(JSON.stringify(discovery), { status: 200 }) : new Response(price.body, { status: price.status })));

    it("no public feed for this ticker → oracle 'unavailable' (not a failure), and no other feed is substituted", async () => {
      if (!dbAvailable) return;
      stubHermes("LPTA", [], { status: 200, body: "{}" });
      const { plan } = await (await call({ curveCandidateId: balancedId })).json();
      expect(plan.oracle.state).toBe("no_feed");
      expect(plan.oracle.feeds).toEqual([]);
      expect(plan.checks.find((c: any) => c.id === "oracle_configuration").status).toBe("unavailable");
    });

    it("restricted entitlement → the exact required text and no price", async () => {
      if (!dbAvailable) return;
      // A fresh symbol so pyth.ts's per-ticker discovery cache cannot serve an earlier answer.
      const r = await seed("LPRS");
      process.env.PYTH_API_KEY = "fake-key-for-test";
      stubHermes("LPRS", [{ id: "f1", attributes: { symbol: "Equity.US.LPRS/USD" } }], { status: 403, body: "Not entitled: feed f1 (no grant accepts this feed (asset type 'equity'))" });
      const { plan } = await (await call({ curveCandidateId: r.rows[0]!.id })).json();
      expect(plan.oracle.state).toBe("entitlement_restricted");
      expect(plan.oracle.headline).toBe("Restricted — Pyth entitlement required");
      expect(plan.oracle.feeds[0]).toMatchObject({ state: "entitlement_restricted", priceUsd: null });
      expect(plan.warnings.join(" ")).toMatch(/no Pyth-verified reference price/);
    });

    it("not configured → reported as such", async () => {
      if (!dbAvailable) return;
      const r = await seed("LPNC");
      stubHermes("LPNC", [{ id: "f2", attributes: { symbol: "Equity.US.LPNC/USD" } }], { status: 200, body: "{}" });
      const { plan } = await (await call({ curveCandidateId: r.rows[0]!.id })).json();
      expect(plan.oracle.state).toBe("not_configured");
    });

    it("a live price is shown as live, with the price, when Pyth returns one", async () => {
      if (!dbAvailable) return;
      const r = await seed("LPLV");
      process.env.PYTH_API_KEY = "fake-key-for-test";
      stubHermes("LPLV", [{ id: "f3", attributes: { symbol: "Equity.US.LPLV/USD" } }], {
        status: 200, body: JSON.stringify({ parsed: [{ id: "f3", price: { price: "1012000000", expo: -8, publish_time: Math.floor(Date.now() / 1000) } }] }),
      });
      const { plan } = await (await call({ curveCandidateId: r.rows[0]!.id })).json();
      expect(plan.oracle.state).toBe("live");
      expect(plan.oracle.feeds[0].priceUsd).toBeCloseTo(10.12, 2);
    });
  });
});
