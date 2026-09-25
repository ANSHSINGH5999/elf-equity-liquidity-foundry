import { NextResponse } from "next/server";
import { databaseUnavailable, apiError, isPrismaConnectionError } from "@/lib/server/api-error";
import { getMarketVolatility, getPriceHistory, resolveMarket } from "@/lib/server/marketAnalytics";
import { parsePeriod } from "@/lib/server/period";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const period = parsePeriod(new URL(request.url));
  if (!period) return apiError("validation_error", "Invalid period. Use 1H, 24H, 7D, 30D, or ALL.", 400);

  try {
    const launch = await resolveMarket(id);
    if (!launch) return apiError("not_found", `Market ${id} was not found.`, 404);

    const [history, volatility] = await Promise.all([getPriceHistory(id, period), getMarketVolatility(id, period)]);
    return NextResponse.json({ ...history, volatility });
  } catch (error) {
    if (isPrismaConnectionError(error)) {
      return databaseUnavailable(error);
    }
    return apiError("internal_error", "Failed to load price history.", 500);
  }
}
