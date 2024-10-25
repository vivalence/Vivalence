/*
  Warnings:

  - A unique constraint covering the columns `[slug,runtimeId]` on the table `Corpus` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[slug,runtimeId]` on the table `Domain` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[slug,runtimeId]` on the table `Game` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[slug,runtimeId]` on the table `Ontology` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[slug]` on the table `Runtime` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Corpus_slug_version_runtimeId_key";

-- DropIndex
DROP INDEX "Domain_slug_version_runtimeId_key";

-- DropIndex
DROP INDEX "Game_slug_version_runtimeId_key";

-- DropIndex
DROP INDEX "Ontology_slug_version_runtimeId_key";

-- DropIndex
DROP INDEX "Runtime_slug_version_key";

-- AlterTable
ALTER TABLE "Strategy" ADD COLUMN     "description" TEXT,
ADD COLUMN     "installed" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "version" TEXT NOT NULL DEFAULT '0.0.0';

-- AlterTable
ALTER TABLE "Tactic" ADD COLUMN     "installed" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "version" TEXT NOT NULL DEFAULT '0.0.0';

-- CreateIndex
CREATE UNIQUE INDEX "Corpus_slug_runtimeId_key" ON "Corpus"("slug", "runtimeId");

-- CreateIndex
CREATE UNIQUE INDEX "Domain_slug_runtimeId_key" ON "Domain"("slug", "runtimeId");

-- CreateIndex
CREATE UNIQUE INDEX "Game_slug_runtimeId_key" ON "Game"("slug", "runtimeId");

-- CreateIndex
CREATE UNIQUE INDEX "Ontology_slug_runtimeId_key" ON "Ontology"("slug", "runtimeId");

-- CreateIndex
CREATE UNIQUE INDEX "Runtime_slug_key" ON "Runtime"("slug");
