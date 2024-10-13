/*
  Warnings:

  - The values [EBISU_v3,CONTACTED] on the enum `MemoryTypeEnum` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
ALTER TYPE "MemoryStatusEnum" ADD VALUE 'UNTOUCHED';

-- AlterEnum
BEGIN;
CREATE TYPE "MemoryTypeEnum_new" AS ENUM ('EBISU_v2', 'BOOLEAN', 'BAYESIAN');
ALTER TABLE "Memory" ALTER COLUMN "type" DROP DEFAULT;
ALTER TABLE "Memory" ALTER COLUMN "type" TYPE "MemoryTypeEnum_new" USING ("type"::text::"MemoryTypeEnum_new");
ALTER TYPE "MemoryTypeEnum" RENAME TO "MemoryTypeEnum_old";
ALTER TYPE "MemoryTypeEnum_new" RENAME TO "MemoryTypeEnum";
DROP TYPE "MemoryTypeEnum_old";
ALTER TABLE "Memory" ALTER COLUMN "type" SET DEFAULT 'BAYESIAN';
COMMIT;

-- AlterTable
ALTER TABLE "Memory" ALTER COLUMN "type" SET DEFAULT 'BAYESIAN';
