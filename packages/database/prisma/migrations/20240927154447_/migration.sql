/*
  Warnings:

  - The values [COMPLETABLE] on the enum `TagTraitsEnum` will be removed. If these variants are still used in the database, this will fail.
  - Made the column `userId` on table `Queue` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "TagTraitsEnum_new" AS ENUM ('ONTOLOGICAL', 'STRUCTURAL', 'LEARNABLE', 'DEPENDENCY');
ALTER TABLE "Tag" ALTER COLUMN "traits" DROP DEFAULT;
ALTER TABLE "Tag" ALTER COLUMN "traits" TYPE "TagTraitsEnum_new"[] USING ("traits"::text::"TagTraitsEnum_new"[]);
ALTER TYPE "TagTraitsEnum" RENAME TO "TagTraitsEnum_old";
ALTER TYPE "TagTraitsEnum_new" RENAME TO "TagTraitsEnum";
DROP TYPE "TagTraitsEnum_old";
ALTER TABLE "Tag" ALTER COLUMN "traits" SET DEFAULT ARRAY[]::"TagTraitsEnum"[];
COMMIT;

-- AlterTable
ALTER TABLE "Queue" ADD COLUMN     "tagId" TEXT,
ALTER COLUMN "userId" SET NOT NULL,
ALTER COLUMN "strategyId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Tag" ADD COLUMN     "description" TEXT;

-- AddForeignKey
ALTER TABLE "Queue" ADD CONSTRAINT "Queue_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "Tag"("id") ON DELETE CASCADE ON UPDATE CASCADE;
