import { describe, expect, it, vi } from "vitest";
import {
  MAX_SESSION_RUNS,
  addRun,
  getServerRunsSnapshot,
  getSessionRunsSnapshot,
  isStoredRun,
  parseStoredRuns,
  removeRun,
  saveSessionRuns,
  subscribeSessionRuns,
  toggleId,
} from "../../apps/web/src/components/design/lab-state.js";
import type { LabRunResult } from "../../packages/shared/src/index.js";

const run = (id: string, over: Partial<LabRunResult> = {}): LabRunResult =>
  ({
    label: "SIMULATION — OFF-CHAIN",
    runId: id,
    curveCandidateId: "c1",
    curveLabel: "Balanced",
    scenario: "normal_demand",
    parameters: { curveProgressFraction: 0.05, sides: ["buy", "buy", "sell", "buy"], customised: false },
    result: { scenario: "normal_demand", description: "", trades: [], worstCasePriceImpactBps: 0, label: "SIMULATED" },
    graduation: null,
    checks: [],
    warnings: [],
    createdAt: "2026-09-20T00:00:00.000Z",
    ...over,
  }) as LabRunResult;

describe("session runs", () => {
  it("adds newest first, without duplicates, capped", () => {
    let runs: LabRunResult[] = [];
    for (let i = 0; i < MAX_SESSION_RUNS + 5; i++) runs = addRun(runs, run(`r${i}`));
    expect(runs).toHaveLength(MAX_SESSION_RUNS);
    expect(runs[0]!.runId).toBe(`r${MAX_SESSION_RUNS + 4}`);
    expect(addRun(runs, run("r20")).filter((r) => r.runId === "r20")).toHaveLength(1);
  });

  it("removes a run and toggles ids", () => {
    expect(removeRun([run("a"), run("b")], "a").map((r) => r.runId)).toEqual(["b"]);
    expect(toggleId(["a"], "b")).toEqual(["a", "b"]);
    expect(toggleId(["a", "b"], "a")).toEqual(["b"]);
  });

  it("round-trips through the session store and notifies subscribers (in-memory fallback without a browser)", () => {
    const listener = vi.fn();
    const unsubscribe = subscribeSessionRuns(listener);
    saveSessionRuns([run("x")]);
    expect(listener).toHaveBeenCalledTimes(1);
    expect(parseStoredRuns(getSessionRunsSnapshot()).map((r) => r.runId)).toEqual(["x"]);
    unsubscribe();
    saveSessionRuns([]);
    expect(listener).toHaveBeenCalledTimes(1);
  });

  it("server snapshot is empty", () => {
    expect(parseStoredRuns(getServerRunsSnapshot())).toEqual([]);
  });
});

describe("stored data is untrusted", () => {
  it.each([null, "", "not json", "{}", '"str"', "[1,2]", "[null]"])("parseStoredRuns(%j) yields no runs", (raw) => {
    expect(parseStoredRuns(raw)).toEqual([]);
  });

  it("drops anything that lost its off-chain labels or expected shape", () => {
    const good = run("ok");
    const tampered = [
      { ...good, runId: "no-label", label: "LIVE" },
      { ...good, runId: "live-result", result: { ...good.result, label: "LIVE" } },
      { ...good, runId: "no-checks", checks: undefined },
      { ...good, runId: "no-params", parameters: undefined },
    ];
    expect(parseStoredRuns(JSON.stringify([good, ...tampered])).map((r) => r.runId)).toEqual(["ok"]);
    expect(isStoredRun(tampered[0])).toBe(false);
  });

  it("caps what it will load", () => {
    const many = Array.from({ length: MAX_SESSION_RUNS + 10 }, (_, i) => run(`r${i}`));
    expect(parseStoredRuns(JSON.stringify(many))).toHaveLength(MAX_SESSION_RUNS);
  });
});
