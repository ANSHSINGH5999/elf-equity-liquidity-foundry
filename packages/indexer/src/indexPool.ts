import { PublicKey, type Connection } from "@solana/web3.js";
import { prisma, Prisma } from "@elf/db";
import { decodeTransactionEvents, getQuoteUsdPrice, sqrtPriceToPrice } from "@elf/meteora-adapter";
import type { QuoteToken } from "@elf/shared";
import { readBN, readField, readNumber } from "./eventFields";

const BASE_DECIMALS = 9;
const QUOTE_DECIMALS: Record<QuoteToken, number> = { SOL: 9, USDC: 6 };

function toHuman(raw: import("bn.js"), decimals: number): number {
  return Number(raw.toString()) / 10 ** decimals;
}

export interface IndexPoolResult {
  signaturesProcessed: number;
  tradesWritten: number;
  graduationEventsWritten: number;
}

/**
 * Indexes new activity for one pool since its last-seen signature,
 * decoding real DBC program events (see events.ts) into `Trade`,
 * `PriceHistory`, `LiquidityHistory`, and `GraduationEvent` rows.
 *
 * USD conversion uses the *current* quote-token/USD rate for every
 * historical trade being backfilled in this run, not the rate at the
 * time of each trade — there is no historical price oracle in this V1
 * (see docs/indexer.md). This is exact for USDC-quoted markets (1 USDC
 * ≈ $1 always) and an approximation for SOL-quoted markets.
 */
export async function indexPool(connection: Connection, poolAddress: string): Promise<IndexPoolResult> {
  const launch = await prisma.launch.findFirst({
    where: { poolAddress },
    include: { marketProfile: true },
  });
  if (!launch) {
    throw new Error(`No Launch found for pool ${poolAddress} — cannot attribute indexed rows to a market.`);
  }

  const quoteToken = launch.marketProfile.quoteToken;
  const quoteDecimals = QUOTE_DECIMALS[quoteToken];
  const quoteUsdPrice = await getQuoteUsdPrice(quoteToken);

  const poolPk = new PublicKey(poolAddress);
  const cursor = await prisma.indexerCursor.findUnique({ where: { poolAddress } });

  const signatures = await connection.getSignaturesForAddress(
    poolPk,
    { until: cursor?.lastSignature ?? undefined, limit: 1000 },
    "confirmed",
  );
  // getSignaturesForAddress returns newest-first; process oldest-first so PriceHistory/LiquidityHistory land in order.
  const ordered = [...signatures].reverse();

  let tradesWritten = 0;
  let graduationEventsWritten = 0;

  for (const sigInfo of ordered) {
    if (sigInfo.err) continue; // failed transactions never touched real state — nothing to index

    const decoded = await decodeTransactionEvents(connection, sigInfo.signature);
    if (!decoded) continue;

    const timestamp = decoded.blockTime ? new Date(decoded.blockTime * 1000) : new Date();

    for (const event of decoded.events) {
      // A swap emits both EvtSwap (legacy: no included-fee input, no quote reserve) and EvtSwap2 (complete). Index the
      // complete one only, so a swap is never recorded twice or from partial data.
      if (event.name === "EvtSwap2" || event.name === "EvtSwap2WithTransferHook") {
        const tradeDirection = readNumber(event.data, "trade_direction", "tradeDirection");
        const swapResult = readField(event.data, "swap_result", "swapResult") as Record<string, unknown>;
        const includedFeeInputAmount = readBN(swapResult, "included_fee_input_amount", "includedFeeInputAmount");
        const outputAmount = readBN(swapResult, "output_amount", "outputAmount");
        const quoteReserveAmount = readBN(event.data, "quote_reserve_amount", "quoteReserveAmount");

        const isSell = tradeDirection === 0; // TradeDirection.BaseToQuote
        const tokenAmount = isSell ? toHuman(includedFeeInputAmount, BASE_DECIMALS) : toHuman(outputAmount, BASE_DECIMALS);
        const quoteAmount = isSell ? toHuman(outputAmount, quoteDecimals) : toHuman(includedFeeInputAmount, quoteDecimals);
        const priceUsd = tokenAmount > 0 ? (quoteAmount / tokenAmount) * quoteUsdPrice : 0;
        const liquidityUsd = toHuman(quoteReserveAmount, quoteDecimals) * quoteUsdPrice;
        // The price series is the pool's own price after the trade. `priceUsd` above is what this trade paid (fees and
        // impact included) and stays on the Trade row; mixing the two made a rising pool read as a 4% drop.
        const nextSqrtPrice = readBN(swapResult, "next_sqrt_price", "nextSqrtPrice");
        const spotPriceUsd = sqrtPriceToPrice(nextSqrtPrice, BASE_DECIMALS, quoteDecimals) * quoteUsdPrice;

        try {
          await prisma.trade.create({
            data: {
              marketId: launch.id,
              signature: sigInfo.signature,
              trader: decoded.feePayer ?? "unknown",
              side: isSell ? "sell" : "buy",
              tokenAmount,
              quoteAmount,
              priceUsd,
              timestamp,
            },
          });
          tradesWritten += 1;

          await prisma.priceHistory.create({
            data: { marketId: launch.id, priceUsd: spotPriceUsd, source: "indexed_trade", timestamp },
          });
          await prisma.liquidityHistory.create({
            data: { marketId: launch.id, liquidityUsd, timestamp },
          });
        } catch (error) {
          // Unique constraint on Trade.signature — a re-processed signature (cursor edge case) is a no-op, not an error.
          if (!(error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002")) throw error;
        }
      }

      if (event.name === "EvtCurveComplete" || event.name === "EvtCurveCompleteWithTransferHook") {
        const baseReserve = readBN(event.data, "base_reserve", "baseReserve");
        const quoteReserve = readBN(event.data, "quote_reserve", "quoteReserve");

        try {
          await prisma.graduationEvent.create({
            data: {
              marketId: launch.id,
              signature: sigInfo.signature,
              finalState: {
                baseReserve: toHuman(baseReserve, BASE_DECIMALS),
                quoteReserve: toHuman(quoteReserve, quoteDecimals),
              } satisfies Prisma.InputJsonValue,
              timestamp,
            },
          });
          graduationEventsWritten += 1;
          await prisma.launch.update({ where: { id: launch.id }, data: { status: "graduated" } });
        } catch (error) {
          if (!(error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002")) throw error;
        }
      }
    }
  }

  await prisma.indexerCursor.upsert({
    where: { poolAddress },
    update: { lastSignature: ordered.at(-1)?.signature ?? cursor?.lastSignature },
    create: { poolAddress, lastSignature: ordered.at(-1)?.signature ?? null },
  });

  return { signaturesProcessed: ordered.length, tradesWritten, graduationEventsWritten };
}
