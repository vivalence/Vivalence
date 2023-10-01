-- CreateEnum
CREATE TYPE "StatusEnum" AS ENUM ('ACTIVE', 'HIDDEN');

-- AlterTable
ALTER TABLE "Word" ADD COLUMN     "status" "StatusEnum" NOT NULL DEFAULT 'ACTIVE';
