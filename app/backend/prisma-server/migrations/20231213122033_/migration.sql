/*
  Warnings:

  - You are about to drop the column `data` on the `MemoryModel` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "MemoryModel" DROP COLUMN "data",
ADD COLUMN     "state" JSONB NOT NULL DEFAULT '{}';
