import { NextResponse } from "next/server";
import { Keypair } from "@solana/web3.js";
import bs58 from "bs58";
import { prisma } from "@elf/db";
import { dbcConfigRequestSchema } from "@elf/shared";
import { buildCreateConfigTransaction, QuotePriceUnavailableError } from "@elf/meteora-adapter";
import { parsePublicKeyOrThrow } from "@elf/solana";
import { databaseUnavailable, apiError, isPrismaConnectionError, logUnhandledRouteError, mapTransactionSafetyError } from "@/lib/server/api-error";
import { getServerConnection, getServerRpcUrl } from "@/lib/server/rpc";
import { curveConfigRowToDomain, marketProfileRowToDomain } from "@/lib/server/mappers";
import { assertExpectedNetwork, prepareForWalletSignature } from "@/lib/server/transaction";
import { checkRateLimit, clientKeyFromRequest } from "@/lib/server/rate-limit";
import { checkDeploymentOwnership } from "@/lib/server/deployment-auth";

/**
 * Idempotent by `curveConfigId` (ELF V1 Phase 3): at most one Launch row
 * ever exists per curve config (`@@unique([curveConfigId])`). A retry —
 * double-click, refresh, timed-out first request — resumes the same
 * in-flight attempt with the same config keypair rather than generating
 * a second on-chain config account.
 */
export async function POST(request: Request) {
  if (!checkRateLimit(`dbc-config:${clientKeyFromRequest(request)}`, 10, 60_000)) {
    return apiError("validation_error", "Too many requests. Slow down.", 429);
  }

  const body = await request.json().catch(() => null);
  const parsed = dbcConfigRequestSchema.safeParse(body);
  if (!parsed.success) {
    return apiError("validation_error", "Invalid config request.", 400, parsed.error.flatten());
  }

  try {
    const curveConfigRow = await prisma.curveConfig.findUnique({ where: { id: parsed.data.curveCandidateId } });
    if (!curveConfigRow || curveConfigRow.assetId !== parsed.data.assetId) {
      return apiError("not_found", "Curve config not found for this asset.", 404);
    }
    const marketProfileRow = await prisma.marketProfile.findUnique({ where: { id: curveConfigRow.marketProfileId } });
    if (!marketProfileRow) return apiError("not_found", "Market profile not found.", 404);

    const candidate = curveConfigRowToDomain(curveConfigRow);
    const profile = marketProfileRowToDomain(marketProfileRow);
    const connection = getServerConnection();
    const rpcUrl = getServerRpcUrl();

    await assertExpectedNetwork(connection, rpcUrl);

    const payer = parsePublicKeyOrThrow(parsed.data.payerPublicKey, "payerPublicKey");
    const feeClaimer = parsePublicKeyOrThrow(parsed.data.feeClaimerPublicKey, "feeClaimerPublicKey");

    const existing = await prisma.launch.findUnique({ where: { curveConfigId: candidate.id } });

    // HIGH-1 (security remediation): the caller must cryptographically prove
    // control of payerPublicKey, and — if a Launch already exists for this
    // curveConfigId — that proof must be from the same wallet that owns it.
    // See docs/security-remediation.md.
    const ownershipError = checkDeploymentOwnership({
      message: {
        route: "dbc/config",
        resourceId: candidate.id,
        payerPublicKey: parsed.data.payerPublicKey,
        timestamp: parsed.data.authTimestamp,
      },
      signature: parsed.data.signature,
      existingOwnerWallet: existing?.ownerWallet,
      existingLastAuthTimestamp: existing?.lastAuthTimestamp,
    });
    if (ownershipError) return ownershipError;

    // Already confirmed on-chain (or further along) — nothing to sign again.
    if (existing && existing.stage !== "AWAITING_CONFIG_SIGNATURE" && existing.stage !== "FAILED") {
      return NextResponse.json({
        launchId: existing.id,
        configAddress: existing.configAddress,
        quoteMint: existing.quoteMint,
        transactionBase64: null,
        alreadyConfirmed: true,
      });
    }

    // Resume an in-flight or failed attempt with the SAME config keypair — never a fresh one.
    const configKeypair =
      existing?.configKeypairSecret ? Keypair.fromSecretKey(bs58.decode(existing.configKeypairSecret)) : undefined;

    const { transaction, configKeypair: usedKeypair, quoteMint } = await buildCreateConfigTransaction({
      connection,
      candidate,
      profile,
      payer,
      feeClaimer,
      rpcUrl,
      configKeypair,
    });

    const { transactionBase64, lastValidBlockHeight } = await prepareForWalletSignature(
      connection,
      transaction,
      payer,
      [usedKeypair],
    );

    const launch = await prisma.launch.upsert({
      where: { curveConfigId: candidate.id },
      update: {
        configAddress: usedKeypair.publicKey.toBase58(),
        quoteMint: quoteMint.toBase58(),
        configKeypairSecret: bs58.encode(usedKeypair.secretKey),
        stage: "AWAITING_CONFIG_SIGNATURE",
        status: "pending_deployment",
        ownerWallet: parsed.data.payerPublicKey,
        lastAuthTimestamp: new Date(parsed.data.authTimestamp),
      },
      create: {
        assetId: parsed.data.assetId,
        marketProfileId: profile.id,
        curveConfigId: candidate.id,
        configAddress: usedKeypair.publicKey.toBase58(),
        quoteMint: quoteMint.toBase58(),
        configKeypairSecret: bs58.encode(usedKeypair.secretKey),
        stage: "AWAITING_CONFIG_SIGNATURE",
        status: "pending_deployment",
        ownerWallet: parsed.data.payerPublicKey,
        lastAuthTimestamp: new Date(parsed.data.authTimestamp),
      },
    });

    return NextResponse.json({
      launchId: launch.id,
      configAddress: usedKeypair.publicKey.toBase58(),
      quoteMint: quoteMint.toBase58(),
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
    logUnhandledRouteError("POST /api/dbc/config", error);
    return apiError("internal_error", "Failed to build the config transaction.", 500);
  }
}
