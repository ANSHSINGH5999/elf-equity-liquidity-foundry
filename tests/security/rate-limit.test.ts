import { afterEach, describe, expect, it } from "vitest";
import { checkRateLimit, clientKeyFromRequest } from "../../apps/web/src/lib/server/rate-limit.js";

function requestWithXff(xff: string | null): Request {
  return new Request("http://localhost/api/dbc/config", {
    headers: xff ? { "x-forwarded-for": xff } : {},
  });
}

const ORIGINAL_HOPS = process.env.TRUSTED_PROXY_HOPS;
afterEach(() => {
  if (ORIGINAL_HOPS === undefined) delete process.env.TRUSTED_PROXY_HOPS;
  else process.env.TRUSTED_PROXY_HOPS = ORIGINAL_HOPS;
});

describe("clientKeyFromRequest (LOW-4 — rate-limit bypass)", () => {
  it("with the default (untrusted) config, collapses every caller onto the same key regardless of X-Forwarded-For", () => {
    delete process.env.TRUSTED_PROXY_HOPS;
    const keys = [
      clientKeyFromRequest(requestWithXff("1.2.3.4")),
      clientKeyFromRequest(requestWithXff("5.6.7.8")),
      clientKeyFromRequest(requestWithXff(`attacker-chosen-${Math.random()}`)),
      clientKeyFromRequest(requestWithXff(null)),
    ];
    // The whole point: no client-supplied header value can change the key
    // when hops=0, so there is nothing left for a header-spoofing bypass
    // to exploit.
    expect(new Set(keys).size).toBe(1);
  });

  it("with TRUSTED_PROXY_HOPS=1, uses the last (nearest-hop) X-Forwarded-For entry, not the client-controlled first one", () => {
    process.env.TRUSTED_PROXY_HOPS = "1";
    // The client can prepend whatever it wants; only the trusted proxy's
    // own appended entry (the last one) should ever be trusted.
    const key1 = clientKeyFromRequest(requestWithXff("attacker-fake-1, 203.0.113.9"));
    const key2 = clientKeyFromRequest(requestWithXff("attacker-fake-2, 203.0.113.9"));
    expect(key1).toBe("203.0.113.9");
    expect(key2).toBe("203.0.113.9");
    expect(key1).toBe(key2);
  });

  it("with TRUSTED_PROXY_HOPS=1, two real distinct clients (distinct trusted-hop entries) still get distinct keys", () => {
    process.env.TRUSTED_PROXY_HOPS = "1";
    const key1 = clientKeyFromRequest(requestWithXff("x, 203.0.113.9"));
    const key2 = clientKeyFromRequest(requestWithXff("x, 198.51.100.4"));
    expect(key1).not.toBe(key2);
  });
});

describe("checkRateLimit + clientKeyFromRequest end-to-end (LOW-4)", () => {
  it("actually throttles a caller that rotates X-Forwarded-For per request under the safe default", () => {
    delete process.env.TRUSTED_PROXY_HOPS;
    const routeKey = `test-route-${Math.random()}`;
    const limit = 3;
    const results: boolean[] = [];
    for (let i = 0; i < 5; i++) {
      // Old, vulnerable behavior: a fresh XFF value every request. Should
      // no longer produce a fresh bucket.
      const key = `${routeKey}:${clientKeyFromRequest(requestWithXff(`10.0.0.${i}`))}`;
      results.push(checkRateLimit(key, limit, 60_000));
    }
    // First `limit` allowed, the rest denied — proves rotating the header
    // no longer resets the limiter.
    expect(results).toEqual([true, true, true, false, false]);
  });
});
