/*
  Warnings:

  - The primary key for the `Collaborator` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `iid` on the `Collaborator` table. All the data in the column will be lost.
  - The required column `id` was added to the `Collaborator` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.

*/
-- AlterTable
ALTER TABLE "Collaborator" DROP CONSTRAINT "Collaborator_pkey",
DROP COLUMN "iid",
ADD COLUMN     "id" TEXT NOT NULL,
ADD CONSTRAINT "Collaborator_pkey" PRIMARY KEY ("id");
