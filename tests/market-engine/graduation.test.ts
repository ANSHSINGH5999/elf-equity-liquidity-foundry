import { describe, expect, it } from "vitest";
import { buildGraduationChecklist, computeGraduationStatus, classifyRegime } from "../../packages/market-engine/src/index.js";

describe("computeGraduationStatus", () => {
  it("computes the exact percentage shown in the graduation monitor", () => {
    const status = computeGraduationStatus(217_000, 250_000);
    expect(status.percentageComplete).toBe(86.8);
    expect(status.estimatedReadiness).toBe("near");
  });

  it("caps percentage at 100 even if reserves exceed the threshold", () => {
    const status = computeGraduationStatus(300_000, 250_000);
    expect(status.percentageComplete).toBe(100);
    expect(status.estimatedReadiness).toBe("ready");
  });

  it("handles a zero threshold without dividing by zero", () => {
    const status = computeGraduationStatus(0, 0);
    expect(status.percentageComplete).toBe(0);
    expect(status.estimatedReadiness).toBe("not_started");
    expect(Number.isFinite(status.percentageComplete)).toBe(true);
  });

  it("buckets readiness monotonically with progress", () => {
    expect(computeGraduationStatus(0, 100).estimatedReadiness).toBe("not_started");
    expect(computeGraduationStatus(10, 100).estimatedReadiness).toBe("early");
    expect(computeGraduationStatus(50, 100).estimatedReadiness).toBe("mid");
    expect(computeGraduationStatus(90, 100).estimatedReadiness).toBe("near");
    expect(computeGraduationStatus(100, 100).estimatedReadiness).toBe("ready");
  });
});

describe("classifyRegime", () => {
  it("classifies a mature market once graduation is nearly complete", () => {
    expect(
      classifyRegime({
        graduationPercentageComplete: 90,
        marketQualityTotal: 80,
        priceVolatility: 0.02,
        volume24hUsd: 10_000,
      }),
    ).toBe("mature");
  });

  it("classifies stressed markets with active trading but poor quality", () => {
    expect(
      classifyRegime({
        graduationPercentageComplete: 30,
        marketQualityTotal: 20,
        priceVolatility: 0.3,
        volume24hUsd: 5_000,
      }),
    ).toBe("stressed");
  });

  it("classifies recovery for poor-quality markets with no trading", () => {
    expect(
      classifyRegime({
        graduationPercentageComplete: 30,
        marketQualityTotal: 20,
        priceVolatility: 0.3,
        volume24hUsd: 0,
      }),
    ).toBe("recovery");
  });

  it("classifies early, low-quality markets as discovery", () => {
    expect(
      classifyRegime({
        graduationPercentageComplete: 5,
        marketQualityTotal: 45,
        priceVolatility: 0.05,
        volume24hUsd: 1_000,
      }),
    ).toBe("discovery");
  });

  it("classifies everything else as healthy", () => {
    expect(
      classifyRegime({
        graduationPercentageComplete: 40,
        marketQualityTotal: 75,
        priceVolatility: 0.05,
        volume24hUsd: 20_000,
      }),
    ).toBe("healthy");
  });
});

describe("buildGraduationChecklist", () => {
  const byId = (list: ReturnType<typeof buildGraduationChecklist>, id: string) => list.find((c) => c.id === id)!;

  it("marks the single real gate unsatisfied below the threshold", () => {
    const list = buildGraduationChecklist({ graduation: computeGraduationStatus(100_000, 250_000), migrated: false });
    expect(byId(list, "quote_reserve_threshold").state).toBe("unsatisfied");
    expect(byId(list, "migration_executed").state).toBe("unsatisfied");
  });

  it("marks the reserve gate satisfied at/above the threshold, independent of whether migration has run", () => {
    const list = buildGraduationChecklist({ graduation: computeGraduationStatus(250_000, 250_000), migrated: false });
    expect(byId(list, "quote_reserve_threshold").state).toBe("satisfied");
    // 100% reserve is eligibility, not migration — a pool can sit here until someone triggers migrate.
    expect(byId(list, "migration_executed").state).toBe("unsatisfied");
  });

  it("marks migration satisfied only when a real migrated signal is provided", () => {
    const list = buildGraduationChecklist({ graduation: computeGraduationStatus(250_000, 250_000), migrated: true });
    expect(byId(list, "migration_executed").state).toBe("satisfied");
  });

  it("never invents volume or market-cap gates — they are always not_applicable, at any progress level", () => {
    for (const reserve of [0, 50_000, 249_999, 250_000, 900_000]) {
      const list = buildGraduationChecklist({ graduation: computeGraduationStatus(reserve, 250_000), migrated: false });
      expect(byId(list, "volume_requirement").state).toBe("not_applicable");
      expect(byId(list, "market_cap_requirement").state).toBe("not_applicable");
    }
  });

  it("reports the reserve gate as unavailable (not unsatisfied) when the migration threshold is missing/zero", () => {
    const list = buildGraduationChecklist({ graduation: computeGraduationStatus(1_000, 0), migrated: false });
    expect(byId(list, "quote_reserve_threshold").state).toBe("unavailable");
  });

  it("returns exactly the four documented conditions, in a stable order", () => {
    const list = buildGraduationChecklist({ graduation: computeGraduationStatus(1, 100), migrated: false });
    expect(list.map((c) => c.id)).toEqual([
      "quote_reserve_threshold",
      "volume_requirement",
      "market_cap_requirement",
      "migration_executed",
    ]);
  });

  it("never embeds a live number in the static detail text (numbers come from GraduationStatus, not from this function)", () => {
    const list = buildGraduationChecklist({ graduation: computeGraduationStatus(217_000, 250_000), migrated: false });
    for (const condition of list) {
      expect(condition.detail).not.toMatch(/217|250|\$\d/);
    }
  });
});
