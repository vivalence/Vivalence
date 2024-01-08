-- AlterTable
ALTER TABLE "Conjugation" ADD COLUMN     "lemmaEnglish" TEXT,
ADD COLUMN     "lemmaSpanish" TEXT,
ADD COLUMN     "ud" JSONB;
