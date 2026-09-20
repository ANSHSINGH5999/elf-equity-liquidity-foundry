# ELF demo evidence

This file records **only what has actually been run**. Anything requiring a
funded devnet wallet is marked `NOT RUN` until it is (as of 2026-09-19 the wallet is funded; see §2). Never paste a seed
phrase, private key, API key or keypair secret here.

## 1. Verified without a wallet (2026-09-20)

| Check | Result |
|---|---|
| `pnpm test` | 59 files / 1006 tests passing (the devnet integration test skips gracefully while the faucet is exhausted) |
| `pnpm typecheck` | 10/10 packages clean |
| `pnpm lint` | 0 errors (2 pre-existing unused-variable warnings in 3D files) |
| `pnpm build` | passes; routes `/markets/[marketId]/analytics`, `/api/markets/[id]/risk`, `/api/markets/[id]/analyze` present |
| Runtime smoke (dev server + local Postgres) | unknown market → 404 on risk/analyze/trades; invalid swap/quote input → 400; analyze rate limit returns 429 after 10/min |
| Secret hygiene | Pyth key literal found in 0 client-bundle files and 0 tracked files; static scan of every API route + client component passes |
| PreStocks | live catalog rendered at `/assets` from the provider API |
| Tessera | provider API TLS-resets intermittently (re-verified 2026-09-18); left behind a feature flag and surfaced honestly |
| Pyth | Hermes authenticates the configured key; it has **no entitlement** for `Equity.US.*`, `Crypto.*X/USD` (xStock) or `Crypto.*ON/USD` (Ondo) feeds (403 "Not entitled"). It does return live BTC/USD and SOL/USD, which are not used as stock proxies. UI shows `Restricted — Pyth entitlement required` |

**Caveat (updated 2026-09-19):** live pools now exist (§2), so the market APIs were verified against real data. The market and analytics pages were not re-checked by eye after the last fixes because the browser extension disconnected mid-session.

## 2. Live devnet run (2026-09-19, UTC)

Everything below was read back from the chain or the running app, not assumed. The BUY and the SELL below are the first
transactions confirmed through ELF's new HTTP-polling confirmation path (no WebSocket subscriptions; Alchemy does not
support them). Since then the BUY #5 and SELL pages were opened in a real browser on Solana Explorer (Devnet), and the market,
analytics, market-health and AI pages were checked by eye (screenshots in the README). The 10 indexed trades were also each
checked against the chain: all finalized, `err = null`.

- Environment: Solana **devnet** (genesis `EtWTRABZ…` verified by the server before every transaction build and by the browser before signing). Transactions #1–#4 and the deployment ran on the free public RPC; BUY #5 and the SELL ran on a dedicated Alchemy Devnet RPC, confirmed by HTTP polling of `getSignatureStatuses`
- Wallet (public address only): `5w4DDXyxyDGPvqZK51htobEpUSjdeh8QyCQe4LkKRzYC`, MetaMask, signing on Devnet
- Asset: Anduril PreStocks (`ANDURIL`), Conservative configuration, USDC quote (mint `4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU`)
- Base mint (ANDURIL): `DF2UiBQXEj3S3abpipV7EyNqz8fhrwZ3hTo5adaw8zkF` · quote mint (Circle devnet USDC): `4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU`
- ELF launch `cmu89261a001ujl3o7camhoos` · config `FSAcLZu51beW2eFQPbqWq5HE5CzwdHjKLfQhyiMkHdkF` · pool `5XeQcXNLoqeoVunzvAQpuxM8gXX3iKVwLZPywKkDn1tr` · base mint `DF2UiBQXEj3S3abpipV7EyNqz8fhrwZ3hTo5adaw8zkF`

