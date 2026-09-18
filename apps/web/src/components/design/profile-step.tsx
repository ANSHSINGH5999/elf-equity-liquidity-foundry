"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input, Label, Select } from "@/components/ui/input";
import { apiFetch, ApiError } from "@/lib/api-client";
import type { AssetDto, CurveConfigDto, MarketProfileDto } from "@/lib/api-types";

export function ProfileStep({
  asset,
  onComplete,
}: {
  asset: AssetDto;
  onComplete: (marketProfile: MarketProfileDto, curveConfigs: CurveConfigDto[]) => void;
}) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    initialLiquidityUsd: "250000",
    expectedVolatility: "medium" as "low" | "medium" | "high",
    riskProfile: "balanced" as "conservative" | "balanced" | "growth",
    targetLiquidityUsd: "500000",
    targetGraduationUsd: "1000000",
    quoteToken: "USDC" as "SOL" | "USDC",
  });

  async function submit() {
    setSubmitting(true);
    setError(null);
    try {
      const { marketProfile, curveConfigs } = await apiFetch<{ marketProfile: MarketProfileDto; curveConfigs: CurveConfigDto[] }>(
        "/api/markets/design",
        {
          method: "POST",
          body: JSON.stringify({
            assetId: asset.id,
            marketProfile: {
              initialLiquidityUsd: Number(form.initialLiquidityUsd),
              expectedVolatility: form.expectedVolatility,
              riskProfile: form.riskProfile,
              targetLiquidityUsd: Number(form.targetLiquidityUsd),
              targetGraduationUsd: Number(form.targetGraduationUsd),
              quoteToken: form.quoteToken,
            },
          }),
        },
      );
      onComplete(marketProfile, curveConfigs);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to generate configurations.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle className="font-display text-xl font-normal">Step 2 — Market profile</CardTitle>
          <CardDescription>
            Declare the objectives for {asset.name} ({asset.symbol}). ELF&rsquo;s curve compiler uses this brief to generate three
            candidate configurations.
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <form
          className="grid gap-4 sm:grid-cols-2"
          onSubmit={(e) => {
            e.preventDefault();
            submit();
          }}
        >
          <div>
            <Label>Initial liquidity (USD)</Label>
            <Input
              type="number"
              min={1000}
              required
              value={form.initialLiquidityUsd}
              onChange={(e) => setForm({ ...form, initialLiquidityUsd: e.target.value })}
            />
          </div>
          <div>
            <Label>Expected volatility</Label>
            <Select value={form.expectedVolatility} onChange={(e) => setForm({ ...form, expectedVolatility: e.target.value as never })}>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </Select>
          </div>
          <div>
            <Label>Risk profile</Label>
            <Select value={form.riskProfile} onChange={(e) => setForm({ ...form, riskProfile: e.target.value as never })}>
              <option value="conservative">Conservative</option>
              <option value="balanced">Balanced</option>
              <option value="growth">Growth</option>
            </Select>
          </div>
          <div>
            <Label>Quote token</Label>
            <Select value={form.quoteToken} onChange={(e) => setForm({ ...form, quoteToken: e.target.value as never })}>
              <option value="USDC">USDC</option>
              <option value="SOL">SOL</option>
            </Select>
          </div>
          <div>
            <Label>Target liquidity (USD)</Label>
            <Input
              type="number"
              min={1000}
              required
              value={form.targetLiquidityUsd}
              onChange={(e) => setForm({ ...form, targetLiquidityUsd: e.target.value })}
            />
          </div>
          <div>
            <Label>Target graduation (USD)</Label>
            <Input
              type="number"
              min={1000}
              required
              value={form.targetGraduationUsd}
              onChange={(e) => setForm({ ...form, targetGraduationUsd: e.target.value })}
            />
          </div>

          {error && <p className="sm:col-span-2 text-sm text-negative">{error}</p>}

          <div className="sm:col-span-2">
            <Button type="submit" disabled={submitting}>
              {submitting ? "Compiling configurations…" : "Generate configuration"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
