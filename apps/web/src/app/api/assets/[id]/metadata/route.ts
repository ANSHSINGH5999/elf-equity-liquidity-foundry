import { NextResponse } from "next/server";
import { prisma } from "@elf/db";
import { apiError, isPrismaConnectionError } from "@/lib/server/api-error";

/**
 * Standard SPL token metadata JSON, self-hosted by ELF. Meteora's
 * `createPool` instruction needs a `uri` for the new base mint's metadata
 * — rather than depend on a third-party pinning service, ELF serves it
 * directly, since this app is already the source of truth for the asset.
 */
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  try {
    const asset = await prisma.asset.findUnique({ where: { id } });
    if (!asset) return apiError("not_found", `Asset ${id} was not found.`, 404);

    return NextResponse.json({
      name: asset.name,
      symbol: asset.symbol,
      description: `${asset.name} (${asset.symbol}) — a Meteora Dynamic Bonding Curve market designed with Equity Liquidity Foundry. Issuer: ${asset.issuer}.`,
      image: "",
      external_url: process.env.NEXT_PUBLIC_APP_URL ?? "",
      attributes: [
        { trait_type: "Asset Type", value: asset.assetType },
        { trait_type: "Reference Price (USD)", value: asset.referencePriceUsd },
        { trait_type: "Source", value: asset.source },
      ],
    });
  } catch (error) {
    if (isPrismaConnectionError(error)) {
      return apiError("database_unavailable", "The ELF database is temporarily unavailable.", 503);
    }
    return apiError("internal_error", "Failed to load asset metadata.", 500);
  }
}
