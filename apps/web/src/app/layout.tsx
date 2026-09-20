import type { Metadata } from "next";
import { WalletProvider } from "@/components/providers/wallet-provider";
import { NavBar } from "@/components/layout/nav-bar";
import { Footer } from "@/components/layout/footer";
import { SiteBackdrop } from "@/components/layout/site-backdrop";
import "./globals.css";

export const metadata: Metadata = {
  title: "Equity Liquidity Foundry — Tokenized Equity Market Infrastructure",
  description: "Design, simulate, and monitor equity-native liquidity markets on Solana with Meteora Dynamic Bonding Curve.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark h-full antialiased">
      <body suppressHydrationWarning className="min-h-full flex flex-col bg-[#02060f] text-[#f4f8fd]">
        <SiteBackdrop />
        <WalletProvider>
          <div className="relative z-10 flex min-h-screen flex-col">
            <NavBar />
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
        </WalletProvider>
      </body>
    </html>
  );
}
