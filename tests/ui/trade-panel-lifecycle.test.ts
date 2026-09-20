import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

/**
 * Structural guarantees for how the trade panel drives QUOTE → SIGN → SUBMITTED → CONFIRMED. The state descriptions
 * (trade-state.test.ts) and the polling/no-resend behaviour (confirmationPolling.test.ts) are tested at runtime; this
 * pins the WIRING between them, so an edit that lets "Confirmed" be set by anything but the chain's word, moves a state
 * out of order, or gives the panel its own way to send a transaction fails here.
 */
const source = readFileSync(join(__dirname, "../../apps/web/src/components/markets/trade-panel.tsx"), "utf8");
const tradeBody = source.slice(source.indexOf("async function trade()"), source.indexOf("const buttonLabel"));
const applyOutcomeBody = source.slice(source.indexOf("function applyOutcome("), source.indexOf("async function checkAgain()"));
const at = (needle: string, from = 0) => {
  const i = tradeBody.indexOf(needle, from);
  expect(i, `"${needle}" must appear in trade()`).toBeGreaterThan(-1);
  return i;
};

describe("trade panel lifecycle wiring", () => {
  it("1. the quote exists before anything is built or signed: trade() only starts on a valid amount and never on an unresolved trade", () => {
    expect(tradeBody).toMatch(/if \(!publicKey \|\| clusterSigner\.blocked \|\| !amountValid \|\| unresolved\) return;/);
    expect(source).toMatch(/const canTrade = Boolean\(publicKey\) && !clusterSigner\.blocked && amountValid && currentQuote !== null/);
  });

  it("2/3. states run building → signing → (wallet signs) → submitted, in that order", () => {
    const building = at('setStatus("building")');
    const swapCall = at("/swap`");
    const signing = at('setStatus("signing")');
    const sign = at("clusterSigner.sign(transaction)");
    const submit = at("submitAndConfirm(");
    const submitted = at('setStatus("submitted")');
    expect([building, swapCall, signing, sign, submit, submitted]).toEqual([...[building, swapCall, signing, sign, submit, submitted]].sort((a, b) => a - b));
  });

  it('"submitted" is only ever set by submitAndConfirm\'s onSubmitted callback — after the send, never before', () => {
    expect(source.match(/setStatus\("submitted"\)/g)).toHaveLength(1);
    expect(tradeBody).toMatch(/onSubmitted: \(s\) => \{\s*setSignature\(s\);\s*setStatus\("submitted"\);/);
  });

  it('4. "confirmed" is set in exactly one place — applyOutcome, on a confirmation the chain reported — and nowhere in trade()', () => {
    expect(source.match(/setStatus\("confirmed"\)/g)).toHaveLength(1);
    expect(applyOutcomeBody).toMatch(/result\.kind === "confirmed"[\s\S]*setStatus\("confirmed"\)/);
    expect(tradeBody).not.toMatch(/setStatus\("confirmed"\)/);
    // applyOutcome is fed only by the polling result (submitAndConfirm) or a look-up-only re-check.
    expect(source.match(/applyOutcome\(/g)).toHaveLength(3); // definition + trade() + checkAgain()
    expect(tradeBody).toMatch(/const \{ signature: sig, outcome \} = await submitAndConfirm\(/);
  });

  it("5. failures are marked at the step they happened: before submission at Sign, after it at Submitted, and on-chain failure at Submitted", () => {
    expect(tradeBody).toMatch(/let failedStep = 1;/);
    expect(tradeBody).toMatch(/failedStep = 2;\s*\/\/[\s\S]*?submitAndConfirm\(/);
    expect(tradeBody).toMatch(/setFailedAtStep\(failedStep\);\s*setStatus\("failed"\)/);
    expect(applyOutcomeBody).toMatch(/setFailedAtStep\(2\);\s*setStatus\("failed"\)/);
  });

  it("6. a timeout / unreachable RPC becomes 'unconfirmed' with the signature held — it never resends and never says failed", () => {
    expect(applyOutcomeBody).toMatch(/setUnresolved\(\{ signature: sig, lastValidBlockHeight \}\);[\s\S]*setStatus\("unconfirmed"\)/);
    // the only follow-up offered is a look-up
    expect(source).toMatch(/checkStatusAgain\(connection, unresolved\.signature/);
  });

  it("7. duplicate submission is prevented: the button is disabled while busy or unresolved, and trade() refuses to start on an unresolved trade", () => {
    expect(source).toMatch(/&& !view\.busy && unresolved === null;/);
    expect(source).toMatch(/disabled=\{!canTrade\}\s*\n\s*onClick=\{trade\}/);
    // no form or key handler gives a second way to start a trade
    expect(source).not.toMatch(/<form|\bonSubmit\b|\bonKey(Down|Up|Press)\b/);
    // the tab switch is locked while a trade is in flight
    expect(source).toMatch(/!view\.busy && setSide/);
  });

  it("the panel has no way to send a transaction itself: no direct send, no skipPreflight, no WebSocket confirmation", () => {
    expect(source).not.toMatch(/sendRawTransaction|sendTransaction|skipPreflight|confirmTransaction\(|signatureSubscribe|onSignature/);
    expect(source).toMatch(/submitAndConfirm/);
  });
});
