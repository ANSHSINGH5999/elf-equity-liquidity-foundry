import { evaluateApprovalGate } from "@elf/market-engine";
import type { LaunchPlan } from "@elf/shared";

/**
 * Pure flow control for the Market Launch Copilot (no React, no I/O).
 *
 * The invariant this file exists to make provable: the `review` phase — the
 * only phase that mounts the existing wallet-approval/deployment step — is
 * reachable ONLY through an `APPROVE` event, in the `approval` phase, after an
 * explicit acknowledgement, while the engine-evaluated approval gate is open.
 * There is no other transition into it, no timer, and no automatic progression.
 * Entering `review` does not itself deploy anything: that step still requires
 * the user's own wallet to sign each transaction.
 */
export type CopilotPhase = "asset" | "parameters" | "plan" | "approval" | "review";

export interface CopilotState {
  phase: CopilotPhase;
  /** Id of the simulation run the CURRENT plan was checked against (null = not run). */
  simulationRunId: string | null;
  /** The user's explicit "I have reviewed this plan" confirmation. Never true by default. */
  acknowledged: boolean;
}

export type CopilotEvent =
  | { type: "ASSET_SELECTED" }
  | { type: "PLAN_GENERATED" }
  | { type: "CANDIDATE_CHANGED" }
  | { type: "SIMULATION_COMPLETED"; simulationRunId: string }
  | { type: "CONTINUE_TO_APPROVAL"; plan: LaunchPlan }
  | { type: "ACKNOWLEDGE"; value: boolean }
  | { type: "APPROVE"; plan: LaunchPlan }
  | { type: "BACK" }
  | { type: "RESET" };

export const initialCopilotState: CopilotState = { phase: "asset", simulationRunId: null, acknowledged: false };

export function copilotReducer(state: CopilotState, event: CopilotEvent): CopilotState {
  switch (event.type) {
    case "ASSET_SELECTED":
      return state.phase === "asset" ? { ...initialCopilotState, phase: "parameters" } : state;

    case "PLAN_GENERATED":
      return state.phase === "parameters" ? { phase: "plan", simulationRunId: null, acknowledged: false } : state;

    // A different curve invalidates any simulation and any acknowledgement made for the old one.
    case "CANDIDATE_CHANGED":
      return state.phase === "plan" || state.phase === "approval"
        ? { phase: "plan", simulationRunId: null, acknowledged: false }
        : state;

    case "SIMULATION_COMPLETED":
      return state.phase === "plan" ? { ...state, simulationRunId: event.simulationRunId, acknowledged: false } : state;

    case "CONTINUE_TO_APPROVAL":
      // Only once the simulation has actually completed for this plan.
      return state.phase === "plan" && event.plan.simulation.status === "completed"
        ? { ...state, phase: "approval", acknowledged: false }
        : state;

    case "ACKNOWLEDGE":
      return state.phase === "approval" ? { ...state, acknowledged: event.value } : state;

    case "APPROVE":
      // The single door into `review`: right phase, explicit acknowledgement, and an OPEN gate.
      return state.phase === "approval" && state.acknowledged && evaluateApprovalGate(event.plan, state.acknowledged).allowed
        ? { ...state, phase: "review" }
        : state;

    // Backing out always withdraws the acknowledgement: approval must be given afresh.
    case "BACK":
      if (state.phase === "review") return { ...state, phase: "approval", acknowledged: false };
      if (state.phase === "approval") return { ...state, phase: "plan", acknowledged: false };
      if (state.phase === "plan") return { phase: "parameters", simulationRunId: null, acknowledged: false };
      return state;

    case "RESET":
      return initialCopilotState;
  }
}
