import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

/**
 * Static proof that the Simulation Lab is off-chain: none of its code can sign,
 * send, deploy, hold keys, or write to the database. (The runtime proof — the
 * engine works with a connection that throws on any use — is in
 * tests/market-engine/simulationLab.test.ts.)
 */
const root = join(__dirname, "../..");
const walk = (dir: string): string[] =>
  readdirSync(dir).flatMap((f) => {
    const p = join(dir, f);
    return statSync(p).isDirectory() ? walk(p) : [p];
  });

const LAB_FILES = [
  "apps/web/src/app/api/markets/simulation-lab/route.ts",
  "packages/simulation-engine/src/lab.ts",
  "packages/simulation-engine/src/scenarios.ts",
  "packages/market-engine/src/simulationLab.ts",
  ...walk(join(root, "apps/web/src/components/design"))
    .filter((f) => /simulation-lab|lab-state|lab-chart/.test(f))
    .map((f) => f.slice(root.length + 1)),
  ...walk(join(root, "apps/web/src/app/design/lab")).map((f) => f.slice(root.length + 1)),
];

const FORBIDDEN: [string, RegExp][] = [
  ["signing / sending", /signTransaction|signAllTransactions|signMessage|sendTransaction|sendRawTransaction|sendAndConfirm|confirmTransaction/],
  ["wallet or keys", /useWallet|wallet-adapter|Keypair|secretKey|privateKey|mnemonic|seedPhrase|generateKeypair/i],
  ["transaction building", /buildCreateConfigTransaction|buildCreatePoolWithFirstBuyTransaction|buildSwapTransaction|prepareForWalletSignature|Transaction\.from/],
  ["deployment routes", /\/api\/dbc\/|\/api\/launches/],
  ["database writes", /prisma\.\w+\.(create|createMany|update|updateMany|upsert|delete|deleteMany)\b|\$executeRaw/],
  ["client storage of secrets", /localStorage/],
];

describe("Simulation Lab is off-chain", () => {
  it("covers the files it claims to", () => {
    expect(LAB_FILES.length).toBeGreaterThanOrEqual(6);
    for (const f of LAB_FILES) expect(() => readFileSync(join(root, f), "utf8"), f).not.toThrow();
  });

  it.each(FORBIDDEN)("no Lab file contains %s", (_label, pattern) => {
    for (const f of LAB_FILES) {
      const src = readFileSync(join(root, f), "utf8").replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "");
      expect(src, f).not.toMatch(pattern);
    }
  });

  it("the route only reads: it never calls prisma with a write method and imports no deployment code", () => {
    const route = readFileSync(join(root, "apps/web/src/app/api/markets/simulation-lab/route.ts"), "utf8");
    expect(route).toContain("prisma.curveConfig.findUnique");
    expect(route).not.toMatch(/from "@\/lib\/server\/(launch|deploy|ownership|keypair)/);
  });

  it("every UI surface carries the off-chain label", () => {
    const view = LAB_FILES.filter((f) => f.endsWith(".tsx")).map((f) => readFileSync(join(root, f), "utf8")).join("\n");
    expect(view).toContain("SIMULATION — OFF-CHAIN");
    expect(view).toContain("SIMULATED");
  });
});
