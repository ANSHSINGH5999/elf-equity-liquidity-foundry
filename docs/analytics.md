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
