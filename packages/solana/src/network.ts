import type { Connection, PublicKey } from "@solana/web3.js";
import type { ElfCluster } from "./connection.js";

/**
 * Well-known genesis hashes — the only reliable way to confirm an RPC
 * endpoint is actually serving the cluster its URL claims to. A
 * misconfigured or redirected `SOLANA_RPC_URL` (e.g. a proxy silently
 * pointing devnet traffic at mainnet, or vice versa) would otherwise be
 * invisible until funds move.
 * https://docs.solana.com/clusters
 */
const GENESIS_HASHES: Record<ElfCluster, string> = {
  "mainnet-beta": "5eykt4UsFv8P8NJdTREpY1vzqKqZKvdpKuc147dw2N9d",
  devnet: "EtWTRABZaYq6iMfeYKouRu166VU2xqa1wcaWoxPkrZBG",
};

export class NetworkMismatchError extends Error {
  constructor(expected: ElfCluster, actualGenesisHash: string) {
    super(
      `RPC endpoint genesis hash (${actualGenesisHash}) does not match the expected cluster "${expected}". Refusing to build a transaction against an unverified network.`,
    );
    this.name = "NetworkMismatchError";
  }
}

const genesisHashCache = new Map<string, { hash: string; fetchedAt: number }>();
const GENESIS_CACHE_TTL_MS = 60_000;

/**
 * Confirms the connection's actual genesis hash matches the cluster its
 * RPC URL claims to be. Cached briefly, keyed by the connection's own
 * endpoint plus the expected cluster, since genesis hash never changes
 * for a given endpoint — this is a one-time-per-minute sanity check per
 * endpoint, not a per-request round trip cost, and never reuses a result
 * fetched for a different endpoint or a different expectation.
 */
export async function assertClusterMatches(connection: Connection, expected: ElfCluster): Promise<void> {
  const cacheKey = `${connection.rpcEndpoint}::${expected}`;
  const now = Date.now();
  const cached = genesisHashCache.get(cacheKey);
  const hash = cached && now - cached.fetchedAt < GENESIS_CACHE_TTL_MS ? cached.hash : await connection.getGenesisHash();

  genesisHashCache.set(cacheKey, { hash, fetchedAt: now });

  if (hash !== GENESIS_HASHES[expected]) {
    throw new NetworkMismatchError(expected, hash);
  }
}

export class UnexpectedAccountOwnerError extends Error {
  constructor(label: string, address: PublicKey, expectedOwner: PublicKey, actualOwner: string | null) {
    super(
      `${label} (${address.toBase58()}) is ${actualOwner ? `owned by ${actualOwner}` : "not a known account"}, expected owner ${expectedOwner.toBase58()}.`,
    );
    this.name = "UnexpectedAccountOwnerError";
  }
}

/**
 * Verifies an on-chain account is actually owned by the program we
 * expect (e.g. the real Meteora DBC program) before we trust it as a
 * config or pool address. Guards against a stale, tampered, or
 * mistyped address slipping through into a transaction.
 */
export async function assertAccountOwnedByProgram(
  connection: Connection,
  address: PublicKey,
  expectedOwner: PublicKey,
  label: string,
): Promise<void> {
  const info = await connection.getAccountInfo(address);
  if (!info || !info.owner.equals(expectedOwner)) {
    throw new UnexpectedAccountOwnerError(label, address, expectedOwner, info?.owner.toBase58() ?? null);
  }
}
