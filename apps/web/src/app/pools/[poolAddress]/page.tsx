import { PoolDashboard } from "@/components/markets/pool-dashboard";

export default async function PoolPage({ params }: { params: Promise<{ poolAddress: string }> }) {
  const { poolAddress } = await params;
  return <PoolDashboard poolAddress={poolAddress} />;
}
