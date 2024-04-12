-- AlterTable
ALTER TABLE "Game" ADD COLUMN     "objectStatus" "ObjectStatusEnum" NOT NULL DEFAULT 'ACTIVE';

-- AlterTable
ALTER TABLE "Strategy" ADD COLUMN     "objectStatus" "ObjectStatusEnum" NOT NULL DEFAULT 'ACTIVE';
