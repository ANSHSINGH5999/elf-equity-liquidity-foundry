import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { prisma } from "@elf/db";
import { simulationLabRequestSchema, type LabRunResult } from "@elf/shared";
import { LAB_ASSUMPTIONS, LAB_NOT_MODELLED, LAB_SCENARIO_LABELS, evaluateLabRun } from "@elf/market-engine";
import { buildConfigParametersFromCandidate, getQuoteUsdPrice, QuotePriceUnavailableError, validateCandidateConfiguration } from "@elf/meteora-adapter";
import { LabParameterError, resolveLabScenario, runScenario, SCENARIO_DEFINITIONS, UnsupportedScenarioError } from "@elf/simulation-engine";
import { apiError, isPrismaConnectionError, logUnhandledRouteError } from "@/lib/server/api-error";
import { curveConfigRowToDomain, marketProfileRowToDomain } from "@/lib/server/mappers";
import { checkRateLimit, clientKeyFromRequest } from "@/lib/server/rate-limit";
import { getServerConnection } from "@/lib/server/rpc";

/**
 * ELF Simulation Lab. OFF-CHAIN and read-only:
 *  - it loads a STORED curve config by id (the client never supplies curve
 *    parameters) and runs the EXISTING simulation engine on it;
 *  - it builds no transaction, signs nothing, imports no wallet/keypair code,
 *    and performs no database writes — results live only in the response (the
 *    client keeps them for the session);
 *  - the response is assembled from explicit fields: no DB rows, no keys.
 */

/** GET ?curveCandidateId= → the asset and sibling configurations the user can choose between. */
export async function GET(request: Request) {
  if (!checkRateLimit(`simulation-lab-context:${clientKeyFromRequest(request)}`, 60, 60_000)) {
    return apiError("validation_error", "Too many requests. Slow down.", 429);
  }
  const id = new URL(request.url).searchParams.get("curveCandidateId");
  if (!id || id.length > 64) return apiError("validation_error", "curveCandidateId is required.", 400);

  try {
    const selected = await prisma.curveConfig.findUnique({ where: { id } });
    if (!selected) return apiError("not_found", `Curve config ${id} was not found.`, 404);
    const [asset, siblings] = await Promise.all([
      prisma.asset.findUnique({ where: { id: selected.assetId }, select: { name: true, symbol: true } }),
      prisma.curveConfig.findMany({ where: { marketProfileId: selected.marketProfileId }, orderBy: { createdAt: "asc" } }),
    ]);
    if (!asset) return apiError("not_found", "The asset for this curve config was not found.", 404);

    return NextResponse.json({
      asset,
      selectedId: selected.id,
      // Scenario metadata comes from the engine's own definitions, so the UI can never drift from what is actually simulated.
      scenarios: SCENARIO_DEFINITIONS.map((d) => ({
        id: d.kind,
        label: LAB_SCENARIO_LABELS[d.kind],
        description: d.description,
        curveProgressPct: d.curveProgressFraction * 100,
        sides: d.directions,
      })),
      assumptions: LAB_ASSUMPTIONS,
      notModelled: LAB_NOT_MODELLED,
      candidates: siblings.map(curveConfigRowToDomain).map((c) => ({ id: c.id, label: c.label, riskProfile: c.riskProfile, isRecommended: c.isRecommended })),
    });
  } catch (error) {
    if (isPrismaConnectionError(error)) return apiError("database_unavailable", "The ELF database is temporarily unavailable.", 503);
    logUnhandledRouteError("GET /api/markets/simulation-lab", error);
    return apiError("internal_error", "The Simulation Lab context could not be loaded.", 500);
  }
}

export async function POST(request: Request) {
  if (!checkRateLimit(`simulation-lab:${clientKeyFromRequest(request)}`, 30, 60_000)) {
    return apiError("validation_error", "Too many requests. Slow down.", 429);
  }

  const body = await request.json().catch(() => null);
  const parsed = simulationLabRequestSchema.safeParse(body);
  if (!parsed.success) return apiError("validation_error", "Invalid Simulation Lab request.", 400, parsed.error.flatten());

  try {
    const { definition, parameters } = resolveLabScenario(parsed.data);

    const curveConfigRow = await prisma.curveConfig.findUnique({ where: { id: parsed.data.curveCandidateId } });
    if (!curveConfigRow) return apiError("not_found", `Curve config ${parsed.data.curveCandidateId} was not found.`, 404);
    const marketProfileRow = await prisma.marketProfile.findUnique({ where: { id: curveConfigRow.marketProfileId } });
    if (!marketProfileRow) return apiError("not_found", "The market profile for this curve config was not found.", 404);

    const candidate = curveConfigRowToDomain(curveConfigRow);
    const profile = marketProfileRowToDomain(marketProfileRow);

    const [configParameters, quoteUsdPrice, configValidation] = await Promise.all([
      buildConfigParametersFromCandidate(candidate, profile),
      getQuoteUsdPrice(profile.quoteToken),
      validateCandidateConfiguration(candidate, profile),
    ]);

    const result = runScenario({ connection: getServerConnection(), candidate, profile, configParameters, quoteUsdPrice }, definition);

    const run: LabRunResult = {
      label: "SIMULATION — OFF-CHAIN",
      runId: `${candidate.id}-lab-${randomUUID()}`,
      curveCandidateId: candidate.id,
      curveLabel: candidate.label,
      scenario: definition.kind,
      parameters,
      result,
      ...evaluateLabRun({ result, configValidation }),
      createdAt: new Date().toISOString(),
    };
    return NextResponse.json(run);
  } catch (error) {
    if (error instanceof UnsupportedScenarioError || error instanceof LabParameterError) return apiError("validation_error", error.message, 400);
    if (error instanceof QuotePriceUnavailableError) return apiError("provider_unavailable", error.message, 503);
    if (isPrismaConnectionError(error)) return apiError("database_unavailable", "The ELF database is temporarily unavailable.", 503);
    logUnhandledRouteError("POST /api/markets/simulation-lab", error);
    return apiError("simulation_failed", "The simulation could not be completed.", 500);
  }
}
