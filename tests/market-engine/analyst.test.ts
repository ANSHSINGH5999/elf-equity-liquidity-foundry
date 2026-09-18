import { describe, expect, it } from "vitest";
import {
  ANALYST_DISCLAIMER,
  analysisText,
  analyzeMarketRuleBased,
  computeRiskIndicators,
  findAdviceViolations,
  ruleBasedAnalystProvider,
} from "../../packages/market-engine/src/index.js";
import type { IssuerDashboard, PriceOracleFeed } from "../../packages/shared/src/index.js";

const now = "2026-09-20T12:00:00.000Z";
const metric = (value: number, source: "ON_CHAIN" | "INDEXED" = "ON_CHAIN") => ({ value, timestamp: now, source });

function dashboard(overrides: {
  status?: IssuerDashboard["overview"]["status"];
  liquidityUsd?: number;
  targetLiquidityUsd?: number;
  reserveUsd?: number;
  thresholdUsd?: number;
  trades24h?: number;
  buyVol?: number;
  sellVol?: number;
  feeds?: PriceOracleFeed[];
  indexer?: "live" | "delayed" | "unavailable";
  priceChange?: number | null;
  topShare?: number | null;
  largestTradeUsd?: number | null;
} = {}): IssuerDashboard {
  const liquidityUsd = overrides.liquidityUsd ?? 250_000;
  const targetLiquidityUsd = overrides.targetLiquidityUsd ?? 500_000;
  const thresholdUsd = overrides.thresholdUsd ?? 1_000_000;
  const reserveUsd = overrides.reserveUsd ?? 250_000;
  const trades24h = overrides.trades24h ?? 12;
  const feeds = overrides.feeds ?? [];
  const indexer = overrides.indexer ?? "live";
  const pct = thresholdUsd > 0 ? Math.min(100, (reserveUsd / thresholdUsd) * 100) : 0;
  const priceChange = overrides.priceChange === undefined ? 3.2 : overrides.priceChange;

  const indicators = computeRiskIndicators({
    liquidityUsd,
    targetLiquidityUsd: targetLiquidityUsd,
    priceUsd: 10,
    referencePriceUsd: 10.5,
    referenceSource: "issuer_declared",
    oracleFeeds: feeds.map((f) => ({ priceUsd: f.priceUsd, unavailableReason: f.unavailableReason })),
    tradeCount24h: trades24h,
    indexerStatus: indexer,
    topTraderVolumeShare: overrides.topShare === undefined ? 0.3 : overrides.topShare,
    largestTradeUsd: overrides.largestTradeUsd === undefined ? 4_000 : overrides.largestTradeUsd,
  });

  return {
    overview: {
      marketId: "m1",
      poolAddress: "PoolAddr1111111111111111111111111111111111",
      status: overrides.status ?? "live",
      regime: "healthy",
      priceUsd: metric(10),
      liquidityUsd: metric(liquidityUsd),
      volume24hUsd: metric((overrides.buyVol ?? 30_000) + (overrides.sellVol ?? 10_000), "INDEXED"),
      volume7dUsd: metric(100_000, "INDEXED"),
      tradeCount24h: trades24h,
      uniqueTraders24h: trades24h > 0 ? 5 : 0,
      buyVolumeUsd24h: overrides.buyVol ?? 30_000,
      sellVolumeUsd24h: overrides.sellVol ?? 10_000,
      buySellRatio24h: (overrides.sellVol ?? 10_000) > 0 ? 3 : null,
      priceChange24h: priceChange === null ? { available: false, reason: "no history" } : metric(priceChange),
      liquidityChange24h: { available: false, reason: "no history" },
      graduation: { quoteReserveUsd: reserveUsd, migrationThresholdUsd: thresholdUsd, percentageComplete: pct, estimatedReadiness: "early" },
      graduationChecklist: [],
      marketQualityScore: {} as never,
      referencePriceUsd: 10.5,
      referencePriceSource: "issuer_declared",
      referencePriceFeedSymbol: null,
      priceOracle: feeds,
      freshness: { status: indexer, lastIndexedAt: indexer === "unavailable" ? null : now, lagSeconds: indexer === "unavailable" ? null : indexer === "delayed" ? 900 : 5 },
    },
    totalTrades: 40,
    uniqueTradersAllTime: 9,
    targetLiquidityUsd,
    indicators,
  };
}

