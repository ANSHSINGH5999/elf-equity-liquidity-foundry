import "server-only";

/**
 * Minimal Groq (OpenAI-compatible) chat client. Server-only: the key is read from `GROQ_API_KEY` at call time, sent
 * only as a Bearer header to the fixed Groq origin, and never logged, thrown, or returned. Groq's error bodies are
 * deliberately not forwarded — callers get a small closed set of failure reasons.
 */
const ENDPOINT = "https://api.groq.com/openai/v1/chat/completions";
const REQUEST_TIMEOUT_MS = 20_000;
const MAX_RESPONSE_CHARS = 64_000;
export const DEFAULT_GROQ_MODEL = "openai/gpt-oss-20b";

export type GroqFailureReason = "not_configured" | "rate_limited" | "timeout" | "unavailable" | "malformed";

export type GroqResult = { ok: true; content: string; model: string } | { ok: false; reason: GroqFailureReason };

export interface GroqRequest {
  system: string;
  user: string;
  /** Strict JSON schema the reply must follow (`additionalProperties:false`, every property required). */
  schema: { name: string; schema: Record<string, unknown> };
  maxCompletionTokens?: number;
}

export interface GroqDeps {
  fetchImpl?: typeof fetch;
  apiKey?: string | undefined;
  model?: string | undefined;
}

export const configuredGroqModel = (): string => process.env.GROQ_MODEL?.trim() || DEFAULT_GROQ_MODEL;

export const isGroqConfigured = (): boolean => Boolean(process.env.GROQ_API_KEY);

export async function callGroq(request: GroqRequest, deps: GroqDeps = {}): Promise<GroqResult> {
  const apiKey = deps.apiKey ?? process.env.GROQ_API_KEY;
  if (!apiKey) return { ok: false, reason: "not_configured" };
  const model = deps.model ?? configuredGroqModel();

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    const response = await (deps.fetchImpl ?? fetch)(ENDPOINT, {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      signal: controller.signal,
      cache: "no-store",
      body: JSON.stringify({
        model,
        temperature: 0.2,
        // Reasoning models spend completion tokens thinking before they write the JSON; a tight budget fails mid-document.
        max_completion_tokens: request.maxCompletionTokens ?? 4_000,
        ...(model.startsWith("openai/gpt-oss") ? { reasoning_effort: "low" } : {}),
        messages: [
          { role: "system", content: request.system },
          { role: "user", content: request.user },
        ],
        response_format: { type: "json_schema", json_schema: { name: request.schema.name, strict: true, schema: request.schema.schema } },
      }),
    });
    if (response.status === 429) return { ok: false, reason: "rate_limited" };
    if (response.status === 400) {
      // Groq answers a strict-schema generation that could not be completed with 400 json_validate_failed: an unusable
      // answer from a reachable provider, not an outage. Only the error code is read, never the body's text.
      const code = await response.json().then((b: { error?: { code?: unknown } }) => b?.error?.code).catch(() => undefined);
      return { ok: false, reason: code === "json_validate_failed" ? "malformed" : "unavailable" };
    }
    if (!response.ok) return { ok: false, reason: "unavailable" };

    const text = await response.text();
    if (text.length > MAX_RESPONSE_CHARS) return { ok: false, reason: "malformed" };
    let body: unknown;
    try {
      body = JSON.parse(text);
    } catch {
      return { ok: false, reason: "malformed" };
    }
    const choice = (body as { choices?: { message?: { content?: unknown }; finish_reason?: unknown }[] } | null)?.choices?.[0];
    const content = choice?.message?.content;
    // A reply cut off at the token limit is incomplete JSON by definition; never try to repair it.
    if (typeof content !== "string" || content.trim() === "" || choice?.finish_reason === "length") return { ok: false, reason: "malformed" };
    return { ok: true, content, model };
  } catch (error) {
    return { ok: false, reason: error instanceof Error && error.name === "AbortError" ? "timeout" : "unavailable" };
  } finally {
    clearTimeout(timer);
  }
}
