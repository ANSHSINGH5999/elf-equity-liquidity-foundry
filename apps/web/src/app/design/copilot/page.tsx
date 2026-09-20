import type { Metadata } from "next";
import { LaunchCopilot } from "@/components/design/launch-copilot";

export const metadata: Metadata = {
  title: "Market Launch Copilot — Equity Liquidity Foundry",
};

export default function LaunchCopilotPage() {
  return <LaunchCopilot />;
}
