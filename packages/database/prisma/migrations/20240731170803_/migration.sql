/*
  Warnings:

  - You are about to drop the column `slug` on the `Strategy` table. All the data in the column will be lost.
  - Made the column `name` on table `Strategy` required. This step will fail if there are existing NULL values in that column.
  - Made the column `runtimeId` on table `Strategy` required. This step will fail if there are existing NULL values in that column.
  - Made the column `userId` on table `Strategy` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Strategy" DROP COLUMN "slug",
ALTER COLUMN "name" SET NOT NULL,
ALTER COLUMN "runtimeId" SET NOT NULL,
ALTER COLUMN "userId" SET NOT NULL;
