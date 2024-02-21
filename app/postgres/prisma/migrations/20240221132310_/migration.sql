/*
  Warnings:

  - The primary key for the `AppUser` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `auth_user_id` on the `AppUser` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[id]` on the table `AppUser` will be added. If there are existing duplicate values, this will fail.
  - Made the column `id` on table `AppUser` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "_AppUserToStrategy" DROP CONSTRAINT "_AppUserToStrategy_A_fkey";

-- DropIndex
DROP INDEX "AppUser_auth_user_id_key";

-- CreateIndex
CREATE UNIQUE INDEX "AppUser_id_key" ON "AppUser"("id");

-- AddForeignKey
ALTER TABLE "_AppUserToStrategy" ADD CONSTRAINT "_AppUserToStrategy_A_fkey" FOREIGN KEY ("A") REFERENCES "AppUser"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AlterTable
ALTER TABLE "AppUser" DROP CONSTRAINT "AppUser_pkey",
DROP COLUMN "auth_user_id",
ALTER COLUMN "id" SET NOT NULL,
ADD CONSTRAINT "AppUser_pkey" PRIMARY KEY ("id");
