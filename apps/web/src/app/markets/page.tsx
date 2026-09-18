import type { Metadata } from "next";
import { MarketList } from "@/components/markets/market-list";

export const metadata: Metadata = {
  title: "Live Markets — Equity Liquidity Foundry",
};

export default function MarketsPage() {
  return <MarketList />;
}