| Step | Status | Signature | Notes |
|---|---|---|---|
| createConfig | DONE, finalized | `25urS6H9BacSrEP5P2LZaFTewdrCNELJvSd348otSRftyZiZZf93nKnmQuMnQ3UmwymCkoe9iccWTwbHXoMek6dh` | `CreateConfig`, 10:33:51Z |
| createPool | DONE, finalized | `2ndmXGS8hdmkjbXSSBPFe2gqXeF3pvgPvh4dPxUJnF8a4deRSbwtv5LxPHWAcq5FQpZTnLaHYpvMiU5ShXQnVjY6` | `InitializeVirtualPoolWithSplToken`, first buy 0, 10:34:05Z |
| BUY #1 | DONE, finalized | `f5fsRoeSeiwYq1nVzccReeG3bj6CFRiangQirb4xF99jnkep4oJLChUgYVyNXk7bXNXWtXX5tcBhzPqZazvUsxf` | 1.000000 USDC in, 2.953838845 ANDURIL out, 10:34:53Z |
| BUY #2 | DONE, finalized | `5P4AtsiWL5JDqCJHhSBAau7JFVvYWNEQhJ3mmctngeXuNXZ2PFeXxrUzQkgEC6SFtzznKUjqzbEDVwQVBBgsVbXT` | 1.000000 USDC in, 2.953824315 ANDURIL out (wallet delta matches the pool vaults exactly), 10:35:03Z |
| BUY #3 | DONE, finalized | `4sPnsaaVuXCXPKk5qAS84vhX2PgdMFKXYk74Es3h3bCv8VPLeTu4AM3eATZY9HinkRjZB8BkBBQCxqAWSYfzbyL1` | 1.000000 USDC in, 3.046116106 ANDURIL out, 15:15:24Z (fee schedule has decayed: execution price $0.328 vs $0.339 earlier) |
| BUY #4 | DONE, finalized | `459KWYGroUnrg1AUDwdxYaKkpxmSaqA6UWA4EeAa9CZdWc4MzHraCeY4UmF7q6eWNNEtBS19sRt4TMbLSd9k8M9Z` | 1.000000 USDC in, 3.046100653 ANDURIL out, 15:20:03Z |
| BUY #5 (HTTP-polling path) | DONE, finalized | `5iv2aKJ4Nrx8UhXXB1QmGAginvSR8nagmATkRPioVE9984YYEXoHAsQN9jFGSs67ggZceGHMWPcCer9pztM2d5zW` | 1.000000 USDC in, 3.046069748 ANDURIL out (exactly the quote), fee 5,331 lamports, 19:02:57Z. Fee payer = the connected wallet; one transaction only. UI reached "Confirmed on-chain" by polling `getSignatureStatuses` |
| SELL (HTTP-polling path) | DONE, finalized | `5zE6TMVkLmTrkt1ja1oid7hJg56A8XNnoHK2vRPQAVF4HtGGDHPhUpa5LeXUhyYEPrJpxH56yF31rvWiREk9fPZT` | 1.000000000 ANDURIL in, 0.321758 USDC out (exactly the quote), fee 5,313 lamports, 19:17:27Z. Fee payer = the connected wallet; exactly one new wallet transaction; UI "Confirmed on-chain" with no "Check status again" |
| Two further SELLs (not part of the evidence above) | Finalized, indexed | `HwNdUcZ8nBAmr4w7gyq8GZRUecu5E1zVSLdEEcQ8RZgushTrsiSpzkA7er1QECndbuS4DLhxoyy9WsdafR8vBgP` (19:20:40Z), `3QH3sUM8VbDWkREHScCJ9K4Weq6HAFb3qyqWAfyfMjCtBFc163WviHoApFUV1ounSPpNyJYNzSQr1xzYRRMb35Gh` (19:21:02Z) | Each: 1 ANDURIL in, 0.321757 USDC out, same wallet, minutes after the first SELL. Each is a distinct transaction with its own signature, and ELF cannot produce a signature without the wallet, so these were separate wallet approvals (the Sell button is usable again once a trade is confirmed), not an automatic resend. They are outside the evidence set above |
| SELL (final verification run, one SELL through the UI) | DONE, finalized | `29oPaMAuErG2QTgSnjsw1vgXxs7dJ4Ac3Q78asFai8pMUcHxJfQFCeVAMibaaRtZs1dA1DWfCFHgZRZYN8y7Zvz3` | 1.000000000 ANDURIL in, 0.321756 USDC out (exactly the quote; minimum at 1% slippage 0.318538), fee 5,313 lamports, slot 501034451, 20:33:26Z. Read back with `getTransaction` at finalized: `err` null, fee payer and only signer = the connected wallet, one Meteora DBC `Swap` instruction on the pool, token deltas wallet ANDURIL −1 / USDC +0.321756 mirrored by the pool vaults. The pool went from 10 to 11 finalized signatures — exactly one new; no duplicate. The indexer then wrote exactly 1 trade for it (`sell`, source INDEXED) and it is the top row of the transaction history with an explorer link carrying the signature and `?cluster=devnet` |
| Indexer picked up BUYs and SELL | DONE | | every row in `/api/markets/:id/trades` with the chain's block time, source INDEXED (see §6 for the bug this exposed); the SELL shows as `sell`, 1 ANDURIL, 0.321758 USDC |
| Analytics reflect trades | DONE (API) | | 9 trades in 24h, $6.97 volume ($6.00 buy, $0.97 sell), 1 trader, regime `discovery`, read back from the API after a fresh indexer run; not re-checked by eye | *(later re-read: 10 trades, buy $6.00 / sell $1.29, 6 BUY / 4 SELL, viewed in the browser)*
| Market Health | DONE (API) | | `WATCH`: two LARGE_TRADE events (a $1 buy is 52% of $1.92 liquidity) and INDEXER_LAG (the local indexer is not scheduled) — both correct |
| Graduation monitor | DONE (API) | | 0.0%, threshold $577,918.65 = the on-chain `migrationQuoteThreshold` |
| Oracle state | No public feed | | ANDURIL has no Pyth feed; Pyth entitlement is separately RESTRICTED (see §1) |
| Explorer pages show the same signatures | DONE, by eye | | The BUY (`5iv2aKJ4…`) and the final SELL (`29oPaMAu…`) were opened on Solana Explorer (Devnet) in a real browser: Status Success, Confirmation Finalized (MAX Confirmations), fee payer = the connected wallet, slot and fee matching the values above. The UI's own link carries the exact signature and `?cluster=devnet` |
| Design wizard, by eye | DONE | | asset → profile → 3 candidates → simulation → review reached in the browser; the review step's wallet approval was **not** clicked |

