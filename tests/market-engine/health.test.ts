import { describe, expect, it } from "vitest";
import { evaluateMarketHealth, HEALTH_THRESHOLDS, RISK_THRESHOLDS, type HealthInputs } from "../../packages/market-engine/src/index.js";
import { INDEXER_DELAYED_AFTER_SECONDS } from "../../packages/shared/src/index.js";

const NOW = "2026-09-19T12:00:00.000Z";
const at = (hhmm: string, day = "2026-09-19") => `${day}T${hhmm}:00.000Z`;

/** A healthy, fully-instrumented market: 5 trades in the last hour against a 24h baseline of 2 trades/hour and $200/hour. */
function base(): HealthInputs {
  return {
    now: NOW,
    indexer: { status: "live", lagSeconds: 20 },
    liquidityReadings: [
      { timestamp: at("10:30"), liquidityUsd: 100_000 },
      { timestamp: at("11:30"), liquidityUsd: 95_000 },
    ],
    currentLiquidityUsd: 100_000,
    trades: {
      firstTradeAt: at("11:00", "2026-09-18"),
      sinceBaselineStart: { tradeCount: 53, volumeUsd: 5_300, lastTradeAt: at("11:50") },
      sinceRecentStart: { tradeCount: 5, volumeUsd: 500, lastTradeAt: at("11:50") },
      largest24h: [{ signature: "sigA", timestamp: at("11:50"), side: "buy", valueUsd: 300 }],
      count24h: 53,
      topTraderVolumeShare24h: 0.2,
    },
    price: { dbcUsd: 100, referenceUsd: 100, referenceSource: "pyth", referenceFeedSymbol: "Equity.US.TEST/USD" },
    oracleFeeds: [{ priceUsd: 100, unavailableReason: null }],
    graduation: { percentComplete: 40, event: null },
  };
}

const evalWith = (mutate: (i: HealthInputs) => void) => {
  const input = base();
  mutate(input);
  return evaluateMarketHealth(input);
};
const types = (h: ReturnType<typeof evaluateMarketHealth>) => h.events.map((e) => e.type);
const checkOf = (h: ReturnType<typeof evaluateMarketHealth>, id: string) => h.checks.find((c) => c.id === id)!;

describe("normal market", () => {
  it("is NORMAL with no events and every signal evaluated", () => {
    const h = evaluateMarketHealth(base());
    expect(h.status).toBe("NORMAL");
    expect(h.events).toEqual([]);
    expect(h.timeline).toEqual([]);
    expect(h.watchEventCount).toBe(0);
    expect(h.checks.filter((c) => c.status === "DATA_UNAVAILABLE")).toEqual([]);
    expect(checkOf(h, "oracle").detail).toContain("Oracle operational");
    expect(checkOf(h, "indexer").detail).toBe("Indexer synchronized.");
  });

  it("reuses ELF's existing cutoffs rather than redefining them", () => {
    expect(HEALTH_THRESHOLDS.priceDeviationPct).toBe(RISK_THRESHOLDS.priceDeviationPct);
    expect(HEALTH_THRESHOLDS.largeTradeLiquidityShare).toBe(RISK_THRESHOLDS.largeTradeLiquidityShare);
    expect(HEALTH_THRESHOLDS.topTraderVolumeShare).toBe(RISK_THRESHOLDS.topTraderVolumeShare);
    expect(HEALTH_THRESHOLDS.indexerLagSeconds).toBe(INDEXER_DELAYED_AFTER_SECONDS);
  });
});

