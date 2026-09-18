import type { Connection } from "@solana/web3.js";
import { EventParser } from "@coral-xyz/anchor";
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

/**
 * Fetches a confirmed transaction and decodes every real DBC program
 * event in its logs using the SDK's own Anchor `Program` coder (built
 * from the real bundled IDL) — never a hand-rolled log-format guess.
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

  const client = getDbcClient(connection);
  const coder = client.state.getProgram().coder;
  const parser = new EventParser(DYNAMIC_BONDING_CURVE_PROGRAM_ID, coder);

  const events: DecodedDbcEvent[] = [];
  for (const event of parser.parseLogs(tx.meta.logMessages)) {
    events.push({ name: event.name, data: event.data as Record<string, unknown> });
  }

  const feePayer = tx.transaction.message.staticAccountKeys[0]?.toBase58() ?? null;

  return { signature, blockTime: tx.blockTime ?? null, slot: tx.slot, feePayer, events };
}
