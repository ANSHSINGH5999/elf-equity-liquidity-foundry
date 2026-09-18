import type { PrismaClient } from "../generated/index.js";

/**
 * LOW-5 security remediation: ephemeral DBC keypair secrets
 * (`Launch.configKeypairSecret` / `Launch.baseMintKeypairSecret`) are
 * cleared as soon as their on-chain account confirms (see
 * apps/web/src/app/api/dbc/{config,pool}/route.ts), but a launch that is
 * simply abandoned mid-flow — the user closes the tab, the wallet never
 * signs, the transaction never lands — has no forward-progress event to
 * trigger that clear. Its plaintext-equivalent secret would otherwise sit
 * in Postgres indefinitely.
 *
 * These keypairs hold no funds and have no legitimate further use once a
 * launch is this stale (see docs/security.md), so there is no downside to
 * clearing them. This does not resume or retry the launch — a later
 * attempt for the same curveConfigId simply generates a fresh keypair
 * (see the `configKeypair`/`baseMintKeypair` resume logic in the deploy
 * routes, which already handles `null` the same way it handles "never
 * set").
 */
const DEFAULT_STALE_AFTER_MS = 24 * 60 * 60 * 1000; // 24 hours

const STALE_ELIGIBLE_STAGES = [
  "DRAFT",
  "AWAITING_CONFIG_SIGNATURE",
  "CONFIG_CREATED",
  "AWAITING_POOL_SIGNATURE",
  "FAILED",
] as const;

export interface ExpireStaleLaunchSecretsResult {
  expiredCount: number;
}

/**
 * Nulls out both ephemeral keypair-secret columns for any Launch whose
 * stage indicates it never reached LIVE and whose row hasn't been
 * touched in over `staleAfterMs`. Safe to call repeatedly / on a
 * schedule — rows with both secrets already null are simply not matched
 * again (Prisma's `updateMany` only counts rows it actually updates via
 * its `where`, but re-running this against already-cleared rows is a
 * cheap no-op either way).
 */
export async function expireStaleLaunchSecrets(
  prisma: PrismaClient,
  staleAfterMs: number = DEFAULT_STALE_AFTER_MS,
): Promise<ExpireStaleLaunchSecretsResult> {
  const cutoff = new Date(Date.now() - staleAfterMs);

  const result = await prisma.launch.updateMany({
    where: {
      stage: { in: [...STALE_ELIGIBLE_STAGES] },
      updatedAt: { lt: cutoff },
      OR: [{ configKeypairSecret: { not: null } }, { baseMintKeypairSecret: { not: null } }],
    },
    data: {
      configKeypairSecret: null,
      baseMintKeypairSecret: null,
    },
  });

  return { expiredCount: result.count };
}
