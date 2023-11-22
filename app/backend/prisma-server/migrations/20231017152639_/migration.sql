/*
  Warnings:

  - Made the column `maskId` on table `GameUnitRelation` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "GameUnitRelation" DROP CONSTRAINT "GameUnitRelation_maskId_fkey";

-- AlterTable
ALTER TABLE "GameUnitRelation" ALTER COLUMN "maskId" SET NOT NULL,
ALTER COLUMN "maskId" DROP DEFAULT;

-- AddForeignKey
ALTER TABLE "GameUnitRelation" ADD CONSTRAINT "GameUnitRelation_maskId_fkey" FOREIGN KEY ("maskId") REFERENCES "Mask"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
