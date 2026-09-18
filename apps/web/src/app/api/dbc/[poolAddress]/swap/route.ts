import { NextResponse } from "next/server";
import BN from "bn.js";
import { dbcSwapRequestSchema } from "@elf/shared";
import {
  buildSwapTransaction,
  getLivePoolState,
  getOnchainSwapQuote,
  getQuoteUsdPrice,
  QuotePriceUnavailableError,
} from "@elf/meteora-adapter";
import type { QuoteToken } from "@elf/shared";
import { parsePublicKeyOrThrow } from "@elf/solana";
import { apiError, logUnhandledRouteError, mapTransactionSafetyError } from "@/lib/server/api-error";
import { getServerConnection, getServerRpcUrl } from "@/lib/server/rpc";
import { assertExpectedNetwork, prepareForWalletSignature } from "@/lib/server/transaction";
import { checkRateLimit, clientKeyFromRequest } from "@/lib/server/rate-limit";

/**
 * Builds an unsigned buy/sell transaction against a live, already-deployed
 * DBC pool. No ownership proof (see `dbcSwapRequestSchema`) and no
 * ephemeral signers — the only signature this transaction ever needs is
 * the caller's own wallet, added client-side after this route returns.
 * Trades submitted this way need no special handling to show up in
 * analytics: the indexer decodes every `EvtSwap`/`EvtSwap2` event on the
 * pool regardless of how it was submitted (packages/indexer/src/indexPool.ts).
 */
export async function POST(request: Request, { params }: { params: Promise<{ poolAddress: string }> }) {
  if (!checkRateLimit(`dbc-swap:${clientKeyFromRequest(request)}`, 20, 60_000)) {
    return apiError("validation_error", "Too many requests. Slow down.", 429);
  }

  const { poolAddress: poolAddressParam } = await params;
  const body = await request.json().catch(() => null);
  const parsed = dbcSwapRequestSchema.safeParse({ ...body, poolAddress: poolAddressParam });
  if (!parsed.success) {
    return apiError("validation_error", "Invalid swap request.", 400, parsed.error.flatten());
  }

  try {
    const connection = getServerConnection();
    const rpcUrl = getServerRpcUrl();
    await assertExpectedNetwork(connection, rpcUrl);

    const poolAddress = parsePublicKeyOrThrow(parsed.data.poolAddress, "poolAddress");
    const owner = parsePublicKeyOrThrow(parsed.data.payerPublicKey, "payerPublicKey");

    const state = await getLivePoolState(connection, poolAddress);
    if (!state) return apiError("not_found", `Pool ${parsed.data.poolAddress} was not found on-chain.`, 404);

    const quoteToken: QuoteToken = state.tokenQuoteDecimal === 9 ? "SOL" : "USDC";
    const quoteUsdPrice = await getQuoteUsdPrice(quoteToken);
    const swapBaseForQuote = parsed.data.side === "sell";

    const amountIn = swapBaseForQuote
      ? new BN(Math.round((parsed.data.amountUsd / (state.priceInQuote * quoteUsdPrice)) * 10 ** state.tokenBaseDecimal))
      : new BN(Math.round((parsed.data.amountUsd / quoteUsdPrice) * 10 ** state.tokenQuoteDecimal));

    if (amountIn.lten(0)) {
      return apiError("validation_error", "amountUsd is too small to produce a non-zero trade size.", 400);
    }

    const quote = await getOnchainSwapQuote(connection, poolAddress, amountIn, swapBaseForQuote);
    if (!quote) return apiError("not_found", `Pool ${parsed.data.poolAddress} was not found on-chain.`, 404);

    // minimumAmountOut = quoted output minus the caller's slippage tolerance —
    // protects the wallet from executing at a materially worse price than
    // previewed (e.g. another trade landing first).
    const minimumAmountOut = quote.outputAmount.mul(new BN(10_000 - parsed.data.slippageBps)).div(new BN(10_000));

    const { transaction } = await buildSwapTransaction({
      connection,
      poolAddress,
      owner,
      amountIn,
      minimumAmountOut,
      swapBaseForQuote,
    });

    const { transactionBase64, lastValidBlockHeight } = await prepareForWalletSignature(connection, transaction, owner, []);

    return NextResponse.json({
      transactionBase64,
      lastValidBlockHeight,
      quotedOutputAmount: quote.outputAmount.toString(),
      minimumAmountOut: minimumAmountOut.toString(),
      side: parsed.data.side,
    });
  } catch (error) {
    const mapped = mapTransactionSafetyError(error);
    if (mapped) return mapped;
    if (error instanceof QuotePriceUnavailableError) {
      return apiError("provider_unavailable", error.message, 503);
    }
    if (error instanceof Error && error.message.includes("public key")) {
      return apiError("validation_error", error.message, 400);
    }
    logUnhandledRouteError("POST /api/dbc/[poolAddress]/swap", error);
    return apiError("internal_error", "Failed to build the swap transaction.", 500);
  }
}
