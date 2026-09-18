import BN from "bn.js";

/**
 * Anchor's Borsh event decoder key casing for this SDK/IDL combination
 * was not independently confirmed against a live decoded event (no
 * funded devnet pool was available to generate one during development
 * — see docs/indexer.md). The IDL itself declares snake_case field
 * names (`output_amount`, `trade_direction`, ...); some Anchor client
 * versions preserve that casing verbatim, others normalize to camelCase.
 * Rather than guess and silently read `undefined` as an amount, every
 * field access here tries both casings and throws if neither is present
 * — a decoding assumption that turns out wrong fails loudly instead of
 * writing fabricated zeros into the database.
 */
export function readField(data: Record<string, unknown>, snakeKey: string, camelKey: string): unknown {
  if (snakeKey in data) return data[snakeKey];
  if (camelKey in data) return data[camelKey];
  throw new Error(`Expected field "${snakeKey}"/"${camelKey}" not present on decoded event data.`);
}

export function readBN(data: Record<string, unknown>, snakeKey: string, camelKey: string): BN {
  const value = readField(data, snakeKey, camelKey);
  if (BN.isBN(value)) return value;
  if (typeof value === "string" || typeof value === "number") return new BN(value);
  throw new Error(`Expected field "${snakeKey}"/"${camelKey}" to be BN-like, got ${typeof value}.`);
}

export function readNumber(data: Record<string, unknown>, snakeKey: string, camelKey: string): number {
  const value = readField(data, snakeKey, camelKey);
  if (typeof value === "number") return value;
  if (typeof value === "bigint") return Number(value);
  if (BN.isBN(value)) return value.toNumber();
  throw new Error(`Expected field "${snakeKey}"/"${camelKey}" to be numeric, got ${typeof value}.`);
}

export function readPubkeyString(data: Record<string, unknown>, snakeKey: string, camelKey: string): string {
  const value = readField(data, snakeKey, camelKey);
  if (value && typeof (value as { toBase58?: unknown }).toBase58 === "function") {
    return (value as { toBase58: () => string }).toBase58();
  }
  if (typeof value === "string") return value;
  throw new Error(`Expected field "${snakeKey}"/"${camelKey}" to be a public key, got ${typeof value}.`);
}
