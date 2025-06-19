/*
  Warnings:

  - You are about to drop the column `apiKeys` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "apiKeys",
ADD COLUMN     "apiKey" TEXT NOT NULL DEFAULT '';
