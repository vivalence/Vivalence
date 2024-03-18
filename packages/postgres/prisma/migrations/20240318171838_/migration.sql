-- DropForeignKey
ALTER TABLE "MemoryModel" DROP CONSTRAINT "MemoryModel_unitId_fkey";

-- DropForeignKey
ALTER TABLE "MemoryModel" DROP CONSTRAINT "MemoryModel_userId_fkey";

-- DropForeignKey
ALTER TABLE "Play" DROP CONSTRAINT "Play_gameId_fkey";

-- DropForeignKey
ALTER TABLE "Play" DROP CONSTRAINT "Play_unitId_fkey";

-- DropForeignKey
ALTER TABLE "Play" DROP CONSTRAINT "Play_userId_fkey";

-- AddForeignKey
ALTER TABLE "Play" ADD CONSTRAINT "Play_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES "Unit"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Play" ADD CONSTRAINT "Play_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "Game"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Play" ADD CONSTRAINT "Play_userId_fkey" FOREIGN KEY ("userId") REFERENCES "AppUser"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MemoryModel" ADD CONSTRAINT "MemoryModel_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES "Unit"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MemoryModel" ADD CONSTRAINT "MemoryModel_userId_fkey" FOREIGN KEY ("userId") REFERENCES "AppUser"("id") ON DELETE CASCADE ON UPDATE CASCADE;
