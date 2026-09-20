import type { Metadata } from "next";
import { SimulationLab } from "@/components/design/simulation-lab";

export const metadata: Metadata = {
  title: "Simulation Lab — Equity Liquidity Foundry",
};

export default async function SimulationLabPage({ searchParams }: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const { curve } = await searchParams;
  return <SimulationLab curveCandidateId={typeof curve === "string" && curve.length <= 64 ? curve : null} />;
}
