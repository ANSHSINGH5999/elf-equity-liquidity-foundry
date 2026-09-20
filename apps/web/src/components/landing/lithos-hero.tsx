"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Menu, X } from "lucide-react";
import { LithosRevealLayer } from "@/components/landing/lithos-reveal-layer";
import "@/app/lithos-landing.css";

const SPOTLIGHT_R = 260;

const BG_IMAGE_1 =
  "https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260609_195923_b0ba8ace-1d1d-4f2c-9a28-1ab84b330680.png&w=1280&q=85";
const BG_IMAGE_2 =
  "https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260609_201152_bba90a12-bf12-459f-91f0-51f237dbaf3b.png&w=1280&q=85";

const NAV_LINKS = [
  { href: "/design", label: "Design" },
  { href: "/assets", label: "Discover" },
  { href: "/markets", label: "Markets" },
  { href: "/design/copilot", label: "Copilot" },
  { href: "/design/lab", label: "Lab" },
] as const;

function Logo() {
  return (
    <svg width="26" height="26" viewBox="0 0 256 256" fill="#ffffff" aria-hidden="true">
      <path d="M 256 256 L 128 256 L 0 128 L 128 128 Z M 256 128 L 128 128 L 0 0 L 128 0 Z" />
    </svg>
  );
}

function Nav() {
  const [open, setOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-[100] flex items-center justify-between p-4 sm:p-5" aria-label="Main">
      <Link href="/" className="flex items-center gap-2" aria-label="ELF home">
        <Logo />
        <span className="font-playfair text-2xl italic text-white">ELF</span>
      </Link>

      <div className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-1 rounded-full border border-white/30 bg-white/20 px-2 py-2 backdrop-blur-md md:flex">
        {NAV_LINKS.map((link, i) => (
          <Link
            key={link.href}
            href={link.href}
            className={
              i === 0
                ? "rounded-full px-4 py-1.5 text-sm font-medium text-white"
                : "rounded-full px-4 py-1.5 text-sm font-medium text-white/80 transition-colors hover:bg-white/20 hover:text-white"
            }
          >
            {link.label}
          </Link>
        ))}
      </div>

      <Link href="/design/copilot" className="hidden rounded-full bg-white px-6 py-2.5 text-sm font-semibold text-gray-900 hover:bg-gray-100 md:block">
        Launch Copilot
      </Link>

      <button className="-mr-2 p-2 text-white md:hidden" aria-label={open ? "Close menu" : "Open menu"} aria-expanded={open} onClick={() => setOpen((v) => !v)}>
        {open ? <X size={26} /> : <Menu size={26} />}
      </button>

      {open && (
        <div className="absolute top-full left-4 right-4 mt-1 flex flex-col gap-1 rounded-2xl border border-white/20 bg-black/60 p-3 backdrop-blur-md md:hidden">
          {NAV_LINKS.map((link, i) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className={`rounded-xl px-4 py-2.5 text-left text-sm font-medium ${i === 0 ? "text-white" : "text-white/80 hover:bg-white/10 hover:text-white"}`}
            >
              {link.label}
            </Link>
          ))}
          <Link href="/design/copilot" onClick={() => setOpen(false)} className="mt-1 rounded-full bg-white px-6 py-2.5 text-center text-sm font-semibold text-gray-900 hover:bg-gray-100">
            Launch Copilot
          </Link>
        </div>
      )}
    </nav>
  );
}

/**
 * The home page hero: the Lithos design (two full-bleed images, the second revealed through a soft spotlight that
 * eases after the cursor), carrying ELF's own copy and real links.
 */
export function LithosHero() {
  const mouse = useRef({ x: -999, y: -999 });
  const smooth = useRef({ x: -999, y: -999 });
  const rafRef = useRef(0);
  const [cursorPos, setCursorPos] = useState({ x: -999, y: -999 });

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      // The first move snaps the eased position to the cursor so the spotlight does not sweep in from off-screen.
      if (mouse.current.x === -999) smooth.current = { x: e.clientX, y: e.clientY };
      mouse.current = { x: e.clientX, y: e.clientY };
    };
    window.addEventListener("mousemove", onMove);

    const tick = () => {
      smooth.current.x += (mouse.current.x - smooth.current.x) * 0.1;
      smooth.current.y += (mouse.current.y - smooth.current.y) * 0.1;
      setCursorPos((prev) =>
        Math.abs(prev.x - smooth.current.x) < 0.01 && Math.abs(prev.y - smooth.current.y) < 0.01 ? prev : { x: smooth.current.x, y: smooth.current.y },
      );
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <div className="lithos min-h-screen bg-white tracking-[-0.02em]" style={{ fontFamily: "'Inter', sans-serif" }}>
      <Nav />

      <section className="relative h-screen w-full overflow-hidden bg-black" style={{ height: "100dvh" }} aria-label="Introduction">
        <div className="hero-zoom absolute inset-0 z-10 bg-cover bg-center bg-no-repeat" style={{ backgroundImage: `url("${BG_IMAGE_1}")` }} />

        <LithosRevealLayer image={BG_IMAGE_2} cursorX={cursorPos.x} cursorY={cursorPos.y} radius={SPOTLIGHT_R} />

        <div className="pointer-events-none absolute top-[14%] left-0 right-0 z-50 flex flex-col items-center px-5 text-center">
          <h1 className="leading-[0.95] text-white">
            <span className="hero-anim hero-reveal font-playfair block text-5xl font-normal italic sm:text-7xl md:text-8xl" style={{ letterSpacing: "-0.05em", animationDelay: "0.25s" }}>
              Design the market,
            </span>
            <span className="hero-anim hero-reveal -mt-1 block text-5xl font-normal sm:text-7xl md:text-8xl" style={{ letterSpacing: "-0.08em", animationDelay: "0.42s" }}>
              not just the token
            </span>
          </h1>
        </div>

        <div className="hero-anim hero-fade absolute bottom-14 left-10 z-50 hidden max-w-[260px] sm:block md:left-14" style={{ animationDelay: "0.7s" }}>
          <p className="text-sm leading-relaxed text-white/80">
            Every market starts as a curve. ELF compiles yours from a plain brief, then stress-tests it against real Meteora curve math before anything is signed.
          </p>
        </div>

        <div
          className="hero-anim hero-fade absolute bottom-10 left-5 right-5 z-50 flex max-w-full flex-col items-start gap-4 sm:bottom-24 sm:left-auto sm:right-10 sm:max-w-[260px] sm:gap-5 md:right-14"
          style={{ animationDelay: "0.85s" }}
        >
          <p className="text-xs leading-relaxed text-white/80 sm:text-sm">
            Design, simulate and deploy on Solana, then watch price impact, fees and graduation in one place. Non-custodial: your wallet signs every transaction.
          </p>
          <Link
            href="/design"
            className="rounded-full bg-[#e8702a] px-7 py-3 text-sm font-medium text-white transition-all hover:scale-[1.03] hover:bg-[#d2611f] hover:shadow-lg hover:shadow-[#e8702a]/30 active:scale-95"
          >
            Design a market
          </Link>
        </div>
      </section>
    </div>
  );
}
