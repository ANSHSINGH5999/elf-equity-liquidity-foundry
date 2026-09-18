import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  HeroReveal,
  FadeInSection,
  GlowOnHoverCard,
  CountUpNumber,
  MagneticButton,
} from "@/components/motion/reveal";
import { InteractiveCurveSimulator } from "@/components/design/interactive-curve-simulator";
import { CurveComparison } from "@/components/design/curve-comparison";

const STATS = [
  { label: "DBC Curve Profiles", value: 3, suffix: " Architectures", desc: "Conservative, Balanced & Growth" },
  { label: "Stress Test Scenarios", value: 6, suffix: " Scenarios", desc: "4 trade sizes across buy/sell runs" },
  { label: "Market Quality Metric", value: 100, suffix: " Pts MQS", desc: "Automated liquidity & stability telemetry" },
  { label: "Zero Custody", value: 100, suffix: "% On-Chain", desc: "Direct wallet-signed Meteora transactions" },
];

const HOW_IT_WORKS = [
  {
    step: "01",
    title: "Select the Asset & Reference Price",
    body: "Bring an existing tokenized equity or pre-IPO mint — entered manually, or pulled live from PreStocks — and set its reference price.",
    tag: "Asset Identity",
  },
  {
    step: "02",
    title: "Define the Market Brief",
    body: "Declare initial liquidity, expected volatility, risk profile, and graduation targets. This is the brief ELF's curve compiler works from.",
    tag: "Parameter Matrix",
  },
  {
    step: "03",
    title: "Compile Three Deterministic DBCs",
    body: "ELF deterministically generates Conservative, Balanced, and Growth Meteora DBC configurations, scores them against your objectives, and recommends one.",
    tag: "Curve Compiler",
  },
  {
    step: "04",
    title: "Stress-Test Against Real Curve Math",
    body: "Run six demand scenarios across four trade sizes against the real curve math — every number labeled SIMULATED, never mistaken for live data.",
    tag: "Simulation Engine",
  },
  {
    step: "05",
    title: "Deploy the Real Meteora Pool",
    body: "Review the exact on-chain parameters, connect a wallet, and sign the real createConfig and createPool transactions. No private keys ever touch ELF.",
    tag: "On-Chain Launch",
  },
  {
    step: "06",
    title: "Trade Live, Verified Against Pyth",
    body: "Buy and sell directly against the live curve from any wallet, with the on-chain price checked in real time against Pyth's regulated-equity, xStock, and Ondo feeds — through permanent migration to DAMM v2.",
    tag: "Market Telemetry",
  },
];

const ASSET_SOURCES = [
  {
    name: "Manual SPL Token Ingestion",
    badge: "Available Now",
    variant: "positive" as const,
    detail: "Any existing SPL token mint with custom decimal precision and issuer-supplied reference pricing.",
  },
  {
    name: "PreStocks Protocol",
    badge: "Live API Feed",
    variant: "gold" as const,
    detail: "Live pre-IPO token listings and real-time equity metrics, pulled directly from PreStocks public API.",
  },
  {
    name: "Institutional Secondary Feeds",
    badge: "Enterprise",
    variant: "neutral" as const,
    detail: "Feature-flagged institutional equity feeds for private secondaries and compliant tokenized cap tables.",
  },
];

