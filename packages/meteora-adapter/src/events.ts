import type { Connection } from "@solana/web3.js";
import { EventParser, type Program } from "@coral-xyz/anchor";
import bs58 from "bs58";
import { DYNAMIC_BONDING_CURVE_PROGRAM_ID } from "@meteora-ag/dynamic-bonding-curve-sdk";
import { getDbcClient } from "./client";

/**
 * Real DBC program events ELF's indexer cares about — a subset of the
 * full set defined in the SDK's bundled IDL (which also includes fee-
 * claim, badge, and metadata events not relevant to market analytics).
 * Verified against `DynamicBondingCurveIdl.events` on SDK 1.5.12; if a
 * future SDK version renames these, decoding simply stops matching
 * rather than silently producing wrong data — `parseLogs` only ever
 * returns events that decode cleanly against the real IDL.
 */
export type IndexedDbcEventName =
  | "EvtInitializePool"
  | "EvtInitializePoolWithTransferHook"
  | "EvtSwap"
  | "EvtSwap2"
  | "EvtSwap2WithTransferHook"
  | "EvtCurveComplete"
  | "EvtCurveCompleteWithTransferHook";

export interface DecodedDbcEvent {
  name: string;
  data: Record<string, unknown>;
}

export interface DecodedTransaction {
  signature: string;
  blockTime: number | null;
  slot: number;
  /** The transaction's fee payer — used as the trade's `trader` field. */
  feePayer: string | null;
  events: DecodedDbcEvent[];
}

/** Anchor `emit_cpi!`: the program invokes itself with this 8-byte tag, then the event's discriminator and data. */
const EVENT_IX_TAG = Buffer.from("e445a52e51cb9a1d", "hex");

interface InnerInstructionLike {
  programIdIndex: number;
  data: string;
}

/** The IDL event names are camelCased by the Anchor coder (`evtSwap2`); ELF names them as declared (`EvtSwap2`). */
const pascalCase = (name: string) => name.charAt(0).toUpperCase() + name.slice(1);

/**
 * Decodes the DBC events of one transaction. The deployed program emits its events as self-CPI inner
 * instructions (`emit_cpi!`), which never appear in the transaction logs — verified on a real devnet swap: zero
 * `Program data:` lines, one `evtSwap` and one `evtSwap2` inner instruction. Log events are still parsed too,
 * so an older program build that logs them keeps working.
 */
export function decodeDbcEvents(
  coder: Program["coder"],
  input: { logMessages: readonly string[]; accountKeys: readonly string[]; innerInstructions: readonly { instructions: readonly InnerInstructionLike[] }[] },
): DecodedDbcEvent[] {
  const events: DecodedDbcEvent[] = [];
  const dbcProgram = DYNAMIC_BONDING_CURVE_PROGRAM_ID.toBase58();

  for (const event of new EventParser(DYNAMIC_BONDING_CURVE_PROGRAM_ID, coder).parseLogs([...input.logMessages])) {
    events.push({ name: pascalCase(event.name), data: event.data as Record<string, unknown> });
  }

  for (const inner of input.innerInstructions) {
    for (const ix of inner.instructions) {
      if (input.accountKeys[ix.programIdIndex] !== dbcProgram) continue;
      const data = Buffer.from(bs58.decode(ix.data));
      if (data.length <= 8 || !data.subarray(0, 8).equals(EVENT_IX_TAG)) continue;
      const decoded = coder.events.decode(data.subarray(8).toString("base64"));
      if (decoded) events.push({ name: pascalCase(decoded.name), data: decoded.data as Record<string, unknown> });
    }
  }
  return events;
}

/**
 * Fetches a confirmed transaction and decodes every real DBC program event in it using the SDK's own Anchor
 * coder (built from the real bundled IDL) — never a hand-rolled format guess.
 * Returns `null` if the transaction can't be found or has no logs.
 */
export async function decodeTransactionEvents(
  connection: Connection,
  signature: string,
): Promise<DecodedTransaction | null> {
  const tx = await connection.getTransaction(signature, {
    commitment: "confirmed",
    maxSupportedTransactionVersion: 0,
  });
  if (!tx?.meta?.logMessages) return null;

  const coder = getDbcClient(connection).state.getProgram().coder;
  const accountKeys = tx.transaction.message.getAccountKeys({ accountKeysFromLookups: tx.meta.loadedAddresses }).keySegments().flat().map((k) => k.toBase58());
  const events = decodeDbcEvents(coder, { logMessages: tx.meta.logMessages, accountKeys, innerInstructions: tx.meta.innerInstructions ?? [] });

  const feePayer = tx.transaction.message.staticAccountKeys[0]?.toBase58() ?? null;

  return { signature, blockTime: tx.blockTime ?? null, slot: tx.slot, feePayer, events };
}
