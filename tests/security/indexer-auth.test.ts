import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";
import { POST as runIndexer } from "../../apps/web/src/app/api/indexer/run/route.js";

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
 * LOW-3 regression test (security remediation): POST /api/indexer/run
 * must fail CLOSED when INDEXER_SECRET is unset in production, not
 * silently run unauthenticated. See docs/security-remediation.md.
 *
 * `route.ts` reads `process.env.INDEXER_SECRET` / `NODE_ENV` fresh on
 * every request (not at module load time), so these tests can mutate
 * them per case without re-importing the module.
 */
const ORIGINAL_SECRET = process.env.INDEXER_SECRET;
const ORIGINAL_NODE_ENV = process.env.NODE_ENV;

function request(authHeader?: string): Request {
  return new Request("http://localhost/api/indexer/run", {
    method: "POST",
    headers: authHeader ? { authorization: authHeader } : {},
  });
}

afterEach(() => {
  if (ORIGINAL_SECRET === undefined) delete process.env.INDEXER_SECRET;
  else process.env.INDEXER_SECRET = ORIGINAL_SECRET;
  // @ts-expect-error -- NODE_ENV is a plain string env var here, not the literal union some type defs pin it to.
  process.env.NODE_ENV = ORIGINAL_NODE_ENV;
});

describe("POST /api/indexer/run auth (LOW-3)", () => {
  it("denies a request with a WRONG secret when one is configured", async () => {
    process.env.INDEXER_SECRET = "correct-secret-value";
    const response = await runIndexer(request("Bearer wrong-secret-value"));
    expect(response.status).toBe(401);
    const body = await response.json();
    expect(body.error.code).toBe("unauthorized");
  });

  it("denies a request with NO Authorization header when a secret is configured", async () => {
    process.env.INDEXER_SECRET = "correct-secret-value";
    const response = await runIndexer(request());
    expect(response.status).toBe(401);
  });

  it("does not reject on auth grounds with the CORRECT secret", async () => {
    process.env.INDEXER_SECRET = "correct-secret-value";
    const response = await runIndexer(request("Bearer correct-secret-value"));
    // The indexer pass itself may still fail for unrelated reasons in a
    // sandboxed test environment (no live RPC) — 503 rpc_unavailable is an
    // acceptable *non-auth* outcome. What must never happen is a 401/500
    // auth-configuration rejection once the correct secret was presented.
    expect(response.status).not.toBe(401);
    if (response.status !== 200) {
      const body = await response.json();
      expect(body.error.code).not.toBe("unauthorized");
      expect(body.error.message).not.toMatch(/INDEXER_SECRET is not configured/);
    }
  });

  it("FAILS CLOSED (denies) when INDEXER_SECRET is missing and NODE_ENV is production", async () => {
    delete process.env.INDEXER_SECRET;
    // @ts-expect-error -- see afterEach.
    process.env.NODE_ENV = "production";
    const response = await runIndexer(request());
    expect(response.status).toBe(500);
    const body = await response.json();
    expect(body.error.message).toMatch(/INDEXER_SECRET is not configured/);
  });

  it("documents the deliberate dev-only exception: missing secret outside production is not blocked on auth grounds", async () => {
    delete process.env.INDEXER_SECRET;
    // @ts-expect-error -- see afterEach.
    process.env.NODE_ENV = "development";
    const response = await runIndexer(request());
    expect(response.status).not.toBe(401);
    expect(response.status).not.toBe(500);
  });
});
