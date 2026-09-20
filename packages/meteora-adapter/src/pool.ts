import { Keypair, PublicKey, type Connection, type Transaction } from "@solana/web3.js";
import BN from "bn.js";
import { deriveDbcPoolAddress } from "@meteora-ag/dynamic-bonding-curve-sdk";
import { getDbcClient } from "./client";

/**
 * Metaplex Token Metadata limits (bytes, not characters). The DBC program creates the base token's metadata
 * account with these; anything longer fails the whole pool transaction with "Name too long" (custom error 11).
 * A multi-byte character (an em dash is 3 bytes) counts by its UTF-8 length.
 */
export const METAPLEX_MAX_NAME_BYTES = 32;
export const METAPLEX_MAX_SYMBOL_BYTES = 10;
export const METAPLEX_MAX_URI_BYTES = 200;

const utf8Bytes = (text: string) => new TextEncoder().encode(text).length;

/**
 * Fits text into `maxBytes` UTF-8 bytes without splitting a character, preferring to cut at a word boundary
 * and never leaving a dangling separator. Text that already fits is returned unchanged.
 */
export function fitToUtf8Bytes(text: string, maxBytes: number): string {
  const trimmed = text.trim();
  if (utf8Bytes(trimmed) <= maxBytes) return trimmed;

  let kept = "";
  for (const ch of trimmed) {
    if (utf8Bytes(kept + ch) > maxBytes) break;
    kept += ch;
  }
  const cutMidWord = !/\s/.test(trimmed.slice(kept.length, kept.length + 1)) && /\S$/.test(kept);
  const lastSpace = kept.lastIndexOf(" ");
  if (cutMidWord && lastSpace >= Math.floor(kept.length / 2)) kept = kept.slice(0, lastSpace);
  return kept.replace(/[\s\u2014\u2013\-:,;/|(]+$/u, "");
}

export interface OnChainMetadataInput {
  name: string;
  symbol: string;
  uri: string;
}

/** Name and symbol are display text, so they are fitted; a URI cannot be truncated, so an oversized one is an error. */
export function fitOnChainMetadata({ name, symbol, uri }: OnChainMetadataInput): OnChainMetadataInput & { truncated: boolean } {
  if (utf8Bytes(uri) > METAPLEX_MAX_URI_BYTES) {
    throw new Error(`The token metadata URI is ${utf8Bytes(uri)} bytes; the on-chain limit is ${METAPLEX_MAX_URI_BYTES}.`);
  }
  const fitted = { name: fitToUtf8Bytes(name, METAPLEX_MAX_NAME_BYTES), symbol: fitToUtf8Bytes(symbol, METAPLEX_MAX_SYMBOL_BYTES), uri };
  if (!fitted.name || !fitted.symbol) throw new Error("The asset name and symbol must not be empty after fitting them to the on-chain limits.");
  return { ...fitted, truncated: fitted.name !== name.trim() || fitted.symbol !== symbol.trim() };
}

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
  const { connection, config, quoteMint, payer, poolCreator } = params;
  // The asset's own name may be longer than the on-chain token-metadata limits allow; the on-chain copy is fitted.
  const { name, symbol, uri: metadataUri } = fitOnChainMetadata({ name: params.name, symbol: params.symbol, uri: params.metadataUri });

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
