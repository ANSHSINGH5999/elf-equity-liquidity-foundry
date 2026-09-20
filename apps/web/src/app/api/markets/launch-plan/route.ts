import { NextResponse } from "next/server";
import { prisma } from "@elf/db";
import { launchPlanRequestSchema } from "@elf/shared";
import { buildLaunchPlan, evaluateSimulation } from "@elf/market-engine";
import { validateCandidateConfiguration } from "@elf/meteora-adapter";
import { SCENARIO_DEFINITIONS } from "@elf/simulation-engine";
import { apiError, isPrismaConnectionError, logUnhandledRouteError } from "@/lib/server/api-error";
import { assetRowToDomain, curveConfigRowToDomain, marketProfileRowToDomain } from "@/lib/server/mappers";
import { getPythPriceComparison } from "@/lib/server/pyth";
import { checkRateLimit, clientKeyFromRequest } from "@/lib/server/rate-limit";

/**
 * Market Launch Copilot: assembles a launch PLAN for a candidate the design
 * route already compiled. Strictly read-only and non-deploying:
 *  - it reads existing rows and calls existing engines (Meteora config
 *    validation, Pyth); it writes NOTHING, builds NO transaction, imports no
 *    wallet/keypair code, and never touches the deployment routes;
 *  - the simulation is referenced by id and loaded from the row the simulate
 *    route wrote, then checked to belong to THIS candidate — the client can
 *    never supply simulation numbers of its own;
 *  - the response is `{ plan }` assembled from explicit fields (no DB rows,
 *    no keys); the Pyth API key stays inside the server-only pyth module.
 * Turning a plan into a deployment still goes through the existing wallet
 * approval flow, which this route knows nothing about.
 */
export async function POST(request: Request) {
  if (!checkRateLimit(`launch-plan:${clientKeyFromRequest(request)}`, 30, 60_000)) {
    return apiError("validation_error", "Too many requests. Slow down.", 429);
  }

  const body = await request.json().catch(() => null);
  const parsed = launchPlanRequestSchema.safeParse(body);
  if (!parsed.success) {
    return apiError("validation_error", "Invalid launch-plan request.", 400, parsed.error.flatten());
  }

  try {
    const curveConfigRow = await prisma.curveConfig.findUnique({ where: { id: parsed.data.curveCandidateId } });
    if (!curveConfigRow) return apiError("not_found", `Curve config ${parsed.data.curveCandidateId} was not found.`, 404);

    const [marketProfileRow, assetRow] = await Promise.all([
      prisma.marketProfile.findUnique({ where: { id: curveConfigRow.marketProfileId } }),
      prisma.asset.findUnique({ where: { id: curveConfigRow.assetId } }),
    ]);
    if (!marketProfileRow || !assetRow) return apiError("not_found", "The market profile or asset for this curve config was not found.", 404);

    let simulationScenarios: unknown = null;
    if (parsed.data.simulationRunId) {
      const run = await prisma.simulationRun.findUnique({ where: { id: parsed.data.simulationRunId } });
      // Same 404 whether the run is missing or belongs to another configuration, so ids can't be probed.
      if (!run || run.curveConfigId !== curveConfigRow.id) {
        return apiError("not_found", "That simulation run was not found for this configuration.", 404);
      }
      simulationScenarios = run.scenarios;
    }

    const asset = assetRowToDomain(assetRow);
    const profile = marketProfileRowToDomain(marketProfileRow);
    const candidate = curveConfigRowToDomain(curveConfigRow);

    const [configValidation, feeds] = await Promise.all([
      validateCandidateConfiguration(candidate, profile),
      getPythPriceComparison(asset.symbol),
    ]);

    const plan = buildLaunchPlan({
      asset,
      profile,
      candidate,
      configValidation,
      oracleFeeds: feeds.map((f) => ({ kind: f.kind, feedSymbol: f.feedSymbol, priceUsd: f.priceUsd, unavailableReason: f.unavailableReason })),
      simulation: evaluateSimulation(simulationScenarios, SCENARIO_DEFINITIONS.map((d) => d.kind)),
    });

    return NextResponse.json({ plan });
  } catch (error) {
    if (isPrismaConnectionError(error)) {
      return apiError("database_unavailable", "The ELF database is temporarily unavailable.", 503);
    }
    logUnhandledRouteError("POST /api/markets/launch-plan", error);
    return apiError("internal_error", "The launch plan could not be assembled.", 500);
  }
}
