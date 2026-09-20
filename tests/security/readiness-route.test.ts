import { beforeEach, describe, expect, it, vi } from "vitest";

/**
 * GET /api/dbc/:pool/readiness for both sides. Everything on-chain is a stub (no network); what is under test is which
 * checks each side runs, what the simulation is asked to dry-run, and that a SELL never inherits BUY verdicts.
 */
const WALLET = "5w4DDXyxyDGPvqZK51htobEpUSjdeh8QyCQe4LkKRzYC";
const POOL = "5XeQcXNLoqeoVunzvAQpuxM8gXX3iKVwLZPywKkDn1tr";
const BASE_MINT = "DF2UiBQXEj3S3abpipV7EyNqz8fhrwZ3hTo5adaw8zkF";
const QUOTE_MINT = "4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU";
const DEVNET_GENESIS = "EtWTRABZaYq6iMfeYKouRu166VU2xqa1wcaWoxPkrZBG";

const held = vi.hoisted(() => ({ base: "15.092034867", quote: "11.277273", sol: 19_800_000_000, swapCalls: [] as unknown[], swapStatus: 200 }));

vi.mock("@/lib/server/rate-limit", () => ({ checkRateLimit: () => true, clientKeyFromRequest: () => "test" }));
vi.mock("@/lib/server/rpc", () => ({
  getServerRpcUrl: () => "https://solana-devnet.example.test/v2/x",
  getServerConnection: () => ({
    rpcEndpoint: "https://solana-devnet.example.test/v2/x",
    getGenesisHash: async () => DEVNET_GENESIS,
    getLatestBlockhash: async () => ({ blockhash: "b", lastValidBlockHeight: 1 }),
    getBalance: async () => held.sol,
    getParsedTokenAccountsByOwner: async (_owner: unknown, filter: { mint: { toBase58(): string } }) => {
      const amount = filter.mint.toBase58() === BASE_MINT ? held.base : held.quote;
      return { value: amount === "" ? [] : [{ pubkey: { toBase58: () => "3dpkn58hDFbnXDUsh8zSVwg7kc3t5CARYuwQRKCMNsBR", equals: () => true }, account: { owner: { toBase58: () => "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA", toBuffer: () => Buffer.alloc(32) }, data: { parsed: { info: { tokenAmount: { uiAmountString: amount } } } } } }] };
    },
  }),
}));
vi.mock("../../packages/meteora-adapter/src/index.js", () => ({
  getLivePoolState: async () => ({ isMigrated: false, tokenQuoteDecimal: 6, baseMint: BASE_MINT, quoteMint: QUOTE_MINT }),
  getQuoteUsdPrice: async () => 1,
}));
vi.mock("../../packages/db/src/index.js", () => ({ prisma: { launch: { findFirst: async () => ({ stage: "LIVE", status: "live", asset: { symbol: "ANDURIL" } }) } } }));
vi.mock("@/lib/server/pyth", () => ({ getPythPriceComparison: async () => [] }));
vi.mock("../../apps/web/src/app/api/dbc/[poolAddress]/swap/route.js", () => ({
  POST: async (request: Request) => {
    held.swapCalls.push(JSON.parse(await request.text()));
    return held.swapStatus === 200 ? new Response("{}", { status: 200 }) : new Response(JSON.stringify({ error: { message: "Simulation failed: custom program error" } }), { status: held.swapStatus });
  },
}));

import { GET } from "../../apps/web/src/app/api/dbc/[poolAddress]/readiness/route.js";

const get = (query: string) => GET(new Request(`http://localhost/api/dbc/${POOL}/readiness?${query}`), { params: Promise.resolve({ poolAddress: POOL }) });
const body = async (r: Response) => (await r.json()) as { side: string; verdict: string; checks: { id: string; status: string; label: string; detail: string }[]; amountUsd?: number; amountTokens?: number };
const status = (b: Awaited<ReturnType<typeof body>>, id: string) => b.checks.find((c) => c.id === id)?.status;

beforeEach(() => {
  held.base = "15.092034867";
  held.quote = "11.277273";
  held.sol = 19_800_000_000;
  held.swapCalls = [];
  held.swapStatus = 200;
  vi.spyOn(console, "error").mockImplementation(() => undefined);
});

describe("readiness route — validation", () => {
  it.each([
    ["unknown side", `wallet=${WALLET}&side=hold`],
    ["a sell with no amountTokens", `wallet=${WALLET}&side=sell`],
    ["a sell of zero", `wallet=${WALLET}&side=sell&amountTokens=0`],
    ["a sell of a negative amount", `wallet=${WALLET}&side=sell&amountTokens=-3`],
    ["a sell of a non-number", `wallet=${WALLET}&side=sell&amountTokens=abc`],
    ["a buy of a negative amount", `wallet=${WALLET}&side=buy&amountUsd=-5`],
  ])("rejects %s with 400 before touching the chain", async (_n, query) => {
    const res = await get(query);
    expect(res.status).toBe(400);
    expect(held.swapCalls).toHaveLength(0);
  });
});

