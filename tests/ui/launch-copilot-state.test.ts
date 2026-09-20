import { describe, expect, it } from "vitest";
import { copilotReducer, initialCopilotState, type CopilotEvent, type CopilotPhase, type CopilotState } from "../../apps/web/src/components/design/launch-copilot-state.js";
import type { LaunchCheck, LaunchPlan } from "../../packages/shared/src/index.js";

/** Minimal plans exercising the gate: only the fields the gate reads are meaningful. */
const check = (id: LaunchCheck["id"], status: LaunchCheck["status"]): LaunchCheck => ({ id, label: id, status, detail: "d" });
const planWith = (over: { simulation?: LaunchPlan["simulation"]; configuration?: LaunchCheck["status"]; curve?: LaunchCheck["status"] } = {}): LaunchPlan =>
  ({
    simulation: over.simulation ?? { status: "completed", label: "SIMULATED", scenarios: [] },
    checks: [check("configuration", over.configuration ?? "pass"), check("liquidity_parameters", "pass"), check("curve_parameters", over.curve ?? "pass"),
      check("graduation_configuration", "pass"), check("oracle_configuration", "unavailable"), check("simulation", "pass")],
  }) as unknown as LaunchPlan;

const good = planWith();
const run = (events: CopilotEvent[], from: CopilotState = initialCopilotState) => events.reduce(copilotReducer, from);
const toPlan = () => run([{ type: "ASSET_SELECTED" }, { type: "PLAN_GENERATED" }]);
const toApproval = (plan = good) => run([{ type: "SIMULATION_COMPLETED", simulationRunId: "r1" }, { type: "CONTINUE_TO_APPROVAL", plan }], toPlan());

describe("copilotReducer — the plan can NEVER deploy by itself", () => {
  it("starts at the asset step with nothing acknowledged", () => {
    expect(initialCopilotState).toEqual({ phase: "asset", simulationRunId: null, acknowledged: false });
  });

  it("the happy path reaches review ONLY through an explicit ACKNOWLEDGE then APPROVE", () => {
    const s = run([{ type: "ACKNOWLEDGE", value: true }, { type: "APPROVE", plan: good }], toApproval());
    expect(s.phase).toBe("review");
  });

  it("APPROVE without acknowledgement does nothing", () => {
    const s = run([{ type: "APPROVE", plan: good }], toApproval());
    expect(s.phase).toBe("approval");
  });

  it("no unacknowledged path reaches review: every single-event and pairwise sequence from every phase is checked", () => {
    const phases: CopilotPhase[] = ["asset", "parameters", "plan", "approval"];
    const events: CopilotEvent[] = [
      { type: "ASSET_SELECTED" }, { type: "PLAN_GENERATED" }, { type: "CANDIDATE_CHANGED" },
      { type: "SIMULATION_COMPLETED", simulationRunId: "r" }, { type: "CONTINUE_TO_APPROVAL", plan: good },
      { type: "APPROVE", plan: good }, { type: "BACK" }, { type: "RESET" }, { type: "ACKNOWLEDGE", value: false },
    ];
    for (const phase of phases) {
      const start: CopilotState = { phase, simulationRunId: phase === "plan" || phase === "approval" ? "r" : null, acknowledged: false };
      for (const a of events) {
        expect(copilotReducer(start, a).phase).not.toBe("review");
        for (const b of events) expect(copilotReducer(copilotReducer(start, a), b).phase).not.toBe("review");
      }
    }
  });

  it("review is only ever entered from the approval phase (APPROVE is inert elsewhere, even with acknowledged=true)", () => {
    for (const phase of ["asset", "parameters", "plan", "review"] as const) {
      const s: CopilotState = { phase, simulationRunId: "r", acknowledged: true };
      expect(copilotReducer(s, { type: "APPROVE", plan: good })).toBe(s);
    }
  });

  it("a failing check keeps the gate shut even when acknowledged", () => {
    for (const bad of [planWith({ configuration: "fail" }), planWith({ configuration: "unavailable" }), planWith({ curve: "fail" })]) {
      const s = run([{ type: "ACKNOWLEDGE", value: true }, { type: "APPROVE", plan: bad }], toApproval());
      expect(s.phase).toBe("approval");
    }
  });

  it("CONTINUE_TO_APPROVAL requires a COMPLETED simulation (not_run / invalid are refused)", () => {
    for (const simulation of [{ status: "not_run" }, { status: "invalid", reasons: ["x"] }] as const) {
      expect(copilotReducer(toPlan(), { type: "CONTINUE_TO_APPROVAL", plan: planWith({ simulation }) }).phase).toBe("plan");
    }
  });

  it("changing the curve withdraws the simulation and the acknowledgement — approval never carries over", () => {
    const approved = run([{ type: "ACKNOWLEDGE", value: true }], toApproval());
    expect(approved.acknowledged).toBe(true);
    const changed = copilotReducer(approved, { type: "CANDIDATE_CHANGED" });
    expect(changed).toEqual({ phase: "plan", simulationRunId: null, acknowledged: false });
  });

  it("a new simulation result withdraws any acknowledgement", () => {
    const s = copilotReducer({ phase: "plan", simulationRunId: "old", acknowledged: true }, { type: "SIMULATION_COMPLETED", simulationRunId: "new" });
    expect(s).toEqual({ phase: "plan", simulationRunId: "new", acknowledged: false });
  });

  it("backing out of review or approval withdraws the acknowledgement — approval must be given afresh", () => {
    const inReview = run([{ type: "ACKNOWLEDGE", value: true }, { type: "APPROVE", plan: good }], toApproval());
    const back = copilotReducer(inReview, { type: "BACK" });
    expect(back).toMatchObject({ phase: "approval", acknowledged: false });
    expect(copilotReducer(back, { type: "APPROVE", plan: good }).phase).toBe("approval");
    expect(copilotReducer({ phase: "approval", simulationRunId: "r", acknowledged: true }, { type: "BACK" }).acknowledged).toBe(false);
  });

  it("ACKNOWLEDGE is only meaningful in the approval phase", () => {
    const s = toPlan();
    expect(copilotReducer(s, { type: "ACKNOWLEDGE", value: true })).toBe(s);
  });

  it("RESET returns to the very start", () => {
    expect(copilotReducer({ phase: "review", simulationRunId: "r", acknowledged: true }, { type: "RESET" })).toEqual(initialCopilotState);
  });

  it("ignores events that don't apply to the current phase (returns the same state object)", () => {
    expect(copilotReducer(initialCopilotState, { type: "PLAN_GENERATED" })).toBe(initialCopilotState);
    expect(copilotReducer(initialCopilotState, { type: "SIMULATION_COMPLETED", simulationRunId: "x" })).toBe(initialCopilotState);
  });
});
