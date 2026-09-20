# ELF Analytics (Phase 5)

## Architecture

```
Solana → Meteora DBC → ELF Indexer (packages/indexer) → PostgreSQL
                                                             │
                                          ┌──────────────────┴──────────────────┐
                                          │                                     │
                          @elf/market-engine (pure math)      apps/web/src/lib/server/marketAnalytics.ts
                          computeVolatility, computePercentChange,   (DB-aggregation orchestration —
                          computeBuySellStats, explainMarketQualityScore    resolves marketId, queries
                          — no DB access, unit-tested directly              Postgres, calls market-engine)
                                          │                                     │
                                          └──────────────────┬──────────────────┘
                                                              ▼
                                              GET /api/markets/:id/* routes
                                                              ▼
                                                    /markets/[marketId] page
```

This mirrors the split already established between `simulation-engine`
(orchestration) and `meteora-adapter` (chain math): the new
`marketAnalytics.ts` service layer does all Postgres querying, and
delegates every actual *calculation* (volatility, percent change,
buy/sell aggregation, score explanation) to pure, independently-testable
functions in `@elf/market-engine`.

## `marketId` = `Launch.id`

No new `Market` table was introduced (see `docs/production-readiness.md`
and `docs/architecture.md`) — `Trade.marketId`, `PriceHistory.marketId`,
`LiquidityHistory.marketId`, and `GraduationEvent.marketId` (all from
Phase 4) all reference `Launch.id` directly.

`GET /api/markets/:id` previously looked up a `MarketProfile` by id — a
shape that was never called from any UI code (verified by grep before
changing it) and whose semantics directly conflicted with the
market-id-keyed surface this phase requires. It now returns a
`MarketOverview` for a `Launch.id`. The pool-address-keyed
`/api/pools/:poolAddress/*` routes from the original MVP are unchanged
and still power the existing `/pools/[poolAddress]` dashboard — the two
route trees coexist deliberately rather than one replacing the other in
this pass (see "Known limitations" below).

## Data sources — never mixed silently

Every analytics figure declares a `DataSource`:

- **`ON_CHAIN`**: read live from Solana via `meteora-adapter` just now
  (current price, current reserves, live graduation percentage).
- **`INDEXED`**: derived from `packages/indexer`'s stored events (trade
  history, price/liquidity history, volume, trader counts).
- **`SIMULATED`**: the simulation engine's output — always labeled
  `SIMULATED` in both the API response and the UI, and never computed by
  anything in this analytics layer.

Where both an on-chain read and indexed history exist for a headline
number (24h volume in `MarketOverview`), the response's `source` field
says which one was actually used — indexed data is preferred once the
indexer has real trades for that market; the live-RPC-derived estimate
(inherited from the original Phase 1 `poolAnalytics.ts`) is the fallback
before the indexer has caught up, not a second, competing "truth."

## Formulas

### Percent / absolute change (`computePercentChange`, `computeAbsoluteChange`)

`(current - past) / past * 100`. If there is no real prior observation
(`past` is `null`, `undefined`, or `0`), returns
`{ available: false, reason: "..." }` — **never invents a baseline**.
The "past" value used for a period's change is the *earliest indexed
observation within that period's window*, not a synthetic starting
point.

### Volatility (`computeVolatility`)

Log-return standard deviation:

```
r_t = ln(P_t / P_(t-1))
σ = sample standard deviation of {r_1, ..., r_n}
```

- **Sampling interval**: whatever the actual gaps between indexed trade
  prices happen to be — trades are event-driven, not evenly spaced, so
  there is no fixed sampling interval to report.
- **Calculation period**: whatever `AnalyticsPeriod` was requested (1H/
  24H/7D/30D/ALL) — all indexed price points within that window.
- **Annualization**: **not applied**. Annualizing assumes a regular
  sampling frequency; irregularly-spaced trade data doesn't have one, so
  reporting an annualized figure would imply false precision.
- **Minimum observations**: 3 price points (2 log returns). Below that,
  returns `{ available: false, reason: "..." }` rather than a
  meaningless single-return "standard deviation."

### Buy/sell volume and ratio

`buySellRatio = buyCount / sellCount`, returned as `null` (not
`Infinity`) when `sellCount` is 0 — an undefined ratio is reported as
undefined, not as a fabricated number.

### Volume and trade stats — computed in SQL, not in JS

`GET /api/markets/:id/volume` and the trade-count portion of `/trades`
are backed by one grouped, DB-side aggregation query
(`getTradeAggregatesBySide` in `marketAnalytics.ts`):

