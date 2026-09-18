import type { GraduationStatus } from "@elf/shared";

/**
 * Percentage-complete and readiness bucketing for the graduation monitor.
 * Reads real quote-reserve/migration-threshold numbers supplied by the
 * caller (from packages/meteora-adapter's on-chain state reads) — this
 * function performs no chain access and fabricates no data itself.
 */
export function computeGraduationStatus(
  quoteReserveUsd: number,
  migrationThresholdUsd: number,
): GraduationStatus {
  if (migrationThresholdUsd <= 0) {
    return {
      quoteReserveUsd,
      migrationThresholdUsd,
      percentageComplete: 0,
      estimatedReadiness: "not_started",
    };
  }

  const percentageComplete = Math.min(
    100,
    Math.round((quoteReserveUsd / migrationThresholdUsd) * 10000) / 100,
  );

  let estimatedReadiness: GraduationStatus["estimatedReadiness"] = "not_started";
  if (percentageComplete >= 100) estimatedReadiness = "ready";
  else if (percentageComplete >= 85) estimatedReadiness = "near";
  else if (percentageComplete >= 40) estimatedReadiness = "mid";
  else if (percentageComplete > 0) estimatedReadiness = "early";

  return { quoteReserveUsd, migrationThresholdUsd, percentageComplete, estimatedReadiness };
}
