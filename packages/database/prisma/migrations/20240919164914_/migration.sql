-- AlterTable
ALTER TABLE "Corpus" ADD COLUMN     "description" TEXT,
ALTER COLUMN "name" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Domain" ADD COLUMN     "description" TEXT,
ALTER COLUMN "name" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Game" ALTER COLUMN "name" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Ontology" ADD COLUMN     "description" TEXT,
ALTER COLUMN "name" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Runtime" ADD COLUMN     "description" TEXT,
ALTER COLUMN "name" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Tactic" ALTER COLUMN "name" DROP NOT NULL;
