import { NextResponse } from "next/server";
import { prisma, Prisma } from "@elf/db";
import { simulateMarketSchema } from "@elf/shared";
import { buildConfigParametersFromCandidate, QuotePriceUnavailableError, getQuoteUsdPrice } from "@elf/meteora-adapter";
import { runSimulation } from "@elf/simulation-engine";
import { apiError, isPrismaConnectionError } from "@/lib/server/api-error";
import { getServerConnection } from "@/lib/server/rpc";
import { curveConfigRowToDomain, marketProfileRowToDomain } from "@/lib/server/mappers";
import { checkRateLimit, clientKeyFromRequest } from "@/lib/server/rate-limit";

export async function POST(request: Request) {
  if (!checkRateLimit(`simulate:${clientKeyFromRequest(request)}`, 20, 60_000)) {
    return apiError("validation_error", "Too many requests. Slow down.", 429);
  }

  const body = await request.json().catch(() => null);
  const parsed = simulateMarketSchema.safeParse(body);
  if (!parsed.success) {
    return apiError("validation_error", "Invalid simulation request.", 400, parsed.error.flatten());
  }

  try {
    const curveConfigRow = await prisma.curveConfig.findUnique({ where: { id: parsed.data.curveCandidateId } });
    if (!curveConfigRow) {
      return apiError("not_found", `Curve config ${parsed.data.curveCandidateId} was not found.`, 404);
    }
    const marketProfileRow = await prisma.marketProfile.findUnique({ where: { id: curveConfigRow.marketProfileId } });
    if (!marketProfileRow) {
      return apiError("not_found", "The market profile for this curve config was not found.", 404);
    }

    const candidate = curveConfigRowToDomain(curveConfigRow);
    const profile = marketProfileRowToDomain(marketProfileRow);

    const configParameters = await buildConfigParametersFromCandidate(candidate, profile);
    const quoteUsdPrice = await getQuoteUsdPrice(profile.quoteToken);
    const connection = getServerConnection();

    const run = runSimulation({ connection, candidate, profile, configParameters, quoteUsdPrice });

    const saved = await prisma.simulationRun.create({
      data: { curveConfigId: candidate.id, scenarios: run.scenarios as unknown as Prisma.InputJsonValue },
    });

    return NextResponse.json({ ...run, id: saved.id });
  } catch (error) {
    if (error instanceof QuotePriceUnavailableError) {
      return apiError("provider_unavailable", error.message, 503);
    }
    if (isPrismaConnectionError(error)) {
      return apiError("database_unavailable", "The ELF database is temporarily unavailable.", 503);
    }
    return apiError("simulation_failed", "The simulation could not be completed.", 500);
  }
}