describe("readiness route — BUY (unchanged behaviour)", () => {
  it("defaults to a BUY: checks the USDC balance, dry-runs a buy of amountUsd, and is ready", async () => {
    const b = await body(await get(`wallet=${WALLET}&amountUsd=5`));
    expect(b).toMatchObject({ side: "buy", amountUsd: 5, verdict: "ready" });
    expect(status(b, "quote")).toBe("pass");
    expect(b.checks.some((c) => c.id === "base")).toBe(false);
    expect(held.swapCalls).toEqual([expect.objectContaining({ side: "buy", amountUsd: 5 })]);
    expect(held.swapCalls[0]).not.toHaveProperty("amountTokens");
  });

  it("insufficient USDC makes a BUY not ready, and the simulation is skipped", async () => {
    held.quote = "1";
    const b = await body(await get(`wallet=${WALLET}&side=buy&amountUsd=100`));
    expect(b.verdict).toBe("not_ready");
    expect(status(b, "quote")).toBe("fail");
    expect(status(b, "simulation")).toBe("skipped");
    expect(held.swapCalls).toHaveLength(0);
  });
});

describe("readiness route — SELL", () => {
  it("checks the wallet's base-token balance (not USDC) and dry-runs a SELL of exactly amountTokens", async () => {
    const b = await body(await get(`wallet=${WALLET}&side=sell&amountTokens=1`));
    expect(b).toMatchObject({ side: "sell", amountTokens: 1, verdict: "ready" });
    expect(b.checks.some((c) => c.id === "quote")).toBe(false);
    const base = b.checks.find((c) => c.id === "base")!;
    expect(base).toMatchObject({ status: "pass", label: "ANDURIL" });
    expect(base.detail).toContain("15.092034867");
    expect(held.swapCalls).toEqual([expect.objectContaining({ side: "sell", amountTokens: 1, payerPublicKey: WALLET, slippageBps: 100 })]);
    expect(held.swapCalls[0]).not.toHaveProperty("amountUsd");
    expect(b.checks.find((c) => c.id === "simulation")!.detail).toContain("sell of 1 ANDURIL");
  });

  it("a SELL does not need USDC: with zero USDC it is still ready", async () => {
    held.quote = "0";
    expect((await body(await get(`wallet=${WALLET}&side=sell&amountTokens=1`))).verdict).toBe("ready");
  });

  it("selling more than the wallet holds is not ready; the reason names the balance, and nothing is simulated", async () => {
    const b = await body(await get(`wallet=${WALLET}&side=sell&amountTokens=20`));
    expect(b.verdict).toBe("not_ready");
    expect(status(b, "base")).toBe("fail");
    expect(b.checks.find((c) => c.id === "base")!.detail).toMatch(/15\.092034867.*needs 20/);
    expect(status(b, "simulation")).toBe("skipped");
    expect(held.swapCalls).toHaveLength(0);
  });

  it("a wallet with no token account for the base mint holds nothing to sell", async () => {
    held.base = "";
    const b = await body(await get(`wallet=${WALLET}&side=sell&amountTokens=1`));
    expect(b.verdict).toBe("not_ready");
    expect(b.checks.find((c) => c.id === "base")!.detail).toMatch(/nothing to sell/);
  });

  it("a SELL needs SOL only for fees: 0.02 SOL is enough, 0.001 SOL is not", async () => {
    held.sol = 20_000_000;
    expect(status(await body(await get(`wallet=${WALLET}&side=sell&amountTokens=1`)), "sol")).toBe("pass");
    held.sol = 1_000_000;
    const b = await body(await get(`wallet=${WALLET}&side=sell&amountTokens=1`));
    expect(status(b, "sol")).toBe("fail");
    expect(b.verdict).toBe("not_ready");
  });

  it("a failing dry-run SELL is not ready and carries the real simulation error", async () => {
    held.swapStatus = 400;
    const b = await body(await get(`wallet=${WALLET}&side=sell&amountTokens=1`));
    expect(b.verdict).toBe("not_ready");
    expect(b.checks.find((c) => c.id === "simulation")).toMatchObject({ status: "fail", detail: "Simulation failed: custom program error" });
  });

  it("no wallet: a SELL is not ready and never simulated", async () => {
    const b = await body(await get("side=sell&amountTokens=1"));
    expect(b.verdict).toBe("not_ready");
    expect(status(b, "wallet")).toBe("fail");
    expect(status(b, "base")).toBe("skipped");
    expect(held.swapCalls).toHaveLength(0);
  });
});
