import { PublicKey } from "@solana/web3.js";
import nacl from "tweetnacl";
import bs58 from "bs58";

/**
 * Server-side wallet-ownership proof for deployment-mutating endpoints
 * (ELF V1 Phase 4.5 — security remediation, HIGH-1). A caller must sign a
 * canonical message with the wallet it claims to be `payerPublicKey`;
 * the server verifies the signature before trusting that identity for
 * anything, rather than trusting a bare public-key string in the request
 * body. See docs/security-remediation.md for the full threat model.
 */

/** Signatures older or newer than this relative to server time are rejected. */
export const OWNERSHIP_SIGNATURE_MAX_SKEW_MS = 5 * 60 * 1000;

export interface OwnershipMessageParams {
  /** A short, fixed string identifying the calling route (e.g. "dbc/config"). */
  route: string;
  /** The resource this signature authorizes acting on — a curveConfigId or launchId. */
  resourceId: string;
  payerPublicKey: string;
  /** Unix milliseconds, chosen by the client at signing time. */
  timestamp: number;
}

/**
 * The exact message the connected wallet must sign. Deterministic and
 * human-readable (wallets render it verbatim in the signing prompt) so
 * an issuer can see exactly what they're authorizing.
 */
export function buildOwnershipMessage(params: OwnershipMessageParams): string {
  return [
    "Equity Liquidity Foundry — deployment authorization",
    `Route: ${params.route}`,
    `Resource: ${params.resourceId}`,
    `Payer: ${params.payerPublicKey}`,
    `Timestamp: ${params.timestamp}`,
  ].join("\n");
}

export type OwnershipVerification = { valid: true } | { valid: false; reason: string };

/**
 * Verifies that `signature` (base58-encoded, as produced by a wallet
 * adapter's `signMessage`) was produced by the private key for
 * `payerPublicKey` over the canonical message for these exact params,
 * and that the timestamp is fresh. Does not check any database state —
 * callers are responsible for the owner-match and replay checks against
 * their own persisted record.
 */
export function verifyOwnershipSignature(
  params: OwnershipMessageParams & { signature: string },
): OwnershipVerification {
  if (!Number.isFinite(params.timestamp)) {
    return { valid: false, reason: "Invalid signature timestamp." };
  }
  const skew = Date.now() - params.timestamp;
  if (Math.abs(skew) > OWNERSHIP_SIGNATURE_MAX_SKEW_MS) {
    return { valid: false, reason: "Signature timestamp is outside the allowed window. Please retry." };
  }

  let payer: PublicKey;
  try {
    payer = new PublicKey(params.payerPublicKey);
  } catch {
    return { valid: false, reason: "Invalid payer public key." };
  }

  let signatureBytes: Uint8Array;
  try {
    signatureBytes = bs58.decode(params.signature);
  } catch {
    return { valid: false, reason: "Invalid signature encoding." };
  }
  if (signatureBytes.length !== 64) {
    return { valid: false, reason: "Invalid signature length." };
  }

  const messageBytes = new TextEncoder().encode(buildOwnershipMessage(params));
  const ok = nacl.sign.detached.verify(messageBytes, signatureBytes, payer.toBytes());
  if (!ok) {
    return { valid: false, reason: "Signature does not match the claimed payer public key." };
  }
  return { valid: true };
}
