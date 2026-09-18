"use client";

import { useEffect, useState } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { Transaction } from "@solana/web3.js";
import { checkSufficientBalance } from "@elf/market-engine";
import { explorerTxUrl } from "@elf/solana";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input, Label } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TradePreview, type QuoteStatus, type TradeQuote } from "@/components/markets/trade-preview";
import { TradeStatusStrip } from "@/components/markets/trade-status-strip";
import { TradeOnChainFailure, classifyTradeFailure, describeTradeStatus, type TradeFailure, type TradeStatus } from "@/components/markets/trade-state";
import { useWalletBalances } from "@/components/markets/use-wallet-balances";
import { apiFetch } from "@/lib/api-client";
import { CLUSTER } from "@/lib/solana-config";

type TradeSide = "buy" | "sell";

interface SwapResponse {
  transactionBase64: string;
  lastValidBlockHeight: number;
  side: TradeSide;
}

interface PoolInfo {
  baseMint: string;
  quoteMint: string;
}

const SLIPPAGE_OPTIONS_BPS = [50, 100, 200] as const;

/**
 * Trading terminal for a live DBC pool. Reuses the existing swap flow
 * unchanged: POST /api/dbc/:pool/swap builds AND simulates the transaction
 * server-side, the connected wallet signs it client-side, and it is sent
 * and confirmed here. No key ever leaves the wallet; nothing is shown as
 * confirmed until the cluster confirms it with no on-chain error.
 */
