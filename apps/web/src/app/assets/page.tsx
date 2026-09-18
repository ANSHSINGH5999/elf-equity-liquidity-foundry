import type { Metadata } from "next";
import { AssetExplorer } from "@/components/markets/asset-explorer";

export const metadata: Metadata = {
  title: "Asset Discovery — Equity Liquidity Foundry",
};

export default function AssetsPage() {
  return <AssetExplorer />;
}
