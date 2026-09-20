import { SIMULATION_LAB_MAX_PROGRESS_PCT, type LabRunParameters } from "@elf/shared";
import { SCENARIO_DEFINITIONS, type ScenarioDefinition } from "./scenarios";

export class UnsupportedScenarioError extends Error {
  constructor(scenario: string) {
    super(`"${scenario}" is not a scenario the simulation engine models.`);
    this.name = "UnsupportedScenarioError";
  }
}

export class LabParameterError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "LabParameterError";
  }
}

export interface LabScenarioInput {
  scenario: string;
  /** Assumed position on the curve, 0–95 (ELF's positioning heuristic in sqrt-price space). */
  curveProgressPct?: number;
  /** Side of each of the four standard trades, in size order. */
  sides?: readonly string[];
}

/**
 * Resolves a Simulation Lab request into a definition the EXISTING engine
 * (`runScenario`) can run. Only the two things the engine genuinely varies are
 * overridable — the position on the curve and the side of each standard trade;
 * everything else (trade sizes, fee-schedule point) stays the scenario's own.
 * Anything else, including a scenario the engine does not define, is rejected
 * rather than approximated.
 */
export function resolveLabScenario(input: LabScenarioInput): { definition: ScenarioDefinition; parameters: LabRunParameters } {
  const base = SCENARIO_DEFINITIONS.find((d) => d.kind === input.scenario);
  if (!base) throw new UnsupportedScenarioError(String(input.scenario));

  let fraction = base.curveProgressFraction;
  if (input.curveProgressPct !== undefined) {
    const pct = input.curveProgressPct;
    if (typeof pct !== "number" || !Number.isFinite(pct) || pct < 0 || pct > SIMULATION_LAB_MAX_PROGRESS_PCT) {
      throw new LabParameterError(`Curve position must be between 0 and ${SIMULATION_LAB_MAX_PROGRESS_PCT}%.`);
    }
    fraction = pct / 100;
  }

  let directions: ScenarioDefinition["directions"] = base.directions;
  if (input.sides !== undefined) {
    if (input.sides.length !== base.directions.length || input.sides.some((side) => side !== "buy" && side !== "sell")) {
      throw new LabParameterError(`Provide exactly ${base.directions.length} trade sides, each "buy" or "sell".`);
    }
    directions = [...input.sides] as ScenarioDefinition["directions"];
  }

  const customised = fraction !== base.curveProgressFraction || directions.some((d, i) => d !== base.directions[i]);
  return { definition: { ...base, curveProgressFraction: fraction, directions }, parameters: { curveProgressFraction: fraction, sides: [...directions], customised } };
}
