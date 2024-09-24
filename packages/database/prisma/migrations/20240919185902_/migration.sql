-- DropIndex
DROP INDEX "Tag_name_key";

-- AlterTable
ALTER TABLE "Memory" ALTER COLUMN "runtimeId" DROP DEFAULT;

-- AlterTable
ALTER TABLE "Play" ALTER COLUMN "runtimeId" DROP DEFAULT;
