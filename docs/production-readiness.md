# ELF Production Readiness Audit

Phase 1 deliverable for the ELF V1 initiative. This is an audit only — no
functionality was changed while writing it. Scope: everything under
`apps/web`, `packages/*`, `prisma/`, `tests/` as of the working MVP
(~2,900 lines of ELF-authored TypeScript across 7 packages + the Next.js
app).

## Current architecture

- **Monorepo**: pnpm workspaces + Turborepo. One deployable app
  (`apps/web`, Next.js 16 App Router on Turbopack) plus seven library
  packages consumed as TypeScript source (no build step;
  `transpilePackages` in `next.config.ts`).
- **Adapter isolation**: `packages/meteora-adapter` is the only package
  that imports `@meteora-ag/dynamic-bonding-curve-sdk`. `market-engine`
  and `simulation-engine` depend on it for curve math but never touch SDK
  types directly in their public APIs — they consume/return
  `@elf/shared` domain types.
- **Persistence**: Postgres via Prisma. Schema lives at
  `prisma/schema.prisma` (repo root, per original spec); the generated
  client lives in `packages/db/generated` and is re-exported through
  `packages/db/src/index.ts` as a singleton-safe `prisma` export plus the
  `Prisma` namespace.
- **Blockchain access pattern**: request-scoped. Every analytics read
  (`getPoolAnalytics`) opens a fresh `Connection` from `SOLANA_RPC_URL`,
  reads live account state via `StateService`, and writes one
  `MarketSnapshot` row as a side effect. There is no persistent indexing
  process, no websocket subscription, and no backfill mechanism.
- **Transaction construction**: two-step, matching a real Meteora SDK
  constraint — `createPoolWithFirstBuy` reads the config account back
  from chain, so it cannot be built until the `createConfig` transaction
  has actually confirmed. Both steps: build in an API route → attach a
  fresh blockhash → partially sign with a server-generated ephemeral
  keypair (config account / base-mint account, never a user key) →
  return base64 → wallet signs client-side → client sends and confirms.
- **Wallet integration**: `@solana/wallet-adapter-react` +
  `wallet-adapter-react-ui`, Phantom + Solflare adapters, wired at the
  root layout. All signing happens in `review-step.tsx`.
- **Simulation logic**: real Meteora curve math
  (`PoolService.getQuoteFromInputAmount`) against the real
  `ConfigParameters` a candidate would deploy with, repositioned along
  the curve via a documented sqrt-price interpolation
  (`getCurvePositionStartPrice`) to approximate the six required demand
  scenarios. Fully unit-tested and deterministic.
- **API surface**: 19 route handlers under `apps/web/src/app/api`,
  organized by resource (`assets`, `markets`, `dbc`, `pools`,
  `providers`). Every handler validates input with a zod schema from
  `@elf/shared`, wraps DB/RPC calls in try/catch, and returns a uniform
  `{ error: { code, message, requestId } }` envelope via
  `apiError()` — no raw stack traces reach the client.

## Current strengths

- Clean separation of concerns; the adapter-isolation rule has held
  throughout (verified by grep: no `@meteora-ag/*` import outside
  `packages/meteora-adapter`).
- Every number the UI shows is either traced to a real on-chain read, a
  real (labeled `SIMULATED`) curve-math result, or a deterministic
  formula over declared inputs — no fabricated data paths exist.
- Zod validation at every API boundary; public keys are re-validated
  server-side with `PublicKey` construction, not just regex.
- Deterministic, testable core logic (`market-engine`,
  `simulation-engine`) with no hidden state or randomness.
- 26/26 tests passing, including a genuine (not mocked) end-to-end
  devnet integration test that sends and confirms real transactions.

## Critical risks

1. **No idempotency guard on deployment.** `POST /api/dbc/config`
   unconditionally `prisma.launch.create()`s. A double-click, a browser
   retry after a slow response, or a user re-submitting after a
   perceived failure all produce a *new* `Launch` row and a *new* config
   keypair — not a rejected duplicate. There is currently no unique
   constraint or client-supplied idempotency key that would catch this.
2. **No transaction simulation before signing.** `prepareForWalletSignature`
   attaches a blockhash and partially signs, but never calls
   `connection.simulateTransaction`. A transaction that would fail
   on-chain (e.g. insufficient balance, stale account) is only
   discovered after the wallet round-trip, producing a worse error
   experience than necessary and wasting a blockhash window.
