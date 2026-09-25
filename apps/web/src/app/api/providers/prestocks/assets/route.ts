import { NextResponse } from "next/server";
import { fetchNormalizedPreStocksAssets, PreStocksUnavailableError } from "@elf/prestocks-adapter";
import { apiError } from "@/lib/server/api-error";

export async function GET() {
  try {
    // Upstream order is not stable between requests; sort so cards don't shuffle under the cursor.
    const assets = (await fetchNormalizedPreStocksAssets(process.env.PRESTOCKS_API_URL)).sort((a, b) =>
      a.symbol.localeCompare(b.symbol),
    );
    return NextResponse.json({ assets, provider: "prestocks" });
  } catch (error) {
    if (error instanceof PreStocksUnavailableError) {
      return apiError("provider_unavailable", error.message, 503);
    }
    return apiError("internal_error", "Failed to load PreStocks assets.", 500);
  }
}
