/*
  Warnings:

  - A unique constraint covering the columns `[slug,runtimeId]` on the table `Tag` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[slug,runtimeId]` on the table `Unit` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Tag" ADD COLUMN     "slug" TEXT NOT NULL DEFAULT uuid_generate_v4();

-- AlterTable
ALTER TABLE "Unit" ADD COLUMN     "slug" TEXT NOT NULL DEFAULT uuid_generate_v4();

-- CreateIndex
CREATE UNIQUE INDEX "Tag_slug_runtimeId_key" ON "Tag"("slug", "runtimeId");

-- CreateIndex
CREATE UNIQUE INDEX "Unit_slug_runtimeId_key" ON "Unit"("slug", "runtimeId");
