# ELF demo script (target 4:30–5:00)

Opening line — say it, then immediately start clicking:

> "Tokenized assets don't just need tokens. They need markets."

**Rule for the whole video:** every step is INPUT → ACTION → RESULT on screen.
Only show real application states. Do not narrate source code. If a step
depends on something not yet verified live (see `demo-evidence.md`), do not
claim it — cut it or say what it is.

Pre-flight (off camera): funded devnet wallet connected in MetaMask (or Phantom) and switched
to Solana **Devnet** — MetaMask falls back to Mainnet after every page reload, so click
*Switch MetaMask to Solana Devnet* (nothing is signed) before any trade — dev server
running, Postgres up, indexer run once so history exists
(`curl -X POST localhost:3000/api/indexer/run` — add the bearer secret if
`INDEXER_SECRET` is set). Have `PYTH_API_KEY` set if you have an entitled one.

| Time | Screen | Say / show | Evidence produced |
|---|---|---|---|
| 0:00 | Landing | The problem: a tokenized pre-IPO asset can exist without a designed market; configuring a bonding curve means curve math, fee schedules and migration thresholds. | — |
| 0:20 | `/assets` | Live PreStocks catalog, pulled from the provider API, not cached. Pick one asset. | screenshot 01 |
| 0:40 | `/design` step 2 | Market profile: liquidity, volatility, risk profile, graduation target. | 02 |
| 1:00 | step 3 | Curve compiler: three deterministic Meteora DBC candidates, scored, one recommended with a rationale. | 03 |
| 1:20 | step 4 | Simulation: six scenarios × four trade sizes against real curve math, every number labelled SIMULATED. | 04 |
| 1:45 | step 5 (review) | Exact on-chain parameters; "ELF never touches your private key". | 05 |
| 2:00 | step 5 (deploy) | Wallet approval → real `createConfig`, then real `createPool`. Show the signature and Explorer link. | 06, 07 |
| 2:30 | `/markets/[id]` | Trade panel: type an amount, show the live quote (execution price, price impact, minimum received). Click **Buy**. Point at the state strip: Quote → Sign → Submitted → **Confirmed only after the network confirms**. | 08 |
| 2:55 | same | **Sell** the tokens back (token-amount input, "Max"). | 09 |
| 3:15 | Transaction history | Click a row: real signature, pool, network, "View on Solana Explorer". Open it. This is the proof. | 10 |
| 3:35 | Oracle stat + panel | Show the honest state. If entitled: live Pyth prices with timestamps and deviation vs the DBC price. If not: "Restricted — Pyth entitlement required" — say it plainly; we do not fake or substitute a feed. | 11 |
| 3:50 | `/markets/[id]/analytics` | Issuer dashboard: overview + risk indicators (NORMAL / WATCH / DATA UNAVAILABLE), open "How this is calculated" on one. Click **Analyze market**: rule-based analysis with sources and "Could not be measured". | 12 |
| 4:10 | Graduation monitor | One real trigger (quote reserve vs migration threshold), volume/market cap shown as not-applicable, live progress. | 13 |
| 4:25 | Landing/README | Why ELF: issuer workflow + curve engineering + simulation + deployment + real trading + verification + analytics — one loop, with blockchain evidence. | — |

## Optional segment: Market Launch Copilot (~60 s, replaces the 0:40–1:45 design steps if time is short)

Route: `/design/copilot`. INPUT → ACTION → RESULT:

1. **Sample issuer → Generate configuration.** RESULT: a *Proposal* badge and the
   plan — asset, curve, liquidity, trading, graduation, oracle — with real engine
   values. Say: "deterministic engines, no AI".
2. **Point at Graduation.** One real DBC trigger; the threshold Meteora derives
   sits beside the declared target (they can differ — the plan says so).
3. **Point at Simulation: "Not run yet".** Click **Run simulation**. RESULT: the
   scenario table, every value labelled SIMULATED.
