# ELF Security Notes

## Private keys

ELF never stores, transmits, or accepts a user's wallet private key.
All user-initiated transactions are built server-side, returned as an
unsigned (or partially-signed, see below) base64 transaction, and signed
in the browser via the Solana Wallet Adapter (`signTransaction`). The
server never sees a signature secret.

### The one kind of "private key" the server does generate

`POST /api/dbc/config` and `POST /api/dbc/pool` each generate a fresh,
single-use `Keypair` server-side (the new config account, and the new
base-token mint account). These are **not user asset-holding keys** —
they're throwaway program-account identities required because Meteora's
`createConfig`/`createPool` instructions create new on-chain accounts,
which must co-sign their own creation transaction. The server partially
signs with these ephemeral keypairs before returning the transaction, so
their secret key is never exposed to the browser at all — only the
wallet's own signature is added client-side. These keypairs hold no
funds and have no further use after the transaction confirms.

**ELF V1 addition:** to survive a browser refresh mid-deployment
(`Launch.stage = AWAITING_CONFIG_SIGNATURE` / `AWAITING_POOL_SIGNATURE`),
these ephemeral secrets are persisted base58-encoded on the `Launch` row
(`configKeypairSecret`, `baseMintKeypairSecret`) for the window between
"transaction built" and "transaction confirmed on-chain," then **cleared
to `null`** the moment the corresponding account is verified to exist
on-chain (`configExistsOnChain`, `getLivePoolState` — real reads, never a
client's self-report). This is a deliberate, disclosed tradeoff: the
alternative (never persisting them) means a page refresh mid-signature
permanently orphans that attempt, since Meteora's `createConfig`/
`createPool` require that specific account's keypair to co-sign — there
is no way to "retry with a different keypair" without abandoning the
half-created account. This does **not** change the "never a user wallet
key" guarantee above; these rows never touch a user's own keys.

## Transaction & network hardening (ELF V1 Phase 2)

- **Network identity is verified, not assumed.** Before building any
  transaction, `assertClusterMatches` (`packages/solana/src/network.ts`)
  confirms the RPC endpoint's real genesis hash matches the cluster its
  URL claims to be (`SOLANA_RPC_URL` containing `"devnet"` vs. not). A
  mismatch throws `NetworkMismatchError` and the request fails closed —
  no transaction is ever built against an unverified network.
- **Transactions are simulated before the wallet ever sees them.**
  `simulateBeforeSigning` (`packages/meteora-adapter/src/simulate.ts`)
  runs `connection.simulateTransaction` on the fully-assembled,
  partially-signed transaction; a failure surfaces as `simulation_failed`
  (with the last 10 simulation log lines) instead of only being
  discoverable after a wasted wallet round-trip.
- **Account ownership can be verified**, not just address format —
  `assertAccountOwnedByProgram` confirms an address is genuinely owned by
  the expected program (e.g. the real Meteora DBC program,
  `DYNAMIC_BONDING_CURVE_PROGRAM_ID`, re-exported from
  `@elf/meteora-adapter`) before it's trusted.

## Input validation

- All request bodies are validated with zod schemas in `@elf/shared`
  (`packages/shared/src/schemas.ts`) before any database or RPC call.
- Every public key received from the client (`payerPublicKey`,
  `feeClaimerPublicKey`, `poolCreatorPublicKey`, `poolAddress`, ...) is
  re-validated server-side with `new PublicKey(...)` via
  `@elf/solana#parsePublicKeyOrThrow` — the zod regex check is a fast
  client-side pre-check, not the security boundary.
- Malformed public keys return a `validation_error` (400), never a raw
  stack trace.

## Read/write separation

Analytics endpoints (`GET /api/pools/:poolAddress/*`, `GET
/api/dbc/:poolAddress`, `GET /api/dbc/:poolAddress/quote`) only read
on-chain state — they never construct a transaction. Transaction
construction is isolated to `POST /api/dbc/config` and `POST
/api/dbc/pool`, which is where all wallet-address validation and
rate-limiting for transaction-building is concentrated.

## Rate limiting

A minimal in-memory fixed-window limiter (`src/lib/server/rate-limit.ts`)
is applied to every public POST endpoint and to `GET /api/assets`. This
is adequate for a single-instance deployment; a multi-instance production
deployment should replace it with a shared store (e.g. Upstash Redis) —
the in-memory map does not coordinate across processes.

## Environment variables

- `DATABASE_URL` and `SOLANA_RPC_URL` are server-only and are never
  referenced from a `"use client"` file or a `NEXT_PUBLIC_*` variable.
- `NEXT_PUBLIC_SOLANA_RPC_URL` is a separate, intentionally public
  variable for the browser's wallet-adapter `Connection` — it should
  point at a public or rate-limited-for-browsers endpoint, never one with
  an embedded API key.
- `.env` is git-ignored; `.env.example` documents every variable with no
  real values.

## Transaction safety

- Every transaction is built with a freshly fetched blockhash
  (`connection.getLatestBlockhash`) immediately before being returned to
  the client, minimizing the blockhash-expiry window.
- The UI surfaces distinguishable error states for: wallet rejection,
  insufficient funds, blockhash expiration, and RPC unavailability (see
  `apps/web/src/components/design/review-step.tsx#friendlyTxError`).
- No transaction is ever marked "confirmed" in the UI without the chain reporting it
  (`getSignatureStatuses`, HTTP polling) at `confirmed`/`finalized` with no error. A transaction
  is sent exactly once (`submitAndConfirm`); a confirmation timeout or an unreachable RPC yields
  an "unconfirmed" state that keeps the signature and never resends. The confirmation module
  has no send method in its type, and a test fails if any app code calls `confirmTransaction`
  or a WebSocket subscription.

## Provider adapters

- `@elf/prestocks-adapter` calls a live, public, unauthenticated
  third-party API. Responses are validated with zod
  (`.safeParse`) and malformed individual entries are dropped rather than
  failing the whole listing. A provider outage surfaces as
  `provider_unavailable` (503), never fabricated data.

## Idempotency (ELF V1 Phase 3)

`Launch` has a unique constraint on `curveConfigId` — at most one
deployment attempt ever exists per curve config. `POST /api/dbc/config`
and `POST /api/dbc/pool` are both safe to retry: they check real
on-chain state before deciding whether to resume an in-flight attempt
(same ephemeral keypair, fresh blockhash) or report the step as already
confirmed, rather than trusting the client's history or generating a
second on-chain account for the same intent. See `docs/architecture.md`
for the full `LaunchStage` lifecycle.

## Final-sprint additions (trading terminal, explorer, risk, analyst)

- **Swap route (`POST /api/dbc/:pool/swap`)** keeps every existing control:
  rate limit, zod validation, network/cluster assertion, and
  simulate-before-sign (`prepareForWalletSignature`). Server-side it never
  signs anything; the connected wallet signs client-side. The request now
  accepts an exact `amountTokens` for sells only, with strict validation
  (exactly one of `amountUsd`/`amountTokens`; tokens only for sells; finite,
  positive, bounded) — see `tests/security/swap-validation.test.ts`.
- **A trade is never shown as confirmed on submission.** The client waits for
  `confirmed` commitment and treats an on-chain `err` as Failed
  (`TradeOnChainFailure`), keeping the real signature for the explorer link.
- **No secret reaches an API response.** New routes build responses from
  explicit fields (never a `Launch` row). `tests/security/api-secret-hygiene.test.ts`
  statically scans **every** API route and client component: no wholesale
  `Launch` serialization, no keypair-secret column names outside the four
  deployment routes, no `PYTH_API_KEY` in any route, no server-only env var read
  in a client component. `tests/security/trades-route.test.ts` proves the values
  against real Postgres with seeded fake secrets.
- **Pyth key** is read only in the `server-only` module `pyth.ts`; verified
  absent from the built client bundle. Entitlement failures are classified
  (`not_configured / unauthenticated / entitlement_restricted / rate_limited /
  unavailable`) and shown as exactly that — no feed is substituted or faked.
- **Analyst endpoint (`POST /api/markets/:id/analyze`)** takes no body (the
  server reads the market itself, so a caller cannot feed it invented numbers),
  is rate-limited to 10/min, makes no external call, and its output passes an
  advice/prediction guardrail. It holds no API key.
- **Groq (`POST /api/ai/market-analysis`) and CoinCap (`GET /api/market/external`).**
  Both keys are server-only (`GROQ_API_KEY`, `COINCAP_API_KEY`): no `NEXT_PUBLIC_`
  variant exists, no client component references a provider origin or key name
  (asserted in `tests/security/ai-integration-hygiene.test.ts`), the key is used only
  as the Bearer credential to the fixed provider origin, and it is never logged,
  thrown, returned or placed in a URL. The built client bundle was scanned for the
  key values and provider origins (zero hits).
  - *Untrusted output.* Groq's reply is schema-validated (strict, no extra fields),
    every digit must match a value in the server-built snapshot, advice/prediction
    language is rejected (same guardrail as the analyst), and addresses/links are
    dropped. Statements that fail are discarded, not repaired; if the summary fails
    the whole answer is discarded.
  - *No client-supplied facts.* The AI route accepts exactly `{ marketId }`
    (strict schema, 1 KB body cap); the server reads the authoritative data.
  - *Prompt injection.* The prompt is fixed; the model sees only numbers and short
    enums the server produced — no asset names, addresses, provider text or user
    text — so there is no attacker-controlled string in the prompt. CoinCap data is
    never sent to the model.
  - *Availability.* Rate limits (AI 5/min, external 30/min), 20 s / 8 s timeouts,
    bounded response sizes, short TTL caches (AI 60 s keyed by snapshot content;
    CoinCap 30 s), and closed sets of failure reasons — provider error bodies are
    never forwarded.
  - *CoinCap responses* are untrusted: parsed, range-checked (positive price,
    valid timestamp, id must equal the id asked for), normalised, and reported as
    "malformed" rather than repaired. Asset ids are validated before any request.
  - *Residual risk.* The model's qualitative wording (e.g. "rose" vs "fell") and
    spelled-out numbers are not machine-verified; the UI labels the text
    AI-generated and shows the server-built evidence beside it. The in-memory rate
    limiter is per-instance (as everywhere else in this app).
- **New read routes are rate-limited** (`/risk` 30/min, `/analyze` 10/min,
  and the previously unlimited `/quote` now 60/min, since the terminal polls it).
- **New SQL** (`getTopTraderVolumeShare`) uses a Prisma tagged template —
  parameterised, not string-built.
- Balances are read client-side via the public RPC only; an unreadable balance
  is `null`/"unavailable", never `0`.

Resolved (2026-09-19): the deployment wizard and the trading terminal now share one confirmation
path (`submitAndConfirm` → `confirmTransactionByPolling`), which checks the on-chain `err`, is bounded
by `lastValidBlockHeight` and a hard time limit, and works with RPC providers that do not support
WebSocket subscriptions.

## Simulation Lab and Market Health

**Simulation Lab (`POST/GET /api/markets/simulation-lab`)**
- Off-chain by construction: it imports no wallet, keypair, transaction-building
  or deployment code and performs no database writes. `tests/security/simulation-lab-off-chain.test.ts`
  scans every Lab file for signing/sending/key/deployment/DB-write patterns, and
  the engine is exercised against a connection that throws on any use.
- The client names a stored curve config by id and one of six scenarios; the
  request schema is `.strict()`, so extra fields (e.g. curve parameters or
  liquidity) are rejected with 400. Curve position is bounded to 0–95%, sides to
  exactly four `buy|sell`, ids to 64 characters.
- Rate-limited (30/min per client key for runs, 60/min for context reads); the
  response is assembled from explicit fields and never serializes a database row.
- Results are session-scoped in the browser. Stored runs are treated as
  untrusted on load: anything without the off-chain labels or expected shape is
  dropped, and only `sessionStorage` is used (never `localStorage`).

**Market Health (`GET /api/markets/:id/health`, and `health` inside `/risk`)**
- Read-only, same public-read pattern as the other market analytics routes:
  market data is public, there is no ownership assumption taken from the client.
- All database access is time-bounded and capped (500 liquidity rows, 5 largest
  trades, grouped aggregates) and parameterized (tagged `$queryRaw`); there is no
  string-built SQL.
- Rate-limited (30/min), standard error envelope, no stack traces, no secrets;
  the Pyth key stays inside the server-only Pyth module.
- Wording is constrained: the engine never states or implies fraud,
  manipulation or intent, never gives advice, and a test enforces this.

## Network guard (wallet / cluster compatibility)

**The bug it closes.** The Wallet Standard adapter's `signTransaction()` sends the transaction to the wallet
*without a `chain`* (only `sendTransaction()` passes one). The wallet therefore signs and simulates on whatever
network it has active — Mainnet for a default MetaMask — no matter which RPC ELF built the transaction against.
A devnet transaction (devnet blockhash, devnet fee payer) shown to a Mainnet wallet cannot simulate there, which
surfaces as "reverted during simulation / unknown error". ELF's own server-side simulation was passing.

**What was proven next (read from MetaMask's injected Wallet Standard code).** The chain-less `signTransaction` was only
part of it. MetaMask (1) creates a **Mainnet** session in `standard:connect` (no network argument exists), (2) sends every
`signMessage` / `signTransaction` with `scope: wallet.scope`, and (3) **ignores the `chain` field** it is given;
`solana:signMessage` has none. Its session in fact grants Devnet as well, but it activates Mainnet first. So the network in
the approval window is the wallet's *active session scope*, and no per-call parameter can change it.

**What ELF does now.**
- One definition of the cluster: the RPC URL, via `resolveClusterFromRpcUrl` (server and browser share it; the server also
  verifies the RPC's genesis hash before every transaction build, and the browser confirms `/api/health` reports the same cluster).
- The wallet's **active scope is read** (`wallet.scope`, CAIP-2) and compared with the configured cluster. Before ANY
  `signMessage` (the ownership proof) or `signTransaction`, ELF refuses unless they match:
  "MetaMask is connected to Solana Mainnet. Switch this dapp to Solana Devnet before continuing." Buttons are disabled and the
  wallet is never asked. Wallets that expose no active scope fall back to the advertised-chains check (`compatible` /
  `mismatch` / `unverifiable` with an advisory).
- An explicit **Switch** button (never automatic) asks the wallet, through its own session API, for a session that includes
  the configured cluster for the connected account, and — only if the granted session really contains that scope for that
  exact account — selects it (the assignment MetaMask's own `updateSession` performs). It re-reads the scope and throws unless
  it now matches. Nothing is signed. If the wallet later resets its scope, the sign-time guard blocks again.
- The wallet still performs every signature; ELF never sees a key and still submits through its own connection with
  simulation on. `chain` is still passed to wallets that honour it.
- A sanitized diagnostic is logged per operation (configured cluster, advertised chains, active scope, requested chain,
  public key, operation, allowed) and never keys, message text or transaction bytes.
- Explorer links are produced only by `explorerTxUrl` / `explorerAddressUrl` for the configured cluster.

**Limits.** The active-scope check relies on MetaMask's non-standard `scope` / `client` / `updateSession` members, which can
change between MetaMask versions (the guard then degrades to the advertised-chains check). Wallets that expose no active
network (e.g. legacy native adapters) cannot be verified; check the network in the wallet's approval window. Mainnet support
is unchanged: configure the mainnet RPC and the guard requires a mainnet-capable wallet.

## Known limitations (see also README)

- The in-memory rate limiter is still the biggest scaling gap for a
  multi-instance production deployment.
- The indexer (`docs/indexer.md`) is polling-based with no reorg
  handling, and one event-field-casing assumption was not independently
  verified against a live decoded event (documented in `docs/indexer.md`,
  fails loudly rather than silently if wrong).
- No environment-separation guard exists yet — nothing currently stops a
  misconfigured deploy from mixing devnet and production settings beyond
  the network-identity check at transaction-build time.
- Holder-distribution scoring samples the 20 largest token accounts via
  `getTokenLargestAccounts`, not a full holder census — this is disclosed
  in the ELF Market Quality Score tooltip in the UI.
