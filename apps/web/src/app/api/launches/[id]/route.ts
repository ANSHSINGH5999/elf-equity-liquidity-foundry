import { NextResponse } from "next/server";
import { prisma } from "@elf/db";
import { apiError, isPrismaConnectionError } from "@/lib/server/api-error";

/**
 * Resumability endpoint (ELF V1 Phase 3): lets the `/design` wizard
 * recover a deployment's current stage after a browser refresh. Never
 * returns `configKeypairSecret`/`baseMintKeypairSecret` — those are
 * server-internal only.
 */
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  try {
    const launch = await prisma.launch.findUnique({
      where: { id },
      select: {
        id: true,
        stage: true,
        status: true,
        configAddress: true,
        poolAddress: true,
        baseMint: true,
        quoteMint: true,
        curveConfigId: true,
        assetId: true,
        createdAt: true,
      },
    });
    if (!launch) return apiError("not_found", `Launch ${id} was not found.`, 404);
    return NextResponse.json({ launch });
  } catch (error) {
    if (isPrismaConnectionError(error)) {
      return apiError("database_unavailable", "The ELF database is temporarily unavailable.", 503);
    }
    return apiError("internal_error", "Failed to load launch.", 500);
  }
}
