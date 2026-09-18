import "server-only";

/**
 * Curated symbol -> Pyth Hermes feed ID map (Equity.US.<SYM>/USD, verified
 * live against https://hermes.pyth.network/v2/price_feeds). Most tokenized
 * pre-IPO instruments have no public equity feed at all — that's expected
 * (they're private companies), not a bug. getPythReferencePrice() returns
 * null for anything outside this map and callers fall back to the
 * issuer-declared reference price.
 */
const EQUITY_FEED_IDS: Record<string, string> = {
  AAPL: "49f6b65cb1de6b10eaf75e7c03ca029c306d0357e91b5311b175084a5ad55688",
  TSLA: "16dad506d7db8da01c87581c87ca897a012a153557d4d578c3b9c9e1bc0632f1",
  NVDA: "b1073854ed24cbc755dc527418f52b7d271f6cc967bbf8d8129112b18860a593",
  GOOGL: "5a48c03e9b9cb337801073ed9d166817473697efff0d138874e0f6a33d6d5aa6",
  MSFT: "d0ca23c1cc005e004ccf1db5bf76aeb6a49218f43dac3d4b275e92de12ded4d1",
  AMZN: "b5d0e0fa58a1f8b81498ae670ce93c872d14434b72c364885d4fa1b257cbb07a",
  META: "78a3e3b8e676a8f73c439f5d749737034b139bbbe899ba5775216fba596607fe",
  NFLX: "8376cfd7ca8bcdf372ced05307b24dced1f15b1afafdeff715664598f15a3dd2",
  SPY: "19e09bb805456ada3979a7d1cbb4b6d63babc3a0f8e8a9509f68afa5c4c11cd5",
  QQQ: "9695e2b96ea7b3859da9ed25b7a46a920a776e2fdae19a7bcfdf2b219230452d",
};

export interface PythReferencePrice {
  priceUsd: number;
  publishTime: string;
  feedId: string;
  feedSymbol: string;
}

/**
 * Three ways Pyth prices the same underlying company (Pyth bounty: "use
 * one feed, compare both, or combine equities with other asset classes").
 * `equity` is the regulated-market feed; `xstock`/`ondo` are Pyth's feeds
 * for the on-chain tokenized-stock wrappers themselves, which can and do
 * diverge from the equity price (redemption friction, off-hours trading,
 * wrapper-specific demand).
 */
export type PythFeedKind = "equity" | "xstock" | "ondo";

export const PYTH_FEED_LABELS: Record<PythFeedKind, string> = {
  equity: "Regulated equity market",
  xstock: "xStock (tokenized, redemption-backed)",
  ondo: "Ondo tokenized stock",
};

/**
 * Every state the Price Oracle panel can be in, precise enough that the UI
 * never guesses. Determined by live-verified Hermes behavior (2026-09-18):
 * a fully missing Authorization header is the only case that returns 401;
 * a malformed/garbage key AND a valid key with no grant for the feed both
 * return 403, distinguished only by response body text ("invalid API key"
 * vs "no grant accepts this feed") — status code alone cannot tell them
 * apart, so `classifyHermesError` below always parses the body too.
 */
export type PythUnavailableReason =
  | "not_configured" // PYTH_API_KEY isn't set — never attempted a request
  | "unauthenticated" // key missing/malformed — Hermes rejected the credential itself
  | "entitlement_restricted" // key is valid but has no grant for this specific feed
  | "rate_limited" // 429
  | "unavailable"; // feed doesn't exist, network error, or an unclassified failure

export interface PythFeedComparisonEntry {
  kind: PythFeedKind;
  label: string;
  feedSymbol: string;
  feedId: string;
  priceUsd: number | null;
  publishTime: string | null;
  /** Set only when priceUsd is null — distinguishes "never tried" from the exact way it failed, so the UI never claims a wrong reason. */
  unavailableReason: PythUnavailableReason | null;
}

