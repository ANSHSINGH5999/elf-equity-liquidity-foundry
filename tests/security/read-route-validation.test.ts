import { describe, expect, it } from "vitest";
import { GET as quote } from "../../apps/web/src/app/api/dbc/[poolAddress]/quote/route.js";
import { GET as poolMetrics } from "../../apps/web/src/app/api/pools/[poolAddress]/metrics/route.js";

/** Input validation on two read-only routes: a bad value is a 400 before any RPC call, never a silent default or a 503. */
const POOL = "5XeQcXNLoqeoVunzvAQpuxM8gXX3iKVwLZPywKkDn1tr";
const getQuote = (query: string) => quote(new Request(`http://localhost/api/dbc/${POOL}/quote?${query}`), { params: Promise.resolve({ poolAddress: POOL }) });

describe("GET /api/dbc/:pool/quote — side", () => {
  it.each(["hold", "sel", "BUY", "", "sell%20"])("rejects side=%j instead of silently quoting a BUY", async (side) => {
    const res = await getQuote(`side=${side}&amountUsd=1`);
    expect(res.status).toBe(400);
    expect((await res.json()).error.message).toBe("side must be buy or sell.");
  });

  it("still rejects amountTokens on a buy, and a non-positive amount, as before", async () => {
    expect((await getQuote("side=buy&amountTokens=1")).status).toBe(400);
    expect((await getQuote("side=sell&amountTokens=0")).status).toBe(400);
    expect((await getQuote("side=buy&amountUsd=-1")).status).toBe(400);
  });
});

describe("GET /api/pools/:pool/metrics — address", () => {
  it.each(["notapool", "123", "0x1234", "a".repeat(100)])("rejects the invalid address %j with 400 (not an RPC-unavailable 503)", async (address) => {
    const res = await poolMetrics(new Request(`http://localhost/api/pools/${address}/metrics`), { params: Promise.resolve({ poolAddress: address }) });
    expect(res.status).toBe(400);
    expect((await res.json()).error.code).toBe("validation_error");
  });
});
