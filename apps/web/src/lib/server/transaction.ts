import "server-only";
import type { Connection, Keypair, PublicKey, Transaction } from "@solana/web3.js";
import { simulateBeforeSigning } from "@elf/meteora-adapter";
import { assertClusterMatches, resolveClusterFromRpcUrl } from "@elf/solana";

/**
 * Confirms the RPC endpoint this server is about to build a transaction
 * against genuinely serves the cluster its own URL claims to (ELF V1
 * Phase 2 — network validation). Call this before building any
 * transaction, not just before sending one.
 */
export async function assertExpectedNetwork(connection: Connection, rpcUrl: string): Promise<void> {
  await assertClusterMatches(connection, resolveClusterFromRpcUrl(rpcUrl));
}

/**
 * Attaches a fresh blockhash and fee payer, partially signs with any
 * server-generated ephemeral keypairs (new config/mint accounts — never a
 * user wallet key), simulates the result against current on-chain state,
 * and serializes for the browser to finish signing with the connected
 * wallet. The wallet is always the last signature added.
 *
 * Simulating here (ELF V1 Phase 2) surfaces failures — insufficient
 * balance, a stale account, a bad instruction — before the user is ever
 * prompted to sign, instead of after a wasted wallet round-trip.
 */
export async function prepareForWalletSignature(
  connection: Connection,
  transaction: Transaction,
  feePayer: PublicKey,
  ephemeralSigners: Keypair[],
): Promise<{ transactionBase64: string; blockhash: string; lastValidBlockHeight: number }> {
  const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash("confirmed");
  transaction.recentBlockhash = blockhash;
  transaction.feePayer = feePayer;

  for (const signer of ephemeralSigners) {
    transaction.partialSign(signer);
  }

  await simulateBeforeSigning(connection, transaction);

  const transactionBase64 = transaction
    .serialize({ requireAllSignatures: false, verifySignatures: false })
    .toString("base64");

  return { transactionBase64, blockhash, lastValidBlockHeight };
}
