/*
  Warnings:

  - The values [UNKNOW] on the enum `UnitStatusEnum` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "UnitStatusEnum_new" AS ENUM ('HIDDEN', 'UNKNOWN', 'PRIORITIZED', 'LEARNING', 'KNOWN', 'GRADUATED');
ALTER TABLE "Unit" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Unit" ALTER COLUMN "status" TYPE "UnitStatusEnum_new" USING ("status"::text::"UnitStatusEnum_new");
ALTER TYPE "UnitStatusEnum" RENAME TO "UnitStatusEnum_old";
ALTER TYPE "UnitStatusEnum_new" RENAME TO "UnitStatusEnum";
DROP TYPE "UnitStatusEnum_old";
ALTER TABLE "Unit" ALTER COLUMN "status" SET DEFAULT 'UNKNOWN';
COMMIT;

-- AlterTable
ALTER TABLE "Unit" ALTER COLUMN "status" SET DEFAULT 'UNKNOWN';
