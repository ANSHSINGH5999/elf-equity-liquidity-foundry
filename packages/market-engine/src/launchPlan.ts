import {
  SIMULATION_MAX_IMPACT_BPS,
  TRADE_SIZES_USD,
  marketProfileSchema,
  type ApprovalGate,
  type ConfigValidationResult,
  type CurveCandidate,
  type LaunchCheck,
  type LaunchPlan,
  type LaunchPlanOracleFeed,
  type LaunchScenarioSummary,
  type MarketProfile,
  type PythFeedKind,
  type PythUnavailableReason,
  type SimulationEvaluation,
  type TokenizedAsset,
} from "@elf/shared";
import { MAX_TOKEN_SUPPLY, MIN_TOKEN_SUPPLY } from "./curveCompiler";
import { summarizeOracleFeeds } from "./risk";

/**
 * Market Launch Copilot — the deterministic plan builder.
 *
 * This module CALCULATES NOTHING NEW about markets. Every number in a plan is
 * a value ELF's existing engines already produced (the curve compiler's
 * candidate, the simulation engine's results, Meteora's own validation, the
 * Pyth integration); this file only assembles them, states which checks passed,
 * and applies the approval gate. It is pure: no I/O, no clock, no randomness,
 * no LLM. There is deliberately no risk *score* and no invented threshold: a
 * check is pass / fail / unavailable / not_run, and warnings are only raised
 * for concrete conditions the engines themselves report.
 *
 * A plan is a PROPOSAL. Nothing in this module (or the route that calls it)
 * deploys anything or touches a wallet.
 */

export interface LaunchPlanOracleFeedInput {
  kind: PythFeedKind;
  feedSymbol: string;
  priceUsd: number | null;
  unavailableReason: PythUnavailableReason | null;
}

export interface BuildLaunchPlanInput {
  asset: TokenizedAsset;
  profile: MarketProfile;
  candidate: CurveCandidate;
  configValidation: ConfigValidationResult;
  oracleFeeds: LaunchPlanOracleFeedInput[];
  simulation: SimulationEvaluation;
}

// Sub-dollar prices keep up to 4 decimals so a $0.325 curve start is never shown as "$0.33".
const usd = (n: number) => `$${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: Math.abs(n) < 1 ? 4 : 2 })}`;
const isFinitePositive = (n: unknown): n is number => typeof n === "number" && Number.isFinite(n) && n > 0;

// --- simulation --------------------------------------------------------------

/**
 * Structurally validates the simulation engine's output (as stored by the
 * simulate route) and summarises it. `null`/`undefined` means the user has not
 * run it. Anything malformed is `invalid` with the reasons — never "assumed
 * fine". `expectedScenarioKinds` comes from the simulation engine's own
 * scenario list, so this stays in step with it without depending on it.
 */
export function evaluateSimulation(scenarios: unknown, expectedScenarioKinds: readonly string[]): SimulationEvaluation {
  if (scenarios === null || scenarios === undefined) return { status: "not_run" };
  if (!Array.isArray(scenarios)) return { status: "invalid", reasons: ["The stored simulation results are malformed."] };

  const reasons: string[] = [];
  const summaries: LaunchScenarioSummary[] = [];
  const seen = new Set<string>();

  for (const raw of scenarios as unknown[]) {
    const s = raw as Record<string, unknown> | null;
    if (!s || typeof s !== "object" || typeof s.scenario !== "string" || !Array.isArray(s.trades)) {
      reasons.push("A simulation scenario has an unexpected shape.");
      continue;
    }
    seen.add(s.scenario);
    if (s.label !== "SIMULATED") reasons.push(`Scenario ${s.scenario} is not labelled SIMULATED.`);
    if (s.trades.length !== TRADE_SIZES_USD.length) {
      reasons.push(`Scenario ${s.scenario} has ${s.trades.length} trades; expected ${TRADE_SIZES_USD.length}.`);
    }

    let unfillable = 0;
    let numbersOk = true;
    for (const t of s.trades as Record<string, unknown>[]) {
      const fields = [t?.estimatedExecutionPrice, t?.estimatedPriceImpactBps, t?.postTradePrice, t?.feeUsd];
      if (!fields.every((v) => typeof v === "number" && Number.isFinite(v))) numbersOk = false;
      else if ((t.estimatedPriceImpactBps as number) >= SIMULATION_MAX_IMPACT_BPS) unfillable++;
    }
    if (!numbersOk) reasons.push(`Scenario ${s.scenario} contains a non-numeric result.`);

    summaries.push({
      scenario: s.scenario as LaunchScenarioSummary["scenario"],
      description: typeof s.description === "string" ? s.description : "",
      worstCasePriceImpactBps: typeof s.worstCasePriceImpactBps === "number" ? s.worstCasePriceImpactBps : Number.NaN,
      unfillableTrades: unfillable,
    });
    if (typeof s.worstCasePriceImpactBps !== "number" || !Number.isFinite(s.worstCasePriceImpactBps)) {
      reasons.push(`Scenario ${s.scenario} has no valid worst-case price impact.`);
    }
  }

  for (const kind of expectedScenarioKinds) {
    if (!seen.has(kind)) reasons.push(`The ${kind} scenario is missing.`);
  }

  return reasons.length > 0 ? { status: "invalid", reasons } : { status: "completed", label: "SIMULATED", scenarios: summaries };
}

