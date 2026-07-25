// src/lib/services/courseManagementService.ts

import { CourseManagementRepository } from "../repositories/courseManagement";
import { CourseManagementItem, CoursePaginationResult } from "../types/courseManagement";

export class CourseManagementService {
  async getCourses(
    tutorId: string,
    options: { search?: string; category?: string; page: number; limit: number }
  ): Promise<CoursePaginationResult> {
    const page = Math.max(1, options.page);
    const limit = Math.max(1, Math.min(100, options.limit));
    return CourseManagementRepository.getCourses(tutorId, {
      ...options,
      page,
      limit,
    });
  }

  async createCourse(
    tutorId: string,
    courseData: Omit<CourseManagementItem, "id" | "tutorId" | "createdAt" | "updatedAt" | "studentsCount" | "rating">
  ): Promise<CourseManagementItem> {
    // 1. Business Validation
    this.validateCourseData(courseData);

    // Initial status for new courses must be draft or pending
    if (courseData.status !== "draft" && courseData.status !== "pending") {
      throw new Error("Initial course status must be 'draft' or 'pending'");
    }

    return CourseManagementRepository.createCourse(tutorId, courseData);
  }

  async updateCourse(
    courseId: string,
    updates: Partial<CourseManagementItem>,
    tutorStatus?: string
  ): Promise<CourseManagementItem> {
    // 1. Validate status transitions
    if (updates.status) {
      if (tutorStatus === "suspended" || tutorStatus === "blacklisted") {
        throw new Error("Action denied: Tutor account is suspended or blacklisted.");
      }

      const allowedStatuses = ["published", "draft", "archived", "pending"];
      if (!allowedStatuses.includes(updates.status)) {
        throw new Error(`Invalid target status: ${updates.status}`);
      }
    }

    // 2. Validate input fields if present
    this.validateCourseDataPartial(updates);

    return CourseManagementRepository.updateCourse(courseId, updates);
  }

  async deleteCourse(courseId: string): Promise<boolean> {
    return CourseManagementRepository.deleteCourse(courseId);
  }

  private validateCourseData(
    c: Omit<CourseManagementItem, "id" | "tutorId" | "createdAt" | "updatedAt" | "studentsCount" | "rating">
  ) {
    if (!c.title || !c.title.trim()) {
      throw new Error("Course title is required");
    }
    if (c.title.length < 5) {
      throw new Error("Course title must be at least 5 characters long");
    }
    if (!c.category || !c.category.trim()) {
      throw new Error("Course category is required");
    }
    const allowedLevels = ["beginner", "intermediate", "advanced"];
    if (!c.level || !allowedLevels.includes(c.level.toLowerCase())) {
      throw new Error("Course level must be beginner, intermediate, or advanced");
    }
    if (c.price === undefined || c.price < 0) {
      throw new Error("Course price must be a non-negative number");
    }
    const allowedStatuses = ["published", "draft", "archived", "pending"];
    if (!c.status || !allowedStatuses.includes(c.status)) {
      throw new Error("Invalid course status");
    }
  }

  private validateCourseDataPartial(c: Partial<CourseManagementItem>) {
    if (c.title !== undefined) {
      if (!c.title || !c.title.trim()) {
        throw new Error("Course title is required");
      }
      if (c.title.length < 5) {
        throw new Error("Course title must be at least 5 characters long");
      }
    }
    if (c.category !== undefined && (!c.category || !c.category.trim())) {
      throw new Error("Course category is required");
    }
    if (c.level !== undefined) {
      const allowedLevels = ["beginner", "intermediate", "advanced"];
      if (!allowedLevels.includes(c.level.toLowerCase())) {
        throw new Error("Course level must be beginner, intermediate, or advanced");
      }
    }
    if (c.price !== undefined && c.price < 0) {
      throw new Error("Course price must be a non-negative number");
    }
  }
}

export const courseManagementService = new CourseManagementService();
