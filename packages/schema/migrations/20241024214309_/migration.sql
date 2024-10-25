/*
  Warnings:

  - You are about to drop the column `corpusId` on the `Game` table. All the data in the column will be lost.
  - You are about to drop the column `corpusId` on the `Strategy` table. All the data in the column will be lost.
  - You are about to drop the column `corpusId` on the `Tactic` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[slug,runtimeId]` on the table `Game` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[slug,runtimeId]` on the table `Tactic` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "Game" DROP CONSTRAINT "Game_corpusId_fkey";

-- DropForeignKey
ALTER TABLE "Strategy" DROP CONSTRAINT "Strategy_corpusId_fkey";

-- DropForeignKey
ALTER TABLE "Tactic" DROP CONSTRAINT "Tactic_corpusId_fkey";

-- DropIndex
DROP INDEX "Game_slug_runtimeId_corpusId_key";

-- DropIndex
DROP INDEX "Tactic_slug_runtimeId_corpusId_key";

-- AlterTable
ALTER TABLE "Game" DROP COLUMN "corpusId";

-- AlterTable
ALTER TABLE "Strategy" DROP COLUMN "corpusId";

-- AlterTable
ALTER TABLE "Tactic" DROP COLUMN "corpusId";

-- CreateIndex
CREATE UNIQUE INDEX "Game_slug_runtimeId_key" ON "Game"("slug", "runtimeId");

-- CreateIndex
CREATE UNIQUE INDEX "Tactic_slug_runtimeId_key" ON "Tactic"("slug", "runtimeId");
