/*
  Warnings:

  - You are about to drop the column `falvor` on the `Memory` table. All the data in the column will be lost.
  - You are about to drop the column `strategyId` on the `Queue` table. All the data in the column will be lost.
  - You are about to drop the column `session` on the `Strategy` table. All the data in the column will be lost.
  - You are about to drop the `AppUser` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_AppUserToRuntime` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "StrategyTraitsEnum" AS ENUM ('DUMMY');

-- DropForeignKey
ALTER TABLE "HEAD" DROP CONSTRAINT "HEAD_userId_fkey";

-- DropForeignKey
ALTER TABLE "Memory" DROP CONSTRAINT "Memory_userId_fkey";

-- DropForeignKey
ALTER TABLE "Play" DROP CONSTRAINT "Play_userId_fkey";

-- DropForeignKey
ALTER TABLE "Queue" DROP CONSTRAINT "Queue_strategyId_fkey";

-- DropForeignKey
ALTER TABLE "Queue" DROP CONSTRAINT "Queue_userId_fkey";

-- DropForeignKey
ALTER TABLE "Strategy" DROP CONSTRAINT "Strategy_userId_fkey";

-- DropForeignKey
ALTER TABLE "_AppUserToRuntime" DROP CONSTRAINT "_AppUserToRuntime_A_fkey";

-- DropForeignKey
ALTER TABLE "_AppUserToRuntime" DROP CONSTRAINT "_AppUserToRuntime_B_fkey";

-- AlterTable
ALTER TABLE "Condition" ADD COLUMN     "name" TEXT;

-- AlterTable
ALTER TABLE "Memory" DROP COLUMN "falvor",
ADD COLUMN     "flavor" "MemoryFlavorEnum" NOT NULL DEFAULT 'INDIVIDUAL';

-- AlterTable
ALTER TABLE "Queue" DROP COLUMN "strategyId",
ADD COLUMN     "gameId" TEXT;

-- AlterTable
ALTER TABLE "Strategy" DROP COLUMN "session",
ADD COLUMN     "corpusId" TEXT,
ADD COLUMN     "data" JSONB NOT NULL DEFAULT '{}',
ADD COLUMN     "traits" "StrategyTraitsEnum"[] DEFAULT ARRAY[]::"StrategyTraitsEnum"[];

-- DropTable
DROP TABLE "AppUser";

-- DropTable
DROP TABLE "_AppUserToRuntime";

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "roles" "UserRolesEnum"[] DEFAULT ARRAY['USER']::"UserRolesEnum"[],
    "config" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_RuntimeToUser" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "User_id_key" ON "User"("id");

-- CreateIndex
CREATE UNIQUE INDEX "_RuntimeToUser_AB_unique" ON "_RuntimeToUser"("A", "B");

-- CreateIndex
CREATE INDEX "_RuntimeToUser_B_index" ON "_RuntimeToUser"("B");

-- AddForeignKey
ALTER TABLE "Strategy" ADD CONSTRAINT "Strategy_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Strategy" ADD CONSTRAINT "Strategy_corpusId_fkey" FOREIGN KEY ("corpusId") REFERENCES "Corpus"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Play" ADD CONSTRAINT "Play_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Memory" ADD CONSTRAINT "Memory_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Queue" ADD CONSTRAINT "Queue_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Queue" ADD CONSTRAINT "Queue_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "Game"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HEAD" ADD CONSTRAINT "HEAD_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_RuntimeToUser" ADD CONSTRAINT "_RuntimeToUser_A_fkey" FOREIGN KEY ("A") REFERENCES "Runtime"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_RuntimeToUser" ADD CONSTRAINT "_RuntimeToUser_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
