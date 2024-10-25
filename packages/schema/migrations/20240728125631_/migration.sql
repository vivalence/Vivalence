/*
  Warnings:

  - A unique constraint covering the columns `[domainId]` on the table `Runtime` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Runtime" ADD COLUMN     "domainId" TEXT;

-- CreateTable
CREATE TABLE "Domain" (
    "id" TEXT NOT NULL DEFAULT uuid_generate_v4(),
    "slug" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "name" TEXT,
    "version" TEXT NOT NULL DEFAULT 'v0.0.0',
    "installed" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Domain_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Runtime_domainId_key" ON "Runtime"("domainId");

-- AddForeignKey
ALTER TABLE "Runtime" ADD CONSTRAINT "Runtime_domainId_fkey" FOREIGN KEY ("domainId") REFERENCES "Domain"("id") ON DELETE SET NULL ON UPDATE CASCADE;
