# ELF Architecture

## System diagram

```
                     ┌─────────────────────────┐
                     │        Browser           │
                     │  Next.js App Router UI   │
                     │  Solana Wallet Adapter    │
                     └────────────┬─────────────┘
                                  │ HTTPS (fetch)
                     ┌────────────▼─────────────┐
                     │   Next.js API routes      │
                     │   (apps/web/src/app/api)  │
                     └──┬──────────┬─────────┬───┘
                        │          │         │
          ┌─────────────▼──┐  ┌────▼───┐ ┌───▼──────────────┐
          │ @elf/market-    │  │ @elf/db│ │ @elf/meteora-     │
          │ engine          │  │(Prisma)│ │ adapter           │
          │ @elf/simulation-│  └────┬───┘ └───┬───────────────┘
          │ engine          │       │         │
          │ @elf/prestocks- │  ┌────▼───┐     │ @meteora-ag/dynamic-
          │ adapter         │  │Postgres│     │ bonding-curve-sdk
          └─────────────────┘  └────────┘     ▼
                                       ┌───────────────────┐
                                       │   Solana RPC       │
                                       │ (devnet/mainnet)   │
                                       └─────────┬──────────┘
                                                  ▼
                                       Meteora DBC on-chain program
```

## Monorepo layout

```
apps/web                 Next.js 16 App Router UI + API routes
packages/shared           Domain types + zod schemas (no Meteora/Solana imports)
packages/market-engine     Deterministic curve compiler, market-quality scoring,
                           graduation math, regime classification, and (Phase 5)
                           pure historical-analytics calculations
packages/simulation-engine Scenario simulation, built on meteora-adapter's
                           real curve math
packages/meteora-adapter   The ONLY package that imports
                           @meteora-ag/dynamic-bonding-curve-sdk directly
packages/solana            Connection factory, well-known mints, pubkey validation
packages/prestocks-adapter Live PreStocks API client + normalizer
packages/db                Prisma client singleton + generated types
packages/indexer            Polling-based blockchain indexer (ELF V1 Phase 4) —
                           decodes real DBC program events into Trade/
                           PriceHistory/LiquidityHistory/GraduationEvent rows
prisma/schema.prisma       Source of truth for the Postgres schema
tests/                     Top-level test suites (market-engine, simulation, integration)
docs/                      This file, security.md, market-model.md, indexer.md,
                           production-readiness.md, analytics.md
```

## The adapter-isolation rule

Per product spec, `@meteora-ag/dynamic-bonding-curve-sdk` types and enums
are imported **only** inside `packages/meteora-adapter`. Every other
package — including the Next.js app — works exclusively with
`@elf/shared` domain types (`TokenizedAsset`, `MarketProfile`,
`CurveCandidate`, `SimulationRun`, `PoolMetrics`, ...). This means:

