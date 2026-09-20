import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { GET as getHealth } from "../../apps/web/src/app/api/markets/[id]/health/route.js";
import { GET as getLiveness } from "../../apps/web/src/app/api/health/route.js";

// These tests check auth and response shape, not the network. RPC points at a closed local port so a rate-limited
// public endpoint (HTTP 429 retries across real pools) cannot push them past the timeout, and so a test run can
// never advance the real indexer cursors. The URL keeps "devnet" in it: the cluster is derived from the URL.
const OFFLINE_RPC = "http://127.0.0.1:9/devnet-offline";
const ORIGINAL_RPC = process.env.SOLANA_RPC_URL;
beforeAll(() => {
  process.env.SOLANA_RPC_URL = OFFLINE_RPC;
});
afterAll(() => {
  if (ORIGINAL_RPC === undefined) delete process.env.SOLANA_RPC_URL;
  else process.env.SOLANA_RPC_URL = ORIGINAL_RPC;
});

/**
 * GET /api/markets/:id/health is read-only and public like the other market
 * analytics routes. An unknown market must 404 with the standard error
 * envelope, never a stack trace or a database detail, and the route source
 * must not serialize the Launch row.
 */
const call = (id: string) => getHealth(new Request(`http://localhost/api/markets/${id}/health`), { params: Promise.resolve({ id }) });

describe("GET /api/markets/:id/health", () => {
  it("returns the standard 404 envelope for an unknown market (or 503 if the database is down)", async () => {
    const res = await call("does-not-exist-health");
    expect([404, 503]).toContain(res.status);
    const body = (await res.json()) as { error: { code: string; message: string; requestId: string } };
    expect(body.error.requestId).toBeTruthy();
    expect(JSON.stringify(body)).not.toMatch(/prisma|stack|at .*\.ts/i);
  });

  it("is rate-limited", async () => {
    const statuses: number[] = [];
    for (let i = 0; i < 40; i++) statuses.push((await call("rate-limit-probe-health")).status);
    expect(statuses).toContain(429);
  });
});

describe("GET /api/health reports the cluster the server is configured for", () => {
  it("includes `cluster` (derived from SOLANA_RPC_URL) so the browser can confirm it matches before signing", async () => {
    const res = await getLiveness();
    const body = (await res.json()) as { cluster?: string };
    expect(body.cluster).toBe("devnet");
  });
});
