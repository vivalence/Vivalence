/*
  Warnings:

  - Made the column `maskId` on table `CurriculumGameRelation` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "CurriculumGameRelation" DROP CONSTRAINT "CurriculumGameRelation_maskId_fkey";

-- AlterTable
ALTER TABLE "CurriculumGameRelation" ALTER COLUMN "maskId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "CurriculumGameRelation" ADD CONSTRAINT "CurriculumGameRelation_maskId_fkey" FOREIGN KEY ("maskId") REFERENCES "Mask"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
