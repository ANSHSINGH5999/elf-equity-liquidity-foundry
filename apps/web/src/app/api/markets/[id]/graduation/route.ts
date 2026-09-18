import { NextResponse } from "next/server";
import { apiError, isPrismaConnectionError } from "@/lib/server/api-error";
import { getGraduationProgress } from "@/lib/server/marketAnalytics";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  try {
    const graduation = await getGraduationProgress(id);
    if (!graduation) return apiError("not_found", `Market ${id} was not found or has no deployed pool yet.`, 404);
    return NextResponse.json(graduation);
  } catch (error) {
    if (isPrismaConnectionError(error)) {
      return apiError("database_unavailable", "The ELF database is temporarily unavailable.", 503);
    }
    return apiError("rpc_unavailable", "The Solana RPC endpoint is temporarily unavailable.", 503);
  }
}
