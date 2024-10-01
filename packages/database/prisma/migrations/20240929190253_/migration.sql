-- DropForeignKey
ALTER TABLE "Play" DROP CONSTRAINT "Play_memoryId_fkey";

-- AddForeignKey
ALTER TABLE "Play" ADD CONSTRAINT "Play_memoryId_fkey" FOREIGN KEY ("memoryId") REFERENCES "Memory"("id") ON DELETE CASCADE ON UPDATE CASCADE;