describe("liquidity decrease", () => {
  it("flags a drop from the window peak with real timestamps and values", () => {
    const h = evalWith((i) => i.liquidityReadings.push({ timestamp: at("11:45"), liquidityUsd: 60_000 }));
    const e = h.events.find((x) => x.type === "LIQUIDITY_DROP")!;
    expect(h.status).toBe("WATCH");
    expect(e.severity).toBe("WATCH");
    expect(e.observed).toBeCloseTo(40, 6);
    expect(e.reference).toBe(100_000);
    expect(e.threshold).toBe(20);
    expect(e.occurredAt).toBe(at("11:45"));
    expect(e.dataSources).toEqual(["INDEXED"]);
    expect(e.explanation).toContain("$100,000.00 to $60,000.00");
  });

  it("applies the cutoff strictly: exactly 20% is NORMAL, just over is WATCH", () => {
    expect(types(evalWith((i) => (i.liquidityReadings[1]!.liquidityUsd = 80_000)))).not.toContain("LIQUIDITY_DROP");
    expect(types(evalWith((i) => (i.liquidityReadings[1]!.liquidityUsd = 79_999)))).toContain("LIQUIDITY_DROP");
  });

  it("does not treat an increase as a drop", () => {
    expect(types(evalWith((i) => (i.liquidityReadings[1]!.liquidityUsd = 250_000)))).not.toContain("LIQUIDITY_DROP");
  });

  it("measures from the peak inside the window, not the opening value", () => {
    const h = evalWith((i) => {
      i.liquidityReadings = [
        { timestamp: at("10:30"), liquidityUsd: 100_000 },
        { timestamp: at("11:10"), liquidityUsd: 200_000 },
        { timestamp: at("11:40"), liquidityUsd: 150_000 },
      ];
    });
    expect(h.events.find((e) => e.type === "LIQUIDITY_DROP")!.observed).toBeCloseTo(25, 6);
  });

  it("is NORMAL with no movement when the last reading predates the window", () => {
    const h = evalWith((i) => (i.liquidityReadings = [{ timestamp: at("08:00"), liquidityUsd: 100_000 }]));
    expect(checkOf(h, "liquidity").status).toBe("NORMAL");
    expect(checkOf(h, "liquidity").detail).toContain("No indexed liquidity movement");
  });

  it("is DATA_UNAVAILABLE with no history, or a single first reading", () => {
    expect(checkOf(evalWith((i) => (i.liquidityReadings = [])), "liquidity").status).toBe("DATA_UNAVAILABLE");
    expect(checkOf(evalWith((i) => (i.liquidityReadings = [{ timestamp: at("11:30"), liquidityUsd: 1 }])), "liquidity").status).toBe("DATA_UNAVAILABLE");
  });
});

