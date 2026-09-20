import { NextResponse } from "next/server";
import { PublicKey } from "@solana/web3.js";
import { prisma } from "@elf/db";
import { getLivePoolState, getQuoteUsdPrice } from "@elf/meteora-adapter";
import { ASSOCIATED_TOKEN_PROGRAM_ID, NetworkMismatchError, assertClusterMatches, classifyRpcError, resolveClusterFromRpcUrl } from "@elf/solana";
import type { QuoteToken } from "@elf/shared";
import { apiError } from "@/lib/server/api-error";
import { getServerConnection, getServerRpcUrl } from "@/lib/server/rpc";
import { getPythPriceComparison } from "@/lib/server/pyth";
import { checkRateLimit, clientKeyFromRequest } from "@/lib/server/rate-limit";
import { readinessVerdict, type ReadinessCheck, type TradeSide } from "@/lib/readiness";
import { POST as buildSwap } from "../swap/route";

/** Network fee plus rent for a new token account, with headroom. */
const MIN_SOL_FOR_FEES = 0.01;

const short = (s: string) => `${s.slice(0, 4)}…${s.slice(-4)}`;
const rpcWhy = (error: unknown) => (classifyRpcError(error) === "rate_limited" ? "RPC RATE LIMITED — could not read this (not a zero balance)" : "RPC temporarily unavailable — could not read this");

/**
 * Read-only: answers "is a BUY (default) or a SELL on this pool ready?" without signing or sending anything. The
 * simulation step runs the real swap route's build + simulate path for that side and discards the result.
 * `?side=sell&amountTokens=N` checks the wallet's base-token balance and dry-runs a SELL of exactly N tokens.
 */
