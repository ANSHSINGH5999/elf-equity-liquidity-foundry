import type { Connection, PublicKey } from "@solana/web3.js";
import { getDbcClient } from "./client";

/**
 * Once a pool's quote reserve reaches its migration threshold, Meteora
 * DBC allows migrating the completed curve into a DAMM v2 permanent
 * liquidity pool. ELF's MVP does not execute this migration automatically
 * — ELF never mutates a deployed configuration or triggers migration on a
 * user's behalf without their signature. This builds the real transaction
 * for a human to review and sign when the pool is ready.
 */
export async function buildMigrateToDammV2Transaction(params: {
  connection: Connection;
  payer: PublicKey;
  pool: PublicKey;
  dammConfig: PublicKey;
}) {
  const client = getDbcClient(params.connection);
  return client.migration.migrateToDammV2({
    payer: params.payer,
    pool: params.pool,
    dammConfig: params.dammConfig,
  });
}

export async function isPoolReadyToMigrate(connection: Connection, poolAddress: PublicKey): Promise<boolean> {
  const client = getDbcClient(connection);
  const progress = await client.state.getPoolQuoteTokenCurveProgress(poolAddress);
  return progress >= 1;
}
