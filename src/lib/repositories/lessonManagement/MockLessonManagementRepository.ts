// src/lib/repositories/lessonManagement/MockLessonManagementRepository.ts

import { ILessonManagementRepository } from "./ILessonManagementRepository";
import { LessonManagementItem } from "../../types/lessonManagement";

const STORAGE_KEY_LESSONS = "eduearn_mock_lessons";

const DEFAULT_LESSONS: LessonManagementItem[] = [
  {
    id: "les-t1",
    courseId: "course-t1",
    title: "Overview of Syllabus Milestones",
    description: "Overview of what we will cover in the mathematics syllabus.",
    lessonType: "Video",
    videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
    duration: 10,
    order: 1,
    resources: ["https://example.com/math-syllabus.pdf"],
    status: "published",
    createdAt: new Date().toISOString(),
  },
  {
    id: "les-t2",
    courseId: "course-t1",
    title: "Downloading Core Worksheets",
    description: "Detailed sheets and exercises for the first week.",
    lessonType: "PDF",
    videoUrl: "",
    duration: 2,
    order: 2,
    resources: ["https://example.com/math-worksheet1.pdf"],
    status: "published",
    createdAt: new Date().toISOString(),
  },
  {
    id: "lesson-1",
    courseId: "course-t2",
    title: "Introduction to Syllabus Modules",
    description: "Introduction to UI/UX and Figma course goals.",
    lessonType: "Video",
    videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
    duration: 6,
    order: 1,
    resources: [],
    status: "published",
    createdAt: new Date().toISOString(),
  },
  {
    id: "lesson-2",
    courseId: "course-t2",
    title: "Setting Up Your Workspace & Tools",
    description: "Setting up your Figma sandbox layout grids.",
    lessonType: "Video",
    videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
    duration: 12,
    order: 2,
    resources: [],
    status: "published",
    createdAt: new Date().toISOString(),
  },
];

export class MockLessonManagementRepository implements ILessonManagementRepository {
  private getLocalLessons(): LessonManagementItem[] {
    if (typeof window === "undefined") return DEFAULT_LESSONS;
    try {
      const saved = localStorage.getItem(STORAGE_KEY_LESSONS);
      if (saved) return JSON.parse(saved);
    } catch {}
    localStorage.setItem(STORAGE_KEY_LESSONS, JSON.stringify(DEFAULT_LESSONS));
    return DEFAULT_LESSONS;
  }

  private saveLocalLessons(lessons: LessonManagementItem[]) {
    if (typeof window === "undefined") return;
    localStorage.setItem(STORAGE_KEY_LESSONS, JSON.stringify(lessons));
  }

  async getLessons(courseId: string): Promise<LessonManagementItem[]> {
    const list = this.getLocalLessons().filter((l) => l.courseId === courseId);
    list.sort((a, b) => a.order - b.order);
    return list;
  }

  async createLesson(
    courseId: string,
    lessonData: Omit<LessonManagementItem, "id" | "courseId" | "createdAt">
  ): Promise<LessonManagementItem> {
    const newLesson: LessonManagementItem = {
      ...lessonData,
      id: `lesson-${Date.now()}`,
      courseId,
      createdAt: new Date().toISOString(),
    };
    const list = this.getLocalLessons();
    list.push(newLesson);
    this.saveLocalLessons(list);
    return newLesson;
  }

  async updateLesson(
    lessonId: string,
    updates: Partial<LessonManagementItem>
  ): Promise<LessonManagementItem> {
    const list = this.getLocalLessons();
    const idx = list.findIndex((l) => l.id === lessonId);
    if (idx === -1) {
      throw new Error("Lesson not found");
    }
    const updated: LessonManagementItem = {
      ...list[idx],
      ...updates,
    };
    list[idx] = updated;
    this.saveLocalLessons(list);
    return updated;
  }

  async deleteLesson(lessonId: string): Promise<boolean> {
    const list = this.getLocalLessons();
    const filtered = list.filter((l) => l.id !== lessonId);
    this.saveLocalLessons(filtered);
    return true;
  }

  async updateLessonOrder(courseId: string, orderedIds: string[]): Promise<boolean> {
    const list = this.getLocalLessons();
    orderedIds.forEach((id, idx) => {
      const match = list.find((l) => l.id === id && l.courseId === courseId);
      if (match) {
        match.order = idx + 1;
      }
    });
    this.saveLocalLessons(list);
    return true;
  }
}
