/*
  Warnings:

  - Added the required column `category` to the `Course` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Course" ADD COLUMN     "category" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "fav" TEXT[] DEFAULT ARRAY[]::TEXT[];
