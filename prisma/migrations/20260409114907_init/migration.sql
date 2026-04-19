-- CreateEnum
CREATE TYPE "RestrictionType" AS ENUM ('NOT_TOGETHER');

-- CreateEnum
CREATE TYPE "GameStatus" AS ENUM ('OPEN', 'CLOSED', 'FINISHED');

-- CreateTable
CREATE TABLE "Player" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "skillLevel" INTEGER NOT NULL DEFAULT 3,
    "isAdmin" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Game" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "date" TIMESTAMP(3) NOT NULL,
    "startTime" TEXT NOT NULL,
    "location" TEXT,
    "status" "GameStatus" NOT NULL DEFAULT 'OPEN',
    "notes" TEXT,
    "maxPlayers" INTEGER NOT NULL,
    "teamSize" INTEGER NOT NULL DEFAULT 4,
    "hourPrice" REAL NOT NULL,
    "hours" INTEGER NOT NULL,
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Game_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "Player" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Attendance" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "playerId" TEXT NOT NULL,
    "gameId" TEXT NOT NULL,
    "confirmed" BOOLEAN NOT NULL DEFAULT true,
    "paid" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Attendance_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "Player" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Attendance_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "Game" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Team" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "gameId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    CONSTRAINT "Team_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "Game" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "TeamPlayer" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "teamId" TEXT NOT NULL,
    "playerId" TEXT NOT NULL,
    CONSTRAINT "TeamPlayer_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "TeamPlayer_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "Player" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Restriction" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "playerAId" TEXT NOT NULL,
    "playerBId" TEXT NOT NULL,
    "type" "RestrictionType" NOT NULL,
    CONSTRAINT "Restriction_playerAId_fkey" FOREIGN KEY ("playerAId") REFERENCES "Player" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Restriction_playerBId_fkey" FOREIGN KEY ("playerBId") REFERENCES "Player" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "Game_date_idx" ON "Game"("date");

-- CreateIndex
CREATE UNIQUE INDEX "Attendance_playerId_gameId_key" ON "Attendance"("playerId", "gameId");

-- CreateIndex
CREATE UNIQUE INDEX "Team_gameId_name_key" ON "Team"("gameId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "TeamPlayer_teamId_playerId_key" ON "TeamPlayer"("teamId", "playerId");

-- CreateIndex
CREATE UNIQUE INDEX "Restriction_playerAId_playerBId_key" ON "Restriction"("playerAId", "playerBId");
