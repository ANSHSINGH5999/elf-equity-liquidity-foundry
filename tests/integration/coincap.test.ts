import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  EXTERNAL_UNAVAILABLE_MESSAGE,
  clearCoinCapCache,
  fetchCoinCapAsset,
  findCoinCapAssetExact,
  isValidCoinCapAssetId,
  normalizeCoinCapAsset,
} from "../../apps/web/src/lib/server/coincap.js";

/**
 * CoinCap is EXTERNAL context only. These tests run against an injected fetch — no network, no real key. The fake key is
 * asserted to never appear in any result, and every failure mode must come back as a labelled "unavailable", never as
 * a made-up number.
 */
const KEY = "FAKE_TEST_COINCAP_KEY_NOT_REAL_0123456789";
const TS = 1_789_000_000_000;
const solana = { id: "solana", rank: "7", symbol: "SOL", name: "Solana", marketCapUsd: "65330282238.38", volumeUsd24Hr: "2603667687.38", priceUsd: "111.2254970", changePercent24Hr: "-1.15", vwap24Hr: "112.5" };

const respond = (status: number, body: unknown) => async () => new Response(typeof body === "string" ? body : JSON.stringify(body), { status });
const asset = (data: unknown) => respond(200, { timestamp: TS, data });

beforeEach(() => clearCoinCapCache());

