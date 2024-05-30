-- AlterTable
ALTER TABLE "Memory" RENAME CONSTRAINT "MemoryModel_pkey" TO "Memory_pkey";

-- RenameForeignKey
ALTER TABLE "Memory" RENAME CONSTRAINT "MemoryModel_unitId_fkey" TO "Memory_unitId_fkey";

-- RenameForeignKey
ALTER TABLE "Memory" RENAME CONSTRAINT "MemoryModel_userId_fkey" TO "Memory_userId_fkey";

-- RenameIndex
ALTER INDEX "MemoryModel_unitId_userId_key" RENAME TO "Memory_unitId_userId_key";

-- RenameIndex
ALTER INDEX "unitIdIndexOnMemoryModel" RENAME TO "unitIdIndexOnMemory";

-- RenameIndex
ALTER INDEX "userIdIndexOnMemoryModel" RENAME TO "userIdIndexOnMemory";