describe("volume spike and trade frequency", () => {
  it("flags a volume spike against the market's own baseline", () => {
    const h = evalWith((i) => {
      i.trades.sinceRecentStart.volumeUsd = 1_000;
      i.trades.sinceBaselineStart.volumeUsd = 5_800; // baseline stays $4,800 / 24h = $200/h
    });
    const e = h.events.find((x) => x.type === "VOLUME_SPIKE")!;
    expect(e.observed).toBeCloseTo(5, 6);
    expect(e.reference).toBeCloseTo(200, 6);
    expect(e.threshold).toBe(3);
    expect(e.occurredAt).toBe(at("11:50"));
    expect(e.explanation).toContain("5×");
  });

  it("boundary: exactly 3× is NORMAL, above is WATCH", () => {
    const run = (recentVolume: number) =>
      evalWith((i) => {
        i.trades.sinceRecentStart.volumeUsd = recentVolume;
        i.trades.sinceBaselineStart.volumeUsd = 4_800 + recentVolume;
      });
    expect(types(run(600))).not.toContain("VOLUME_SPIKE");
    expect(types(run(601))).toContain("VOLUME_SPIKE");
  });

  it("flags a trade-frequency spike and applies its boundary", () => {
    const run = (recentTrades: number) =>
      evalWith((i) => {
        i.trades.sinceRecentStart.tradeCount = recentTrades;
        i.trades.sinceBaselineStart.tradeCount = 48 + recentTrades;
      });
    expect(types(run(6))).not.toContain("TRADE_FREQUENCY_SPIKE"); // 6/h vs 2/h = exactly 3×
    const e = run(7).events.find((x) => x.type === "TRADE_FREQUENCY_SPIKE")!;
    expect(e.observed).toBeCloseTo(3.5, 6);
  });

  it("does not call a spike from too few recent trades", () => {
    const h = evalWith((i) => {
      i.trades.sinceRecentStart = { tradeCount: 4, volumeUsd: 10_000, lastTradeAt: at("11:50") };
      i.trades.sinceBaselineStart = { tradeCount: 52, volumeUsd: 14_800, lastTradeAt: at("11:50") };
    });
    expect(types(h)).not.toContain("VOLUME_SPIKE");
    expect(checkOf(h, "volume").detail).toContain("fewer than the 5 needed");
  });

  it("is DATA_UNAVAILABLE without a baseline (too few earlier trades, or none at all)", () => {
    const thin = evalWith((i) => (i.trades.sinceBaselineStart = { tradeCount: 8, volumeUsd: 800, lastTradeAt: at("11:50") })); // baseline = 3 trades
    expect(checkOf(thin, "volume").status).toBe("DATA_UNAVAILABLE");
    expect(checkOf(thin, "trade_frequency").status).toBe("DATA_UNAVAILABLE");
    const none = evalWith((i) => (i.trades.firstTradeAt = null));
    expect(checkOf(none, "volume").status).toBe("DATA_UNAVAILABLE");
  });

  it("shortens the baseline to the market's real age instead of assuming 24h", () => {
    // First trade only 2h before the recent window: baseline is 2h, so 48 trades = 24/h and a 5-trade hour is NOT a spike.
    const h = evalWith((i) => (i.trades.firstTradeAt = at("09:00")));
    expect(types(h)).not.toContain("TRADE_FREQUENCY_SPIKE");
    expect(checkOf(h, "trade_frequency").detail).toContain("0.21×");
  });
});

describe("large trade", () => {
  const withTrade = (valueUsd: number) => evalWith((i) => (i.trades.largest24h = [{ signature: "big1", timestamp: at("11:20"), side: "sell", valueUsd }]));

  it("flags a trade above 10% of current liquidity, with its signature and time", () => {
    const e = withTrade(25_000).events.find((x) => x.type === "LARGE_TRADE")!;
    expect(e.observed).toBeCloseTo(25, 6);
    expect(e.signature).toBe("big1");
    expect(e.occurredAt).toBe(at("11:20"));
    expect(e.threshold).toBe(10);
    expect(e.explanation).toContain("A sell of $25,000.00");
  });

  it("boundary: exactly 10% is NORMAL", () => {
    expect(types(withTrade(10_000))).not.toContain("LARGE_TRADE");
    expect(types(withTrade(10_000.01))).toContain("LARGE_TRADE");
  });

  it("caps the number of large-trade events at three, largest first", () => {
    const h = evalWith(
      (i) => (i.trades.largest24h = [1, 2, 3, 4, 5].map((n) => ({ signature: `s${n}`, timestamp: at("11:0" + n), side: "buy" as const, valueUsd: 20_000 * n }))),
    );
    const large = h.events.filter((e) => e.type === "LARGE_TRADE");
    expect(large.map((e) => e.signature)).toEqual(["s5", "s4", "s3"]);
  });

  it("is DATA_UNAVAILABLE with no trades or no liquidity", () => {
    expect(checkOf(evalWith((i) => (i.trades.largest24h = [])), "large_trades").status).toBe("DATA_UNAVAILABLE");
    expect(checkOf(evalWith((i) => (i.currentLiquidityUsd = 0)), "large_trades").status).toBe("DATA_UNAVAILABLE");
  });
});

