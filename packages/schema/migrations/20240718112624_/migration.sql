/*
  Warnings:

  - You are about to drop the column `version` on the `Runtime` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Runtime" DROP COLUMN "version",
ADD COLUMN     "installed" BOOLEAN NOT NULL DEFAULT false;
