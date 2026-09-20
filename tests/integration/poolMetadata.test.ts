import { describe, expect, it } from "vitest";
import {
  METAPLEX_MAX_NAME_BYTES,
  METAPLEX_MAX_SYMBOL_BYTES,
  METAPLEX_MAX_URI_BYTES,
  fitOnChainMetadata,
  fitToUtf8Bytes,
} from "../../packages/meteora-adapter/src/index.js";

/**
 * Regression for the real-devnet failure of `createPool`:
 *   Program metaqbxx… log: Name too long  → custom program error 0xb → InstructionError [0, Custom 11]
 * The sample asset "Helios Aerodyne — Pre-IPO (Sample)" is 34 characters but 36 UTF-8 bytes (the em dash is 3),
 * over Metaplex's 32-byte token-name limit.
 */
const bytes = (s: string) => new TextEncoder().encode(s).length;

describe("on-chain token metadata fitting", () => {
  it("the exact name that failed on Devnet now fits", () => {
    const name = "Helios Aerodyne — Pre-IPO (Sample)";
    expect(name.length).toBe(34);
    expect(bytes(name)).toBe(36); // the reason it failed
    const fitted = fitToUtf8Bytes(name, METAPLEX_MAX_NAME_BYTES);
    expect(bytes(fitted)).toBeLessThanOrEqual(METAPLEX_MAX_NAME_BYTES);
    expect(fitted).toBe("Helios Aerodyne — Pre-IPO"); // cut at a word boundary, no dangling "(Sam"
  });

  it("text that already fits is unchanged, including exactly at the limit", () => {
    expect(fitToUtf8Bytes("OpenAI PreStocks", 32)).toBe("OpenAI PreStocks");
    const exact = "a".repeat(32);
    expect(fitToUtf8Bytes(exact, 32)).toBe(exact);
    expect(fitToUtf8Bytes("a".repeat(33), 32)).toHaveLength(32);
  });

  it("counts bytes, not characters, and never splits a multi-byte character", () => {
    for (const text of ["é".repeat(20), "—".repeat(20), "😀".repeat(12), "日本語のトークン名がとても長い場合のテスト文字列です"]) {
      const fitted = fitToUtf8Bytes(text, 32);
      expect(bytes(fitted)).toBeLessThanOrEqual(32);
      // Decodes strictly: no half characters.
      expect(() => new TextDecoder("utf-8", { fatal: true }).decode(new TextEncoder().encode(fitted))).not.toThrow();
      expect(text.startsWith(fitted)).toBe(true);
    }
  });

  it("never leaves a dangling separator after a cut", () => {
    for (const text of ["Alpha Beta Gamma Delta Epsilon Zeta —", "Alpha Beta Gamma Delta Epsilon Zeta ( x)", "Alpha-Beta-Gamma-Delta-Epsilon-Zeta-Eta"]) {
      expect(fitToUtf8Bytes(text, 30)).not.toMatch(/[\s—–\-:,;/|(]$/u);
    }
  });

  it("holds for arbitrary input (deterministic sweep)", () => {
    let seed = 1;
    const rnd = () => (seed = (seed * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff;
    const alphabet = ["a", "B", " ", "—", "é", "日", "😀", "-", "(", ")", "9"];
    for (let i = 0; i < 500; i++) {
      const text = Array.from({ length: Math.floor(rnd() * 60) }, () => alphabet[Math.floor(rnd() * alphabet.length)]).join("");
      for (const limit of [10, 32]) expect(bytes(fitToUtf8Bytes(text, limit))).toBeLessThanOrEqual(limit);
    }
  });

  it("fits name and symbol to their own limits and reports when it changed anything", () => {
    const meta = fitOnChainMetadata({ name: "Helios Aerodyne — Pre-IPO (Sample)", symbol: "HELIOSAERODYNE", uri: "http://localhost:3000/api/assets/x/metadata" });
    expect(bytes(meta.name)).toBeLessThanOrEqual(METAPLEX_MAX_NAME_BYTES);
    expect(bytes(meta.symbol)).toBeLessThanOrEqual(METAPLEX_MAX_SYMBOL_BYTES);
    expect(meta.truncated).toBe(true);
    expect(fitOnChainMetadata({ name: "Acme", symbol: "ACME", uri: "https://x.test/m" }).truncated).toBe(false);
  });

  it("a URI cannot be truncated: an oversized one is an error, not a silent change", () => {
    expect(() => fitOnChainMetadata({ name: "A", symbol: "A", uri: "https://x.test/" + "a".repeat(METAPLEX_MAX_URI_BYTES) })).toThrow(/on-chain limit is 200/);
  });

  it("refuses to produce an empty name or symbol", () => {
    expect(() => fitOnChainMetadata({ name: "   ", symbol: "OK", uri: "https://x.test/m" })).toThrow(/must not be empty/);
  });
});
