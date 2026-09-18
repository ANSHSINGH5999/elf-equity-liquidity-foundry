import { NextResponse } from "next/server";
import { fetchNormalizedTesseraAssets, TesseraDisabledError, TesseraUnavailableError } from "@elf/tessera-adapter";
import { apiError } from "@/lib/server/api-error";

export async function GET() {
  const enabled = process.env.TESSERA_ENABLED === "true";

  try {
    const assets = await fetchNormalizedTesseraAssets({ enabled, endpoint: process.env.TESSERA_API_URL });
    return NextResponse.json({ assets, provider: "tessera" });
  } catch (error) {
    if (error instanceof TesseraDisabledError) {
      return apiError("provider_unavailable", error.message, 503, { featureFlag: "TESSERA_ENABLED" });
    }
    if (error instanceof TesseraUnavailableError) {
      return apiError("provider_unavailable", error.message, 503);
    }
    return apiError("internal_error", "Failed to load Tessera assets.", 500);
  }
}
