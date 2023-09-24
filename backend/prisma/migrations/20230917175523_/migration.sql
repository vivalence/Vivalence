/*
  Warnings:

  - Made the column `verbId` on table `Conjugation` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "Conjugation" DROP CONSTRAINT "Conjugation_verbId_fkey";

-- AlterTable
ALTER TABLE "Conjugation" ALTER COLUMN "verbId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "Conjugation" ADD CONSTRAINT "Conjugation_verbId_fkey" FOREIGN KEY ("verbId") REFERENCES "Word"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
