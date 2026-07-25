// src/lib/repositories/courseManagement/ICourseManagementRepository.ts

import { CourseManagementItem, CoursePaginationResult } from "../../types/courseManagement";

export interface ICourseManagementRepository {
  getCourses(
    tutorId: string,
    options: { search?: string; category?: string; page: number; limit: number }
  ): Promise<CoursePaginationResult>;

  createCourse(
    tutorId: string,
    courseData: Omit<CourseManagementItem, "id" | "tutorId" | "createdAt" | "updatedAt" | "studentsCount" | "rating">
  ): Promise<CourseManagementItem>;

  updateCourse(
    courseId: string,
    updates: Partial<CourseManagementItem>
  ): Promise<CourseManagementItem>;

  deleteCourse(courseId: string): Promise<boolean>;
}
