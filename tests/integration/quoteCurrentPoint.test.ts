import { describe, expect, it } from "vitest";
import { resolveCurrentPoint } from "../../packages/meteora-adapter/src/quote.js";

/**
 * Regression: a real devnet swap failed with ExceededSlippage (6002) because the quote used Unix seconds as the
 * fee-schedule clock on a slot-activated pool. Measured on-chain: the quote made with the slot matched the real
 * output to the unit; the seconds-based quote overstated it by 2.9%.
 */
const connection = { getSlot: async () => 500_811_213 };
// The SDK's ActivationType enum: Slot = 0, Timestamp = 1 (read from a real devnet pool config: activationType 0).
const ActivationType = { Slot: 0 as never, Timestamp: 1 as never };

describe("resolveCurrentPoint", () => {
  it("uses the current slot for a slot-activated pool (what every ELF pool is)", async () => {
    expect((await resolveCurrentPoint(connection, ActivationType.Slot)).toString()).toBe("500811213");
  });

  it("uses Unix seconds for a timestamp-activated pool", async () => {
    const before = Math.floor(Date.now() / 1000);
    const point = (await resolveCurrentPoint(connection, ActivationType.Timestamp)).toNumber();
    expect(point).toBeGreaterThanOrEqual(before);
    expect(point).toBeLessThan(before + 5);
  });
});
