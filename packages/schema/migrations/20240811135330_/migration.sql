/*
  Warnings:

  - Added the required column `tacticId` to the `Queue` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Queue" ADD COLUMN     "tacticId" TEXT NOT NULL,
ALTER COLUMN "strategyId" DROP DEFAULT;

-- AddForeignKey
ALTER TABLE "Queue" ADD CONSTRAINT "Queue_tacticId_fkey" FOREIGN KEY ("tacticId") REFERENCES "Tactic"("id") ON DELETE CASCADE ON UPDATE CASCADE;
