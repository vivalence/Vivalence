/*
  Warnings:

  - You are about to drop the `_GameToTactic` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_TacticToTag` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_TacticToUnit` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_GameToTactic" DROP CONSTRAINT "_GameToTactic_A_fkey";

-- DropForeignKey
ALTER TABLE "_GameToTactic" DROP CONSTRAINT "_GameToTactic_B_fkey";

-- DropForeignKey
ALTER TABLE "_TacticToTag" DROP CONSTRAINT "_TacticToTag_A_fkey";

-- DropForeignKey
ALTER TABLE "_TacticToTag" DROP CONSTRAINT "_TacticToTag_B_fkey";

-- DropForeignKey
ALTER TABLE "_TacticToUnit" DROP CONSTRAINT "_TacticToUnit_A_fkey";

-- DropForeignKey
ALTER TABLE "_TacticToUnit" DROP CONSTRAINT "_TacticToUnit_B_fkey";

-- AlterTable
ALTER TABLE "Tactic" ADD COLUMN     "gameId" TEXT;

-- DropTable
DROP TABLE "_GameToTactic";

-- DropTable
DROP TABLE "_TacticToTag";

-- DropTable
DROP TABLE "_TacticToUnit";

-- AddForeignKey
ALTER TABLE "Tactic" ADD CONSTRAINT "Tactic_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "Game"("id") ON DELETE SET NULL ON UPDATE CASCADE;
