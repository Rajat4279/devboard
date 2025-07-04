/*
  Warnings:

  - The `role` column on the `Collaborator` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('admin', 'member');

-- AlterTable
ALTER TABLE "Collaborator" DROP COLUMN "role",
ADD COLUMN     "role" "UserRole" NOT NULL DEFAULT 'member';
