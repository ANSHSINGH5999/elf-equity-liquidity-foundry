import { describe, expect, it, vi } from "vitest";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { Keypair, SystemProgram, Transaction, type SignatureStatus } from "@solana/web3.js";
import bs58 from "bs58";
import { classifySendError, confirmTransactionByPolling, transactionSignature, type ConfirmationOptions, type ConfirmationProgress } from "../../packages/solana/src/confirmation.js";
import { checkStatusAgain, submitAndConfirm } from "../../apps/web/src/lib/submit-transaction.js";
import { interpretConfirmation } from "../../apps/web/src/lib/confirmation-view.js";

/**
 * Deterministic: a scripted RPC and a fake clock. No network, no wallet, no transaction. The point of the module is
 * that a transaction which landed is never called failed, one that did not is never called landed, and NOTHING here
 * can send a transaction — every scenario also asserts the send spy on the mock connection was never touched.
 */
const SIG = "5P4AtsiWL5JDqCJHhSBAau7JFVvYWNEQhJ3mmctngeXuNXZ2PFeXxrUzQkgEC6SFtzznKUjqzbEDVwQVBBgsVbXT";
const LAST_VALID = 1_000;

const status = (over: Partial<SignatureStatus> = {}): SignatureStatus => ({ slot: 42, confirmations: 1, err: null, confirmationStatus: "confirmed", ...over });
const processed = () => status({ confirmationStatus: "processed" });
const finalized = () => status({ confirmationStatus: "finalized", confirmations: null });
const rpcError = (message: string) => new Error(message);

type Step<T> = T | Error;
function fakeRpc(script: { statuses?: Step<SignatureStatus | null>[]; heights?: Step<number>[]; history?: Step<SignatureStatus | null>; tx?: Step<{ slot: number; meta: { err: unknown } | null } | null> } = {}) {
  const statuses = [...(script.statuses ?? [null])];
  const heights = [...(script.heights ?? [LAST_VALID - 500])];
  const next = <T,>(queue: Step<T>[]): T => {
    const step = queue.length > 1 ? queue.shift()! : queue[0]!; // the last step repeats
    if (step instanceof Error) throw step;
    return step as T;
  };
  const sendRawTransaction = vi.fn();
  const sendTransaction = vi.fn();
  const getSignatureStatuses = vi.fn(async (_sigs: string[], config?: { searchTransactionHistory?: boolean }) => {
    if (config?.searchTransactionHistory) {
      const h = script.history ?? null;
      if (h instanceof Error) throw h;
      return { context: { slot: 1 }, value: [h] };
    }
    return { context: { slot: 1 }, value: [next(statuses)] };
  });
  const getBlockHeight = vi.fn(async () => next(heights));
  const getTransaction = vi.fn(async () => {
    const t = script.tx ?? null;
    if (t instanceof Error) throw t;
    return t;
  });
  const rpc = { getSignatureStatuses, getBlockHeight, getTransaction, sendRawTransaction, sendTransaction } as never;
  return { rpc, getSignatureStatuses, getBlockHeight, getTransaction, sendRawTransaction, sendTransaction };
}

function fakeClock() {
  let t = 1_000_000;
  const sleeps: number[] = [];
  return { now: () => t, sleep: async (ms: number) => void (sleeps.push(ms), (t += ms)), random: () => 0.5, sleeps };
}
const run = (rpc: unknown, over: Partial<ConfirmationOptions> = {}) => {
  const clock = fakeClock();
  return { clock, promise: confirmTransactionByPolling(rpc as never, { signature: SIG, lastValidBlockHeight: LAST_VALID, ...clock, ...over }) };
};
const neverSent = (m: ReturnType<typeof fakeRpc>) => {
  expect(m.sendRawTransaction).not.toHaveBeenCalled();
  expect(m.sendTransaction).not.toHaveBeenCalled();
};

