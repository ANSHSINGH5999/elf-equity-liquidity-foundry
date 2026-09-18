import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { classifyHermesError, getPythPriceComparison } from "../../apps/web/src/lib/server/pyth.js";

/**
 * Unit tests for the Pyth Hermes error classification and the price-
 * comparison service. Mocks `fetch` (per the project's own instruction:
 * mocks are fine in tests, never in the running application) rather than
 * hitting live Hermes, so this suite is deterministic and doesn't depend
 * on a real PYTH_API_KEY or network access. The live-verified behavior
 * these mocks encode (401 = no auth header at all; 403 with "invalid API
 * key" in the body = bad credential; 403 with "no grant accepts this
 * feed" = valid key, no entitlement) was confirmed against the real
 * Hermes API on 2026-09-18 — see apps/web/src/lib/server/pyth.ts.
 */

const DISCOVERY_RESPONSE = (ticker: string) => [
  { id: "feed-equity-id", attributes: { symbol: `Equity.US.${ticker}/USD` } },
  { id: "feed-xstock-id", attributes: { symbol: `Crypto.${ticker}X/USD` } },
];

function mockFetchSequence(discoveryBody: unknown, priceResponse: { status: number; body: unknown }) {
  const fetchMock = vi.fn(async (url: string) => {
    if (url.includes("/v2/price_feeds")) {
      return new Response(JSON.stringify(discoveryBody), { status: 200 });
    }
    return new Response(typeof priceResponse.body === "string" ? priceResponse.body : JSON.stringify(priceResponse.body), {
      status: priceResponse.status,
    });
  });
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

describe("classifyHermesError", () => {
  it("classifies a fully missing Authorization header (401) as unauthenticated", () => {
    expect(classifyHermesError(401, "")).toBe("unauthenticated");
  });

  it("classifies a malformed/garbage key (403, body mentions invalid API key) as unauthenticated", () => {
    expect(classifyHermesError(403, "Not entitled: feed xyz (invalid API key)")).toBe("unauthenticated");
  });

  it("classifies a valid key with no grant for the feed (403, body mentions no grant) as entitlement_restricted", () => {
    expect(classifyHermesError(403, "Not entitled: feed xyz (no grant accepts this feed (asset type 'equity', instrument type 'spot', exchange 1))")).toBe(
      "entitlement_restricted",
    );
  });

  it("classifies 429 as rate_limited", () => {
    expect(classifyHermesError(429, "Too many requests")).toBe("rate_limited");
  });

  it("classifies any other status (e.g. 500) as unavailable", () => {
    expect(classifyHermesError(500, "Internal server error")).toBe("unavailable");
  });
});

describe("getPythPriceComparison", () => {
  const originalKey = process.env.PYTH_API_KEY;

  beforeEach(() => {
    vi.resetAllMocks();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    process.env.PYTH_API_KEY = originalKey;
  });

  it("returns not_configured for every discovered feed when PYTH_API_KEY is unset", async () => {
    delete process.env.PYTH_API_KEY;
    mockFetchSequence(DISCOVERY_RESPONSE("PYUNSET"), { status: 200, body: {} });

    const result = await getPythPriceComparison("PYUNSET");
    expect(result.length).toBeGreaterThan(0);
    for (const entry of result) {
      expect(entry.priceUsd).toBeNull();
      expect(entry.unavailableReason).toBe("not_configured");
    }
  });

  it("returns entitlement_restricted when Hermes returns 403 'no grant' for a configured key", async () => {
    process.env.PYTH_API_KEY = "test-key";
    mockFetchSequence(DISCOVERY_RESPONSE("PYENTITLE"), {
      status: 403,
      body: "Not entitled: feed feed-equity-id (no grant accepts this feed (asset type 'equity', instrument type 'spot', exchange 1))",
    });

    const result = await getPythPriceComparison("PYENTITLE");
    expect(result.length).toBeGreaterThan(0);
    for (const entry of result) {
      expect(entry.priceUsd).toBeNull();
      expect(entry.unavailableReason).toBe("entitlement_restricted");
    }
  });

  it("returns unauthenticated when Hermes returns 403 'invalid API key'", async () => {
    process.env.PYTH_API_KEY = "garbage";
    mockFetchSequence(DISCOVERY_RESPONSE("PYBADKEY"), {
      status: 403,
      body: "Not entitled: feed feed-equity-id (invalid API key)",
    });

    const result = await getPythPriceComparison("PYBADKEY");
    for (const entry of result) {
      expect(entry.unavailableReason).toBe("unauthenticated");
    }
  });

  it("returns a real priceUsd and null unavailableReason on a genuine 200 with parsed data", async () => {
    process.env.PYTH_API_KEY = "test-key";
    mockFetchSequence(DISCOVERY_RESPONSE("PYLIVE"), {
      status: 200,
      body: {
        parsed: [
          { id: "feed-equity-id", price: { price: "12345000000", expo: -8, publish_time: Math.floor(Date.now() / 1000) } },
          { id: "feed-xstock-id", price: { price: "12300000000", expo: -8, publish_time: Math.floor(Date.now() / 1000) } },
        ],
      },
    });

    const result = await getPythPriceComparison("PYLIVE");
    expect(result).toHaveLength(2);
    expect(result.find((r) => r.feedId === "feed-equity-id")?.priceUsd).toBeCloseTo(123.45, 1);
    expect(result.find((r) => r.feedId === "feed-xstock-id")?.priceUsd).toBeCloseTo(123.0, 1);
    for (const entry of result) {
      expect(entry.unavailableReason).toBeNull();
      expect(entry.publishTime).not.toBeNull();
    }
  });

  it("marks a feed unavailable (not entitlement_restricted) when a 200 response simply omits it", async () => {
    process.env.PYTH_API_KEY = "test-key";
    mockFetchSequence(DISCOVERY_RESPONSE("PYPARTIAL"), {
      status: 200,
      body: { parsed: [{ id: "feed-equity-id", price: { price: "100000000", expo: -8, publish_time: Math.floor(Date.now() / 1000) } }] },
    });

    const result = await getPythPriceComparison("PYPARTIAL");
    const missing = result.find((r) => r.feedId === "feed-xstock-id");
    expect(missing?.priceUsd).toBeNull();
    expect(missing?.unavailableReason).toBe("unavailable");
  });

  it("returns an empty array (not an error) when no feed exists for the ticker at all", async () => {
    process.env.PYTH_API_KEY = "test-key";
    mockFetchSequence([], { status: 200, body: {} });

    const result = await getPythPriceComparison("PYNONE");
    expect(result).toEqual([]);
  });
});