```sql
SELECT side, COUNT(*), SUM(token_amount * price_usd), AVG(...), MAX(...)
FROM trades WHERE market_id = $1 AND timestamp >= $2
GROUP BY side
```

A trade's USD value is `token_amount * price_usd` — both already stored
per-trade by the indexer — computed once in SQL rather than pulling rows
into the application and reducing them, per the Phase 5 performance
requirement. Every history/list query (`getPriceHistory`,
`getLiquidityHistory`, `getRecentTrades`) is time-bounded by the
requested period and capped (5,000 rows for history series, 100 for the
trade feed) — no query loads a market's entire trade history into
memory.

## ELF Market Quality Score — Phase 5 status

The existing (Phase 1) six-component, deterministic point allocation in
`packages/market-engine/src/marketQuality.ts` is **unchanged** — Phase 5
does not replace it. What's new is an explainability wrapper,
`explainMarketQualityScore`:

- Adds a `version` tag (`"MQS v1"`) so future scoring-model changes are
  distinguishable from this one.
- Adds a deterministic, rule-based `primarySignal` (the best-scoring
  component, as a fraction of its own maximum) and `riskSignal` (the
  worst-scoring component, only surfaced if it's below 50% of its own
  maximum — otherwise `null`, meaning no significant risk signal).
  Neither is generated by an LLM or randomized: identical input always
  produces identical output (see `tests/market-engine/analytics.test.ts`).
- Labels the result `"ELF-defined analytical metric"` in the response
  itself, not just in documentation.

**Deliberately not done in Phase 5**: recomputing the six underlying
component *scores* from indexed inputs (e.g. feeding indexed 24h volume
into the `volumeQuality` component, or indexed price history into
`priceStability`). The score breakdown shown in `MarketOverview` is
still the one `getPoolAnalytics` already computes from live RPC reads +
`MarketSnapshot` history. This means the score's internal volume
assumption and the headline "24h Volume" figure shown alongside it can,
in principle, disagree slightly once the indexer has data the snapshot
mechanism didn't capture — both are real, both are labeled with their
true source, but they are not yet reconciled into one number. Recommended
follow-up, not done here to avoid destabilizing an already-tested scoring
path on a guess about how to blend two different volatility/volume
definitions.

## Data freshness

`GET /api/markets/:id` (and `/api/indexer/health`) report a
`DataFreshness`: `"live"` if the pool's `IndexerCursor` advanced within
the last 300 seconds, `"delayed"` otherwise, `"unavailable"` if the
indexer has never run for this pool. The UI must never imply real-time
data when this says `"delayed"`.

## Insufficient-data behavior

Every metric that depends on a prior observation or a minimum sample
size returns a typed `{ available: false, reason }` rather than a
guessed value:

- Price/liquidity change with no prior observation in the window.
- Volatility with fewer than 3 price observations.
- Price history's `dataAvailableSince` is `null` if the indexer has
  never recorded a price for that market — the UI should show "no
  historical data yet," not an empty chart pretending to be complete.

## Final-sprint calculations

Everything below is pure code in `packages/market-engine` (no I/O), fed by
data the platform already computes, and covered by tests in `tests/market-engine`
and `tests/ui`. Nothing here is computed in the browser except formatting.

### Issuer risk indicators (`computeRiskIndicators`, `risk.ts`)

Statuses are only **NORMAL**, **WATCH**, **DATA_UNAVAILABLE**. There is
deliberately no LOW/MEDIUM/HIGH composite "risk score": no defensible way to
aggregate these into one number exists, so none is invented. The WATCH
cutoffs below are **ELF-defined analytical parameters** (`RISK_THRESHOLDS`),
not Meteora protocol values and not industry standards; every indicator also
exposes its raw measured value. A status is decided on the *unrounded* value;
only the displayed number is rounded.

| Indicator | Value shown | WATCH when | DATA_UNAVAILABLE when |
|---|---|---|---|
| Liquidity | `liquidityUsd ÷ targetLiquidityUsd × 100` (issuer-declared target from `MarketProfile`) | below 50% | target missing or ≤ 0 |
| Price deviation | `abs(priceUsd − referencePriceUsd) ÷ referencePriceUsd × 100` | above 10% | reference ≤ 0 / missing. Note states whether the reference is live Pyth or the static issuer-declared number |
| Oracle status | count of Pyth feeds with a live price | never (NORMAL if ≥ 1 live) | no live feed; the note says exactly why (`Restricted — Pyth entitlement required`, not configured, rejected key, rate-limited, unavailable, or no public feed exists) |
| Trading activity | indexed trades in the last 24h | 0 trades while the indexer is live | indexer has no cursor for the pool |
| Volume concentration | largest single wallet's volume ÷ total 24h volume × 100 (one DB-side grouped query, `getTopTraderVolumeShare`) | above 50% (a simple majority) | no volume in the window |
| Large-trade exposure | largest 24h trade ÷ current liquidity × 100 | above 10% | no trades, or liquidity ≤ 0 |
| Indexer health | reuses the existing freshness rule (lag ≤ 300s = live) | delayed | no cursor |

