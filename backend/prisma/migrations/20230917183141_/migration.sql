/*
  Warnings:

  - A unique constraint covering the columns `[verbId,tense,performer,mood]` on the table `Conjugation` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `mood` to the `Conjugation` table without a default value. This is not possible if the table is not empty.
  - Added the required column `mood` to the `VerbEnding` table without a default value. This is not possible if the table is not empty.
  - Added the required column `mood` to the `VerbStem` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Conjugation" ADD COLUMN     "mood" "MoodEnum" NOT NULL;

-- AlterTable
ALTER TABLE "VerbEnding" ADD COLUMN     "mood" "MoodEnum" NOT NULL;

-- AlterTable
ALTER TABLE "VerbStem" ADD COLUMN     "mood" "MoodEnum" NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Conjugation_verbId_tense_performer_mood_key" ON "Conjugation"("verbId", "tense", "performer", "mood");
