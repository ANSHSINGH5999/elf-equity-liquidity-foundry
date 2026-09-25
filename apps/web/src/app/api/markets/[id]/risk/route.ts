import { NextResponse } from "next/server";
import { databaseUnavailable, apiError, isPrismaConnectionError, logUnhandledRouteError } from "@/lib/server/api-error";
import { getIssuerDashboard } from "@/lib/server/marketAnalytics";
import { checkRateLimit, clientKeyFromRequest } from "@/lib/server/rate-limit";

/**
 * Issuer dashboard: the market overview plus derived risk indicators.
 * Read-only. Rate-limited because each call fans out to the Solana RPC and
 * Pyth (via getMarketOverview). The response is assembled from explicit
 * fields only — it never serializes the Launch row, so keypair-secret
 * columns cannot leak (regression-tested in tests/security).
 */
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!checkRateLimit(`market-risk:${clientKeyFromRequest(request)}`, 30, 60_000)) {
    return apiError("validation_error", "Too many requests. Slow down.", 429);
  }

  const { id } = await params;

  try {
    const dashboard = await getIssuerDashboard(id);
    if (!dashboard) return apiError("not_found", `Market ${id} was not found or has no deployed pool yet.`, 404);
    return NextResponse.json(dashboard);
  } catch (error) {
    if (isPrismaConnectionError(error)) {
      return databaseUnavailable(error);
    }
    logUnhandledRouteError("GET /api/markets/[id]/risk", error);
    return apiError("rpc_unavailable", "The Solana RPC endpoint or ELF database is temporarily unavailable.", 503);
  }
}
