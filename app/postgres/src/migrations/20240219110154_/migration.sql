-- AlterTable
ALTER TABLE "AppUser" ALTER COLUMN "roles" SET DEFAULT ARRAY['USER']::"UserRolesEnum"[];
