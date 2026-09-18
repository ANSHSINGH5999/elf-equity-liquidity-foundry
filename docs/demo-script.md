# ELF demo script (target 4:30–5:00)

Opening line — say it, then immediately start clicking:

> "Tokenized assets don't just need tokens. They need markets."

**Rule for the whole video:** every step is INPUT → ACTION → RESULT on screen.
Only show real application states. Do not narrate source code. If a step
depends on something not yet verified live (see `demo-evidence.md`), do not
claim it — cut it or say what it is.

Pre-flight (off camera): funded devnet wallet connected in Phantom, dev server
running, Postgres up, indexer run once so history exists
(`curl -X POST localhost:3000/api/indexer/run` — add the bearer secret if
`INDEXER_SECRET` is set). Have `PYTH_API_KEY` set if you have an entitled one.

| Time | Screen | Say / show | Evidence produced |
|---|---|---|---|
| 0:00 | Landing | The problem: a tokenized pre-IPO asset can exist without a designed market; configuring a bonding curve means curve math, fee schedules and migration thresholds. | — |
| 0:20 | `/assets` | Live PreStocks catalog, pulled from the provider API, not cached. Pick one asset. (Tessera tab shows an honest "temporarily unavailable" — mention it in one sentence only if asked.) | screenshot 01 |
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

## Things NOT to say

- Don't call the analyst "AI" or "LLM" — it is deterministic and rule-based (the UI says so).
- Don't say Pyth verifies the price unless a feed is actually live on screen.
- Don't say "confirmed" before the strip says Confirmed.
- Don't claim mainnet — this runs on devnet.
- Don't mention Clawpump or Tessera as integrated.

## If something fails on camera

Stop, don't bypass. The state strip reports the exact reason (rejected in wallet,
simulation failed, expired blockhash, failed on-chain with a real signature).
Fix the cause and re-take the segment.
