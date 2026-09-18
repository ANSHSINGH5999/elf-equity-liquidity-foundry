import { z } from "zod";
import type { TokenizedAsset } from "@elf/shared";

/**
 * Verified against the live, public, unauthenticated response of
 * https://prestocks.com/api/prestocks on 2026-09-15. PreStocks does not
 * publish a formal schema, so this is intentionally permissive
 * (`.nullish()` on anything not load-bearing) rather than a hard contract
 * — if PreStocks changes shape, `normalizePreStocksAsset` should start
 * dropping records via the parse failure path below, not throw.
 */
const preStocksAssetSchema = z.object({
  name: z.string(),
  symbol: z.string(),
  description: z.string().nullish(),
  image: z.string().nullish(),
  external_url: z.string().nullish(),
  contract_address: z.string(),
  markPrice: z.number().nullish(),
  markValuation: z.number().nullish(),
  tokenPrice: z.number().nullish(),
  impliedValuation: z.number().nullish(),
  supply: z.number().nullish(),
});

export type PreStocksAsset = z.infer<typeof preStocksAssetSchema>;

export class PreStocksUnavailableError extends Error {
  constructor(cause?: unknown) {
    super("PreStocks is temporarily unavailable.");
    this.name = "PreStocksUnavailableError";
    this.cause = cause;
  }
}

const DEFAULT_ENDPOINT = "https://prestocks.com/api/prestocks";

/**
 * Fetches the live PreStocks asset listing. Never returns fabricated data:
 * on any network/parse failure it throws `PreStocksUnavailableError` so
 * the caller renders an explicit "provider unavailable" state.
 */
export async function fetchPreStocksAssets(endpoint = DEFAULT_ENDPOINT): Promise<PreStocksAsset[]> {
  let response: Response;
  try {
    response = await fetch(endpoint, {
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(8000),
    });
  } catch (error) {
    throw new PreStocksUnavailableError(error);
  }

  if (!response.ok) {
    throw new PreStocksUnavailableError(new Error(`HTTP ${response.status}`));
  }

  let body: unknown;
  try {
    body = await response.json();
  } catch (error) {
    throw new PreStocksUnavailableError(error);
  }

  if (!Array.isArray(body)) {
    throw new PreStocksUnavailableError(new Error("Unexpected response shape from PreStocks"));
  }

  const assets: PreStocksAsset[] = [];
  for (const entry of body) {
    const parsed = preStocksAssetSchema.safeParse(entry);
    if (parsed.success) assets.push(parsed.data);
    // Silently skip malformed individual entries rather than failing the whole listing.
  }
  return assets;
}

function deriveIssuer(name: string): string {
  return name.replace(/\s+PreStocks$/i, "").trim() || name;
}

export function normalizePreStocksAsset(asset: PreStocksAsset): TokenizedAsset {
  const referencePriceUsd = asset.tokenPrice ?? asset.markPrice ?? 0;

  return {
    id: `prestocks-${asset.symbol.toLowerCase()}`,
    name: asset.name,
    symbol: asset.symbol,
    mintAddress: asset.contract_address,
    issuer: deriveIssuer(asset.name),
    assetType: "pre_ipo",
    referencePriceUsd,
    source: "prestocks",
    externalId: asset.symbol,
    createdAt: new Date().toISOString(),
  };
}

export async function fetchNormalizedPreStocksAssets(endpoint?: string): Promise<TokenizedAsset[]> {
  const assets = await fetchPreStocksAssets(endpoint);
  return assets.map(normalizePreStocksAsset).filter((asset) => asset.referencePriceUsd > 0);
}