### Evidence links (Solana Devnet)

- BUY #5: https://explorer.solana.com/tx/5iv2aKJ4Nrx8UhXXB1QmGAginvSR8nagmATkRPioVE9984YYEXoHAsQN9jFGSs67ggZceGHMWPcCer9pztM2d5zW?cluster=devnet
- SELL: https://explorer.solana.com/tx/5zE6TMVkLmTrkt1ja1oid7hJg56A8XNnoHK2vRPQAVF4HtGGDHPhUpa5LeXUhyYEPrJpxH56yF31rvWiREk9fPZT?cluster=devnet
- SELL (final verification run): https://explorer.solana.com/tx/29oPaMAuErG2QTgSnjsw1vgXxs7dJ4Ac3Q78asFai8pMUcHxJfQFCeVAMibaaRtZs1dA1DWfCFHgZRZYN8y7Zvz3?cluster=devnet
- createConfig: https://explorer.solana.com/tx/25urS6H9BacSrEP5P2LZaFTewdrCNELJvSd348otSRftyZiZZf93nKnmQuMnQ3UmwymCkoe9iccWTwbHXoMek6dh?cluster=devnet
- createPool: https://explorer.solana.com/tx/2ndmXGS8hdmkjbXSSBPFe2gqXeF3pvgPvh4dPxUJnF8a4deRSbwtv5LxPHWAcq5FQpZTnLaHYpvMiU5ShXQnVjY6?cluster=devnet
- Pool account: https://explorer.solana.com/address/5XeQcXNLoqeoVunzvAQpuxM8gXX3iKVwLZPywKkDn1tr?cluster=devnet

