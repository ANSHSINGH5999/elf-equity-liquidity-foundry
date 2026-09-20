import "server-only";
import type { ExternalMarketData, ExternalMarketResult, ExternalMarketUnavailableReason } from "@elf/shared";

/**
 * CoinCap v3 client — EXTERNAL crypto market context only. It never replaces the Meteora DBC price and is never used
 * for a balance, a trade or any chain state.
 *
 * The key is read server-side at call time and sent only as a Bearer header to the fixed CoinCap origin. It is never
 * logged, never put in an error message and never returned. Everything CoinCap returns is untrusted: it is parsed,
 * range-checked and normalised before it goes anywhere, and a malformed answer is reported as such, not repaired.
 */
const BASE_URL = "https://rest.coincap.io/v3";
const REQUEST_TIMEOUT_MS = 8_000;
const OK_TTL_MS = 30_000;
const MISSING_TTL_MS = 60_000;
const FAILURE_TTL_MS = 5_000;
const MAX_CACHE_ENTRIES = 64;

/** CoinCap's own slugs for the tokens an ELF market can be quoted in. */
export const QUOTE_TOKEN_COINCAP_ID: Record<string, string> = { SOL: "solana", USDC: "usd-coin" };

const ASSET_ID = /^[a-z0-9][a-z0-9-]{0,63}$/;
const SEARCH_TERM = /^[A-Za-z0-9][A-Za-z0-9 ._-]{0,39}$/;

export const isValidCoinCapAssetId = (value: unknown): value is string => typeof value === "string" && ASSET_ID.test(value);

const unavailable = (reason: ExternalMarketUnavailableReason, message: string): ExternalMarketResult => ({ status: "unavailable", reason, message });

export const EXTERNAL_UNAVAILABLE_MESSAGE = "External market data unavailable for this asset.";

export interface CoinCapDeps {
  fetchImpl?: typeof fetch;
  now?: () => number;
  apiKey?: string | undefined;
}

interface CacheEntry {
  expiresAt: number;
  result: ExternalMarketResult;
}
const cache = new Map<string, CacheEntry>();

export function clearCoinCapCache(): void {
  cache.clear();
}

function remember(key: string, result: ExternalMarketResult, now: number): void {
  const ttl = result.status === "ok" ? OK_TTL_MS : result.reason === "not_listed" ? MISSING_TTL_MS : result.reason === "not_configured" ? 0 : FAILURE_TTL_MS;
  if (ttl === 0) return;
  if (cache.size >= MAX_CACHE_ENTRIES) cache.delete(cache.keys().next().value as string);
  cache.set(key, { expiresAt: now + ttl, result });
}

/** CoinCap sends decimals as strings. A value that is missing, empty or not a finite number is null — never 0. */
function decimal(value: unknown): number | null {
  if (typeof value === "number") return Number.isFinite(value) ? value : null;
  if (typeof value !== "string" || value.trim() === "") return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

/** Turns one CoinCap asset object into the normalised model, or null when it is not a usable asset. */
export function normalizeCoinCapAsset(raw: unknown, timestampMs: unknown): ExternalMarketData | null {
  if (typeof raw !== "object" || raw === null) return null;
  const a = raw as Record<string, unknown>;
  const price = decimal(a.priceUsd);
  const ts = typeof timestampMs === "number" && Number.isFinite(timestampMs) ? timestampMs : null;
  if (typeof a.id !== "string" || !isValidCoinCapAssetId(a.id) || typeof a.symbol !== "string" || a.symbol.length === 0 || a.symbol.length > 24) return null;
  if (price === null || price <= 0 || ts === null || !Number.isFinite(new Date(ts).getTime())) return null;
  return {
    provider: "CoinCap",
    assetId: a.id,
    symbol: a.symbol,
    priceUsd: price,
    marketCapUsd: decimal(a.marketCapUsd),
    volume24hUsd: decimal(a.volumeUsd24Hr),
    changePercent24h: decimal(a.changePercent24Hr),
    timestamp: new Date(ts).toISOString(),
  };
}

type Fetched = { kind: "json"; body: unknown } | { kind: "status"; result: ExternalMarketResult };

async function get(path: string, deps: CoinCapDeps): Promise<Fetched> {
  const key = deps.apiKey ?? process.env.COINCAP_API_KEY;
  if (!key) return { kind: "status", result: unavailable("not_configured", "CoinCap is not configured on this server (COINCAP_API_KEY is not set).") };

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    const response = await (deps.fetchImpl ?? fetch)(`${BASE_URL}${path}`, {
      headers: { Authorization: `Bearer ${key}`, Accept: "application/json" },
      signal: controller.signal,
      cache: "no-store",
    });
    if (response.status === 404) return { kind: "status", result: unavailable("not_listed", EXTERNAL_UNAVAILABLE_MESSAGE) };
    if (response.status === 429) return { kind: "status", result: unavailable("rate_limited", "CoinCap is rate-limiting this server. Try again shortly.") };
    if (response.status === 401 || response.status === 403) return { kind: "status", result: unavailable("unavailable", "CoinCap rejected this server's credentials.") };
    if (!response.ok) return { kind: "status", result: unavailable("unavailable", `CoinCap is unavailable (HTTP ${response.status}).`) };
    const text = await response.text();
    if (text.length > 512_000) return { kind: "status", result: unavailable("malformed", "CoinCap returned an unexpectedly large response.") };
    try {
      return { kind: "json", body: JSON.parse(text) };
    } catch {
      return { kind: "status", result: unavailable("malformed", "CoinCap returned a response that is not valid JSON.") };
    }
  } catch {
    return { kind: "status", result: unavailable("unavailable", "CoinCap could not be reached.") };
  } finally {
    clearTimeout(timer);
  }
}

