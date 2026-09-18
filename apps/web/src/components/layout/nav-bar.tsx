"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { WalletButton } from "@/components/layout/wallet-button";
import { cn } from "@/lib/utils";

const LINKS = [
  { href: "/assets", label: "Asset Discovery" },
  { href: "/markets", label: "Markets Telemetry" },
  { href: "/design", label: "Design a Market" },
];

export function NavBar() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-[#05070b]/85 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="group flex items-center gap-3">
          <div className="relative flex h-8 w-8 items-center justify-center rounded-lg border border-amber-500/30 bg-gradient-to-br from-[#1a1506] to-[#0c101a] shadow-[0_0_12px_rgba(201,162,39,0.2)] transition-transform duration-[var(--duration-fast)] group-hover:scale-105">
            <span className="font-mono text-xs font-bold text-gold-light">
              ✦
            </span>
          </div>
          <div className="flex flex-col">
            <span className="font-display text-base font-medium tracking-tight text-white sm:text-lg">
              Equity Liquidity Foundry
            </span>
            <span className="hidden font-mono text-[9px] uppercase tracking-widest text-subtle-foreground sm:inline">
              Meteora DBC Infrastructure
            </span>
          </div>
        </Link>

        <nav className="hidden items-center gap-8 text-xs font-medium sm:flex">
          {LINKS.map((link) => {
            const isActive = pathname?.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "relative py-1 transition-colors duration-[var(--duration-fast)]",
                  isActive ? "text-white" : "text-muted-foreground hover:text-white",
                )}
              >
                {link.label}
                {isActive && (
                  <span className="absolute -bottom-[1px] left-0 right-0 h-[2px] rounded-full bg-gradient-to-r from-amber-400 to-indigo-400 shadow-[0_0_8px_rgba(201,162,39,0.6)]" />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-3">
          <WalletButton />
        </div>
      </div>
    </header>
  );
}
