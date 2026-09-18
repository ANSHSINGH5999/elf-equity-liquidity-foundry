"use client";

import { useEffect, useState } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { Transaction } from "@solana/web3.js";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input, Label } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { apiFetch, ApiError } from "@/lib/api-client";
import { explorerTxUrl } from "@elf/solana";
import { CLUSTER } from "@/lib/solana-config";
import { formatUsd } from "@/lib/utils";

type TradeSide = "buy" | "sell";
type TradeStatus = "idle" | "preparing" | "awaiting_wallet" | "submitted" | "confirming" | "confirmed" | "error";

interface QuoteResponse {
  side: TradeSide;
  amountUsd: number;
  outputAmount: number;
}

interface SwapResponse {
  transactionBase64: string;
  side: TradeSide;
}

const STATUS_LABEL: Record<TradeStatus, string> = {
  idle: "",
  preparing: "Preparing transaction…",
  awaiting_wallet: "Waiting for wallet…",
  submitted: "Submitted…",
  confirming: "Confirming…",
  confirmed: "Confirmed",
  error: "Failed",
};

function tradeErrorMessage(err: unknown): string {
  if (err instanceof ApiError) {
    switch (err.code) {
      case "simulation_failed":
        return "This trade would fail on-chain, so ELF didn't send it to your wallet. " + err.message;
      case "not_found":
        return "This pool has no live on-chain state to trade against.";
      case "provider_unavailable":
      case "rpc_unavailable":
        return "The Solana RPC endpoint is temporarily unavailable. Try again.";
      default:
        return err.message;
    }
  }
  return err instanceof Error ? err.message : "Trade failed.";
}

/**
 * Buy/sell widget for a live DBC pool — signs and sends a real swap with
 * the connected wallet (POST /api/dbc/:poolAddress/swap builds it, this
 * component only ever signs and submits). No ephemeral accounts, no
 * ownership gate: any wallet can trade a public pool.
 */
export function TradePanel({ poolAddress, onTradeConfirmed }: { poolAddress: string; onTradeConfirmed?: () => void }) {
  const { connection } = useConnection();
  const { publicKey, signTransaction } = useWallet();

  const [side, setSide] = useState<TradeSide>("buy");
  const [amountUsd, setAmountUsd] = useState("100");
  const [quote, setQuote] = useState<QuoteResponse | null>(null);
  const [status, setStatus] = useState<TradeStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const [signature, setSignature] = useState<string | null>(null);

  useEffect(() => {
    const amount = Number(amountUsd);
    if (!Number.isFinite(amount) || amount <= 0) {
      setQuote(null);
      return;
    }
    let cancelled = false;
    const timer = setTimeout(() => {
      apiFetch<QuoteResponse>(`/api/dbc/${poolAddress}/quote?amountUsd=${amount}&side=${side}`)
        .then((res) => !cancelled && setQuote(res))
        .catch(() => !cancelled && setQuote(null));
    }, 350);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [amountUsd, side, poolAddress]);

  async function trade() {
    const amount = Number(amountUsd);
    if (!publicKey || !signTransaction || !Number.isFinite(amount) || amount <= 0) return;

    setError(null);
    setSignature(null);
    setStatus("preparing");
    try {
      const result = await apiFetch<SwapResponse>(`/api/dbc/${poolAddress}/swap`, {
        method: "POST",
        body: JSON.stringify({ payerPublicKey: publicKey.toBase58(), side, amountUsd: amount, slippageBps: 100 }),
      });

      const transaction = Transaction.from(Buffer.from(result.transactionBase64, "base64"));
      setStatus("awaiting_wallet");
      const signed = await signTransaction(transaction);
      setStatus("submitted");
      const sig = await connection.sendRawTransaction(signed.serialize(), { skipPreflight: false });
      setStatus("confirming");
      await connection.confirmTransaction(sig, "confirmed");
      setSignature(sig);
      setStatus("confirmed");
      onTradeConfirmed?.();
    } catch (err) {
      setError(tradeErrorMessage(err));
      setStatus("error");
    }
  }

  return (
    <Card gold={side === "buy"}>
      <CardHeader>
        <CardTitle>Trade</CardTitle>
        <span className="text-[11px] uppercase tracking-wide text-muted-foreground">Live on-chain — real DBC swap</span>
      </CardHeader>
      <CardContent className="space-y-4">
        <Tabs value={side} onValueChange={(v) => setSide(v as TradeSide)}>
          <TabsList className="w-full">
            <TabsTrigger value="buy" className="flex-1">Buy</TabsTrigger>
            <TabsTrigger value="sell" className="flex-1">Sell</TabsTrigger>
          </TabsList>
        </Tabs>

        <div>
          <Label htmlFor="trade-amount">Amount (USD)</Label>
          <Input
            id="trade-amount"
            type="number"
            min="0"
            step="10"
            value={amountUsd}
            onChange={(e) => setAmountUsd(e.target.value)}
          />
        </div>

        <div className="rounded-[var(--radius-sm)] border border-border bg-surface-elevated px-3 py-2 text-xs text-muted-foreground">
          {quote ? (
            <span>
              Estimated: <span className="font-tabular text-foreground">{quote.outputAmount.toLocaleString("en-US", { maximumFractionDigits: 6 })}</span>{" "}
              {side === "buy" ? "tokens" : "quote"} · 1% max slippage
            </span>
          ) : (
            <span>Enter an amount to preview the live quote.</span>
          )}
        </div>

        {!publicKey ? (
          <p className="text-xs text-muted-foreground">Connect a wallet to trade.</p>
        ) : (
          <Button
            variant={side === "buy" ? "gold" : "destructive"}
            className="w-full"
            disabled={status === "preparing" || status === "awaiting_wallet" || status === "submitted" || status === "confirming"}
            onClick={trade}
          >
            {status === "idle" || status === "confirmed" || status === "error" ? `${side === "buy" ? "Buy" : "Sell"} ${formatUsd(Number(amountUsd) || 0)}` : STATUS_LABEL[status]}
          </Button>
        )}

        {error && <p className="text-xs text-negative">{error}</p>}
        {signature && (
          <a href={explorerTxUrl(signature, CLUSTER)} target="_blank" rel="noreferrer" className="block text-xs text-accent-strong hover:underline">
            View confirmed trade on Explorer →
          </a>
        )}
      </CardContent>
    </Card>
  );
}