const restrictedFeeds: PriceOracleFeed[] = ["equity", "xstock", "ondo"].map((kind) => ({
  kind: kind as PriceOracleFeed["kind"],
  label: kind,
  feedSymbol: `X.${kind}`,
  feedId: kind,
  priceUsd: null,
  publishTime: null,
  unavailableReason: "entitlement_restricted" as const,
}));
const liveFeed: PriceOracleFeed = { kind: "equity", label: "eq", feedSymbol: "Equity.US.X/USD", feedId: "a", priceUsd: 10.2, publishTime: now, unavailableReason: null };

const scenarios: Record<string, IssuerDashboard> = {
  healthy: dashboard({ feeds: [liveFeed] }),
  "pyth restricted": dashboard({ feeds: restrictedFeeds }),
  "no indexer": dashboard({ indexer: "unavailable", trades24h: 0, topShare: null, largestTradeUsd: null, priceChange: null }),
  "indexer delayed": dashboard({ indexer: "delayed" }),
  "no trades": dashboard({ trades24h: 0, buyVol: 0, sellVol: 0, topShare: null, largestTradeUsd: null }),
  "low liquidity": dashboard({ liquidityUsd: 100_000 }),
  "concentrated + large trade": dashboard({ topShare: 0.9, largestTradeUsd: 60_000 }),
  graduated: dashboard({ status: "graduated", reserveUsd: 1_000_000 }),
  "threshold unreadable": dashboard({ thresholdUsd: 0 }),
  "no liquidity target": dashboard({ targetLiquidityUsd: 0 }),
  "no sells": dashboard({ sellVol: 0 }),
};

