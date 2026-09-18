import { NextResponse } from "next/server";
import { prisma } from "@elf/db";
import { getServerConnection } from "@/lib/server/rpc";

/** Liveness/readiness check — verifies the two hard dependencies (DB, RPC) rather than just returning 200 unconditionally. */
export async function GET() {
  const checks: Record<string, "ok" | "unavailable"> = { database: "ok", rpc: "ok" };

  await prisma.$queryRaw`SELECT 1`.catch(() => {
    checks.database = "unavailable";
  });

  await getServerConnection()
    .getLatestBlockhash()
    .catch(() => {
      checks.rpc = "unavailable";
    });

  const healthy = Object.values(checks).every((v) => v === "ok");
  return NextResponse.json({ status: healthy ? "ok" : "degraded", checks }, { status: healthy ? 200 : 503 });
}
