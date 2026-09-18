import { NextResponse } from "next/server";
import { fetchNormalizedPreStocksAssets, PreStocksUnavailableError } from "@elf/prestocks-adapter";
import { apiError } from "@/lib/server/api-error";

export async function GET() {
  try {
    const assets = await fetchNormalizedPreStocksAssets(process.env.PRESTOCKS_API_URL);
    return NextResponse.json({ assets, provider: "prestocks" });
  } catch (error) {
    if (error instanceof PreStocksUnavailableError) {
      return apiError("provider_unavailable", error.message, 503);
    }
    return apiError("internal_error", "Failed to load PreStocks assets.", 500);
  }
}
