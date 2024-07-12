/*
  Warnings:

  - Added the required column `name` to the `Game` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Game" ADD COLUMN     "data" JSONB NOT NULL DEFAULT '{}',
ADD COLUMN     "name" TEXT NOT NULL;
