"use client";

import { useEffect, useState } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { Transaction } from "@solana/web3.js";
import { checkSufficientBalance } from "@elf/market-engine";
import { explorerTxUrl, type ConfirmationProgress } from "@elf/solana";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input, Label } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TradePreview, type QuoteStatus, type TradeQuote } from "@/components/markets/trade-preview";
import { TradeReadiness } from "@/components/markets/trade-readiness";
import { TradeStatusStrip } from "@/components/markets/trade-status-strip";
import { classifyTradeFailure, describeBalance, describeTradeStatus, type TradeFailure, type TradeStatus } from "@/components/markets/trade-state";
import { useWalletBalances } from "@/components/markets/use-wallet-balances";
import { apiFetch } from "@/lib/api-client";
import { interpretConfirmation } from "@/lib/confirmation-view";
import { checkStatusAgain, submitAndConfirm } from "@/lib/submit-transaction";
import { useClusterSigner } from "@/components/providers/use-cluster-signer";
import { NetworkGuardBanner } from "@/components/layout/network-guard-banner";
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
  const { publicKey } = useWallet();
  const clusterSigner = useClusterSigner();

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
  // A submitted transaction whose outcome ELF could not learn. While one exists, no new trade may be started: a second
  // swap would be a duplicate if the first landed. Only a look-up ("Check status again") can resolve it.
  const [unresolved, setUnresolved] = useState<{ signature: string; lastValidBlockHeight: number } | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [progressNote, setProgressNote] = useState<string | null>(null);
  const [checking, setChecking] = useState(false);

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

  const canTrade = Boolean(publicKey) && !clusterSigner.blocked && amountValid && currentQuote !== null && !insufficient && !view.busy && unresolved === null;

  function noteProgress(p: ConfirmationProgress) {
    setProgressNote(
      p.phase === "processed"
        ? "Seen by the network — waiting for confirmation…"
        : p.phase === "rpc_retry"
          ? p.error === "rate_limited"
            ? "The RPC is rate limiting requests — still checking. ELF will not resend."
            : "Having trouble reaching the RPC — still checking. ELF will not resend."
          : null,
    );
  }

  /** The single place a confirmation result becomes UI state. Only the chain's word makes a trade Confirmed or Failed. */
  function applyOutcome(sig: string, lastValidBlockHeight: number, outcome: Parameters<typeof interpretConfirmation>[0]) {
    const result = interpretConfirmation(outcome);
    setProgressNote(null);
    if (result.kind === "confirmed") {
      setUnresolved(null);
      setNotice(null);
      setFailure(null);
      setStatus("confirmed");
      balances.refresh();
      onTradeConfirmed?.();
    } else if (result.kind === "failed") {
      setUnresolved(null);
      setNotice(null);
      setFailure({ kind: result.reason === "expired" ? "expired" : "on_chain_failed", message: result.message, signature: sig });
      setFailedAtStep(2);
      setStatus("failed");
    } else {
      setUnresolved({ signature: sig, lastValidBlockHeight });
      setFailure(null);
      setNotice(result.message);
      setStatus("unconfirmed");
    }
  }

  async function checkAgain() {
    if (!unresolved || checking) return;
    setChecking(true);
    try {
      applyOutcome(unresolved.signature, unresolved.lastValidBlockHeight, await checkStatusAgain(connection, unresolved.signature, unresolved.lastValidBlockHeight, { onProgress: noteProgress }));
    } finally {
      setChecking(false);
    }
  }

  async function trade() {
    if (!publicKey || clusterSigner.blocked || !amountValid || unresolved) return;

    setFailure(null);
    setSignature(null);
    setNetworkFeeSol(null);
    setNotice(null);
    setProgressNote(null);
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
      const signed = await clusterSigner.sign(transaction); // signs for ELF's configured cluster, or refuses on a network mismatch

      failedStep = 2;
      // Sent exactly once; from here on the transaction is only ever looked up by its signature (HTTP polling — the RPC's
      // WebSocket subscriptions are not relied on), bounded by its lastValidBlockHeight and a hard time limit.
      const { signature: sig, outcome } = await submitAndConfirm(connection, signed, {
        lastValidBlockHeight: result.lastValidBlockHeight,
        onSubmitted: (s) => {
          setSignature(s);
          setStatus("submitted");
        },
        onProgress: noteProgress,
      });
      applyOutcome(sig, result.lastValidBlockHeight, outcome);
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

        <NetworkGuardBanner assessment={clusterSigner.assessment} cluster={CLUSTER} walletName={clusterSigner.walletName} canSwitch={clusterSigner.canSwitch} onSwitch={clusterSigner.switchNetwork} />

        <TradeReadiness poolAddress={poolAddress} wallet={publicKey?.toBase58() ?? null} side={side} amount={amountValid ? amount : 0} walletName={clusterSigner.walletName ?? "Wallet"} assessment={clusterSigner.assessment} />

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

        {progressNote && (view.busy || status === "unconfirmed") && <p className="text-[11px] leading-relaxed text-muted-foreground" aria-live="polite">{progressNote}</p>}

        {status === "unconfirmed" && unresolved && (
          <div className="space-y-2.5 rounded-[var(--radius-sm)] border border-warning/30 bg-warning-muted px-3 py-2.5" role="status">
            {notice && <p className="text-xs leading-relaxed text-warning">{notice}</p>}
            <Button type="button" variant="secondary" size="sm" disabled={checking} onClick={checkAgain}>
              {checking ? "Checking…" : "Check status again"}
            </Button>
          </div>
        )}

        {failure && (
          <p className="text-xs leading-relaxed text-negative" role="alert">
            <span className="whitespace-pre-line">{failure.message}</span>
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
  const why = balances.problem === "rate_limited" ? "RPC rate limited" : "RPC temporarily unavailable";
  if (status === "error") return <>Wallet balances unavailable — {why}. This is not a zero balance.</>;

  const primary =
    side === "buy"
      ? describeBalance({ value: balances.quote, accountExists: balances.quoteAccountExists, problem: balances.problem, symbol: quoteToken ?? "quote token" })
      : describeBalance({ value: balances.base, accountExists: balances.baseAccountExists, problem: balances.problem, symbol: tokenSymbol });
  return (
    <>
      Balance: <span className="font-tabular text-foreground">{primary.text}</span>
      {balances.sol !== null && <span> · {balances.sol.toLocaleString("en-US", { maximumFractionDigits: 4 })} SOL for fees</span>}
    </>
  );
}
