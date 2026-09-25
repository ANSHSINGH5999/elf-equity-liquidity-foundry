import { NextResponse } from "next/server";
import BN from "bn.js";
import { Keypair } from "@solana/web3.js";
import bs58 from "bs58";
import { prisma } from "@elf/db";
import { dbcPoolRequestSchema } from "@elf/shared";
import {
  buildCreatePoolWithFirstBuyTransaction,
  configExistsOnChain,
  getLivePoolState,
  getQuoteUsdPrice,
  QuotePriceUnavailableError,
} from "@elf/meteora-adapter";
import { parsePublicKeyOrThrow } from "@elf/solana";
import { databaseUnavailable, apiError, isPrismaConnectionError, logUnhandledRouteError, mapTransactionSafetyError } from "@/lib/server/api-error";
import { getServerConnection, getServerRpcUrl } from "@/lib/server/rpc";
import { assertExpectedNetwork, prepareForWalletSignature } from "@/lib/server/transaction";
import { checkRateLimit, clientKeyFromRequest } from "@/lib/server/rate-limit";
import { checkDeploymentOwnership } from "@/lib/server/deployment-auth";

/**
 * Idempotent and truth-verified (ELF V1 Phase 3): before building
 * anything, this checks the *real on-chain state* of the config and
 * (if one is already recorded) the pool — never a client's self-report
 * — and advances `Launch.stage` accordingly. A retry after the config
 * step confirmed, or after the pool step confirmed, is always safe: it
 * returns the existing result instead of re-signing.
 */
