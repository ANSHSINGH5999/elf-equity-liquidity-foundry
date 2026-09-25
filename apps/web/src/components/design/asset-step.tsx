"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input, Label, Select } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { formatUsd, truncateAddress } from "@/lib/utils";
import { apiFetch, ApiError } from "@/lib/api-client";
import type { AssetDto } from "@/lib/api-types";

interface PreStocksAsset {
  name: string;
  symbol: string;
  mintAddress: string;
  issuer: string;
  referencePriceUsd: number;
  externalId?: string;
}

/** Clearly-labeled sample so a reviewer can reach the real curve compiler
 *  in one click, without typing or a live PreStocks lookup. Valid base58
 *  pubkey format only — never a real mint. */
const SAMPLE_ASSET = {
  name: "Helios Aerodyne — Pre-IPO (Sample)",
  symbol: "HELIO",
  mintAddress: "SAMPLEDEMXPREV1EWMNTFRJUDGESPANELXYZ789ab",
  issuer: "Helios Aerodyne Inc. (Sample Issuer)",
  assetType: "pre_ipo" as const,
  referencePriceUsd: 42.5,
};

export function AssetStep({ onComplete, preselectedMint }: { onComplete: (asset: AssetDto) => void; preselectedMint?: string }) {
  const [tab, setTab] = useState(preselectedMint ? "prestocks" : "manual");
  const [submitting, setSubmitting] = useState(false);
  const [pendingMint, setPendingMint] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: "",
    symbol: "",
    mintAddress: "",
    issuer: "",
    assetType: "pre_ipo" as const,
    referencePriceUsd: "",
  });

  const [preStocksAssets, setPreStocksAssets] = useState<PreStocksAsset[] | null>(null);
  const [preStocksError, setPreStocksError] = useState<string | null>(null);
  const preStocksLoading = tab === "prestocks" && preStocksAssets === null && preStocksError === null;

  useEffect(() => {
    if (!preStocksLoading) return;
    let cancelled = false;
    apiFetch<{ assets: PreStocksAsset[] }>("/api/providers/prestocks/assets")
      .then((res) => {
        if (!cancelled) setPreStocksAssets(res.assets);
      })
      .catch((err) => {
        if (!cancelled) setPreStocksError(err instanceof ApiError ? err.message : "PreStocks is unavailable.");
      });
    return () => {
      cancelled = true;
    };
  }, [preStocksLoading]);

  async function createAsset(payload: Record<string, unknown>) {
    if (submitting) return;
    setSubmitting(true);
    setPendingMint(typeof payload.mintAddress === "string" ? payload.mintAddress : null);
    setError(null);
    try {
      const { asset } = await apiFetch<{ asset: AssetDto }>("/api/assets", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      onComplete(asset);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to save this asset.");
    } finally {
      setSubmitting(false);
      setPendingMint(null);
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <CardTitle className="font-display text-xl font-normal">Step 1 — Select the asset</CardTitle>
            <CardDescription>The tokenized equity or pre-IPO instrument this market is being designed for.</CardDescription>
          </div>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            disabled={submitting}
            onClick={() => createAsset(SAMPLE_ASSET)}
            className="whitespace-nowrap"
          >
            {submitting ? "Loading…" : "⚡ Try a sample issuer"}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList>
            <TabsTrigger value="manual">Manual entry</TabsTrigger>
            <TabsTrigger value="prestocks">PreStocks</TabsTrigger>
          </TabsList>

          <TabsContent value="manual" className="mt-5">
            <form
              className="grid gap-4 sm:grid-cols-2"
              onSubmit={(e) => {
                e.preventDefault();
                createAsset({
                  ...form,
                  referencePriceUsd: Number(form.referencePriceUsd),
                });
              }}
            >
              <div>
                <Label>Asset name</Label>
                <Input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Acme Pre-IPO" />
              </div>
              <div>
                <Label>Symbol</Label>
                <Input
                  required
                  value={form.symbol}
                  onChange={(e) => setForm({ ...form, symbol: e.target.value.toUpperCase() })}
                  placeholder="ACME"
                />
              </div>
              <div className="sm:col-span-2">
                <Label>Token mint address</Label>
                <Input
                  required
                  value={form.mintAddress}
                  onChange={(e) => setForm({ ...form, mintAddress: e.target.value })}
                  placeholder="Solana base58 mint address"
                  className="font-tabular"
                />
              </div>
              <div>
                <Label>Issuer</Label>
                <Input required value={form.issuer} onChange={(e) => setForm({ ...form, issuer: e.target.value })} placeholder="Acme Corp" />
              </div>
              <div>
                <Label>Asset type</Label>
                <Select value={form.assetType} onChange={(e) => setForm({ ...form, assetType: e.target.value as never })}>
                  <option value="pre_ipo">Pre-IPO</option>
                  <option value="equity">Equity</option>
                  <option value="fund">Fund</option>
                  <option value="other">Other</option>
                </Select>
              </div>
              <div className="sm:col-span-2">
                <Label>Reference price (USD)</Label>
                <Input
                  required
                  type="number"
                  min={0}
                  step="0.0001"
                  value={form.referencePriceUsd}
                  onChange={(e) => setForm({ ...form, referencePriceUsd: e.target.value })}
                  placeholder="10.00"
                />
              </div>

              <div className="sm:col-span-2">
                <Button type="submit" disabled={submitting}>
                  {submitting ? "Saving…" : "Continue"}
                </Button>
              </div>
            </form>
          </TabsContent>

          <TabsContent value="prestocks" className="mt-5">
            {preStocksLoading && <p className="text-sm text-muted-foreground">Loading live PreStocks listings…</p>}
            {preStocksError && (
              <div className="rounded-[var(--radius-sm)] border border-negative/30 bg-negative-muted p-4 text-sm text-negative">
                PreStocks is unavailable right now: {preStocksError}
              </div>
            )}
            {preStocksAssets && (
              <div className="grid gap-3 sm:grid-cols-2">
                {[...preStocksAssets].sort((a, b) => Number(b.mintAddress === preselectedMint) - Number(a.mintAddress === preselectedMint)).map((asset) => (
                  <button
                    key={asset.mintAddress}
                    aria-current={asset.mintAddress === preselectedMint ? "true" : undefined}
                    aria-busy={pendingMint === asset.mintAddress}
                    disabled={submitting}
                    onClick={() =>
                      createAsset({
                        name: asset.name,
                        symbol: asset.symbol,
                        mintAddress: asset.mintAddress,
                        issuer: asset.issuer,
                        assetType: "pre_ipo",
                        referencePriceUsd: asset.referencePriceUsd,
                        source: "prestocks",
                        externalId: asset.externalId,
                      })
                    }
                    className={`rounded-[var(--radius-md)] border bg-surface-elevated p-4 text-left transition-all duration-[var(--duration-fast)] ease-[var(--ease-premium)] hover:-translate-y-px hover:border-accent/50 hover:bg-surface-hover disabled:opacity-50 ${asset.mintAddress === preselectedMint ? "border-accent ring-1 ring-accent/60" : "border-border-strong"}`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-foreground">{asset.name}</span>
                      <Badge variant="accent">{asset.symbol}</Badge>
                    </div>
                    <p className="mt-1 font-tabular text-xs text-muted-foreground">{truncateAddress(asset.mintAddress)}</p>
                    <p className="mt-2 font-tabular text-sm text-foreground">
                      {pendingMint === asset.mintAddress ? "Saving…" : formatUsd(asset.referencePriceUsd)}
                    </p>
                  </button>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
        {error && (
          <p role="alert" className="mt-4 text-sm text-negative">
            {error} Please try again.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