Real transactions above are chain-verified. Everything labelled SIMULATED elsewhere in the app (Simulation Lab, the
wizard's simulation step, the readiness check) is off-chain and never sent.

## 3. Exact manual steps for the live run

1. Fund your Phantom devnet address at https://faucet.solana.com (a browser faucet has its own rate-limit bucket).
2. `docker compose up -d && pnpm dev`, open http://localhost:3000, connect Phantom (set to Devnet).
3. `/design` → sample issuer or `/assets` asset → profile → **choose SOL as the quote token** (avoids needing a USDC token account) → generate → simulate → review.
4. Deploy: sign the config transaction, then the pool transaction. Record both signatures.
5. `/markets` → your market → **Buy**, wait for "Confirmed on-chain", record the signature; then **Sell** the tokens back and record it.
6. Run the indexer: `curl -X POST http://localhost:3000/api/indexer/run` (add `-H "Authorization: Bearer $INDEXER_SECRET"` if set). Reload — both trades appear in Transaction history.
7. Open each signature via "View on Solana Explorer" and confirm it matches.
8. Fill the table above with real values. Screenshot only real states.

## 4. Screenshot checklist (real states only)

`01-assets` · `02-market-design` · `03-curve-compiler` · `04-simulation` ·
`05-config-review` · `06-wallet-approval` · `07-deployment` · `08-real-buy` ·
`09-real-sell` · `10-transaction-verification` · `11-oracle` ·
`12-analytics` · `13-graduation`

## 5. Devnet debugging: "Transaction simulation failed: AccountNotFound" (2026-09-19)

All values below were captured from the real devnet cluster
(`https://api.devnet.solana.com`, genesis `EtWTRABZaYq6iMfeYKouRu166VU2xqa1wcaWoxPkrZBG`).
**Only simulations were run — nothing was signed, sent or persisted, so there is no
transaction signature yet.** *(Historical — captured before the real BUY / SELL runs. Those are now DONE and recorded in §2.)*

| Item | Value |
|---|---|
| Solana CLI wallet | `BxqKxPrUxTWf4DaAyMBb6U3C3zw59xdShrzTsEGbXfB9` — 10 SOL, System-owned |
| Wallet the ELF app is connected to (Phantom) | `DPhX38BzRMHSmBvnFCvkdsARMRQJCwqFp2AvFWdAAZQA` — **no account on devnet** (`solana account` → `AccountNotFound`, 0 SOL) |
| ELF server / frontend / CLI RPC | all `https://api.devnet.solana.com` |

**Reproduction** — the exact `createConfig` transaction `/api/dbc/config` builds, simulated the
way `prepareForWalletSignature` simulates it, fee payer `DPhX…AZQA`:
`err = "AccountNotFound"`, `unitsConsumed = 0`, `logs = []` (slot 500685079). The runtime rejected
it before running any instruction. Account index 0 (the fee payer) is the account that does not
exist. The other two absent accounts are expected: the config keypair the transaction creates, and
the DBC event-authority PDA (never an on-chain account).

**Control** — same transaction with the funded fee payer `BxqK…bfB9`: `AccountNotFound`
disappears and the DBC program (`dbcij3LW…SMqN`) runs `CreateConfig` and fails with
`InvalidTokenSupply` (custom error 6020, 25,536 compute units) — a second, independent defect.

**Root causes**
1. The wallet used by the app was never funded on devnet. The funded wallet is a different one.
2. The SDK sizes the curve to fill the token supply exactly (zero slack); the deployed program
   requires slightly more. On devnet `leftover = 0` was rejected at every supply from 1M to 2B
   tokens; the minimum accepted headroom at 1M supply was 500 raw units (Conservative) and 250
   (Balanced); a `leftover` of 1e-9 of the supply passed everywhere tested.

**After the fix** (`SUPPLY_LEFTOVER_FRACTION = 1e-9`, plus a precise fee-payer error):

| Fee payer | Candidate | createConfig simulation |
|---|---|---|
| `BxqK…bfB9` (funded) | Conservative | PASS |
| `BxqK…bfB9` (funded) | Balanced | PASS |
| `DPhX…AZQA` (unfunded) | Conservative / Balanced | blocked with "the fee payer … has no account on this network … Fund that wallet" |
| any | Growth | rejected client-side by the SDK (fractional migration fee) — pre-existing, unrelated |

Reproduce with `TEST_FUNDED_PUBKEY=<funded devnet pubkey> pnpm vitest run tests/integration/createConfigOnChain.test.ts`.

**Not yet verified on-chain:** the `createPool` (+ first buy) transaction — it references the config
account, which does not exist until the config transaction is confirmed — and the swap builder.

### 5a. Which wallet is the fee payer? (2026-09-19)

ELF does not choose the fee payer: the wallet the browser connects does. Traced end to end —
`useWallet().publicKey` → request `payerPublicKey` → `parsePublicKeyOrThrow` →
`prepareForWalletSignature(…, payer, …)` → `transaction.feePayer = feePayer` (the only assignment
in the codebase). No wallet address, server signer or test key is hardcoded or read by app code.

The wallet adapter offers Phantom, MetaMask and Solflare and reconnects the last-used one, so the
connected address can change between sessions. Observed on the same page load:

| Wallet | Address | Devnet balance |
|---|---|---|
| Phantom (earlier session) | `DPhX38BzRMHSmBvnFCvkdsARMRQJCwqFp2AvFWdAAZQA` | 0 SOL, no account |
| MetaMask (connected in the latest session) | `5w4DDXyxyDGPvqZK51htobEpUSjdeh8QyCQe4LkKRzYC` | 20 SOL |
| Solana CLI (`~/.config/solana/id.json`, not a browser wallet) | `BxqKxPrUxTWf4DaAyMBb6U3C3zw59xdShrzTsEGbXfB9` | 10 SOL |

Real-cluster check through the app's own `prepareForWalletSignature` (simulation only, nothing signed
or sent): the returned transaction's fee payer equals the connected wallet, the wallet's signature slot
is empty, and simulation passes for `5w4D…RzYC` and `BxqK…bfB9`.
`TEST_FUNDED_PUBKEY=<connected wallet pubkey> pnpm vitest run tests/integration/feePayerWiring.test.ts`.

