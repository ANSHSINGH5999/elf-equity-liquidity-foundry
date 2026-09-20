import { afterEach, describe, expect, it } from "vitest";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { rpcProviderHost } from "../../packages/solana/src/connection.js";
import { describeBalance } from "../../apps/web/src/components/markets/trade-state.js";
import { GET as getHealth } from "../../apps/web/src/app/api/health/route.js";
import { POST as runIndexer } from "../../apps/web/src/app/api/indexer/run/route.js";
import { startStubRpc, type StubRpc } from "../helpers/stubRpc.js";

const health = (query = "") => getHealth(new Request(`http://localhost/api/health${query}`));

let stub: StubRpc | null = null;
const ORIGINAL_RPC = process.env.SOLANA_RPC_URL;
const ORIGINAL_SECRET = process.env.INDEXER_SECRET;
afterEach(async () => {
  await stub?.close();
  stub = null;
  if (ORIGINAL_RPC === undefined) delete process.env.SOLANA_RPC_URL;
  else process.env.SOLANA_RPC_URL = ORIGINAL_RPC;
  if (ORIGINAL_SECRET === undefined) delete process.env.INDEXER_SECRET;
  else process.env.INDEXER_SECRET = ORIGINAL_SECRET;
});
const pointRpcAt = (s: StubRpc) => {
  stub = s;
  process.env.SOLANA_RPC_URL = s.url;
};

describe("rpcProviderHost — the only thing about the RPC URL that may be shown", () => {
  it("returns the registrable domain, never the subdomain, path or key", () => {
    expect(rpcProviderHost("https://api.devnet.solana.com")).toBe("solana.com");
    expect(rpcProviderHost("https://devnet.helius-rpc.com/?api-key=SECRET123")).toBe("helius-rpc.com");
    expect(rpcProviderHost("https://my-endpoint-id.solana-devnet.quiknode.pro/SECRETPATH/")).toBe("quiknode.pro");
    expect(rpcProviderHost("https://solana-devnet.g.alchemy.com/v2/SECRET")).toBe("alchemy.com");
  });

  it("does not describe a local or IP endpoint, and survives garbage", () => {
    expect(rpcProviderHost("http://127.0.0.1:8899/devnet")).toBe("local/ip");
    expect(rpcProviderHost("http://localhost:8899")).toBe("local/ip");
    expect(rpcProviderHost("not a url")).toBe("invalid-url");
  });
});

describe("GET /api/health RPC diagnostics", () => {
  it("verifies the cluster by genesis hash and exposes no URL, key or subdomain", async () => {
    pointRpcAt(await startStubRpc({ genesisOf: "devnet" }));
    const body = (await (await health()).json()) as Record<string, any>;
    expect(body.cluster).toBe("devnet");
    expect(body.clusterVerified).toBe(true);
    expect(body.rpc.providerHost).toBe("local/ip");
    const text = JSON.stringify(body);
    expect(text).not.toMatch(/127\.0\.0\.1|devnet-stub|https?:\/\/|api[-_]?key/i);
  });

  it("refuses to let a mainnet endpoint masquerade as devnet, even when its URL says devnet", async () => {
    pointRpcAt(await startStubRpc({ genesisOf: "mainnet-beta" }));
    const body = (await (await health()).json()) as Record<string, any>;
    expect(body.cluster).toBe("devnet"); // what the URL claims
    expect(body.clusterVerified).toBe(false); // what the chain says: it is not
  });

  it("detects HTTP 429 immediately instead of hiding it behind retry backoff", async () => {
    pointRpcAt(await startStubRpc({ rateLimited: true }));
    const startedAt = Date.now();
    const res = await health("?deep=1");
    const body = (await res.json()) as Record<string, any>;
    expect(Date.now() - startedAt).toBeLessThan(3000); // web3.js' default retry alone would take ~7.5s
    expect(body.rateLimited).toBe(true);
    expect(body.rpcStatus).toBe("rate_limited");
    expect(body.rpcReachable).toBe(false);
    expect(res.status).toBe(503);
    for (const p of ["getLatestBlockhash", "getBalance", "getSlot", "accountLookup"]) {
      expect(body.rpc[p].status).toBe("rate_limited");
      expect(typeof body.rpc[p].latencyMs).toBe("number");
    }
  });

  it("only runs the extra read probes when asked (`?deep=1`), so a monitor does not burn quota", async () => {
    pointRpcAt(await startStubRpc({ genesisOf: "devnet" }));
    const shallow = (await (await health()).json()) as Record<string, any>;
    expect(shallow.rpc.getBalance).toBeUndefined();
    const deep = (await (await health("?deep=1")).json()) as Record<string, any>;
    expect(Object.keys(deep.rpc)).toEqual(expect.arrayContaining(["getLatestBlockhash", "getBalance", "getSlot", "accountLookup"]));
  });
});

