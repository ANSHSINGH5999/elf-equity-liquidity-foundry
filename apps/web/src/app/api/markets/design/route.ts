import { NextResponse } from "next/server";
import { prisma, Prisma } from "@elf/db";
import { designMarketSchema } from "@elf/shared";
import { compileCurveCandidates } from "@elf/market-engine";
import { apiError, isPrismaConnectionError } from "@/lib/server/api-error";
import { assetRowToDomain, marketProfileRowToDomain } from "@/lib/server/mappers";
import { checkRateLimit, clientKeyFromRequest } from "@/lib/server/rate-limit";

export async function POST(request: Request) {
  if (!checkRateLimit(`design:${clientKeyFromRequest(request)}`, 30, 60_000)) {
    return apiError("validation_error", "Too many requests. Slow down.", 429);
  }

  const body = await request.json().catch(() => null);
  const parsed = designMarketSchema.safeParse(body);
  if (!parsed.success) {
    return apiError("validation_error", "Invalid market design request.", 400, parsed.error.flatten());
  }

  try {
    const asset = await prisma.asset.findUnique({ where: { id: parsed.data.assetId } });
    if (!asset) return apiError("asset_unavailable", `Asset ${parsed.data.assetId} was not found.`, 404);

    const marketProfile = await prisma.marketProfile.create({
      data: { assetId: asset.id, ...parsed.data.marketProfile },
    });

    const candidates = compileCurveCandidates(assetRowToDomain(asset), marketProfileRowToDomain(marketProfile));

    const curveConfigs = await prisma.$transaction(
      candidates.map((candidate) =>
        prisma.curveConfig.create({
          data: {
            assetId: asset.id,
            marketProfileId: marketProfile.id,
            riskProfile: candidate.riskProfile,
            label: candidate.label,
            rationale: candidate.rationale,
            initialMarketCapUsd: candidate.initialMarketCapUsd,
            migrationMarketCapUsd: candidate.migrationMarketCapUsd,
            tokenSupply: candidate.tokenSupply,
            tokenBaseDecimals: candidate.tokenBaseDecimals,
            feeSchedule: candidate.feeSchedule as unknown as Prisma.InputJsonValue,
            migration: candidate.migration as unknown as Prisma.InputJsonValue,
            liquidityDistribution: candidate.liquidityDistribution as unknown as Prisma.InputJsonValue,
            score: candidate.score as unknown as Prisma.InputJsonValue,
            isRecommended: candidate.isRecommended,
          },
        }),
      ),
    );

    return NextResponse.json({ marketProfile, curveConfigs });
  } catch (error) {
    if (isPrismaConnectionError(error)) {
      return apiError("database_unavailable", "The ELF database is temporarily unavailable.", 503);
    }
    return apiError("internal_error", "Failed to compile market configuration.", 500);
  }
}
