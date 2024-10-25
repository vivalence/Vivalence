/*
  Warnings:

  - You are about to drop the column `objectStatus` on the `Game` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `Game` table. All the data in the column will be lost.
  - You are about to drop the column `strategyId` on the `Queue` table. All the data in the column will be lost.
  - You are about to drop the column `data` on the `Strategy` table. All the data in the column will be lost.
  - You are about to drop the column `objectStatus` on the `Strategy` table. All the data in the column will be lost.
  - You are about to drop the column `corpusType` on the `Unit` table. All the data in the column will be lost.
  - You are about to drop the column `objectStatus` on the `Unit` table. All the data in the column will be lost.
  - You are about to drop the `_StrategyToGame` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_StrategyToTag` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_StrategyToUnit` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[userId,unitId,tagId,tacticId,gameId]` on the table `Play` will be added. If there are existing duplicate values, this will fail.
  - Made the column `lastSeen` on table `Memory` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "Play" DROP CONSTRAINT "Play_memoryId_fkey";

-- DropForeignKey
ALTER TABLE "_StrategyToGame" DROP CONSTRAINT "_StrategyToGame_A_fkey";

-- DropForeignKey
ALTER TABLE "_StrategyToGame" DROP CONSTRAINT "_StrategyToGame_B_fkey";

-- DropForeignKey
ALTER TABLE "_StrategyToTag" DROP CONSTRAINT "_StrategyToTag_A_fkey";

-- DropForeignKey
ALTER TABLE "_StrategyToTag" DROP CONSTRAINT "_StrategyToTag_B_fkey";

-- DropForeignKey
ALTER TABLE "_StrategyToUnit" DROP CONSTRAINT "_StrategyToUnit_A_fkey";

-- DropForeignKey
ALTER TABLE "_StrategyToUnit" DROP CONSTRAINT "_StrategyToUnit_B_fkey";

-- DropIndex
DROP INDEX "Play_unitId_tagId_gameId_userId_memoryId_key";

-- AlterTable
ALTER TABLE "Game" DROP COLUMN "objectStatus",
DROP COLUMN "type",
ADD COLUMN     "corpusId" TEXT,
ADD COLUMN     "installed" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "version" TEXT,
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "data" DROP NOT NULL,
ALTER COLUMN "data" DROP DEFAULT,
ALTER COLUMN "name" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Memory" ALTER COLUMN "lastSeen" SET NOT NULL,
ALTER COLUMN "lastSeen" SET DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "userId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Play" ADD COLUMN     "tacticId" TEXT,
ALTER COLUMN "userId" DROP NOT NULL,
ALTER COLUMN "memoryId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Queue" DROP COLUMN "strategyId",
ADD COLUMN     "appUserId" TEXT,
ADD COLUMN     "tacticId" TEXT,
ALTER COLUMN "userId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Strategy" DROP COLUMN "data",
DROP COLUMN "objectStatus",
ADD COLUMN     "corpusId" TEXT,
ADD COLUMN     "installed" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "session" JSONB NOT NULL DEFAULT '{}',
ADD COLUMN     "version" TEXT,
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "name" DROP NOT NULL,
ALTER COLUMN "provision" DROP NOT NULL,
ALTER COLUMN "provision" DROP DEFAULT,
ALTER COLUMN "relations" DROP NOT NULL,
ALTER COLUMN "relations" DROP DEFAULT;

-- AlterTable
ALTER TABLE "Tag" ADD COLUMN     "corpusId" TEXT;

-- AlterTable
ALTER TABLE "Unit" DROP COLUMN "corpusType",
DROP COLUMN "objectStatus";

-- DropTable
DROP TABLE "_StrategyToGame";

-- DropTable
DROP TABLE "_StrategyToTag";

-- DropTable
DROP TABLE "_StrategyToUnit";

-- DropEnum
DROP TYPE "CorpusTypeEnum";

-- DropEnum
DROP TYPE "GameTypeEnum";

-- DropEnum
DROP TYPE "ObjectStatusEnum";

-- DropEnum
DROP TYPE "UnitStatusEnum";

-- CreateTable
CREATE TABLE "Ontology" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "name" TEXT,
    "version" TEXT,
    "installed" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Ontology_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Corpus" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "name" TEXT,
    "version" TEXT,
    "installed" BOOLEAN NOT NULL DEFAULT false,
    "ontologyId" TEXT NOT NULL,

    CONSTRAINT "Corpus_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Tactic" (
    "id" TEXT NOT NULL DEFAULT uuid_generate_v4(),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "name" TEXT NOT NULL,
    "corpusId" TEXT,
    "relations" JSONB NOT NULL DEFAULT '[]',
    "provision" JSONB NOT NULL DEFAULT '{}',
    "instructions" JSONB NOT NULL DEFAULT '{}',

    CONSTRAINT "Tactic_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_AppUserToCorpus" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_GameToTactic" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_TacticToTag" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_TacticToUnit" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Corpus_ontologyId_key" ON "Corpus"("ontologyId");

-- CreateIndex
CREATE UNIQUE INDEX "_AppUserToCorpus_AB_unique" ON "_AppUserToCorpus"("A", "B");

-- CreateIndex
CREATE INDEX "_AppUserToCorpus_B_index" ON "_AppUserToCorpus"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_GameToTactic_AB_unique" ON "_GameToTactic"("A", "B");

-- CreateIndex
CREATE INDEX "_GameToTactic_B_index" ON "_GameToTactic"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_TacticToTag_AB_unique" ON "_TacticToTag"("A", "B");

-- CreateIndex
CREATE INDEX "_TacticToTag_B_index" ON "_TacticToTag"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_TacticToUnit_AB_unique" ON "_TacticToUnit"("A", "B");

-- CreateIndex
CREATE INDEX "_TacticToUnit_B_index" ON "_TacticToUnit"("B");

-- CreateIndex
CREATE INDEX "tacticIdIndexOnPlay" ON "Play"("tacticId");

-- CreateIndex
CREATE UNIQUE INDEX "Play_userId_unitId_tagId_tacticId_gameId_key" ON "Play"("userId", "unitId", "tagId", "tacticId", "gameId");

-- AddForeignKey
ALTER TABLE "Corpus" ADD CONSTRAINT "Corpus_ontologyId_fkey" FOREIGN KEY ("ontologyId") REFERENCES "Ontology"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Strategy" ADD CONSTRAINT "Strategy_corpusId_fkey" FOREIGN KEY ("corpusId") REFERENCES "Corpus"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Game" ADD CONSTRAINT "Game_corpusId_fkey" FOREIGN KEY ("corpusId") REFERENCES "Corpus"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tactic" ADD CONSTRAINT "Tactic_corpusId_fkey" FOREIGN KEY ("corpusId") REFERENCES "Corpus"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tag" ADD CONSTRAINT "Tag_corpusId_fkey" FOREIGN KEY ("corpusId") REFERENCES "Corpus"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Unit" ADD CONSTRAINT "Unit_corpusId_fkey" FOREIGN KEY ("corpusId") REFERENCES "Corpus"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Play" ADD CONSTRAINT "Play_tacticId_fkey" FOREIGN KEY ("tacticId") REFERENCES "Tactic"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Play" ADD CONSTRAINT "Play_memoryId_fkey" FOREIGN KEY ("memoryId") REFERENCES "Memory"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Queue" ADD CONSTRAINT "Queue_appUserId_fkey" FOREIGN KEY ("appUserId") REFERENCES "AppUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Queue" ADD CONSTRAINT "Queue_tacticId_fkey" FOREIGN KEY ("tacticId") REFERENCES "Tactic"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AppUserToCorpus" ADD CONSTRAINT "_AppUserToCorpus_A_fkey" FOREIGN KEY ("A") REFERENCES "AppUser"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AppUserToCorpus" ADD CONSTRAINT "_AppUserToCorpus_B_fkey" FOREIGN KEY ("B") REFERENCES "Corpus"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_GameToTactic" ADD CONSTRAINT "_GameToTactic_A_fkey" FOREIGN KEY ("A") REFERENCES "Game"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_GameToTactic" ADD CONSTRAINT "_GameToTactic_B_fkey" FOREIGN KEY ("B") REFERENCES "Tactic"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_TacticToTag" ADD CONSTRAINT "_TacticToTag_A_fkey" FOREIGN KEY ("A") REFERENCES "Tactic"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_TacticToTag" ADD CONSTRAINT "_TacticToTag_B_fkey" FOREIGN KEY ("B") REFERENCES "Tag"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_TacticToUnit" ADD CONSTRAINT "_TacticToUnit_A_fkey" FOREIGN KEY ("A") REFERENCES "Tactic"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_TacticToUnit" ADD CONSTRAINT "_TacticToUnit_B_fkey" FOREIGN KEY ("B") REFERENCES "Unit"("id") ON DELETE CASCADE ON UPDATE CASCADE;
