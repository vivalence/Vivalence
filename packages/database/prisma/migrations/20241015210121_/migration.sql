/*
  Warnings:

  - You are about to drop the column `tagId` on the `Queue` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Queue" DROP CONSTRAINT "Queue_tagId_fkey";

-- AlterTable
ALTER TABLE "Condition" ADD COLUMN     "description" TEXT;

-- AlterTable
ALTER TABLE "Dependency" ADD COLUMN     "available" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Queue" DROP COLUMN "tagId",
ADD COLUMN     "dependencyId" TEXT,
ALTER COLUMN "tacticId" DROP NOT NULL;

-- CreateIndex
CREATE INDEX "conditionForIndexOnCondition" ON "Condition"("conditionForId");

-- CreateIndex
CREATE INDEX "preconditionForIndexOnCondition" ON "Condition"("preconditionForId");

-- AddForeignKey
ALTER TABLE "Queue" ADD CONSTRAINT "Queue_dependencyId_fkey" FOREIGN KEY ("dependencyId") REFERENCES "Dependency"("id") ON DELETE CASCADE ON UPDATE CASCADE;
