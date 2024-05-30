-- DropIndex
DROP INDEX "Unit_corpusId_corpusType_key";

-- DropIndex
DROP INDEX "corpusIdIndexOnUnit";

-- AlterTable
ALTER TABLE "Unit" ALTER COLUMN "corpusId" DROP NOT NULL;
