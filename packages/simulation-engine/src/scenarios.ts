import type { SimulationScenarioKind } from "@elf/shared";
import BN from "bn.js";

export type ScenarioTradeDirection = "buy" | "sell";

export interface ScenarioDefinition {
  kind: SimulationScenarioKind;
  description: string;
  /** ELF's own curve-positioning heuristic — see CurvePositionQuoteInput in @elf/meteora-adapter. */
  curveProgressFraction: number;
  /** Direction applied to each of the four trade sizes, in order. */
  directions: [ScenarioTradeDirection, ScenarioTradeDirection, ScenarioTradeDirection, ScenarioTradeDirection];
  /** Slot offset simulating how far into the fee-decay schedule this scenario happens. */
  currentPointOffset: BN;
}

export const SCENARIO_DEFINITIONS: ScenarioDefinition[] = [
  {
    kind: "normal_demand",
    description: "Typical two-sided trading shortly after launch, before any large directional move.",
    curveProgressFraction: 0.05,
    directions: ["buy", "buy", "sell", "buy"],
    currentPointOffset: new BN(0),
  },
  {
    kind: "strong_buy_pressure",
    description: "Sustained buy-side demand has already pushed the curve about 30% of the way to migration.",
    curveProgressFraction: 0.3,
    directions: ["buy", "buy", "buy", "buy"],
    currentPointOffset: new BN(0),
  },
  {
    kind: "strong_sell_pressure",
    description: "Early holders take profit after a run-up, selling into a curve already 30% progressed.",
    curveProgressFraction: 0.3,
    directions: ["sell", "sell", "sell", "sell"],
    currentPointOffset: new BN(0),
  },
  {
    kind: "low_liquidity",
    description: "Trading in the first minutes of the curve, when reserves are thinnest.",
    curveProgressFraction: 0.02,
    directions: ["buy", "sell", "buy", "sell"],
    currentPointOffset: new BN(0),
  },
  {
    kind: "high_volatility",
    description: "Choppy two-sided flow well into the fee-decay window, testing dynamic-fee response.",
    curveProgressFraction: 0.15,
    directions: ["buy", "sell", "buy", "sell"],
    currentPointOffset: new BN(60 * 60 * 4),
  },
  {
    kind: "graduation_approach",
    description: "The curve is 92% of the way to its migration threshold — the final stretch before DAMM v2.",
    curveProgressFraction: 0.92,
    directions: ["buy", "buy", "buy", "buy"],
    currentPointOffset: new BN(60 * 60 * 20),
  },
];
