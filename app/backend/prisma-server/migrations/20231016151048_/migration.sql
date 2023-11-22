/*
  Warnings:

  - You are about to drop the column `order` on the `Curriculum` table. All the data in the column will be lost.
  - You are about to drop the `_CurriculumToUnit` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_CurriculumToUnit" DROP CONSTRAINT "_CurriculumToUnit_A_fkey";

-- DropForeignKey
ALTER TABLE "_CurriculumToUnit" DROP CONSTRAINT "_CurriculumToUnit_B_fkey";

-- AlterTable
ALTER TABLE "Curriculum" DROP COLUMN "order";

-- DropTable
DROP TABLE "_CurriculumToUnit";

-- CreateTable
CREATE TABLE "CurriculumUnitRelation" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "index" INTEGER NOT NULL,
    "curriculumId" TEXT NOT NULL,
    "unitId" TEXT NOT NULL,

    CONSTRAINT "CurriculumUnitRelation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CurriculumUnitRelation_unitId_curriculumId_key" ON "CurriculumUnitRelation"("unitId", "curriculumId");

-- AddForeignKey
ALTER TABLE "CurriculumUnitRelation" ADD CONSTRAINT "CurriculumUnitRelation_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES "Unit"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CurriculumUnitRelation" ADD CONSTRAINT "CurriculumUnitRelation_curriculumId_fkey" FOREIGN KEY ("curriculumId") REFERENCES "Curriculum"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
