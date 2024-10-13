/*
  Warnings:

  - You are about to drop the column `lastPlayAt` on the `Play` table. All the data in the column will be lost.
  - You are about to drop the column `nextPlayAt` on the `Play` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Play" DROP COLUMN "lastPlayAt",
DROP COLUMN "nextPlayAt",
ADD COLUMN     "lastAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "nextAt" TIMESTAMP(3),
ADD COLUMN     "nextIn" TIMESTAMP(3);
