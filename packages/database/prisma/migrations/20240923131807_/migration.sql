/*
  Warnings:

  - A unique constraint covering the columns `[runtimeId]` on the table `Ontology` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Tactic" ADD COLUMN     "corpusId" TEXT;

-- AlterTable
ALTER TABLE "Tag" ADD COLUMN     "corpusId" TEXT;

-- AlterTable
ALTER TABLE "Unit" ADD COLUMN     "corpusId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Ontology_runtimeId_key" ON "Ontology"("runtimeId");

-- AddForeignKey
ALTER TABLE "Tactic" ADD CONSTRAINT "Tactic_corpusId_fkey" FOREIGN KEY ("corpusId") REFERENCES "Corpus"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tag" ADD CONSTRAINT "Tag_corpusId_fkey" FOREIGN KEY ("corpusId") REFERENCES "Corpus"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Unit" ADD CONSTRAINT "Unit_corpusId_fkey" FOREIGN KEY ("corpusId") REFERENCES "Corpus"("id") ON DELETE CASCADE ON UPDATE CASCADE;
