import { z } from "zod";
import type { TokenizedAsset } from "@elf/shared";

/**
 * FEATURE-FLAGGED, P2, DISABLED BY DEFAULT.
 *
 * On 2026-09-15, https://rest-api.tessera.pe/v1/public/token-details
 * returned a real payload on a first attempt (confirmed field shape
 * below) but then failed an SSL handshake on every subsequent attempt
 * within the same minute. Per product spec — "if integration introduces
 * instability, disable it behind a feature flag" — this adapter is gated
 * by `TESSERA_ENABLED` (default: unset/false) and the core Meteora flow
 * never depends on it. Treat this as best-effort/experimental.
 */
const tesseraAssetSchema = z.object({
  id: z.string(),
  name: z.string(),
  symbol: z.string(),
  code: z.string().nullish(),
  sector: z.string().nullish(),
  mint: z.string(),
  markPrice: z.number().nullish(),
  holders: z.number().nullish(),
  markValuation: z.number().nullish(),
});

export type TesseraAsset = z.infer<typeof tesseraAssetSchema>;

export class TesseraUnavailableError extends Error {
  constructor(cause?: unknown) {
    super("Tessera is temporarily unavailable.");
    this.name = "TesseraUnavailableError";
    this.cause = cause;
  }
}

export class TesseraDisabledError extends Error {
  constructor() {
    super("The Tessera integration is disabled (TESSERA_ENABLED is not set).");
    this.name = "TesseraDisabledError";
  }
}

const DEFAULT_ENDPOINT = "https://rest-api.tessera.pe/v1/public/token-details";

export async function fetchTesseraAssets(options: { enabled: boolean; endpoint?: string }): Promise<TesseraAsset[]> {
  if (!options.enabled) throw new TesseraDisabledError();

  let response: Response;
  try {
    response = await fetch(options.endpoint ?? DEFAULT_ENDPOINT, {
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(8000),
    });
  } catch (error) {
    throw new TesseraUnavailableError(error);
  }

  if (!response.ok) {
    throw new TesseraUnavailableError(new Error(`HTTP ${response.status}`));
  }

  let body: unknown;
  try {
    body = await response.json();
  } catch (error) {
    throw new TesseraUnavailableError(error);
  }

  if (!Array.isArray(body)) {
    throw new TesseraUnavailableError(new Error("Unexpected response shape from Tessera"));
  }

  const assets: TesseraAsset[] = [];
  for (const entry of body) {
    const parsed = tesseraAssetSchema.safeParse(entry);
    if (parsed.success) assets.push(parsed.data);
  }
  return assets;
}

export function normalizeTesseraAsset(asset: TesseraAsset): TokenizedAsset {
  return {
    id: `tessera-${asset.id.toLowerCase()}`,
    name: asset.name,
    symbol: asset.symbol,
    mintAddress: asset.mint,
    issuer: asset.sector ?? "Tessera",
    assetType: "pre_ipo",
    referencePriceUsd: asset.markPrice ?? 0,
    source: "tessera",
    externalId: asset.id,
    createdAt: new Date().toISOString(),
  };
}

export async function fetchNormalizedTesseraAssets(options: { enabled: boolean; endpoint?: string }): Promise<TokenizedAsset[]> {
  const assets = await fetchTesseraAssets(options);
  return assets.map(normalizeTesseraAsset).filter((asset) => asset.referencePriceUsd > 0);
}
