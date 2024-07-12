-- AlterTable
ALTER TABLE "Strategy" ADD COLUMN     "provision" JSONB NOT NULL DEFAULT '{}',
ADD COLUMN     "relations" JSONB NOT NULL DEFAULT '{}',
ALTER COLUMN "data" DROP NOT NULL;
