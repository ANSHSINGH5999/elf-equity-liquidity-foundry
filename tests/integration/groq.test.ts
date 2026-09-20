import { describe, expect, it, vi } from "vitest";
import { DEFAULT_GROQ_MODEL, callGroq, configuredGroqModel } from "../../apps/web/src/lib/server/groq.js";

/**
 * The Groq client runs against an injected fetch — no network, no real key. Every failure is one of a closed set of
 * reasons, the fake key must never leak into a result, and Groq's error bodies are never forwarded.
 */
const KEY = "FAKE_TEST_GROQ_KEY_NOT_REAL_0123456789";
const request = { system: "sys", user: "usr", schema: { name: "t", schema: { type: "object", properties: {}, required: [], additionalProperties: false } } };
const completion = (content: unknown, finish = "stop") => ({ choices: [{ message: { content }, finish_reason: finish }] });
const respond = (status: number, body: unknown) => (async () => new Response(typeof body === "string" ? body : JSON.stringify(body), { status })) as typeof fetch;
const deps = (fetchImpl: typeof fetch) => ({ apiKey: KEY, model: "test-model", fetchImpl });

describe("Groq client", () => {
  it("key missing: not_configured, and no request is made", async () => {
    vi.stubEnv("GROQ_API_KEY", "");
    const fetchImpl = vi.fn();
    expect(await callGroq(request, { fetchImpl: fetchImpl as unknown as typeof fetch })).toEqual({ ok: false, reason: "not_configured" });
    expect(fetchImpl).not.toHaveBeenCalled();
    vi.unstubAllEnvs();
  });

  it("valid answer: returns the content and model; sends Bearer auth and a strict JSON schema to the fixed origin", async () => {
    const fetchImpl = vi.fn(respond(200, completion('{"summary":"ok"}')));
    const r = await callGroq(request, deps(fetchImpl as unknown as typeof fetch));
    expect(r).toEqual({ ok: true, content: '{"summary":"ok"}', model: "test-model" });
    const [url, init] = fetchImpl.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe("https://api.groq.com/openai/v1/chat/completions");
    expect((init.headers as Record<string, string>).Authorization).toBe(`Bearer ${KEY}`);
    const body = JSON.parse(init.body as string);
    expect(body.model).toBe("test-model");
    expect(body.response_format).toMatchObject({ type: "json_schema", json_schema: { strict: true } });
    expect(body.messages.map((m: { role: string }) => m.role)).toEqual(["system", "user"]);
    expect(init.body).not.toContain(KEY);
    expect(JSON.stringify(r)).not.toContain(KEY);
  });

  it.each([
    ["rate limited", 429, "rate_limited"],
    ["server error", 500, "unavailable"],
    ["bad key", 401, "unavailable"],
  ] as const)("%s (%i) -> %s, and the provider's body is not forwarded", async (_n, status, reason) => {
    const r = await callGroq(request, deps(respond(status, { error: { message: `secret detail ${KEY}` } })));
    expect(r).toEqual({ ok: false, reason });
    expect(JSON.stringify(r)).not.toContain("secret detail");
  });

  it("a strict-schema generation Groq could not finish (400 json_validate_failed) is 'malformed', not an outage; other 400s are unavailable", async () => {
    const failed = respond(400, { error: { code: "json_validate_failed", message: "max completion tokens reached", failed_generation: `echo ${KEY}` } });
    const r = await callGroq(request, deps(failed));
    expect(r).toEqual({ ok: false, reason: "malformed" });
    expect(JSON.stringify(r)).not.toContain(KEY);
    expect(await callGroq(request, deps(respond(400, { error: { code: "model_not_found" } })))).toEqual({ ok: false, reason: "unavailable" });
    expect(await callGroq(request, deps(respond(400, "not json")))).toEqual({ ok: false, reason: "unavailable" });
  });

  it("gives a reasoning model room to think (token budget) and asks GPT-OSS for low reasoning effort — only GPT-OSS", async () => {
    const send = async (model: string) => {
      const fetchImpl = vi.fn(respond(200, completion("{}")));
      await callGroq(request, { apiKey: KEY, model, fetchImpl: fetchImpl as unknown as typeof fetch });
      return JSON.parse((fetchImpl.mock.calls[0] as unknown as [string, RequestInit])[1].body as string);
    };
    const gptOss = await send("openai/gpt-oss-20b");
    expect(gptOss.reasoning_effort).toBe("low");
    expect(gptOss.max_completion_tokens).toBeGreaterThanOrEqual(4_000);
    expect((await send("llama-3.3-70b-versatile")).reasoning_effort).toBeUndefined();
  });

  it("timeout (aborted request) -> timeout", async () => {
    const abort = (async () => { throw Object.assign(new Error("aborted"), { name: "AbortError" }); }) as typeof fetch;
    expect(await callGroq(request, deps(abort))).toEqual({ ok: false, reason: "timeout" });
  });

  it("network failure -> unavailable", async () => {
    expect(await callGroq(request, deps((async () => { throw new Error("ECONNRESET"); }) as typeof fetch))).toEqual({ ok: false, reason: "unavailable" });
  });

  it.each([
    ["not JSON", "<html>"],
    ["no choices", {}],
    ["content is not a string", completion({ a: 1 })],
    ["empty content", completion("   ")],
    ["cut off at the token limit", completion('{"summary":"x', "length")],
    ["oversized", "x".repeat(70_000)],
  ])("malformed reply (%s) -> malformed", async (_n, body) => {
    expect(await callGroq(request, deps(respond(200, body)))).toEqual({ ok: false, reason: "malformed" });
  });

  it("the model is configurable via GROQ_MODEL and defaults to a current production model", () => {
    vi.stubEnv("GROQ_MODEL", "");
    expect(configuredGroqModel()).toBe(DEFAULT_GROQ_MODEL);
    vi.stubEnv("GROQ_MODEL", "some/other-model");
    expect(configuredGroqModel()).toBe("some/other-model");
    vi.unstubAllEnvs();
  });
});
