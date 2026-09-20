import Link from "next/link";

export function Footer() {
  return (
    <footer className="relative border-t border-[rgba(196,214,232,0.12)] bg-[#02060f]/60 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-10 text-[13px] text-[#f4f8fd] sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-10">
        <div className="flex flex-col gap-1.5">
          <p className="[font-variation-settings:'wght'_521]">Equity Liquidity Foundry (ELF) · Solana × Meteora Dynamic Bonding Curve</p>
          <p className="text-[12px] text-[#a2a9b8]">Non-custodial market architecture for tokenized equities &amp; pre-IPO assets. Devnet demo. Not investment advice.</p>
        </div>

        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-[12px] text-[#a2a9b8]">
          <Link href="/assets" className="transition-colors hover:text-white">
            Discover
          </Link>
          <Link href="/markets" className="transition-colors hover:text-white">
            Markets
          </Link>
          <Link href="/design" className="transition-colors hover:text-white">
            Design
          </Link>
          <a href="https://github.com/meteora-ag" target="_blank" rel="noreferrer" className="transition-colors hover:text-white">
            Meteora SDK
          </a>
          <a href="https://solana.com" target="_blank" rel="noreferrer" className="transition-colors hover:text-white">
            Solana Devnet
          </a>
        </div>
      </div>
    </footer>
  );
}
