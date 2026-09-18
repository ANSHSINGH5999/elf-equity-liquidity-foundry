import { NextResponse } from "next/server";
import { prisma } from "@elf/db";
import { apiError, isPrismaConnectionError } from "@/lib/server/api-error";

/** Snapshot history for charting — resolution is limited to how often /metrics has been polled. */
export async function GET(_request: Request, { params }: { params: Promise<{ poolAddress: string }> }) {
  const { poolAddress } = await params;

  try {
    const snapshots = await prisma.marketSnapshot.findMany({
      where: { poolAddress },
      orderBy: { timestamp: "asc" },
      take: 500,
    });
    return NextResponse.json({ snapshots });
  } catch (error) {
    if (isPrismaConnectionError(error)) {
      return apiError("database_unavailable", "The ELF database is temporarily unavailable.", 503);
    }
    return apiError("internal_error", "Failed to load pool history.", 500);
  }
}
