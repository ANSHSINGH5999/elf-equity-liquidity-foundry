import { Keypair, PublicKey, type Connection, type Transaction } from "@solana/web3.js";
import BN from "bn.js";
import { deriveDbcPoolAddress } from "@meteora-ag/dynamic-bonding-curve-sdk";
import { getDbcClient } from "./client";

export interface CreatePoolWithFirstBuyResult {
  transaction: Transaction;
  /**
   * Fresh mint keypair for the DBC-native base token. Meteora's Dynamic
   * Bonding Curve mints its own tradable token at pool-creation time — it
   * cannot attach a curve to an arbitrary pre-existing mint. ELF treats the
   * asset's `mintAddress` (entered in Step 1) as the reference/underlying
   * identity for pricing alignment, and this pool base mint as the actual
   * on-chain trading instrument. See docs/market-model.md.
   */
  baseMintKeypair: Keypair;
  poolAddress: PublicKey;
}

/**
 * Builds (does not send) the real `createPoolWithFirstBuy` transaction —
 * step two of the deployment flow (`POST /api/dbc/pool`), signed only
 * after the config transaction from step one has confirmed. Needs no
 * on-chain read: `config` and `quoteMint` are passed in directly rather
 * than fetched, since both are already known from step one's result.
 */
export async function buildCreatePoolWithFirstBuyTransaction(params: {
  connection: Connection;
  config: PublicKey;
  quoteMint: PublicKey;
  payer: PublicKey;
  poolCreator: PublicKey;
  name: string;
  symbol: string;
  metadataUri: string;
  firstBuyAmountInQuoteLamports?: BN;
  firstBuyMinimumBaseOut?: BN;
  /** Reuse a specific base-mint keypair to resume an interrupted deployment (ELF V1 Phase 3). */
  baseMintKeypair?: Keypair;
}): Promise<CreatePoolWithFirstBuyResult> {
  const { connection, config, quoteMint, payer, poolCreator, name, symbol, metadataUri } = params;

  const client = getDbcClient(connection);
  const baseMintKeypair = params.baseMintKeypair ?? Keypair.generate();

  const firstBuyParam =
    params.firstBuyAmountInQuoteLamports && params.firstBuyAmountInQuoteLamports.gtn(0)
      ? {
          buyer: poolCreator,
          buyAmount: params.firstBuyAmountInQuoteLamports,
          minimumAmountOut: params.firstBuyMinimumBaseOut ?? new BN(0),
          referralTokenAccount: null,
        }
      : undefined;

  const transaction = await client.creator.createPoolWithFirstBuy({
    createPoolParam: {
      name,
      symbol,
      uri: metadataUri,
      payer,
      poolCreator,
      config,
      baseMint: baseMintKeypair.publicKey,
    },
    firstBuyParam,
  });

  const poolAddress = deriveDbcPoolAddress(quoteMint, baseMintKeypair.publicKey, config);

  return { transaction, baseMintKeypair, poolAddress };
}
