import { NextResponse } from "next/server";
import { apiError, isPrismaConnectionError } from "@/lib/server/api-error";
import { getTradeStats, getVolumeStats, resolveMarket } from "@/lib/server/marketAnalytics";
import { parsePeriod } from "@/lib/server/period";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const period = parsePeriod(new URL(request.url));
  if (!period) return apiError("validation_error", "Invalid period. Use 1H, 24H, 7D, 30D, or ALL.", 400);

  try {
    const launch = await resolveMarket(id);
    if (!launch) return apiError("not_found", `Market ${id} was not found.`, 404);

    const [volume, trades] = await Promise.all([getVolumeStats(id, period), getTradeStats(id, period)]);
    return NextResponse.json({ ...volume, trades });
  } catch (error) {
    if (isPrismaConnectionError(error)) {
      return apiError("database_unavailable", "The ELF database is temporarily unavailable.", 503);
    }
    return apiError("internal_error", "Failed to load volume stats.", 500);
  }
}