export async function POST(request: Request) {
  if (!checkRateLimit(`dbc-pool:${clientKeyFromRequest(request)}`, 10, 60_000)) {
    return apiError("validation_error", "Too many requests. Slow down.", 429);
  }

  const body = await request.json().catch(() => null);
  const parsed = dbcPoolRequestSchema.safeParse(body);
  if (!parsed.success) {
    return apiError("validation_error", "Invalid pool request.", 400, parsed.error.flatten());
  }

  try {
    const launch = await prisma.launch.findUnique({
      where: { id: parsed.data.launchId },
      include: { asset: true, marketProfile: true },
    });
    if (!launch) return apiError("not_found", `Launch ${parsed.data.launchId} was not found.`, 404);
    if (!launch.configAddress || !launch.quoteMint) {
      return apiError("validation_error", "This launch has not completed the config step yet.", 400);
    }

    // HIGH-1 (security remediation): the caller must cryptographically prove
    // control of payerPublicKey, and it must match the wallet that owns this
    // Launch (bound during the config step). See docs/security-remediation.md.
    const ownershipError = checkDeploymentOwnership({
      message: {
        route: "dbc/pool",
        resourceId: launch.id,
        payerPublicKey: parsed.data.payerPublicKey,
        timestamp: parsed.data.authTimestamp,
      },
      signature: parsed.data.signature,
      existingOwnerWallet: launch.ownerWallet,
      existingLastAuthTimestamp: launch.lastAuthTimestamp,
    });
    if (ownershipError) return ownershipError;

    const connection = getServerConnection();
    const rpcUrl = getServerRpcUrl();
    await assertExpectedNetwork(connection, rpcUrl);

    const payer = parsePublicKeyOrThrow(parsed.data.payerPublicKey, "payerPublicKey");
    const poolCreator = parsePublicKeyOrThrow(parsed.data.poolCreatorPublicKey, "poolCreatorPublicKey");
    const config = parsePublicKeyOrThrow(launch.configAddress, "configAddress");
    const quoteMint = parsePublicKeyOrThrow(launch.quoteMint, "quoteMint");

    // Verify against real on-chain state, not the client's word, before doing anything else.
    if (launch.stage === "AWAITING_CONFIG_SIGNATURE" || launch.stage === "DRAFT") {
      const confirmed = await configExistsOnChain(connection, config);
      if (!confirmed) {
        return apiError(
          "validation_error",
          "The config transaction has not been confirmed on-chain yet. Wait for confirmation, then try again.",
          409,
        );
      }
      await prisma.launch.update({
        where: { id: launch.id },
        data: { stage: "CONFIG_CREATED", configKeypairSecret: null, lastAuthTimestamp: new Date(parsed.data.authTimestamp) },
      });
    }

    // Already have a pool on record — check whether it's actually live before rebuilding anything.
    if (launch.poolAddress) {
      const poolPk = parsePublicKeyOrThrow(launch.poolAddress, "poolAddress");
      const live = await getLivePoolState(connection, poolPk);
      if (live) {
        if (launch.stage !== "LIVE") {
          await prisma.launch.update({
            where: { id: launch.id },
            data: { stage: "LIVE", status: "live", baseMintKeypairSecret: null },
          });
        }
        return NextResponse.json({
          poolAddress: launch.poolAddress,
          baseMint: launch.baseMint,
          transactionBase64: null,
          alreadyConfirmed: true,
        });
      }
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
    const metadataUri = `${appUrl}/api/assets/${launch.assetId}/metadata`;

    let firstBuyLamports: BN | undefined;
    if (parsed.data.firstBuyUsd && parsed.data.firstBuyUsd > 0) {
      const quoteUsdPrice = await getQuoteUsdPrice(launch.marketProfile.quoteToken);
      const quoteDecimals = launch.marketProfile.quoteToken === "SOL" ? 9 : 6;
      const quoteAmount = parsed.data.firstBuyUsd / quoteUsdPrice;
      firstBuyLamports = new BN(Math.round(quoteAmount * 10 ** quoteDecimals));

      // The first buy spends the buyer's own quote token. SOL is wrapped from lamports by the SDK; an SPL quote
      // (USDC) must already be in the wallet, otherwise the swap fails on-chain with a bare "insufficient funds".
      if (launch.marketProfile.quoteToken !== "SOL") {
        const held = await connection.getParsedTokenAccountsByOwner(poolCreator, { mint: quoteMint });
        const balance = held.value.reduce((sum, a) => sum + BigInt(a.account.data.parsed.info.tokenAmount.amount), BigInt(0));
        if (balance < BigInt(firstBuyLamports.toString())) {
          const have = Number(balance) / 10 ** quoteDecimals;
          return apiError(
            "validation_error",
            `The first buy needs ${quoteAmount.toFixed(quoteDecimals)} ${launch.marketProfile.quoteToken} (mint ${quoteMint.toBase58()}) in the wallet that creates the pool, but that wallet holds ${have}. Fund it with that token on this network, or set the first buy to 0 (you can buy after the pool is live).`,
            400,
          );
        }
      }
    }

    // Resume with the SAME base-mint keypair if a prior attempt already built one.
    const baseMintKeypair = launch.baseMintKeypairSecret
      ? Keypair.fromSecretKey(bs58.decode(launch.baseMintKeypairSecret))
      : undefined;

    const {
      transaction,
      baseMintKeypair: usedKeypair,
      poolAddress,
    } = await buildCreatePoolWithFirstBuyTransaction({
      connection,
      config,
      quoteMint,
      payer,
      poolCreator,
      name: launch.asset.name,
      symbol: launch.asset.symbol,
      metadataUri,
      firstBuyAmountInQuoteLamports: firstBuyLamports,
      baseMintKeypair,
    });

    const { transactionBase64, lastValidBlockHeight } = await prepareForWalletSignature(
      connection,
      transaction,
      payer,
      [usedKeypair],
    );

    await prisma.launch.update({
      where: { id: launch.id },
      data: {
        baseMint: usedKeypair.publicKey.toBase58(),
        poolAddress: poolAddress.toBase58(),
        baseMintKeypairSecret: bs58.encode(usedKeypair.secretKey),
        stage: "AWAITING_POOL_SIGNATURE",
        lastAuthTimestamp: new Date(parsed.data.authTimestamp),
      },
    });

    return NextResponse.json({
      poolAddress: poolAddress.toBase58(),
      baseMint: usedKeypair.publicKey.toBase58(),
      transactionBase64,
      lastValidBlockHeight,
      alreadyConfirmed: false,
    });
  } catch (error) {
    const mapped = mapTransactionSafetyError(error);
    if (mapped) return mapped;
    if (error instanceof QuotePriceUnavailableError) {
      return apiError("provider_unavailable", error.message, 503);
    }
    if (isPrismaConnectionError(error)) {
      return databaseUnavailable(error);
    }
    if (error instanceof Error && error.message.includes("public key")) {
      return apiError("validation_error", error.message, 400);
    }
    logUnhandledRouteError("POST /api/dbc/pool", error);
    return apiError("internal_error", "Failed to build the pool transaction.", 500);
  }
}