export default function LandingPage() {
  return (
    <div className="relative">
      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-white/10 pb-20 pt-16 sm:pb-28 sm:pt-24">
        {/* Subtle radial atmosphere */}
        <div
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-0 h-[600px] w-[900px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-20 blur-[140px]"
          style={{
            background: "radial-gradient(circle, #c9a227 0%, #6366f1 60%, transparent 80%)",
          }}
        />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
          <HeroReveal>
            <div className="flex flex-wrap items-center gap-2.5">
              <Badge variant="gold" dot>
                Meteora Dynamic Bonding Curve
              </Badge>
              <Badge variant="accent">Solana Devnet Infrastructure</Badge>
              <Badge variant="neutral">Pyth-Verified Pricing</Badge>
            </div>

            <h1 className="font-display mt-7 max-w-4xl text-5xl leading-[1.06] tracking-tight text-white sm:text-7xl lg:text-8xl">
              Design the market,
              <br />
              <span className="text-gradient-gold italic">not just the token.</span>
            </h1>

            <p className="mt-7 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
              Equity Liquidity Foundry creates, simulates, and monitors equity-native liquidity
              markets on Solana — issuer-facing infrastructure built on Meteora&rsquo;s Dynamic
              Bonding Curve with deterministic DAMM v2 graduation.
            </p>

            <div className="mt-9 flex flex-wrap items-center gap-4">
              <MagneticButton>
                <Link href="/design">
                  <Button size="lg" variant="gold">
                    <span>⚡ Design a Market</span>
                  </Button>
                </Link>
              </MagneticButton>
              <Link href="/markets">
                <Button size="lg" variant="secondary">
                  View Live Markets
                </Button>
              </Link>
            </div>
          </HeroReveal>

          {/* Stats Telemetry Row */}
          <div className="mt-16 grid grid-cols-2 gap-3.5 sm:grid-cols-4">
            {STATS.map((stat, idx) => (
              <FadeInSection key={stat.label} delay={0.08 * idx}>
                <GlowOnHoverCard className="h-full rounded-xl border border-white/10 bg-[#0c101a]/90 p-5 backdrop-blur">
                  <div className="font-display text-2xl font-semibold text-white sm:text-3xl">
                    <CountUpNumber value={stat.value} suffix={stat.suffix} />
                  </div>
                  <div className="mt-1 text-[11px] font-semibold uppercase tracking-wider text-gold-light">
                    {stat.label}
                  </div>
                  <div className="mt-0.5 text-xs text-muted-foreground">{stat.desc}</div>
                </GlowOnHoverCard>
              </FadeInSection>
            ))}
          </div>
        </div>
      </section>

      {/* Why a compiled DBC beats a naive launch curve */}
      <section className="border-b border-white/10 py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <FadeInSection>
            <CurveComparison />
          </FadeInSection>
        </div>
      </section>

      {/* Interactive 3D Curve Simulation Showcase */}
      <section className="border-b border-white/10 py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <FadeInSection>
            <div className="mb-8 flex flex-col gap-1.5">
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-light">
                Live Mathematical Simulator
              </span>
              <h2 className="font-display text-3xl font-medium tracking-tight text-white sm:text-4xl">
                Dynamic Bonding Curve Architecture
              </h2>
              <p className="max-w-2xl text-sm text-muted-foreground">
                Preview how ELF compiles Meteora DBC parameters across different initial liquidity
                sizes, dynamic fee ceilings, and graduation thresholds before launching.
              </p>
            </div>
          </FadeInSection>

          <FadeInSection delay={0.1}>
            <InteractiveCurveSimulator />
          </FadeInSection>
        </div>
      </section>

      {/* End-to-End Workflow Grid */}
      <section className="border-b border-white/10 py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <FadeInSection>
            <div className="flex flex-col gap-1.5">
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-accent-strong">
                Institutional Methodology
              </span>
              <h2 className="font-display text-3xl font-medium tracking-tight text-white sm:text-4xl">
                From Reference Asset to Verified On-Chain Pool
              </h2>
            </div>
          </FadeInSection>

          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {HOW_IT_WORKS.map((item, i) => (
              <FadeInSection key={item.step} delay={i * 0.05}>
                <GlowOnHoverCard className="h-full">
                  <Card className="h-full border border-white/10 bg-[#0c101a] p-6">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xl font-bold text-gold-light">
                        {item.step}
                      </span>
                      <Badge variant="neutral" className="text-[10px]">
                        {item.tag}
                      </Badge>
                    </div>
                    <h3 className="mt-4 text-sm font-semibold tracking-tight text-white">
                      {item.title}
                    </h3>
                    <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                      {item.body}
                    </p>
                  </Card>
                </GlowOnHoverCard>
              </FadeInSection>
            ))}
          </div>
        </div>
      </section>

      {/* Deep-Dive Architectural Highlights */}
      <section className="border-b border-white/10 py-16 sm:py-24">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:grid-cols-2 sm:px-6">
          <FadeInSection>
            <div className="h-full rounded-2xl border border-white/10 bg-[#0c101a] p-8">
              <Badge variant="accent" className="mb-4">
                Architecture
              </Badge>
              <h3 className="font-display text-2xl font-medium text-white sm:text-3xl">
                Why Meteora Dynamic Bonding Curves?
              </h3>
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                Meteora&rsquo;s Dynamic Bonding Curve gives every launch a permissionless,
                programmatic price-discovery curve with configurable fee schedules, dynamic fees,
                and a defined migration path into a permanent DAMM v2 pool once a quote-reserve
                threshold is reached.
              </p>
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                ELF never invents custom AMM math — every config, pool, and quote is deterministically
                compiled with the official{" "}
                <code className="rounded bg-indigo-950/80 px-1.5 py-0.5 font-mono text-xs text-indigo-300 border border-indigo-800/40">
                  @meteora-ag/dynamic-bonding-curve-sdk
                </code>
                .
              </p>
            </div>
          </FadeInSection>

          <FadeInSection delay={0.08}>
            <div className="h-full rounded-2xl border border-white/10 bg-[#0c101a] p-8">
              <Badge variant="gold" className="mb-4">
                Telemetry
              </Badge>
              <h3 className="font-display text-2xl font-medium text-white sm:text-3xl">
                The ELF Market Quality Score (MQS)
              </h3>
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                A deterministic 100-point composite score evaluating liquidity depth, price
                stability, volume quality, slippage bounds, holder distribution, and reference-price
                alignment.
              </p>
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                Provides continuous risk telemetry so issuers and market participants have instant
                clarity on market health before and after DAMM v2 graduation.
              </p>
            </div>
          </FadeInSection>
        </div>
      </section>

      {/* Supported Asset Sources */}
      <section className="py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <FadeInSection>
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div className="flex flex-col gap-1.5">
                <span className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                  Asset Layer
                </span>
                <h2 className="font-display text-3xl font-medium tracking-tight text-white sm:text-4xl">
                  Supported Ingestion Sources
                </h2>
              </div>
              <Link href="/assets" className="text-xs font-medium text-accent-strong hover:underline">
                Browse live assets →
              </Link>
            </div>
          </FadeInSection>

          <div className="mt-8 grid gap-5 sm:grid-cols-3">
            {ASSET_SOURCES.map((source, i) => (
              <FadeInSection key={source.name} delay={i * 0.05}>
                <Card className="h-full border border-white/10 bg-[#0c101a] p-6">
                  <CardContent className="p-0">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-semibold text-white">{source.name}</h3>
                      <Badge variant={source.variant}>{source.badge}</Badge>
                    </div>
                    <p className="mt-2.5 text-xs leading-relaxed text-muted-foreground">
                      {source.detail}
                    </p>
                  </CardContent>
                </Card>
              </FadeInSection>
            ))}
          </div>

          {/* Bottom Launch Banner */}
          <FadeInSection delay={0.15} className="mt-14">
            <div className="relative overflow-hidden rounded-2xl border border-amber-500/30 bg-gradient-to-r from-[#141006] via-[#0c101a] to-[#0d1222] p-8 backdrop-blur sm:p-12">
              <div
                aria-hidden
                className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-amber-500/10 blur-3xl"
              />
              <div className="relative z-10 flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
                <div className="max-w-xl">
                  <h3 className="font-display text-2xl font-medium text-white sm:text-3xl">
                    Ready to engineer tokenized equity liquidity?
                  </h3>
                  <p className="mt-2 text-xs text-muted-foreground sm:text-sm">
                    Configure parameters, stress-test 6 volatility scenarios, and launch your
                    Meteora Dynamic Bonding Curve pool in under 5 minutes.
                  </p>
                </div>
                <Link href="/design">
                  <Button size="lg" variant="gold" className="whitespace-nowrap">
                    Launch Market Designer →
                  </Button>
                </Link>
              </div>
            </div>
          </FadeInSection>
        </div>
      </section>
    </div>
  );
}
