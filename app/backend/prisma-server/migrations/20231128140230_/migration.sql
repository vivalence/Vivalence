/*
  Warnings:

  - You are about to drop the `VerbEnding` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `VerbStem` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "VerbEnding" DROP CONSTRAINT "VerbEnding_conjugationId_fkey";

-- DropForeignKey
ALTER TABLE "VerbStem" DROP CONSTRAINT "VerbStem_conjugationId_fkey";

-- DropTable
DROP TABLE "VerbEnding";

-- DropTable
DROP TABLE "VerbStem";
