/*
  Warnings:

  - A unique constraint covering the columns `[unitId,tagId,gameId,userId,memoryId]` on the table `Play` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Play_unitId_gameId_userId_memoryId_key";

-- AlterTable
ALTER TABLE "Play" ADD COLUMN     "tagId" TEXT;

-- CreateIndex
CREATE INDEX "tagIdIndexOnPlay" ON "Play"("tagId");

-- CreateIndex
CREATE UNIQUE INDEX "Play_unitId_tagId_gameId_userId_memoryId_key" ON "Play"("unitId", "tagId", "gameId", "userId", "memoryId");

-- AddForeignKey
ALTER TABLE "Play" ADD CONSTRAINT "Play_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "Tag"("id") ON DELETE CASCADE ON UPDATE CASCADE;
