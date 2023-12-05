/*
  Warnings:

  - You are about to drop the column `gender` on the `Conjugation` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[verbId,tense,performer,mood]` on the table `Conjugation` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Conjugation_verbId_tense_performer_mood_gender_key";

-- AlterTable
ALTER TABLE "Conjugation" DROP COLUMN "gender";

-- DropEnum
DROP TYPE "GenderEnum";

-- CreateIndex
CREATE UNIQUE INDEX "Conjugation_verbId_tense_performer_mood_key" ON "Conjugation"("verbId", "tense", "performer", "mood");
