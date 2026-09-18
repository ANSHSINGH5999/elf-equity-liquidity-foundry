import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["tests/**/*.test.ts"],
    environment: "node",
    // Set here, not inside a test file: ESM import statements are hoisted
    // above other top-level code, so `process.env.DATABASE_URL = ...` at
    // the top of a test file would still run AFTER `import { prisma }`
    // has already constructed the client with whatever was (or wasn't)
    // set beforehand. Config-level env vars apply before any test file's
    // module graph loads at all, which is the only place this is safe.
    env: {
      DATABASE_URL: process.env.DATABASE_URL ?? "postgresql://elf:elf@localhost:5432/elf?schema=public",
    },
  },
  resolve: {
    alias: {
      "server-only": path.resolve(__dirname, "tests/stubs/server-only.ts"),
      // Mirrors apps/web/tsconfig.json's "@/*" -> "./src/*" path alias, so
      // tests can import apps/web route handlers and lib code directly
      // (e.g. tests/security/secret-exposure.test.ts importing route.ts).
      "@": path.resolve(__dirname, "apps/web/src"),
    },
  },
});
