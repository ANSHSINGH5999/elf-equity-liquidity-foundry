# Stocklana submission — Equity Liquidity Foundry (ELF)

**One line:** ELF turns tokenized assets into programmable, simulated, deployable and verifiable liquidity markets on Solana.

## Problem
A tokenized equity or pre-IPO asset can exist on Solana with no designed market. Standing up a Meteora Dynamic Bonding Curve pool means choosing curve shape, fee schedules, migration thresholds and liquidity distribution — none of which an issuer should have to learn from scratch, and none of which resembles a memecoin launch when done well.

## Solution
One issuer workflow: **discover an asset → design a market → compile Meteora DBC candidates → simulate → review → wallet-approved deployment → real trading → on-chain verification → analytics → graduation monitoring.** Every config, pool and quote is built with the official `@meteora-ag/dynamic-bonding-curve-sdk`; ELF never invents AMM math or account layout.

## Why Solana / Meteora / Pyth
- **Solana:** sub-second finality and sub-cent fees make bonding-curve price discovery practical for thinly traded assets.
- **Meteora DBC:** a permissionless, configurable price-discovery primitive with a defined path into a permanent DAMM v2 pool. ELF is the issuer tooling around it: compile, simulate, deploy, trade, monitor.
- **Pyth:** the reference-price layer. ELF compares the on-chain DBC price to Pyth's equity, xStock and Ondo feeds. Our current API key is authenticated but not entitled to those feeds, so the product shows exactly that (`Restricted — Pyth entitlement required`) rather than a fabricated price.

## Key features
- Curve compiler (three deterministic risk profiles, scored) and simulation engine (six scenarios × four trade sizes, every number labelled SIMULATED).
- Wallet-signed deployment with ownership proofs, network validation, transaction simulation before signing, and idempotent, on-chain-verified steps.
- **Trading terminal:** live quote, execution price, price impact, minimum received, wallet balances, and distinct Quote → Sign → Submitted → Confirmed / Failed states; confirmed only after the network confirms with no on-chain error.
- **Transaction explorer:** every indexed trade with signature, pool, network and a link to Solana Explorer.
- **Graduation monitor:** built on the one real DBC trigger (quote reserve vs migration threshold); volume and market cap are shown as not-applicable, never invented as gates.
- **Issuer risk dashboard:** NORMAL / WATCH / DATA UNAVAILABLE indicators with the formula behind each number.
- **Market analyst:** deterministic, rule-based, source-traced analysis with an advice/prediction guardrail (not a language model).
- **AI Market Analysis (Groq):** a server-side AI explanation of a snapshot of verified data; every number is checked against the snapshot and the panel is labelled AI-generated. **External Market Data (CoinCap):** quote-token context only, never the on-chain price.
- Blockchain indexer, indexed analytics, live PreStocks asset discovery.

## Architecture (short)
Next.js 16 + pnpm/Turborepo monorepo. Only `@elf/meteora-adapter` touches the Meteora SDK. Pure calculation lives in `@elf/market-engine` (unit-tested); the web app orchestrates and presents. See `docs/architecture.md`.

## Security
Non-custodial (no private key ever leaves the wallet); server-generated ephemeral keypairs are never returned by any API — enforced by runtime tests and a static scan of every route and client component; rate limiting on all transaction-building and analytics routes; Pyth key server-side only (verified absent from the client bundle). See `docs/security.md`.

## Real transaction evidence
See `docs/demo-evidence.md`. **Status: real Devnet run executed** — createConfig, createPool, six BUYs and four SELLs are finalized on-chain (all 10 indexed trades were checked against the chain; the main ones are recorded with their signatures; the latest BUY and the SELL were confirmed through the HTTP-polling confirmation path and indexed). The file lists exactly what has and has not been verified. Do not treat any signature as evidence until it is recorded there.

## Demo flow
`docs/demo-script.md`.

## Known limitations
- Devnet only; no mainnet deployment.
- The market UI was verified against real Devnet pools through its APIs; the analytics pages still need a by-eye pass with the final build.
- The compiled fee schedule's duration is passed to the SDK in slots for these slot-activated pools, so a nominal 24h schedule runs about 9.6 hours. It is not shown as hours anywhere in the UI; a decision on converting it is pending.
- Pyth equity/xStock/Ondo feeds require an entitlement our key does not have; the oracle panel reports the restriction.
- Clawpump was evaluated and not integrated (its launch API targets pump.fun and requires funded agent wallets — no documented Meteora pairing).
- The Market analyst is rule-based; the separate AI Market Analysis panel uses Groq and needs `GROQ_API_KEY` (its qualitative wording is not machine-verified). External Market Data needs `COINCAP_API_KEY`; ELF's equity assets are not listed on CoinCap.
- Live market cap is not shown (circulating supply is not read on-chain).
- Trading UI supports pre-migration DBC pools only; graduated pools show a notice.
- Rate limiting is in-memory (single-instance).

## Roadmap
Mainnet hardening and a shared rate-limit store; an entitled Pyth key for live equity/xStock/Ondo comparison; post-migration (DAMM v2) trading surface; alerting on risk-indicator changes.
