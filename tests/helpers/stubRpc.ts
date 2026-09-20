import { createServer, type Server } from "node:http";
import type { AddressInfo } from "node:net";
import { GENESIS_HASHES } from "../../packages/solana/src/network.js";

/**
 * A local JSON-RPC endpoint for tests that must be deterministic and offline. It serves ONLY what a test asserts on:
 *  - `getGenesisHash` — which cluster this endpoint claims to be (the identity handshake ELF verifies), or
 *  - HTTP 429 for everything, to exercise rate-limit detection.
 * It never serves accounts, balances, blocks or transactions: every other method is a JSON-RPC "method not found".
 * The URL contains "devnet" on purpose — ELF derives the cluster from the URL, then verifies it against the genesis.
 */
export interface StubRpc {
  url: string;
  close: () => Promise<void>;
}

export async function startStubRpc(mode: { genesisOf: "devnet" | "mainnet-beta" } | { rateLimited: true }): Promise<StubRpc> {
  const server: Server = createServer((req, res) => {
    let raw = "";
    req.on("data", (chunk) => (raw += chunk));
    req.on("end", () => {
      if ("rateLimited" in mode) {
        res.writeHead(429, { "content-type": "application/json" }).end(JSON.stringify({ error: "Too many requests" }));
        return;
      }
      let call: { id?: number; method?: string } = {};
      try {
        call = JSON.parse(raw);
      } catch {
        // fall through to method-not-found
      }
      res.writeHead(200, { "content-type": "application/json" });
      res.end(
        JSON.stringify(
          call.method === "getGenesisHash"
            ? { jsonrpc: "2.0", id: call.id, result: GENESIS_HASHES[mode.genesisOf] }
            : { jsonrpc: "2.0", id: call.id, error: { code: -32601, message: "Method not served by the cluster-identity stub" } },
        ),
      );
    });
  });
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  const { port } = server.address() as AddressInfo;
  return { url: `http://127.0.0.1:${port}/devnet-stub`, close: () => new Promise<void>((resolve) => server.close(() => resolve())) };
}
