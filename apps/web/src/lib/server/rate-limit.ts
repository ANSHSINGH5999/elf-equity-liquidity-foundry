import "server-only";

/**
 * Minimal in-memory fixed-window rate limiter. Per-instance only — a
 * multi-instance production deployment needs a shared store (e.g.
 * Upstash Redis) for this to bound anything across instances. See
 * docs/security.md and docs/security-remediation.md (LOW-4).
 */
const buckets = new Map<string, { count: number; resetAt: number }>();

export function checkRateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const bucket = buckets.get(key);

  if (!bucket || now > bucket.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }

  if (bucket.count >= limit) return false;
  bucket.count += 1;
  return true;
}

/**
 * Number of trusted reverse-proxy hops between the client and this app —
 * i.e. how many X-Forwarded-For entries were appended by infrastructure
 * this deployment actually controls/trusts, as opposed to supplied by the
 * client itself. `0` (the default) means "trust nothing the client sent."
 * See TRUSTED_PROXY_HOPS in .env.example for the full explanation and the
 * LOW-4 write-up in docs/security-remediation.md for the threat model this
 * closes: without this, a caller can set an arbitrary X-Forwarded-For
 * value per request to get a fresh rate-limit bucket every time.
 */
function trustedProxyHops(): number {
  const raw = process.env.TRUSTED_PROXY_HOPS;
  const parsed = raw ? Number.parseInt(raw, 10) : 0;
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
}

/**
 * Derives the rate-limit identity for a request.
 *
 * With `TRUSTED_PROXY_HOPS=0` (default): never trusts the client-supplied
 * `x-forwarded-for` header at all — every caller collapses onto a single
 * shared bucket. This cannot be bypassed by header spoofing (there is
 * nothing left to spoof), but it also means the limiter only throttles
 * *aggregate* traffic to a route, not any individual abusive caller. This
 * is a real, disclosed limitation, not a bug: this codebase has no way to
 * observe a raw per-connection address from inside a Next.js Route
 * Handler, and guessing that any given `x-forwarded-for` value is
 * trustworthy without operator confirmation would be worse than not
 * pretending to have per-client granularity at all.
 *
 * With `TRUSTED_PROXY_HOPS=N` (N>0): reads the Nth-from-the-end entry of
 * `x-forwarded-for`. In a standard proxy chain, each hop *appends* the
 * address it saw to the end of the header; a client can still prepend or
 * inject fake entries at the front, but cannot control what a real,
 * trusted proxy N hops away appended after seeing the actual connection —
 * as long as that proxy is configured to always overwrite/append rather
 * than pass the inbound header through unchanged. This is standard
 * "trust proxy depth" behavior (the same model Express's `trust proxy`
 * setting uses), and its safety depends entirely on that assumption
 * holding for your actual deployment topology.
 */
export function clientKeyFromRequest(request: Request): string {
  const hops = trustedProxyHops();
  if (hops === 0) return "shared";

  const forwarded = request.headers.get("x-forwarded-for");
  if (!forwarded) return "unknown";

  const entries = forwarded.split(",").map((entry) => entry.trim()).filter(Boolean);
  // The Nth trusted hop's entry, counting from the end (most recently
  // appended = closest to this server = most trustworthy).
  const entry = entries.length >= hops ? entries[entries.length - hops] : undefined;
  return entry ?? "unknown";
}
