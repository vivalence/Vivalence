/*
  Warnings:

  - You are about to drop the column `value` on the `Conjugation` table. All the data in the column will be lost.
  - Added the required column `spanish` to the `Conjugation` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Conjugation" DROP COLUMN "value",
ADD COLUMN     "english" TEXT,
ADD COLUMN     "spanish" TEXT NOT NULL;
