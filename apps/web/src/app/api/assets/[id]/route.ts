import { NextResponse } from "next/server";
import { prisma } from "@elf/db";
import { apiError, isPrismaConnectionError } from "@/lib/server/api-error";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  try {
    const asset = await prisma.asset.findUnique({ where: { id } });
    if (!asset) return apiError("not_found", `Asset ${id} was not found.`, 404);
    return NextResponse.json({ asset });
  } catch (error) {
    if (isPrismaConnectionError(error)) {
      return apiError("database_unavailable", "The ELF database is temporarily unavailable.", 503);
    }
    return apiError("internal_error", "Failed to load asset.", 500);
  }
}
