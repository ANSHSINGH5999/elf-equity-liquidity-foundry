import { Keypair, PublicKey, type Connection, type Transaction } from "@solana/web3.js";
import type { ConfigParameters } from "@meteora-ag/dynamic-bonding-curve-sdk";
import type { CurveCandidate, MarketProfile } from "@elf/shared";
import { resolveClusterFromRpcUrl, resolveQuoteMint } from "@elf/solana";
import { getDbcClient } from "./client";
import { buildConfigParametersFromCandidate } from "./curve";

export interface CreateConfigTransactionResult {
  transaction: Transaction;
  /** Fresh config account keypair — must co-sign alongside the connected wallet before submission. */
  configKeypair: Keypair;
  configParameters: ConfigParameters;
  quoteMint: PublicKey;
}

/**
 * Builds (does not send) the real `createConfig` transaction — step one of
 * the two-transaction deployment flow (`POST /api/dbc/config`). Building
 * this instruction needs no on-chain reads: the config account doesn't
 * exist yet, so every value here comes from the approved candidate.
 */
export async function buildCreateConfigTransaction(params: {
  connection: Connection;
  candidate: CurveCandidate;
  profile: MarketProfile;
  payer: PublicKey;
  feeClaimer: PublicKey;
  leftoverReceiver?: PublicKey;
  rpcUrl: string;
  /**
   * Reuse a specific config keypair instead of generating a fresh one.
   * Used to resume an interrupted deployment (ELF V1 Phase 3) without
   * risking a second config account for the same intent — omit to
   * generate a new one for a first attempt.
   */
  configKeypair?: Keypair;
}): Promise<CreateConfigTransactionResult> {
  const { connection, candidate, profile, payer, feeClaimer, rpcUrl } = params;
  const leftoverReceiver = params.leftoverReceiver ?? feeClaimer;

  const configParameters = await buildConfigParametersFromCandidate(candidate, profile);
  const cluster = resolveClusterFromRpcUrl(rpcUrl);
  const quoteMint = resolveQuoteMint(profile.quoteToken, cluster);

  const client = getDbcClient(connection);
  const configKeypair = params.configKeypair ?? Keypair.generate();

  const transaction = await client.partner.createConfig({
    ...configParameters,
    config: configKeypair.publicKey,
    feeClaimer,
    leftoverReceiver,
    quoteMint,
    payer,
  });

  return { transaction, configKeypair, configParameters, quoteMint };
}
