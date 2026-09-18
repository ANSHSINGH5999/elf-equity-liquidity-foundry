import type { QuoteToken } from "@elf/shared";

/**
 * Meteora's `buildCurve*` helpers denominate market cap in the quote
 * token's native unit (1 USDC ≈ $1, but 1 SOL is not $1). ELF's UI collects
 * everything in USD, so SOL-quoted markets need a live SOL/USD price to
 * convert before calling into the SDK. This never fabricates a price: if
 * the feed is unreachable, callers must surface an "unavailable" error
 * state rather than deploy with a guessed number.
 */
export class QuotePriceUnavailableError extends Error {
  constructor(quoteToken: QuoteToken) {
    super(`Unable to fetch a live USD price for ${quoteToken}. Try again shortly.`);
    this.name = "QuotePriceUnavailableError";
  }
}

let cachedSolPrice: { price: number; fetchedAt: number } | null = null;
const CACHE_TTL_MS = 30_000;

async function fetchSolUsdPrice(): Promise<number> {
  if (cachedSolPrice && Date.now() - cachedSolPrice.fetchedAt < CACHE_TTL_MS) {
    return cachedSolPrice.price;
  }

  const response = await fetch("https://api.coinbase.com/v2/prices/SOL-USD/spot", {
    signal: AbortSignal.timeout(5000),
  });

  if (!response.ok) {
    throw new QuotePriceUnavailableError("SOL");
  }

  const body = (await response.json()) as { data?: { amount?: string } };
  const price = Number(body?.data?.amount);

  if (!Number.isFinite(price) || price <= 0) {
    throw new QuotePriceUnavailableError("SOL");
  }

  cachedSolPrice = { price, fetchedAt: Date.now() };
  return price;
}

/** Returns how many USD one unit of the quote token is worth right now. */
export async function getQuoteUsdPrice(quoteToken: QuoteToken): Promise<number> {
  if (quoteToken === "USDC") return 1;

  try {
    return await fetchSolUsdPrice();
  } catch (error) {
    if (error instanceof QuotePriceUnavailableError) throw error;
    throw new QuotePriceUnavailableError("SOL");
  }
}