4. **Risk & validation checks.** Pass / fail / *DATA UNAVAILABLE* — no score. If
   Pyth is restricted it reads "Restricted — Pyth entitlement required"; say so
   plainly.
5. **Continue to approval.** Show the button was disabled until the simulation ran.
   Tick the acknowledgement; **Review configuration** stays disabled until then.
6. **Review configuration → existing wallet approval.** Say: "the Copilot never
   deploys — you still sign each transaction yourself." Then continue as in the
   main table (segments at 1:45–2:00).

Do not say the Copilot is AI, predicts prices, or deploys for you. Do not pick
the Growth candidate for a live deploy (Meteora rejects it — see README).

## Judge flow (the story the demo tells)

```
ASSET → MARKET DESIGN → CURVE COMPILER → SIMULATION LAB → RISK CHECK →
CONFIG REVIEW → WALLET APPROVAL → METEORA DBC → REAL TRADE → INDEX →
ANALYZE → MARKET HEALTH → ANOMALY / NORMAL STATUS → GRADUATION
```

Key messages: *"Before committing liquidity on-chain, an issuer can evaluate how
the configured market behaves under different supported scenarios"* (Simulation
Lab) and *"ELF does not stop after deployment — it monitors the market after
launch"* (Market Health).

## Optional segment: Simulation Lab (~60 s, after the curve compiler)

Route: `/design/lab?curve=<id>` (link on the simulation step: "Open in Simulation Lab").

1. **Pick a configuration and the *Sell pressure* scenario → [ RUN SIMULATION ].**
   RESULT: `SIMULATION — OFF-CHAIN` badge, four trades with price impact and the
   quote reserve after each, charts tagged SIMULATED.
2. **Point at the simulated graduation state.** The one real DBC condition,
   evaluated on the *simulated* reserve — say it is not any on-chain pool.
3. **Run *Graduation approach*, tick both runs, [ COMPARE SCENARIOS ].** RESULT:
   side-by-side table from the same engine; mention different configurations
   are refused.
4. **Open "Not modelled by the engine".** Say plainly: volume and free-form
   liquidity change are not modelled, so ELF doesn't pretend.

Do not present any Lab number as a forecast or as live data.

## Optional segment: Market Health (~45 s, after real trades are indexed)

Route: `/markets/[id]/analytics` — the panel sits above the market overview.

1. **Show the status** (NORMAL / WATCH / DATA UNAVAILABLE) and the signal checks:
   "Indexer synchronized", oracle state. If Pyth is restricted, say it plainly.
2. **Expand one event** (e.g. Large trade): observed, cutoff, real time, data
   source, explanation, on-chain signature.
3. **Timeline:** only events with real timestamps. Say what it is *not*: not a
   fraud detector, not a prediction, not advice.

If the market is quiet the honest result is DATA UNAVAILABLE or NORMAL — do not
stage anomalies.

## Things NOT to say

- Don't call the Market analyst, the Copilot, the Simulation Lab or Market Health "AI" or "LLM" — they are deterministic and rule-based (the UI says so). The **AI Market Analysis** panel is the one language-model feature (Groq): present it as an explanation of verified data, labelled AI-generated, never as an oracle or a source of prices.
- Don't present CoinCap numbers as the market's price: the price is the on-chain Meteora DBC price; CoinCap is external context, and ANDURIL is not listed there.
- Don't say Market Health detects fraud or manipulation, or that the Lab predicts prices.
- Don't say Pyth verifies the price unless a feed is actually live on screen.
- Don't say "confirmed" before the strip says Confirmed.
- Don't claim mainnet — this runs on devnet.
- Don't mention Clawpump as integrated.

## If something fails on camera

Stop, don't bypass. The state strip reports the exact reason (rejected in wallet,
simulation failed, expired blockhash, failed on-chain with a real signature).
Fix the cause and re-take the segment.