describe("confirmTransactionByPolling", () => {
  it("1. confirmed: a transaction that appears as confirmed after a few empty polls is confirmed", async () => {
    const m = fakeRpc({ statuses: [null, null, status()] });
    const { promise, clock } = run(m.rpc);
    expect(await promise).toEqual({ state: "confirmed", commitment: "confirmed", slot: 42 });
    expect(m.getSignatureStatuses).toHaveBeenCalledTimes(3);
    expect(clock.sleeps).toHaveLength(2);
    neverSent(m);
  });

  it("2. finalized: finalized satisfies 'confirmed', and is what 'finalized' waits for", async () => {
    const m = fakeRpc({ statuses: [finalized()] });
    expect(await run(m.rpc).promise).toEqual({ state: "confirmed", commitment: "finalized", slot: 42 });

    const wait = fakeRpc({ statuses: [status(), status(), finalized()] });
    expect(await run(wait.rpc, { commitment: "finalized" }).promise).toMatchObject({ state: "confirmed", commitment: "finalized" });
    expect(wait.getSignatureStatuses).toHaveBeenCalledTimes(3); // "confirmed" was not enough when finalized was asked for
    neverSent(m);
    neverSent(wait);
  });

  it("3. on-chain error: the cluster's own error is returned, not a generic failure", async () => {
    const err = { InstructionError: [0, { Custom: 6002 }] };
    const m = fakeRpc({ statuses: [null, status({ err })] });
    expect(await run(m.rpc).promise).toEqual({ state: "failed", err });
    neverSent(m);
  });

  it("4. pending: a processed-but-unconfirmed transaction keeps being polled and is reported as still pending, then timed out", async () => {
    const events: ConfirmationProgress[] = [];
    const m = fakeRpc({ statuses: [null, processed()], history: processed() });
    const { promise } = run(m.rpc, { timeoutMs: 20_000, onProgress: (p) => events.push(p) });
    expect(await promise).toEqual({ state: "timed_out", lastStatus: "processed" });
    expect(events.map((e) => e.phase)).toEqual(expect.arrayContaining(["waiting", "processed"]));
    neverSent(m);
  });

  it("5. expiry: past lastValidBlockHeight with nothing found (status, history, getTransaction) is 'expired'", async () => {
    const m = fakeRpc({ statuses: [null], heights: [LAST_VALID - 1, LAST_VALID + 1], history: null, tx: null });
    expect(await run(m.rpc).promise).toEqual({ state: "expired" });
    expect(m.getTransaction).toHaveBeenCalledTimes(1); // it really looked before saying so
    neverSent(m);
  });

  it("5b. expiry is NOT declared when the transaction turns up in the final look-up (it landed)", async () => {
    const landed = fakeRpc({ statuses: [null], heights: [LAST_VALID + 1], history: status() });
    expect(await run(landed.rpc).promise).toMatchObject({ state: "confirmed" });
    const viaTx = fakeRpc({ statuses: [null], heights: [LAST_VALID + 1], history: null, tx: { slot: 77, meta: { err: null } } });
    expect(await run(viaTx.rpc).promise).toEqual({ state: "confirmed", commitment: "confirmed", slot: 77 });
    const failedViaTx = fakeRpc({ statuses: [null], heights: [LAST_VALID + 1], history: null, tx: { slot: 77, meta: { err: "boom" } } });
    expect(await run(failedViaTx.rpc).promise).toEqual({ state: "failed", err: "boom" });
    neverSent(landed);
    neverSent(viaTx);
  });

  it("5c. expiry is NOT declared when the final look-up itself fails: that is 'RPC unavailable', not a fact", async () => {
    const m = fakeRpc({ statuses: [null], heights: [LAST_VALID + 1], history: rpcError("503 Service Unavailable") });
    expect(await run(m.rpc).promise).toEqual({ state: "rpc_unavailable", lastError: "unavailable" });
    neverSent(m);
  });

  it("6. temporary RPC failure: failed polls are retried, never treated as a failed transaction", async () => {
    const events: ConfirmationProgress[] = [];
    const m = fakeRpc({ statuses: [rpcError("fetch failed"), rpcError("429 Too Many Requests"), null] });
    const { promise } = run(m.rpc, { timeoutMs: 8_000, onProgress: (p) => events.push(p) });
    const outcome = await promise;
    expect(outcome.state).not.toBe("failed");
    expect(events.filter((e) => e.phase === "rpc_retry").map((e) => (e as { error: string }).error)).toEqual(["unavailable", "rate_limited"]);
    neverSent(m);
  });

  it("7. polling timeout: still valid and nothing seen at the hard limit is 'timed out' — unresolved, not failed", async () => {
    const m = fakeRpc({ statuses: [null], heights: [LAST_VALID - 100], history: null, tx: null });
    const { promise, clock } = run(m.rpc, { timeoutMs: 30_000 });
    expect(await promise).toEqual({ state: "timed_out", lastStatus: "not_seen" });
    expect(clock.now() - 1_000_000).toBeLessThanOrEqual(30_000); // the hard limit really bounds the wait
    neverSent(m);
  });

  it("7b. persistent RPC failure to the end is 'RPC unavailable', with the rate-limit case named", async () => {
    const m = fakeRpc({ statuses: [rpcError("429 Too Many Requests")], history: rpcError("429 Too Many Requests") });
    expect(await run(m.rpc, { timeoutMs: 20_000 }).promise).toEqual({ state: "rpc_unavailable", lastError: "rate_limited" });
    neverSent(m);
  });

  it("8. confirmation after a temporary RPC failure: the earlier failure does not poison a later success", async () => {
    const m = fakeRpc({ statuses: [rpcError("fetch failed"), rpcError("fetch failed"), rpcError("ETIMEDOUT"), status()] });
    expect(await run(m.rpc).promise).toEqual({ state: "confirmed", commitment: "confirmed", slot: 42 });
    neverSent(m);
  });

  it("backs off with jitter up to a ceiling, and the total wait never exceeds the hard limit", async () => {
    const m = fakeRpc({ statuses: [null], history: null, tx: null });
    const { promise, clock } = run(m.rpc, { timeoutMs: 60_000, jitter: 0, initialIntervalMs: 1_000, maxIntervalMs: 4_000 });
    await promise;
    expect(clock.sleeps.slice(0, 4)).toEqual([1_000, 1_500, 2_250, 3_375]);
    expect(Math.max(...clock.sleeps)).toBeLessThanOrEqual(4_000);
    expect(clock.sleeps.reduce((a, b) => a + b, 0)).toBeLessThanOrEqual(60_000);
    // jitter moves each wait within ±20% and can never make it negative
    const jittered = run(fakeRpc({ statuses: [null], history: null }).rpc, { timeoutMs: 10_000, jitter: 0.2, random: () => 1 });
    await jittered.promise;
    expect(jittered.clock.sleeps[0]).toBeCloseTo(1_200);
  });

  it("stops promptly when aborted, and says so honestly (unresolved, not failed)", async () => {
    const controller = new AbortController();
    const m = fakeRpc({ statuses: [null], history: null });
    const clock = fakeClock();
    const p = confirmTransactionByPolling(m.rpc as never, { signature: SIG, lastValidBlockHeight: LAST_VALID, ...clock, timeoutMs: 600_000, signal: controller.signal, sleep: async (ms) => { controller.abort(); await clock.sleep(ms); } });
    expect((await p).state).toBe("timed_out");
  });
});

