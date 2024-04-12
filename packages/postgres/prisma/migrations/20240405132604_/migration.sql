-- AlterTable
ALTER TABLE "Memory" ADD COLUMN     "tagId" TEXT;

-- AddForeignKey
ALTER TABLE "Memory" ADD CONSTRAINT "Memory_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "Tag"("id") ON DELETE CASCADE ON UPDATE CASCADE;
