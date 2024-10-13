/*
  Warnings:

  - The values [EBISU_v2] on the enum `MemoryTypeEnum` will be removed. If these variants are still used in the database, this will fail.

*/
-- CreateEnum
CREATE TYPE "MemoryFlavorEnum" AS ENUM ('RELATIONAL', 'INDIVIDUAL');

-- AlterEnum
BEGIN;
CREATE TYPE "MemoryTypeEnum_new" AS ENUM ('BOOLEAN', 'BAYESIAN');
ALTER TABLE "Memory" ALTER COLUMN "type" DROP DEFAULT;
ALTER TABLE "Memory" ALTER COLUMN "type" TYPE "MemoryTypeEnum_new" USING ("type"::text::"MemoryTypeEnum_new");
ALTER TYPE "MemoryTypeEnum" RENAME TO "MemoryTypeEnum_old";
ALTER TYPE "MemoryTypeEnum_new" RENAME TO "MemoryTypeEnum";
DROP TYPE "MemoryTypeEnum_old";
ALTER TABLE "Memory" ALTER COLUMN "type" SET DEFAULT 'BAYESIAN';
COMMIT;

-- AlterTable
ALTER TABLE "Memory" ADD COLUMN     "falvor" "MemoryFlavorEnum" NOT NULL DEFAULT 'INDIVIDUAL';

-- AlterTable
ALTER TABLE "Play" ADD COLUMN     "lastPlayAt" TIMESTAMP(3),
ADD COLUMN     "nextPlayAt" TIMESTAMP(3),
ALTER COLUMN "nextPlay" DROP NOT NULL,
ALTER COLUMN "lastPlay" DROP NOT NULL;
