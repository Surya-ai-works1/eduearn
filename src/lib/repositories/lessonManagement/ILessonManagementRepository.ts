// src/lib/repositories/lessonManagement/ILessonManagementRepository.ts

import { LessonManagementItem } from "../../types/lessonManagement";

export interface ILessonManagementRepository {
  getLessons(courseId: string): Promise<LessonManagementItem[]>;

  createLesson(
    courseId: string,
    lessonData: Omit<LessonManagementItem, "id" | "courseId" | "createdAt">
  ): Promise<LessonManagementItem>;

  updateLesson(
    lessonId: string,
    updates: Partial<LessonManagementItem>
  ): Promise<LessonManagementItem>;

  deleteLesson(lessonId: string): Promise<boolean>;

  updateLessonOrder(courseId: string, orderedIds: string[]): Promise<boolean>;
}
