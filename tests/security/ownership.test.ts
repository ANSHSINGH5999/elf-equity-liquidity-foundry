import { describe, expect, it } from "vitest";
import { Keypair } from "@solana/web3.js";
import nacl from "tweetnacl";
import bs58 from "bs58";
import {
  buildOwnershipMessage,
  verifyOwnershipSignature,
  OWNERSHIP_SIGNATURE_MAX_SKEW_MS,
} from "../../packages/solana/src/index.js";
import { checkDeploymentOwnership } from "../../apps/web/src/lib/server/deployment-auth.js";

function signAs(keypair: Keypair, params: { route: string; resourceId: string; timestamp: number; payerPublicKey?: string }) {
  const message = buildOwnershipMessage({
    route: params.route,
    resourceId: params.resourceId,
    payerPublicKey: params.payerPublicKey ?? keypair.publicKey.toBase58(),
    timestamp: params.timestamp,
  });
  return bs58.encode(nacl.sign.detached(new TextEncoder().encode(message), keypair.secretKey));
}

describe("verifyOwnershipSignature (HIGH-1)", () => {
  const alice = Keypair.generate();
  const mallory = Keypair.generate();
  const now = Date.now();
  const baseParams = { route: "dbc/config", resourceId: "curve-config-1", timestamp: now };

  it("accepts a genuine signature from the claimed payer", () => {
    const signature = signAs(alice, baseParams);
    const result = verifyOwnershipSignature({ ...baseParams, payerPublicKey: alice.publicKey.toBase58(), signature });
    expect(result.valid).toBe(true);
  });

  it("rejects a signature produced by a different keypair than the claimed payer", () => {
    // Mallory signs, but the request claims to be Alice's public key —
    // exactly the "trust a wallet address supplied only in the request
    // body" failure mode this whole mechanism exists to close.
    const forgedSignature = signAs(mallory, { ...baseParams, payerPublicKey: alice.publicKey.toBase58() });
    const result = verifyOwnershipSignature({
      ...baseParams,
      payerPublicKey: alice.publicKey.toBase58(),
      signature: forgedSignature,
    });
    expect(result.valid).toBe(false);
  });

  it("rejects a signature over a different resourceId than claimed (can't reuse a signature across deployments)", () => {
    const signature = signAs(alice, { ...baseParams, resourceId: "curve-config-1" });
    const result = verifyOwnershipSignature({
      ...baseParams,
      resourceId: "curve-config-2", // different resource than what was actually signed
      payerPublicKey: alice.publicKey.toBase58(),
      signature,
    });
    expect(result.valid).toBe(false);
  });

  it("rejects a signature over a different route than claimed", () => {
    const signature = signAs(alice, { ...baseParams, route: "dbc/config" });
    const result = verifyOwnershipSignature({
      ...baseParams,
      route: "dbc/pool",
      payerPublicKey: alice.publicKey.toBase58(),
      signature,
    });
    expect(result.valid).toBe(false);
  });

  it("rejects a timestamp far in the past (stale signature)", () => {
    const staleTimestamp = now - OWNERSHIP_SIGNATURE_MAX_SKEW_MS - 60_000;
    const signature = signAs(alice, { ...baseParams, timestamp: staleTimestamp });
    const result = verifyOwnershipSignature({
      ...baseParams,
      timestamp: staleTimestamp,
      payerPublicKey: alice.publicKey.toBase58(),
      signature,
    });
    expect(result.valid).toBe(false);
  });

  it("rejects a timestamp far in the future (clock-skew abuse)", () => {
    const futureTimestamp = now + OWNERSHIP_SIGNATURE_MAX_SKEW_MS + 60_000;
    const signature = signAs(alice, { ...baseParams, timestamp: futureTimestamp });
    const result = verifyOwnershipSignature({
      ...baseParams,
      timestamp: futureTimestamp,
      payerPublicKey: alice.publicKey.toBase58(),
      signature,
    });
    expect(result.valid).toBe(false);
  });

  it("rejects a malformed signature encoding without throwing", () => {
    const result = verifyOwnershipSignature({
      ...baseParams,
      payerPublicKey: alice.publicKey.toBase58(),
      signature: "not-valid-base58!!!",
    });
    expect(result.valid).toBe(false);
  });

  it("rejects an invalid claimed public key without throwing", () => {
    const signature = signAs(alice, baseParams);
    const result = verifyOwnershipSignature({ ...baseParams, payerPublicKey: "not-a-real-pubkey", signature });
    expect(result.valid).toBe(false);
  });
});