describe("volume concentration", () => {
  it("applies the reused cutoff and a minimum sample", () => {
    expect(types(evalWith((i) => (i.trades.topTraderVolumeShare24h = 0.5)))).not.toContain("TRADE_CONCENTRATION");
    const h = evalWith((i) => (i.trades.topTraderVolumeShare24h = 0.51));
    expect(h.events.find((e) => e.type === "TRADE_CONCENTRATION")!.observed).toBeCloseTo(51, 6);
    const tiny = evalWith((i) => {
      i.trades.topTraderVolumeShare24h = 1;
      i.trades.count24h = 4;
    });
    expect(types(tiny)).not.toContain("TRADE_CONCENTRATION");
    expect(checkOf(tiny, "concentration").status).toBe("DATA_UNAVAILABLE");
  });
});

describe("price / reference deviation", () => {
  const withPrice = (dbcUsd: number) => evalWith((i) => (i.price.dbcUsd = dbcUsd));

  it("flags deviation from a live Pyth reference and applies the reused 10% cutoff strictly", () => {
    expect(types(withPrice(110))).not.toContain("PRICE_DEVIATION");
    const e = withPrice(111).events.find((x) => x.type === "PRICE_DEVIATION")!;
    expect(e.observed).toBeCloseTo(11, 6);
    expect(e.reference).toBe(100);
    expect(e.dataSources).toEqual(["ON_CHAIN", "PYTH"]);
    expect(e.explanation).toContain("Equity.US.TEST/USD");
  });

  it("does not evaluate deviation against a static issuer-declared price", () => {
    const h = evalWith((i) => {
      i.price = { dbcUsd: 0.3, referenceUsd: 42.5, referenceSource: "issuer_declared", referenceFeedSymbol: null };
    });
    expect(types(h)).not.toContain("PRICE_DEVIATION");
    expect(checkOf(h, "price_reference").status).toBe("DATA_UNAVAILABLE");
  });
});

describe("oracle", () => {
  it("restricted Pyth is an INFO event that reads 'Restricted — Pyth entitlement required' and does not force WATCH", () => {
    const h = evalWith((i) => {
      i.oracleFeeds = [{ priceUsd: null, unavailableReason: "entitlement_restricted" }];
      i.price.referenceSource = "issuer_declared";
    });
    const e = h.events.find((x) => x.type === "ORACLE_RESTRICTED")!;
    expect(e.severity).toBe("INFO");
    expect(e.explanation).toContain("Restricted — Pyth entitlement required");
    expect(h.status).toBe("NORMAL");
    expect(h.watchEventCount).toBe(0);
  });

  it.each(["not_configured", "unauthenticated", "rate_limited", "unavailable"] as const)("%s → ORACLE_UNAVAILABLE (INFO)", (reason) => {
    const h = evalWith((i) => (i.oracleFeeds = [{ priceUsd: null, unavailableReason: reason }]));
    expect(types(h)).toContain("ORACLE_UNAVAILABLE");
    expect(checkOf(h, "oracle").status).toBe("DATA_UNAVAILABLE");
  });

  it("no public feed is reported as unavailable data, not as an event", () => {
    const h = evalWith((i) => (i.oracleFeeds = []));
    expect(h.events).toEqual([]);
    expect(checkOf(h, "oracle").status).toBe("DATA_UNAVAILABLE");
  });
});

describe("indexer", () => {
  it("flags lag beyond the shared threshold", () => {
    const h = evalWith((i) => (i.indexer = { status: "delayed", lagSeconds: 900 }));
    const e = h.events.find((x) => x.type === "INDEXER_LAG")!;
    expect(h.status).toBe("WATCH");
    expect(e.observed).toBe(900);
    expect(e.threshold).toBe(INDEXER_DELAYED_AFTER_SECONDS);
  });

  it("no cursor → DATA_UNAVAILABLE for the whole market", () => {
    const h = evalWith((i) => (i.indexer = { status: "unavailable", lagSeconds: null }));
    expect(h.status).toBe("DATA_UNAVAILABLE");
    expect(h.events).toEqual([]);
  });
});

