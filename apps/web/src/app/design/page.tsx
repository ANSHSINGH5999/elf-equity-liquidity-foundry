import type { Metadata } from "next";
import Link from "next/link";
import { DesignWizard } from "@/components/design/wizard";

export const metadata: Metadata = {
  title: "Design a Market — Equity Liquidity Foundry",
};

export default async function DesignPage({ searchParams }: { searchParams: Promise<{ asset?: string | string[] }> }) {
  const { asset } = await searchParams;
  const preselectedMint = typeof asset === "string" ? asset : undefined;

  return (
    <>
      <div className="mx-auto max-w-4xl px-4 pt-8 sm:px-6">
        <Link href="/design/copilot" className="text-xs font-medium text-accent-strong hover:underline">
          Prefer a guided plan with simulation and validation checks? Try the Market Launch Copilot →
        </Link>
      </div>
      <DesignWizard preselectedMint={preselectedMint} />
    </>
  );
}
