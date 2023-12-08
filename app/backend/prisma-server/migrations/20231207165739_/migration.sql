-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "PartOfSpeechEnum" ADD VALUE 'GENDER_MASCULINE';
ALTER TYPE "PartOfSpeechEnum" ADD VALUE 'GENDER_FEMININE';
ALTER TYPE "PartOfSpeechEnum" ADD VALUE 'GENDER_NEUTER';
ALTER TYPE "PartOfSpeechEnum" ADD VALUE 'POLITE_INFORMAL';
ALTER TYPE "PartOfSpeechEnum" ADD VALUE 'POLITE_FORMAL';
