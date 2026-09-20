import Link from "next/link";

/**
 * Everything below the hero. Same language as the hero: Sora, hairlines, glass
 * surfaces, pill controls, cool blue / warm champagne accents. Every claim here
 * describes something ELF actually does today (or says plainly that it does not).
 */

const STEPS = [
  { n: "01", tag: "Asset", title: "Bring the asset", body: "Enter a tokenized equity or pre-IPO mint by hand, or pull one live from the PreStocks catalog, and set its reference price." },
  { n: "02", tag: "Market brief", title: "Define the market", body: "Declare initial liquidity, expected volatility, risk profile and graduation target. This is the brief the curve compiler works from." },
  { n: "03", tag: "Curve compiler", title: "Compile the curve", body: "ELF deterministically compiles Conservative, Balanced and Growth Meteora DBC configurations and shows Meteora's own validation for each." },
  { n: "04", tag: "Simulation Lab", title: "Stress-test it off-chain", body: "Run six demand scenarios against the real curve math. Every number is labelled SIMULATED and never presented as a live result." },
  { n: "05", tag: "Deploy", title: "Approve and deploy", body: "Review the exact on-chain parameters, then approve each transaction in your own wallet. ELF never signs for you." },
  { n: "06", tag: "Live", title: "Trade and monitor", body: "Buy and sell against the live curve, then watch market health, graduation progress and the oracle from the issuer dashboard." },
];

const FEATURES = [
  { title: "Curve compiler", body: "Three deterministic Meteora DBC candidates scored against your brief, with the reasoning shown.", href: "/design", cta: "Design a market" },
  { title: "Simulation Lab", body: "Off-chain scenarios on real curve math: price impact, fees, quote reserve and the one real graduation condition. Nothing is signed or deployed.", href: "/design", cta: "Open the design flow" },
  { title: "Launch Copilot", body: "A deterministic launch plan, not an AI. It shows its checks and warnings, and needs your explicit approval before it reaches the wallet step.", href: "/design/copilot", cta: "Try the Copilot" },
  { title: "Live trading", body: "Buy and sell against a deployed pool from your own wallet. A trade is confirmed only after the network confirms it.", href: "/markets", cta: "Browse markets" },
  { title: "Market health", body: "Explainable events after launch: liquidity drops, volume spikes, large trades, oracle and indexer state. It reports what it measured; it is not a fraud detector.", href: "/markets", cta: "See market telemetry" },
  { title: "Price oracle", body: "The on-chain price next to Pyth feeds where your key is entitled. Where it is not, the panel says exactly why instead of showing a price.", href: "/markets", cta: "See the oracle panel" },
];

const STATS = [
  { value: "3", label: "curve candidates compiled per market" },
  { value: "6", label: "simulation scenarios on real curve math" },
  { value: "10", label: "explainable market-health event types" },
  { value: "Devnet", label: "where ELF runs today; mainnet is not claimed" },
];

const PRINCIPLES = [
  { title: "Simulated is never live", body: "Every simulated number and chart carries a permanent SIMULATED label, and looks different from a live chart." },
  { title: "No fabricated data", body: "No invented prices, trades or balances. When data is unavailable, ELF says so instead of filling the gap." },
  { title: "You hold the keys", body: "Transactions are built unsigned and approved in your wallet. The wallet you connect is the fee payer." },
  { title: "Deterministic, not AI", body: "The compiler, simulator, launch plan and health engine are rule-based and explain themselves. None of them is a language model." },
];

const eyebrow = "flex items-center gap-3 text-[12px] uppercase tracking-[0.2em] text-[#a2a9b8] [font-variation-settings:'wght'_531]";
const h2 = "mt-5 max-w-3xl text-[clamp(28px,4.2vw,46px)] leading-[1.12] tracking-[-0.012em] text-white [font-variation-settings:'wght'_424]";
const lead = "mt-5 max-w-2xl text-[15px] leading-relaxed text-[#a2a9b8] [font-variation-settings:'wght'_446]";
const hairPill = "hair-pill inline-flex items-center gap-2 bg-white/[0.03] px-5 py-2.5 text-[13px] text-[#e8ecf0] transition-colors [font-variation-settings:'wght'_531] hover:bg-white/[0.10] hover:text-white";

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p className={eyebrow}>
      <span aria-hidden className="h-px w-8 bg-[rgba(214,232,250,0.6)]" />
      {children}
    </p>
  );
}

function Arrow() {
  return (
    <svg viewBox="0 0 16 11" aria-hidden="true" className="h-[10px] w-[14px] fill-none stroke-current" strokeWidth="1.6">
      <path d="M0 5.5 H14.6 M10.3 1.2 L14.9 5.5 L10.3 9.8" />
    </svg>
  );
}

