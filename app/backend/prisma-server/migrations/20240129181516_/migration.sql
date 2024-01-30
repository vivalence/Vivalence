/*
  Warnings:

  - The values [SET] on the enum `TagTypeEnum` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "TagTypeEnum_new" AS ENUM ('STRUCTURAL', 'ONTOLOGICAL', 'LEARNABLE');
ALTER TABLE "Tag" ALTER COLUMN "type" DROP DEFAULT;
ALTER TABLE "Tag" ALTER COLUMN "type" TYPE "TagTypeEnum_new"[] USING ("type"::text::"TagTypeEnum_new"[]);
ALTER TYPE "TagTypeEnum" RENAME TO "TagTypeEnum_old";
ALTER TYPE "TagTypeEnum_new" RENAME TO "TagTypeEnum";
DROP TYPE "TagTypeEnum_old";
ALTER TABLE "Tag" ALTER COLUMN "type" SET DEFAULT ARRAY[]::"TagTypeEnum"[];
COMMIT;

-- AlterTable
ALTER TABLE "Tag" ADD COLUMN     "data" JSONB NOT NULL DEFAULT '{}';

-- CreateTable
CREATE TABLE "_TagTag" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_TagTag_AB_unique" ON "_TagTag"("A", "B");

-- CreateIndex
CREATE INDEX "_TagTag_B_index" ON "_TagTag"("B");

-- AddForeignKey
ALTER TABLE "_TagTag" ADD CONSTRAINT "_TagTag_A_fkey" FOREIGN KEY ("A") REFERENCES "Tag"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_TagTag" ADD CONSTRAINT "_TagTag_B_fkey" FOREIGN KEY ("B") REFERENCES "Tag"("id") ON DELETE CASCADE ON UPDATE CASCADE;
