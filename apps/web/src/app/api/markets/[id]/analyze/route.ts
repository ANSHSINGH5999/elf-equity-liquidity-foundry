import { NextResponse } from "next/server";
import { apiError, isPrismaConnectionError, logUnhandledRouteError } from "@/lib/server/api-error";
import { runMarketAnalysis } from "@/lib/server/analyst";
import { getIssuerDashboard } from "@/lib/server/marketAnalytics";
import { checkRateLimit, clientKeyFromRequest } from "@/lib/server/rate-limit";

/**
 * "Analyze market": a descriptive reading of the same real data the issuer
 * dashboard shows. POST (not GET) and tightly rate-limited because a future
 * provider may be costly; it takes no body — the server reads the market
 * itself, so a caller cannot feed the analyst invented numbers. The
 * response contains only the analysis (no Launch row, no keys).
 */
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!checkRateLimit(`market-analyze:${clientKeyFromRequest(request)}`, 10, 60_000)) {
    return apiError("validation_error", "Too many requests. Slow down.", 429);
  }

  const { id } = await params;

  try {
    const dashboard = await getIssuerDashboard(id);
    if (!dashboard) return apiError("not_found", `Market ${id} was not found or has no deployed pool yet.`, 404);

    const analysis = await runMarketAnalysis(dashboard);
    return NextResponse.json({ analysis, generatedAt: new Date().toISOString() });
  } catch (error) {
    if (isPrismaConnectionError(error)) {
      return apiError("database_unavailable", "The ELF database is temporarily unavailable.", 503);
    }
    logUnhandledRouteError("POST /api/markets/[id]/analyze", error);
    return apiError("internal_error", "The analysis could not be produced.", 500);
  }
}
