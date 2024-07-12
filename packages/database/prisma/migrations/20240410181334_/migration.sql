/*
  Warnings:

  - A unique constraint covering the columns `[unitId,userId,tagId]` on the table `Memory` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Memory_unitId_userId_key";

-- CreateIndex
CREATE INDEX "tagIdIndexOnMemory" ON "Memory"("tagId");

-- CreateIndex
CREATE UNIQUE INDEX "Memory_unitId_userId_tagId_key" ON "Memory"("unitId", "userId", "tagId");
