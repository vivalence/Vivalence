-- CreateEnum
CREATE TYPE "QueueStatusEnum" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED');

-- CreateTable
CREATE TABLE "Queue" (
    "id" TEXT NOT NULL DEFAULT uuid_generate_v4(),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,
    "strategyId" TEXT NOT NULL,
    "status" "QueueStatusEnum" NOT NULL DEFAULT 'PENDING',
    "data" JSONB NOT NULL DEFAULT '{}',

    CONSTRAINT "Queue_pkey" PRIMARY KEY ("id")
);
