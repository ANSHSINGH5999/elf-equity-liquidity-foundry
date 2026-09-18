import { describe, expect, it } from "vitest";
import { computeGraduationStatus, classifyRegime } from "../../packages/market-engine/src/index.js";

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
