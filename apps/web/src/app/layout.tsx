import type { Metadata } from "next";
import { Inter, IBM_Plex_Mono, Instrument_Serif } from "next/font/google";
import { WalletProvider } from "@/components/providers/wallet-provider";
import { NavBar } from "@/components/layout/nav-bar";
import { Footer } from "@/components/layout/footer";
import { Scene3D } from "@/components/motion/scene-3d";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const plexMono = IBM_Plex_Mono({
  variable: "--font-mono-terminal",
  subsets: ["latin"],
  weight: ["400", "500"],
});

const instrumentSerif = Instrument_Serif({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400"],
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: "Equity Liquidity Foundry — Tokenized Equity Market Infrastructure",
  description: "Design, simulate, and monitor equity-native liquidity markets on Solana with Meteora Dynamic Bonding Curve.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${plexMono.variable} ${instrumentSerif.variable} dark h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-[#090a12] text-[#f3f6fc]">
        <Scene3D />
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
