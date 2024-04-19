/*
  Warnings:

  - The values [COMPLETEABLE] on the enum `TagTypeEnum` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "TagTypeEnum_new" AS ENUM ('ONTOLOGICAL', 'STRUCTURAL', 'LEARNABLE', 'COMPLETABLE');
ALTER TABLE "Tag" ALTER COLUMN "type" DROP DEFAULT;
ALTER TABLE "Tag" ALTER COLUMN "type" TYPE "TagTypeEnum_new"[] USING ("type"::text::"TagTypeEnum_new"[]);
ALTER TYPE "TagTypeEnum" RENAME TO "TagTypeEnum_old";
ALTER TYPE "TagTypeEnum_new" RENAME TO "TagTypeEnum";
DROP TYPE "TagTypeEnum_old";
ALTER TABLE "Tag" ALTER COLUMN "type" SET DEFAULT ARRAY[]::"TagTypeEnum"[];
COMMIT;