3. **No explicit network/program-identity assertion.** The code trusts
   `SOLANA_RPC_URL` implicitly. Nothing checks "the program ID this
   transaction targets is Meteora's DBC program on the network the user's
   wallet is connected to" before returning a transaction for signing.
4. **Wizard state is not persisted.** `DesignWizard` holds `asset`,
   `curveConfigs`, `selectedCandidate` in plain `useState`. A refresh at
   any step loses all progress; the only server-persisted resumption
   point is whatever was already written to Postgres (asset, market
   profile, curve configs, and — once step 5 starts — the `Launch` row),
   but the UI has no code path to rehydrate from a `launchId` in the URL.
5. **No indexer means incomplete historical data.** `MarketSnapshot` is
   written only when a client polls `/metrics` (every 15s while a
   dashboard tab is open). Volume is computed as the sum of absolute
   quote-reserve deltas between snapshots — real signal, but with gaps
   whenever nobody was watching, and no per-trade granularity (no
   trader, no side, no individual price) at all.
6. **In-memory rate limiting** (`rate-limit.ts`) does not coordinate
   across instances — a multi-instance production deployment would
   effectively have no rate limit.
7. **No environment-separation guard.** Nothing fails fast if
   `SOLANA_RPC_URL` contains `devnet` while other signals suggest a
   production deploy, or if a required env var is simply missing —
   failures would surface lazily, mid-request, as generic 500s.
8. **No structured logging or health endpoints.** `apiError()` logs one
   JSON line per error; there's no request-scoped logging of
   deployment attempts, transaction signatures, or RPC latency, and no
   `/api/health`.

## Missing components (relative to ELF V1 spec)

- Blockchain indexer (`packages/indexer` does not exist)
- `Market`, `PriceHistory`, `LiquidityHistory`, `Trade`, `GraduationEvent`
  Prisma models
- Deployment lifecycle state machine beyond the current single
  `PoolStatus` enum on `Launch`/`MarketSnapshot`
- `/issuer` dashboard
- `/markets/[marketId]` detail page (closest existing analog:
  `/pools/[poolAddress]`)
- Alert architecture (no rules engine, no notification model)
- `/api/health`, `/api/indexer/health`
- Environment-separation validation module
- `docs/indexer.md`, `docs/deployment.md`, `docs/api.md`

## Recommended implementation order

Matches the priority order given in the ELF V1 brief exactly:
security/idempotency hardening first (cheapest, highest-leverage, no new
infra), then the indexer and schema (foundational for everything
analytics-related), then analytics/scoring/dashboards built on top of
real indexed data, then alerts/API cleanup/environment/observability,
then expanded testing and docs last (so they document the final shape
rather than an intermediate one).

The one sequencing risk: **do not build the issuer dashboard or market
detail page (P8/P9) against snapshot-based analytics if the indexer
(P4) is landing in the same effort** — building twice is wasted work.
Recommend gating P8/P9 on P4–P6 being merged first, exactly as the
priority order already specifies.

## Security concerns

- Ephemeral config/mint keypairs are generated and partially signed
  server-side per request, never exposed to the browser — correct today,
  and must remain true after idempotency changes (a retried request must
  not reuse a keypair whose partial signature was already returned to a
  *different* client session).
- Rate limiting and environment separation are the two gaps most likely
  to matter before a public deployment (see Critical risks #6, #7).
- No secrets currently reach the client bundle (verified:
  `NEXT_PUBLIC_*` vars are limited to RPC URL and app URL, both
  non-secret by design). This discipline must be preserved as new server
  modules (indexer, alerts) are added.

## Mainnet blockers

In order of severity:

1. No transaction simulation before signing (real funds at stake on
   mainnet; currently only devnet has been exercised).
2. No idempotency protection on deployment (duplicate on-chain pools cost
   real SOL to create on mainnet).
3. No network-identity assertion (a misconfigured RPC pointing at the
   wrong cluster would not be caught before a signing prompt).
4. No indexer / incomplete historical data (issuers cannot trust volume
   figures for real decision-making yet).
5. In-memory rate limiting (fine for a single-instance demo; not for a
   public mainnet deployment under real load).
6. No environment-separation guard and no fail-fast startup validation.

None of these require an architectural rewrite — all are additive
hardening on top of the existing, working flow, consistent with the "do
not rewrite" constraint for ELF V1.