describe("CoinCap client", () => {
  it("key missing: reports not_configured and never calls the network", async () => {
    vi.stubEnv("COINCAP_API_KEY", "");
    const fetchImpl = vi.fn();
    const r = await fetchCoinCapAsset("solana", { fetchImpl: fetchImpl as unknown as typeof fetch });
    expect(r).toMatchObject({ status: "unavailable", reason: "not_configured" });
    expect(fetchImpl).not.toHaveBeenCalled();
    vi.unstubAllEnvs();
  });

  it("valid response is normalised: string decimals become numbers, provider and ISO timestamp are set", async () => {
    const r = await fetchCoinCapAsset("solana", { apiKey: KEY, fetchImpl: asset(solana) as typeof fetch });
    expect(r).toEqual({
      status: "ok",
      data: { provider: "CoinCap", assetId: "solana", symbol: "SOL", priceUsd: 111.225497, marketCapUsd: 65330282238.38, volume24hUsd: 2603667687.38, changePercent24h: -1.15, timestamp: new Date(TS).toISOString() },
    });
  });

  it("sends the key only as a Bearer header to the fixed CoinCap origin, and never returns it", async () => {
    const fetchImpl = vi.fn(asset(solana));
    const r = await fetchCoinCapAsset("solana", { apiKey: KEY, fetchImpl: fetchImpl as unknown as typeof fetch });
    const [url, init] = fetchImpl.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe("https://rest.coincap.io/v3/assets/solana");
    expect((init.headers as Record<string, string>).Authorization).toBe(`Bearer ${KEY}`);
    expect(url).not.toContain(KEY);
    expect(JSON.stringify(r)).not.toContain(KEY);
  });

  it("fields CoinCap did not return are null — never 0", async () => {
    const r = await fetchCoinCapAsset("solana", { apiKey: KEY, fetchImpl: asset({ id: "solana", symbol: "SOL", priceUsd: "111.2", marketCapUsd: null, volumeUsd24Hr: "", changePercent24Hr: "not-a-number" }) as typeof fetch });
    expect(r).toMatchObject({ status: "ok", data: { marketCapUsd: null, volume24hUsd: null, changePercent24h: null, priceUsd: 111.2 } });
  });

  it.each([
    ["rate limited (429)", 429, {}, "rate_limited"],
    ["not found (404)", 404, { error: "x" }, "not_listed"],
    ["server error (500)", 500, {}, "unavailable"],
    ["rejected credentials (401)", 401, {}, "unavailable"],
  ] as const)("%s -> %s", async (_name, status, body, reason) => {
    const r = await fetchCoinCapAsset("solana", { apiKey: KEY, fetchImpl: respond(status, body) as typeof fetch });
    expect(r).toMatchObject({ status: "unavailable", reason });
    expect(JSON.stringify(r)).not.toContain(KEY);
  });

  it("network failure / timeout -> unavailable", async () => {
    const r = await fetchCoinCapAsset("solana", { apiKey: KEY, fetchImpl: (async () => { throw new Error("connect ECONNRESET"); }) as typeof fetch });
    expect(r).toMatchObject({ status: "unavailable", reason: "unavailable" });
  });

  it.each([
    ["not JSON", "<html>oops</html>"],
    ["no data", { timestamp: TS }],
    ["price is not numeric", { timestamp: TS, data: { ...solana, priceUsd: "abc" } }],
    ["price is zero", { timestamp: TS, data: { ...solana, priceUsd: "0" } }],
    ["price is negative", { timestamp: TS, data: { ...solana, priceUsd: "-4" } }],
    ["no timestamp", { data: solana }],
    ["a different asset than requested", { timestamp: TS, data: { ...solana, id: "bitcoin", symbol: "BTC" } }],
  ])("malformed answer (%s) is reported as malformed, not repaired", async (_name, body) => {
    const r = await fetchCoinCapAsset("solana", { apiKey: KEY, fetchImpl: respond(200, body) as typeof fetch });
    expect(r).toMatchObject({ status: "unavailable", reason: "malformed" });
  });

  it("an oversized response is refused", async () => {
    const r = await fetchCoinCapAsset("solana", { apiKey: KEY, fetchImpl: respond(200, "x".repeat(600_000)) as typeof fetch });
    expect(r).toMatchObject({ status: "unavailable", reason: "malformed" });
  });

  it("asset ids are validated before any request is made (no path injection)", async () => {
    const fetchImpl = vi.fn();
    for (const bad of ["../v3/admin", "SOL/../x", "sol ana", "", "a".repeat(80), "sol?apiKey=1"]) {
      expect(isValidCoinCapAssetId(bad)).toBe(false);
      expect(await fetchCoinCapAsset(bad, { apiKey: KEY, fetchImpl: fetchImpl as unknown as typeof fetch })).toMatchObject({ status: "unavailable", reason: "not_listed" });
    }
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it("caches a good answer briefly (one upstream call for repeated reads) and re-reads after the TTL", async () => {
    const fetchImpl = vi.fn(asset(solana));
    let now = 1_000;
    const deps = { apiKey: KEY, fetchImpl: fetchImpl as unknown as typeof fetch, now: () => now };
    await fetchCoinCapAsset("solana", deps);
    await fetchCoinCapAsset("solana", deps);
    expect(fetchImpl).toHaveBeenCalledTimes(1);
    now += 31_000;
    await fetchCoinCapAsset("solana", deps);
    expect(fetchImpl).toHaveBeenCalledTimes(2);
  });

  it("normalizeCoinCapAsset rejects non-objects and bad symbols", () => {
    expect(normalizeCoinCapAsset(null, TS)).toBeNull();
    expect(normalizeCoinCapAsset("x", TS)).toBeNull();
    expect(normalizeCoinCapAsset({ ...solana, symbol: "" }, TS)).toBeNull();
    expect(normalizeCoinCapAsset({ ...solana, symbol: "S".repeat(40) }, TS)).toBeNull();
  });
});

describe("CoinCap exact asset match (no mapping to an unrelated ticker)", () => {
  const list = (items: unknown[]) => respond(200, { timestamp: TS, data: items });
  const deps = (fetchImpl: unknown) => ({ apiKey: KEY, fetchImpl: fetchImpl as typeof fetch });

  it("an equity/pre-IPO asset CoinCap does not list -> the standard unavailable message", async () => {
    const r = await findCoinCapAssetExact("ANDURIL", "Anduril PreStocks", deps(list([])));
    expect(r).toEqual({ status: "unavailable", reason: "not_listed", message: EXTERNAL_UNAVAILABLE_MESSAGE });
  });

  it("a coin with the same symbol but a different name is NOT accepted", async () => {
    const r = await findCoinCapAssetExact("SOL", "Solar Widgets Inc", deps(list([solana])));
    expect(r).toMatchObject({ status: "unavailable", reason: "not_listed" });
  });

  it("the same symbol AND name is accepted", async () => {
    const r = await findCoinCapAssetExact("SOL", "Solana", deps(list([solana, { ...solana, id: "solar", symbol: "SLR", name: "Solar" }])));
    expect(r).toMatchObject({ status: "ok", data: { assetId: "solana", symbol: "SOL" } });
  });

  it("two exact matches are ambiguous and refused", async () => {
    const r = await findCoinCapAssetExact("SOL", "Solana", deps(list([solana, { ...solana, id: "solana-2" }])));
    expect(r).toMatchObject({ status: "unavailable", reason: "malformed" });
  });

  it("a non-array data field is malformed; a hostile search term is never sent", async () => {
    expect(await findCoinCapAssetExact("SOL", "Solana", deps(respond(200, { timestamp: TS, data: { id: "solana" } })))).toMatchObject({ reason: "malformed" });
    const fetchImpl = vi.fn();
    expect(await findCoinCapAssetExact("SOL&limit=500", "Solana", deps(fetchImpl))).toMatchObject({ reason: "not_listed" });
    expect(fetchImpl).not.toHaveBeenCalled();
  });
});
