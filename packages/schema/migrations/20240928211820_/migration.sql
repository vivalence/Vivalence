/*
  Warnings:

  - A unique constraint covering the columns `[runtimeId]` on the table `Queue` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `runtimeId` to the `Queue` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Queue" ADD COLUMN     "runtimeId" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Queue_runtimeId_key" ON "Queue"("runtimeId");

-- AddForeignKey
ALTER TABLE "Queue" ADD CONSTRAINT "Queue_runtimeId_fkey" FOREIGN KEY ("runtimeId") REFERENCES "Runtime"("id") ON DELETE CASCADE ON UPDATE CASCADE;
