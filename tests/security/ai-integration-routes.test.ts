import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

/**
 * Route-level behaviour of the two provider integrations: POST /api/ai/market-analysis (Groq) and
 * GET /api/market/external (CoinCap). The providers are a stubbed global fetch and the market data a mocked
 * repository, so no key, network or database is involved. Fake keys are asserted to never appear in any response.
 */
const GROQ_KEY = "FAKE_TEST_GROQ_KEY_NOT_REAL_route_0123456789";
const COINCAP_KEY = "FAKE_TEST_COINCAP_KEY_NOT_REAL_route_0123456789";

const rate = vi.hoisted(() => ({ allow: true }));
vi.mock("@/lib/server/rate-limit", () => ({ checkRateLimit: () => rate.allow, clientKeyFromRequest: () => "test" }));

const now = "2026-09-20T12:00:00.000Z";
const m = (value: number) => ({ value, timestamp: now, source: "ON_CHAIN" as const });
const dashboard = {
  overview: {
    marketId: "m1", poolAddress: "P", status: "live", regime: "discovery", priceUsd: m(0.325008), liquidityUsd: m(4.904975), volume24hUsd: m(6.97), volume7dUsd: m(6.97),
    tradeCount24h: 9, uniqueTraders24h: 1, buyVolumeUsd24h: 6, sellVolumeUsd24h: 0.97, buySellRatio24h: 2,
    priceChange24h: { available: false, reason: "x" }, liquidityChange24h: { available: false, reason: "x" },
    graduation: { quoteReserveUsd: 4.9, migrationThresholdUsd: 577918.65, percentageComplete: 0, estimatedReadiness: "not_started" },
    graduationChecklist: [], marketQualityScore: {}, referencePriceUsd: 145, referencePriceSource: "issuer_declared", referencePriceFeedSymbol: null, priceOracle: [],
    freshness: { status: "live", lastIndexedAt: now, lagSeconds: 3 },
  },
  totalTrades: 9, uniqueTradersAllTime: 1, targetLiquidityUsd: 500_000, indicators: [],
  health: { status: "WATCH", watchEventCount: 2, events: [] },
};
const market = vi.hoisted(() => ({ dashboard: null as unknown, resolved: null as unknown }));
vi.mock("@/lib/server/marketAnalytics", () => ({
  getIssuerDashboard: async () => market.dashboard,
  getTradeStats: async () => ({ buyTrades: 6, sellTrades: 3, totalTrades: 9 }),
  resolveMarket: async () => market.resolved,
}));

import { POST as analyze } from "../../apps/web/src/app/api/ai/market-analysis/route.js";
import { GET as external } from "../../apps/web/src/app/api/market/external/route.js";
import { clearAiAnalysisCache } from "../../apps/web/src/lib/server/aiMarketAnalysis.js";
import { clearCoinCapCache } from "../../apps/web/src/lib/server/coincap.js";

const post = (body: unknown) => analyze(new Request("http://localhost/api/ai/market-analysis", { method: "POST", body: typeof body === "string" ? body : JSON.stringify(body) }));
const get = (query: string) => external(new Request(`http://localhost/api/market/external?${query}`));
const json = async (r: Response) => JSON.parse(await r.text()) as Record<string, any>;
const completion = (content: unknown) => new Response(JSON.stringify({ choices: [{ message: { content: JSON.stringify(content) }, finish_reason: "stop" }] }), { status: 200 });
const goodAnswer = {
  summary: "The market is live with 9 indexed trades.", marketObservations: ["Pool status is live."], riskObservations: [], liquidityObservations: [],
  activityObservations: ["6 BUY and 3 SELL trades were indexed."], graduationObservations: [], limitations: [],
};

