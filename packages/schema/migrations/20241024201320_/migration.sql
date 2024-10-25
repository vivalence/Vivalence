/*
  Warnings:

  - The `type` column on the `Memory` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - A unique constraint covering the columns `[slug,runtimeId,corpusId]` on the table `Game` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[slug,runtimeId]` on the table `Strategy` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[slug,runtimeId,corpusId]` on the table `Tactic` will be added. If there are existing duplicate values, this will fail.
  - Made the column `corpusId` on table `Tactic` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "Condition" DROP CONSTRAINT "Condition_corpusId_fkey";

-- DropForeignKey
ALTER TABLE "Dependency" DROP CONSTRAINT "Dependency_corpusId_fkey";

-- DropForeignKey
ALTER TABLE "Tag" DROP CONSTRAINT "Tag_corpusId_fkey";

-- DropForeignKey
ALTER TABLE "Unit" DROP CONSTRAINT "Unit_corpusId_fkey";

-- DropIndex
DROP INDEX "Game_slug_runtimeId_key";

-- DropIndex
DROP INDEX "Tactic_slug_runtimeId_key";

-- AlterTable
ALTER TABLE "Game" ADD COLUMN     "corpusId" TEXT;

-- AlterTable
ALTER TABLE "Memory" DROP COLUMN "type",
ADD COLUMN     "type" TEXT NOT NULL DEFAULT 'BAYESIAN';

-- AlterTable
ALTER TABLE "Tactic" ALTER COLUMN "corpusId" SET NOT NULL;

-- DropEnum
DROP TYPE "MemoryTypeEnum";

-- CreateIndex
CREATE UNIQUE INDEX "Game_slug_runtimeId_corpusId_key" ON "Game"("slug", "runtimeId", "corpusId");

-- CreateIndex
CREATE UNIQUE INDEX "Strategy_slug_runtimeId_key" ON "Strategy"("slug", "runtimeId");

-- CreateIndex
CREATE UNIQUE INDEX "Tactic_slug_runtimeId_corpusId_key" ON "Tactic"("slug", "runtimeId", "corpusId");

-- AddForeignKey
ALTER TABLE "Game" ADD CONSTRAINT "Game_corpusId_fkey" FOREIGN KEY ("corpusId") REFERENCES "Corpus"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Unit" ADD CONSTRAINT "Unit_corpusId_fkey" FOREIGN KEY ("corpusId") REFERENCES "Corpus"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tag" ADD CONSTRAINT "Tag_corpusId_fkey" FOREIGN KEY ("corpusId") REFERENCES "Corpus"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Dependency" ADD CONSTRAINT "Dependency_corpusId_fkey" FOREIGN KEY ("corpusId") REFERENCES "Corpus"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Condition" ADD CONSTRAINT "Condition_corpusId_fkey" FOREIGN KEY ("corpusId") REFERENCES "Corpus"("id") ON DELETE SET NULL ON UPDATE CASCADE;
