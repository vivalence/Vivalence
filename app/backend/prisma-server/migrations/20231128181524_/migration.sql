/*
  Warnings:

  - A unique constraint covering the columns `[verbId,tense,performer,mood,gender,ending]` on the table `Conjugation` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "GenderEnum" AS ENUM ('MASCULINO', 'FEMENINO', 'NEUTRO', 'NOT_GENDERED');

-- DropIndex
DROP INDEX "Conjugation_verbId_tense_performer_mood_key";

-- AlterTable
ALTER TABLE "Conjugation" ADD COLUMN     "gender" "GenderEnum" NOT NULL DEFAULT 'NOT_GENDERED';

-- CreateIndex
CREATE UNIQUE INDEX "Conjugation_verbId_tense_performer_mood_gender_ending_key" ON "Conjugation"("verbId", "tense", "performer", "mood", "gender", "ending");
