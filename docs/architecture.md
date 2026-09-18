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
          │ @elf/tessera-   │  └────────┘     │
          │ adapter         │                 ▼
          └─────────────────┘         ┌───────────────────┐
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
packages/tessera-adapter   Feature-flagged Tessera API client (see below)
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