### Graduation checklist (`buildGraduationChecklist`, `graduation.ts`)

Meteora DBC graduation has **one** on-chain trigger: the pool's quote reserve
reaching the config's `migrationQuoteThreshold`. The checklist therefore has
one gating condition plus the separate, real "migration executed" step.
"Volume requirement" and "Market-cap requirement" are rendered as
`not_applicable` (with the reason) — they are never invented as extra gates,
and live market cap is reported "Data unavailable" because ELF does not read
circulating supply on-chain. "Migration executed" comes from real pool state
(`isMigrated`), never inferred from reaching 100%.

### Trade preview (`trade.ts`, `swap.ts`)

- `computeSwapAmountIn` converts what the user typed into the raw `amountIn`
  the program expects. The quote route and the swap route share it, so a
  preview cannot drift from the transaction later built. Built from a BigInt
  string (a plain `new BN(number)` throws above 2^53).
- `computeExecutionMetrics`: execution price = quote-leg USD ÷ base tokens.
  Price impact (fees included) = how much worse than spot the fill is, positive
  on both sides (a buy paying above spot, a sell receiving below spot).
- `minimumReceived` = expected output × (1 − slippage bps ÷ 10,000) — the same
  floor the swap route sets as `minimumAmountOut`.
- `checkSufficientBalance` never treats an unreadable balance as zero.
- A trade is **Confirmed** only when `getSignatureStatuses` reports it at
  `confirmed` or `finalized` with `err === null` (HTTP polling — see
  `packages/solana/src/confirmation.ts`; it does not use WebSocket
  subscriptions, which some providers such as Alchemy do not support). A
  transaction that landed but failed surfaces as Failed with the cluster's own
  error and the real signature; one whose blockhash expired and that nothing
  found (status incl. history, then `getTransaction`) is Failed/expired; one
  whose outcome ELF could not learn (timeout, RPC unreachable) is
  **Unconfirmed**: it keeps its signature, offers "Check status again", and is
  never sent a second time.

### Market analyst (`analyst.ts`)

A deterministic, rule-based reading of the same data as the issuer dashboard.
It is **not** a language model and says so in the UI (provider label
`elf-rule-based-v1`). Every sentence is built from a real value, every claim
lists its data source, missing data is named ("Could not be measured"), and the
exact inputs are shown under "Data used". A `MarketAnalystProvider` interface
allows an LLM provider; **every** provider's output is checked by
`findAdviceViolations` (advice, buy/sell/hold ratings, price predictions,
guarantees) and flagged output is discarded — never shown.

### AI Market Analysis (`aiMarketAnalysis.ts`, Groq)

Separate from the rule-based analyst above. `buildVerifiedSnapshot` turns the
issuer dashboard plus the all-time BUY/SELL trade counts into a snapshot of
numbers and enums; Groq explains it; `explainSnapshot` keeps only statements whose
every digit matches the snapshot (within the precision written), that contain no
advice/prediction language and no addresses or links. `buildEvidence` writes the
evidence list from the snapshot — the model never does. The response carries
`meta` (provider, model, generation time, snapshot time, data source, cached,
number of dropped statements).

## Known limitations

- The Market Quality Score breakdown itself doesn't yet consume indexed
  data (see above) — only the headline volume figures do.
- `/api/pools/:poolAddress/*` (pool-address-keyed) and
  `/api/markets/:id/*` (market-id-keyed) coexist rather than being
  consolidated into one route tree. Recommended for a later pass once
  the market-detail page fully replaces the pool-address dashboard.
- Volume time-series charts (bucketed by hour/day for a line chart) are
  not implemented in Phase 5 — only summary totals (`getVolumeStats`)
  and the raw recent-trades feed. A bucketed series would need its own
  `date_trunc`-based aggregation query; deferred to keep this phase's
  scope to what the acceptance criteria actually require.
- Volatility has no annualized variant, by design (see above) — if a
  future phase wants one, it needs a documented assumption about
  effective sampling frequency, not a default multiplier.
