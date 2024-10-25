-- AlterTable
ALTER TABLE "Corpus" ALTER COLUMN "version" SET DEFAULT '0.0.0';

-- AlterTable
ALTER TABLE "Domain" ALTER COLUMN "version" SET DEFAULT '0.0.0';

-- AlterTable
ALTER TABLE "Game" ALTER COLUMN "version" SET DEFAULT '0.0.0';

-- AlterTable
ALTER TABLE "Ontology" ALTER COLUMN "version" SET DEFAULT '0.0.0';

-- AlterTable
ALTER TABLE "Strategy" ALTER COLUMN "version" SET DEFAULT '0.0.0';

-- AlterTable
ALTER TABLE "Tactic" ADD COLUMN     "masks" JSONB NOT NULL DEFAULT '{}',
ALTER COLUMN "provisions" DROP NOT NULL,
ALTER COLUMN "provisions" DROP DEFAULT;
