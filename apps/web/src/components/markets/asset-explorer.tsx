"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GlowOnHoverCard, FadeInSection } from "@/components/motion/reveal";
import { apiFetch, ApiError } from "@/lib/api-client";
import { formatUsd, truncateAddress } from "@/lib/utils";
import type { TokenizedAsset } from "@elf/shared";

type ProviderTab = "prestocks" | "tessera";

interface ProviderState {
  assets: TokenizedAsset[] | null;
  error: string | null;
}

const PROVIDER_LABEL: Record<ProviderTab, string> = {
  prestocks: "PreStocks",
  tessera: "Tessera",
};

/**
 * A standalone, live-data discovery surface for tokenized pre-IPO assets —
 * distinct from the wizard's asset-selection step (which is optimized for
 * "pick one and move on"). This page is the showcase: browse the real
 * PreStocks catalog (and Tessera, when its notoriously flaky API is
 * cooperating — see docs/architecture.md) before ever starting a launch.
 */
export function AssetExplorer() {
  const [tab, setTab] = useState<ProviderTab>("prestocks");
  const [query, setQuery] = useState("");
  const [state, setState] = useState<Record<ProviderTab, ProviderState>>({
    prestocks: { assets: null, error: null },
    tessera: { assets: null, error: null },
  });

  useEffect(() => {
    if (state[tab].assets !== null || state[tab].error !== null) return;
    let cancelled = false;
    apiFetch<{ assets: TokenizedAsset[] }>(`/api/providers/${tab}/assets`)
      .then((res) => {
        if (!cancelled) setState((prev) => ({ ...prev, [tab]: { assets: res.assets, error: null } }));
      })
      .catch((err) => {
        if (cancelled) return;
        const message = err instanceof ApiError ? err.message : `${PROVIDER_LABEL[tab]} is unavailable.`;
        setState((prev) => ({ ...prev, [tab]: { assets: null, error: message } }));
      });
    return () => {
      cancelled = true;
    };
  }, [tab, state]);

  const current = state[tab];
  const filtered = (current.assets ?? []).filter(
    (a) => a.name.toLowerCase().includes(query.toLowerCase()) || a.symbol.toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
      <FadeInSection>
        <h1 className="font-display text-3xl text-foreground">Asset discovery</h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          Live tokenized pre-IPO catalogs, pulled directly from each provider&rsquo;s public API — not a cached snapshot.
          Pick an asset to see it, then design its market.
        </p>
      </FadeInSection>

      <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
        <Tabs value={tab} onValueChange={(v) => setTab(v as ProviderTab)}>
          <TabsList>
            <TabsTrigger value="prestocks">PreStocks</TabsTrigger>
            <TabsTrigger value="tessera">Tessera</TabsTrigger>
          </TabsList>
        </Tabs>
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by name or symbol…"
          className="max-w-xs"
        />
      </div>

      <div className="mt-6">
        <Tabs value={tab}>
          {(["prestocks", "tessera"] as const).map((provider) => (
            <TabsContent key={provider} value={provider}>
              {state[provider].error && (
                <div className="rounded-[var(--radius-sm)] border border-warning/30 bg-warning-muted p-4 text-sm text-warning">
                  {PROVIDER_LABEL[provider]} is temporarily unavailable: {state[provider].error}
                  {provider === "tessera" && (
                    <span className="mt-1 block text-xs text-muted-foreground">
                      Documented, not hidden — see &ldquo;Known limitations&rdquo; in the README.
                    </span>
                  )}
                </div>
              )}
              {state[provider].assets === null && !state[provider].error && (
                <p className="text-sm text-muted-foreground">Loading live {PROVIDER_LABEL[provider]} listings…</p>
              )}
              {state[provider].assets !== null && filtered.length === 0 && !state[provider].error && (
                <p className="text-sm text-muted-foreground">No matching assets.</p>
              )}
              {tab === provider && filtered.length > 0 && (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {filtered.map((asset) => (
                    <GlowOnHoverCard key={asset.id}>
                      <Card className="h-full">
                        <CardContent className="flex h-full flex-col justify-between gap-3 py-5">
                          <div>
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-sm font-medium text-foreground">{asset.name}</span>
                              <Badge variant="accent">{asset.symbol}</Badge>
                            </div>
                            <p className="mt-1 text-xs text-muted-foreground">{asset.issuer}</p>
                            <p className="mt-1 font-tabular text-[11px] text-muted-foreground/70">{truncateAddress(asset.mintAddress)}</p>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="font-tabular text-lg text-foreground">{formatUsd(asset.referencePriceUsd)}</span>
                            <Link href={provider === "prestocks" ? `/design?asset=${encodeURIComponent(asset.mintAddress)}` : "/design"} className="text-xs font-medium text-accent-strong hover:underline">
                              Design a market →
                            </Link>
                          </div>
                        </CardContent>
                      </Card>
                    </GlowOnHoverCard>
                  ))}
                </div>
              )}
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  );
}
