/*
  Warnings:

  - You are about to drop the column `curriculumId` on the `Game` table. All the data in the column will be lost.
  - You are about to drop the column `maskId` on the `GameUnitRelation` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Game" DROP CONSTRAINT "Game_curriculumId_fkey";

-- DropForeignKey
ALTER TABLE "GameUnitRelation" DROP CONSTRAINT "GameUnitRelation_maskId_fkey";

-- AlterTable
ALTER TABLE "Game" DROP COLUMN "curriculumId";

-- AlterTable
ALTER TABLE "GameUnitRelation" DROP COLUMN "maskId";

-- CreateTable
CREATE TABLE "CurriculumGameRelation" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "curriculumId" TEXT NOT NULL,
    "gameId" TEXT NOT NULL,
    "maskId" TEXT,

    CONSTRAINT "CurriculumGameRelation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CurriculumGameRelation_gameId_key" ON "CurriculumGameRelation"("gameId");

-- CreateIndex
CREATE UNIQUE INDEX "CurriculumGameRelation_gameId_curriculumId_key" ON "CurriculumGameRelation"("gameId", "curriculumId");

-- AddForeignKey
ALTER TABLE "CurriculumGameRelation" ADD CONSTRAINT "CurriculumGameRelation_curriculumId_fkey" FOREIGN KEY ("curriculumId") REFERENCES "Curriculum"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CurriculumGameRelation" ADD CONSTRAINT "CurriculumGameRelation_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "Game"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CurriculumGameRelation" ADD CONSTRAINT "CurriculumGameRelation_maskId_fkey" FOREIGN KEY ("maskId") REFERENCES "Mask"("id") ON DELETE SET NULL ON UPDATE CASCADE;
