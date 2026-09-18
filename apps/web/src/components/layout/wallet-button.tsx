"use client";

import * as React from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { truncateAddress } from "@/lib/utils";

// Official Phantom Ghost SVG Icon
export function PhantomIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 128 128"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <rect width="128" height="128" rx="28" fill="#AB9FF2" />
      <path
        d="M110.6 66.8C108.6 44.5 89.8 28 66.9 28C41.7 28 21.2 48.5 21.2 73.7C21.2 87.2 27.2 99.3 36.7 107.5C39.4 109.8 43.4 108.2 43.8 104.7L44.8 96.6C45.1 94.1 46.8 92 49.2 91.4C55.3 89.8 61.7 88.9 68.3 88.9C89.4 88.9 107.4 75.3 110.6 66.8Z"
        fill="white"
      />
      <circle cx="51.5" cy="58.5" r="6.5" fill="#2C233D" />
      <circle cx="79.5" cy="58.5" r="6.5" fill="#2C233D" />
    </svg>
  );
}

export function WalletButton() {
  const { publicKey, wallet, disconnect, select, wallets, connecting } = useWallet();
  const { setVisible } = useWalletModal();
  const [menuOpen, setMenuOpen] = React.useState(false);
  const [copied, setCopied] = React.useState(false);
  const menuRef = React.useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  React.useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleConnectPhantom = async () => {
    const phantomWallet = wallets.find(
      (w) => w.adapter.name.toLowerCase() === "phantom"
    );
    if (phantomWallet) {
      select(phantomWallet.adapter.name);
    }
    setVisible(true);
  };

  const handleCopy = () => {
    if (publicKey) {
      navigator.clipboard.writeText(publicKey.toBase58());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!publicKey) {
    return (
      <button
        type="button"
        onClick={handleConnectPhantom}
        disabled={connecting}
        className="group relative inline-flex items-center gap-2 rounded-lg border border-purple-500/30 bg-gradient-to-r from-[#17142b] via-[#1b1733] to-[#120f24] px-3.5 py-1.5 text-xs font-semibold text-[#c4b5fd] shadow-[0_0_15px_-3px_rgba(171,159,242,0.25)] transition-all hover:border-purple-400/60 hover:text-white hover:shadow-[0_0_20px_-2px_rgba(171,159,242,0.45)] hover:-translate-y-0.5 active:translate-y-0"
      >
        <PhantomIcon className="h-4 w-4 transition-transform group-hover:scale-110" />
        <span>{connecting ? "Connecting…" : "Connect Phantom"}</span>
      </button>
    );
  }

  const base58 = publicKey.toBase58();

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={() => setMenuOpen((prev) => !prev)}
        className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-[#0c101a] px-3 py-1.5 text-xs font-mono text-foreground transition-all hover:border-purple-400/40 hover:bg-[#121624]"
      >
        <div className="flex h-2 w-2 items-center justify-center">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_#22c55e]" />
        </div>
        <PhantomIcon className="h-3.5 w-3.5" />
        <span>{truncateAddress(base58)}</span>
        <span className="text-[10px] text-muted-foreground">▾</span>
      </button>

      {menuOpen && (
        <div className="absolute right-0 top-full mt-2 w-56 rounded-xl border border-white/10 bg-[#0c101a] p-2 shadow-2xl backdrop-blur-xl z-50">
          <div className="border-b border-white/5 px-3 py-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                Connected Wallet
              </span>
              <span className="rounded bg-purple-500/10 px-1.5 py-0.5 text-[9px] font-semibold text-purple-300 border border-purple-500/20">
                {wallet?.adapter.name ?? "Phantom"}
              </span>
            </div>
            <p className="mt-1 break-all font-mono text-[11px] text-foreground">
              {truncateAddress(base58, 6)}
            </p>
          </div>

          <div className="mt-1 flex flex-col gap-1">
            <button
              type="button"
              onClick={handleCopy}
              className="flex w-full items-center justify-between rounded-md px-3 py-1.5 text-left text-xs text-muted-foreground hover:bg-white/5 hover:text-white"
            >
              <span>{copied ? "Copied to Clipboard!" : "Copy Address"}</span>
              <span className="text-[10px] font-mono">{copied ? "✓" : "📋"}</span>
            </button>

            <a
              href={`https://explorer.solana.com/address/${base58}?cluster=devnet`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex w-full items-center justify-between rounded-md px-3 py-1.5 text-left text-xs text-muted-foreground hover:bg-white/5 hover:text-white"
            >
              <span>View on Explorer</span>
              <span className="text-[10px]">↗</span>
            </a>

            <button
              type="button"
              onClick={() => {
                disconnect();
                setMenuOpen(false);
              }}
              className="flex w-full items-center justify-between rounded-md px-3 py-1.5 text-left text-xs text-rose-400 hover:bg-rose-500/10 hover:text-rose-300"
            >
              <span>Disconnect</span>
              <span className="text-[10px]">⏻</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
