-- CreateEnum
CREATE TYPE "UserRolesEnum" AS ENUM ('ADMIN', 'USER', 'GUEST');

-- AlterTable
ALTER TABLE "AppUser" ADD COLUMN     "roles" "UserRolesEnum"[];
