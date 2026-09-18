import { createConnection } from "@elf/solana";
import { runIndexerOnce } from "./run";

/**
 * Standalone entry point for running the indexer as a long-lived
 * process (e.g. a Railway/Render worker with its own poll loop), as an
 * alternative to the Vercel-Cron-triggered `/api/indexer/run` route.
 * `node --experimental-strip-types src/cli.ts` (see package.json).
 */
async function main() {
  const rpcUrl = process.env.SOLANA_RPC_URL ?? "https://api.devnet.solana.com";
  const connection = createConnection(rpcUrl, "confirmed");

  const result = await runIndexerOnce(connection);
  console.log(JSON.stringify(result, null, 2));

  if (result.errors.length > 0) {
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
