import "server-only";
import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";

export type ApiErrorCode =
  | "validation_error"
  | "not_found"
  | "database_unavailable"
  | "rpc_unavailable"
  | "provider_unavailable"
  | "asset_unavailable"
  | "unsupported_asset"
  | "simulation_failed"
  | "network_mismatch"
  | "invalid_account"
  | "duplicate_deployment"
  | "unauthorized"
  | "forbidden"
  | "internal_error";

/**
 * Uniform, user-safe error envelope. Never leaks a raw stack trace to the client.
 * `cause` is logged server-side only (name, message, Prisma `errorCode`) — never sent in the response.
 */
export function apiError(code: ApiErrorCode, message: string, status: number, details?: unknown, cause?: unknown) {
  const requestId = randomUUID();
  // Structured server-side log — no secrets, no PII beyond what the caller passed in `details`.
  console.error(JSON.stringify({ requestId, code, message, status, ...(cause !== undefined && { cause: describeCause(cause) }) }));
  return NextResponse.json({ error: { code, message, requestId, details } }, { status });
}

// Prisma messages can echo the datasource URL; mask credentials before logging.
function describeCause(error: unknown) {
  const redact = (text: string) => text.replace(/(\w+:\/\/)[^@\s/]+@/g, "$1***@");
  if (!(error instanceof Error)) return { message: redact(String(error)) };
  const errorCode = (error as Error & { errorCode?: string; code?: string }).errorCode ?? (error as Error & { code?: string }).code;
  return { name: error.name, errorCode, message: redact(error.message) };
}

export function databaseUnavailable(cause: unknown) {
  return apiError("database_unavailable", "The ELF database is temporarily unavailable.", 503, undefined, cause);
}

/**
 * Structured, field-limited server-side log for an unexpected (not
 * otherwise classified) route error — the diagnostic detail `apiError`
 * deliberately omits from its own log line. Security remediation review
 * (docs/security-remediation.md, "Debug logs"): only ever logs `name` and
 * `message`, never the raw `Error` object — a thrown error can carry
 * arbitrary own properties depending on its source (an SDK, a driver), and
 * dumping it wholesale risks incidentally logging more than intended into
 * whatever log sink this ends up shipped to. `stack` is included only
 * outside production, where it's a pure local-development aid.
 */
export function logUnhandledRouteError(routeLabel: string, error: unknown): void {
  const isProduction = process.env.NODE_ENV === "production";
  const entry: Record<string, unknown> = {
    route: routeLabel,
    name: error instanceof Error ? error.name : typeof error,
    message: error instanceof Error ? error.message : String(error),
  };
  if (!isProduction && error instanceof Error && error.stack) {
    entry.stack = error.stack;
  }
  console.error(JSON.stringify(entry));
}

export function isPrismaConnectionError(error: unknown): boolean {
  return (
    error instanceof Error &&
    (error.message.includes("Can't reach database server") ||
      error.message.includes("ECONNREFUSED") ||
      error.name === "PrismaClientInitializationError")
  );
}

/**
 * The DBC SDK throws "Insufficient Liquidity" when a sell asks for more quote token than the pool's reserve can pay
 * (a brand-new pool has a quote reserve of 0). That is a property of the pool and the amount — not an RPC failure.
 */
export function mapInsufficientLiquidity(error: unknown) {
  if (!(error instanceof Error) || !/insufficient liquidity/i.test(error.message)) return null;
  return apiError("validation_error", "The pool does not hold enough quote-token liquidity to pay for this trade at this size. Try a smaller amount.", 422);
}

/**
 * Maps the transaction-safety errors introduced in ELF V1 Phase 2
 * (network validation, account-ownership validation, simulation) to a
 * response, or returns `null` if `error` isn't one of them so the caller
 * can fall through to its own handling.
 */
export function mapTransactionSafetyError(error: unknown) {
  if (!(error instanceof Error)) return null;

  switch (error.name) {
    case "NetworkMismatchError":
      return apiError("network_mismatch", error.message, 500);
    case "UnexpectedAccountOwnerError":
      return apiError("invalid_account", error.message, 400);
    case "TransactionSimulationError": {
      const logs = (error as Error & { logs?: string[] | null }).logs;
      return apiError("simulation_failed", error.message, 502, logs ? { logs: logs.slice(-10) } : undefined);
    }
    default:
      return null;
  }
}
