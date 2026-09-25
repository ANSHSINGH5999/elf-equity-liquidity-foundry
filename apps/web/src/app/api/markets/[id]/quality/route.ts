import { NextResponse } from "next/server";
import { databaseUnavailable, apiError, isPrismaConnectionError } from "@/lib/server/api-error";
import { getMarketQualityScore } from "@/lib/server/marketAnalytics";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  try {
    const score = await getMarketQualityScore(id);
    if (!score) return apiError("not_found", `Market ${id} was not found or has no deployed pool yet.`, 404);
    return NextResponse.json(score);
  } catch (error) {
    if (isPrismaConnectionError(error)) {
      return databaseUnavailable(error);
    }
    return apiError("rpc_unavailable", "The Solana RPC endpoint is temporarily unavailable.", 503);
  }
}
