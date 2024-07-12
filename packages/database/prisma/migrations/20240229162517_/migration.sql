-- AlterTable
ALTER TABLE "Tag" ALTER COLUMN "id" SET DEFAULT uuid_generate_v4();

-- AlterTable
ALTER TABLE "Unit" ALTER COLUMN "id" SET DEFAULT uuid_generate_v4();
