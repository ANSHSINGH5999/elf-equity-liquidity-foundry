import { describe, expect, it } from "vitest";
import { ApiError } from "../../apps/web/src/lib/api-client.js";
import {
  TRADE_STEPS,
  TradeOnChainFailure,
  classifyTradeFailure,
  describeTradeStatus,
} from "../../apps/web/src/components/markets/trade-state.js";

const apiError = (code: string, message: string, status = 400) =>
  new ApiError({ error: { code, message, requestId: "test" } } as never, status);

describe("describeTradeStatus — the five distinct states", () => {
  it("QUOTE: idle with and without a quote, never busy, never 'confirmed'", () => {
    const empty = describeTradeStatus("idle", false);
    const ready = describeTradeStatus("idle", true);
    expect(empty.label).toMatch(/enter an amount/i);
    expect(ready.label).toBe("Quote ready");
    expect(ready.detail).toMatch(/nothing has been sent/i);
    expect(empty.busy || ready.busy).toBe(false);
  });

  it("SIGNING: busy, and says nothing has been sent until the user approves", () => {
    const v = describeTradeStatus("signing", true);
    expect(v.busy).toBe(true);
    expect(v.detail).toMatch(/nothing is sent until you do/i);
  });

  it("SUBMITTED: busy and explicitly NOT confirmed", () => {
    const v = describeTradeStatus("submitted", true);
    expect(v.busy).toBe(true);
    expect(v.label).toMatch(/not confirmed yet/i);
    expect(v.tone).not.toBe("success");
  });

  it("CONFIRMED: the only success state, and not busy", () => {
    const v = describeTradeStatus("confirmed", true);
    expect(v.tone).toBe("success");
    expect(v.busy).toBe(false);
    for (const other of ["idle", "building", "signing", "submitted", "failed"] as const) {
      expect(describeTradeStatus(other, true).tone).not.toBe("success");
    }
  });

  it("FAILED: danger tone, not busy, and remembers which step it failed at", () => {
    const v = describeTradeStatus("failed", true, 2);
    expect(v.tone).toBe("danger");
    expect(v.busy).toBe(false);
    expect(v.activeStep).toBe(2);
  });

  it("steps advance monotonically through the happy path and stay inside TRADE_STEPS", () => {
    const path = (["idle", "building", "signing", "submitted", "confirmed"] as const).map(
      (s) => describeTradeStatus(s, true).activeStep,
    );
    for (let i = 1; i < path.length; i++) expect(path[i]!).toBeGreaterThanOrEqual(path[i - 1]!);
    for (const step of path) expect(step).toBeLessThan(TRADE_STEPS.length);
  });

  it("every in-flight state disables the trade button (busy) so a double-submit is impossible", () => {
    for (const s of ["building", "signing", "submitted"] as const) expect(describeTradeStatus(s, true).busy).toBe(true);
  });
});

describe("classifyTradeFailure", () => {
  it("wallet rejection is reported as such and says nothing was sent", () => {
    const f = classifyTradeFailure(new Error("User rejected the request."));
    expect(f.kind).toBe("wallet_rejected");
    expect(f.message).toMatch(/nothing was sent/i);
    expect(f.signature).toBeNull();
  });

  it("an on-chain failure carries the REAL signature so the explorer link is genuine", () => {
    const f = classifyTradeFailure(new TradeOnChainFailure("sig123", { InstructionError: [0, "Custom"] }));
    expect(f.kind).toBe("on_chain_failed");
    expect(f.signature).toBe("sig123");
    expect(f.message).toMatch(/executed on-chain but failed/i);
  });

  it("blockhash expiry does not claim the trade failed — it may have landed", () => {
    const e = new Error("Signature abc has expired: block height exceeded.");
    e.name = "TransactionExpiredBlockheightExceededError";
    const f = classifyTradeFailure(e);
    expect(f.kind).toBe("expired");
    expect(f.message).toMatch(/may not have landed/i);
  });

  it("insufficient funds is recognised from the RPC message", () => {
    expect(classifyTradeFailure(new Error("Transaction simulation failed: insufficient lamports 5, need 10")).kind).toBe(
      "insufficient_funds",
    );
  });

  it("server-side simulation failure explains the wallet was never asked to sign", () => {
    const f = classifyTradeFailure(apiError("simulation_failed", "AccountNotFound", 502));
    expect(f.kind).toBe("simulation_failed");
    expect(f.message).toMatch(/not sent to your wallet/i);
    expect(f.message).toContain("AccountNotFound");
  });

  it.each(["rpc_unavailable", "provider_unavailable", "database_unavailable"])("treats %s as a transient outage", (code) => {
    expect(classifyTradeFailure(apiError(code, "x", 503)).kind).toBe("unavailable");
  });

  it("surfaces validation errors verbatim", () => {
    const f = classifyTradeFailure(apiError("validation_error", "The amount is too small to produce a non-zero trade size."));
    expect(f.kind).toBe("validation");
    expect(f.message).toContain("too small");
  });

  it("handles malformed / unexpected thrown values without throwing", () => {
    for (const weird of [undefined, null, 42, {}, "boom", [] as unknown]) {
      const f = classifyTradeFailure(weird);
      expect(typeof f.message).toBe("string");
      expect(f.message.length).toBeGreaterThan(0);
      expect(f.signature).toBeNull();
    }
  });
});

import { deriveBalanceStatus } from "../../apps/web/src/components/markets/trade-state.js";

describe("deriveBalanceStatus (wallet connected / disconnected / unreadable)", () => {
  const expected = { sol: true, base: true, quote: true };

  it("reports disconnected when no wallet is connected", () => {
    expect(
      deriveBalanceStatus({ connected: false, loadedForThisWallet: false, expected, values: { sol: null, base: null, quote: null } }),
    ).toBe("disconnected");
  });

  it("reports loading until a read for THIS wallet has landed (never shows a previous wallet's balance)", () => {
    expect(
      deriveBalanceStatus({ connected: true, loadedForThisWallet: false, expected, values: { sol: 1, base: 1, quote: 1 } }),
    ).toBe("loading");
  });

  it("reports ready when every expected balance was read — including a genuine zero", () => {
    expect(
      deriveBalanceStatus({ connected: true, loadedForThisWallet: true, expected, values: { sol: 0, base: 0, quote: 0 } }),
    ).toBe("ready");
  });

  it("reports partial when only some reads failed, and error when all failed — an unreadable balance is never 0", () => {
    expect(
      deriveBalanceStatus({ connected: true, loadedForThisWallet: true, expected, values: { sol: 1, base: null, quote: 2 } }),
    ).toBe("partial");
    expect(
      deriveBalanceStatus({ connected: true, loadedForThisWallet: true, expected, values: { sol: null, base: null, quote: null } }),
    ).toBe("error");
  });

  it("ignores balances that were never expected (e.g. no base mint known yet)", () => {
    expect(
      deriveBalanceStatus({
        connected: true,
        loadedForThisWallet: true,
        expected: { sol: true, base: false, quote: false },
        values: { sol: 2, base: null, quote: null },
      }),
    ).toBe("ready");
  });
});