**Before signing in the live run:** confirm the address shown in the nav is the funded wallet you intend to use.

### 5b. MetaMask showed "Solana Mainnet" and "reverted during simulation" (2026-09-19)

**Cause (code-proven).** `StandardWalletAdapter.signTransaction()` calls the wallet with no `chain`, so MetaMask used
its own active network. ELF's transaction was Devnet-derived and valid — for the connected wallet `5w4DDX…RzYC` (MetaMask):
server RPC devnet (genesis `EtWTRABZ…`), fee payer exists on Devnet and not on Mainnet, blockhash valid on Devnet and
invalid on Mainnet, real Devnet simulation PASS. On Mainnet that transaction cannot simulate.

**Wallet facts (public).** MetaMask advertises `solana:mainnet`, `solana:devnet`, `solana:testnet` on the wallet and on the
account, and the `solana:signTransaction` feature — so it can sign for Devnet when told to.

**Fix.** ELF now passes the chain (see docs/security.md, "Network guard") and blocks signing on a detectable mismatch.
Verified through the real code path with a spy standing in for the wallet: ELF asks the wallet to sign for
`chain = solana:devnet`, `account = 5w4DDX…RzYC`, and nothing reached MetaMask.

Still to confirm by eye in the live run: MetaMask's approval window shows **Devnet** for the config transaction. If it
still shows Mainnet, the wallet is ignoring the chain it is given; switch MetaMask's Solana network to Devnet or use a
wallet that honours it. *(Historical — BUY / SELL have since been run: see §2. MetaMask's approval window was used for them on Devnet.)*

### 5c. Real MetaMask run on Devnet (2026-09-19, UTC)

Wallet `5w4DDXyxyDGPvqZK51htobEpUSjdeh8QyCQe4LkKRzYC` (MetaMask). ELF read MetaMask's active scope as **Mainnet**
(`solana:5eykt4Us…`) and blocked signing with the message "MetaMask is connected to Solana Mainnet. Switch this dapp to
Solana Devnet before continuing." After the explicit switch the scope was Devnet (`solana:EtWTRABZ…`) and the sanitized
diagnostics show `signMessage` and `signTransaction` requested only with `walletActiveScope = solana:EtWTRABZ…`.
*What the MetaMask approval window displayed is to be read off the screenshot / by the user, not asserted here.*

**Step 1 — create pool configuration: CONFIRMED on Devnet.**

| Item | Value |
|---|---|
| Transaction | `46EJm1F8Bwp4vBcwwmfFLPzVG9RBoALiPdsZ5VkUYUtY3wZxtbbRjzZerRdYJnpV9xy6c4k39hGhaDpBhmiNBozh` |
| Status | finalized, `err = null`, slot 500794773 |
| Fee payer / signers | `5w4DDX…RzYC` (wallet) + the new config account |
| Program / instruction | Meteora DBC `dbcij3LW…SMqN` — `CreateConfig` |
| Fee | 10,000 lamports |
| Config account | `ERsvpVLSHQbsuXMhZyyC3F3GDPgPQ1j9D3oBz4V78mM9` — exists on Devnet, owned by the DBC program, 1,048 bytes |
| ELF state | launch `cmu86v8fp001yjl9pcsbuz9y9` at `CONFIG_CREATED` (set by the pool route only after it verifies the config account on-chain; the ephemeral config key was cleared) |

**Step 2 — create pool: FAILED, then fixed.** Devnet simulation returned `InstructionError [0, Custom 11]`; the logs show
`Program metaqbxx… (Metaplex Token Metadata) log: Name too long`. The asset name "Helios Aerodyne — Pre-IPO (Sample)" is 34
characters but 36 UTF-8 bytes (em dash = 3); the limit is 32 bytes. ELF now fits the on-chain token name/symbol to the Metaplex
limits at the pool-transaction build point (`fitOnChainMetadata`); after the fix the same pool transaction simulates
successfully on Devnet through the app's own `prepareForWalletSignature`. The pool transaction has NOT been signed or sent yet.


## 6. Bugs found by the live run (2026-09-19) and fixed

| Symptom | Real cause (proven on Devnet) | Fix |
|---|---|---|
| Buy failed in preflight with `Custom 6002` | 6002 is Meteora DBC `ExceededSlippage`. ELF pools are slot-activated, but the quote used Unix seconds as the fee clock, so it assumed a fee of 0.8% instead of 3.2% and overstated the output by 3.1%; the minimum-out then exceeded what the program pays. The old quote also failed at 1% and 2%, and passed only at 5%. | `resolveCurrentPoint` reads the pool's `activationType` (slot or timestamp) |
| Wrong price, threshold and amounts for USDC pools | quote decimals were hardcoded to 9; USDC has 6 | read from the quote mint on-chain |
| Trades never appeared in Transaction History | DBC emits events as self-CPI inner instructions, not `Program data:` log lines; the indexer read only logs, and matched `EvtSwap` while the decoder returns `evtSwap` | `decodeDbcEvents` reads inner instructions and normalizes names; only the complete `EvtSwap2` is indexed |
| SELL quote on a new pool reported "RPC unavailable" | the SDK throws `Insufficient Liquidity` when the quote reserve is 0; the route labelled every failure as RPC | the route says what happened (HTTP 422) |
| 24h price change read -4% after two buys | the current on-chain price was compared with the first trade's fee-inclusive execution price | the price history now records the pool's price after each trade |
| New pool labelled `stressed` / `recovery` | any quality score below 40 triggered it, and a thin new pool always scores low | a thin, early pool is `discovery`; stress needs real instability |
| Launch stuck at `AWAITING_POOL_SIGNATURE` after the pool was live | only a second, redundant ownership signature advanced it | `POST /api/dbc/pool/confirm` advances it from on-chain truth (config and base mint must match) |
