-- AlterTable
ALTER TABLE "Game" ADD COLUMN     "mask" JSONB NOT NULL DEFAULT '{}';

-- AlterTable
ALTER TABLE "Tactic" ADD COLUMN     "description" TEXT;
