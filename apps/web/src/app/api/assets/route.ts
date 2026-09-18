import { NextResponse } from "next/server";
import { prisma } from "@elf/db";
import { createAssetSchema } from "@elf/shared";
import { apiError, isPrismaConnectionError } from "@/lib/server/api-error";
import { checkRateLimit, clientKeyFromRequest } from "@/lib/server/rate-limit";

export async function GET(request: Request) {
  if (!checkRateLimit(`assets:get:${clientKeyFromRequest(request)}`, 60, 60_000)) {
    return apiError("validation_error", "Too many requests. Slow down.", 429);
  }

  try {
    const assets = await prisma.asset.findMany({ orderBy: { createdAt: "desc" }, take: 100 });
    return NextResponse.json({ assets });
  } catch (error) {
    if (isPrismaConnectionError(error)) {
      return apiError("database_unavailable", "The ELF database is temporarily unavailable.", 503);
    }
    return apiError("internal_error", "Failed to load assets.", 500);
  }
}

export async function POST(request: Request) {
  if (!checkRateLimit(`assets:post:${clientKeyFromRequest(request)}`, 20, 60_000)) {
    return apiError("validation_error", "Too many requests. Slow down.", 429);
  }

  const body = await request.json().catch(() => null);
  const parsed = createAssetSchema.safeParse(body);
  if (!parsed.success) {
    return apiError("validation_error", "Invalid asset payload.", 400, parsed.error.flatten());
  }

  try {
    const asset = await prisma.asset.create({
      data: parsed.data,
    });
    return NextResponse.json({ asset }, { status: 201 });
  } catch (error) {
    if (isPrismaConnectionError(error)) {
      return apiError("database_unavailable", "The ELF database is temporarily unavailable.", 503);
    }
    return apiError("internal_error", "Failed to create asset.", 500);
  }
}
