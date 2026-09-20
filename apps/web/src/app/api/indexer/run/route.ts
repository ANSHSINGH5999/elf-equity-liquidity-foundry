import { NextResponse } from "next/server";
import { timingSafeEqual } from "node:crypto";
import { runIndexerOnce } from "@elf/indexer";
import { prisma, expireStaleLaunchSecrets } from "@elf/db";
import { apiError, mapTransactionSafetyError } from "@/lib/server/api-error";
import { getServerConnection, getServerRpcUrl } from "@/lib/server/rpc";
import { assertExpectedNetwork } from "@/lib/server/transaction";

/**
 * Constant-time Bearer-token comparison. A plain `!==` string compare
 * leaks timing information proportional to the matching prefix length —
 * low-severity over a network, but free to close. `timingSafeEqual`
 * requires equal-length buffers, so a length mismatch is checked (and
 * rejected) first, outside the constant-time path — that check alone
 * doesn't leak anything useful about the secret's content.
 */
function isValidBearerToken(authorizationHeader: string | null, secret: string): boolean {
  if (!authorizationHeader) return false;
  const expected = Buffer.from(`Bearer ${secret}`);
  const provided = Buffer.from(authorizationHeader);
  if (provided.length !== expected.length) return false;
  return timingSafeEqual(provided, expected);
}

/**
 * Triggerable indexer pass. Protected by a shared secret so it can be
 * wired to a Vercel Cron job (`Authorization: Bearer $INDEXER_SECRET`)
 * or hit manually in development — see docs/indexer.md and
 * docs/deployment.md.
 *
 * LOW-3 (security remediation): fails CLOSED, not open, when
 * INDEXER_SECRET is unset. The previous behavior silently ran this
 * endpoint unauthenticated whenever the env var was missing — a real
 * risk if a production deployment simply forgot to set it. The only
 * deliberate, documented exception is local development (`NODE_ENV`
 * unset or "development"), where requiring every contributor to
 * generate a throwaway secret just to hit this endpoint manually is
 * not worth the friction. See docs/security-remediation.md (LOW-3).
 */
export async function POST(request: Request) {
  const secret = process.env.INDEXER_SECRET;
  const isProduction = process.env.NODE_ENV === "production";

  if (!secret) {
    if (isProduction) {
      return apiError(
        "internal_error",
        "INDEXER_SECRET is not configured. This endpoint is disabled in production until it is set.",
        500,
      );
    }
    // Fail-open only outside production, and only because no secret was
    // ever configured — deliberate, documented dev convenience.
  } else if (!isValidBearerToken(request.headers.get("authorization"), secret)) {
    return apiError("unauthorized", "Unauthorized.", 401);
  }

  try {
    const connection = getServerConnection();
    // Same genesis-hash check that gates every transaction build: an endpoint that is not really the configured
    // cluster must not be indexed as if it were.
    await assertExpectedNetwork(connection, getServerRpcUrl());
    const result = await runIndexerOnce(connection);
    // LOW-5 (security remediation): piggybacks stale ephemeral-keypair
    // cleanup on this same authenticated, already-scheduled trigger,
    // rather than adding a second maintenance-only endpoint and auth
    // surface. A failure here never fails the indexer pass that already
    // succeeded — it's independent housekeeping, not indexing itself.
    const secretsExpired = await expireStaleLaunchSecrets(prisma)
      .then((r) => r.expiredCount)
      .catch(() => null);
    return NextResponse.json({ ...result, secretsExpired });
  } catch (error) {
    const mapped = mapTransactionSafetyError(error);
    if (mapped) return mapped;
    return apiError("rpc_unavailable", "The Solana RPC endpoint is temporarily unavailable.", 503);
  }
}
