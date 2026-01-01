-- DropIndex
DROP INDEX "Progress_enrollmentId_idx";

-- CreateIndex
CREATE INDEX "Progress_enrollmentId_lessonId_idx" ON "Progress"("enrollmentId", "lessonId");
