-- /*
--   Warnings:

--   - You are about to drop the `MemoryModel` table. If the table is not empty, all the data it contains will be lost.

-- */
-- -- DropForeignKey
-- ALTER TABLE "MemoryModel" DROP CONSTRAINT "MemoryModel_unitId_fkey";

-- -- DropForeignKey
-- ALTER TABLE "MemoryModel" DROP CONSTRAINT "MemoryModel_userId_fkey";

-- -- DropForeignKey
-- ALTER TABLE "Play" DROP CONSTRAINT "Play_memoryId_fkey";

-- -- DropTable
-- DROP TABLE "MemoryModel";

-- -- CreateTable
-- CREATE TABLE "Memory" (
--     "id" TEXT NOT NULL DEFAULT uuid_generate_v4(),
--     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
--     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
--     "type" "MemoryTypeEnum" NOT NULL DEFAULT 'EBISU_v2',
--     "status" "MemoryStatusEnum" NOT NULL DEFAULT 'UNKNOWN',
--     "state" JSONB NOT NULL DEFAULT '{}',
--     "lastSeen" TIMESTAMP(3),
--     "history" JSONB NOT NULL DEFAULT '[]',
--     "unitId" TEXT NOT NULL,
--     "userId" TEXT NOT NULL,

--     CONSTRAINT "Memory_pkey" PRIMARY KEY ("id")
-- );
ALTER TABLE "MemoryModel" RENAME TO "Memory";

-- -- CreateIndex
-- CREATE INDEX "unitIdIndexOnMemory" ON "Memory"("unitId");

-- -- CreateIndex
-- CREATE INDEX "userIdIndexOnMemory" ON "Memory"("userId");

-- -- CreateIndex
-- CREATE UNIQUE INDEX "Memory_unitId_userId_key" ON "Memory"("unitId", "userId");

-- AddForeignKey
-- ALTER TABLE "Play" ADD CONSTRAINT "Play_memoryId_fkey" FOREIGN KEY ("memoryId") REFERENCES "Memory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- -- AddForeignKey
-- ALTER TABLE "Memory" ADD CONSTRAINT "Memory_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES "Unit"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- -- AddForeignKey
-- ALTER TABLE "Memory" ADD CONSTRAINT "Memory_userId_fkey" FOREIGN KEY ("userId") REFERENCES "AppUser"("id") ON DELETE CASCADE ON UPDATE CASCADE;