- If Meteora changes its SDK surface, only `meteora-adapter` needs to change.
- `market-engine` and `simulation-engine` are fully unit-testable without a
  network connection or the SDK's Anchor/BN dependency graph leaking into
  their public APIs (though `simulation-engine` does call into
  `meteora-adapter`'s pure quote functions internally).
- `packages/indexer` decodes real on-chain events via
  `meteora-adapter`'s `decodeTransactionEvents` (Anchor's own event
  parser against the SDK's bundled IDL) rather than importing the SDK
  itself — it stays on the "consumer" side of the boundary too.

## The "Launch IS the Market" decision

The ELF V1 schema conceptually needs a `Market` entity for
`Trade`/`PriceHistory`/`LiquidityHistory`/`GraduationEvent` to key off
(`marketId`). Rather than add a redundant parallel `Market` table, the
existing `Launch.id` is used as `marketId` directly — a `Launch` already
uniquely represents one deployment attempt tied to one pool, and
`@@unique([curveConfigId])` (ELF V1 Phase 3) guarantees at most one per
curve config. See `docs/production-readiness.md` for the reasoning.

## Data flow: Design → Deploy

1. **Asset** (`POST /api/assets`) — persisted to `assets`, either from a
   manual form or a selected PreStocks listing.
2. **Market profile** (`POST /api/markets/design`) — persists a
   `market_profiles` row, then calls `compileCurveCandidates` (pure,
   deterministic) and persists three `curve_configs` rows.
3. **Simulation** (`POST /api/markets/simulate`) — loads a `curve_configs`
   row, calls `buildConfigParametersFromCandidate` (meteora-adapter, pure
   curve math via the SDK's `buildCurveWithMarketCap`), then
   `runSimulation` (simulation-engine) against the real curve, and
   persists a `simulation_runs` row.
4. **Deploy, step 1** (`POST /api/dbc/config`) — idempotent by
   `curveConfigId` (ELF V1 Phase 3): verifies the target network's
   genesis hash, builds the real `createConfig` transaction via
   `partner.createConfig`, simulates it, partially signs with a config
   keypair (fresh on first attempt, reused on retry), and returns a
   base64 transaction for the connected wallet to co-sign. Creates (or
   resumes) a `launches` row with `stage = AWAITING_CONFIG_SIGNATURE`.
5. **Deploy, step 2** (`POST /api/dbc/pool`) — first verifies, via a real
   on-chain read (`configExistsOnChain`), that step 1 actually landed —
   never trusting the client's word — before advancing
   `stage = CONFIG_CREATED` and building the real
   `createPoolWithFirstBuy` transaction (simulated the same way).
   Checking on-chain truth first is required regardless: Meteora's
   `createPoolWithFirstBuy` itself reads the config account back from
   chain to build the instruction, so it cannot succeed before step 1 has
   confirmed. If a pool is already live, returns the existing result
   instead of rebuilding anything.
6. **Live market** (`GET /api/pools/:poolAddress/metrics|health|graduation`)
   — reads real on-chain pool state via `StateService`, computes the ELF
   Market Quality Score, graduation status, and regime, and snapshots the
   result to `market_snapshots` for the price chart and 24h-volume figure.
7. **Indexing** (`packages/indexer`, triggered via `POST /api/indexer/run`
   or the standalone CLI) — backfills `trades`, `price_history`,
   `liquidity_history`, and `graduation_events` from real decoded DBC
   program events for every deployed pool. See `docs/indexer.md`.

## Why Next.js API routes instead of a separate Fastify service

The product spec allows either. A single Next.js deployment keeps the
demo simple to run and deploy (one `pnpm dev`, one Vercel project) while
still giving every route its own server-only module boundary
(`import "server-only"` on anything that touches `SOLANA_RPC_URL` or
Prisma), so nothing server-side ever reaches the browser bundle.

## 24h volume and price history — two data sources, clearly distinguished

`packages/indexer` (ELF V1 Phase 4) backfills real per-trade
`trades`/`price_history`/`liquidity_history` rows from decoded on-chain
events (`source: "indexed_trade"`). This coexists with the pre-existing
`market_snapshots` mechanism (still written opportunistically on every
`/metrics` poll) rather than replacing it — a snapshot's `priceUsd` is
sourced from a live RPC read and is real, but resolution is limited to
polling frequency, whereas an indexed `Trade` row is exact but requires
the indexer to have actually run since that trade happened.

As of Phase 5, the *headline* 24h/7d volume figures in `MarketOverview`
prefer indexed trade data once the indexer has any for that market,
falling back to the snapshot-delta estimate otherwise (each is labeled
with its true `DataSource`). The ELF Market Quality Score's internal
`volumeQuality`/`priceStability` component *inputs* are **not** yet
re-derived from indexed data — see `docs/analytics.md` for exactly what
is and isn't wired together, and why.

## Historical analytics service (ELF V1 Phase 5)

`apps/web/src/lib/server/marketAnalytics.ts` is the DB-aggregation
orchestration layer for everything under `GET /api/markets/:id/*`
(price, liquidity, volume, trades, quality, graduation — see
`docs/analytics.md` for the full endpoint list and formulas). It mirrors
the existing `simulation-engine` ↔ `meteora-adapter` split: all actual
*calculation* (volatility, percent change, buy/sell aggregation, score
narrative) lives in pure, independently-tested functions in
`@elf/market-engine` (`packages/market-engine/src/analytics.ts`); this
service only resolves `marketId` → `Launch` and runs time-bounded,
capped Postgres queries (including one raw, parameterized aggregation
query for trade volume/stats — see `docs/analytics.md`'s Performance
notes).

The pool-address-keyed `/api/pools/:poolAddress/*` routes and the
market-id-keyed `/api/markets/:id/*` routes intentionally coexist —
the former still powers the original `/pools/[poolAddress]` dashboard,
the latter powers the new `/markets/[marketId]` detail page and is now
the link target from `/markets`. Consolidating them is a recommended,
not-yet-done follow-up (see `docs/production-readiness.md`).

## Final-sprint feature map

| Feature | Route / UI | API | Pure logic (`market-engine`) | Data reused |
|---|---|---|---|---|
| Trading terminal | `/markets/[id]` (Trade panel) | `GET .../quote`, `POST .../swap` | `trade.ts`, `swap.ts#computeSwapAmountIn` | Meteora `swapQuote2`, existing swap builder |
| Transaction explorer | `/markets/[id]` (Transaction history, click a row) | `GET /api/markets/:id/trades` (adds pool/token) | — | `Trade` rows written by the existing indexer |
| Graduation monitor | `/markets/[id]` | `GET /api/markets/:id` (adds `graduationChecklist`) | `graduation.ts#buildGraduationChecklist` | `computeGraduationStatus`, pool `isMigrated` |
| Issuer risk dashboard | `/markets/[id]/analytics` | `GET /api/markets/:id/risk` | `risk.ts` | `getMarketOverview`, `getTradeStats`, `getTraderStats`, freshness; one new aggregate |
| Market analyst | `/markets/[id]/analytics` | `POST /api/markets/:id/analyze` | `analyst.ts` (+ guardrail) | the issuer dashboard payload |

No Prisma schema change was needed. The market page itself is the trading
surface, so no duplicate `/trade` or `/transactions` route was created.

## Market Launch Copilot

A guided, deterministic front door to the existing issuer flow (`/design/copilot`).
It is a *composition*, not a second engine.

| Stage | Reused component |
|---|---|
| Asset | `AssetStep` (unchanged) |
| Market design / curve compilation | `ProfileStep` → `POST /api/markets/design` → `market-engine` `curveCompiler` |
| Simulation | `POST /api/markets/simulate` → `simulation-engine` (user-triggered) |
| Config validation | `meteora-adapter/validate.ts#validateCandidateConfiguration` — the same param builder as the deploy path + Meteora `validateConfigParameters` |
| Oracle | `getPythPriceComparison` (real Hermes state; restricted → "Restricted — Pyth entitlement required") |
| Plan assembly & gate | `market-engine/launchPlan.ts` (`buildLaunchPlan`, `evaluateSimulation`, `evaluateApprovalGate`) — pure, no I/O |
| Wallet approval / deploy | `ReviewStep` (unchanged) |

- **API:** `POST /api/markets/launch-plan` — rate-limited, read-only, no DB
  writes, no signing. It loads the curve config, profile, asset and (optionally)
  a stored `SimulationRun` belonging to *that* curve config, then returns the plan.
- **State machine:** `launch-copilot-state.ts` is a pure reducer
  (`asset → parameters → plan → approval → review`). `review` is reachable only
  via `APPROVE` while `approval` is active, the acknowledgement is ticked and
  `evaluateApprovalGate(plan, acknowledged).allowed` is true. Changing the
  candidate or simulation, or going back, clears the acknowledgement.
- **Gate:** blocks on an invalid/unavailable configuration, any failed check, a
  simulation that has not run, or a missing acknowledgement. An `unavailable`
  oracle (e.g. restricted Pyth) is disclosed but does not block.
- **Dependency rule preserved:** `market-engine` depends only on `shared`; the
  Meteora SDK is still imported only by `@elf/meteora-adapter`.
- **Not in scope by design:** deployment, signing, LLM use (the Copilot plan itself; the separate AI Market Analysis feature is described in docs/security.md), price prediction,
  risk *scores*, and a "market duration" (the backend has no such parameter).

## Simulation Lab

`/design/lab?curve=<curveConfigId>` — an off-chain scenario view of one stored
curve configuration. A composition over existing pieces, not a second engine.

| Stage | Component |
|---|---|
| Scenario definitions | `simulation-engine/scenarios.ts` (unchanged; the six scenarios) |
| Override validation | `simulation-engine/lab.ts#resolveLabScenario` — only curve position (0–95%) and the side of each standard trade; anything else, or an unknown scenario, is rejected |
| Execution | `simulation-engine/simulate.ts#runScenario` (extracted from `runSimulation`; `runSimulation` now maps over it) → `meteora-adapter/quote.ts#simulateAtCurvePosition` |
| Reserves / graduation | SDK `getQuoteReserveFromNextSqrtPrice` (via `getQuoteReserveAtSqrtPrice`) + existing `computeGraduationStatus` |
| Checks | `market-engine/simulationLab.ts#evaluateLabRun`; configuration check shared with the Copilot (`configurationCheck`) via Meteora's own validator |
| Comparison | `compareLabRuns` — same-configuration runs only |
| API | `GET/POST /api/markets/simulation-lab` — rate-limited, strict zod (`.strict()`), loads the config by id, no DB writes |
| UI | `simulation-lab.tsx`, `simulation-lab-result.tsx`, `lab-charts.tsx`; session runs in `lab-state.ts` (`sessionStorage`, in-memory fallback) |

- **Engine correction made for the Lab.** `simulateAtCurvePosition` used to
  reposition the *config's* `sqrtStartPrice` to the scenario price, which turned
  that price into the curve floor — so every sell failed with "Insufficient
  Liquidity". It now quotes the ORIGINAL config against a virtual pool sitting
  at the scenario price via the SDK's public `swapQuote2`, exactly how a live
  pool is quoted. Buy results are byte-identical (regression-tested); sells now
  fill wherever the curve has depth.
- **New optional result fields** (`startPriceUsd`, `startQuoteReserveUsd`,
  `migrationThresholdUsd`, per-trade `reserveQuoteAfter`) are absent on results
  stored earlier; consumers treat absence as DATA UNAVAILABLE.
- **Simulated vs real graduation.** The one real DBC trigger (quote reserve ≥
  migration threshold) is evaluated on the simulated reserve and labelled
  `SIMULATED GRADUATION STATE`; it says nothing about any on-chain pool.
- **Not modelled:** volume, free-form liquidity change, price path over time,
  trade counts beyond the four standard trades. The UI lists these.
- **Off-chain guarantee:** the engine is tested against a connection that throws
  on any use; a static test asserts no Lab file signs, sends, builds
  transactions, touches wallet/key code or writes to the database.

## Market Health & Anomaly Engine

`packages/market-engine/src/health.ts` (`evaluateMarketHealth`) — pure, no I/O,
evaluation time is an input. It adds the *change-over-time* layer on top of the
issuer risk indicators, which already describe current state.

| Data | Existing source | Health signal |
|---|---|---|
| Indexed liquidity readings (`LiquidityHistory`) | indexer | LIQUIDITY_DROP |
| Trade totals (`Trade`), windowed | indexer; one grouped SQL per window | VOLUME_SPIKE, TRADE_FREQUENCY_SPIKE |
| Largest trades with signature and time | `Trade` | LARGE_TRADE |
| 24h top-wallet share | `getTopTraderVolumeShare` (existing) | TRADE_CONCENTRATION |
| DBC price, live Pyth reference | `getMarketOverview` / `getPythPriceComparison` | PRICE_DEVIATION (only against a live Pyth reference) |
| Pyth feed states | `summarizeOracleFeeds` (existing) | ORACLE_UNAVAILABLE, ORACLE_RESTRICTED |
| Indexer freshness | `getDataFreshness` (existing) | INDEXER_LAG |
| `GraduationEvent` | indexer | GRADUATION_REACHED |

**Threshold methodology.** Reused, not redefined: price deviation 10%, large
trade 10% of current liquidity, concentration 50% (all `RISK_THRESHOLDS`) and
indexer lag 300 s (`INDEXER_DELAYED_AFTER_SECONDS`, now one shared constant).
New, explicit and overridable (`HEALTH_THRESHOLDS`): liquidity drop > 20% from
the peak within 1 h; volume and trade frequency > 3× the market's *own*
trailing 24 h baseline (baseline shortened to the market's real age); a minimum
of 5 trades before any comparison is evaluated. All comparisons are strict
(">"), decided on unrounded values, and tested at their boundaries. These are
ELF-defined analytical parameters, not protocol values or industry standards.

**States.** WATCH if any WATCH event; else DATA UNAVAILABLE if the indexer has no
cursor or every activity signal is unavailable; else NORMAL. INFO events (oracle,
graduation) are availability facts and do not change status. A restricted Pyth
feed reads "Restricted — Pyth entitlement required".

**Timeline.** Only events that carry a real timestamp (a trade, a liquidity
reading, a curve-complete event). Status changes are not inferred because ELF
stores no status history.

**Anomaly detection is not fraud detection.** The engine reports that a
measurable quantity crossed a cutoff. It does not claim intent, manipulation or
wrongdoing, has no such methodology, and a test scans every generated string for
that language and for advice wording.

**Delivery.** Health is computed server-side inside `getIssuerDashboard` and
returned with the existing `/risk` payload (so the dashboard adds no polling);
`GET /api/markets/:id/health` returns the same object alone.

**Limitations.** Liquidity history is the quote reserve valued at the USD price
when the indexer ran (approximate for SOL-quoted markets); windows are anchored
to trade block times, so indexer lag delays detection; there is no pool-status
history; a graduated pool's DBC activity stops.

