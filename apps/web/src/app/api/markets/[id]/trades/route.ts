import { NextResponse } from "next/server";
import { apiError, isPrismaConnectionError } from "@/lib/server/api-error";
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
      trades: trades.map((t) => ({
        signature: t.signature,
        trader: t.trader,
        side: t.side,
        tokenAmount: t.tokenAmount,
        quoteAmount: t.quoteAmount,
        priceUsd: t.priceUsd,
        timestamp: t.timestamp.toISOString(),
        source: "INDEXED" as const,
      })),
      traderStats,
    });
  } catch (error) {
    if (isPrismaConnectionError(error)) {
      return apiError("database_unavailable", "The ELF database is temporarily unavailable.", 503);
    }
    return apiError("internal_error", "Failed to load trades.", 500);
  }
}
