/*
  Warnings:

  - The values [VERB_CONJUGATION,VERB_STEM,VERB_ENDING] on the enum `UnitTypeEnum` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "UnitTypeEnum_new" AS ENUM ('WORD', 'CONJUGATION');
ALTER TABLE "Unit" ALTER COLUMN "unitType" DROP DEFAULT;
ALTER TABLE "Unit" ALTER COLUMN "unitType" TYPE "UnitTypeEnum_new" USING ("unitType"::text::"UnitTypeEnum_new");
ALTER TYPE "UnitTypeEnum" RENAME TO "UnitTypeEnum_old";
ALTER TYPE "UnitTypeEnum_new" RENAME TO "UnitTypeEnum";
DROP TYPE "UnitTypeEnum_old";
ALTER TABLE "Unit" ALTER COLUMN "unitType" SET DEFAULT 'WORD';
COMMIT;
