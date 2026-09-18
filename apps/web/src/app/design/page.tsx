import type { Metadata } from "next";
import { DesignWizard } from "@/components/design/wizard";

export const metadata: Metadata = {
  title: "Design a Market — Equity Liquidity Foundry",
};

export default function DesignPage() {
  return <DesignWizard />;
}
