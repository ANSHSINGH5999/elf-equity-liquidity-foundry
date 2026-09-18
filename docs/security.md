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
- No transaction is ever marked "confirmed" in the UI without an actual
  `connection.confirmTransaction` round-trip.

## Provider adapters

- `@elf/prestocks-adapter` calls a live, public, unauthenticated
  third-party API. Responses are validated with zod
  (`.safeParse`) and malformed individual entries are dropped rather than
  failing the whole listing. A provider outage surfaces as
  `provider_unavailable` (503), never fabricated data.
- `@elf/tessera-adapter` is disabled by default (`TESSERA_ENABLED` must
  be explicitly set to `"true"`) after observed instability during
  integration (a working response followed by repeated TLS failures
  within the same minute). The core Meteora flow has no dependency on it.

## Idempotency (ELF V1 Phase 3)

`Launch` has a unique constraint on `curveConfigId` — at most one
deployment attempt ever exists per curve config. `POST /api/dbc/config`
and `POST /api/dbc/pool` are both safe to retry: they check real
on-chain state before deciding whether to resume an in-flight attempt
(same ephemeral keypair, fresh blockhash) or report the step as already
confirmed, rather than trusting the client's history or generating a
second on-chain account for the same intent. See `docs/architecture.md`
for the full `LaunchStage` lifecycle.

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
