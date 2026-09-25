import { NextResponse } from "next/server";
import { SystemProgram } from "@solana/web3.js";
import { prisma } from "@elf/db";
import {
  NetworkMismatchError,
  PUBLIC_DEVNET_RPC_URL,
  assertClusterMatches,
  classifyRpcError,
  createConnection,
  isPublicDefaultRpc,
  resolveClusterFromRpcUrl,
  resolveQuoteMint,
  rpcProviderHost,
  type RpcFailure,
} from "@elf/solana";
import { getServerRpcUrl } from "@/lib/server/rpc";
import { logUnhandledRouteError } from "@/lib/server/api-error";

/**
 * Liveness/readiness check — verifies the two hard dependencies (DB, RPC) rather than just returning 200 unconditionally.
 *
 * Everything here is safe to expose: booleans, the cluster name, latencies, and the RPC provider's registrable domain.
 * Never the RPC URL (it can carry an API key), never a header, never a hostname's subdomain.
 *
 * `?deep=1` adds getBalance, getSlot and an account lookup. They are off by default so an uptime monitor polling this
 * route does not spend RPC quota on every hit.
 */
type ProbeStatus = "ok" | RpcFailure;
interface Probe {
  status: ProbeStatus;
  latencyMs: number;
}

async function probe(call: () => Promise<unknown>): Promise<Probe> {
  const startedAt = Date.now();
  try {
    await call();
    return { status: "ok", latencyMs: Date.now() - startedAt };
  } catch (error) {
    return { status: classifyRpcError(error), latencyMs: Date.now() - startedAt };
  }
}

export async function GET(request?: Request) {
  const deep = request ? new URL(request.url).searchParams.get("deep") === "1" : false;
  const checks: Record<string, "ok" | "unavailable"> = { database: "ok", rpc: "ok" };

  const dbStartedAt = Date.now();
  let dbErrorCode: string | undefined;
  await prisma.$queryRaw`SELECT 1`.catch((error: unknown) => {
    checks.database = "unavailable";
    // Prisma's P-codes (P1001 unreachable, P1000 auth, P1012 missing env) are safe to expose; the message is not.
    dbErrorCode = (error as { errorCode?: string }).errorCode ?? (error instanceof Error ? error.name : "unknown");
    logUnhandledRouteError("GET /api/health (database)", error);
  });
  const dbLatencyMs = Date.now() - dbStartedAt;

  const rpcUrl = getServerRpcUrl();
  const cluster = resolveClusterFromRpcUrl(rpcUrl);
  // Retries off: a throttled (429) request must show up as rate_limited, not as seconds of hidden backoff.
  const connection = createConnection(rpcUrl, "confirmed", { disableRetryOnRateLimit: true });

  let clusterVerified: boolean | null = null;
  const genesis = assertClusterMatches(connection, cluster).then(
    () => {
      clusterVerified = true;
    },
    (error) => {
      clusterVerified = error instanceof NetworkMismatchError ? false : null;
    },
  );
  const [blockhash, deepProbes] = await Promise.all([
    probe(() => connection.getLatestBlockhash()),
    deep
      ? Promise.all([
          probe(() => connection.getBalance(SystemProgram.programId)),
          probe(() => connection.getSlot()),
          probe(() => connection.getAccountInfo(resolveQuoteMint("USDC", cluster))),
        ]).then(([getBalance, getSlot, accountLookup]) => ({ getBalance, getSlot, accountLookup }))
      : Promise.resolve(null),
    genesis,
  ]);

  const probes: Probe[] = [blockhash, ...(deepProbes ? Object.values(deepProbes) : [])];
  const rpcStatus: ProbeStatus = probes.find((p) => p.status === "rate_limited")?.status ?? probes.find((p) => p.status !== "ok")?.status ?? "ok";
  if (rpcStatus !== "ok") checks.rpc = "unavailable";

  const frontendUrl = process.env.NEXT_PUBLIC_SOLANA_RPC_URL || PUBLIC_DEVNET_RPC_URL;
  const frontendCluster = resolveClusterFromRpcUrl(frontendUrl);
  const healthy = Object.values(checks).every((v) => v === "ok");
  return NextResponse.json(
    {
      status: healthy ? "ok" : "degraded",
      checks,
      db: checks.database === "ok" ? "ok" : "error",
      latencyMs: dbLatencyMs,
      ...(dbErrorCode && { errorCode: dbErrorCode }),
      // `cluster` lets the browser confirm it is configured for the same network as this server before signing.
      cluster,
      rpcConfigured: Boolean(process.env.SOLANA_RPC_URL),
      rpcDedicated: !isPublicDefaultRpc(rpcUrl),
      rpcReachable: blockhash.status === "ok",
      rpcStatus,
      rateLimited: probes.some((p) => p.status === "rate_limited"),
      clusterVerified,
      frontendClusterMatches: frontendCluster === cluster,
      rpc: {
        providerHost: rpcProviderHost(rpcUrl),
        frontendProviderHost: rpcProviderHost(frontendUrl),
        sameProviderForFrontend: rpcProviderHost(frontendUrl) === rpcProviderHost(rpcUrl),
        latencyMs: blockhash.latencyMs,
        getLatestBlockhash: blockhash,
        ...(deepProbes ?? {}),
      },
    },
    { status: healthy ? 200 : 503 },
  );
}
