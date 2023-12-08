/*
  Warnings:

  - The values [POLITE_INFORMAL,POLITE_FORMAL] on the enum `PartOfSpeechEnum` will be removed. If these variants are still used in the database, this will fail.

*/
-- CreateEnum
CREATE TYPE "TagTypeEnum" AS ENUM ('STRUCTURAL', 'LEARNABLE', 'SET');

-- AlterEnum
BEGIN;
CREATE TYPE "PartOfSpeechEnum_new" AS ENUM ('ADJECTIVE', 'ADPOSITION', 'ADVERB', 'AUXILIARY', 'CONJUNCTION_COORDINATING', 'CONJUNCTION_SUBORDINATING', 'DETERMINER', 'INTERJECTION', 'NOUN', 'NUMERAL', 'PARTICLE', 'PRONOUN', 'PROPERNOUN', 'PUNCTUATION', 'SYMBOL', 'VERB', 'OTHER', 'GENDER_MASCULINE', 'GENDER_FEMININE', 'GENDER_NEUTER');
ALTER TABLE "Word" ALTER COLUMN "pos" DROP DEFAULT;
ALTER TABLE "Word" ALTER COLUMN "pos" TYPE "PartOfSpeechEnum_new"[] USING ("pos"::text::"PartOfSpeechEnum_new"[]);
ALTER TYPE "PartOfSpeechEnum" RENAME TO "PartOfSpeechEnum_old";
ALTER TYPE "PartOfSpeechEnum_new" RENAME TO "PartOfSpeechEnum";
DROP TYPE "PartOfSpeechEnum_old";
ALTER TABLE "Word" ALTER COLUMN "pos" SET DEFAULT ARRAY[]::"PartOfSpeechEnum"[];
COMMIT;

-- CreateTable
CREATE TABLE "Tag" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "name" TEXT NOT NULL,
    "type" "TagTypeEnum"[] DEFAULT ARRAY[]::"TagTypeEnum"[],

    CONSTRAINT "Tag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TagUserRelation" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "history" JSONB NOT NULL DEFAULT '[]',
    "state" JSONB NOT NULL DEFAULT '{}',
    "tagId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "TagUserRelation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_TagToUnit" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "TagUserRelation_tagId_userId_key" ON "TagUserRelation"("tagId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "_TagToUnit_AB_unique" ON "_TagToUnit"("A", "B");

-- CreateIndex
CREATE INDEX "_TagToUnit_B_index" ON "_TagToUnit"("B");

-- AddForeignKey
ALTER TABLE "TagUserRelation" ADD CONSTRAINT "TagUserRelation_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "Tag"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TagUserRelation" ADD CONSTRAINT "TagUserRelation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_TagToUnit" ADD CONSTRAINT "_TagToUnit_A_fkey" FOREIGN KEY ("A") REFERENCES "Tag"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_TagToUnit" ADD CONSTRAINT "_TagToUnit_B_fkey" FOREIGN KEY ("B") REFERENCES "Unit"("id") ON DELETE CASCADE ON UPDATE CASCADE;