/** Parses a Hermes error response into a precise reason — see PythUnavailableReason. Never assumes; only classifies what the response actually said. */
export function classifyHermesError(status: number, body: string): PythUnavailableReason {
  if (status === 401) return "unauthenticated";
  if (status === 429) return "rate_limited";
  if (status === 403) {
    return /invalid api key/i.test(body) ? "unauthenticated" : "entitlement_restricted";
  }
  return "unavailable";
}

interface DiscoveredFeed {
  kind: PythFeedKind;
  feedSymbol: string;
  feedId: string;
}

// Feed IDs are effectively static (Pyth publishes a new one only if a feed
// is deprecated/replaced), so an in-memory, process-lifetime cache avoids
// re-querying the discovery endpoint on every dashboard poll.
const feedDiscoveryCache = new Map<string, { feeds: DiscoveredFeed[]; expiresAt: number }>();
const DISCOVERY_CACHE_MS = 10 * 60_000;

/**
 * Unauthenticated Hermes feed search (unlike /v2/updates/price/latest, this
 * endpoint needs no API key) — matched by exact symbol string, never fuzzy,
 * since Pyth lists several near-duplicate feeds per ticker (e.g. a 24/7
 * index variant, a redemption-rate feed) that a loose match would confuse
 * with the ones this app actually wants.
 */
async function discoverPythFeeds(ticker: string): Promise<DiscoveredFeed[]> {
  const cached = feedDiscoveryCache.get(ticker);
  if (cached && cached.expiresAt > Date.now()) return cached.feeds;

  try {
    const res = await fetch(`${HERMES_URL}/v2/price_feeds?query=${encodeURIComponent(ticker)}`, { cache: "no-store" });
    if (!res.ok) return [];

    const data = (await res.json()) as { id?: string; attributes?: { symbol?: string } }[];
    const wanted: { kind: PythFeedKind; symbol: string }[] = [
      { kind: "equity", symbol: `Equity.US.${ticker}/USD` },
      { kind: "xstock", symbol: `Crypto.${ticker}X/USD` },
      { kind: "ondo", symbol: `Crypto.${ticker}ON/USD` },
    ];

    const feeds: DiscoveredFeed[] = [];
    for (const want of wanted) {
      const match = data.find((d) => d.attributes?.symbol === want.symbol && d.id);
      if (match?.id) feeds.push({ kind: want.kind, feedSymbol: want.symbol, feedId: match.id });
    }

    feedDiscoveryCache.set(ticker, { feeds, expiresAt: Date.now() + DISCOVERY_CACHE_MS });
    return feeds;
  } catch {
    return [];
  }
}

/**
 * Live price for every Pyth feed type that exists for `symbol` (regulated
 * equity, xStock, Ondo) in one Hermes call. Never throws: an empty array
 * means no public feed of any kind exists for this ticker (the common case
 * for a private pre-IPO issuer — expected, not an error); a discovered feed
 * with `priceUsd: null` means the feed exists but `PYTH_API_KEY` isn't set,
 * so the price pull itself was skipped.
 */