describe("graduation", () => {
  it("reports an indexed curve-complete event with its real signature and time", () => {
    const h = evalWith((i) => (i.graduation = { percentComplete: 100, event: { timestamp: at("11:55"), signature: "gradSig" } }));
    const e = h.events.find((x) => x.type === "GRADUATION_REACHED")!;
    expect(e.severity).toBe("INFO");
    expect(e.signature).toBe("gradSig");
    expect(e.occurredAt).toBe(at("11:55"));
    expect(h.status).toBe("NORMAL");
  });

  it("does not report a graduation event from progress alone", () => {
    expect(types(evalWith((i) => (i.graduation = { percentComplete: 100, event: null })))).not.toContain("GRADUATION_REACHED");
  });
});

describe("multiple simultaneous anomalies", () => {
  const stressed = () =>
    evalWith((i) => {
      i.indexer = { status: "delayed", lagSeconds: 600 };
      i.liquidityReadings.push({ timestamp: at("11:45"), liquidityUsd: 50_000 });
      i.trades.largest24h = [{ signature: "big", timestamp: at("11:44"), side: "sell", valueUsd: 45_000 }];
      i.trades.topTraderVolumeShare24h = 0.9;
      i.oracleFeeds = [{ priceUsd: null, unavailableReason: "entitlement_restricted" }];
    });

  it("reports each independently, WATCH before INFO, and orders the timeline by real time", () => {
    const h = stressed();
    expect(new Set(types(h))).toEqual(new Set(["INDEXER_LAG", "LIQUIDITY_DROP", "LARGE_TRADE", "TRADE_CONCENTRATION", "ORACLE_RESTRICTED"]));
    expect(h.status).toBe("WATCH");
    expect(h.watchEventCount).toBe(4);
    expect(h.events.map((e) => e.severity)).toEqual(["WATCH", "WATCH", "WATCH", "WATCH", "INFO"]);
    expect(h.timeline.map((e) => e.type)).toEqual(["LARGE_TRADE", "LIQUIDITY_DROP"]);
    expect(h.timeline.every((e) => e.occurredAt !== null)).toBe(true);
  });

  it("is deterministic: the same input always yields an identical result", () => {
    const a = stressed();
    expect(stressed()).toEqual(a);
    expect(JSON.stringify(stressed())).toBe(JSON.stringify(a));
  });
});

