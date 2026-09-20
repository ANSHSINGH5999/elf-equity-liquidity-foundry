"use client";

import { useCallback, useEffect, useState } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { PublicKey, type Connection } from "@solana/web3.js";
import { classifyRpcError, type RpcFailure } from "@elf/solana";
import { deriveBalanceStatus, type BalanceReadStatus } from "@/components/markets/trade-state";

const NATIVE_MINT = "So11111111111111111111111111111111111111112";

export interface WalletBalances {
  /** disconnected: no wallet. loading: first read in flight. ready: every requested balance read. partial/error: some/all reads failed. */
  status: BalanceReadStatus;
  /** Native SOL. null = not read (never coerced to 0). */
  sol: number | null;
  base: number | null;
  quote: number | null;
  /** Whether the wallet has any token account for the mint. null = not read, or not applicable (native SOL). */
  baseAccountExists: boolean | null;
  quoteAccountExists: boolean | null;
  /** Why a read failed, when one did: a throttled endpoint (429) versus any other RPC failure. Never a zero balance. */
  problem: RpcFailure | null;
  refresh: () => void;
}

interface Loaded {
  key: string;
  sol: number | null;
  base: number | null;
  quote: number | null;
  baseAccountExists: boolean | null;
  quoteAccountExists: boolean | null;
  problem: RpcFailure | null;
}

async function tokenBalance(connection: Connection, owner: PublicKey, mint: string): Promise<{ amount: number; accountExists: boolean }> {
  const res = await connection.getParsedTokenAccountsByOwner(owner, { mint: new PublicKey(mint) }, "confirmed");
  return {
    amount: res.value.reduce((sum, account) => sum + (account.account.data.parsed.info.tokenAmount.uiAmount ?? 0), 0),
    accountExists: res.value.length > 0,
  };
}

async function readBalances(connection: Connection, owner: PublicKey, baseMint: string | null, quoteMint: string | null): Promise<Loaded> {
  const [solRes, baseRes, quoteRes] = await Promise.allSettled([
    connection.getBalance(owner, "confirmed"),
    baseMint ? tokenBalance(connection, owner, baseMint) : Promise.resolve(null),
    quoteMint && quoteMint !== NATIVE_MINT ? tokenBalance(connection, owner, quoteMint) : Promise.resolve(null),
  ]);

  const sol = solRes.status === "fulfilled" ? solRes.value / 1_000_000_000 : null;
  const failures = [solRes, baseRes, quoteRes].flatMap((r) => (r.status === "rejected" ? [classifyRpcError(r.reason)] : []));
  return {
    problem: failures.length === 0 ? null : failures.includes("rate_limited") ? "rate_limited" : "unavailable",
    key: `${owner.toBase58()}|${baseMint}|${quoteMint}`,
    sol,
    base: baseRes.status === "fulfilled" ? (baseRes.value?.amount ?? null) : null,
    baseAccountExists: baseRes.status === "fulfilled" ? (baseRes.value?.accountExists ?? null) : null,
    // A SOL-quoted pool's quote balance IS the native balance (no token account involved).
    quote: quoteMint === NATIVE_MINT ? sol : quoteRes.status === "fulfilled" ? (quoteRes.value?.amount ?? null) : null,
    quoteAccountExists: quoteMint === NATIVE_MINT ? null : quoteRes.status === "fulfilled" ? (quoteRes.value?.accountExists ?? null) : null,
  };
}

/**
 * Real balances for the connected wallet: native SOL, the pool's base token
 * and its quote token. Read-only, via the public client RPC. A balance that
 * cannot be read is `null` — the UI must show "unavailable", never 0.
 * Results are tagged with the wallet+pool they were read for, so switching
 * wallets can never show the previous wallet's balance.
 */
export function useWalletBalances(baseMint: string | null, quoteMint: string | null): WalletBalances {
  const { connection } = useConnection();
  const { publicKey } = useWallet();
  const [loaded, setLoaded] = useState<Loaded | null>(null);
  const [refreshNonce, setRefreshNonce] = useState(0);

  const owner = publicKey?.toBase58() ?? null;
  const key = `${owner}|${baseMint}|${quoteMint}`;

  useEffect(() => {
    if (!publicKey) return;
    let cancelled = false;
    readBalances(connection, publicKey, baseMint, quoteMint).then((result) => {
      if (!cancelled) setLoaded(result);
    });
    return () => {
      cancelled = true;
    };
  }, [connection, publicKey, baseMint, quoteMint, refreshNonce]);

  const refresh = useCallback(() => setRefreshNonce((n) => n + 1), []);

  const loadedForThisWallet = loaded !== null && loaded.key === key;
  const status = deriveBalanceStatus({
    connected: owner !== null,
    loadedForThisWallet,
    expected: { sol: true, base: baseMint !== null, quote: quoteMint !== null },
    values: { sol: loaded?.sol ?? null, base: loaded?.base ?? null, quote: loaded?.quote ?? null },
  });

  if (!loadedForThisWallet) return { status, sol: null, base: null, quote: null, baseAccountExists: null, quoteAccountExists: null, problem: null, refresh };
  return { status, sol: loaded.sol, base: loaded.base, quote: loaded.quote, baseAccountExists: loaded.baseAccountExists, quoteAccountExists: loaded.quoteAccountExists, problem: loaded.problem, refresh };
}
