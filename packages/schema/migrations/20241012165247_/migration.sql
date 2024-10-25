/*
  Warnings:

  - The values [DEPENDENCY] on the enum `TagTraitsEnum` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "TagTraitsEnum_new" AS ENUM ('ONTOLOGICAL', 'STRUCTURAL', 'LEARNABLE', 'COMPLETABLE');
ALTER TABLE "Tag" ALTER COLUMN "traits" DROP DEFAULT;
ALTER TABLE "Tag" ALTER COLUMN "traits" TYPE "TagTraitsEnum_new"[] USING ("traits"::text::"TagTraitsEnum_new"[]);
ALTER TYPE "TagTraitsEnum" RENAME TO "TagTraitsEnum_old";
ALTER TYPE "TagTraitsEnum_new" RENAME TO "TagTraitsEnum";
DROP TYPE "TagTraitsEnum_old";
ALTER TABLE "Tag" ALTER COLUMN "traits" SET DEFAULT ARRAY[]::"TagTraitsEnum"[];
COMMIT;

-- AlterTable
ALTER TABLE "Memory" ADD COLUMN     "signal" JSONB NOT NULL DEFAULT '{}';

-- AlterTable
ALTER TABLE "Play" ADD COLUMN     "signal" JSONB NOT NULL DEFAULT '{}',
ALTER COLUMN "tacticId" DROP NOT NULL;

-- CreateTable
CREATE TABLE "Dependency" (
    "id" TEXT NOT NULL DEFAULT uuid_generate_v4(),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "runtimeId" TEXT NOT NULL,
    "corpusId" TEXT,
    "satisfied" BOOLEAN NOT NULL DEFAULT false,
    "itinerary" JSONB NOT NULL DEFAULT '{}',

    CONSTRAINT "Dependency_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Condition" (
    "id" TEXT NOT NULL DEFAULT uuid_generate_v4(),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "runtimeId" TEXT NOT NULL,
    "corpusId" TEXT,
    "conditionForId" TEXT,
    "preconditionForId" TEXT,
    "scope" JSONB NOT NULL DEFAULT '{}',
    "assertion" JSONB NOT NULL DEFAULT '{}',
    "met" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Condition_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Dependency_slug_runtimeId_key" ON "Dependency"("slug", "runtimeId");

-- AddForeignKey
ALTER TABLE "Dependency" ADD CONSTRAINT "Dependency_runtimeId_fkey" FOREIGN KEY ("runtimeId") REFERENCES "Runtime"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Dependency" ADD CONSTRAINT "Dependency_corpusId_fkey" FOREIGN KEY ("corpusId") REFERENCES "Corpus"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Condition" ADD CONSTRAINT "Condition_runtimeId_fkey" FOREIGN KEY ("runtimeId") REFERENCES "Runtime"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Condition" ADD CONSTRAINT "Condition_corpusId_fkey" FOREIGN KEY ("corpusId") REFERENCES "Corpus"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Condition" ADD CONSTRAINT "Condition_conditionForId_fkey" FOREIGN KEY ("conditionForId") REFERENCES "Dependency"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Condition" ADD CONSTRAINT "Condition_preconditionForId_fkey" FOREIGN KEY ("preconditionForId") REFERENCES "Dependency"("id") ON DELETE CASCADE ON UPDATE CASCADE;
