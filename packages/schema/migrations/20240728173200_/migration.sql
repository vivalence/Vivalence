-- CreateEnum
CREATE TYPE "TagTraitEnum" AS ENUM ('ONTOLOGICAL', 'STRUCTURAL', 'LEARNABLE', 'COMPLETABLE', 'DEPENDENCY');

-- AlterTable
ALTER TABLE "Tag" ADD COLUMN     "trait" "TagTraitEnum"[] DEFAULT ARRAY[]::"TagTraitEnum"[];