export function TradePanel({
  poolAddress,
  tokenSymbol = "tokens",
  onTradeConfirmed,
}: {
  poolAddress: string;
  tokenSymbol?: string;
  onTradeConfirmed?: () => void;
}) {
  const { connection } = useConnection();
  const { publicKey, signTransaction } = useWallet();

  const [side, setSide] = useState<TradeSide>("buy");
  const [amounts, setAmounts] = useState<Record<TradeSide, string>>({ buy: "100", sell: "" });
  const [slippageBps, setSlippageBps] = useState<number>(100);

  const [pool, setPool] = useState<PoolInfo | null>(null);
  const [quote, setQuote] = useState<{ key: string; data: TradeQuote } | null>(null);
  const [quoteFailedKey, setQuoteFailedKey] = useState<string | null>(null);

  const [status, setStatus] = useState<TradeStatus>("idle");
  const [failedAtStep, setFailedAtStep] = useState(0);
  const [failure, setFailure] = useState<TradeFailure | null>(null);
  const [signature, setSignature] = useState<string | null>(null);
  const [networkFeeSol, setNetworkFeeSol] = useState<number | null>(null);

  const balances = useWalletBalances(pool?.baseMint ?? null, pool?.quoteMint ?? null);

  const amountText = amounts[side];
  const amount = Number(amountText);
  const amountValid = amountText.trim() !== "" && Number.isFinite(amount) && amount > 0;
  const quoteKey = `${side}|${amountText}`;

  useEffect(() => {
    let cancelled = false;
    apiFetch<{ pool: PoolInfo }>(`/api/dbc/${poolAddress}`)
      .then((res) => !cancelled && setPool({ baseMint: res.pool.baseMint, quoteMint: res.pool.quoteMint }))
      .catch(() => undefined); // Balances simply stay unavailable; trading itself does not depend on this.
    return () => {
      cancelled = true;
    };
  }, [poolAddress]);

  useEffect(() => {
    if (!amountValid) return;
    let cancelled = false;
    // Every setState below runs from the debounce timer / promise callbacks,
    // never synchronously in the effect body.
    const timer = setTimeout(() => {
      const param = side === "buy" ? `amountUsd=${amount}` : `amountTokens=${amount}`;
      apiFetch<TradeQuote>(`/api/dbc/${poolAddress}/quote?side=${side}&${param}`)
        .then((data) => {
          if (cancelled) return;
          setQuote({ key: quoteKey, data });
          setQuoteFailedKey(null);
        })
        .catch(() => !cancelled && setQuoteFailedKey(quoteKey));
    }, 350);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [poolAddress, side, amount, amountValid, quoteKey]);

  const quoteStatus: QuoteStatus = !amountValid
    ? "idle"
    : quote?.key === quoteKey
      ? "ready"
      : quoteFailedKey === quoteKey
        ? "error"
        : "loading";
  const currentQuote = quote?.key === quoteKey ? quote.data : null;

  const view = describeTradeStatus(status, currentQuote !== null, failedAtStep);

  const requiredBalance = currentQuote ? currentQuote.inputAmount : null;
  const balanceForInput = side === "buy" ? balances.quote : balances.base;
  const balanceCheck = requiredBalance === null ? null : checkSufficientBalance(balanceForInput, requiredBalance);
  const insufficient = balanceCheck?.state === "insufficient";
  const inputSymbol = side === "buy" ? (currentQuote?.quoteToken ?? "quote token") : tokenSymbol;

  const canTrade = Boolean(publicKey && signTransaction) && amountValid && currentQuote !== null && !insufficient && !view.busy;

  async function trade() {
    if (!publicKey || !signTransaction || !amountValid) return;

    setFailure(null);
    setSignature(null);
    setNetworkFeeSol(null);
    let failedStep = 1;
    setStatus("building");

    try {
      const result = await apiFetch<SwapResponse>(`/api/dbc/${poolAddress}/swap`, {
        method: "POST",
        body: JSON.stringify({
          payerPublicKey: publicKey.toBase58(),
          side,
          ...(side === "buy" ? { amountUsd: amount } : { amountTokens: amount }),
          slippageBps,
        }),
      });

      const transaction = Transaction.from(Buffer.from(result.transactionBase64, "base64"));
      try {
        const fee = await connection.getFeeForMessage(transaction.compileMessage(), "confirmed");
        if (fee.value !== null) setNetworkFeeSol(fee.value / 1_000_000_000);
      } catch {
        // The fee estimate is informational; never block a trade on it.
      }

      setStatus("signing");
      const signed = await signTransaction(transaction);

      failedStep = 2;
      const sig = await connection.sendRawTransaction(signed.serialize(), { skipPreflight: false });
      setSignature(sig);
      setStatus("submitted");

      const confirmation = await connection.confirmTransaction(
        { signature: sig, blockhash: transaction.recentBlockhash!, lastValidBlockHeight: result.lastValidBlockHeight },
        "confirmed",
      );
      // confirmTransaction resolves (does not throw) for a transaction that landed but FAILED.
      if (confirmation.value.err) throw new TradeOnChainFailure(sig, confirmation.value.err);

      setStatus("confirmed");
      balances.refresh();
      onTradeConfirmed?.();
    } catch (err) {
      const classified = classifyTradeFailure(err);
      setFailure(classified);
      if (classified.signature) setSignature(classified.signature);
      setFailedAtStep(failedStep);
      setStatus("failed");
    }
  }

  const buttonLabel = view.busy ? view.label : `${side === "buy" ? "Buy" : "Sell"} ${tokenSymbol}`;

  return (
    <Card gold={side === "buy"}>
      <CardHeader>
        <CardTitle>Trade</CardTitle>
        <span className="text-[11px] uppercase tracking-wide text-muted-foreground">Live on-chain — real DBC swap</span>
      </CardHeader>
      <CardContent className="space-y-4">
        <Tabs value={side} onValueChange={(v) => !view.busy && setSide(v as TradeSide)}>
          <TabsList className="w-full">
            <TabsTrigger value="buy" className="flex-1">Buy</TabsTrigger>
            <TabsTrigger value="sell" className="flex-1">Sell</TabsTrigger>
          </TabsList>
        </Tabs>

        <div>
          <div className="flex items-baseline justify-between">
            <Label htmlFor="trade-amount">{side === "buy" ? "Amount to spend (USD)" : `Amount to sell (${tokenSymbol})`}</Label>
            {side === "sell" && balances.base !== null && balances.base > 0 && (
              <button
                type="button"
                className="text-[11px] text-accent-strong hover:underline disabled:opacity-40"
                disabled={view.busy}
                onClick={() => setAmounts((a) => ({ ...a, sell: String(balances.base) }))}
              >
                Max
              </button>
            )}
          </div>
          <Input
            id="trade-amount"
            type="number"
            inputMode="decimal"
            min="0"
            step={side === "buy" ? "10" : "any"}
            value={amountText}
            disabled={view.busy}
            onChange={(e) => setAmounts((a) => ({ ...a, [side]: e.target.value }))}
            aria-describedby="trade-balance"
          />
          <p id="trade-balance" className="mt-1.5 text-[11px] text-muted-foreground">
            <BalanceLine status={balances.status} side={side} balances={balances} quoteToken={currentQuote?.quoteToken} tokenSymbol={tokenSymbol} />
          </p>
        </div>

        <fieldset>
          <legend className="mb-1.5 text-xs font-medium text-muted-foreground">Slippage tolerance</legend>
          <div className="flex gap-1.5">
            {SLIPPAGE_OPTIONS_BPS.map((bps) => (
              <button
                key={bps}
                type="button"
                aria-pressed={slippageBps === bps}
                disabled={view.busy}
                onClick={() => setSlippageBps(bps)}
                className={`flex-1 rounded-[var(--radius-sm)] border px-2 py-1.5 text-xs font-tabular transition-colors disabled:opacity-40 ${
                  slippageBps === bps ? "border-accent/60 bg-accent-muted text-accent-strong" : "border-border-strong text-muted-foreground hover:text-foreground"
                }`}
              >
                {bps / 100}%
              </button>
            ))}
          </div>
        </fieldset>

        <TradePreview quote={currentQuote} quoteStatus={quoteStatus} tokenSymbol={tokenSymbol} slippageBps={slippageBps} networkFeeSol={networkFeeSol} />

        {insufficient && balanceCheck?.state === "insufficient" && (
          <p className="text-xs text-negative" role="alert">
            Insufficient balance — you are short by {balanceCheck.shortfall.toLocaleString("en-US", { maximumFractionDigits: 6 })} {inputSymbol}.
          </p>
        )}

        {!publicKey ? (
          <p className="rounded-[var(--radius-sm)] border border-border bg-surface-elevated px-3 py-2.5 text-xs text-muted-foreground">
            Connect a wallet to trade. Quotes above are live and public; nothing is signed or sent until you approve in your wallet.
          </p>
        ) : (
          <Button
            variant={side === "buy" ? "gold" : "destructive"}
            className="w-full"
            disabled={!canTrade}
            onClick={trade}
            aria-busy={view.busy}
          >
            {buttonLabel}
          </Button>
        )}

        <TradeStatusStrip view={view} />

        {failure && (
          <p className="text-xs leading-relaxed text-negative" role="alert">
            {failure.message}
          </p>
        )}
        {signature && (
          <a href={explorerTxUrl(signature, CLUSTER)} target="_blank" rel="noreferrer" className="block text-xs text-accent-strong hover:underline">
            {status === "confirmed" ? "View confirmed transaction" : status === "failed" ? "View failed transaction" : "View submitted transaction"} on Solana Explorer →
          </a>
        )}
      </CardContent>
    </Card>
  );
}

function BalanceLine({
  status,
  side,
  balances,
  quoteToken,
  tokenSymbol,
}: {
  status: ReturnType<typeof useWalletBalances>["status"];
  side: TradeSide;
  balances: ReturnType<typeof useWalletBalances>;
  quoteToken: string | undefined;
  tokenSymbol: string;
}) {
  if (status === "disconnected") return <>Wallet not connected — balances unavailable.</>;
  if (status === "loading") return <>Reading wallet balances…</>;
  if (status === "error") return <>Wallet balances unavailable (RPC read failed).</>;

  const fmt = (n: number | null, symbol: string) => (n === null ? `${symbol} balance unavailable` : `${n.toLocaleString("en-US", { maximumFractionDigits: 6 })} ${symbol}`);
  const primary = side === "buy" ? fmt(balances.quote, quoteToken ?? "quote token") : fmt(balances.base, tokenSymbol);
  return (
    <>
      Balance: <span className="font-tabular text-foreground">{primary}</span>
      {balances.sol !== null && <span> · {balances.sol.toLocaleString("en-US", { maximumFractionDigits: 4 })} SOL for fees</span>}
    </>
  );
}
