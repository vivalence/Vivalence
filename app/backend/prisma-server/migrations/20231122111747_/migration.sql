/*
  Warnings:

  - Made the column `history` on table `GameUnitRelation` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "GameUnitRelation" ALTER COLUMN "history" SET NOT NULL,
ALTER COLUMN "history" SET DEFAULT '[]';