describe("empty market, missing and malformed data", () => {
  const empty = (): HealthInputs => ({
    ...base(),
    liquidityReadings: [],
    currentLiquidityUsd: 0,
    trades: {
      firstTradeAt: null,
      sinceBaselineStart: { tradeCount: 0, volumeUsd: 0, lastTradeAt: null },
      sinceRecentStart: { tradeCount: 0, volumeUsd: 0, lastTradeAt: null },
      largest24h: [],
      count24h: 0,
      topTraderVolumeShare24h: null,
    },
    oracleFeeds: [],
    price: { dbcUsd: 0.3, referenceUsd: 42.5, referenceSource: "issuer_declared", referenceFeedSymbol: null },
  });

  it("an empty market is DATA_UNAVAILABLE and generates no fake event", () => {
    const h = evaluateMarketHealth(empty());
    expect(h.status).toBe("DATA_UNAVAILABLE");
    expect(h.events).toEqual([]);
    expect(h.timeline).toEqual([]);
    expect(h.watchEventCount).toBe(0);
  });

  it("malformed values never throw and never become events", () => {
    const bad = base();
    bad.liquidityReadings = [{ timestamp: "not-a-date", liquidityUsd: Number.NaN }];
    bad.trades.sinceRecentStart = { tradeCount: Number.NaN, volumeUsd: -5, lastTradeAt: "x" };
    bad.trades.largest24h = [{ signature: "s", timestamp: "garbage", side: "buy", valueUsd: Number.POSITIVE_INFINITY }];
    bad.trades.topTraderVolumeShare24h = 7;
    bad.price.dbcUsd = Number.NaN;
    bad.graduation = { percentComplete: Number.NaN, event: null };
    let h!: ReturnType<typeof evaluateMarketHealth>;
    expect(() => (h = evaluateMarketHealth(bad))).not.toThrow();
    expect(h.events.filter((e) => e.severity === "WATCH")).toEqual([]);
    for (const id of ["liquidity", "volume", "trade_frequency", "large_trades", "concentration", "price_reference", "graduation"]) {
      expect(checkOf(h, id).status).toBe("DATA_UNAVAILABLE");
    }
  });

  it("an invalid evaluation time makes time-based signals unavailable", () => {
    const h = evalWith((i) => (i.now = "nope"));
    expect(checkOf(h, "liquidity").status).toBe("DATA_UNAVAILABLE");
    expect(checkOf(h, "volume").status).toBe("DATA_UNAVAILABLE");
  });

  it("threshold overrides are honoured, and invalid overrides fall back to defaults", () => {
    const input = base();
    input.liquidityReadings[1]!.liquidityUsd = 90_000; // 10% drop
    expect(evaluateMarketHealth(input).events).toEqual([]);
    expect(types(evaluateMarketHealth(input, { liquidityDropPct: 5 }))).toContain("LIQUIDITY_DROP");
    expect(evaluateMarketHealth(input, { liquidityDropPct: -1 }).thresholds.liquidityDropPct).toBe(20);
    expect(evaluateMarketHealth(input, { liquidityDropPct: Number.NaN }).thresholds.liquidityDropPct).toBe(20);
  });
});

describe("language guardrail", () => {
  const FRAUD_LANGUAGE = /fraud|manipulat|malicious|insider|scam|rug\s?pull|wash trad|pump|dump|criminal|illegal/i;
  const ADVICE_LANGUAGE = /\b(you should|should (buy|sell|hold)|we recommend|recommend(ed)? (that|to)|consider (buying|selling)|buy now|sell now)\b/i;

  it("never claims fraud, manipulation or intent, and never gives advice, in any event or check", () => {
    const stress = evalWith((i) => {
      i.indexer = { status: "delayed", lagSeconds: 600 };
      i.liquidityReadings.push({ timestamp: at("11:45"), liquidityUsd: 10_000 });
      i.trades.largest24h = [{ signature: "big", timestamp: at("11:44"), side: "sell", valueUsd: 90_000 }];
      i.trades.topTraderVolumeShare24h = 0.99;
      i.trades.sinceRecentStart.volumeUsd = 9_000;
      i.trades.sinceBaselineStart.volumeUsd = 13_800;
      i.trades.sinceRecentStart.tradeCount = 20;
      i.trades.sinceBaselineStart.tradeCount = 68;
      i.price.dbcUsd = 300;
      i.oracleFeeds = [{ priceUsd: null, unavailableReason: "entitlement_restricted" }];
    });
    expect(stress.events.length).toBeGreaterThanOrEqual(6);
    const text = [...stress.events.flatMap((e) => [e.explanation, e.metric]), ...stress.checks.map((c) => `${c.label} ${c.detail}`)].join("\n");
    expect(text).not.toMatch(FRAUD_LANGUAGE);
    expect(text).not.toMatch(ADVICE_LANGUAGE);
  });

  it("carries a disclaimer that anomaly detection is not fraud detection or advice", () => {
    const h = evaluateMarketHealth(base());
    expect(h.disclaimer).toMatch(/does not determine fraud, manipulation or intent/);
    expect(h.disclaimer).toMatch(/not investment advice/);
  });

  it("exposes no composite score", () => {
    expect(Object.keys(evaluateMarketHealth(base())).sort()).toEqual(
      ["checks", "disclaimer", "engine", "evaluatedAt", "events", "status", "thresholds", "timeline", "watchEventCount"].sort(),
    );
  });
});
