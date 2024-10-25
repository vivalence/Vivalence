/*
  Warnings:

  - You are about to drop the column `trait` on the `Tag` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "TagTraitsEnum" AS ENUM ('ONTOLOGICAL', 'STRUCTURAL', 'LEARNABLE', 'COMPLETABLE', 'DEPENDENCY');

-- AlterTable
ALTER TABLE "Tag" DROP COLUMN "trait",
ADD COLUMN     "traits" "TagTraitsEnum"[] DEFAULT ARRAY[]::"TagTraitsEnum"[];

-- DropEnum
DROP TYPE "TagTraitEnum";
