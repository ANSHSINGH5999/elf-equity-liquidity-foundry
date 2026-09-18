import { PublicKey } from "@solana/web3.js";

/** Parses and validates a public key. Throws a descriptive error rather than an opaque one. */
export function parsePublicKeyOrThrow(value: string, fieldName = "publicKey"): PublicKey {
  try {
    return new PublicKey(value);
  } catch {
    throw new Error(`Invalid ${fieldName}: "${value}" is not a valid Solana public key.`);
  }
}

export function isValidPublicKey(value: string): boolean {
  try {
    // eslint-disable-next-line no-new
    new PublicKey(value);
    return true;
  } catch {
    return false;
  }
}
