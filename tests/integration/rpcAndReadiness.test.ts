import { describe, expect, it } from "vitest";
import { PUBLIC_DEVNET_RPC_URL, classifyRpcError, isPublicDefaultRpc, resolveClusterFromRpcUrl } from "../../packages/solana/src/connection.js";
import { readinessHeadline, readinessReason, readinessVerdict, type ReadinessCheck, type ReadinessId, type ReadinessStatus } from "../../apps/web/src/lib/readiness.js";
import { GET as getHealth } from "../../apps/web/src/app/api/health/route.js";

const check = (id: ReadinessId, status: ReadinessStatus): ReadinessCheck => ({ id, label: id, status, detail: "" });
const allPass = (): ReadinessCheck[] => (["metamask", "network", "wallet", "sol", "quote", "rpc", "pool", "oracle", "simulation"] as const).map((id) => check(id, "pass"));

describe("classifyRpcError — a throttled endpoint is never reported as an empty balance", () => {
  it("recognises HTTP 429 in the forms web3.js and providers produce", () => {
    expect(classifyRpcError(new Error("429 Too Many Requests: {\"jsonrpc\":\"2.0\"}"))).toBe("rate_limited");
    expect(classifyRpcError(new Error("Server responded with 429 . Retrying after 500ms delay..."))).toBe("rate_limited");
    expect(classifyRpcError(new Error("rate limit exceeded"))).toBe("rate_limited");
  });

  it("treats every other failure as unavailable", () => {
    expect(classifyRpcError(new Error("fetch failed"))).toBe("unavailable");
    expect(classifyRpcError("boom")).toBe("unavailable");
    expect(classifyRpcError(new Error("Invalid param: could not find account 4290"))).toBe("unavailable");
  });
});

describe("RPC defaults", () => {
  it("knows the public default, with or without a trailing slash, and nothing else", () => {
    expect(isPublicDefaultRpc(PUBLIC_DEVNET_RPC_URL)).toBe(true);
    expect(isPublicDefaultRpc(`${PUBLIC_DEVNET_RPC_URL}/`)).toBe(true);
    expect(isPublicDefaultRpc("https://devnet.helius-rpc.com/?api-key=x")).toBe(false);
  });

  it("derives devnet from the provider URLs ELF documents (the URL must contain 'devnet')", () => {
    expect(resolveClusterFromRpcUrl(PUBLIC_DEVNET_RPC_URL)).toBe("devnet");
    expect(resolveClusterFromRpcUrl("https://devnet.helius-rpc.com/?api-key=x")).toBe("devnet");
    expect(resolveClusterFromRpcUrl("https://solana-devnet.g.alchemy.com/v2/x")).toBe("devnet");
    expect(resolveClusterFromRpcUrl("https://api.mainnet-beta.solana.com")).toBe("mainnet-beta");
  });
});

describe("readinessVerdict", () => {
  it("is ready only when every blocking check passes; a missing oracle does not block", () => {
    expect(readinessVerdict(allPass())).toBe("ready");
    expect(readinessVerdict(allPass().map((c) => (c.id === "oracle" ? check("oracle", "warn") : c)))).toBe("ready");
  });

  it("is not ready when any blocking check fails", () => {
    expect(readinessVerdict(allPass().map((c) => (c.id === "quote" ? check("quote", "fail") : c)))).toBe("not_ready");
  });

  it("is unverified — never ready — when something could not be read (e.g. a rate-limited RPC) or was skipped", () => {
    expect(readinessVerdict(allPass().map((c) => (c.id === "sol" ? check("sol", "unavailable") : c)))).toBe("unverified");
    expect(readinessVerdict(allPass().map((c) => (c.id === "simulation" ? check("simulation", "skipped") : c)))).toBe("unverified");
    expect(readinessVerdict(allPass().map((c) => (c.id === "rpc" ? check("rpc", "warn") : c)))).toBe("unverified");
  });
});

describe("GET /api/health RPC diagnostics", () => {
  it("reports cluster and RPC state as booleans/names only — never the RPC URL or a key", async () => {
    const res = await getHealth();
    const body = (await res.json()) as Record<string, unknown>;
    expect(body.cluster).toBe("devnet");
    expect(typeof body.rpcConfigured).toBe("boolean");
    expect(typeof body.rpcDedicated).toBe("boolean");
    expect(typeof body.rpcReachable).toBe("boolean");
    expect(["ok", "rate_limited", "unavailable"]).toContain(body.rpcStatus);
    expect(typeof body.frontendClusterMatches).toBe("boolean");
    const text = JSON.stringify(body);
    expect(text).not.toMatch(/https?:\/\//);
    expect(text).not.toMatch(/api[-_]?key/i);
  }, 30_000);
});

describe("readinessHeadline / readinessReason — wording follows the side on screen", () => {
  it("ready reads 'READY for BUY' on the BUY tab and 'READY for SELL' on the SELL tab — never the other side's", () => {
    expect(readinessHeadline("ready", "buy")).toBe("READY for BUY");
    expect(readinessHeadline("ready", "sell")).toBe("READY for SELL");
    expect(readinessHeadline("ready", "sell")).not.toMatch(/BUY/);
    expect(readinessHeadline("ready", "buy")).not.toMatch(/SELL/);
  });

  it("not ready and unverified name the side and never say ready", () => {
    expect(readinessHeadline("not_ready", "sell")).toBe("NOT READY for SELL");
    expect(readinessHeadline("unverified", "buy")).toMatch(/^UNVERIFIED .* not treated as ready for BUY$/);
    expect(readinessHeadline("unverified", "sell")).not.toMatch(/^READY/);
  });

  it("the reason is the first failing blocking check, else the first unreadable one, else null when ready", () => {
    const withDetail = (c: ReadinessCheck, detail: string): ReadinessCheck => ({ ...c, label: c.id, detail });
    const base = allPass();
    expect(readinessReason(base)).toBeNull();
    const failing = base.map((c) => (c.id === "sol" ? withDetail(check("sol", "fail"), "0 SOL (needs about 0.01 for fees)") : c));
    expect(readinessReason(failing)).toBe("sol — 0 SOL (needs about 0.01 for fees)");
    const unreadable = base.map((c) => (c.id === "rpc" ? withDetail(check("rpc", "warn"), "RATE LIMITED") : c));
    expect(readinessReason(unreadable)).toBe("rpc — RATE LIMITED");
    // a failing oracle is informational and is never the reason
    expect(readinessReason(base.map((c) => (c.id === "oracle" ? check("oracle", "fail") : c)))).toBeNull();
  });

  it("a SELL checklist (base-token check instead of the quote-token check) can be ready", () => {
    const sell = allPass().filter((c) => c.id !== "quote").concat(check("base", "pass"));
    expect(readinessVerdict(sell)).toBe("ready");
    expect(readinessVerdict(sell.map((c) => (c.id === "base" ? check("base", "fail") : c)))).toBe("not_ready");
  });
});