export async function GET(request: Request, { params }: { params: Promise<{ poolAddress: string }> }) {
  if (!checkRateLimit(`dbc-readiness:${clientKeyFromRequest(request)}`, 15, 60_000)) {
    return apiError("validation_error", "Too many requests. Slow down.", 429);
  }

  const { poolAddress } = await params;
  const url = new URL(request.url);
  const walletParam = url.searchParams.get("wallet");
  const side = (url.searchParams.get("side") ?? "buy") as TradeSide;
  if (side !== "buy" && side !== "sell") return apiError("validation_error", "side must be buy or sell.", 400);
  const amountUsd = Number(url.searchParams.get("amountUsd") ?? "5");
  if (side === "buy" && (!Number.isFinite(amountUsd) || amountUsd <= 0 || amountUsd > 1_000_000)) return apiError("validation_error", "amountUsd must be a positive number.", 400);
  const amountTokens = Number(url.searchParams.get("amountTokens") ?? "");
  if (side === "sell" && (!Number.isFinite(amountTokens) || amountTokens <= 0 || amountTokens > 1e12)) return apiError("validation_error", "amountTokens must be a positive number for a sell.", 400);

  let pool: PublicKey;
  try {
    pool = new PublicKey(poolAddress);
  } catch {
    return apiError("validation_error", "Invalid pool address.", 400);
  }

  const connection = getServerConnection();
  const rpcUrl = getServerRpcUrl();
  const cluster = resolveClusterFromRpcUrl(rpcUrl);
  const checks: ReadinessCheck[] = [];
  const add = (c: ReadinessCheck) => checks.push(c);

  let wallet: PublicKey | null = null;
  try {
    wallet = walletParam ? new PublicKey(walletParam) : null;
  } catch {
    wallet = null;
  }

  const [networkResult, rpcResult] = await Promise.allSettled([assertClusterMatches(connection, cluster), connection.getLatestBlockhash("confirmed")]);
  add(
    networkResult.status === "fulfilled"
      ? { id: "network", label: "Server network", status: "pass", detail: `${cluster} — genesis hash verified` }
      : networkResult.reason instanceof NetworkMismatchError
        ? { id: "network", label: "Server network", status: "fail", detail: networkResult.reason.message }
        : { id: "network", label: "Server network", status: "unavailable", detail: rpcWhy(networkResult.reason) },
  );
  add(
    rpcResult.status === "fulfilled"
      ? { id: "rpc", label: "RPC", status: "pass", detail: "Healthy" }
      : { id: "rpc", label: "RPC", status: classifyRpcError(rpcResult.reason) === "rate_limited" ? "warn" : "unavailable", detail: classifyRpcError(rpcResult.reason) === "rate_limited" ? "RATE LIMITED — the endpoint is throttling requests; use a dedicated RPC" : "Unreachable" },
  );

  add(wallet ? { id: "wallet", label: "Wallet", status: "pass", detail: short(wallet.toBase58()) } : { id: "wallet", label: "Wallet", status: "fail", detail: "No wallet connected" });

  // Pool: on-chain truth first, then what ELF's own record says.
  let state: Awaited<ReturnType<typeof getLivePoolState>> = null;
  let symbol: string | null = null;
  try {
    state = await getLivePoolState(connection, pool);
    const launch = await prisma.launch.findFirst({ where: { poolAddress }, select: { stage: true, status: true, asset: { select: { symbol: true } } } }).catch(() => null);
    symbol = launch?.asset.symbol ?? null;
    add(
      state
        ? { id: "pool", label: "Pool", status: "pass", detail: `Exists on-chain${state.isMigrated ? " (migrated)" : ""}${launch ? ` — ELF record: stage ${launch.stage}, status ${launch.status}` : ""}` }
        : { id: "pool", label: "Pool", status: "fail", detail: "NOT DEPLOYED — no pool account at this address on this network" },
    );
  } catch (error) {
    add({ id: "pool", label: "Pool", status: "unavailable", detail: rpcWhy(error) });
  }

  const quoteToken: QuoteToken | null = state ? (state.tokenQuoteDecimal === 9 ? "SOL" : "USDC") : null;
  let quoteUsdPrice: number | null = null;
  if (quoteToken) {
    try {
      quoteUsdPrice = await getQuoteUsdPrice(quoteToken);
    } catch {
      quoteUsdPrice = null;
    }
  }
  const requiredQuote = side === "buy" && quoteUsdPrice ? amountUsd / quoteUsdPrice : null;

  // SOL (network fees; also the payment itself when SOL is the quote token).
  if (!wallet) {
    add({ id: "sol", label: "SOL", status: "skipped", detail: "No wallet" });
  } else {
    try {
      const sol = (await connection.getBalance(wallet, "confirmed")) / 1e9;
      const paysInSol = side === "buy" && quoteToken === "SOL";
      const needed = MIN_SOL_FOR_FEES + (paysInSol && requiredQuote ? requiredQuote : 0);
      add({ id: "sol", label: "SOL", status: sol >= needed ? "pass" : "fail", detail: `${sol.toLocaleString("en-US", { maximumFractionDigits: 4 })} SOL (needs about ${needed.toLocaleString("en-US", { maximumFractionDigits: 4 })} for fees${paysInSol ? " and the buy" : ""})` });
    } catch (error) {
      add({ id: "sol", label: "SOL", status: "unavailable", detail: rpcWhy(error) });
    }
  }

  if (side === "sell") {
    // A SELL spends the pool's base token: the wallet must hold at least the amount being sold.
    const label = symbol ?? "Base token";
    if (!wallet || !state) {
      add({ id: "base", label, status: "skipped", detail: !wallet ? "No wallet" : "Pool not readable" });
    } else {
      try {
        const mint = new PublicKey(state.baseMint);
        const held = await connection.getParsedTokenAccountsByOwner(wallet, { mint }, "confirmed");
        const total = held.value.reduce((sum, a) => sum + Number(a.account.data.parsed.info.tokenAmount.uiAmountString ?? 0), 0);
        if (held.value.length === 0) {
          add({ id: "base", label, status: "fail", detail: `NOT READY — the wallet has no token account for mint ${short(state.baseMint)}, so it holds nothing to sell.` });
        } else {
          add({ id: "base", label, status: total >= amountTokens ? "pass" : "fail", detail: `${total} in ${held.value.length} account(s), mint ${short(state.baseMint)} — needs ${amountTokens} to sell` });
        }
      } catch (error) {
        add({ id: "base", label, status: "unavailable", detail: rpcWhy(error) });
      }
    }
  } else if (!wallet || !state) {
    // Quote token: wallet, mint, token program, account (and whether it is the standard ATA), balance.
    add({ id: "quote", label: "Quote token", status: "skipped", detail: !wallet ? "No wallet" : "Pool not readable" });
  } else if (quoteToken === "SOL") {
    add({ id: "quote", label: "Quote token", status: "pass", detail: "SOL is the quote token — covered by the SOL check" });
  } else {
    try {
      const mint = new PublicKey(state.quoteMint);
      const held = await connection.getParsedTokenAccountsByOwner(wallet, { mint }, "confirmed");
      if (held.value.length === 0) {
        add({ id: "quote", label: "USDC", status: "fail", detail: `NOT READY — the wallet has no token account for mint ${state.quoteMint}. Receive this token first; the account is created by the standard Associated Token Account mechanism.` });
      } else {
        const total = held.value.reduce((sum, a) => sum + Number(a.account.data.parsed.info.tokenAmount.uiAmountString ?? 0), 0);
        const first = held.value[0]!;
        const program = first.account.owner;
        const ata = PublicKey.findProgramAddressSync([wallet.toBuffer(), program.toBuffer(), mint.toBuffer()], ASSOCIATED_TOKEN_PROGRAM_ID)[0];
        const sufficient = requiredQuote !== null && total >= requiredQuote;
        add({
          id: "quote",
          label: "USDC",
          status: requiredQuote === null ? "unavailable" : sufficient ? "pass" : "fail",
          detail: `${total} in ${held.value.length} account(s); first ${short(first.pubkey.toBase58())} (${first.pubkey.equals(ata) ? "standard ATA" : "not the standard ATA"}, token program ${short(program.toBase58())}), mint ${short(state.quoteMint)}${requiredQuote === null ? "" : ` — needs ${requiredQuote}`}`,
        });
      }
    } catch (error) {
      add({ id: "quote", label: "USDC", status: "unavailable", detail: rpcWhy(error) });
    }
  }

  // Oracle: informational.
  if (!symbol) {
    add({ id: "oracle", label: "Oracle", status: "unavailable", detail: "No ELF asset record for this pool" });
  } else {
    const feeds = await getPythPriceComparison(symbol).catch(() => null);
    const priced = feeds?.filter((f) => f.priceUsd !== null) ?? [];
    add(
      feeds === null
        ? { id: "oracle", label: "Oracle", status: "unavailable", detail: "Pyth lookup failed" }
        : feeds.length === 0
          ? { id: "oracle", label: "Oracle", status: "warn", detail: `No public Pyth feed for ${symbol} — the pool's own price is the reference` }
          : priced.length > 0
            ? { id: "oracle", label: "Oracle", status: "pass", detail: `${priced.length} Pyth feed(s) live` }
            : { id: "oracle", label: "Oracle", status: "warn", detail: feeds.every((f) => f.unavailableReason === "entitlement_restricted") ? "RESTRICTED — Pyth entitlement required" : `UNAVAILABLE (${feeds[0]?.unavailableReason ?? "unknown"})` },
    );
  }

  // Simulation: the real swap route's build + simulate path, only once everything it depends on is verified.
  const prerequisites = side === "sell" ? (["network", "wallet", "pool", "sol", "base"] as const) : (["network", "wallet", "pool", "sol", "quote"] as const);
  const unmet = prerequisites.filter((id) => checks.find((c) => c.id === id)?.status !== "pass");
  if (unmet.length > 0 || !wallet) {
    add({ id: "simulation", label: "Simulation", status: "skipped", detail: `Not run — needs: ${unmet.join(", ")}` });
  } else {
    const res = await buildSwap(
      new Request(`${url.origin}/api/dbc/${poolAddress}/swap`, {
        method: "POST",
        headers: { "content-type": "application/json", ...(request.headers.get("x-forwarded-for") ? { "x-forwarded-for": request.headers.get("x-forwarded-for")! } : {}) },
        body: JSON.stringify({ poolAddress, payerPublicKey: wallet.toBase58(), ...(side === "sell" ? { side: "sell", amountTokens } : { side: "buy", amountUsd }), slippageBps: 100 }),
      }),
      { params: Promise.resolve({ poolAddress }) },
    );
    if (res.ok) {
      add({ id: "simulation", label: "Simulation", status: "pass", detail: `${side === "sell" ? `A sell of ${amountTokens} ${symbol ?? "tokens"}` : `A $${amountUsd} buy`} simulates cleanly on ${cluster}. Nothing was signed or sent.` });
    } else {
      const body = (await res.json().catch(() => null)) as { error?: { message?: string } } | null;
      add({ id: "simulation", label: "Simulation", status: res.status === 503 ? "unavailable" : "fail", detail: body?.error?.message ?? `Simulation failed (${res.status})` });
    }
  }

  return NextResponse.json({ cluster, side, ...(side === "sell" ? { amountTokens } : { amountUsd }), verdict: readinessVerdict(checks), checks });
}
