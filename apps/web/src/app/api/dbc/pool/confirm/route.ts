import { NextResponse } from "next/server";
import { z } from "zod";
import { markLaunchLive, prisma } from "@elf/db";
import { getLivePoolState } from "@elf/meteora-adapter";
import { parsePublicKeyOrThrow } from "@elf/solana";
import { apiError, isPrismaConnectionError, logUnhandledRouteError, mapTransactionSafetyError } from "@/lib/server/api-error";
import { getServerConnection, getServerRpcUrl } from "@/lib/server/rpc";
import { assertExpectedNetwork } from "@/lib/server/transaction";
import { checkRateLimit, clientKeyFromRequest } from "@/lib/server/rate-limit";

const bodySchema = z.object({ launchId: z.string().min(1).max(64) });

/**
 * Advances a launch to LIVE once its pool really exists on-chain — the step that used to happen only if the owner
 * signed a second, redundant ownership message. It takes no ownership proof because it changes nothing a caller
 * chooses: the only inputs are a launch id, the only outcome is the stage that matches the chain (verified pool
 * account whose config and base mint equal the ones ELF recorded), and it discards the now-useless ephemeral
 * base-mint secret. It can never move a launch to a state the chain does not already show.
 */
export async function POST(request: Request) {
  if (!checkRateLimit(`dbc-pool-confirm:${clientKeyFromRequest(request)}`, 20, 60_000)) {
    return apiError("validation_error", "Too many requests. Slow down.", 429);
  }

  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return apiError("validation_error", "Invalid request.", 400);

  try {
    const launch = await prisma.launch.findUnique({
      where: { id: parsed.data.launchId },
      select: { id: true, stage: true, poolAddress: true, configAddress: true, baseMint: true },
    });
    if (!launch) return apiError("not_found", "Launch not found.", 404);
    if (launch.stage === "LIVE" || launch.stage === "GRADUATED") return NextResponse.json({ stage: launch.stage });
    if (!launch.poolAddress) return apiError("validation_error", "No pool has been built for this launch yet.", 409);

    const connection = getServerConnection();
    await assertExpectedNetwork(connection, getServerRpcUrl());

    const state = await getLivePoolState(connection, parsePublicKeyOrThrow(launch.poolAddress, "poolAddress"));
    if (!state || state.configAddress !== launch.configAddress || state.baseMint !== launch.baseMint) {
      return apiError("validation_error", "The pool transaction has not been confirmed on-chain yet.", 409);
    }

    await markLaunchLive(prisma, launch.id);
    return NextResponse.json({ stage: "LIVE" });
  } catch (error) {
    const mapped = mapTransactionSafetyError(error);
    if (mapped) return mapped;
    if (isPrismaConnectionError(error)) return apiError("database_unavailable", "The ELF database is temporarily unavailable.", 503);
    logUnhandledRouteError("POST /api/dbc/pool/confirm", error);
    return apiError("internal_error", "Failed to confirm the pool.", 500);
  }
}
