import { NextResponse } from "next/server";
import BN from "bn.js";
import { getLivePoolState, getOnchainSwapQuote, getQuoteUsdPrice } from "@elf/meteora-adapter";
import { parsePublicKeyOrThrow } from "@elf/solana";
import type { QuoteToken } from "@elf/shared";
import { apiError } from "@/lib/server/api-error";
import { getServerConnection } from "@/lib/server/rpc";
import { checkRateLimit, clientKeyFromRequest } from "@/lib/server/rate-limit";

export async function GET(request: Request, { params }: { params: Promise<{ poolAddress: string }> }) {
  if (!checkRateLimit(`dbc-quote:${clientKeyFromRequest(request)}`, 60, 60_000)) {
    return apiError("validation_error", "Too many requests. Slow down.", 429);
  }

  const { poolAddress } = await params;
  const url = new URL(request.url);
  const amountUsd = Number(url.searchParams.get("amountUsd") ?? "1000");
  const side = url.searchParams.get("side") === "sell" ? "sell" : "buy";

  if (!Number.isFinite(amountUsd) || amountUsd <= 0) {
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

    const amountIn = swapBaseForQuote
      ? new BN(Math.round((amountUsd / (state.priceInQuote * quoteUsdPrice)) * 10 ** state.tokenBaseDecimal))
      : new BN(Math.round((amountUsd / quoteUsdPrice) * 10 ** state.tokenQuoteDecimal));

    const quote = await getOnchainSwapQuote(connection, pk, amountIn, swapBaseForQuote);
    if (!quote) return apiError("not_found", `Pool ${poolAddress} was not found on-chain.`, 404);

    const outputDecimals = swapBaseForQuote ? state.tokenQuoteDecimal : state.tokenBaseDecimal;
    const outputAmount = Number(quote.outputAmount.toString()) / 10 ** outputDecimals;

    return NextResponse.json({
      side,
      amountUsd,
      outputAmount,
      tradingFee: quote.tradingFee.toString(),
      nextSqrtPrice: quote.nextSqrtPrice.toString(),
    });
  } catch {
    return apiError("rpc_unavailable", "The Solana RPC endpoint is temporarily unavailable.", 503);
  }
}
