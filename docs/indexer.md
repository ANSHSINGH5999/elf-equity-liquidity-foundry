# ELF Indexer

## What it does

For every deployed pool (every `Launch` with a `poolAddress`), the
indexer:

1. Fetches new transaction signatures for that pool address since its
   last-seen signature (`IndexerCursor`), oldest-first.
2. For each, decodes the real DBC program events in its logs using
   Anchor's own `EventParser` against the SDK's bundled IDL (via the
   `DynamicBondingCurveClient`'s own `Program` coder — never a
   hand-rolled log-format guess; see `packages/meteora-adapter/src/events.ts`).
3. Writes `Trade` + `PriceHistory` + `LiquidityHistory` rows for every
   `EvtSwap`/`EvtSwap2`/`EvtSwap2WithTransferHook` event, and a
   `GraduationEvent` row for every `EvtCurveComplete`/
   `EvtCurveCompleteWithTransferHook` event.
4. Advances the pool's cursor.

Real IDL event field names (verified against the installed SDK's bundled
IDL, `@meteora-ag/dynamic-bonding-curve-sdk@1.5.12`):

- `EvtSwap2`: `pool`, `config`, `trade_direction`, `swap_parameters`,
  `swap_result` (`SwapResult2`: `included_fee_input_amount`,
  `excluded_fee_input_amount`, `amount_left`, `output_amount`,
  `next_sqrt_price`, `trading_fee`, `protocol_fee`, `referral_fee`),
  `quote_reserve_amount`, `migration_threshold`, `current_timestamp`.
- `EvtCurveComplete`: `pool`, `config`, `base_reserve`, `quote_reserve`.
- `EvtInitializePool`: `pool`, `config`, `creator`, `base_mint`,
  `pool_type`, `activation_point`.

## Known uncertainty: field-name casing

The IDL declares these fields in snake_case. Anchor's Borsh event
decoder may or may not normalize them to camelCase depending on
version/config — this was **not independently confirmed against a live
decoded event**, because no funded devnet pool with real trade activity
was available at the time this was built (the public devnet airdrop
faucet was exhausted in this project's sandboxed environment — see
`tests/integration/meteoraAdapter.test.ts`). Rather than guess and risk
silently reading `undefined` as a zero amount, every field read in
`packages/indexer/src/eventFields.ts` tries both the snake_case and
camelCase spelling and **throws** if neither is present. A wrong
assumption here fails loudly (that pool's events stop indexing, visible
in `/api/indexer/health`) instead of writing fabricated data.

**Before relying on this in production**: run the indexer against one
real trade on a funded devnet or mainnet pool and confirm which casing
actually comes back; if it's consistently one or the other, the
dual-read can be simplified (or left as defensive redundancy).

## USD conversion caveat

Every historical trade being indexed in a given run is converted to USD
using the **current** quote-token/USD rate, not the rate at the time of
that trade. This is exact for USDC-quoted markets (1 USDC ≈ $1, always)
and an approximation for SOL-quoted markets. A future version should
either store the raw quote-token amount and convert at read time against
a historical price series, or query a historical price oracle per block
time.

## Deployment models

This indexer has no required infrastructure of its own — it's a
function (`runIndexerOnce`) callable from either:

1. **A scheduled HTTP route** (`POST /api/indexer/run`, protected by
   `INDEXER_SECRET`) — call it periodically from any scheduler that can send a
   `POST` with `Authorization: Bearer $INDEXER_SECRET` (a GitHub Actions cron with `curl`, an
   external cron service, a small worker, ...). **Vercel Cron cannot call it as written**:
   the route exports `POST` only and Vercel Cron sends `GET`. With `INDEXER_SECRET` empty the route is
   open in local development only; in production it fails closed (HTTP 500). For a manual run:
   `curl -X POST http://localhost:3000/api/indexer/run -H "Authorization: Bearer $INDEXER_SECRET"`.
2. **A standalone process** (`packages/indexer/src/cli.ts`, `pnpm --filter @elf/indexer run-once`).
   **Known issue:** this script runs the TypeScript directly with `node --experimental-strip-types`,
   which cannot resolve the repository's extensionless imports, so it currently fails with
   `ERR_MODULE_NOT_FOUND`. Use the HTTP route above (or run the CLI through a TypeScript runner
   that resolves them) until the script is fixed.

Both call the same `runIndexerOnce` — there is no logic duplicated
between them.

## Observability

`GET /api/indexer/health` reports, per pool, how long since its cursor
last advanced (`lagSeconds`) and flags any pool over 300s as stale.

## Known limitations

- **Polling-based, not push-based.** No websocket log subscription — a
  design choice, not an oversight: devnet websocket subscriptions are
  frequently unreliable, and polling requires no persistent connection
  or extra infrastructure. Latency between a real trade and it appearing
  in ELF's analytics is bounded by how often the trigger (cron or CLI
  loop) runs, not by the indexer itself.
- **`EvtSwap` (the older, non-`swap2` event) is decoded structurally
  identically to `EvtSwap2`** in this implementation's event-name check,
  but its underlying `SwapResult` type was not separately verified field
  -by-field — if a pool ever uses the legacy `swap` instruction directly,
  confirm its event shape before trusting those rows.
- **No reorg handling.** A signature that gets rolled back after being
  indexed at `"confirmed"` commitment would leave a stale row. Using
  `"finalized"` commitment for indexing (trading a bit of latency for
  certainty) would close this gap; not done here to keep indexing
  latency low for demo purposes.