/** The "Configuration valid" check, shared by the launch plan and the Simulation Lab so both report Meteora's validation identically. */
export function configurationCheck(configValidation: ConfigValidationResult): LaunchCheck {
  return configValidation.status === "valid"
    ? { id: "configuration", label: "Configuration valid", status: "pass", detail: "Meteora's own builder and validator accepted this exact configuration — the same checks run when the config transaction is built." }
    : configValidation.status === "invalid"
      ? { id: "configuration", label: "Configuration valid", status: "fail", detail: configValidation.error }
      : { id: "configuration", label: "Configuration valid", status: "unavailable", detail: `Could not be evaluated: ${configValidation.reason}` };
}

// --- the plan ----------------------------------------------------------------

export function buildLaunchPlan(input: BuildLaunchPlanInput): LaunchPlan {
  const { asset, profile, candidate, configValidation, simulation } = input;

  const oracle = summarizeOracleFeeds(input.oracleFeeds.map((f) => ({ priceUsd: f.priceUsd, unavailableReason: f.unavailableReason })));
  const oracleFeeds: LaunchPlanOracleFeed[] = input.oracleFeeds.map((f) => ({
    kind: f.kind,
    feedSymbol: f.feedSymbol,
    state: f.priceUsd !== null ? "live" : (f.unavailableReason ?? "unavailable"),
    priceUsd: f.priceUsd,
  }));

  const derivedQuote = configValidation.status === "valid" ? configValidation.derivedThresholdQuote : null;
  const derivedUsd = configValidation.status === "valid" ? configValidation.derivedThresholdUsd : null;
  const declaredTargetUsd = candidate.migration.migrationQuoteThreshold;
  const impliedStartPriceUsd = candidate.tokenSupply > 0 ? candidate.initialMarketCapUsd / candidate.tokenSupply : Number.NaN;

  // ---- checks ----
  const configuration = configurationCheck(configValidation);

  const profileParse = marketProfileSchema.safeParse({ ...profile, assetId: asset.id });
  const liquidity: LaunchCheck = profileParse.success
    ? { id: "liquidity_parameters", label: "Liquidity parameters valid", status: "pass", detail: "Initial liquidity, target liquidity and graduation target satisfy ELF's market-profile rules." }
    : { id: "liquidity_parameters", label: "Liquidity parameters valid", status: "fail", detail: profileParse.error.issues.map((i) => i.message).join("; ") };

  const curveProblems: string[] = [];
  for (const [name, value] of [["initial market cap", candidate.initialMarketCapUsd], ["migration market cap", candidate.migrationMarketCapUsd], ["token supply", candidate.tokenSupply]] as const) {
    if (!isFinitePositive(value)) curveProblems.push(`The ${name} is not a positive number.`);
  }
  if (isFinitePositive(candidate.initialMarketCapUsd) && isFinitePositive(candidate.migrationMarketCapUsd) && candidate.migrationMarketCapUsd <= candidate.initialMarketCapUsd) {
    curveProblems.push("The migration market cap must be above the initial market cap.");
  }
  if (isFinitePositive(candidate.tokenSupply) && (candidate.tokenSupply < MIN_TOKEN_SUPPLY || candidate.tokenSupply > MAX_TOKEN_SUPPLY)) {
    curveProblems.push(`Token supply must be between ${MIN_TOKEN_SUPPLY.toLocaleString("en-US")} and ${MAX_TOKEN_SUPPLY.toLocaleString("en-US")}.`);
  }
  const curve: LaunchCheck =
    curveProblems.length === 0
      ? { id: "curve_parameters", label: "Curve parameters valid", status: "pass", detail: "Market caps and token supply are positive, correctly ordered and within Meteora's supply bounds." }
      : { id: "curve_parameters", label: "Curve parameters valid", status: "fail", detail: curveProblems.join(" ") };

  const graduationCheck: LaunchCheck = !isFinitePositive(declaredTargetUsd)
    ? { id: "graduation_configuration", label: "Graduation configuration valid", status: "fail", detail: "The declared graduation target is not a positive number." }
    : configValidation.status !== "valid"
      ? { id: "graduation_configuration", label: "Graduation configuration valid", status: "unavailable", detail: "Meteora's derived migration threshold could not be read because configuration validation did not succeed." }
      : derivedQuote !== null && !isFinitePositive(derivedQuote)
        ? { id: "graduation_configuration", label: "Graduation configuration valid", status: "fail", detail: "Meteora derived a non-positive migration threshold for this curve." }
        : { id: "graduation_configuration", label: "Graduation configuration valid", status: "pass", detail: "A positive migration threshold is configured; graduation has this single on-chain trigger." };

  const oracleCheck: LaunchCheck =
    oracle.state === "live"
      ? { id: "oracle_configuration", label: "Oracle configuration valid", status: "pass", detail: oracle.note }
      : { id: "oracle_configuration", label: "Oracle configuration valid", status: "unavailable", detail: oracle.note };

  const simulationCheck: LaunchCheck =
    simulation.status === "not_run"
      ? { id: "simulation", label: "Simulation completed", status: "not_run", detail: "The simulation has not been run yet." }
      : simulation.status === "invalid"
        ? { id: "simulation", label: "Simulation completed", status: "fail", detail: simulation.reasons.join(" ") }
        : { id: "simulation", label: "Simulation completed", status: "pass", detail: `All ${simulation.scenarios.length} scenarios completed. Results are SIMULATED from Meteora's real curve math — stress tests, not predictions.` };

  const checks = [configuration, liquidity, curve, graduationCheck, oracleCheck, simulationCheck];

  // ---- warnings: only concrete conditions the engines themselves report ----
  const warnings: string[] = [];
  if (candidate.tokenSupply <= MIN_TOKEN_SUPPLY) {
    warnings.push(`Total supply sits at Meteora's minimum (${MIN_TOKEN_SUPPLY.toLocaleString("en-US")}), so the curve starts at ${usd(impliedStartPriceUsd)} per token — not the asset's declared reference price of ${usd(asset.referencePriceUsd)}.`);
  } else if (candidate.tokenSupply >= MAX_TOKEN_SUPPLY) {
    warnings.push(`Total supply sits at Meteora's maximum (${MAX_TOKEN_SUPPLY.toLocaleString("en-US")}), so the curve starts at ${usd(impliedStartPriceUsd)} per token — not the asset's declared reference price of ${usd(asset.referencePriceUsd)}.`);
  }
  if (derivedUsd !== null && Math.abs(derivedUsd - declaredTargetUsd) >= 0.005) {
    const pct = ((derivedUsd - declaredTargetUsd) / declaredTargetUsd) * 100;
    warnings.push(`Meteora derives the on-chain graduation threshold from the curve as ${usd(derivedUsd)}, which is ${Math.abs(pct).toFixed(1)}% ${pct >= 0 ? "above" : "below"} your declared target of ${usd(declaredTargetUsd)}.`);
  }
  if (oracle.state !== "live") {
    warnings.push(`${oracle.headline}: there is no Pyth-verified reference price, so the reference (${usd(asset.referencePriceUsd)}) is the issuer-declared value entered at asset creation.`);
  }
  if (simulation.status === "completed") {
    const affected = simulation.scenarios.filter((s) => s.unfillableTrades > 0);
    const total = affected.reduce((sum, s) => sum + s.unfillableTrades, 0);
    if (total > 0) {
      warnings.push(`${total} simulated trade${total === 1 ? "" : "s"} could not be filled against the curve's remaining depth (the simulation caps these at ${SIMULATION_MAX_IMPACT_BPS / 100}% price impact): ${affected.map((s) => s.scenario.replace(/_/g, " ")).join(", ")}.`);
    }
  }
  if (profile.quoteToken === "SOL" && derivedQuote !== null && derivedUsd === null) {
    warnings.push("The USD value of the derived graduation threshold is unavailable because the live SOL/USD price could not be fetched.");
  }

  const assumptions: string[] = [
    "This plan is a proposal produced by ELF's deterministic curve compiler. Nothing is deployed until you approve it and sign with your own wallet.",
    "Simulation results are SIMULATED from Meteora's real curve math at fixed curve positions — scenario stress tests, not predictions.",
    "Graduation has one on-chain trigger: the pool's quote reserve reaching the migration threshold. Volume and market cap are not graduation conditions.",
    profile.quoteToken === "SOL"
      ? "USD figures for this SOL-quoted market use the live SOL/USD price at the time the plan was generated."
      : "USDC is treated as exactly $1.",
    "The asset's reference price is the issuer-declared value unless a live Pyth feed is available.",
  ];

  return {
    engine: "elf-deterministic-launch-planner-v1",
    asset: {
      id: asset.id,
      name: asset.name,
      symbol: asset.symbol,
      issuer: asset.issuer,
      assetType: asset.assetType,
      referencePriceUsd: asset.referencePriceUsd,
      source: asset.source,
      mintAddress: asset.mintAddress,
    },
    profile: {
      initialLiquidityUsd: profile.initialLiquidityUsd,
      expectedVolatility: profile.expectedVolatility,
      riskProfile: profile.riskProfile,
      targetLiquidityUsd: profile.targetLiquidityUsd,
      targetGraduationUsd: profile.targetGraduationUsd,
      quoteToken: profile.quoteToken,
    },
    curve: {
      candidateId: candidate.id,
      label: candidate.label,
      riskProfile: candidate.riskProfile,
      rationale: candidate.rationale,
      isRecommended: candidate.isRecommended,
      initialMarketCapUsd: candidate.initialMarketCapUsd,
      migrationMarketCapUsd: candidate.migrationMarketCapUsd,
      tokenSupply: candidate.tokenSupply,
      impliedStartPriceUsd,
      referencePriceUsd: asset.referencePriceUsd,
      scoreComposite: candidate.score.composite,
    },
    liquidity: {
      initialLiquidityUsd: profile.initialLiquidityUsd,
      targetLiquidityUsd: profile.targetLiquidityUsd,
      quoteToken: profile.quoteToken,
      ...candidate.liquidityDistribution,
    },
    trading: candidate.feeSchedule,
    graduation: {
      trigger: "The pool graduates when its quote reserve reaches the migration threshold. This is the single on-chain condition; volume and market cap are not graduation conditions.",
      declaredTargetUsd,
      derivedThresholdQuote: derivedQuote,
      derivedThresholdUsd: derivedUsd,
      quoteToken: profile.quoteToken,
      migrationOption: candidate.migration.migrationOption,
      migrationFeeBps: candidate.migration.migrationFeeOptionBps,
      percentageSupplyOnMigration: candidate.migration.percentageSupplyOnMigration,
    },
    oracle: { state: oracle.state, headline: oracle.headline, note: oracle.note, feeds: oracleFeeds },
    simulation,
    checks,
    warnings,
    assumptions,
  };
}