describe("checkDeploymentOwnership (HIGH-1 — User A cannot operate on User B's deployment)", () => {
  const alice = Keypair.generate();
  const mallory = Keypair.generate();

  it("allows the first caller to claim an unowned resource (no existing owner recorded yet)", async () => {
    const timestamp = Date.now();
    const signature = signAs(alice, { route: "dbc/config", resourceId: "res-new", timestamp });
    const result = checkDeploymentOwnership({
      message: { route: "dbc/config", resourceId: "res-new", payerPublicKey: alice.publicKey.toBase58(), timestamp },
      signature,
      existingOwnerWallet: null,
      existingLastAuthTimestamp: null,
    });
    expect(result).toBeNull();
  });

  it("allows the recorded owner to act on their own deployment again", async () => {
    const timestamp = Date.now();
    const signature = signAs(alice, { route: "dbc/pool", resourceId: "launch-alice-1", timestamp });
    const result = checkDeploymentOwnership({
      message: { route: "dbc/pool", resourceId: "launch-alice-1", payerPublicKey: alice.publicKey.toBase58(), timestamp },
      signature,
      existingOwnerWallet: alice.publicKey.toBase58(),
      existingLastAuthTimestamp: new Date(timestamp - 10_000),
    });
    expect(result).toBeNull();
  });

  it("REJECTS a different (but genuinely authenticated) wallet acting on someone else's deployment", async () => {
    // This is the exact HIGH-1 attack: Mallory legitimately controls her
    // own keypair and signs a fully valid message for HERSELF — but the
    // resource already belongs to Alice.
    const timestamp = Date.now();
    const signature = signAs(mallory, { route: "dbc/pool", resourceId: "launch-alice-1", timestamp });
    const result = checkDeploymentOwnership({
      message: { route: "dbc/pool", resourceId: "launch-alice-1", payerPublicKey: mallory.publicKey.toBase58(), timestamp },
      signature,
      existingOwnerWallet: alice.publicKey.toBase58(),
      existingLastAuthTimestamp: new Date(timestamp - 10_000),
    });
    expect(result).not.toBeNull();
    const body = await result!.json();
    expect(result!.status).toBe(403);
    expect(body.error.code).toBe("forbidden");
  });

  it("REJECTS a request with no valid signature at all", async () => {
    const timestamp = Date.now();
    const result = checkDeploymentOwnership({
      message: { route: "dbc/config", resourceId: "res-1", payerPublicKey: mallory.publicKey.toBase58(), timestamp },
      signature: bs58.encode(new Uint8Array(64)), // well-formed length, wrong content
      existingOwnerWallet: null,
      existingLastAuthTimestamp: null,
    });
    expect(result).not.toBeNull();
    const body = await result!.json();
    expect(result!.status).toBe(401);
    expect(body.error.code).toBe("unauthorized");
  });

  it("REJECTS a replayed (already-used) signature for the same resource", async () => {
    const timestamp = Date.now() - 60_000;
    const signature = signAs(alice, { route: "dbc/pool", resourceId: "launch-alice-2", timestamp });
    const result = checkDeploymentOwnership({
      message: { route: "dbc/pool", resourceId: "launch-alice-2", payerPublicKey: alice.publicKey.toBase58(), timestamp },
      signature,
      existingOwnerWallet: alice.publicKey.toBase58(),
      // A later auth was already accepted for this resource than the one we're presenting now.
      existingLastAuthTimestamp: new Date(timestamp + 1_000),
    });
    expect(result).not.toBeNull();
    expect(result!.status).toBe(401);
  });
});
