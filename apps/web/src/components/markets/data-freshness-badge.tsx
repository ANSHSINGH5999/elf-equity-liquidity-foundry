import { Badge } from "@/components/ui/badge";
import type { DataFreshness } from "@elf/shared";

function formatLag(lagSeconds: number | null): string {
  if (lagSeconds === null) return "";
  if (lagSeconds < 60) return `${lagSeconds}s ago`;
  if (lagSeconds < 3600) return `${Math.round(lagSeconds / 60)}m ago`;
  return `${Math.round(lagSeconds / 3600)}h ago`;
}

/** Phase 5.12: never let the UI imply real-time data when the indexer is behind. */
export function DataFreshnessBadge({ freshness }: { freshness: DataFreshness }) {
  if (freshness.status === "unavailable") {
    return <Badge variant="neutral">Indexer data unavailable</Badge>;
  }
  if (freshness.status === "delayed") {
    return <Badge variant="warning">⚠ Data delayed · indexed {formatLag(freshness.lagSeconds)}</Badge>;
  }
  return <Badge variant="positive">● Live · indexed {formatLag(freshness.lagSeconds)}</Badge>;
}
