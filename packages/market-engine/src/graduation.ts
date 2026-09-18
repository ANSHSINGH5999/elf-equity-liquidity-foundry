import type { GraduationCondition, GraduationStatus } from "@elf/shared";

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

/**
 * The full, honest list of graduation conditions for the checklist UI.
 *
 * Meteora DBC graduation has exactly ONE on-chain trigger: the pool's quote
 * reserve reaching the config's `migrationQuoteThreshold` (already the
 * `migrationThresholdUsd` on `GraduationStatus`). There is no separate
 * volume gate and no separate market-cap gate — market cap at migration is a
 * *consequence* of the curve shape, not an independently enforced condition.
 * Those two are therefore always reported `not_applicable` instead of
 * being invented as extra checkmarks; this function never reads or
 * accepts a hardcoded threshold.
 *
 * `migrated` must come from a real source (pool state `isMigrated` / an
 * indexed graduation event), never inferred from percentageComplete alone —
 * a pool can sit at 100% reserve before anyone triggers migration.
 */
export function buildGraduationChecklist(input: {
  graduation: GraduationStatus;
  migrated: boolean;
}): GraduationCondition[] {
  const { graduation, migrated } = input;

  const reserveCondition: GraduationCondition = {
    id: "quote_reserve_threshold",
    label: "Quote reserve reaches migration threshold",
    state:
      graduation.migrationThresholdUsd <= 0
        ? "unavailable"
        : graduation.percentageComplete >= 100
          ? "satisfied"
          : "unsatisfied",
    detail:
      graduation.migrationThresholdUsd <= 0
        ? "This market's migration threshold could not be read — data unavailable."
        : "The single on-chain condition that triggers DBC graduation: the pool's quote reserve must reach the configured migration threshold.",
  };

  return [
    reserveCondition,
    {
      id: "volume_requirement",
      label: "Volume requirement",
      state: "not_applicable",
      detail: "DBC graduation has no volume threshold — trading volume is shown for context only.",
    },
    {
      id: "market_cap_requirement",
      label: "Market-cap requirement",
      state: "not_applicable",
      detail: "DBC graduation is triggered by quote reserve, not market cap. Live market cap needs circulating supply, which ELF does not currently read on-chain.",
    },
    {
      id: "migration_executed",
      label: "Migration to DAMM v2 executed",
      state: migrated ? "satisfied" : "unsatisfied",
      detail: migrated
        ? "The pool has migrated into a permanent DAMM v2 pool."
        : "Migration has not been executed yet — reaching the threshold makes the pool eligible; migration is a separate on-chain step.",
    },
  ];
}
