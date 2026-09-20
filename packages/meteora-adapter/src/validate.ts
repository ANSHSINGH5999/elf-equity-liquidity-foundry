import { PublicKey } from "@solana/web3.js";
import { validateConfigParameters } from "@meteora-ag/dynamic-bonding-curve-sdk";
import type { ConfigValidationResult, CurveCandidate, MarketProfile } from "@elf/shared";
import { buildConfigParametersFromCandidate } from "./curve";
import { getQuoteUsdPrice, QuotePriceUnavailableError } from "./pricing";

/**
 * Stands in for the real leftover receiver, which is only known at deploy time
 * (it is the connected wallet). It must NOT be the all-zero default key: Meteora's
 * token-supply validation inspects the receiver, and the default key makes valid
 * configurations look invalid. Used solely to satisfy the validator's input; never
 * placed in any transaction. (The wrapped-SOL mint is just a well-known, non-default key.)
 */
const PLACEHOLDER_RECEIVER = new PublicKey("So11111111111111111111111111111111111111112");

function messageOf(error: unknown): string {
  return error instanceof Error && error.message ? error.message : "Meteora rejected this configuration for an unspecified reason.";
}

/**
 * Pre-deployment configuration check that reuses, unchanged, the two things
 * the real deployment path already does: build the exact `ConfigParameters`
 * (`buildConfigParametersFromCandidate`, the same call `createConfig` uses)
 * and run Meteora's own `validateConfigParameters` on them — the validator
 * `partner.createConfig` applies at deploy time. Nothing here re-implements
 * Meteora's rules.
 *
 * Three honest outcomes:
 *  - `valid`: Meteora's builder and validator both accepted it. Also returns
 *    the migration threshold Meteora DERIVED from the curve (which is the real
 *    on-chain graduation threshold, distinct from ELF's declared target).
 *  - `invalid`: Meteora rejected it; `error` is Meteora's own message, verbatim.
 *  - `unavailable`: it could not be evaluated (e.g. the live SOL/USD price
 *    needed to convert a SOL-quoted market is unreachable). This is NOT
 *    treated as invalid, and no default is substituted.
 *
 * No transaction is built, nothing is sent, and no key is involved.
 */
export async function validateCandidateConfiguration(candidate: CurveCandidate, profile: MarketProfile): Promise<ConfigValidationResult> {
  let configParameters;
  try {
    configParameters = await buildConfigParametersFromCandidate(candidate, profile);
  } catch (error) {
    if (error instanceof QuotePriceUnavailableError) return { status: "unavailable", reason: error.message };
    return { status: "invalid", error: messageOf(error) };
  }

  try {
    validateConfigParameters({ ...configParameters, leftoverReceiver: PLACEHOLDER_RECEIVER });
  } catch (error) {
    return { status: "invalid", error: messageOf(error) };
  }

  const quoteDecimals = profile.quoteToken === "SOL" ? 9 : 6;
  const derivedThresholdQuote = Number(configParameters.migrationQuoteThreshold.toString()) / 10 ** quoteDecimals;

  let derivedThresholdUsd: number | null = null;
  try {
    derivedThresholdUsd = derivedThresholdQuote * (await getQuoteUsdPrice(profile.quoteToken));
  } catch {
    // The threshold in quote-token units is still real; only its USD conversion is unavailable.
  }

  return {
    status: "valid",
    derivedThresholdQuote: Number.isFinite(derivedThresholdQuote) ? derivedThresholdQuote : null,
    derivedThresholdUsd: derivedThresholdUsd !== null && Number.isFinite(derivedThresholdUsd) ? derivedThresholdUsd : null,
  };
}
