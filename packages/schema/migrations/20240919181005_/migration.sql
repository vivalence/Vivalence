-- AlterTable
ALTER TABLE "Memory" ADD COLUMN     "runtimeId" TEXT NOT NULL DEFAULT 'c9e2eacf-eaef-47de-bf6b-3aac4d3e8590';

-- AlterTable
ALTER TABLE "Play" ADD COLUMN     "runtimeId" TEXT NOT NULL DEFAULT 'c9e2eacf-eaef-47de-bf6b-3aac4d3e8590';

-- AddForeignKey
ALTER TABLE "Play" ADD CONSTRAINT "Play_runtimeId_fkey" FOREIGN KEY ("runtimeId") REFERENCES "Runtime"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Memory" ADD CONSTRAINT "Memory_runtimeId_fkey" FOREIGN KEY ("runtimeId") REFERENCES "Runtime"("id") ON DELETE CASCADE ON UPDATE CASCADE;
