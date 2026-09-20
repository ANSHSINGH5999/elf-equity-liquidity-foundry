import { describe, expect, it } from "vitest";
import { Connection } from "@solana/web3.js";
import BN from "bn.js";
import { decodeDbcEvents } from "../../packages/meteora-adapter/src/events.js";
import { sqrtPriceToPrice } from "../../packages/meteora-adapter/src/state.js";
import { getDbcClient } from "../../packages/meteora-adapter/src/client.js";

/**
 * Fixture: the two DBC event instructions of a real, finalized Devnet BUY (1 USDC -> 2.953824315 tokens),
 * signature 5P4AtsiW…VBBgsVbXT. The deployed program emits its events as self-CPI inner instructions; the
 * transaction had ZERO `Program data:` log lines. Before this decoder read inner instructions, the indexer
 * decoded nothing from it and the trade never reached Transaction History.
 */
const DBC = "dbcij3LWUppWqq96dh6gJWwBifmcGfLSB5D4DuSMaqN";
const EVT_SWAP = "2ioXo9nkAt26bphRv6PYrqVqjr3Su45qPA3e7fX5ENeKMqFvqJS1XPzUsz7V7ZvfxqbgyWqmkPtf56kY2hLsWGHDi9KXQdfZQ6m2DzqJnNnKZduUXksxy4ev67EUaEotXEjYY9wqoZWy737Yhh6R4EFySbCt3xSVaxW1ZPNZXwm2trufrRsjDkmJnnK35QuCzXPSpoTwQ2xaEkDaEB18x4vYLnZuCbWH3wC8i1FZR";
const EVT_SWAP2 = "44FY2SKwMbUFWgV1yoKm6d1PUGsMQMtp54aAdQv2UzoVN1Q6XvRQhJrdGSutEVp1LiBC1cAMLjAqQFEdxViVT4kADi1Srg5Vs5VeAjjcLk3RX8m6S9Yy7ZGPDQsWpnCN92Yir7XKLLNYLP9EuVwgrjD6HZ8CFVgdib3Md58mpy3EkdzwzyTJxLRzSrU5FwChtqjG18hixfyb9Ubj65osnTMCj9HShggc2fyWGFHEpNmRCHAsCBa5evyVczCtL2bq7rtxP7RivuV";

const coder = getDbcClient({} as Connection).state.getProgram().coder;
const decode = (accountKeys: string[], programIdIndex: number) =>
  decodeDbcEvents(coder, { logMessages: ["Program log: Instruction: Swap"], accountKeys, innerInstructions: [{ instructions: [{ programIdIndex, data: EVT_SWAP }, { programIdIndex, data: EVT_SWAP2 }] }] });

describe("decodeDbcEvents on a real Devnet swap", () => {
  const events = decode(["payer", "pool", "x", DBC], 3);

  it("finds the swap events in inner instructions, named as the indexer expects", () => {
    expect(events.map((e) => e.name)).toEqual(["EvtSwap", "EvtSwap2"]);
  });

  it("EvtSwap2 carries the exact on-chain amounts: 1 USDC in, 2.953824315 tokens out, a buy", () => {
    const swap2 = events.find((e) => e.name === "EvtSwap2")!.data as { tradeDirection: number; swapResult: { includedFeeInputAmount: BN; outputAmount: BN }; quoteReserveAmount: BN };
    expect(swap2.tradeDirection).toBe(1); // quote -> base: a BUY
    expect(swap2.swapResult.includedFeeInputAmount.toString()).toBe("1000000");
    expect(swap2.swapResult.outputAmount.toString()).toBe("2953824315");
    expect(swap2.quoteReserveAmount.toString()).toBe("1920000");
  });

  it("gives the pool's own price after the trade, which is not the price the trade paid", () => {
    const swap2 = events.find((e) => e.name === "EvtSwap2")!.data as { swapResult: { nextSqrtPrice: BN } };
    const spotAfter = sqrtPriceToPrice(swap2.swapResult.nextSqrtPrice, 9, 6);
    expect(spotAfter).toBeCloseTo(0.325003, 5); // the pool's on-chain price, read back after this swap
    const paid = 1 / 2.953824315; // 1 USDC in / tokens out: fees and impact included
    expect(paid).toBeGreaterThan(spotAfter * 1.03); // ~4% higher — mixing the two made a rising pool look like a 4% drop
  });

  it("ignores instructions of other programs, even with the same bytes", () => {
    expect(decode(["payer", "pool", "x", "SomeOtherProgram1111111111111111111111111111"], 3)).toEqual([]);
  });
});
