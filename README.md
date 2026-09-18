# Equity Liquidity Foundry (ELF)

**Design the market, not just the token.**

ELF is an issuer-facing market-design and liquidity-launch platform for
tokenized equities and pre-IPO assets on Solana, built on Meteora's
Dynamic Bonding Curve (DBC). It takes an issuer from "I have a tokenized
asset" to "I have a live, monitored, real Meteora market" through one
flow: **Discover an asset → Market Profile → Curve Compiler → Simulation
→ Config Review → Wallet Approval → Meteora DBC Config/Pool → Live
Market → Trade → Market Analytics → Graduation Monitor** — and, once
live, anyone can buy or sell directly against the deployed curve from
the market page itself, with the on-chain price checked against Pyth in
real time.

Built for the Solana "Stocklana" hackathon, targeting the Meteora DBC,
Pyth, and PreStocks bounties: a real, live integration into
**PreStocks** (both the asset-selection step and a standalone `/assets`
discovery page), a real, in-app **Meteora
DBC swap widget** (not just a launch tool), and a **multi-source Pyth
price oracle** comparing the live on-chain price against the regulated
equity feed, the xStock feed, and the Ondo feed. Also includes a
feature-flagged, real-but-currently-unstable integration into
**Tessera** — see [Known limitations](#known-limitations).

Clawpump's agent-launch bounty was evaluated and deliberately not
pursued: it requires launching a token on a separate third-party
platform, a different product surface from ELF's issuer-facing Meteora
flow, and bolting it on under time pressure would have diluted focus
from the bounties ELF is a strong fit for.

## 1. Problem

Tokenized securities can exist on Solana without a well-designed
secondary market. Spinning up a Meteora DBC pool requires understanding
curve math, fee schedules, migration thresholds, and liquidity
distribution — none of which an equity issuer should need to learn from
scratch, and none of which look anything like a memecoin launch when done
right.

## 2. Why Solana

Sub-second finality and sub-cent fees make a bonding-curve price-discovery
mechanism practical for assets that would otherwise need a market maker
or an off-chain order book to bootstrap liquidity. Meteora's DBC program
is a mature, audited, widely-used primitive on Solana specifically for
this problem.

## 3. Why Meteora DBC

Meteora's Dynamic Bonding Curve gives every launch a permissionless,
programmatic price-discovery curve with configurable fee schedules
(linear/exponential decay, dynamic fee), a defined migration path into a
permanent DAMM v2 pool once a quote-reserve threshold is reached, and
first-buy support so an issuer can seed price on deployment. ELF never
invents its own AMM math or account layout — every config, pool, and
quote in this product is built with the official
`@meteora-ag/dynamic-bonding-curve-sdk` (pinned at `1.5.12`). See
[docs/market-model.md](docs/market-model.md) for exactly which SDK
functions back which feature.

## 4. Architecture

See [docs/architecture.md](docs/architecture.md) for the full diagram and
data-flow walkthrough. Short version: a pnpm/Turborepo monorepo —
`apps/web` (Next.js 16, App Router) talks to seven workspace packages,
only one of which (`@elf/meteora-adapter`) ever imports the Meteora SDK
directly.

```
apps/web                   Next.js UI + API routes
packages/shared             Domain types + zod schemas
packages/market-engine      Curve compiler, market-quality scoring, graduation math
packages/simulation-engine  Scenario simulation against real curve math
packages/meteora-adapter    The only package touching the Meteora SDK
packages/solana             Connection/pubkey/well-known-mint helpers
packages/prestocks-adapter  Live PreStocks API integration
packages/tessera-adapter    Feature-flagged Tessera integration
packages/db                 Prisma client + generated types
prisma/schema.prisma        Postgres schema
tests/                      market-engine, simulation, integration suites
docs/                       architecture.md, security.md, market-model.md
```

## 5. Setup

Prerequisites: Node 20+, pnpm, Docker (for local Postgres).

```bash
git clone <this repo>
cd "SPLANA HACATHON"
pnpm install
cp .env.example .env        # then fill in values, see below
docker compose up -d        # starts local Postgres on :5432
pnpm db:migrate              # applies prisma/schema.prisma
```

## 6. Environment variables

See [.env.example](.env.example) for the full, current list. Summary:

| Variable | Where used | Notes |
|---|---|---|
| `DATABASE_URL` | server only | Postgres connection string |
| `SOLANA_RPC_URL` | server only | may embed an API key; never sent to the browser |
| `NEXT_PUBLIC_SOLANA_RPC_URL` | browser | public endpoint, no secrets |
| `NEXT_PUBLIC_APP_URL` | both | used to build token metadata URIs |
| `PRESTOCKS_API_URL` | server only | defaults to the live public PreStocks API |
| `TESSERA_ENABLED` | server only | must be `"true"` to enable; disabled by default |
| `PYTH_API_KEY` | server only | **required for live Price Oracle data.** Hermes's `/v2/updates/price/latest` requires a Bearer token as of the current API version (verified live — see Known limitations); without it, the panel renders its honest "not configured" state, never fake numbers |
| `PYTH_HERMES_URL` | server only | defaults to `https://hermes.pyth.network`; override only for testing |
| `TESSERA_API_URL` | server only | defaults to the live Tessera API |

## 7. Local development

```bash
pnpm dev          # apps/web on http://localhost:3000
pnpm test         # vitest: market-engine, simulation, integration
pnpm typecheck    # tsc --noEmit across every package
pnpm build        # next build (also the production build check)
```

## 8. Testing

- **Unit** (`tests/market-engine`): curve-compiler determinism and
  scoring, market-quality scoring, graduation percentage/regime math.
- **Simulation** (`tests/simulation`): runs all six scenarios against the
  real Meteora curve math (no mocks), checks monotonicity and
  determinism.
- **Integration** (`tests/integration`): a genuine end-to-end devnet
  test — funds a keypair, sends and confirms a real `createConfig`
  transaction, then a real `createPoolWithFirstBuy` transaction, then
  reads the live pool state and a live quote back from chain. Skips
  gracefully (does not fail the suite) if devnet or its airdrop faucet is
  unreachable — the public devnet faucet is aggressively rate-limited per
  source IP and was exhausted in this project's own sandboxed dev
  environment. Set `TEST_FUNDED_KEYPAIR_SECRET` (a base58 secret key) to
  run it against a pre-funded devnet wallet instead of requesting an
  airdrop.

Run everything: `pnpm test`.

## 9. Deployment

- **Frontend + API routes**: Vercel (single Next.js project;
  `apps/web` as the project root, or configure a monorepo build).
- **Database**: any managed Postgres (Neon, Supabase) — set `DATABASE_URL`
  and run `pnpm db:deploy` (`prisma migrate deploy`) once.
- **RPC**: use a production Solana RPC provider (Helius, Triton, QuickNode,
  ...) for `SOLANA_RPC_URL`; a lighter/public one is fine for
  `NEXT_PUBLIC_SOLANA_RPC_URL`.

Before deploying: `pnpm lint && pnpm typecheck && pnpm test && pnpm build`
must all pass.

## 10. Mainnet vs. demo

The app defaults to devnet (`https://api.devnet.solana.com`) in
`.env.example`. To run against mainnet, point both RPC variables at a
mainnet endpoint — the app has no devnet-only code paths, but real SOL/USDC
and real Meteora protocol fees apply. `QuoteToken` resolves the correct
USDC mint (mainnet vs. devnet) automatically from the RPC URL
(`@elf/solana#resolveClusterFromRpcUrl`).

Every simulation result is labeled `SIMULATED` in both the API response
and the UI, and is never persisted or displayed as if it were live market
data.

## 11. Open-source dependencies

Notably: `@meteora-ag/dynamic-bonding-curve-sdk`, `@solana/web3.js`,
`@solana/wallet-adapter-*`, Next.js 16, Prisma, Recharts, Tailwind CSS,
Zod, BN.js. Full list in each package's `package.json`.

Official Meteora resources used while building this:
- https://docs.meteora.ag/developer-guides/dbc
- https://github.com/MeteoraAg/dynamic-bonding-curve-sdk
- https://github.com/MeteoraAg/dynamic-bonding-curve

## 12. Security considerations

See [docs/security.md](docs/security.md). Highlights: ELF never handles
a user's private key; the two ephemeral keypairs the server does
generate (a new config account, a new base-mint account) are throwaway
program-account identities partially-signed server-side, never exposed
to the browser; every public key from a client is re-validated
server-side; transaction-building is rate-limited and separated from
read-only analytics.

## 13. Known limitations

- **Holder distribution is sampled**, not a full census (top 20 accounts
  via `getTokenLargestAccounts`) — disclosed in the Market Quality Score
  tooltip.
- **Tessera integration is feature-flagged off by default.** Re-verified
  live during this pass: one plain request succeeded, then three
  immediate follow-ups all hit a TLS connection reset — the same
  instability first observed 2026-09-15. Still not force-enabled in the
  demo path; the Asset Discovery page shows an honest "temporarily
  unavailable" state for it instead.
- **The Price Oracle panel needs `PYTH_API_KEY`** to show live numbers.
  Hermes's feed-discovery endpoint (`/v2/price_feeds`) is open, but its
  price-pull endpoint now requires a Bearer token — confirmed live
  (`401` with no key). Without one, the panel correctly shows "not
  configured" rather than fabricating a price.
- **The in-app Trade widget only supports pre-migration DBC pools.**
  Once a market graduates to DAMM v2, its liquidity moves to a
  permanent, differently-shaped pool that the DBC swap instruction this
  widget builds no longer applies to; the market page shows a graduated
  state instead of a broken trade form.
- **Rate limiting is in-memory**, fine for a single instance, not for a
  multi-instance production deployment (see docs/security.md).
- **Clawpump (agent-assisted launch) was evaluated and not implemented**
  — it requires launching on a separate third-party platform, a
  different product surface than ELF's issuer-facing Meteora flow.
- **The devnet integration test requires real (free) devnet SOL** to run
  its transaction-sending steps (config → pool → swap) to completion;
  the public faucet is commonly rate-limited in shared/sandboxed
  environments — reproduced during this pass. See [Testing](#8-testing).

## 14. Definition of done — status

- [x] Wallet connects (Solana Wallet Adapter, Phantom/Solflare)
- [x] Asset can be selected (manual entry + live PreStocks)
- [x] Market profile can be created
- [x] Configuration is generated (3 deterministic candidates + comparison table)
- [x] Simulation works (6 scenarios × 4 trade sizes, real curve math)
- [x] Recommended configuration is explainable (rationale + score breakdown)
- [x] Meteora DBC integration works (real SDK, verified end-to-end on devnet)
- [x] A real pool can be launched (createConfig + createPoolWithFirstBuy)
- [x] A real transaction can be demonstrated (devnet integration test; UI
      wallet-approval flow verified in-browser)
- [x] Live pool state is displayed (real on-chain reads, polling dashboard)
- [x] Graduation progress is displayed
- [x] A live market can be traded (real Meteora DBC swap, wallet-signed,
      no ownership gate — see the Trade panel on `/markets/[marketId]`
      and `/pools/[poolAddress]`)
- [x] On-chain price is checked against Pyth (equity, xStock, and Ondo
      feeds, discovered live and compared side by side)
- [x] Live assets can be browsed before designing a market
      (`/assets` — PreStocks live, Tessera with an honest fallback)
- [x] Errors are handled (validation, RPC unavailable, provider
      unavailable, wallet rejection, insufficient funds, blockhash
      expiry, not-found)
- [x] README is complete
- [x] Tests pass (`pnpm test` — 25/25 unit+simulation; integration test
      passes/gracefully skips depending on devnet faucet availability)
- [x] Production build passes (`pnpm build`)
- [ ] Deployment — not deployed to a public URL as part of this session;
      see [Deployment](#9-deployment) for the exact steps
- [x] No secrets committed (`.env` git-ignored, `.env.example` has only placeholders)
