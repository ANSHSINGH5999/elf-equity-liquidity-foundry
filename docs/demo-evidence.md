# ELF demo evidence

This file records **only what has actually been run**. Anything requiring a
funded devnet wallet is marked `NOT RUN` until it is. Never paste a seed
phrase, private key, API key or keypair secret here.

## 1. Verified without a wallet (2026-09-20)

| Check | Result |
|---|---|
| `pnpm test` | 25 files / 419 tests passing (the devnet integration test skips gracefully while the faucet is exhausted) |
| `pnpm typecheck` | 10/10 packages clean |
| `pnpm lint` | 0 errors (2 pre-existing unused-variable warnings in 3D files) |
| `pnpm build` | passes; routes `/markets/[marketId]/analytics`, `/api/markets/[id]/risk`, `/api/markets/[id]/analyze` present |
| Runtime smoke (dev server + local Postgres) | unknown market → 404 on risk/analyze/trades; invalid swap/quote input → 400; analyze rate limit returns 429 after 10/min |
| Secret hygiene | Pyth key literal found in 0 client-bundle files and 0 tracked files; static scan of every API route + client component passes |
| PreStocks | live catalog rendered at `/assets` from the provider API |
| Tessera | provider API TLS-resets intermittently (re-verified 2026-09-18); left behind a feature flag and surfaced honestly |
| Pyth | Hermes authenticates the configured key; it has **no entitlement** for `Equity.US.*`, `Crypto.*X/USD` (xStock) or `Crypto.*ON/USD` (Ondo) feeds (403 "Not entitled"). It does return live BTC/USD and SOL/USD, which are not used as stock proxies. UI shows `Restricted — Pyth entitlement required` |

**Caveat:** The new market UI (trading terminal, transaction history, graduation monitor, issuer dashboard, market analyst) has **not yet been visually validated against a live market**: no pool exists until the devnet wallet is funded. It is verified by type checks, lint, a production build, state-logic and API tests, and runtime 404/400 smoke tests — not by eye with real data.

## 2. Live devnet run — NOT RUN

Blocker: the devnet wallet has no SOL (public faucet rate-limited). Nothing
below has been executed; do not fill it in until it has.

- Environment: Solana **devnet**, RPC `https://api.devnet.solana.com` (or your own)
- Wallet (public address only): `<fill in>`
- Asset used: `<fill in>`

| Step | Status | Signature | Notes |
|---|---|---|---|
| createConfig | NOT RUN | | |
| createPoolWithFirstBuy | NOT RUN | | pool `<address>`, base mint `<address>` |
| BUY | NOT RUN | | input `<>`, output `<>`, confirmed `<yes/no>` |
| SELL | NOT RUN | | input `<>`, output `<>`, confirmed `<yes/no>` |
| Indexer picked up BUY/SELL | NOT RUN | | row visible in Transaction history |
| Analytics reflect trades | NOT RUN | | volume / trade count / price history |
| Graduation monitor | NOT RUN | | % complete `<>` |
| Oracle state | RESTRICTED (see §1) | | re-check if entitlement is granted |
| Explorer links open the same signatures | NOT RUN | | |

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
