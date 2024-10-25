/*
  Warnings:

  - You are about to drop the column `tacticId` on the `Queue` table. All the data in the column will be lost.
  - You are about to drop the column `gameId` on the `Tactic` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Queue" DROP CONSTRAINT "Queue_tacticId_fkey";

-- DropForeignKey
ALTER TABLE "Tactic" DROP CONSTRAINT "Tactic_gameId_fkey";

-- AlterTable
ALTER TABLE "Queue" DROP COLUMN "tacticId",
ADD COLUMN     "strategyId" TEXT NOT NULL DEFAULT 'e4f3d446-c1c3-42b2-8e5e-7bd7fcae9928';

-- AlterTable
ALTER TABLE "Strategy" ADD COLUMN     "slug" TEXT NOT NULL DEFAULT '';

-- AlterTable
ALTER TABLE "Tactic" DROP COLUMN "gameId";

-- CreateTable
CREATE TABLE "HEAD" (
    "id" TEXT NOT NULL DEFAULT uuid_generate_v4(),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "data" JSONB NOT NULL DEFAULT '{}',
    "userId" TEXT NOT NULL,
    "runtimeId" TEXT NOT NULL,

    CONSTRAINT "HEAD_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "HEAD_runtimeId_key" ON "HEAD"("runtimeId");

-- AddForeignKey
ALTER TABLE "Queue" ADD CONSTRAINT "Queue_strategyId_fkey" FOREIGN KEY ("strategyId") REFERENCES "Strategy"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HEAD" ADD CONSTRAINT "HEAD_userId_fkey" FOREIGN KEY ("userId") REFERENCES "AppUser"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HEAD" ADD CONSTRAINT "HEAD_runtimeId_fkey" FOREIGN KEY ("runtimeId") REFERENCES "Runtime"("id") ON DELETE CASCADE ON UPDATE CASCADE;
