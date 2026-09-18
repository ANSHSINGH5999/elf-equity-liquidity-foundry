import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: [
    "@elf/shared",
    "@elf/solana",
    "@elf/market-engine",
    "@elf/simulation-engine",
    "@elf/meteora-adapter",
    "@elf/prestocks-adapter",
    "@elf/tessera-adapter",
    "@elf/db",
    "@elf/indexer",
  ],
  outputFileTracingRoot: path.join(__dirname, "../.."),
};

export default nextConfig;
