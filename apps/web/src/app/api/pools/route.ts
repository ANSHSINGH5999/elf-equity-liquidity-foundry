import { NextResponse } from "next/server";
import { prisma } from "@elf/db";
import { databaseUnavailable, apiError, isPrismaConnectionError } from "@/lib/server/api-error";
import { getPoolAnalytics } from "@/lib/server/poolAnalytics";

/**
 * Not in the original endpoint list, but required to render `/markets`:
 * lists every launch that has reached on-chain deployment, each enriched
 * with a best-effort live analytics read. A single pool's RPC failure
 * never fails the whole listing — it just renders with `analytics: null`.
 */
export async function GET() {
  try {
    const launches = await prisma.launch.findMany({
      where: { poolAddress: { not: null } },
      // HIGH-2 (security remediation): explicit safe `select`, matching the
      // pattern already used by /api/launches/[id]. `include` alone returns
      // every scalar column on Launch — configKeypairSecret and
      // baseMintKeypairSecret included — to any unauthenticated caller.
      // Never widen this back to a bare `include`. See
      // docs/security-remediation.md (HIGH-2).
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
        asset: true,
        marketProfile: true,
        curveConfig: true,
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    const withAnalytics = await Promise.all(
      launches.map(async (launch) => {
        const analytics = await getPoolAnalytics(launch.poolAddress!).catch(() => null);
        return { launch, analytics };
      }),
    );

    return NextResponse.json({ pools: withAnalytics });
  } catch (error) {
    if (isPrismaConnectionError(error)) {
      return databaseUnavailable(error);
    }
    return apiError("internal_error", "Failed to load markets.", 500);
  }
}
