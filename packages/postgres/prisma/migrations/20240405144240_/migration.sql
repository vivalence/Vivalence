-- CreateEnum
CREATE TYPE "ObjectStatusEnum" AS ENUM ('ACTIVE', 'INACTIVE', 'DELETED');

-- AlterTable
ALTER TABLE "Unit" ADD COLUMN     "objectStatus" "ObjectStatusEnum" NOT NULL DEFAULT 'ACTIVE';
