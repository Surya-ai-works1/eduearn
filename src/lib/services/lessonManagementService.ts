// src/lib/services/lessonManagementService.ts

import { LessonManagementRepository } from "../repositories/lessonManagement";
import { LessonManagementItem } from "../types/lessonManagement";

export class LessonManagementService {
  async getLessons(courseId: string): Promise<LessonManagementItem[]> {
    return LessonManagementRepository.getLessons(courseId);
  }

  async createLesson(
    courseId: string,
    lessonData: Omit<LessonManagementItem, "id" | "courseId" | "createdAt">
  ): Promise<LessonManagementItem> {
    // 1. Enforce validation rules
    this.validateLessonData(lessonData);

    // 2. Prevent duplicate order
    const existingLessons = await LessonManagementRepository.getLessons(courseId);
    if (existingLessons.some((l) => l.order === lessonData.order)) {
      throw new Error(`Duplicate order prevention: A lesson with order ${lessonData.order} already exists in this course.`);
    }

    return LessonManagementRepository.createLesson(courseId, lessonData);
  }

  async updateLesson(
    courseId: string,
    lessonId: string,
    updates: Partial<LessonManagementItem>
  ): Promise<LessonManagementItem> {
    // 1. Validate fields if present
    this.validateLessonDataPartial(updates);

    // 2. Prevent duplicate order on update
    if (updates.order !== undefined) {
      const existingLessons = await LessonManagementRepository.getLessons(courseId);
      if (existingLessons.some((l) => l.id !== lessonId && l.order === updates.order)) {
        throw new Error(`Duplicate order prevention: A lesson with order ${updates.order} already exists in this course.`);
      }
    }

    return LessonManagementRepository.updateLesson(lessonId, updates);
  }

  async deleteLesson(lessonId: string): Promise<boolean> {
    return LessonManagementRepository.deleteLesson(lessonId);
  }

  async updateLessonOrder(courseId: string, orderedIds: string[]): Promise<boolean> {
    if (!courseId) {
      throw new Error("Course ID is required for reordering lessons");
    }
    if (!orderedIds || orderedIds.length === 0) {
      throw new Error("No lesson IDs provided for reordering");
    }
    return LessonManagementRepository.updateLessonOrder(courseId, orderedIds);
  }

  private validateLessonData(
    l: Omit<LessonManagementItem, "id" | "courseId" | "createdAt">
  ) {
    if (!l.title || !l.title.trim()) {
      throw new Error("Lesson title is required");
    }
    if (l.order === undefined || l.order <= 0) {
      throw new Error("Valid lesson order is required and must be greater than 0");
    }
    if (l.lessonType === "Video" && l.videoUrl) {
      this.validateVideoUrl(l.videoUrl);
    }
    const allowedStatuses = ["published", "draft"];
    if (l.status && !allowedStatuses.includes(l.status)) {
      throw new Error("Invalid lesson status");
    }
  }

  private validateLessonDataPartial(l: Partial<LessonManagementItem>) {
    if (l.title !== undefined && (!l.title || !l.title.trim())) {
      throw new Error("Lesson title is required");
    }
    if (l.order !== undefined && l.order <= 0) {
      throw new Error("Valid lesson order is required and must be greater than 0");
    }
    if (l.videoUrl !== undefined && l.videoUrl) {
      this.validateVideoUrl(l.videoUrl);
    }
    if (l.status !== undefined) {
      const allowedStatuses = ["published", "draft"];
      if (!allowedStatuses.includes(l.status)) {
        throw new Error("Invalid lesson status");
      }
    }
  }

  private validateVideoUrl(url: string) {
    if (!url.startsWith("http://") && !url.startsWith("https://") && !url.startsWith("/")) {
      throw new Error("Invalid video URL format. Must start with http://, https:// or be a valid path");
    }
  }
}

export const lessonManagementService = new LessonManagementService();
