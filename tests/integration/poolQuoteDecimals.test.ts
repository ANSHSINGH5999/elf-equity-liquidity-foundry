import { describe, expect, it } from "vitest";
import { PublicKey, type Connection } from "@solana/web3.js";
import { readMintDecimals } from "../../packages/meteora-adapter/src/state.js";

// A fresh mint per case: readMintDecimals caches by mint (decimals never change).

const connectionReturning = (value: unknown) => ({ getParsedAccountInfo: async () => ({ value }) }) as unknown as Connection;

describe("readMintDecimals — the pool's quote decimals come from the quote mint, never a constant", () => {
  it("returns 6 for a 6-decimal quote mint (USDC) and 9 for a 9-decimal one (wrapped SOL)", async () => {
    expect(await readMintDecimals(connectionReturning({ data: { parsed: { info: { decimals: 6 } } } }), PublicKey.unique())).toBe(6);
    expect(await readMintDecimals(connectionReturning({ data: { parsed: { info: { decimals: 9 } } } }), PublicKey.unique())).toBe(9);
  });

  it("reads the chain once per mint (decimals never change)", async () => {
    let reads = 0;
    const counting = { getParsedAccountInfo: async () => (reads++, { value: { data: { parsed: { info: { decimals: 6 } } } } }) } as unknown as Connection;
    const mint = PublicKey.unique();
    await readMintDecimals(counting, mint);
    await readMintDecimals(counting, mint);
    expect(reads).toBe(1);
  });

  it("throws instead of guessing when the mint account is missing or not a parsed mint", async () => {
    await expect(readMintDecimals(connectionReturning(null), PublicKey.unique())).rejects.toThrow(/Could not read the decimals/);
    await expect(readMintDecimals(connectionReturning({ data: Buffer.alloc(0) }), PublicKey.unique())).rejects.toThrow(/Could not read the decimals/);
  });
});
