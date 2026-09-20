import Link from "next/link";
import { BrandMark } from "@/components/layout/brand-mark";
import { HERO_POSTER, HERO_VIDEO } from "@/components/layout/site-backdrop";
import { LandingMotion } from "@/components/landing/landing-motion";
import { LandingSections } from "@/components/landing/landing-sections";
import "@/app/neural-landing.css";

const FEATURES = ["Curve compiler", "Simulation Lab", "Live trading", "Market health"];

/**
 * The home page: the NEURAL hero design (one viewport, with ELF's own copy and
 * real links; every layout number lives in neural-landing.css) followed by the
 * content sections in the same design language.
 */
export function NeuralLanding() {
  return (
    <>
    <div className="nl">
      <video className="art" autoPlay muted loop playsInline preload="auto" aria-hidden="true" poster={HERO_POSTER} src={HERO_VIDEO} />
      <div className="veil" />

      <section className="nl-hero" aria-label="Introduction">
      <header className="bar">
        <Link className="brand" href="/">
          <BrandMark />
          <span id="word">ELF</span>
        </Link>
        <input className="navtoggle" type="checkbox" id="nav-open" />
        <label className="scrim" htmlFor="nav-open" aria-hidden="true" />
        <label className="burger" htmlFor="nav-open" aria-label="Menu">
          <svg viewBox="0 0 22 14" aria-hidden="true">
            <path className="b1" d="M1 1 H21" />
            <path className="b2" d="M1 7 H21" />
            <path className="b3" d="M1 13 H21" />
          </svg>
        </label>
        <div className="navpanel">
          <nav className="menu">
            <Link href="/assets">
              <span id="about">Discover</span>
            </Link>
            <Link href="/markets">
              <span id="product">Markets</span>
            </Link>
            <Link href="/design">
              <span id="solutions">Design</span>
              <svg className="caret" viewBox="0 0 9 6" aria-hidden="true">
                <path d="M0.7 1.1 L4.5 4.6 L8.3 1.1" />
              </svg>
            </Link>
          </nav>
          <Link className="login" href="/design/copilot">
            <span id="login">Launch Copilot</span>
            <svg className="navarrow" viewBox="0 0 10 9" aria-hidden="true">
              <path d="M0 4.5 H9.1 M5.4 0.9 L9.2 4.5 L5.4 8.1" />
            </svg>
          </Link>
          <Link className="pill" href="/design">
            <span id="contact">Design a market</span>
          </Link>
        </div>
      </header>

      <main className="hero">
        <h1 className="title">
          <span id="h1a">Design the Market,</span> <span id="h1b">Not Just the Token.</span>
        </h1>
        <p className="sub">
          <span id="sub1">Simulate, deploy and monitor</span> <span id="sub2">equity markets on Solana.</span>
        </p>
        <Link className="cta" href="/design">
          <span id="cta">Design a market</span>
          <svg className="arrow" viewBox="0 0 16 11" aria-hidden="true">
            <path d="M0 5.5 H14.6 M10.3 1.2 L14.9 5.5 L10.3 9.8" />
          </svg>
        </Link>
        <ul className="feats">
          {FEATURES.map((label, i) => (
            <li key={label}>
              <svg className="chev" viewBox="0 0 11 20" aria-hidden="true">
                <path d="M1.15 1.15 L9.6 10 L1.15 18.85" />
              </svg>
              <span id={`f${i + 1}`}>{label}</span>
            </li>
          ))}
        </ul>
        <span className="rule" aria-hidden="true" />
      </main>

      <footer className="foot">
        <span id="foot1">Non-custodial. Devnet demo. Not investment advice.</span>
        <span id="foot2">2026</span>
      </footer>
      </section>

      <LandingMotion />
    </div>
    <LandingSections />
    </>
  );
}
