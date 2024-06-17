/*
  Warnings:

  - You are about to drop the column `strategyId` on the `Game` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Game" DROP CONSTRAINT "Game_strategyId_fkey";

-- DropIndex
DROP INDEX "Game_type_strategyId_key";

-- AlterTable
ALTER TABLE "Game" DROP COLUMN "strategyId";

-- CreateTable
CREATE TABLE "_StrategyToGame" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_StrategyToGame_AB_unique" ON "_StrategyToGame"("A", "B");

-- CreateIndex
CREATE INDEX "_StrategyToGame_B_index" ON "_StrategyToGame"("B");

-- AddForeignKey
ALTER TABLE "_StrategyToGame" ADD CONSTRAINT "_StrategyToGame_A_fkey" FOREIGN KEY ("A") REFERENCES "Game"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_StrategyToGame" ADD CONSTRAINT "_StrategyToGame_B_fkey" FOREIGN KEY ("B") REFERENCES "Strategy"("id") ON DELETE CASCADE ON UPDATE CASCADE;