describe("analyzeMarketRuleBased", () => {
  it.each(Object.entries(scenarios))("%s: never contains advice or predictions (guardrail passes on its own output)", (_name, d) => {
    expect(findAdviceViolations(analysisText(analyzeMarketRuleBased(d)))).toEqual([]);
  });

  it.each(Object.entries(scenarios))("%s: never leaks NaN / undefined / Infinity into user-facing text", (_name, d) => {
    const text = analysisText(analyzeMarketRuleBased(d));
    expect(text).not.toMatch(/NaN|undefined|Infinity|\[object/);
  });

  it.each(Object.entries(scenarios))("%s: always has five ordered sections, at least one observation, and the disclaimer", (_name, d) => {
    const a = analyzeMarketRuleBased(d);
    expect(a.sections.map((s) => s.id)).toEqual(["overview", "liquidity", "trading_activity", "oracle", "graduation"]);
    expect(a.observations.length).toBeGreaterThan(0);
    expect(a.disclaimer).toBe(ANALYST_DISCLAIMER);
    for (const s of a.sections) expect(s.lines.length).toBeGreaterThan(0);
  });

  it("always declares live market cap unavailable — it is never estimated", () => {
    for (const d of Object.values(scenarios)) {
      expect(analyzeMarketRuleBased(d).unavailableData.join(" ")).toMatch(/market cap/i);
    }
  });

  it("is honest that it is rule-based, not an LLM", () => {
    const a = analyzeMarketRuleBased(scenarios.healthy!);
    expect(a.provider).toEqual({ id: "elf-rule-based-v1", kind: "rule_based" });
  });

  it("is deterministic and does not mutate its input", () => {
    const d = scenarios.healthy!;
    const snapshot = JSON.stringify(d);
    expect(analyzeMarketRuleBased(d)).toEqual(analyzeMarketRuleBased(d));
    expect(JSON.stringify(d)).toBe(snapshot);
  });

  it("the provider wrapper returns exactly what the pure function does", async () => {
    const d = scenarios.healthy!;
    expect(await ruleBasedAnalystProvider.analyze(d)).toEqual(analyzeMarketRuleBased(d));
  });

  describe("Pyth handling", () => {
    it("restricted: states the exact restriction, marks Pyth unavailable, and claims no Pyth-verified price", () => {
      const a = analyzeMarketRuleBased(scenarios["pyth restricted"]!);
      const text = analysisText(a);
      expect(text).toContain("Restricted — Pyth entitlement required");
      expect(text).toMatch(/no Pyth-verified price/i);
      expect(a.dataSources.find((s) => s.id === "pyth")!.available).toBe(false);
      expect(a.dataUsed.oracleState).toBe("entitlement_restricted");
      expect(a.unavailableData.join(" ")).toMatch(/Pyth-verified price/);
    });

    it("live: reports the live feed count and marks Pyth available", () => {
      const a = analyzeMarketRuleBased(scenarios.healthy!);
      expect(a.dataSources.find((s) => s.id === "pyth")!.available).toBe(true);
      expect(a.dataUsed.oracleLiveFeeds).toBe(1);
      expect(analysisText(a)).toMatch(/1 of 1 Pyth feeds returned a live price/);
    });

    it("never claims Pyth verification when the reference is only issuer-declared", () => {
      const text = analysisText(analyzeMarketRuleBased(scenarios["pyth restricted"]!));
      expect(text).toMatch(/issuer-declared/i);
    });
  });

  describe("missing data is stated, not guessed", () => {
    it("no indexer: says activity is unavailable and does NOT claim there were zero trades", () => {
      const a = analyzeMarketRuleBased(scenarios["no indexer"]!);
      const text = analysisText(a);
      expect(text).toMatch(/unavailable/i);
      expect(text).not.toMatch(/no indexed trades in the last 24 hours/i);
      expect(a.dataSources.find((s) => s.id === "indexer")!.available).toBe(false);
    });

    it("no trades (indexer live): states there were none", () => {
      expect(analysisText(analyzeMarketRuleBased(scenarios["no trades"]!))).toMatch(/no indexed trades in the last 24 hours/i);
    });

    it("unreadable threshold: graduation progress is reported unavailable, not 0%", () => {
      const text = analysisText(analyzeMarketRuleBased(scenarios["threshold unreadable"]!));
      expect(text).toMatch(/graduation progress is unavailable/i);
    });

    it("no liquidity target: does not fabricate a comparison", () => {
      const a = analyzeMarketRuleBased(scenarios["no liquidity target"]!);
      expect(analysisText(a)).toMatch(/No liquidity target is recorded/i);
      expect(a.dataSources.find((s) => s.id === "market_config")!.available).toBe(false);
    });

    it("missing 24h price change is reported unavailable", () => {
      const text = analysisText(analyzeMarketRuleBased(scenarios["no indexer"]!));
      expect(text).toMatch(/24h price change: data unavailable/i);
    });

    it("no sells: explains the buy/sell ratio is undefined instead of printing Infinity", () => {
      const text = analysisText(analyzeMarketRuleBased(scenarios["no sells"]!));
      expect(text).toMatch(/not defined because there were no sells/i);
    });
  });

  describe("traceability", () => {
    it("dataUsed carries the exact platform values the prose was built from", () => {
      const d = scenarios.healthy!;
      const a = analyzeMarketRuleBased(d);
      expect(a.dataUsed.liquidityUsd).toBe(d.overview.liquidityUsd.value);
      expect(a.dataUsed.trades24h).toBe(d.overview.tradeCount24h);
      expect(a.dataUsed.totalTradesAllTime).toBe(d.totalTrades);
      expect(a.dataUsed.graduationPct).toBe(d.overview.graduation.percentageComplete);
      expect(a.dataUsed.migrationThresholdUsd).toBe(d.overview.graduation.migrationThresholdUsd);
      expect(a.dataUsed.targetLiquidityUsd).toBe(d.targetLiquidityUsd);
    });

    it("every observation cites at least one real data source", () => {
      for (const d of Object.values(scenarios)) {
        for (const o of analyzeMarketRuleBased(d).observations) expect(o.sources.length).toBeGreaterThan(0);
      }
    });

    it("dataSources always lists exactly DBC, Indexer, Pyth and Market configuration", () => {
      for (const d of Object.values(scenarios)) {
        expect(analyzeMarketRuleBased(d).dataSources.map((s) => s.id)).toEqual(["dbc", "indexer", "pyth", "market_config"]);
      }
    });
  });

  describe("observations only appear when the data supports them", () => {
    it("low liquidity produces the below-half-target observation", () => {
      const a = analyzeMarketRuleBased(scenarios["low liquidity"]!);
      expect(a.observations.map((o) => o.text).join(" ")).toMatch(/below half of the issuer's own target/);
    });
    it("concentration and large-trade observations appear only on WATCH", () => {
      const hot = analyzeMarketRuleBased(scenarios["concentrated + large trade"]!).observations.map((o) => o.text).join(" ");
      expect(hot).toMatch(/single wallet accounts for 90\.0%/);
      expect(hot).toMatch(/largest 24h trade equals/);
      const calm = analyzeMarketRuleBased(scenarios.healthy!).observations.map((o) => o.text).join(" ");
      expect(calm).not.toMatch(/single wallet accounts for/);
    });
    it("a delayed indexer is called out as possibly lagging", () => {
      expect(analysisText(analyzeMarketRuleBased(scenarios["indexer delayed"]!))).not.toBe("");
      expect(analyzeMarketRuleBased(scenarios["indexer delayed"]!).observations.map((o) => o.text).join(" ")).toMatch(/behind/);
    });
    it("graduated pools say migration was executed", () => {
      expect(analysisText(analyzeMarketRuleBased(scenarios.graduated!))).toMatch(/Migration to a DAMM v2 pool has been executed/);
    });
  });
});

describe("findAdviceViolations (guardrail for every provider, including a future LLM)", () => {
  it.each([
    "You should buy now.",
    "Investors should sell before the drop.",
    "I recommend buying more tokens.",
    "We suggest holding through graduation.",
    "This is a strong buy.",
    "Buy now before it's too late.",
    "The price will rise next week.",
    "The token is going to moon.",
    "The price is expected to increase.",
    "Our price target is $20.",
    "The outlook is bullish.",
    "Guaranteed returns for early holders.",
    "It is a risk-free opportunity.",
    "Traders could accumulate here.",
    "The token is a sell.",
    "Rated buy by ELF.",
    "Analysts see a clear hold here.",
  ])("flags advice / prediction: %s", (text) => {
    expect(findAdviceViolations(text).length).toBeGreaterThan(0);
  });

  it.each([
    "Buy volume was $30.0K and sell volume was $10.0K.",
    "The buy/sell trade-count ratio is 3.00.",
    "There were 12 trades from 5 unique wallets in the last 24 hours.",
    "The pool's quote reserve is 25.0% of the migration threshold.",
    "Liquidity is below half of the issuer's own target.",
    "Restricted — Pyth entitlement required.",
    "The largest single wallet accounted for 30.0% of 24h volume.",
    "Migration has not been executed.",
    "There is strong buy pressure in the last hour.",
    "Sell volume exceeded buy volume.",
    "A sell order of $5.0K was the largest trade.",
  ])("allows descriptive text: %s", (text) => {
    expect(findAdviceViolations(text)).toEqual([]);
  });

  it("the fixed disclaimer is not part of the checked text (it legitimately says 'not investment advice')", () => {
    const a = analyzeMarketRuleBased(scenarios.healthy!);
    expect(analysisText(a)).not.toContain(a.disclaimer);
    expect(findAdviceViolations(a.disclaimer)).toEqual([]);
  });
});
