import { z } from "zod";

/**
 * Base58 Solana public key check: length + charset only. This intentionally
 * does NOT construct a `PublicKey` (that would pull @solana/web3.js into
 * every consumer of @elf/shared, including the browser bundle for forms
 * that just need a fast client-side check). Server-side code that needs a
 * real on-curve/PDA check should also run `new PublicKey(value)` from
 * @elf/solana before treating input as trusted.
 */
const BASE58_PUBKEY = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;

export const publicKeySchema = z
  .string()
  .regex(BASE58_PUBKEY, "Must be a valid base58-encoded Solana public key");

export const assetTypeSchema = z.enum(["equity", "pre_ipo", "fund", "other"]);
export const riskProfileSchema = z.enum(["conservative", "balanced", "growth"]);
export const quoteTokenSchema = z.enum(["SOL", "USDC"]);

export const createAssetSchema = z.object({
  name: z.string().min(1).max(120),
  symbol: z
    .string()
    .min(2)
    .max(12)
    .regex(/^[A-Z0-9.]+$/, "Symbol must be uppercase alphanumeric"),
  mintAddress: publicKeySchema,
  issuer: z.string().min(1).max(200),
  assetType: assetTypeSchema,
  referencePriceUsd: z.number().positive().finite(),
  source: z.enum(["manual", "prestocks", "tessera"]).default("manual"),
  externalId: z.string().max(120).optional(),
});

// Kept as a plain ZodObject (not refined) so both `marketProfileSchema`
// and `designMarketSchema` below can independently derive from it —
// `.refine()` returns a ZodEffects, which doesn't support `.omit()`.
const marketProfileBaseSchema = z.object({
  assetId: z.string().min(1),
  initialLiquidityUsd: z.number().positive().max(50_000_000),
  expectedVolatility: z.enum(["low", "medium", "high"]),
  riskProfile: riskProfileSchema,
  targetLiquidityUsd: z.number().positive().max(500_000_000),
  targetGraduationUsd: z.number().positive().max(500_000_000),
  quoteToken: quoteTokenSchema,
});

function hasSufficientGraduationTarget(profile: { initialLiquidityUsd: number; targetGraduationUsd: number }): boolean {
  return profile.targetGraduationUsd >= profile.initialLiquidityUsd;
}

// curveCompiler.ts derives initialMarketCapUsd from initialLiquidityUsd and
// migrationMarketCapUsd from targetGraduationUsd via fixed per-preset
// multiples (packages/market-engine/src/presets.ts). Across all three
// presets, migrationMcapMultiple/initialMcapMultiple is tightest for
// "conservative" (2 / 1.3 ≈ 1.54), so migrationMcap stays above initialMcap
// for every preset as long as targetGraduationUsd is at least
// initialLiquidityUsd — a simpler, safely-sufficient bound that doesn't
// hardcode the exact ratio. Below this bound, Meteora's on-chain curve math
// (percentageSupplyOnMigration) assumes migrationMarketCap > initialMarketCap
// and produces a degenerate/rejected curve otherwise. See
// docs/security-remediation.md (LOW-6).
const graduationBoundIssue = {
  message: "targetGraduationUsd must be at least initialLiquidityUsd, so the curve migrates to a higher market cap than it starts at.",
  path: ["targetGraduationUsd"],
};

export const marketProfileSchema = marketProfileBaseSchema.refine(hasSufficientGraduationTarget, graduationBoundIssue);

export const designMarketSchema = z.object({
  assetId: z.string().min(1),
  marketProfile: marketProfileBaseSchema.omit({ assetId: true }).refine(hasSufficientGraduationTarget, graduationBoundIssue),
});

export const simulateMarketSchema = z.object({
  curveCandidateId: z.string().min(1),
});

export const SIMULATION_LAB_MAX_PROGRESS_PCT = 95;

/**
 * Simulation Lab request. The client names a STORED curve config and one of
 * the engine's own scenarios; it never supplies curve parameters. Only the two
 * things the engine can genuinely vary are accepted: the assumed position on
 * the curve, and the side (buy/sell) of each of the four standard trades.
 */
