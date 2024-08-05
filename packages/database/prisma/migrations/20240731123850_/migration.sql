/*
  Warnings:

  - Made the column `userId` on table `Memory` required. This step will fail if there are existing NULL values in that column.
  - Made the column `userId` on table `Play` required. This step will fail if there are existing NULL values in that column.
  - Made the column `memoryId` on table `Play` required. This step will fail if there are existing NULL values in that column.
  - Made the column `tacticId` on table `Play` required. This step will fail if there are existing NULL values in that column.
  - Made the column `runtimeId` on table `Tactic` required. This step will fail if there are existing NULL values in that column.
  - Made the column `slug` on table `Tactic` required. This step will fail if there are existing NULL values in that column.
  - Made the column `runtimeId` on table `Tag` required. This step will fail if there are existing NULL values in that column.
  - Made the column `runtimeId` on table `Unit` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "Play" DROP CONSTRAINT "Play_memoryId_fkey";

-- AlterTable
ALTER TABLE "Memory" ALTER COLUMN "userId" SET NOT NULL;

-- AlterTable
ALTER TABLE "Play" ALTER COLUMN "userId" SET NOT NULL,
ALTER COLUMN "memoryId" SET NOT NULL,
ALTER COLUMN "tacticId" SET NOT NULL;

-- AlterTable
ALTER TABLE "Tactic" ALTER COLUMN "runtimeId" SET NOT NULL,
ALTER COLUMN "slug" SET NOT NULL;

-- AlterTable
ALTER TABLE "Tag" ALTER COLUMN "runtimeId" SET NOT NULL,
ALTER COLUMN "runtimeId" SET DEFAULT 'c9e2eacf-eaef-47de-bf6b-3aac4d3e8590';

-- AlterTable
ALTER TABLE "Unit" ALTER COLUMN "runtimeId" SET NOT NULL,
ALTER COLUMN "runtimeId" SET DEFAULT 'c9e2eacf-eaef-47de-bf6b-3aac4d3e8590';

-- AddForeignKey
ALTER TABLE "Play" ADD CONSTRAINT "Play_memoryId_fkey" FOREIGN KEY ("memoryId") REFERENCES "Memory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
