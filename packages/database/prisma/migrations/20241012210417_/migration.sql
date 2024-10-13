/*
  Warnings:

  - You are about to drop the column `lastSeen` on the `Memory` table. All the data in the column will be lost.
  - You are about to drop the column `lastPlay` on the `Play` table. All the data in the column will be lost.
  - You are about to drop the column `nextPlay` on the `Play` table. All the data in the column will be lost.
  - Made the column `lastAt` on table `Memory` required. This step will fail if there are existing NULL values in that column.
  - Made the column `nextAt` on table `Memory` required. This step will fail if there are existing NULL values in that column.
  - Made the column `nextIn` on table `Memory` required. This step will fail if there are existing NULL values in that column.
  - Made the column `lastAt` on table `Play` required. This step will fail if there are existing NULL values in that column.
  - Made the column `nextAt` on table `Play` required. This step will fail if there are existing NULL values in that column.
  - Made the column `nextIn` on table `Play` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Memory" DROP COLUMN "lastSeen",
ALTER COLUMN "lastAt" SET NOT NULL,
ALTER COLUMN "nextAt" SET NOT NULL,
ALTER COLUMN "nextAt" SET DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "nextIn" SET NOT NULL,
ALTER COLUMN "nextIn" SET DEFAULT 0;

-- AlterTable
ALTER TABLE "Play" DROP COLUMN "lastPlay",
DROP COLUMN "nextPlay",
ALTER COLUMN "lastAt" SET NOT NULL,
ALTER COLUMN "nextAt" SET NOT NULL,
ALTER COLUMN "nextAt" SET DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "nextIn" SET NOT NULL,
ALTER COLUMN "nextIn" SET DEFAULT 0;
