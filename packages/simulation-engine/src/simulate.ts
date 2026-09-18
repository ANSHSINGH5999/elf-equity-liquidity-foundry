import type { Connection } from "@solana/web3.js";
import BN from "bn.js";
import { TokenDecimal, type ConfigParameters } from "@meteora-ag/dynamic-bonding-curve-sdk";
import { simulateAtCurvePosition, getCurvePositionStartPrice } from "@elf/meteora-adapter";
import type {
  CurveCandidate,
  MarketProfile,
  SimulationRun,
  SimulationScenarioResult,
  SimulationTradeResult,
  TradeSizeUsd,
} from "@elf/shared";
import { TRADE_SIZES_USD } from "@elf/shared";
import { SCENARIO_DEFINITIONS } from "./scenarios";

function toLamports(amount: number, decimals: number): BN {
  // BN's numeric constructor throws above ~2^53; go through a string so
  // pathological inputs (e.g. a user-entered reference price near zero)
  // degrade to a very large trade instead of crashing the simulation.
  const clamped = Math.max(0, Math.round(amount * 10 ** decimals));
  return new BN(Number.isFinite(clamped) ? clamped.toLocaleString("fullwide", { useGrouping: false }) : "0");
}

function fromLamports(raw: BN, decimals: number): number {
  return Number(raw.toString()) / 10 ** decimals;
}

export interface RunSimulationParams {
  connection: Connection;
  candidate: CurveCandidate;
  profile: MarketProfile;
  configParameters: ConfigParameters;
  quoteUsdPrice: number;
}

/**
 * Runs all six product-spec scenarios across the four standard trade
 * sizes against the real Meteora curve math for the given candidate.
 * Every returned trade result is labeled SIMULATED, per product spec —
 * this never touches a live pool and must never be confused with one.
 */
export function runSimulation(params: RunSimulationParams): SimulationRun {
  const { candidate, profile, configParameters, quoteUsdPrice } = params;
  const tokenBaseDecimal = candidate.tokenBaseDecimals as unknown as TokenDecimal;
  const tokenQuoteDecimal = (profile.quoteToken === "SOL" ? 9 : 6) as TokenDecimal;

  const scenarios: SimulationScenarioResult[] = SCENARIO_DEFINITIONS.map((scenario) => {
    const { startPriceInQuote } = getCurvePositionStartPrice(
      configParameters,
      scenario.curveProgressFraction,
      tokenBaseDecimal,
      tokenQuoteDecimal,
    );
    const startPriceUsd = startPriceInQuote * quoteUsdPrice;

    const trades: SimulationTradeResult[] = TRADE_SIZES_USD.map((tradeSizeUsd, index) => {
      const direction = scenario.directions[index]!;
      const swapBaseForQuote = direction === "sell";

      const amountIn = swapBaseForQuote
        ? toLamports(tradeSizeUsd / Math.max(startPriceUsd, 1e-9), tokenBaseDecimal)
        : toLamports(tradeSizeUsd / Math.max(quoteUsdPrice, 1e-9), tokenQuoteDecimal);

      let quote: ReturnType<typeof simulateAtCurvePosition>["quote"] | null = null;
      let postTradePriceInQuote = startPriceInQuote;
      let unfillable = false;

      try {
        const simulated = simulateAtCurvePosition(params.connection, {
          configParameters,
          curveProgressFraction: scenario.curveProgressFraction,
          swapBaseForQuote,
          amountIn,
          currentPoint: scenario.currentPointOffset,
          tokenBaseDecimal,
          tokenQuoteDecimal,
        });
        quote = simulated.quote;
        postTradePriceInQuote = simulated.postTradePriceInQuote;
      } catch (error) {
        // A trade this large genuinely cannot be filled against the
        // remaining curve depth at this position — real, useful stress
        // information, not a bug. Surface it as a maximal-impact result
        // instead of crashing the whole simulation run.
        if (error instanceof Error && /Insufficient Liquidity|Virtual pool is completed/.test(error.message)) {
          unfillable = true;
        } else {
          throw error;
        }
      }

      // "Unfillable" means the requested size exceeds remaining curve
      // depth in that direction; represent it as a near-floor (sell) or
      // near-ceiling (buy) price rather than a literal 0/Infinity so the
      // number stays meaningful ("you'd have to accept a ~99.9% worse
      // price to fill this") instead of degenerate.
      const postTradePrice = unfillable
        ? (swapBaseForQuote ? startPriceUsd * 0.001 : startPriceUsd * 1000)
        : postTradePriceInQuote * quoteUsdPrice;
      const priceImpactBps = unfillable
        ? 10_000
        : startPriceUsd > 0
          ? Math.abs((postTradePrice - startPriceUsd) / startPriceUsd) * 10_000
          : 0;

      const estimatedExecutionPrice = unfillable
        ? postTradePrice
        : quote
          ? (swapBaseForQuote
              ? fromLamports(quote.outputAmount, tokenQuoteDecimal) / Math.max(fromLamports(amountIn, tokenBaseDecimal), 1e-9)
              : fromLamports(amountIn, tokenQuoteDecimal) / Math.max(fromLamports(quote.outputAmount, tokenBaseDecimal), 1e-9)) * quoteUsdPrice
          : startPriceUsd;

      const feeUsd = unfillable || !quote
        ? 0
        : fromLamports(quote.tradingFee.add(quote.protocolFee), tokenQuoteDecimal) * quoteUsdPrice;

      // Heuristic display metric: how much this single trade nudges the
      // ELF Market Quality Score, dominated by its slippage/impact.
      const marketQualityEffect = Math.max(-10, -Math.round((priceImpactBps / 100) * 10) / 10);

      const result: SimulationTradeResult = {
        tradeSizeUsd,
        side: direction,
        estimatedExecutionPrice: roundPrice(estimatedExecutionPrice),
        estimatedPriceImpactBps: round2(priceImpactBps),
        postTradePrice: roundPrice(postTradePrice),
        reserveQuoteAfter: null,
        reserveBaseAfter: null,
        feeUsd: round2(feeUsd),
        marketQualityEffect,
        label: "SIMULATED",
      };
      return result;
    });

    const worstCasePriceImpactBps = Math.max(...trades.map((t) => t.estimatedPriceImpactBps));

    return {
      scenario: scenario.kind,
      description: scenario.description,
      trades,
      worstCasePriceImpactBps: round2(worstCasePriceImpactBps),
      label: "SIMULATED" as const,
    };
  });

  return {
    id: `${candidate.id}-sim-${Date.now()}`,
    curveCandidateId: candidate.id,
    scenarios,
    createdAt: new Date().toISOString(),
    label: "SIMULATED",
  };
}

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

/**
 * Rounds a USD-denominated per-token price to 8 decimal places rather
 * than round2's 2. A low-supply-relative-to-reference-price curve can
 * have a genuinely sub-cent starting price (e.g. $0.0005/token) — round2
 * would collapse that, and the "unfillable" sentinel price derived from
 * it (0.1% of start price), to a degenerate literal $0.00, which is
 * exactly the meaningless value this function's callers are documented
 * to avoid returning.
 */
function roundPrice(value: number): number {
  return Math.round(value * 1e8) / 1e8;
}

export type { TradeSizeUsd };