describe("duplicate-send prevention", () => {
  const signedTx = () => {
    const payer = Keypair.generate();
    const tx = new Transaction({ feePayer: payer.publicKey, recentBlockhash: bs58.encode(Keypair.generate().publicKey.toBytes()) }).add(SystemProgram.transfer({ fromPubkey: payer.publicKey, toPubkey: payer.publicKey, lamports: 1 }));
    tx.sign(payer);
    return tx;
  };
  const connection = (script: Parameters<typeof fakeRpc>[0], send: () => Promise<string>) => {
    const m = fakeRpc(script);
    (m.rpc as { sendRawTransaction: unknown }).sendRawTransaction = m.sendRawTransaction.mockImplementation(send);
    return m;
  };
  const fast = { ...fakeClock(), timeoutMs: 10_000 };

  it("9a. the module that confirms has no way to send: its source never names a send method", () => {
    const src = readFileSync(join(__dirname, "../../packages/solana/src/confirmation.ts"), "utf8").replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "");
    expect(src).not.toMatch(/sendRawTransaction|sendTransaction|sendAndConfirm|requestAirdrop/);
  });

  it("9b. a send followed by a confirmation timeout sends exactly once, and reports the real signature", async () => {
    const tx = signedTx();
    const m = connection({ statuses: [null], history: null, tx: null }, async () => transactionSignature(tx));
    const onSubmitted = vi.fn();
    const result = await submitAndConfirm(m.rpc, tx, { lastValidBlockHeight: LAST_VALID, onSubmitted, ...fast });
    expect(result.outcome.state).toBe("timed_out");
    expect(result.signature).toBe(transactionSignature(tx));
    expect(m.sendRawTransaction).toHaveBeenCalledTimes(1);
    expect(onSubmitted).toHaveBeenCalledWith(result.signature);
    expect(m.sendRawTransaction).toHaveBeenCalledWith(expect.anything(), { skipPreflight: false }); // preflight stays on
  });

  it("9c. a send whose response is lost (timeout) is NOT retried: the signature is looked up, and a landed transaction is found", async () => {
    const tx = signedTx();
    const m = connection({ statuses: [null, status()] }, async () => { throw rpcError("fetch failed"); });
    const result = await submitAndConfirm(m.rpc, tx, { lastValidBlockHeight: LAST_VALID, onSubmitted: () => undefined, ...fast });
    expect(result.outcome).toMatchObject({ state: "confirmed" });
    expect(result.signature).toBe(transactionSignature(tx)); // known locally, before any response
    expect(m.sendRawTransaction).toHaveBeenCalledTimes(1);
  });

  it("9d. a preflight rejection is rethrown (it proves nothing landed) and nothing is polled or resent", async () => {
    const tx = signedTx();
    const rejection = Object.assign(new Error("Transaction simulation failed: custom program error: 0x1772"), { name: "SendTransactionError" });
    const m = connection({}, async () => { throw rejection; });
    await expect(submitAndConfirm(m.rpc, tx, { lastValidBlockHeight: LAST_VALID, onSubmitted: () => undefined, ...fast })).rejects.toBe(rejection);
    expect(m.sendRawTransaction).toHaveBeenCalledTimes(1);
    expect(m.getSignatureStatuses).not.toHaveBeenCalled();
  });

  it("9e. 'Check status again' is a look-up only and never sends, whatever the outcome", async () => {
    for (const script of [{ statuses: [status()] }, { statuses: [null], heights: [LAST_VALID + 1], history: null }, { statuses: [rpcError("fetch failed")], history: rpcError("fetch failed") }, { statuses: [null], history: null }]) {
      const m = fakeRpc(script);
      await checkStatusAgain(m.rpc as never, SIG, LAST_VALID, fakeClock());
      neverSent(m);
    }
  });

  it("classifies send errors: preflight/blockhash rejections prove non-acceptance, network faults prove nothing", () => {
    expect(classifySendError(Object.assign(new Error("x"), { name: "SendTransactionError" }))).toBe("rejected");
    expect(classifySendError(new Error("Blockhash not found"))).toBe("rejected");
    expect(classifySendError(new Error("fetch failed"))).toBe("unknown_outcome");
    expect(classifySendError(new Error("429 Too Many Requests"))).toBe("unknown_outcome");
    expect(classifySendError(new Error("ETIMEDOUT"))).toBe("unknown_outcome");
  });
});

