/*
  Warnings:

  - A unique constraint covering the columns `[enrollmentId,lessonId]` on the table `Progress` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Progress_enrollmentId_lessonId_idx";

-- CreateIndex
CREATE UNIQUE INDEX "Progress_enrollmentId_lessonId_key" ON "Progress"("enrollmentId", "lessonId");
