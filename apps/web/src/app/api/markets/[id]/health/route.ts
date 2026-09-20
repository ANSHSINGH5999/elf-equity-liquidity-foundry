import { NextResponse } from "next/server";
import { apiError, isPrismaConnectionError, logUnhandledRouteError } from "@/lib/server/api-error";
import { getIssuerDashboard } from "@/lib/server/marketAnalytics";
import { checkRateLimit, clientKeyFromRequest } from "@/lib/server/rate-limit";

/**
 * Market Health only. Read-only and rate-limited like the risk route (it
 * shares the same fan-out to the Solana RPC and Pyth). The response is
 * assembled from explicit computed fields — it never serializes the Launch
 * row, so keypair-secret columns cannot leak.
 */
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!checkRateLimit(`market-health:${clientKeyFromRequest(request)}`, 30, 60_000)) {
    return apiError("validation_error", "Too many requests. Slow down.", 429);
  }

  const { id } = await params;

  try {
    const dashboard = await getIssuerDashboard(id);
    if (!dashboard) return apiError("not_found", `Market ${id} was not found or has no deployed pool yet.`, 404);
    return NextResponse.json({ health: dashboard.health });
  } catch (error) {
    if (isPrismaConnectionError(error)) {
      return apiError("database_unavailable", "The ELF database is temporarily unavailable.", 503);
    }
    logUnhandledRouteError("GET /api/markets/[id]/health", error);
    return apiError("rpc_unavailable", "The Solana RPC endpoint or ELF database is temporarily unavailable.", 503);
  }
}
