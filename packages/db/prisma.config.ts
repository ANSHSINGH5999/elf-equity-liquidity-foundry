import path from "node:path";
import { defineConfig } from "prisma/config";

try {
  process.loadEnvFile(path.join(__dirname, "../../.env"));
} catch {
  // ignore if .env does not exist or already loaded
}

export default defineConfig({
  schema: path.join(__dirname, "../../prisma/schema.prisma"),
});
