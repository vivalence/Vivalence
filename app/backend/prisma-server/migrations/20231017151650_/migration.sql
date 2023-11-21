/*
  Warnings:

  - You are about to drop the column `corpusType` on the `Unit` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[corpusId,unitType]` on the table `Unit` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "UnitTypeEnum" AS ENUM ('WORD', 'VERB_CONJUGATION', 'VERB_STEM', 'VERB_ENDING');

-- DropIndex
DROP INDEX "Unit_corpusId_corpusType_key";

-- AlterTable
ALTER TABLE "GameUnitRelation" ADD COLUMN     "maskId" TEXT;

-- AlterTable
ALTER TABLE "Unit"
ADD COLUMN     "unitType" "UnitTypeEnum" NOT NULL DEFAULT 'WORD',
DROP COLUMN "corpusType",
ALTER COLUMN "status" SET DEFAULT 'UNKNOW';

-- DropEnum
DROP TYPE "CorpusTypeEnum";

-- CreateTable
CREATE TABLE "Mask" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "data" JSONB NOT NULL,

    CONSTRAINT "Mask_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Unit_corpusId_unitType_key" ON "Unit"("corpusId", "unitType");

-- AddForeignKey
ALTER TABLE "GameUnitRelation" ADD CONSTRAINT "GameUnitRelation_maskId_fkey" FOREIGN KEY ("maskId") REFERENCES "Mask"("id") ON DELETE SET NULL ON UPDATE CASCADE;
