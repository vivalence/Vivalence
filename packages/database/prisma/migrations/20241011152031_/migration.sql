/*
  Warnings:

  - The `nextIn` column on the `Memory` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `nextIn` column on the `Play` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "Memory" DROP COLUMN "nextIn",
ADD COLUMN     "nextIn" INTEGER;

-- AlterTable
ALTER TABLE "Play" DROP COLUMN "nextIn",
ADD COLUMN     "nextIn" INTEGER;
