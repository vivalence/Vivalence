/*
  Warnings:

  - You are about to drop the column `data` on the `Strategy` table. All the data in the column will be lost.
  - You are about to drop the column `tactics` on the `Strategy` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "TagTypeEnum" AS ENUM ('STRUCTURAL', 'ONTOLOGICAL', 'LEARNABLE');

-- CreateEnum
CREATE TYPE "CorpusTypeEnum" AS ENUM ('WORD', 'CONJUGATION');

-- AlterTable
ALTER TABLE "Strategy" DROP COLUMN "data",
DROP COLUMN "tactics";

-- CreateTable
CREATE TABLE "Tag" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "name" TEXT NOT NULL,
    "type" "TagTypeEnum"[] DEFAULT ARRAY[]::"TagTypeEnum"[],
    "data" JSONB NOT NULL DEFAULT '{}',

    CONSTRAINT "Tag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Unit" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "corpusId" TEXT NOT NULL,
    "corpusType" "CorpusTypeEnum" NOT NULL DEFAULT 'WORD',
    "data" JSONB NOT NULL,

    CONSTRAINT "Unit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_StrategyToTag" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_TagToUnit" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Tag_name_key" ON "Tag"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Unit_corpusId_corpusType_key" ON "Unit"("corpusId", "corpusType");

-- CreateIndex
CREATE UNIQUE INDEX "_StrategyToTag_AB_unique" ON "_StrategyToTag"("A", "B");

-- CreateIndex
CREATE INDEX "_StrategyToTag_B_index" ON "_StrategyToTag"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_TagToUnit_AB_unique" ON "_TagToUnit"("A", "B");

-- CreateIndex
CREATE INDEX "_TagToUnit_B_index" ON "_TagToUnit"("B");

-- AddForeignKey
ALTER TABLE "_StrategyToTag" ADD CONSTRAINT "_StrategyToTag_A_fkey" FOREIGN KEY ("A") REFERENCES "Strategy"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_StrategyToTag" ADD CONSTRAINT "_StrategyToTag_B_fkey" FOREIGN KEY ("B") REFERENCES "Tag"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_TagToUnit" ADD CONSTRAINT "_TagToUnit_A_fkey" FOREIGN KEY ("A") REFERENCES "Tag"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_TagToUnit" ADD CONSTRAINT "_TagToUnit_B_fkey" FOREIGN KEY ("B") REFERENCES "Unit"("id") ON DELETE CASCADE ON UPDATE CASCADE;
