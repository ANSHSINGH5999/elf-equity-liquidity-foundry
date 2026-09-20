import type { LabRunResult } from "@elf/shared";

/**
 * Session-scoped storage for completed Simulation Lab runs. Results are never
 * sent to or stored by the server: they live in sessionStorage (with an
 * in-memory fallback when storage is blocked) and disappear with the tab.
 */
export const MAX_SESSION_RUNS = 12;
const KEY = "elf.simulationLab.runs.v1";

const listeners = new Set<() => void>();
let memory = "[]";

export const subscribeSessionRuns = (listener: () => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

export const getSessionRunsSnapshot = (): string => {
  try {
    return window.sessionStorage.getItem(KEY) ?? memory;
  } catch {
    return memory;
  }
};

export const getServerRunsSnapshot = (): string => "[]";

export function saveSessionRuns(runs: LabRunResult[]): void {
  memory = JSON.stringify(runs);
  try {
    window.sessionStorage.setItem(KEY, memory);
  } catch {
    // storage blocked: the in-memory copy still serves this tab
  }
  listeners.forEach((l) => l());
}

/** A stored run is only trusted if it still carries the off-chain labels and the shape the UI reads. */
export function isStoredRun(value: unknown): value is LabRunResult {
  const r = value as Partial<LabRunResult> | null;
  return (
    !!r &&
    typeof r === "object" &&
    r.label === "SIMULATION — OFF-CHAIN" &&
    typeof r.runId === "string" &&
    typeof r.curveCandidateId === "string" &&
    typeof r.scenario === "string" &&
    !!r.result &&
    r.result.label === "SIMULATED" &&
    Array.isArray(r.result.trades) &&
    Array.isArray(r.checks) &&
    Array.isArray(r.warnings) &&
    !!r.parameters &&
    Array.isArray(r.parameters.sides)
  );
}

export function parseStoredRuns(raw: string | null): LabRunResult[] {
  if (!raw) return [];
  try {
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter(isStoredRun).slice(0, MAX_SESSION_RUNS) : [];
  } catch {
    return [];
  }
}

/** Newest first, no duplicates, capped. */
export const addRun = (runs: LabRunResult[], run: LabRunResult): LabRunResult[] => [run, ...runs.filter((r) => r.runId !== run.runId)].slice(0, MAX_SESSION_RUNS);

export const removeRun = (runs: LabRunResult[], runId: string): LabRunResult[] => runs.filter((r) => r.runId !== runId);

export const toggleId = (ids: string[], id: string): string[] => (ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id]);