describe("interpretConfirmation — what the user is told", () => {
  it("only a confirmed outcome is success; only on-chain error and expiry are failures", () => {
    expect(interpretConfirmation({ state: "confirmed", commitment: "confirmed", slot: 1 }).kind).toBe("confirmed");
    expect(interpretConfirmation({ state: "failed", err: { InstructionError: [0, { Custom: 6002 }] } })).toMatchObject({ kind: "failed", reason: "on_chain" });
    expect(interpretConfirmation({ state: "failed", err: "x" })).toMatchObject({ message: expect.stringContaining("executed on-chain but failed") });
    expect(interpretConfirmation({ state: "expired" })).toMatchObject({ kind: "failed", reason: "expired", message: expect.stringContaining("safe to try again") });
  });

  it("a timeout or an unreachable RPC is UNRESOLVED, promises no resend, and never says it failed", () => {
    for (const outcome of [{ state: "timed_out", lastStatus: "not_seen" }, { state: "rpc_unavailable", lastError: "rate_limited" }, { state: "rpc_unavailable", lastError: "unavailable" }] as const) {
      const view = interpretConfirmation(outcome);
      expect(view.kind).toBe("unresolved");
      expect(view).toMatchObject({ message: expect.stringMatching(/will not send it again/) });
      expect((view as { message: string }).message).not.toMatch(/did not land|safe to try again/);
    }
    expect(interpretConfirmation({ state: "rpc_unavailable", lastError: "rate_limited" })).toMatchObject({ message: expect.stringContaining("rate limiting") });
  });
});

describe("no critical flow depends on WebSocket subscriptions (static)", () => {
  const root = join(__dirname, "../..");
  const walk = (dir: string): string[] =>
    readdirSync(dir).flatMap((f) => {
      const p = join(dir, f);
      if (f === "node_modules" || f === ".next" || f === "generated") return [];
      return statSync(p).isDirectory() ? walk(p) : /\.(ts|tsx)$/.test(f) ? [p] : [];
    });
  const sources = [join(root, "apps/web/src"), ...readdirSync(join(root, "packages")).map((d) => join(root, "packages", d, "src"))].filter((d) => { try { return statSync(d).isDirectory(); } catch { return false; } }).flatMap(walk);
  const code = (f: string) => readFileSync(f, "utf8").replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "");
  const rel = (f: string) => f.slice(root.length + 1);

  it("no app or package code calls confirmTransaction, sendAndConfirm*, or a web3.js WebSocket subscription", () => {
    const banned = /\.(confirmTransaction|sendAndConfirmTransaction|sendAndConfirmRawTransaction|onSignature|onSignatureWithOptions|onAccountChange|onProgramAccountChange|onSlotChange|onSlotUpdate|onLogs|onRootChange)\(|\b(signatureSubscribe|accountSubscribe|slotSubscribe|programSubscribe|logsSubscribe)\b/;
    expect(sources.filter((f) => banned.test(code(f))).map(rel)).toEqual([]);
  });

  it("both browser send paths go through submitAndConfirm — the only place a signed transaction is sent", () => {
    expect(sources.filter((f) => /\.sendRawTransaction\(/.test(code(f))).map(rel)).toEqual(["apps/web/src/lib/submit-transaction.ts"]);
    for (const flow of ["apps/web/src/components/markets/trade-panel.tsx", "apps/web/src/components/design/review-step.tsx"]) {
      expect(code(join(root, flow))).toMatch(/submitAndConfirm\(/);
    }
  });
});
