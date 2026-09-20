import { NextResponse } from "next/server";
import { z } from "zod";
import type { AiMarketAnalysisResponse } from "@elf/shared";
import { apiError, isPrismaConnectionError, logUnhandledRouteError } from "@/lib/server/api-error";
import { AI_DATA_SOURCE, buildVerifiedSnapshot, explainSnapshotCached } from "@/lib/server/aiMarketAnalysis";
import { isGroqConfigured } from "@/lib/server/groq";
import { getIssuerDashboard, getTradeStats } from "@/lib/server/marketAnalytics";
import { checkRateLimit, clientKeyFromRequest } from "@/lib/server/rate-limit";

/**
 * AI explanation of a market's VERIFIED data. The body carries only a market id: the server reads the authoritative
 * data itself, so a caller can never hand the model a "fact". Groq explains; it is not a source of truth (see
 * lib/server/aiMarketAnalysis.ts). Tightly rate-limited because each uncached call spends the Groq key's quota.
 */
const bodySchema = z.object({ marketId: z.string().regex(/^[A-Za-z0-9_-]{1,64}$/) }).strict();
const MAX_BODY_CHARS = 1_024;

const FAILURE_MESSAGES = {
  rate_limited: "The AI provider is rate-limiting this server. Try again shortly.",
  timeout: "The AI provider did not answer in time.",
  unavailable: "The AI provider is unavailable.",
  malformed: "The AI provider returned an answer that could not be validated.",
  rejected: "The AI's answer was not consistent with the verified data and was discarded.",
} as const;

export async function POST(request: Request) {
  if (!checkRateLimit(`ai-market-analysis:${clientKeyFromRequest(request)}`, 5, 60_000)) {
    return apiError("validation_error", "Too many requests. Slow down.", 429);
  }
  if (!isGroqConfigured()) {
    return apiError("provider_unavailable", "AI analysis is not configured on this server (GROQ_API_KEY is not set).", 503, { reason: "not_configured" });
  }

  const text = await request.text().catch(() => "");
  if (text.length > MAX_BODY_CHARS) return apiError("validation_error", "Request body is too large.", 413);
  let json: unknown = null;
  try {
    json = JSON.parse(text);
  } catch {
    /* falls through to validation */
  }
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) return apiError("validation_error", "Body must be exactly { marketId }.", 400);

  try {
    const dashboard = await getIssuerDashboard(parsed.data.marketId);
    if (!dashboard) return apiError("not_found", `Market ${parsed.data.marketId} was not found or has no deployed pool yet.`, 404);

    const allTime = await getTradeStats(parsed.data.marketId, "ALL");
    const snapshot = buildVerifiedSnapshot(dashboard, { buy: allTime.buyTrades, sell: allTime.sellTrades });
    const { result, cached } = await explainSnapshotCached(parsed.data.marketId, snapshot);

    if (!result.ok) {
      const status = result.reason === "rate_limited" ? 429 : result.reason === "rejected" || result.reason === "malformed" ? 502 : 503;
      const response = apiError("provider_unavailable", FAILURE_MESSAGES[result.reason === "not_configured" ? "unavailable" : result.reason], status, { reason: result.reason });
      if (result.reason === "rate_limited") response.headers.set("Retry-After", "30");
      return response;
    }

    const body: AiMarketAnalysisResponse = {
      status: "ok",
      analysis: result.analysis,
      meta: {
        provider: "Groq",
        model: result.model,
        generatedAt: new Date().toISOString(),
        snapshotAt: dashboard.overview.priceUsd.timestamp,
        dataSource: AI_DATA_SOURCE,
        cached,
        droppedUngrounded: result.dropped,
      },
    };
    return NextResponse.json(body);
  } catch (error) {
    if (isPrismaConnectionError(error)) return apiError("database_unavailable", "The ELF database is temporarily unavailable.", 503);
    logUnhandledRouteError("POST /api/ai/market-analysis", error);
    return apiError("internal_error", "The AI analysis could not be produced.", 500);
  }
}
