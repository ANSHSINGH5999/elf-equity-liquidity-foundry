import { NextResponse } from "next/server";
import type { ExternalMarketContext, ExternalMarketResult } from "@elf/shared";
import { databaseUnavailable, apiError, isPrismaConnectionError, logUnhandledRouteError } from "@/lib/server/api-error";
import { EXTERNAL_UNAVAILABLE_MESSAGE, QUOTE_TOKEN_COINCAP_ID, fetchCoinCapAsset, findCoinCapAssetExact, isValidCoinCapAssetId } from "@/lib/server/coincap";
import { resolveMarket } from "@/lib/server/marketAnalytics";
import { checkRateLimit, clientKeyFromRequest } from "@/lib/server/rate-limit";

/**
 * EXTERNAL crypto market context from CoinCap — never the on-chain price, never a trade or balance input.
 *
 *  GET ?assetId=solana   one CoinCap asset (validated slug).
 *  GET ?marketId=<id>    the market's quote token (SOL/USDC) and — only if CoinCap lists an asset with the same
 *                        symbol AND name — the market's own asset. An ELF equity market is normally not listed;
 *                        that is reported as unavailable, never mapped to an unrelated ticker.
 */
const unavailableStatus = (result: Extract<ExternalMarketResult, { status: "unavailable" }>): number =>
  result.reason === "not_listed" ? 404 : result.reason === "rate_limited" ? 429 : 503;

export async function GET(request: Request) {
  if (!checkRateLimit(`market-external:${clientKeyFromRequest(request)}`, 30, 60_000)) {
    return apiError("validation_error", "Too many requests. Slow down.", 429);
  }

  const params = new URL(request.url).searchParams;
  const assetId = params.get("assetId");
  const marketId = params.get("marketId");
  if ((assetId === null) === (marketId === null)) {
    return apiError("validation_error", "Provide exactly one of assetId or marketId.", 400);
  }

  if (assetId !== null) {
    if (!isValidCoinCapAssetId(assetId)) return apiError("validation_error", "assetId must be a CoinCap asset slug such as \"solana\".", 400);
    const result = await fetchCoinCapAsset(assetId);
    if (result.status === "ok") return NextResponse.json(result.data);
    const code = result.reason === "not_listed" ? "not_found" : "provider_unavailable";
    const response = apiError(code, result.message, unavailableStatus(result));
    if (result.reason === "rate_limited") response.headers.set("Retry-After", "30");
    return response;
  }

  if (!/^[A-Za-z0-9_-]{1,64}$/.test(marketId ?? "")) return apiError("validation_error", "Invalid marketId.", 400);
  try {
    const market = await resolveMarket(marketId as string);
    if (!market) return apiError("not_found", `Market ${marketId} was not found.`, 404);

    const quoteToken = market.marketProfile.quoteToken;
    const quoteId = QUOTE_TOKEN_COINCAP_ID[quoteToken];
    const [quote, asset] = await Promise.all([
      quoteId
        ? fetchCoinCapAsset(quoteId)
        : Promise.resolve<ExternalMarketResult>({ status: "unavailable", reason: "not_listed", message: EXTERNAL_UNAVAILABLE_MESSAGE }),
      findCoinCapAssetExact(market.asset.symbol, market.asset.name),
    ]);
    const context: ExternalMarketContext = {
      marketId: market.id,
      quote: { token: quoteToken, result: quote },
      asset: { symbol: market.asset.symbol, result: asset },
    };
    return NextResponse.json(context);
  } catch (error) {
    if (isPrismaConnectionError(error)) return databaseUnavailable(error);
    logUnhandledRouteError("GET /api/market/external", error);
    return apiError("internal_error", "External market data could not be loaded.", 500);
  }
}
