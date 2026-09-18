import { NextResponse } from "next/server";
import { getLivePoolState } from "@elf/meteora-adapter";
import { parsePublicKeyOrThrow } from "@elf/solana";
import { apiError } from "@/lib/server/api-error";
import { getServerConnection } from "@/lib/server/rpc";

export async function GET(_request: Request, { params }: { params: Promise<{ poolAddress: string }> }) {
  const { poolAddress } = await params;

  let pk;
  try {
    pk = parsePublicKeyOrThrow(poolAddress, "poolAddress");
  } catch {
    return apiError("validation_error", "Invalid pool address.", 400);
  }

  try {
    const state = await getLivePoolState(getServerConnection(), pk);
    if (!state) return apiError("not_found", `Pool ${poolAddress} was not found on-chain.`, 404);
    return NextResponse.json({ pool: state });
  } catch {
    return apiError("rpc_unavailable", "The Solana RPC endpoint is temporarily unavailable.", 503);
  }
}
