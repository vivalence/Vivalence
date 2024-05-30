-- CreateEnum
CREATE TYPE "MemoryTypeEnum" AS ENUM ('EBISU_v2', 'EBISU_v3');

-- CreateEnum
CREATE TYPE "GameTypeEnum" AS ENUM ('FLASHCARDS', 'TRANSLATIONS');

-- CreateEnum
CREATE TYPE "MemoryStatusEnum" AS ENUM ('UNKNOWN', 'LEARNING', 'KNOWN', 'GRADUATED');

-- CreateEnum
CREATE TYPE "UnitStatusEnum" AS ENUM ('HIDDEN', 'PRIORITIZED');

-- AlterTable
ALTER TABLE "Strategy" ADD COLUMN     "data" JSONB NOT NULL DEFAULT '{}';

-- CreateTable
CREATE TABLE "Game" (
    "id" TEXT NOT NULL DEFAULT uuid_generate_v4(),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "type" "GameTypeEnum" NOT NULL,
    "strategyId" TEXT,

    CONSTRAINT "Game_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Play" (
    "id" TEXT NOT NULL DEFAULT uuid_generate_v4(),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "history" JSONB NOT NULL DEFAULT '[]',
    "nextPlay" TIMESTAMP(3) NOT NULL,
    "lastPlay" TIMESTAMP(3) NOT NULL,
    "unitId" TEXT NOT NULL,
    "gameId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "memoryId" TEXT NOT NULL,

    CONSTRAINT "Play_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MemoryModel" (
    "id" TEXT NOT NULL DEFAULT uuid_generate_v4(),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "type" "MemoryTypeEnum" NOT NULL DEFAULT 'EBISU_v2',
    "status" "MemoryStatusEnum" NOT NULL DEFAULT 'UNKNOWN',
    "state" JSONB NOT NULL DEFAULT '{}',
    "lastSeen" TIMESTAMP(3),
    "history" JSONB NOT NULL DEFAULT '[]',
    "unitId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "MemoryModel_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Game_type_strategyId_key" ON "Game"("type", "strategyId");

-- CreateIndex
CREATE UNIQUE INDEX "Play_unitId_gameId_userId_memoryId_key" ON "Play"("unitId", "gameId", "userId", "memoryId");

-- CreateIndex
CREATE UNIQUE INDEX "MemoryModel_unitId_userId_key" ON "MemoryModel"("unitId", "userId");

-- AddForeignKey
ALTER TABLE "Game" ADD CONSTRAINT "Game_strategyId_fkey" FOREIGN KEY ("strategyId") REFERENCES "Strategy"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Play" ADD CONSTRAINT "Play_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES "Unit"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Play" ADD CONSTRAINT "Play_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "Game"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Play" ADD CONSTRAINT "Play_userId_fkey" FOREIGN KEY ("userId") REFERENCES "AppUser"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Play" ADD CONSTRAINT "Play_memoryId_fkey" FOREIGN KEY ("memoryId") REFERENCES "MemoryModel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MemoryModel" ADD CONSTRAINT "MemoryModel_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES "Unit"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MemoryModel" ADD CONSTRAINT "MemoryModel_userId_fkey" FOREIGN KEY ("userId") REFERENCES "AppUser"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
