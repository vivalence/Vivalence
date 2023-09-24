/*
  Warnings:

  - A unique constraint covering the columns `[itemId,itemType]` on the table `Review` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Word" ADD COLUMN     "data" JSONB,
ADD COLUMN     "usageInEnglish" TEXT,
ADD COLUMN     "usageInSpanish" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Review_itemId_itemType_key" ON "Review"("itemId", "itemType");