export function LandingSections() {
  return (
    <div className="relative z-[1] bg-[linear-gradient(180deg,rgba(2,6,15,0)_0,rgba(2,6,15,0.72)_180px,rgba(2,6,15,0.84)_100%)] text-[#f4f8fd]">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        {/* How it works */}
        <section id="how-it-works" className="pt-28 pb-24 sm:pt-36" aria-labelledby="how-title">
          <Eyebrow>How it works</Eyebrow>
          <h2 id="how-title" className={h2}>
            From a tokenized asset to a live, monitored market.
          </h2>
          <p className={lead}>One flow, six steps. Everything before deployment is off-chain and reversible; everything after it is wallet-signed.</p>
          <ol className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {STEPS.map((step) => (
              <li key={step.n} className="surface-card rounded-[22px] p-7">
                <div className="flex items-center justify-between">
                  <span className="hair-pill inline-flex h-9 w-9 items-center justify-center text-[12px] text-[#e8ecf0] [font-variation-settings:'wght'_531] [font-feature-settings:'tnum']">{step.n}</span>
                  <span className="text-[11px] uppercase tracking-[0.16em] text-[#a2a9b8]">{step.tag}</span>
                </div>
                <h3 className="mt-6 text-[19px] leading-snug text-white [font-variation-settings:'wght'_506]">{step.title}</h3>
                <p className="mt-3 text-[14px] leading-relaxed text-[#a2a9b8]">{step.body}</p>
              </li>
            ))}
          </ol>
        </section>

        {/* What is inside */}
        <section id="inside" className="pb-24" aria-labelledby="inside-title">
          <Eyebrow>What is inside</Eyebrow>
          <h2 id="inside-title" className={h2}>
            It does not stop at deployment.
          </h2>
          <p className={lead}>Design, simulate, launch, trade and monitor in one place, with each stage explaining how it reached its answer.</p>
          <div className="mt-14 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f) => (
              <article key={f.title} className="surface-card flex flex-col rounded-[22px] p-7">
                <h3 className="text-[19px] text-white [font-variation-settings:'wght'_506]">{f.title}</h3>
                <p className="mt-3 flex-1 text-[14px] leading-relaxed text-[#a2a9b8]">{f.body}</p>
                <Link href={f.href} className="mt-6 inline-flex items-center gap-2 text-[13px] text-[#bfeaff] transition-colors [font-variation-settings:'wght'_531] hover:text-white">
                  {f.cta}
                  <Arrow />
                </Link>
              </article>
            ))}
          </div>
        </section>

        {/* Facts */}
        <section className="pb-24" aria-label="Facts">
          <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-[22px] border border-[rgba(196,214,232,0.14)] bg-[rgba(196,214,232,0.14)] lg:grid-cols-4">
            {STATS.map((s) => (
              <div key={s.label} className="bg-[rgba(4,10,20,0.78)] px-6 py-8 backdrop-blur-xl">
                <dt className="text-[clamp(30px,4vw,44px)] leading-none text-white [font-variation-settings:'wght'_424]">{s.value}</dt>
                <dd className="mt-3 text-[13px] leading-snug text-[#a2a9b8]">{s.label}</dd>
              </div>
            ))}
          </dl>
        </section>

        {/* Principles */}
        <section id="principles" className="pb-24" aria-labelledby="principles-title">
          <Eyebrow>Honest by design</Eyebrow>
          <h2 id="principles-title" className={h2}>
            Built so you can trust what you are looking at.
          </h2>
          <div className="mt-14 grid gap-x-12 gap-y-10 sm:grid-cols-2">
            {PRINCIPLES.map((p) => (
              <div key={p.title} className="border-t border-[rgba(196,214,232,0.24)] pt-6">
                <h3 className="text-[17px] text-white [font-variation-settings:'wght'_506]">{p.title}</h3>
                <p className="mt-3 text-[14px] leading-relaxed text-[#a2a9b8]">{p.body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Closing call to action */}
        <section className="pb-28" aria-labelledby="cta-title">
          <div className="surface-gold-subtle rounded-[28px] px-6 py-14 text-center sm:px-12 sm:py-20">
            <h2 id="cta-title" className="mx-auto max-w-2xl text-[clamp(28px,4.2vw,46px)] leading-[1.12] tracking-[-0.012em] text-white [font-variation-settings:'wght'_424]">
              Design your first market.
            </h2>
            <p className="mx-auto mt-5 max-w-xl text-[15px] leading-relaxed text-[#a2a9b8]">Start from an asset, compile the curve, and see how it behaves before any liquidity is committed on-chain.</p>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
              <Link href="/design" className="glass-pill inline-flex items-center gap-3 rounded-full px-8 py-3.5 text-[15px] text-white transition-[filter] [font-variation-settings:'wght'_497] hover:brightness-125">
                Design a market
                <Arrow />
              </Link>
              <Link href="/design/copilot" className={hairPill}>
                Try the Launch Copilot
              </Link>
              <Link href="/assets" className={hairPill}>
                Browse assets
              </Link>
            </div>
            <p className="mt-8 text-[12px] text-[#a2a9b8]">Solana devnet demo. Non-custodial. Not investment advice.</p>
          </div>
        </section>
      </div>
    </div>
  );
}
