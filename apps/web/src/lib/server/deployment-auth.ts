import "server-only";
import { verifyOwnershipSignature, type OwnershipMessageParams } from "@elf/solana";
import { apiError } from "./api-error";

/**
 * Full server-side ownership check for a deployment-mutating request
 * (ELF V1 Phase 4.5 — security remediation, HIGH-1). Combines:
 *  1. Cryptographic proof the caller controls `payerPublicKey` (a valid,
 *     fresh signature over the canonical ownership message).
 *  2. If the target resource already has a recorded owner, that owner
 *     must match the claimed payer exactly — this is what actually
 *     blocks a different wallet from operating on someone else's
 *     in-flight deployment (the IDOR/race-condition finding).
 *  3. Replay protection: the presented `authTimestamp` must be strictly
 *     newer than the last one accepted for this resource, so a captured
 *     signature cannot be resubmitted after it has already been used.
 *
 * Returns `null` when the request is authorized to proceed. Otherwise
 * returns the exact NextResponse the route should return immediately.
 */
export function checkDeploymentOwnership(params: {
  message: OwnershipMessageParams;
  signature: string;
  existingOwnerWallet: string | null | undefined;
  existingLastAuthTimestamp: Date | null | undefined;
}) {
  const verification = verifyOwnershipSignature({ ...params.message, signature: params.signature });
  if (!verification.valid) {
    return apiError("unauthorized", verification.reason, 401);
  }

  if (params.existingOwnerWallet && params.existingOwnerWallet !== params.message.payerPublicKey) {
    // Deliberately vague: confirming "this deployment exists but belongs
    // to someone else" vs. "this deployment doesn't exist" would let an
    // attacker enumerate valid deployment IDs by wallet.
    return apiError("forbidden", "You are not authorized to act on this deployment.", 403);
  }

  if (
    params.existingLastAuthTimestamp &&
    params.message.timestamp <= params.existingLastAuthTimestamp.getTime()
  ) {
    return apiError(
      "unauthorized",
      "This signature has already been used for this deployment. Sign a new request and try again.",
      401,
    );
  }

  return null;
}
