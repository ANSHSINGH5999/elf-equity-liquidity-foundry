import { describe, expect, it } from "vitest";
import { PublicKey, type Connection } from "@solana/web3.js";
import {
  assertClusterMatches,
  assertAccountOwnedByProgram,
  NetworkMismatchError,
  UnexpectedAccountOwnerError,
} from "../../packages/solana/src/index.js";

const DEVNET_GENESIS = "EtWTRABZaYq6iMfeYKouRu166VU2xqa1wcaWoxPkrZBG";
const MAINNET_GENESIS = "5eykt4UsFv8P8NJdTREpY1vzqKqZKvdpKuc147dw2N9d";

function fakeConnection(overrides: Partial<Connection>): Connection {
  return overrides as Connection;
}

describe("assertClusterMatches", () => {
  it("passes silently when the genesis hash matches the expected cluster", async () => {
    const connection = fakeConnection({ rpcEndpoint: "https://fake-devnet.test", getGenesisHash: async () => DEVNET_GENESIS });
    await expect(assertClusterMatches(connection, "devnet")).resolves.toBeUndefined();
  });

  it("throws NetworkMismatchError when the genesis hash does not match", async () => {
    const connection = fakeConnection({ rpcEndpoint: "https://fake-mismatched.test", getGenesisHash: async () => MAINNET_GENESIS });
    await expect(assertClusterMatches(connection, "devnet")).rejects.toBeInstanceOf(NetworkMismatchError);
  });

  it("does not reuse a cached result across different RPC endpoints", async () => {
    const devnetConn = fakeConnection({ rpcEndpoint: "https://fake-a.test", getGenesisHash: async () => DEVNET_GENESIS });
    const mainnetConn = fakeConnection({ rpcEndpoint: "https://fake-b.test", getGenesisHash: async () => MAINNET_GENESIS });
    await assertClusterMatches(devnetConn, "devnet");
    await expect(assertClusterMatches(mainnetConn, "devnet")).rejects.toBeInstanceOf(NetworkMismatchError);
  });
});

describe("assertAccountOwnedByProgram", () => {
  const address = PublicKey.default;
  const expectedOwner = new PublicKey("dbcij3LWUppWqq96dh6gJWwBifmcGfLSB5D4DuSMaqN");

  it("passes silently when the account is owned by the expected program", async () => {
    const connection = fakeConnection({
      getAccountInfo: async () => ({ owner: expectedOwner }) as never,
    });
    await expect(assertAccountOwnedByProgram(connection, address, expectedOwner, "config")).resolves.toBeUndefined();
  });

  it("throws UnexpectedAccountOwnerError when the account is owned by a different program", async () => {
    const connection = fakeConnection({
      getAccountInfo: async () => ({ owner: PublicKey.default }) as never,
    });
    await expect(assertAccountOwnedByProgram(connection, address, expectedOwner, "config")).rejects.toBeInstanceOf(
      UnexpectedAccountOwnerError,
    );
  });

  it("throws UnexpectedAccountOwnerError when the account does not exist", async () => {
    const connection = fakeConnection({ getAccountInfo: async () => null });
    await expect(assertAccountOwnedByProgram(connection, address, expectedOwner, "config")).rejects.toBeInstanceOf(
      UnexpectedAccountOwnerError,
    );
  });
});
