import { describe, expect, it } from "vitest";
import { RISK_THRESHOLDS, computeRiskIndicators, type RiskInputs } from "../../packages/market-engine/src/index.js";

const healthy: RiskInputs = {
  liquidityUsd: 400_000,
  targetLiquidityUsd: 500_000,
  priceUsd: 10,
  referencePriceUsd: 10.2,
  referenceSource: "pyth",
  oracleFeeds: [{ priceUsd: 10.1, unavailableReason: null }],
  tradeCount24h: 12,
  indexerStatus: "live",
  topTraderVolumeShare: 0.3,
  largestTradeUsd: 5_000,
};

const get = (inputs: RiskInputs, id: string) => computeRiskIndicators(inputs).find((i) => i.id === id)!;

describe("computeRiskIndicators", () => {
  it("returns the seven documented indicators in a stable order", () => {
    expect(computeRiskIndicators(healthy).map((i) => i.id)).toEqual([
      "liquidity",
      "price_deviation",
      "oracle",
      "trading_activity",
      "volume_concentration",
      "large_trades",
      "indexer_health",
    ]);
  });

  it("only ever emits NORMAL, WATCH or DATA_UNAVAILABLE — no invented risk tiers", () => {
    for (const status of computeRiskIndicators(healthy).map((i) => i.status)) {
      expect(["NORMAL", "WATCH", "DATA_UNAVAILABLE"]).toContain(status);
    }
  });

  it("marks a healthy market NORMAL across the board", () => {
    for (const i of computeRiskIndicators(healthy)) expect(i.status).toBe("NORMAL");
  });

  it("every indicator carries a non-empty formula so the number is auditable", () => {
    for (const i of computeRiskIndicators(healthy)) expect(i.formula.length).toBeGreaterThan(10);
  });

  describe("liquidity", () => {
    it("computes liquidity as a percentage of the issuer's own target", () => {
      expect(get(healthy, "liquidity").value).toBe(80);
    });
    it("is WATCH strictly below the cutoff and NORMAL at it", () => {
      const at = { ...healthy, liquidityUsd: 500_000 * RISK_THRESHOLDS.liquidityBelowTargetFraction };
      expect(get(at, "liquidity").status).toBe("NORMAL");
      expect(get({ ...at, liquidityUsd: at.liquidityUsd - 1 }, "liquidity").status).toBe("WATCH");
    });
    it("is DATA_UNAVAILABLE (not WATCH) when the target is missing or zero", () => {
      expect(get({ ...healthy, targetLiquidityUsd: null }, "liquidity").status).toBe("DATA_UNAVAILABLE");
      expect(get({ ...healthy, targetLiquidityUsd: 0 }, "liquidity").status).toBe("DATA_UNAVAILABLE");
    });
  });

  describe("price deviation", () => {
    it("computes the absolute deviation percentage", () => {
      expect(get({ ...healthy, priceUsd: 11, referencePriceUsd: 10 }, "price_deviation").value).toBe(10);
      expect(get({ ...healthy, priceUsd: 9, referencePriceUsd: 10 }, "price_deviation").value).toBe(10);
    });
    it("is WATCH only when strictly above the cutoff", () => {
      expect(get({ ...healthy, priceUsd: 11, referencePriceUsd: 10 }, "price_deviation").status).toBe("NORMAL");
      expect(get({ ...healthy, priceUsd: 11.01, referencePriceUsd: 10 }, "price_deviation").status).toBe("WATCH");
    });
    it("is DATA_UNAVAILABLE without a usable reference price", () => {
      expect(get({ ...healthy, referencePriceUsd: null }, "price_deviation").status).toBe("DATA_UNAVAILABLE");
      expect(get({ ...healthy, referencePriceUsd: 0 }, "price_deviation").status).toBe("DATA_UNAVAILABLE");
    });
    it("states plainly when the reference is only the issuer-declared number, not a live feed", () => {
      const note = get({ ...healthy, referenceSource: "issuer_declared" }, "price_deviation").note;
      expect(note).toMatch(/issuer-declared/i);
      expect(note).toMatch(/not a live market feed/i);
    });
  });

  describe("oracle", () => {
    it("is NORMAL when at least one Pyth feed is live", () => {
      const inputs = {
        ...healthy,
        oracleFeeds: [
          { priceUsd: null, unavailableReason: "entitlement_restricted" as const },
          { priceUsd: 10, unavailableReason: null },
        ],
      };
      expect(get(inputs, "oracle").status).toBe("NORMAL");
      expect(get(inputs, "oracle").value).toBe(1);
    });
    it("reports the exact restriction text when the only blocker is Pyth entitlement", () => {
      const inputs = {
        ...healthy,
        oracleFeeds: [
          { priceUsd: null, unavailableReason: "entitlement_restricted" as const },
          { priceUsd: null, unavailableReason: "entitlement_restricted" as const },
        ],
      };
      const oracle = get(inputs, "oracle");
      expect(oracle.status).toBe("DATA_UNAVAILABLE");
      expect(oracle.note).toBe("Restricted — Pyth entitlement required");
    });
    it.each([
      ["not_configured", /not configured/i],
      ["unauthenticated", /rejected/i],
      ["rate_limited", /rate-limiting/i],
      ["unavailable", /no price/i],
    ] as const)("distinguishes the %s reason", (reason, pattern) => {
      const oracle = get({ ...healthy, oracleFeeds: [{ priceUsd: null, unavailableReason: reason }] }, "oracle");
      expect(oracle.status).toBe("DATA_UNAVAILABLE");
      expect(oracle.note).toMatch(pattern);
    });
    it("says no feed exists (rather than blaming entitlement) when discovery found nothing", () => {
      const oracle = get({ ...healthy, oracleFeeds: [] }, "oracle");
      expect(oracle.status).toBe("DATA_UNAVAILABLE");
      expect(oracle.note).toMatch(/no public Pyth feed exists/i);
    });
  });

  describe("trading activity", () => {
    it("is NORMAL with trades, WATCH with none while the indexer is live", () => {
      expect(get({ ...healthy, tradeCount24h: 1 }, "trading_activity").status).toBe("NORMAL");
      expect(get({ ...healthy, tradeCount24h: 0 }, "trading_activity").status).toBe("WATCH");
    });
    it("is DATA_UNAVAILABLE when the indexer cannot see the pool, even with a zero count", () => {
      expect(get({ ...healthy, tradeCount24h: 0, indexerStatus: "unavailable" }, "trading_activity").status).toBe(
        "DATA_UNAVAILABLE",
      );
    });
  });

  describe("volume concentration", () => {
    it("reports the share as a percentage and flags a simple majority", () => {
      expect(get({ ...healthy, topTraderVolumeShare: 0.5 }, "volume_concentration").status).toBe("NORMAL");
      const over = get({ ...healthy, topTraderVolumeShare: 0.51 }, "volume_concentration");
      expect(over.status).toBe("WATCH");
      expect(over.value).toBe(51);
    });
    it("is DATA_UNAVAILABLE when there was no volume", () => {
      expect(get({ ...healthy, topTraderVolumeShare: null }, "volume_concentration").status).toBe("DATA_UNAVAILABLE");
    });
  });

  describe("large trades", () => {
    it("measures the largest trade against current liquidity", () => {
      const at = get({ ...healthy, liquidityUsd: 100_000, largestTradeUsd: 10_000 }, "large_trades");
      expect(at.value).toBe(10);
      expect(at.status).toBe("NORMAL");
      expect(get({ ...healthy, liquidityUsd: 100_000, largestTradeUsd: 10_001 }, "large_trades").status).toBe("WATCH");
    });
    it("is DATA_UNAVAILABLE with no trades or no liquidity — never a divide-by-zero", () => {
      expect(get({ ...healthy, largestTradeUsd: null }, "large_trades").status).toBe("DATA_UNAVAILABLE");
      const zeroLiquidity = get({ ...healthy, liquidityUsd: 0 }, "large_trades");
      expect(zeroLiquidity.status).toBe("DATA_UNAVAILABLE");
      expect(zeroLiquidity.value).toBeNull();
    });
  });

  describe("indexer health", () => {
    it.each([
      ["live", "NORMAL"],
      ["delayed", "WATCH"],
      ["unavailable", "DATA_UNAVAILABLE"],
    ] as const)("maps %s -> %s", (indexerStatus, expected) => {
      expect(get({ ...healthy, indexerStatus }, "indexer_health").status).toBe(expected);
    });
  });

  it("is deterministic and never mutates its input", () => {
    const snapshot = JSON.stringify(healthy);
    const a = computeRiskIndicators(healthy);
    const b = computeRiskIndicators(healthy);
    expect(a).toEqual(b);
    expect(JSON.stringify(healthy)).toBe(snapshot);
  });
});

