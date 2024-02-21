/*
  Warnings:

  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_StrategyToUser` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_StrategyToUser" DROP CONSTRAINT "_StrategyToUser_A_fkey";

-- DropForeignKey
ALTER TABLE "_StrategyToUser" DROP CONSTRAINT "_StrategyToUser_B_fkey";

-- DropTable
DROP TABLE "User";

-- DropTable
DROP TABLE "_StrategyToUser";

-- CreateTable
CREATE TABLE "AppUser" (
    "auth_user_id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AppUser_pkey" PRIMARY KEY ("auth_user_id")
);

-- CreateTable
CREATE TABLE "_AppUserToStrategy" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "AppUser_auth_user_id_key" ON "AppUser"("auth_user_id");

-- CreateIndex
CREATE UNIQUE INDEX "_AppUserToStrategy_AB_unique" ON "_AppUserToStrategy"("A", "B");

-- CreateIndex
CREATE INDEX "_AppUserToStrategy_B_index" ON "_AppUserToStrategy"("B");

-- AddForeignKey
ALTER TABLE "_AppUserToStrategy" ADD CONSTRAINT "_AppUserToStrategy_A_fkey" FOREIGN KEY ("A") REFERENCES "AppUser"("auth_user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AppUserToStrategy" ADD CONSTRAINT "_AppUserToStrategy_B_fkey" FOREIGN KEY ("B") REFERENCES "Strategy"("id") ON DELETE CASCADE ON UPDATE CASCADE;