beforeEach(() => {
  rate.allow = true;
  market.dashboard = dashboard;
  market.resolved = null;
  clearAiAnalysisCache();
  clearCoinCapCache();
  vi.stubEnv("GROQ_API_KEY", GROQ_KEY);
  vi.stubEnv("COINCAP_API_KEY", COINCAP_KEY);
  vi.spyOn(console, "error").mockImplementation(() => undefined);
});
afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("POST /api/ai/market-analysis", () => {
  it("key missing: 503 not_configured, and neither the database nor Groq is touched", async () => {
    vi.stubEnv("GROQ_API_KEY", "");
    const fetchSpy = vi.fn();
    vi.stubGlobal("fetch", fetchSpy);
    const res = await post({ marketId: "m1" });
    expect(res.status).toBe(503);
    expect((await json(res)).error.details).toEqual({ reason: "not_configured" });
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("is rate limited", async () => {
    rate.allow = false;
    expect((await post({ marketId: "m1" })).status).toBe(429);
  });

  it.each([
    ["extra 'facts' from the client", { marketId: "m1", facts: { priceUsd: 999 } }],
    ["a client-supplied snapshot", { marketId: "m1", snapshot: { price: 1 } }],
    ["no marketId", {}],
    ["a path-like marketId", { marketId: "../../etc/passwd" }],
    ["a non-string marketId", { marketId: 5 }],
    ["not JSON", "{oops"],
  ])("rejects %s with 400 and never calls Groq", async (_n, body) => {
    const fetchSpy = vi.fn();
    vi.stubGlobal("fetch", fetchSpy);
    expect((await post(body)).status).toBe(400);
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("rejects an oversized body with 413", async () => {
    expect((await post({ marketId: "m1", pad: "x".repeat(2_000) })).status).toBe(413);
  });

  it("unknown market: 404", async () => {
    market.dashboard = null;
    vi.stubGlobal("fetch", vi.fn());
    expect((await post({ marketId: "nope" })).status).toBe(404);
  });

  it("success: the model sees only the server-built snapshot, the response is labelled, and the key never appears", async () => {
    const fetchSpy = vi.fn(async () => completion(goodAnswer));
    vi.stubGlobal("fetch", fetchSpy);
    const res = await post({ marketId: "m1" });
    expect(res.status).toBe(200);
    const raw = await res.clone().text();
    const body = await json(res);
    expect(body.status).toBe("ok");
    expect(body.meta).toMatchObject({ provider: "Groq", cached: false, droppedUngrounded: 0 });
    expect(body.meta.dataSource).toMatch(/verified/i);
    expect(body.analysis.evidence[0]).toBe("9 indexed trades / 6 BUY / 3 SELL");
    expect(body.analysis.limitations.join(" ")).toMatch(/not a source of truth/);
    expect(raw).not.toContain(GROQ_KEY);

    const [url, init] = fetchSpy.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe("https://api.groq.com/openai/v1/chat/completions");
    expect((init.headers as Record<string, string>).Authorization).toBe(`Bearer ${GROQ_KEY}`);
    const sent = JSON.parse(init.body as string).messages[1].content as string;
    expect(sent).toContain('"dbcPriceUsd":0.325008');
    expect(sent).not.toContain("marketId");
  });

  it("a second identical request is served from the short cache (no second Groq call)", async () => {
    const fetchSpy = vi.fn(async () => completion(goodAnswer));
    vi.stubGlobal("fetch", fetchSpy);
    await post({ marketId: "m1" });
    const again = await json(await post({ marketId: "m1" }));
    expect(again.meta.cached).toBe(true);
    expect(fetchSpy).toHaveBeenCalledTimes(1);
  });

  it("an answer with an invented number is discarded: 502, and the invented figure is not in the response", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => completion({ ...goodAnswer, summary: "The market has 47 trades." })));
    const res = await post({ marketId: "m1" });
    const text = await res.text();
    expect(res.status).toBe(502);
    expect(text).not.toContain("47 trades");
  });

  it.each([
    ["rate limit", () => new Response("{}", { status: 429 }), 429],
    ["provider outage", () => new Response("{}", { status: 503 }), 503],
    ["garbage body", () => new Response("<html>", { status: 200 }), 502],
  ])("Groq %s -> %i with a safe message and no key", async (_n, respond, status) => {
    vi.stubGlobal("fetch", vi.fn(async () => respond()));
    const res = await post({ marketId: "m1" });
    expect(res.status).toBe(status);
    expect(await res.text()).not.toContain(GROQ_KEY);
  });

  it("a network failure -> 503, never a stack trace or the key", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => { throw new Error(`connect ECONNRESET while sending ${GROQ_KEY}`); }));
    const res = await post({ marketId: "m1" });
    const text = await res.text();
    expect(res.status).toBe(503);
    expect(text).not.toContain(GROQ_KEY);
    expect(text).not.toContain("ECONNRESET");
  });
});

