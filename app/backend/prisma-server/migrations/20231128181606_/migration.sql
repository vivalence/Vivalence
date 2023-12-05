/*
  Warnings:

  - A unique constraint covering the columns `[verbId,tense,performer,mood,gender]` on the table `Conjugation` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Conjugation_verbId_tense_performer_mood_gender_ending_key";

-- CreateIndex
CREATE UNIQUE INDEX "Conjugation_verbId_tense_performer_mood_gender_key" ON "Conjugation"("verbId", "tense", "performer", "mood", "gender");
