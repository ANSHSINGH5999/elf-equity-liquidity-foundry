import { execFileSync } from "node:child_process";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { describe, expect, it } from "vitest";

/**
 * Structural guarantees for the Groq and CoinCap integrations: the keys are server-only. A future edit that moves a
 * provider call into the browser, or exposes a key through NEXT_PUBLIC_*, fails here.
 */
const ROOT = join(__dirname, "../..");
const read = (rel: string) => readFileSync(join(ROOT, rel), "utf8");

function walk(dir: string, out: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    if (name === "node_modules" || name === ".next" || name === ".turbo") continue;
    const full = join(dir, name);
    if (statSync(full).isDirectory()) walk(full, out);
    else if (/\.(ts|tsx)$/.test(name)) out.push(relative(ROOT, full));
  }
  return out;
}
const webSources = walk(join(ROOT, "apps/web/src"));
const clientFiles = webSources.filter((f) => /^\s*["']use client["']/.test(read(f)));

describe("Groq / CoinCap keys stay server-side", () => {
  it("no NEXT_PUBLIC_ variable exists for either provider, anywhere in source, docs or env templates", () => {
    const files = [...webSources, ".env.example", "README.md", "turbo.json", "apps/web/next.config.ts"].filter((f) => {
      try {
        return statSync(join(ROOT, f)).isFile();
      } catch {
        return false;
      }
    });
    for (const f of files) expect(read(f), f).not.toMatch(/NEXT_PUBLIC_(GROQ|COINCAP)/i);
  });

  it("no client component references a provider origin, a provider key variable, or a provider client module", () => {
    expect(clientFiles.length).toBeGreaterThan(20);
    for (const f of clientFiles) {
      const source = read(f);
      expect(source, f).not.toMatch(/api\.groq\.com|rest\.coincap\.io|GROQ_API_KEY|COINCAP_API_KEY|@\/lib\/server\/(groq|coincap|aiMarketAnalysis)/);
    }
  });

  it("only the two provider modules ever touch a provider origin or read a provider key", () => {
    const allowed = new Set(["apps/web/src/lib/server/groq.ts", "apps/web/src/lib/server/coincap.ts", "apps/web/src/app/api/ai/market-analysis/route.ts"]);
    for (const f of webSources) {
      if (allowed.has(f)) continue;
      expect(read(f), f).not.toMatch(/api\.groq\.com|rest\.coincap\.io|process\.env\.(GROQ|COINCAP)_API_KEY/);
    }
  });

  it.each(["apps/web/src/lib/server/groq.ts", "apps/web/src/lib/server/coincap.ts", "apps/web/src/lib/server/aiMarketAnalysis.ts"])("%s is server-only", (f) => {
    expect(read(f)).toMatch(/^import "server-only";/m);
  });

  it("neither provider module logs, throws or interpolates a key", () => {
    for (const f of ["apps/web/src/lib/server/groq.ts", "apps/web/src/lib/server/coincap.ts", "apps/web/src/lib/server/aiMarketAnalysis.ts"]) {
      const source = read(f);
      expect(source, f).not.toMatch(/console\.(log|info|warn|error|debug)/);
      expect(source, f).not.toMatch(/throw new Error\([^)]*(apiKey|key)/i);
    }
    // The key is only ever used as the Bearer credential.
    expect(read("apps/web/src/lib/server/groq.ts").match(/apiKey/g)!.length).toBeLessThanOrEqual(6);
    expect(read("apps/web/src/lib/server/groq.ts")).toMatch(/Authorization: `Bearer \$\{apiKey\}`/);
    expect(read("apps/web/src/lib/server/coincap.ts")).toMatch(/Authorization: `Bearer \$\{key\}`/);
  });

  it("the AI module never lets the client supply facts: the route accepts exactly { marketId }", () => {
    const route = read("apps/web/src/app/api/ai/market-analysis/route.ts");
    expect(route).toMatch(/z\.object\(\{ marketId: .*\}\)\.strict\(\)/);
  });

  it(".env.example holds empty placeholders only, and .env is git-ignored", () => {
    const example = read(".env.example");
    expect(example).toMatch(/^GROQ_API_KEY=\s*$/m);
    expect(example).toMatch(/^COINCAP_API_KEY=\s*$/m);
    expect(execFileSync("git", ["check-ignore", ".env"], { cwd: ROOT }).toString().trim()).toBe(".env");
    expect(execFileSync("git", ["ls-files", ".env"], { cwd: ROOT }).toString().trim()).toBe("");
  });

  it("no tracked or untracked-unignored file contains a Groq-style key", () => {
    const files = execFileSync("git", ["ls-files", "--cached", "--others", "--exclude-standard"], { cwd: ROOT }).toString().split("\n").filter(Boolean);
    for (const f of files) {
      if (!/\.(ts|tsx|md|json|mjs|js|yml|yaml|env|example|css|html|txt)$/.test(f) && !f.endsWith(".env.example")) continue;
      let text: string;
      try {
        text = readFileSync(join(ROOT, f), "utf8");
      } catch {
        continue;
      }
      expect(text, f).not.toMatch(/gsk_[A-Za-z0-9]{20,}/);
    }
  });
});
