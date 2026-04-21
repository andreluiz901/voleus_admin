-- CreateEnum
ALTER TYPE "RestrictionType" ADD VALUE IF NOT EXISTS 'TOGETHER';

-- AlterTable
ALTER TABLE "Restriction" ADD COLUMN "gameId" TEXT;

-- Backfill gameId using attendance intersection fallback
UPDATE "Restriction" r
SET "gameId" = sub."gameId"
FROM (
  SELECT a1."playerId" AS "playerAId", a2."playerId" AS "playerBId", a1."gameId"
  FROM "Attendance" a1
  INNER JOIN "Attendance" a2
    ON a1."gameId" = a2."gameId"
) sub
WHERE r."gameId" IS NULL
  AND (
    (r."playerAId" = sub."playerAId" AND r."playerBId" = sub."playerBId")
    OR
    (r."playerAId" = sub."playerBId" AND r."playerBId" = sub."playerAId")
  );

-- If still null, link to any existing game to keep data valid
UPDATE "Restriction"
SET "gameId" = (
  SELECT g."id" FROM "Game" g ORDER BY g."createdAt" ASC LIMIT 1
)
WHERE "gameId" IS NULL;

-- If there is no game at all, remove orphaned restrictions
DELETE FROM "Restriction"
WHERE "gameId" IS NULL;

-- Make gameId required
ALTER TABLE "Restriction" ALTER COLUMN "gameId" SET NOT NULL;

-- Drop old unique
DROP INDEX IF EXISTS "Restriction_playerAId_playerBId_key";

-- Create new unique
CREATE UNIQUE INDEX "Restriction_gameId_playerAId_playerBId_key"
ON "Restriction"("gameId", "playerAId", "playerBId");

-- Add foreign key
ALTER TABLE "Restriction"
ADD CONSTRAINT "Restriction_gameId_fkey"
FOREIGN KEY ("gameId") REFERENCES "Game"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- CreateTable
CREATE TABLE "TeamAssignmentLock" (
  "id" TEXT NOT NULL,
  "gameId" TEXT NOT NULL,
  "playerId" TEXT NOT NULL,
  "targetTeamNumber" INTEGER NOT NULL,

  CONSTRAINT "TeamAssignmentLock_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TeamAssignmentLock_gameId_playerId_key"
ON "TeamAssignmentLock"("gameId", "playerId");

-- AddForeignKey
ALTER TABLE "TeamAssignmentLock"
ADD CONSTRAINT "TeamAssignmentLock_gameId_fkey"
FOREIGN KEY ("gameId") REFERENCES "Game"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeamAssignmentLock"
ADD CONSTRAINT "TeamAssignmentLock_playerId_fkey"
FOREIGN KEY ("playerId") REFERENCES "Player"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