export async function getPythPriceComparison(symbol: string): Promise<PythFeedComparisonEntry[]> {
  const ticker = symbol.trim().toUpperCase();
  const feeds = await discoverPythFeeds(ticker);
  if (feeds.length === 0) return [];

  const apiKey = process.env.PYTH_API_KEY;
  const withReason = (reason: PythUnavailableReason): PythFeedComparisonEntry[] =>
    feeds.map((f) => ({ kind: f.kind, label: PYTH_FEED_LABELS[f.kind], feedSymbol: f.feedSymbol, feedId: f.feedId, priceUsd: null, publishTime: null, unavailableReason: reason }));

  if (!apiKey) return withReason("not_configured");

  const startedAt = Date.now();
  try {
    const idsQuery = feeds.map((f) => `ids[]=${f.feedId}`).join("&");
    const res = await fetch(`${HERMES_URL}/v2/updates/price/latest?${idsQuery}&parsed=true`, {
      headers: { Authorization: `Bearer ${apiKey}` },
      cache: "no-store",
    });

    if (!res.ok) {
      const bodyText = await res.text().catch(() => "");
      const reason = classifyHermesError(res.status, bodyText);
      // Safe diagnostics only — never the key, never the Authorization header, never the raw body (which can echo the feed ID but not the credential).
      logPythDiagnostic({ endpoint: HERMES_URL, feedCount: feeds.length, feedIds: feeds.map((f) => f.feedId), status: res.status, reason, latencyMs: Date.now() - startedAt });
      return withReason(reason);
    }

    const data = (await res.json()) as {
      parsed?: { id: string; price?: { price: string; expo: number; publish_time: number } }[];
    };
    const byId = new Map((data.parsed ?? []).map((p) => [p.id, p.price]));
    logPythDiagnostic({ endpoint: HERMES_URL, feedCount: feeds.length, feedIds: feeds.map((f) => f.feedId), status: res.status, reason: null, latencyMs: Date.now() - startedAt });

    return feeds.map((f) => {
      const parsed = byId.get(f.feedId);
      const priceUsd = parsed ? Number(parsed.price) * 10 ** parsed.expo : null;
      const valid = priceUsd !== null && Number.isFinite(priceUsd) && priceUsd > 0;
      return {
        kind: f.kind,
        label: PYTH_FEED_LABELS[f.kind],
        feedSymbol: f.feedSymbol,
        feedId: f.feedId,
        priceUsd: valid ? priceUsd : null,
        publishTime: valid && parsed ? new Date(parsed.publish_time * 1000).toISOString() : null,
        // A 200 response that simply omits a feed (Hermes returns only the
        // feeds it has data for) means that specific feed is unavailable —
        // not an entitlement problem, since the request as a whole succeeded.
        unavailableReason: valid ? null : "unavailable",
      };
    });
  } catch {
    logPythDiagnostic({ endpoint: HERMES_URL, feedCount: feeds.length, feedIds: feeds.map((f) => f.feedId), status: null, reason: "unavailable", latencyMs: Date.now() - startedAt });
    return withReason("unavailable");
  }
}

/** Structured, secret-free diagnostic log — never the key, never the Authorization header, never a raw response body. */
function logPythDiagnostic(entry: { endpoint: string; feedCount: number; feedIds: string[]; status: number | null; reason: PythUnavailableReason | null; latencyMs: number }): void {
  console.log(JSON.stringify({ scope: "pyth_price_comparison", ...entry }));
}

const HERMES_URL = process.env.PYTH_HERMES_URL ?? "https://hermes.pyth.network";

/**
 * Live Pyth equity price for a recognizable public ticker. Returns null —
 * never throws — when PYTH_API_KEY is unset, the symbol has no known
 * public equity feed, or the request fails; callers must treat null as
 * "fall back to the issuer-declared reference price," not as an error.
 * Hermes requires an API key as of the current API version (Bearer token);
 * see https://docs.pyth.network/price-feeds/core/upgrade/preparing.
 */
export async function getPythReferencePrice(symbol: string): Promise<PythReferencePrice | null> {
  const apiKey = process.env.PYTH_API_KEY;
  if (!apiKey) return null;

  const ticker = symbol.trim().toUpperCase();
  const feedId = EQUITY_FEED_IDS[ticker];
  if (!feedId) return null;

  try {
    const res = await fetch(`${HERMES_URL}/v2/updates/price/latest?ids[]=${feedId}&parsed=true`, {
      headers: { Authorization: `Bearer ${apiKey}` },
      cache: "no-store",
    });
    if (!res.ok) return null;

    const data = (await res.json()) as {
      parsed?: { price?: { price: string; expo: number; publish_time: number } }[];
    };
    const parsed = data.parsed?.[0]?.price;
    if (!parsed) return null;

    const priceUsd = Number(parsed.price) * 10 ** parsed.expo;
    if (!Number.isFinite(priceUsd) || priceUsd <= 0) return null;

    return {
      priceUsd,
      publishTime: new Date(parsed.publish_time * 1000).toISOString(),
      feedId,
      feedSymbol: `Equity.US.${ticker}/USD`,
    };
  } catch {
    return null;
  }
}
