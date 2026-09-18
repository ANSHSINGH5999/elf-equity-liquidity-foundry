import "server-only";
import type { AnalyticsPeriod } from "@elf/shared";

const VALID_PERIODS: AnalyticsPeriod[] = ["1H", "24H", "7D", "30D", "ALL"];

/** Parses `?period=` into a validated `AnalyticsPeriod`, defaulting to `"24H"`. Returns `null` for a malformed value so the caller can 400. */
export function parsePeriod(url: URL): AnalyticsPeriod | null {
  const raw = url.searchParams.get("period");
  if (!raw) return "24H";
  const upper = raw.toUpperCase();
  return (VALID_PERIODS as string[]).includes(upper) ? (upper as AnalyticsPeriod) : null;
}
