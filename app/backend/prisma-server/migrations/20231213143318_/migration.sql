/*
  Warnings:

  - The values [HIDDEN,PRIORITIZED] on the enum `MemoryStatusEnum` will be removed. If these variants are still used in the database, this will fail.
  - The values [UNKNOWN,LEARNING,KNOWN,GRADUATED] on the enum `UnitStatusEnum` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `state` on the `GameUnitRelation` table. All the data in the column will be lost.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "MemoryStatusEnum_new" AS ENUM ('UNKNOWN', 'LEARNING', 'KNOWN', 'GRADUATED');
ALTER TABLE "MemoryModel" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "MemoryModel" ALTER COLUMN "status" TYPE "MemoryStatusEnum_new" USING ("status"::text::"MemoryStatusEnum_new");
ALTER TYPE "MemoryStatusEnum" RENAME TO "MemoryStatusEnum_old";
ALTER TYPE "MemoryStatusEnum_new" RENAME TO "MemoryStatusEnum";
DROP TYPE "MemoryStatusEnum_old";
ALTER TABLE "MemoryModel" ALTER COLUMN "status" SET DEFAULT 'UNKNOWN';
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "UnitStatusEnum_new" AS ENUM ('HIDDEN', 'PRIORITIZED');
ALTER TABLE "Unit" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Unit" ALTER COLUMN "status" TYPE "UnitStatusEnum_new" USING ("status"::text::"UnitStatusEnum_new");
ALTER TYPE "UnitStatusEnum" RENAME TO "UnitStatusEnum_old";
ALTER TYPE "UnitStatusEnum_new" RENAME TO "UnitStatusEnum";
DROP TYPE "UnitStatusEnum_old";
COMMIT;

-- AlterTable
ALTER TABLE "GameUnitRelation" DROP COLUMN "state";

-- AlterTable
ALTER TABLE "MemoryModel" ADD COLUMN     "lastSeen" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Unit" ALTER COLUMN "status" DROP DEFAULT;
