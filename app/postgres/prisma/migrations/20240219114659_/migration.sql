-- AlterTable
ALTER TABLE "AppUser" ADD COLUMN     "roles" "UserRolesEnum"[] DEFAULT ARRAY['USER']::"UserRolesEnum"[];
