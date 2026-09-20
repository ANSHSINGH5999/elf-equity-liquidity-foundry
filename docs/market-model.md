# ELF Market Model

This document explains the reasoning behind ELF's curve compiler,
simulation engine, and scoring systems. None of this is presented to
issuers as a claim of financial optimality — every screen that shows a
score or a recommendation also shows the inputs and the reasoning, per
product spec.

## The DBC base token is not the tokenized equity

Meteora's Dynamic Bonding Curve mints its own fresh base token at
pool-creation time — it cannot attach a bonding curve to an arbitrary
pre-existing SPL mint. This is a real constraint of the DBC program, not
an ELF limitation.

So when an issuer selects an asset in Step 1 (e.g. a PreStocks-listed
pre-IPO token), ELF treats that asset's `mintAddress` and
`referencePriceUsd` as the **reference identity** — used for the ELF
Market Quality Score's "reference-price alignment" dimension and for
issuer-facing display — while the actual on-chain trading instrument is
the **new DBC base mint** generated during pool creation
(`LaunchRecord.baseMint`, distinct from `TokenizedAsset.mintAddress`).
This mirrors how bonding-curve launches actually work today; ELF's
framing makes the distinction explicit rather than pretending the two
are the same token.

## Why market cap is anchored to declared liquidity, not reference price

An earlier version of the curve compiler computed initial/migration
market cap as `referencePriceUsd × 1,000,000,000 assumed tokens ×
risk-tier multiple`. For a real PreStocks reference price (e.g. Anthropic
PreStocks at ~$980), that produced a curve with an initial market cap
in the **hundreds of billions of dollars** — completely disconnected from
what an issuer actually said they wanted to bootstrap with (e.g. $250K of
initial liquidity).

The fix: `initialMarketCapUsd` and `migrationMarketCapUsd` are now
derived from the issuer's own Step 2 inputs —
`initialLiquidityUsd × preset.initialMcapMultiple` and
`targetGraduationUsd × preset.migrationMcapMultiple` respectively. Total
token supply is then back-solved (`initialMarketCapUsd /
referencePriceUsd`, clamped to a sane range) so the curve's **starting
price** happens to land near the reference price — a UX nicety, not a
pricing mechanism. See `packages/market-engine/src/curveCompiler.ts` and
its test `tests/market-engine/curveCompiler.test.ts`.

## Curve compiler: objectives and scoring

Three deterministic candidates — Conservative, Balanced, Growth — are
generated from fixed per-risk-profile presets
(`packages/market-engine/src/presets.ts`). Each candidate is scored on
six 0–100 display metrics shown in the `/design` comparison table (Price
Impact, Discovery Speed, Liquidity Efficiency, Fee Generation, Stress
Resilience, Graduation Readiness), and a separate weighted composite
(computed from five named objectives — price impact, volatility
amplification, liquidity efficiency, discovery speed, graduation
probability — via `DEFAULT_OBJECTIVE_WEIGHTS`) determines which one is
marked "Recommended." All three candidates are scored against the *same*
weight vector — the one implied by the issuer's chosen risk profile — so
the recommendation reflects genuine fit, not a name match.

This is a heuristic scoring system, not a claim that any candidate is
objectively optimal. The UI describes it as "a recommended configuration
based on the selected objectives and simulation," per product spec.

## Simulation: real curve math, ELF-chosen scenario positions

Every simulated quote uses the actual Meteora SDK swap math
(`PoolService.getQuoteFromInputAmount`, the same function family the
deployed pool uses) against the exact `ConfigParameters` the approved
candidate would deploy with. ELF invents no pricing formula of its own.

What *is* an ELF design choice is how each of the six required scenarios
(normal demand, strong buy pressure, strong sell pressure, low liquidity,
high volatility, graduation approach) picks a starting point along the
curve to simulate from. Since `getQuoteFromInputAmount` always starts
from a freshly-launched, zero-reserve virtual pool, ELF repositions the
curve's `sqrtStartPrice` to a scenario-appropriate point using a
documented linear interpolation in sqrt-price space
(`getCurvePositionStartPrice` in `packages/meteora-adapter/src/quote.ts`)
between the true launch price and the curve's final checkpoint — skipping
the trailing `MAX_SQRT_PRICE` rounding-leftover segment `buildCurve`
sometimes appends, which is not itself a meaningful price level.

This is an approximation of *where* on the curve a scenario happens, not
of the swap math itself, and is disclosed as such in code comments. A
trade that would require more depth than remains between the scenario's
position and the curve's edge is reported as a maximal-impact,
"unfillable" result rather than crashing — genuine, useful information
about thin liquidity, most visible in the `low_liquidity` scenario (e.g. a
large sell against a thin reserve).

Quotes are computed with the SDK's `swapQuote2` against the ORIGINAL config and
a virtual pool positioned at the scenario price (with its real quote reserve
from `getQuoteReserveFromNextSqrtPrice`). An earlier version repositioned the
config's `sqrtStartPrice` instead, which made the scenario price the curve
floor and so made every sell unfillable; buy results are unchanged by the fix.

## Market regimes are analytics, not control

Per product spec, ELF never mutates a deployed Meteora DBC configuration
in response to market conditions. `classifyRegime` in
`packages/market-engine/src/regime.ts` produces a read-only label
(`discovery` / `healthy` / `mature` / `stressed` / `recovery`) purely for
the dashboard and `/markets` filters. The on-chain configuration is
whatever was deployed in Step 5, permanently, until it migrates.

## Migration to DAMM v2

Every ELF-generated candidate uses `MigrationOption.MET_DAMM_V2` (the
current, non-deprecated Meteora migration path — `MET_DAMM`/DAMM v1 is
marked deprecated for new configs in the SDK). Once a pool's quote
reserve reaches its migration threshold, `client.migration.migrateToDammV2`
(wrapped by `packages/meteora-adapter/src/migration.ts`) builds the real
migration transaction. ELF's MVP does not execute this automatically —
consistent with "ELF never mutates a configuration or triggers an action
without a human signature" — but the code path exists and
`isPoolReadyToMigrate` reads real on-chain progress to tell the issuer
when they can trigger it.

## ELF Market Quality Score — methodology disclosure

Fixed point allocation, deterministic formulas
(`packages/market-engine/src/marketQuality.ts`):

| Component | Points | What it measures |
|---|---|---|
| Liquidity depth | 25 | Current liquidity vs. the issuer's declared target |
| Price stability | 20 | Recent price volatility (from snapshot history) |
| Volume quality | 15 | 24h volume vs. ~10% of target liquidity turning over |
| Slippage | 20 | A live $10k quote's price impact |
| Holder distribution | 10 | Holder count + top-10 concentration (sampled, not a full census — see docs/security.md) |
| Reference-price alignment | 10 | Deviation of current price from the asset's declared reference price |

This is explicitly **not** an industry-standard metric — the UI labels it
"ELF Market Quality Score" with an info tooltip explaining the same
breakdown shown here.

**ELF V1 Phase 5** adds an explainability wrapper
(`explainMarketQualityScore` in `packages/market-engine/src/analytics.ts`)
around this same, unchanged six-component score: a `"MQS v1"` version
tag, and a deterministic, rule-based primary/risk signal sentence (the
best- and worst-scoring components as a fraction of their own maximum —
never an LLM-generated or randomized explanation). See `docs/analytics.md`
for exactly which inputs are and aren't yet sourced from indexed data.
