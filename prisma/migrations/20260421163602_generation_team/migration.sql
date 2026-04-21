-- DropForeignKey
ALTER TABLE "TeamAssignmentLock" DROP CONSTRAINT "TeamAssignmentLock_gameId_fkey";

-- AddForeignKey
ALTER TABLE "TeamAssignmentLock" ADD CONSTRAINT "TeamAssignmentLock_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "Game"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
