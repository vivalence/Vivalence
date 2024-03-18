/*
  Warnings:

  - The values [COMPLETED] on the enum `QueueStatusEnum` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "QueueStatusEnum_new" AS ENUM ('PENDING', 'PROCESSING', 'DONE', 'FAILED');
ALTER TABLE "Queue" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Queue" ALTER COLUMN "status" TYPE "QueueStatusEnum_new" USING ("status"::text::"QueueStatusEnum_new");
ALTER TYPE "QueueStatusEnum" RENAME TO "QueueStatusEnum_old";
ALTER TYPE "QueueStatusEnum_new" RENAME TO "QueueStatusEnum";
DROP TYPE "QueueStatusEnum_old";
ALTER TABLE "Queue" ALTER COLUMN "status" SET DEFAULT 'PENDING';
COMMIT;
