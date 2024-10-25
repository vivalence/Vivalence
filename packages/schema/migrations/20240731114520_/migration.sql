/*
  Warnings:

  - You are about to drop the column `data` on the `Game` table. All the data in the column will be lost.
  - You are about to drop the column `installed` on the `Strategy` table. All the data in the column will be lost.
  - You are about to drop the column `provision` on the `Strategy` table. All the data in the column will be lost.
  - You are about to drop the column `relations` on the `Strategy` table. All the data in the column will be lost.
  - You are about to drop the column `version` on the `Strategy` table. All the data in the column will be lost.
  - You are about to drop the column `strategyId` on the `Tag` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `Tag` table. All the data in the column will be lost.
  - You are about to drop the column `strategyId` on the `Unit` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Tag" DROP CONSTRAINT "Tag_strategyId_fkey";

-- DropForeignKey
ALTER TABLE "Unit" DROP CONSTRAINT "Unit_strategyId_fkey";

-- AlterTable
ALTER TABLE "Game" DROP COLUMN "data";

-- AlterTable
ALTER TABLE "Strategy" DROP COLUMN "installed",
DROP COLUMN "provision",
DROP COLUMN "relations",
DROP COLUMN "version";

-- AlterTable
ALTER TABLE "Tactic" ADD COLUMN     "slug" TEXT;

-- AlterTable
ALTER TABLE "Tag" DROP COLUMN "strategyId",
DROP COLUMN "type";

-- AlterTable
ALTER TABLE "Unit" DROP COLUMN "strategyId";

-- DropEnum
DROP TYPE "TagTypeEnum";
