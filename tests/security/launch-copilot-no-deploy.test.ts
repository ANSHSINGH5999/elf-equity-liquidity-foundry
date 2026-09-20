import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

/**
 * The Market Launch Copilot must NEVER deploy or sign anything itself. The
 * runtime proofs are the reducer tests (tests/ui) and the route test
 * (tests/security/launch-plan-route: no rows created). This file adds the
 * structural guarantee: the Copilot's code simply has no path to
 * deployment, signing, key handling or database writes, so a careless future
 * edit that adds one fails here.
 */
const ROOT = join(__dirname, "../..");
const read = (rel: string) => readFileSync(join(ROOT, rel), "utf8");

const COPILOT_UI = [
  "apps/web/src/components/design/launch-copilot.tsx",
  "apps/web/src/components/design/launch-copilot-state.ts",
  "apps/web/src/components/design/launch-plan-view.tsx",
  "apps/web/src/components/design/launch-readiness-panel.tsx",
  "apps/web/src/app/design/copilot/page.tsx",
];
const COPILOT_SERVER = [
  "apps/web/src/app/api/markets/launch-plan/route.ts",
  "packages/market-engine/src/launchPlan.ts",
  "packages/market-engine/src/launchReadiness.ts",
  "packages/meteora-adapter/src/validate.ts",
];

// Anything that deploys, signs, builds a transaction, or handles key material.
const FORBIDDEN_EVERYWHERE = [
  /buildCreateConfigTransaction/, /buildCreatePoolWithFirstBuyTransaction/, /buildSwapTransaction/, /buildMigrateToDammV2Transaction/,
  /prepareForWalletSignature/, /partialSign/, /sendRawTransaction/, /signTransaction/, /signMessage/,
  /Keypair/, /secretKey/, /privateKey/, /KeypairSecret/, /checkDeploymentOwnership/,
];

describe("Market Launch Copilot — structurally cannot deploy", () => {
  it.each([...COPILOT_UI, ...COPILOT_SERVER])("%s contains no deployment, signing, transaction-building or key-handling code", (file) => {
    const source = read(file);
    for (const pattern of FORBIDDEN_EVERYWHERE) expect(source, `${file} matched ${pattern}`).not.toMatch(pattern);
  });

  it.each(COPILOT_UI)("%s never calls a deployment endpoint (/api/dbc/*)", (file) => {
    expect(read(file)).not.toMatch(/\/api\/dbc\//);
  });

  it("the Copilot UI only talks to the plan route, the existing design/simulate routes (via the reused steps) — and never the wallet", () => {
    const copilot = read("apps/web/src/components/design/launch-copilot.tsx");
    const endpoints = [...copilot.matchAll(/["'`](\/api\/[^"'`]+)["'`]/g)].map((m) => m[1]);
    expect(new Set(endpoints)).toEqual(new Set(["/api/markets/launch-plan", "/api/markets/simulate"]));
    expect(copilot).not.toMatch(/useWallet|useConnection|@solana\/wallet-adapter/);
  });

  it("the plan route performs NO database writes", () => {
    const route = read("apps/web/src/app/api/markets/launch-plan/route.ts");
    expect(route).not.toMatch(/\.(create|createMany|update|updateMany|upsert|delete|deleteMany)\s*\(/);
    expect(route).not.toMatch(/\$executeRaw|\$queryRawUnsafe|\$executeRawUnsafe/);
    expect(route).not.toMatch(/prisma\.launch/);
  });

  it("the plan route reads the simulation from the database, never from the request body", () => {
    const route = read("apps/web/src/app/api/markets/launch-plan/route.ts");
    expect(route).toMatch(/prisma\.simulationRun\.findUnique/);
    expect(route).toMatch(/run\.curveConfigId !== curveConfigRow\.id/);
    expect(route).not.toMatch(/body\??\.\s*scenarios|parsed\.data\.scenarios/);
  });

  it("the ONLY thing mounting the existing wallet/deploy step is the `review` phase", () => {
    const copilot = read("apps/web/src/components/design/launch-copilot.tsx");
    expect((copilot.match(/<ReviewStep/g) ?? []).length).toBe(1);
    const at = copilot.indexOf("<ReviewStep");
    const guard = copilot.slice(0, at).match(/flow\.phase === "(\w+)"/g)?.at(-1);
    expect(guard).toBe('flow.phase === "review"');
  });

  it("APPROVE can only be dispatched from a control that is disabled unless the engine's gate is open", () => {
    const copilot = read("apps/web/src/components/design/launch-copilot.tsx");
    expect((copilot.match(/type: "APPROVE"/g) ?? []).length).toBe(1);
    expect(copilot).toMatch(/disabled=\{!gate\.allowed\} onClick=\{\(\) => dispatch\(\{ type: "APPROVE", plan \}\)\}/);
  });

  it("nothing advances the flow automatically: no timers and no effects in the Copilot", () => {
    const copilot = read("apps/web/src/components/design/launch-copilot.tsx");
    expect(copilot).not.toMatch(/useEffect|setTimeout|setInterval|requestAnimationFrame/);
  });

  it("the existing wizard and the deployment step are untouched by the Copilot (it composes them, never edits them)", () => {
    // ReviewStep still owns ownership proofs and wallet signing (now routed through the network guard, which
    // signs with the wallet for the configured cluster — see tests/integration/walletNetworkGuard.test.ts).
    const review = read("apps/web/src/components/design/review-step.tsx");
    expect(review).toMatch(/clusterSigner\.sign\(/);
    expect(review).toMatch(/buildOwnershipMessage/);
    const wizard = read("apps/web/src/components/design/wizard.tsx");
    expect(wizard).not.toMatch(/launch-copilot|LaunchCopilot/);
  });
});
