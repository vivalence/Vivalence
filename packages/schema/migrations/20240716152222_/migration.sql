/*
  Warnings:

  - You are about to drop the column `email` on the `AppUser` table. All the data in the column will be lost.
  - You are about to drop the column `ontologyId` on the `Corpus` table. All the data in the column will be lost.
  - You are about to drop the column `corpusId` on the `Game` table. All the data in the column will be lost.
  - You are about to drop the column `appUserId` on the `Queue` table. All the data in the column will be lost.
  - You are about to drop the column `corpusId` on the `Strategy` table. All the data in the column will be lost.
  - You are about to drop the column `corpusId` on the `Tactic` table. All the data in the column will be lost.
  - You are about to drop the column `corpusId` on the `Tag` table. All the data in the column will be lost.
  - You are about to drop the column `corpusId` on the `Unit` table. All the data in the column will be lost.
  - You are about to drop the `_AppUserToCorpus` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_AppUserToStrategy` table. If the table is not empty, all the data it contains will be lost.
  - Made the column `version` on table `Corpus` required. This step will fail if there are existing NULL values in that column.
  - Made the column `version` on table `Game` required. This step will fail if there are existing NULL values in that column.
  - Made the column `version` on table `Ontology` required. This step will fail if there are existing NULL values in that column.
  - Made the column `version` on table `Strategy` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "Corpus" DROP CONSTRAINT "Corpus_ontologyId_fkey";

-- DropForeignKey
ALTER TABLE "Game" DROP CONSTRAINT "Game_corpusId_fkey";

-- DropForeignKey
ALTER TABLE "Queue" DROP CONSTRAINT "Queue_appUserId_fkey";

-- DropForeignKey
ALTER TABLE "Strategy" DROP CONSTRAINT "Strategy_corpusId_fkey";

-- DropForeignKey
ALTER TABLE "Tactic" DROP CONSTRAINT "Tactic_corpusId_fkey";

-- DropForeignKey
ALTER TABLE "Tag" DROP CONSTRAINT "Tag_corpusId_fkey";

-- DropForeignKey
ALTER TABLE "Unit" DROP CONSTRAINT "Unit_corpusId_fkey";

-- DropForeignKey
ALTER TABLE "_AppUserToCorpus" DROP CONSTRAINT "_AppUserToCorpus_A_fkey";

-- DropForeignKey
ALTER TABLE "_AppUserToCorpus" DROP CONSTRAINT "_AppUserToCorpus_B_fkey";

-- DropForeignKey
ALTER TABLE "_AppUserToStrategy" DROP CONSTRAINT "_AppUserToStrategy_A_fkey";

-- DropForeignKey
ALTER TABLE "_AppUserToStrategy" DROP CONSTRAINT "_AppUserToStrategy_B_fkey";

-- DropIndex
DROP INDEX "Corpus_ontologyId_key";

-- AlterTable
ALTER TABLE "AppUser" DROP COLUMN "email";

-- AlterTable
ALTER TABLE "Corpus" DROP COLUMN "ontologyId",
ADD COLUMN     "slug" TEXT,
ALTER COLUMN "id" SET DEFAULT uuid_generate_v4(),
ALTER COLUMN "version" SET NOT NULL,
ALTER COLUMN "version" SET DEFAULT 'v0.0.0';

-- AlterTable
ALTER TABLE "Game" DROP COLUMN "corpusId",
ADD COLUMN     "runtimeId" TEXT,
ADD COLUMN     "slug" TEXT,
ALTER COLUMN "id" SET DEFAULT uuid_generate_v4(),
ALTER COLUMN "version" SET NOT NULL,
ALTER COLUMN "version" SET DEFAULT 'v0.0.0';

-- AlterTable
ALTER TABLE "Ontology" ADD COLUMN     "slug" TEXT,
ALTER COLUMN "id" SET DEFAULT uuid_generate_v4(),
ALTER COLUMN "version" SET NOT NULL,
ALTER COLUMN "version" SET DEFAULT 'v0.0.0';

-- AlterTable
ALTER TABLE "Queue" DROP COLUMN "appUserId";

-- AlterTable
ALTER TABLE "Strategy" DROP COLUMN "corpusId",
ADD COLUMN     "runtimeId" TEXT,
ADD COLUMN     "slug" TEXT,
ADD COLUMN     "userId" TEXT,
ALTER COLUMN "id" SET DEFAULT uuid_generate_v4(),
ALTER COLUMN "version" SET NOT NULL,
ALTER COLUMN "version" SET DEFAULT 'v0.0.0';

-- AlterTable
ALTER TABLE "Tactic" DROP COLUMN "corpusId",
ADD COLUMN     "provisions" JSONB NOT NULL DEFAULT '{}',
ADD COLUMN     "runtimeId" TEXT,
ALTER COLUMN "provision" DROP NOT NULL,
ALTER COLUMN "provision" DROP DEFAULT;

-- AlterTable
ALTER TABLE "Tag" DROP COLUMN "corpusId",
ADD COLUMN     "runtimeId" TEXT,
ADD COLUMN     "strategyId" TEXT;

-- AlterTable
ALTER TABLE "Unit" DROP COLUMN "corpusId",
ADD COLUMN     "annotation" JSONB NOT NULL DEFAULT '{}',
ADD COLUMN     "runtimeId" TEXT,
ADD COLUMN     "strategyId" TEXT,
ALTER COLUMN "data" SET DEFAULT '{}';

-- DropTable
DROP TABLE "_AppUserToCorpus";

-- DropTable
DROP TABLE "_AppUserToStrategy";

-- CreateTable
CREATE TABLE "Runtime" (
    "id" TEXT NOT NULL DEFAULT uuid_generate_v4(),
    "slug" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ontologyId" TEXT,
    "corpusId" TEXT,

    CONSTRAINT "Runtime_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_AppUserToRuntime" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Runtime_ontologyId_key" ON "Runtime"("ontologyId");

-- CreateIndex
CREATE UNIQUE INDEX "Runtime_corpusId_key" ON "Runtime"("corpusId");

-- CreateIndex
CREATE UNIQUE INDEX "_AppUserToRuntime_AB_unique" ON "_AppUserToRuntime"("A", "B");

-- CreateIndex
CREATE INDEX "_AppUserToRuntime_B_index" ON "_AppUserToRuntime"("B");

-- AddForeignKey
ALTER TABLE "Runtime" ADD CONSTRAINT "Runtime_ontologyId_fkey" FOREIGN KEY ("ontologyId") REFERENCES "Ontology"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Runtime" ADD CONSTRAINT "Runtime_corpusId_fkey" FOREIGN KEY ("corpusId") REFERENCES "Corpus"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Game" ADD CONSTRAINT "Game_runtimeId_fkey" FOREIGN KEY ("runtimeId") REFERENCES "Runtime"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tactic" ADD CONSTRAINT "Tactic_runtimeId_fkey" FOREIGN KEY ("runtimeId") REFERENCES "Runtime"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tag" ADD CONSTRAINT "Tag_runtimeId_fkey" FOREIGN KEY ("runtimeId") REFERENCES "Runtime"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tag" ADD CONSTRAINT "Tag_strategyId_fkey" FOREIGN KEY ("strategyId") REFERENCES "Strategy"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Unit" ADD CONSTRAINT "Unit_runtimeId_fkey" FOREIGN KEY ("runtimeId") REFERENCES "Runtime"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Unit" ADD CONSTRAINT "Unit_strategyId_fkey" FOREIGN KEY ("strategyId") REFERENCES "Strategy"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Strategy" ADD CONSTRAINT "Strategy_userId_fkey" FOREIGN KEY ("userId") REFERENCES "AppUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Strategy" ADD CONSTRAINT "Strategy_runtimeId_fkey" FOREIGN KEY ("runtimeId") REFERENCES "Runtime"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Queue" ADD CONSTRAINT "Queue_userId_fkey" FOREIGN KEY ("userId") REFERENCES "AppUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AppUserToRuntime" ADD CONSTRAINT "_AppUserToRuntime_A_fkey" FOREIGN KEY ("A") REFERENCES "AppUser"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AppUserToRuntime" ADD CONSTRAINT "_AppUserToRuntime_B_fkey" FOREIGN KEY ("B") REFERENCES "Runtime"("id") ON DELETE CASCADE ON UPDATE CASCADE;