import { summarizeOracleFeeds } from "../../packages/market-engine/src/index.js";

describe("summarizeOracleFeeds (shared by the risk indicator and the market header)", () => {
  it("live: counts live feeds and never claims more than exist", () => {
    const s = summarizeOracleFeeds([
      { priceUsd: 10, unavailableReason: null },
      { priceUsd: null, unavailableReason: "entitlement_restricted" },
      { priceUsd: 11, unavailableReason: null },
    ]);
    expect(s.state).toBe("live");
    expect(s.liveCount).toBe(2);
    expect(s.headline).toBe("Live (2/3 Pyth feeds)");
  });

  it("restricted: the headline is exactly the required user-facing restriction text", () => {
    const s = summarizeOracleFeeds([{ priceUsd: null, unavailableReason: "entitlement_restricted" }]);
    expect(s.state).toBe("entitlement_restricted");
    expect(s.headline).toBe("Restricted — Pyth entitlement required");
  });

  it("restriction outranks other failure reasons", () => {
    const s = summarizeOracleFeeds([
      { priceUsd: null, unavailableReason: "rate_limited" },
      { priceUsd: null, unavailableReason: "entitlement_restricted" },
    ]);
    expect(s.state).toBe("entitlement_restricted");
  });

  it("no feeds at all is reported as no_feed, not as a failure", () => {
    const s = summarizeOracleFeeds([]);
    expect(s.state).toBe("no_feed");
    expect(s.headline).toBe("No public feed");
  });

  it.each([
    ["not_configured", "Not configured"],
    ["unauthenticated", "Auth failed"],
    ["rate_limited", "Rate limited"],
    ["unavailable", "Unavailable"],
  ] as const)("maps %s to a short headline", (reason, headline) => {
    expect(summarizeOracleFeeds([{ priceUsd: null, unavailableReason: reason }]).headline).toBe(headline);
  });

  it("never reports a live state when no feed has a price, even if reasons are null", () => {
    expect(summarizeOracleFeeds([{ priceUsd: null, unavailableReason: null }]).state).not.toBe("live");
  });
});
