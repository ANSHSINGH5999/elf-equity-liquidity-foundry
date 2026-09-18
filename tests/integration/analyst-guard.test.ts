import { describe, expect, it } from "vitest";
import { analyzeMarketRuleBased, ruleBasedAnalystProvider, type MarketAnalystProvider } from "../../packages/market-engine/src/index.js";
import { AnalystGuardrailError, getAnalystProvider, runMarketAnalysis } from "../../apps/web/src/lib/server/analyst.js";
import type { IssuerDashboard, MarketAnalysis } from "../../packages/shared/src/index.js";

const now = "2026-09-20T12:00:00.000Z";
const m = (value: number) => ({ value, timestamp: now, source: "ON_CHAIN" as const });
const dashboard = {
  overview: {
    marketId: "m", poolAddress: "P", status: "live", regime: "healthy",
    priceUsd: m(10), liquidityUsd: m(100_000), volume24hUsd: m(1_000), volume7dUsd: m(1_000),
    tradeCount24h: 2, uniqueTraders24h: 2, buyVolumeUsd24h: 600, sellVolumeUsd24h: 400, buySellRatio24h: 1,
    priceChange24h: { available: false, reason: "x" }, liquidityChange24h: { available: false, reason: "x" },
    graduation: { quoteReserveUsd: 1, migrationThresholdUsd: 100, percentageComplete: 1, estimatedReadiness: "early" },
    graduationChecklist: [], marketQualityScore: {}, referencePriceUsd: 10, referencePriceSource: "issuer_declared",
    referencePriceFeedSymbol: null, priceOracle: [], freshness: { status: "live", lastIndexedAt: now, lagSeconds: 3 },
  },
  totalTrades: 2, uniqueTradersAllTime: 2, targetLiquidityUsd: 200_000, indicators: [],
} as unknown as IssuerDashboard;

const adviceAnalysis = (base: MarketAnalysis): MarketAnalysis => ({
  ...base,
  provider: { id: "fake-llm", kind: "llm" },
  observations: [{ text: "You should buy now, the price will rise.", sources: ["dbc"] }],
});

describe("runMarketAnalysis guardrail", () => {
  it("uses the deterministic rule-based provider by default (no LLM, no key)", () => {
    expect(getAnalystProvider().kind).toBe("rule_based");
  });

  it("returns clean rule-based output unchanged", async () => {
    expect(await runMarketAnalysis(dashboard)).toEqual(analyzeMarketRuleBased(dashboard));
  });

  it("an LLM-kind provider that emits advice is DISCARDED and replaced by the rule-based analysis", async () => {
    const llm: MarketAnalystProvider = {
      id: "fake-llm",
      kind: "llm",
      analyze: async (d) => adviceAnalysis(analyzeMarketRuleBased(d)),
    };
    const result = await runMarketAnalysis(dashboard, llm);
    expect(result.provider.kind).toBe("rule_based");
    expect(JSON.stringify(result)).not.toMatch(/should buy now|will rise/i);
  });

  it("an LLM-kind provider with clean output is passed through", async () => {
    const llm: MarketAnalystProvider = { id: "fake-llm", kind: "llm", analyze: async (d) => ({ ...analyzeMarketRuleBased(d), provider: { id: "fake-llm", kind: "llm" } }) };
    expect((await runMarketAnalysis(dashboard, llm)).provider.id).toBe("fake-llm");
  });

  it("a flagged rule-based provider is a bug in ELF's own wording and throws instead of shipping it", async () => {
    const buggy: MarketAnalystProvider = {
      id: "elf-rule-based-buggy",
      kind: "rule_based",
      analyze: async (d) => ({ ...adviceAnalysis(analyzeMarketRuleBased(d)), provider: { id: "elf-rule-based-buggy", kind: "rule_based" } }),
    };
    await expect(runMarketAnalysis(dashboard, buggy)).rejects.toBeInstanceOf(AnalystGuardrailError);
  });

  it("a provider that throws surfaces the error (the route maps it to a 500, no partial output)", async () => {
    const broken: MarketAnalystProvider = { id: "x", kind: "llm", analyze: async () => { throw new Error("upstream down"); } };
    await expect(runMarketAnalysis(dashboard, broken)).rejects.toThrow("upstream down");
  });

  it("the shipped provider is exactly ruleBasedAnalystProvider", () => {
    expect(getAnalystProvider()).toBe(ruleBasedAnalystProvider);
  });
});
