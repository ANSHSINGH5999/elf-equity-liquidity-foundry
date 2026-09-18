import { NextResponse } from "next/server";
import { computeExecutionMetrics } from "@elf/market-engine";
import {
  computeSwapAmountIn,
  getLivePoolState,
  getOnchainSwapQuote,
  getQuoteUsdPrice,
} from "@elf/meteora-adapter";
import { parsePublicKeyOrThrow } from "@elf/solana";
import type { QuoteToken } from "@elf/shared";
import { apiError } from "@/lib/server/api-error";
import { getServerConnection } from "@/lib/server/rpc";
import { checkRateLimit, clientKeyFromRequest } from "@/lib/server/rate-limit";

/**
 * Read-only preview of a swap against the pool's real on-chain state (the
 * same `swapQuote2` the swap route uses to set `minimumAmountOut`, and the
 * same `computeSwapAmountIn` conversion, so a preview cannot drift from the
 * transaction that is later built). Input is either `amountUsd` (buy or
 * sell) or `amountTokens` (sell only — sell exactly N tokens).
 */
export async function GET(request: Request, { params }: { params: Promise<{ poolAddress: string }> }) {
  if (!checkRateLimit(`dbc-quote:${clientKeyFromRequest(request)}`, 60, 60_000)) {
    return apiError("validation_error", "Too many requests. Slow down.", 429);
  }

  const { poolAddress } = await params;
  const url = new URL(request.url);
  const side = url.searchParams.get("side") === "sell" ? "sell" : "buy";
  const tokensParam = url.searchParams.get("amountTokens");
  const amountTokens = tokensParam === null ? undefined : Number(tokensParam);
  const amountUsd = amountTokens === undefined ? Number(url.searchParams.get("amountUsd") ?? "1000") : undefined;

  if (amountTokens !== undefined) {
    if (side !== "sell") return apiError("validation_error", "amountTokens is only valid for sells.", 400);
    if (!Number.isFinite(amountTokens) || amountTokens <= 0) {
      return apiError("validation_error", "amountTokens must be a positive number.", 400);
    }
  } else if (amountUsd === undefined || !Number.isFinite(amountUsd) || amountUsd <= 0) {
    return apiError("validation_error", "amountUsd must be a positive number.", 400);
  }

  let pk;
  try {
    pk = parsePublicKeyOrThrow(poolAddress, "poolAddress");
  } catch {
    return apiError("validation_error", "Invalid pool address.", 400);
  }

  const connection = getServerConnection();

  try {
    const state = await getLivePoolState(connection, pk);
    if (!state) return apiError("not_found", `Pool ${poolAddress} was not found on-chain.`, 404);

    const quoteToken: QuoteToken = state.tokenQuoteDecimal === 9 ? "SOL" : "USDC";
    const quoteUsdPrice = await getQuoteUsdPrice(quoteToken);
    const swapBaseForQuote = side === "sell";
    const spotPriceUsd = state.priceInQuote * quoteUsdPrice;

    const amountIn = computeSwapAmountIn({
      side,
      amountUsd,
      amountTokens,
      priceInQuote: state.priceInQuote,
      quoteUsdPrice,
      tokenBaseDecimal: state.tokenBaseDecimal,
      tokenQuoteDecimal: state.tokenQuoteDecimal,
    });
    if (amountIn.lten(0)) return apiError("validation_error", "The amount is too small to quote.", 400);

    const quote = await getOnchainSwapQuote(connection, pk, amountIn, swapBaseForQuote);
    if (!quote) return apiError("not_found", `Pool ${poolAddress} was not found on-chain.`, 404);

    const inputDecimals = swapBaseForQuote ? state.tokenBaseDecimal : state.tokenQuoteDecimal;
    const outputDecimals = swapBaseForQuote ? state.tokenQuoteDecimal : state.tokenBaseDecimal;
    const inputAmount = Number(amountIn.toString()) / 10 ** inputDecimals;
    const outputAmount = Number(quote.outputAmount.toString()) / 10 ** outputDecimals;

    // Base-token quantity and USD value of the quote leg, whichever side this is.
    const tokenAmount = swapBaseForQuote ? inputAmount : outputAmount;
    const quoteLegUsd = (swapBaseForQuote ? outputAmount : inputAmount) * quoteUsdPrice;
    const metrics = computeExecutionMetrics({ side, spotPriceUsd, tokenAmount, quoteLegUsd });

    return NextResponse.json({
      side,
      quoteToken,
      /** USD value of what the user is putting in (for token-denominated sells: tokens × spot). */
      amountUsd: swapBaseForQuote ? inputAmount * spotPriceUsd : inputAmount * quoteUsdPrice,
      inputAmount,
      outputAmount,
      spotPriceUsd,
      executionPriceUsd: metrics.executionPriceUsd,
      priceImpactPct: metrics.priceImpactPct,
      tradingFee: quote.tradingFee.toString(),
      nextSqrtPrice: quote.nextSqrtPrice.toString(),
    });
  } catch {
    return apiError("rpc_unavailable", "The Solana RPC endpoint is temporarily unavailable.", 503);
  }
}
