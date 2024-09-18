-- AlterTable
ALTER TABLE "Game" ADD COLUMN     "description" TEXT;

-- AlterTable
ALTER TABLE "Tactic" ALTER COLUMN "relations" SET DEFAULT '{}';
