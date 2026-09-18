import type { Metadata } from "next";
import { IssuerDashboard } from "@/components/markets/issuer-dashboard";

export const metadata: Metadata = {
  title: "Issuer Analytics — Equity Liquidity Foundry",
};

export default async function IssuerAnalyticsPage({ params }: { params: Promise<{ marketId: string }> }) {
  const { marketId } = await params;
  return <IssuerDashboard marketId={marketId} />;
}
