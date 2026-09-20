import { PUBLIC_DEVNET_RPC_URL, assertClusterMatches, createConnection, resolveClusterFromRpcUrl } from "@elf/solana";
import { runIndexerOnce } from "./run";

/**
 * Standalone entry point for running the indexer as a long-lived
 * process (e.g. a Railway/Render worker with its own poll loop), as an
 * alternative to the Vercel-Cron-triggered `/api/indexer/run` route.
 * `node --experimental-strip-types src/cli.ts` (see package.json).
 */
async function main() {
  const rpcUrl = process.env.SOLANA_RPC_URL || PUBLIC_DEVNET_RPC_URL;
  const connection = createConnection(rpcUrl, "confirmed");
  await assertClusterMatches(connection, resolveClusterFromRpcUrl(rpcUrl)); // never index an endpoint that is not the configured cluster

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