/** One CoinCap asset by its slug (e.g. "solana"). Cached briefly so repeated views do not spend the key's quota. */
export async function fetchCoinCapAsset(assetId: string, deps: CoinCapDeps = {}): Promise<ExternalMarketResult> {
  if (!isValidCoinCapAssetId(assetId)) return unavailable("not_listed", EXTERNAL_UNAVAILABLE_MESSAGE);
  const now = (deps.now ?? Date.now)();
  const cacheKey = `asset:${assetId}`;
  const hit = cache.get(cacheKey);
  if (hit && hit.expiresAt > now) return hit.result;

  const fetched = await get(`/assets/${encodeURIComponent(assetId)}`, deps);
  let result: ExternalMarketResult;
  if (fetched.kind === "status") result = fetched.result;
  else {
    const body = fetched.body as { data?: unknown; timestamp?: unknown } | null;
    const data = normalizeCoinCapAsset(body?.data, body?.timestamp);
    // The answer must be for the asset that was asked about, or it is not accepted.
    result = data && data.assetId === assetId ? { status: "ok", data } : unavailable("malformed", "CoinCap returned data that could not be validated.");
  }
  remember(cacheKey, result, now);
  return result;
}

/**
 * The market's own asset, looked up by symbol. CoinCap only lists crypto assets, and a pre-IPO / equity ticker can
 * collide with an unrelated coin — so a hit is accepted ONLY when exactly one result has the same symbol AND the same
 * name. Otherwise the asset is "not listed"; it is never mapped to a different ticker.
 */
export async function findCoinCapAssetExact(symbol: string, name: string, deps: CoinCapDeps = {}): Promise<ExternalMarketResult> {
  if (!SEARCH_TERM.test(symbol) || name.trim() === "") return unavailable("not_listed", EXTERNAL_UNAVAILABLE_MESSAGE);
  const now = (deps.now ?? Date.now)();
  const cacheKey = `find:${symbol.toUpperCase()}|${name.trim().toLowerCase()}`;
  const hit = cache.get(cacheKey);
  if (hit && hit.expiresAt > now) return hit.result;

  const fetched = await get(`/assets?search=${encodeURIComponent(symbol)}&limit=20`, deps);
  let result: ExternalMarketResult;
  if (fetched.kind === "status") result = fetched.result;
  else {
    const body = fetched.body as { data?: unknown; timestamp?: unknown } | null;
    if (!body || !Array.isArray(body.data)) result = unavailable("malformed", "CoinCap returned data that could not be validated.");
    else {
      const wantedName = name.trim().toLowerCase();
      const matches = body.data.filter((item): item is Record<string, unknown> => {
        if (typeof item !== "object" || item === null) return false;
        const o = item as Record<string, unknown>;
        return typeof o.symbol === "string" && typeof o.name === "string" && o.symbol.toUpperCase() === symbol.toUpperCase() && o.name.trim().toLowerCase() === wantedName;
      });
      const data = matches.length === 1 ? normalizeCoinCapAsset(matches[0], body.timestamp) : null;
      result = data ? { status: "ok", data } : unavailable(matches.length === 0 ? "not_listed" : "malformed", EXTERNAL_UNAVAILABLE_MESSAGE);
    }
  }
  remember(cacheKey, result, now);
  return result;
}
