-- AlterTable
ALTER TABLE "AppUser" ADD COLUMN     "config" JSONB NOT NULL DEFAULT '{}';
