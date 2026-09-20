"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BrandMark } from "@/components/layout/brand-mark";
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
    <header data-site-chrome className="sticky top-0 z-40 border-b border-[rgba(196,214,232,0.12)] bg-[#02060f]/55 backdrop-blur-xl">
      <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between gap-6 px-4 sm:px-6 lg:px-10">
        <Link href="/" className="group flex items-center gap-[7px] text-white">
          <BrandMark className="h-[17px] w-[23px]" />
          <span className="text-[19px] tracking-[0.2em] [font-variation-settings:'wght'_531]">ELF</span>
        </Link>

        <nav className="hidden items-center gap-10 text-[13.5px] [font-variation-settings:'wght'_506] md:flex">
          {LINKS.map((link) => {
            const isActive = pathname?.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "relative py-1 tracking-[-0.01em] transition-colors duration-[var(--duration-fast)]",
                  isActive ? "text-white" : "text-[#fbfdff]/70 hover:text-white",
                )}
              >
                {link.label}
                {isActive && <span className="absolute -bottom-[3px] left-0 right-0 h-px bg-[rgba(214,232,250,0.9)]" />}
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
