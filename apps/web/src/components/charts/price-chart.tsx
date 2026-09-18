"use client";

import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { formatUsd } from "@/lib/utils";

export interface PricePoint {
  timestamp: string;
  priceUsd: number;
}

export function PriceChart({ data }: { data: PricePoint[] }) {
  if (data.length < 2) {
    return (
      <div className="flex h-56 items-center justify-center text-sm text-muted-foreground">
        Not enough history yet — check back after a few trades.
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={220}>
      <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="priceFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#6366f1" stopOpacity={0.25} />
            <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
          </linearGradient>
        </defs>
        <XAxis
          dataKey="timestamp"
          tickFormatter={(v: string) => new Date(v).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          stroke="#64748b"
          fontSize={11}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          stroke="#64748b"
          fontSize={11}
          tickLine={false}
          axisLine={false}
          tickFormatter={(v: number) => formatUsd(v, { compact: true })}
          width={64}
        />
        <Tooltip
          contentStyle={{
            background: "#0c101a",
            border: "1px solid rgba(255,255,255,0.12)",
            borderRadius: 10,
            fontSize: 12,
            color: "#f5f7fa",
            boxShadow: "0 10px 25px rgba(0,0,0,0.5)",
          }}
          labelFormatter={(v: string) => new Date(v).toLocaleString()}
          formatter={(value: number) => [formatUsd(value), "Price"]}
        />
        <Area type="monotone" dataKey="priceUsd" stroke="#818cf8" fill="url(#priceFill)" strokeWidth={2} />
      </AreaChart>
    </ResponsiveContainer>
  );
}
