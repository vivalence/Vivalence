/*
  Warnings:

  - You are about to drop the `TagUserRelation` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `UnitUserRelation` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "MemoryTypeEnum" AS ENUM ('EBISU_v2', 'EBISU_v3');

-- CreateEnum
CREATE TYPE "MemoryStatusEnum" AS ENUM ('HIDDEN', 'PRIORITIZED', 'UNKNOWN', 'LEARNING', 'KNOWN', 'GRADUATED');

-- DropForeignKey
ALTER TABLE "TagUserRelation" DROP CONSTRAINT "TagUserRelation_tagId_fkey";

-- DropForeignKey
ALTER TABLE "TagUserRelation" DROP CONSTRAINT "TagUserRelation_userId_fkey";

-- DropForeignKey
ALTER TABLE "UnitUserRelation" DROP CONSTRAINT "UnitUserRelation_unitId_fkey";

-- DropForeignKey
ALTER TABLE "UnitUserRelation" DROP CONSTRAINT "UnitUserRelation_userId_fkey";

-- DropTable
DROP TABLE "TagUserRelation";

-- DropTable
DROP TABLE "UnitUserRelation";

-- CreateTable
CREATE TABLE "MemoryModel" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "history" JSONB NOT NULL DEFAULT '[]',
    "type" "MemoryTypeEnum" NOT NULL DEFAULT 'EBISU_v2',
    "status" "MemoryStatusEnum" NOT NULL DEFAULT 'UNKNOWN',
    "data" JSONB NOT NULL DEFAULT '{}',
    "unitId" TEXT NOT NULL,

    CONSTRAINT "MemoryModel_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "MemoryModel_unitId_key" ON "MemoryModel"("unitId");

-- AddForeignKey
ALTER TABLE "MemoryModel" ADD CONSTRAINT "MemoryModel_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES "Unit"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
