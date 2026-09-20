import type { Metadata } from "next";
import { LithosLanding } from "@/components/landing/lithos-landing";

export const metadata: Metadata = {
  title: "Equity Liquidity Foundry — Design the Market, Not Just the Token",
  description: "Simulate, deploy and monitor tokenized-equity markets on Solana with Meteora's Dynamic Bonding Curve.",
};

export default function HomePage() {
  return <LithosLanding />;
}
