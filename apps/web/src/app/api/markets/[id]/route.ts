import { NextResponse } from "next/server";
import { databaseUnavailable, apiError, isPrismaConnectionError } from "@/lib/server/api-error";
import { getMarketOverview } from "@/lib/server/marketAnalytics";

/**
 * `:id` is a Launch id — the real "market" per ELF V1's data model (see
 * docs/architecture.md, "The Launch IS the Market decision"). This
 * repurposes what was previously a market-profile lookup: that shape
 * was never called from the UI (verified before changing it) and its
 * semantics directly conflicted with the market-id-keyed surface Phase 5
 * requires (`/api/markets/:id/price`, `/liquidity`, ...).
 */
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  try {
    const overview = await getMarketOverview(id);
    if (!overview) return apiError("not_found", `Market ${id} was not found or has no deployed pool yet.`, 404);
    return NextResponse.json(overview);
  } catch (error) {
    if (isPrismaConnectionError(error)) {
      return databaseUnavailable(error);
    }
    return apiError("rpc_unavailable", "The Solana RPC endpoint is temporarily unavailable.", 503);
  }
}