describe("GET /api/market/external", () => {
  const solana = { timestamp: 1_789_000_000_000, data: { id: "solana", symbol: "SOL", name: "Solana", priceUsd: "111.22", marketCapUsd: "6.5e10", volumeUsd24Hr: "2.6e9", changePercent24Hr: "-1.1" } };
  const coincap = (map: (url: string) => Response) => vi.stubGlobal("fetch", vi.fn(async (url: string) => map(url)));

  it("valid asset: normalised CoinCap data, key never returned", async () => {
    coincap(() => new Response(JSON.stringify(solana), { status: 200 }));
    const res = await get("assetId=solana");
    const text = await res.text();
    expect(res.status).toBe(200);
    expect(JSON.parse(text)).toMatchObject({ provider: "CoinCap", assetId: "solana", symbol: "SOL", priceUsd: 111.22 });
    expect(text).not.toContain(COINCAP_KEY);
  });

  it("key missing: 503 with no upstream call", async () => {
    vi.stubEnv("COINCAP_API_KEY", "");
    const fetchSpy = vi.fn();
    vi.stubGlobal("fetch", fetchSpy);
    const res = await get("assetId=solana");
    expect(res.status).toBe(503);
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("missing asset: 404; rate limited: 429 with Retry-After; outage: 503; malformed: 503", async () => {
    coincap(() => new Response("{}", { status: 404 }));
    expect((await get("assetId=nothing")).status).toBe(404);
    clearCoinCapCache();
    coincap(() => new Response("{}", { status: 429 }));
    const limited = await get("assetId=solana");
    expect(limited.status).toBe(429);
    expect(limited.headers.get("Retry-After")).toBeTruthy();
    clearCoinCapCache();
    coincap(() => new Response("{}", { status: 500 }));
    expect((await get("assetId=solana")).status).toBe(503);
    clearCoinCapCache();
    coincap(() => new Response(JSON.stringify({ timestamp: 1, data: { id: "solana", symbol: "SOL", priceUsd: "abc" } }), { status: 200 }));
    expect((await get("assetId=solana")).status).toBe(503);
  });

  it.each([["neither parameter", ""], ["both parameters", "assetId=solana&marketId=m1"], ["a path-like asset id", "assetId=..%2Fadmin"], ["an upper-case asset id", "assetId=SOL"], ["a bad market id", "marketId=a%2Fb"]])(
    "rejects %s with 400 and no upstream call",
    async (_n, query) => {
      const fetchSpy = vi.fn();
      vi.stubGlobal("fetch", fetchSpy);
      expect((await get(query)).status).toBe(400);
      expect(fetchSpy).not.toHaveBeenCalled();
    },
  );

  it("market mode: the USDC quote token is priced by CoinCap and an unlisted equity asset says so — never another ticker", async () => {
    market.resolved = { id: "m1", asset: { symbol: "ANDURIL", name: "Anduril PreStocks" }, marketProfile: { quoteToken: "USDC" } };
    coincap((url) =>
      url.includes("/assets/usd-coin")
        ? new Response(JSON.stringify({ timestamp: 1_789_000_000_000, data: { id: "usd-coin", symbol: "USDC", priceUsd: "1.0001" } }), { status: 200 })
        : new Response(JSON.stringify({ timestamp: 1_789_000_000_000, data: [] }), { status: 200 }),
    );
    const body = await json(await get("marketId=m1"));
    expect(body.quote).toMatchObject({ token: "USDC", result: { status: "ok", data: { assetId: "usd-coin", priceUsd: 1.0001 } } });
    expect(body.asset).toEqual({ symbol: "ANDURIL", result: { status: "unavailable", reason: "not_listed", message: "External market data unavailable for this asset." } });
  });

  it("market mode: unknown market is 404", async () => {
    market.resolved = null;
    vi.stubGlobal("fetch", vi.fn());
    expect((await get("marketId=nope")).status).toBe(404);
  });

  it("is rate limited", async () => {
    rate.allow = false;
    expect((await get("assetId=solana")).status).toBe(429);
  });
});
