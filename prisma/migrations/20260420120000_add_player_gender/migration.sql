-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('MALE', 'FEMALE', 'OTHER');

-- AlterTable
ALTER TABLE "Player" ADD COLUMN "gender" "Gender";

-- Backfill existing rows
UPDATE "Player" SET "gender" = 'OTHER' WHERE "gender" IS NULL;

-- Enforce required gender
ALTER TABLE "Player" ALTER COLUMN "gender" SET NOT NULL;
