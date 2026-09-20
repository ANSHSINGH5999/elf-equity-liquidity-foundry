import { NextResponse } from "next/server";
import { PublicKey } from "@solana/web3.js";
import { apiError } from "@/lib/server/api-error";
import { getPoolAnalytics } from "@/lib/server/poolAnalytics";

export async function GET(_request: Request, { params }: { params: Promise<{ poolAddress: string }> }) {
  const { poolAddress } = await params;
  try {
    new PublicKey(poolAddress);
  } catch {
    return apiError("validation_error", "Invalid pool address.", 400);
  }

  try {
    const analytics = await getPoolAnalytics(poolAddress);
    if (!analytics) return apiError("not_found", `Pool ${poolAddress} was not found on-chain.`, 404);
    return NextResponse.json(analytics);
  } catch {
    return apiError("rpc_unavailable", "The Solana RPC endpoint is temporarily unavailable.", 503);
  }
}
