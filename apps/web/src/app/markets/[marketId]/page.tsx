import { MarketDetail } from "@/components/markets/market-detail";

export default async function MarketDetailPage({ params }: { params: Promise<{ marketId: string }> }) {
  const { marketId } = await params;
  return <MarketDetail marketId={marketId} />;
}
