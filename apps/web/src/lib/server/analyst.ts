import "server-only";
import {
  analysisText,
  findAdviceViolations,
  ruleBasedAnalystProvider,
  type MarketAnalystProvider,
} from "@elf/market-engine";
import type { IssuerDashboard, MarketAnalysis } from "@elf/shared";

/**
 * The provider the market analyst uses. Today that is ELF's deterministic
 * rule-based analyst — no LLM, no API key, no external call. To add a
 * language-model provider later, implement `MarketAnalystProvider`
 * (packages/market-engine/src/analyst.ts), keep its API key server-side,
 * and return it here. `runMarketAnalysis` checks every provider's output
 * against the advice/prediction guardrail regardless of who wrote it.
 */
export function getAnalystProvider(): MarketAnalystProvider {
  return ruleBasedAnalystProvider;
}

export class AnalystGuardrailError extends Error {
  readonly violations: string[];
  constructor(violations: string[]) {
    super(`The rule-based analysis contained advice or prediction language (${violations.join(", ")}).`);
    this.name = "AnalystGuardrailError";
    this.violations = violations;
  }
}

/**
 * Runs the analysis and enforces the guardrail. A non-deterministic
 * provider whose output is flagged is discarded and replaced by the
 * rule-based analysis — flagged text is never returned. A flag on the
 * rule-based provider itself is a bug in ELF's own wording, so it throws
 * rather than silently shipping it.
 */
export async function runMarketAnalysis(
  dashboard: IssuerDashboard,
  provider: MarketAnalystProvider = getAnalystProvider(),
): Promise<MarketAnalysis> {
  const analysis = await provider.analyze(dashboard);
  const violations = findAdviceViolations(analysisText(analysis));
  if (violations.length === 0) return analysis;

  if (provider.kind === "rule_based") throw new AnalystGuardrailError(violations);
  return ruleBasedAnalystProvider.analyze(dashboard);
}