// --- approval gate -----------------------------------------------------------

/**
 * The ONLY thing that can let a user move from a plan to the existing wallet
 * review. It never deploys and never signs: it just says whether the review
 * button may be enabled. Hard failures block; `unavailable` checks (e.g. a
 * restricted Pyth feed) inform but do not block, because a missing reference
 * price is a fact about the asset, not a defect in the configuration — with one
 * exception: the configuration itself must be positively validated.
 */
export function evaluateApprovalGate(plan: LaunchPlan, acknowledged: boolean): ApprovalGate {
  const blockers: string[] = [];

  const configuration = plan.checks.find((c) => c.id === "configuration");
  if (configuration && configuration.status !== "pass") {
    blockers.push(configuration.status === "fail" ? `Configuration is invalid: ${configuration.detail}` : `Configuration could not be validated: ${configuration.detail}`);
  }
  for (const check of plan.checks) {
    if (check.id === "configuration") continue;
    if (check.status === "fail") blockers.push(`${check.label} failed: ${check.detail}`);
  }
  if (plan.simulation.status === "not_run") blockers.push("Run the simulation before reviewing this plan for deployment.");

  if (!acknowledged) blockers.push("Explicit approval is required: confirm that you have reviewed this plan.");

  return { allowed: blockers.length === 0, blockers };
}
