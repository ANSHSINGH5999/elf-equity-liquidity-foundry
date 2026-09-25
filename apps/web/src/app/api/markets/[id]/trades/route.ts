import { NextResponse } from "next/server";
import { databaseUnavailable, apiError, isPrismaConnectionError } from "@/lib/server/api-error";
import { getRecentTrades, getTraderStats, resolveMarket } from "@/lib/server/marketAnalytics";
import { parsePeriod } from "@/lib/server/period";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const url = new URL(request.url);
  const period = parsePeriod(url);
  if (!period) return apiError("validation_error", "Invalid period. Use 1H, 24H, 7D, 30D, or ALL.", 400);

  const limitParam = url.searchParams.get("limit");
  const limit = limitParam ? Number(limitParam) : 25;
  if (!Number.isInteger(limit) || limit < 1 || limit > 100) {
    return apiError("validation_error", "limit must be an integer between 1 and 100.", 400);
  }

  try {
    const launch = await resolveMarket(id);
    if (!launch) return apiError("not_found", `Market ${id} was not found.`, 404);

    const [trades, traderStats] = await Promise.all([getRecentTrades(id, limit), getTraderStats(id, period)]);

    return NextResponse.json({
      // Pool/token identity is the same for every trade in this market — sent
      // once at the root rather than duplicated per row. Real values from the
      // Launch record, never guessed: a trade row only exists here because
      // the indexer decoded it from a real confirmed on-chain event
      // (packages/indexer/src/indexPool.ts), so every trade this endpoint
      // returns is, by construction, already confirmed — never pending/failed.
      poolAddress: launch.poolAddress,
      tokenSymbol: launch.asset.symbol,
      quoteToken: launch.marketProfile.quoteToken,
      trades: trades.map((t) => ({
        signature: t.signature,
        trader: t.trader,
        side: t.side,
        tokenAmount: t.tokenAmount,
        quoteAmount: t.quoteAmount,
        priceUsd: t.priceUsd,
        timestamp: t.timestamp.toISOString(),
        status: "confirmed" as const,
        source: "INDEXED" as const,
      })),
      traderStats,
    });
  } catch (error) {
    if (isPrismaConnectionError(error)) {
      return databaseUnavailable(error);
    }
    return apiError("internal_error", "Failed to load trades.", 500);
  }
}