export const simulationLabRequestSchema = z
  .object({
    curveCandidateId: z.string().min(1).max(64),
    scenario: z.enum(["normal_demand", "strong_buy_pressure", "strong_sell_pressure", "low_liquidity", "high_volatility", "graduation_approach"]),
    curveProgressPct: z.number().finite().min(0).max(SIMULATION_LAB_MAX_PROGRESS_PCT).optional(),
    sides: z.array(z.enum(["buy", "sell"])).length(4).optional(),
  })
  .strict();

/**
 * Base58 ed25519 signature: 64 raw bytes. base58-encoding 64 bytes always
 * produces between 64 and 88 characters, so this bound both rejects
 * obviously-malformed input cheaply and matches what
 * `verifyOwnershipSignature` (@elf/solana) will accept.
 */
const signatureSchema = z.string().min(64).max(88);

/**
 * A caller must prove control of `payerPublicKey` by signing the exact
 * canonical message `buildOwnershipMessage` produces, freshly (see
 * `OWNERSHIP_SIGNATURE_MAX_SKEW_MS`). Required on every deployment-
 * mutating request — see docs/security-remediation.md (HIGH-1).
 */
const ownershipProofSchema = z.object({
  signature: signatureSchema,
  authTimestamp: z.number().int().positive(),
});

export const dbcConfigRequestSchema = z
  .object({
    assetId: z.string().min(1),
    curveCandidateId: z.string().min(1),
    payerPublicKey: publicKeySchema,
    feeClaimerPublicKey: publicKeySchema,
  })
  .merge(ownershipProofSchema);

export const dbcPoolRequestSchema = z
  .object({
    launchId: z.string().min(1),
    payerPublicKey: publicKeySchema,
    poolCreatorPublicKey: publicKeySchema,
    firstBuyUsd: z.number().min(0).max(1_000_000).optional(),
  })
  .merge(ownershipProofSchema);

/**
 * No ownership proof required (unlike dbcConfigRequestSchema/
 * dbcPoolRequestSchema) — a swap is a public action on a live pool, not a
 * mutation of a Launch a specific wallet owns. Building an unsigned
 * transaction naming someone else's pubkey as owner is harmless: it still
 * requires that wallet's real signature to ever execute.
 */
export const dbcSwapRequestSchema = z
  .object({
    poolAddress: publicKeySchema,
    payerPublicKey: publicKeySchema,
    side: z.enum(["buy", "sell"]),
    /** USD-denominated input (either side). Exactly one of amountUsd / amountTokens must be sent. */
    amountUsd: z.number().positive().max(1_000_000).optional(),
    /** Exact base-token input — sells only, so a user selling N tokens sells exactly N. */
    amountTokens: z.number().positive().finite().optional(),
    slippageBps: z.number().int().min(1).max(5_000).default(100),
  })
  .refine((d) => (d.amountUsd !== undefined) !== (d.amountTokens !== undefined), {
    message: "Provide exactly one of amountUsd or amountTokens.",
    path: ["amountUsd"],
  })
  .refine((d) => d.amountTokens === undefined || d.side === "sell", {
    message: "amountTokens is only valid for sells; a buy is denominated in the quote token.",
    path: ["amountTokens"],
  });

/**
 * Input to the (read-only) launch-plan route. The simulation is referenced by
 * id and re-loaded server-side from the row the simulate route wrote — the
 * client can never supply simulation numbers of its own.
 */
export const launchPlanRequestSchema = z.object({
  curveCandidateId: z.string().min(1).max(64),
  simulationRunId: z.string().min(1).max(64).optional(),
});

export type CreateAssetInput = z.infer<typeof createAssetSchema>;
export type MarketProfileInput = z.infer<typeof marketProfileSchema>;
export type DesignMarketInput = z.infer<typeof designMarketSchema>;
export type SimulateMarketInput = z.infer<typeof simulateMarketSchema>;
export type SimulationLabRequestInput = z.infer<typeof simulationLabRequestSchema>;
export type DbcConfigRequestInput = z.infer<typeof dbcConfigRequestSchema>;
export type DbcPoolRequestInput = z.infer<typeof dbcPoolRequestSchema>;
export type DbcSwapRequestInput = z.infer<typeof dbcSwapRequestSchema>;
export type LaunchPlanRequestInput = z.infer<typeof launchPlanRequestSchema>;