describe("POST /api/indexer/run verifies the cluster before indexing", () => {
  it("refuses an endpoint whose genesis is not the configured cluster", async () => {
    process.env.INDEXER_SECRET = "correct-secret-value";
    pointRpcAt(await startStubRpc({ genesisOf: "mainnet-beta" }));
    const res = await runIndexer(new Request("http://localhost/api/indexer/run", { method: "POST", headers: { authorization: "Bearer correct-secret-value" } }));
    const body = (await res.json()) as { error: { code: string } };
    expect(body.error.code).toBe("network_mismatch");
  });
});

describe("describeBalance — five facts, five different sentences", () => {
  const base = { symbol: "USDC" };
  it("a positive balance is an amount", () => {
    expect(describeBalance({ ...base, value: 17, accountExists: true, problem: null })).toEqual({ kind: "amount", text: "17 USDC" });
  });
  it("an existing, empty account is a zero balance", () => {
    expect(describeBalance({ ...base, value: 0, accountExists: true, problem: null }).kind).toBe("zero");
  });
  it("a missing token account is not the same as an empty one", () => {
    const d = describeBalance({ ...base, value: 0, accountExists: false, problem: null });
    expect(d.kind).toBe("no_account");
    expect(d.text).toMatch(/no USDC token account/);
  });
  it("a throttled read is unknown — never shown as zero", () => {
    const d = describeBalance({ ...base, value: null, accountExists: null, problem: "rate_limited" });
    expect(d.kind).toBe("rate_limited");
    expect(d.text).toMatch(/rate limited/);
    expect(d.text).not.toMatch(/^0 /);
  });
  it("an unreachable RPC is unknown — never shown as zero", () => {
    const d = describeBalance({ ...base, value: null, accountExists: null, problem: "unavailable" });
    expect(d.kind).toBe("unavailable");
    expect(d.text).toMatch(/temporarily unavailable/);
  });
});

describe("one RPC source of truth (static)", () => {
  const root = join(__dirname, "../..");
  const walk = (dir: string): string[] =>
    readdirSync(dir).flatMap((f) => {
      const p = join(dir, f);
      if (f === "node_modules" || f === ".next" || f === "generated") return [];
      return statSync(p).isDirectory() ? walk(p) : /\.(ts|tsx)$/.test(f) ? [p] : [];
    });
  const sources = [join(root, "apps/web/src"), ...readdirSync(join(root, "packages")).map((d) => join(root, "packages", d, "src"))]
    .filter((d) => { try { return statSync(d).isDirectory(); } catch { return false; } })
    .flatMap(walk);
  const strip = (f: string) => readFileSync(f, "utf8").replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "");
  const rel = (f: string) => f.slice(root.length + 1);
  const where = (needle: RegExp) => sources.filter((f) => needle.test(strip(f))).map(rel).sort();

  it("a Connection is only ever constructed in @elf/solana's createConnection", () => {
    expect(where(/new Connection\(/)).toEqual(["packages/solana/src/connection.ts"]);
  });

  it("the public devnet endpoint is spelled out once, and no mainnet endpoint appears at all", () => {
    expect(where(/api\.devnet\.solana\.com/)).toEqual(["packages/solana/src/connection.ts"]);
    expect(where(/mainnet-beta\.solana\.com|clusterApiUrl/)).toEqual([]);
  });

  it("the RPC env vars are read only by the modules that own them", () => {
    expect(where(/process\.env\.SOLANA_RPC_URL/)).toEqual(["apps/web/src/app/api/health/route.ts", "apps/web/src/lib/server/rpc.ts", "packages/indexer/src/cli.ts"]);
    expect(where(/process\.env\.NEXT_PUBLIC_SOLANA_RPC_URL/)).toEqual(["apps/web/src/app/api/health/route.ts", "apps/web/src/lib/solana-config.ts"]);
  });
});
