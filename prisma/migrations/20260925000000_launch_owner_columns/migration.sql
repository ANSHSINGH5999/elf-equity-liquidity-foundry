-- Columns present in schema.prisma since the initial commit but never migrated.
-- Idempotent so it also applies cleanly to a database created with `prisma db push`.
ALTER TABLE "launches" ADD COLUMN IF NOT EXISTS "last_auth_timestamp" TIMESTAMP(3),
ADD COLUMN IF NOT EXISTS "owner_wallet" TEXT,
ADD COLUMN IF NOT EXISTS "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- Backfill existing rows via the default, then drop it: Prisma's @updatedAt sets the value.
ALTER TABLE "launches" ALTER COLUMN "updated_at" DROP DEFAULT;

ALTER INDEX IF EXISTS "launches_curve_config_id_key" RENAME TO "uq_launches_curve_config_id";
