import { DynamicBondingCurveClient, DYNAMIC_BONDING_CURVE_PROGRAM_ID } from "@meteora-ag/dynamic-bonding-curve-sdk";
import type { Connection, Commitment } from "@solana/web3.js";

/** Single entry point for the real Meteora DBC SDK. Never constructed elsewhere. */
export function getDbcClient(connection: Connection, commitment: Commitment = "confirmed"): DynamicBondingCurveClient {
  return DynamicBondingCurveClient.create(connection, commitment);
}

/** The real, deployed Meteora DBC program ID — re-exported so callers can verify account ownership without reaching into the SDK directly. */
export { DYNAMIC_BONDING_CURVE_PROGRAM_ID };
