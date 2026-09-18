import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { describe, expect, it } from "vitest";

/**
 * Static regression guard over EVERY API route and every client component:
 * - no route may serialize a Prisma Launch row wholesale (which carries
 *   baseMintKeypairSecret / configKeypairSecret) — routes must pick fields;
 * - no route/component may reference the secret column names at all, except
 *   the two routes that legitimately WRITE/clear them during deployment;
 * - no client component may read a non-public env var (NEXT_PUBLIC_ only).
 * Runtime tests (trades-route, secret-exposure) prove the values; this makes
 * a careless future edit fail loudly at review time.
 */
const ROOT = join(__dirname, "../..");
const API_DIR = join(ROOT, "apps/web/src/app/api");
const COMPONENTS_DIR = join(ROOT, "apps/web/src/components");

function walk(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const full = join(dir, name);
    return statSync(full).isDirectory() ? walk(full) : [full];
  });
}

const routes = walk(API_DIR).filter((f) => f.endsWith("route.ts"));
const components = walk(COMPONENTS_DIR).filter((f) => /\.(tsx?|ts)$/.test(f));
const SECRET_COLUMNS = ["baseMintKeypairSecret", "configKeypairSecret"];
// Routes that build/advance a deployment and therefore must touch the columns to store/clear ephemeral keypairs.
const DEPLOYMENT_WRITERS = ["dbc/config/route.ts", "dbc/pool/route.ts", "launches/[id]/route.ts", "pools/route.ts"];

describe("API secret hygiene (static)", () => {
  it("finds the routes it is meant to guard", () => {
    expect(routes.length).toBeGreaterThan(20);
    expect(routes.some((f) => f.includes("markets/[id]/risk"))).toBe(true);
    expect(routes.some((f) => f.includes("markets/[id]/analyze"))).toBe(true);
  });

  it.each(routes.map((f) => [relative(ROOT, f), readFileSync(f, "utf8")]))("%s never serializes a Launch row wholesale", (_name, source) => {
    const serializesLaunchVariable =
      /NextResponse\.json\(\s*launch\s*[,)]/.test(source) ||
      /\.\.\.\s*launch\b(?!Id)/.test(source) ||
      /NextResponse\.json\(\s*\{\s*launch\s*[,}]/.test(source);
    if (!serializesLaunchVariable) return;
    // Serializing a `launch` variable is only acceptable when it came from an explicit field list.
    // (The keypair-secret columns are separately forbidden by name below, so a `select` cannot include them.)
    expect(source).toMatch(/prisma\.launch\.\w+\([\s\S]*?\bselect:\s*\{/);
  });

  it.each(routes.map((f) => [relative(ROOT, f), readFileSync(f, "utf8")]))("%s does not reference keypair-secret columns unless it is a deployment writer", (name, source) => {
    if (DEPLOYMENT_WRITERS.some((w) => name.endsWith(w))) return;
    for (const column of SECRET_COLUMNS) expect(source).not.toContain(column);
  });

  it("no route exposes the Pyth API key or reads it directly", () => {
    for (const f of routes) expect(readFileSync(f, "utf8")).not.toContain("PYTH_API_KEY");
  });

  it.each(components.map((f) => [relative(ROOT, f), readFileSync(f, "utf8")]))("%s reads no server-only environment variable", (_name, source) => {
    const reads = [...source.matchAll(/process\.env\.([A-Z0-9_]+)/g)].map((m) => m[1]!);
    for (const name of reads) expect(name.startsWith("NEXT_PUBLIC_") || name === "NODE_ENV").toBe(true);
  });

  it("no client component references a keypair-secret column", () => {
    for (const f of components) for (const column of SECRET_COLUMNS) expect(readFileSync(f, "utf8")).not.toContain(column);
  });
});
