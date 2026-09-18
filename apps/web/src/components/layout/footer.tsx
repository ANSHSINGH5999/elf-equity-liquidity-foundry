import Link from "next/link";

export function Footer() {
  return (
    <footer className="relative border-t border-white/10 bg-[#05070b]/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-12 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-2">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_#22c55e]" />
            <span className="font-semibold text-white">Equity Liquidity Foundry (ELF)</span>
            <span className="text-subtle-foreground">·</span>
            <span>Solana × Meteora Dynamic Bonding Curve</span>
          </div>
          <p className="text-[11px] text-subtle-foreground">
            Non-custodial market architecture for tokenized equities &amp; pre-IPO assets. Not investment advice.
          </p>
        </div>

        <div className="flex items-center gap-6 text-[11px] text-subtle-foreground">
          <Link href="/assets" className="transition-colors hover:text-white">
            Discover
          </Link>
          <Link href="/markets" className="transition-colors hover:text-white">
            Markets
          </Link>
          <Link href="/design" className="transition-colors hover:text-white">
            Design
          </Link>
          <a
            href="https://github.com/meteora-ag"
            target="_blank"
            rel="noreferrer"
            className="transition-colors hover:text-white"
          >
            Meteora SDK
          </a>
          <a
            href="https://solana.com"
            target="_blank"
            rel="noreferrer"
            className="transition-colors hover:text-white"
          >
            Solana Devnet
          </a>
        </div>
      </div>
    </footer>
  );
}
