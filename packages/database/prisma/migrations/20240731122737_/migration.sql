/*
  Warnings:

  - You are about to drop the column `corpusId` on the `Runtime` table. All the data in the column will be lost.
  - You are about to drop the column `domainId` on the `Runtime` table. All the data in the column will be lost.
  - You are about to drop the column `ontologyId` on the `Runtime` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[runtimeId]` on the table `Corpus` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[slug,version,runtimeId]` on the table `Corpus` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[runtimeId]` on the table `Domain` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[slug,version,runtimeId]` on the table `Domain` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[slug,version,runtimeId]` on the table `Game` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[runtimeId]` on the table `Ontology` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[slug,version,runtimeId]` on the table `Ontology` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[slug,version]` on the table `Runtime` will be added. If there are existing duplicate values, this will fail.
  - Made the column `name` on table `Corpus` required. This step will fail if there are existing NULL values in that column.
  - Made the column `slug` on table `Corpus` required. This step will fail if there are existing NULL values in that column.
  - Made the column `slug` on table `Domain` required. This step will fail if there are existing NULL values in that column.
  - Made the column `name` on table `Domain` required. This step will fail if there are existing NULL values in that column.
  - Made the column `name` on table `Game` required. This step will fail if there are existing NULL values in that column.
  - Made the column `runtimeId` on table `Game` required. This step will fail if there are existing NULL values in that column.
  - Made the column `slug` on table `Game` required. This step will fail if there are existing NULL values in that column.
  - Made the column `name` on table `Ontology` required. This step will fail if there are existing NULL values in that column.
  - Made the column `slug` on table `Ontology` required. This step will fail if there are existing NULL values in that column.
  - Made the column `slug` on table `Runtime` required. This step will fail if there are existing NULL values in that column.
  - Made the column `name` on table `Runtime` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "Runtime" DROP CONSTRAINT "Runtime_corpusId_fkey";

-- DropForeignKey
ALTER TABLE "Runtime" DROP CONSTRAINT "Runtime_domainId_fkey";

-- DropForeignKey
ALTER TABLE "Runtime" DROP CONSTRAINT "Runtime_ontologyId_fkey";

-- DropIndex
DROP INDEX "Game_slug_runtimeId_key";

-- DropIndex
DROP INDEX "Runtime_corpusId_key";

-- DropIndex
DROP INDEX "Runtime_domainId_key";

-- DropIndex
DROP INDEX "Runtime_ontologyId_key";

-- AlterTable
ALTER TABLE "Corpus" ADD COLUMN     "runtimeId" TEXT NOT NULL DEFAULT 'c9e2eacf-eaef-47de-bf6b-3aac4d3e8590',
ALTER COLUMN "name" SET NOT NULL,
ALTER COLUMN "slug" SET NOT NULL;

-- AlterTable
ALTER TABLE "Domain" ADD COLUMN     "runtimeId" TEXT NOT NULL DEFAULT 'c9e2eacf-eaef-47de-bf6b-3aac4d3e8590',
ALTER COLUMN "slug" SET NOT NULL,
ALTER COLUMN "name" SET NOT NULL;

-- AlterTable
ALTER TABLE "Game" ALTER COLUMN "name" SET NOT NULL,
ALTER COLUMN "runtimeId" SET NOT NULL,
ALTER COLUMN "slug" SET NOT NULL;

-- AlterTable
ALTER TABLE "Ontology" ADD COLUMN     "runtimeId" TEXT NOT NULL DEFAULT 'c9e2eacf-eaef-47de-bf6b-3aac4d3e8590',
ALTER COLUMN "name" SET NOT NULL,
ALTER COLUMN "slug" SET NOT NULL;

-- AlterTable
ALTER TABLE "Runtime" DROP COLUMN "corpusId",
DROP COLUMN "domainId",
DROP COLUMN "ontologyId",
ADD COLUMN     "version" TEXT NOT NULL DEFAULT '0.0.0',
ALTER COLUMN "slug" SET NOT NULL,
ALTER COLUMN "name" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Corpus_runtimeId_key" ON "Corpus"("runtimeId");

-- CreateIndex
CREATE UNIQUE INDEX "Corpus_slug_version_runtimeId_key" ON "Corpus"("slug", "version", "runtimeId");

-- CreateIndex
CREATE UNIQUE INDEX "Domain_runtimeId_key" ON "Domain"("runtimeId");

-- CreateIndex
CREATE UNIQUE INDEX "Domain_slug_version_runtimeId_key" ON "Domain"("slug", "version", "runtimeId");

-- CreateIndex
CREATE UNIQUE INDEX "Game_slug_version_runtimeId_key" ON "Game"("slug", "version", "runtimeId");

-- CreateIndex
CREATE UNIQUE INDEX "Ontology_runtimeId_key" ON "Ontology"("runtimeId");

-- CreateIndex
CREATE UNIQUE INDEX "Ontology_slug_version_runtimeId_key" ON "Ontology"("slug", "version", "runtimeId");

-- CreateIndex
CREATE UNIQUE INDEX "Runtime_slug_version_key" ON "Runtime"("slug", "version");

-- AddForeignKey
ALTER TABLE "Domain" ADD CONSTRAINT "Domain_runtimeId_fkey" FOREIGN KEY ("runtimeId") REFERENCES "Runtime"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ontology" ADD CONSTRAINT "Ontology_runtimeId_fkey" FOREIGN KEY ("runtimeId") REFERENCES "Runtime"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Corpus" ADD CONSTRAINT "Corpus_runtimeId_fkey" FOREIGN KEY ("runtimeId") REFERENCES "Runtime"("id") ON DELETE CASCADE ON UPDATE CASCADE;
