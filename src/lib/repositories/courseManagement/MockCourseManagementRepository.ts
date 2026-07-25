// src/lib/repositories/courseManagement/MockCourseManagementRepository.ts

import { ICourseManagementRepository } from "./ICourseManagementRepository";
import { CourseManagementItem, CoursePaginationResult } from "../../types/courseManagement";

const STORAGE_KEY_COURSES = "eduearn_mock_courses";

const DEFAULT_COURSES: CourseManagementItem[] = [
  {
    id: "course-t1",
    tutorId: "tutor-1",
    title: "Introduction to Calculus & Geometry Applications",
    subtitle: "Master the fundamentals of calculus and geometry.",
    description: "Detailed step-by-step guidance on calculus derivations, geometric layouts, and calculus limits.",
    category: "Mathematics",
    level: "beginner",
    language: "English",
    thumbnail: "/images/courses/math.png",
    price: 999,
    status: "published",
    tags: ["calculus", "geometry", "math"],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    studentsCount: 45,
    rating: 4.8,
  },
  {
    id: "course-t2",
    tutorId: "tutor-1",
    title: "UI/UX Figma Design: Layouts & Grgrids Essentials",
    subtitle: "Learn modern UI/UX design workflows in Figma.",
    description: "Learn to design responsive layouts, wireframes, style systems, and grid alignment techniques.",
    category: "Design",
    level: "intermediate",
    language: "English",
    thumbnail: "/images/courses/design.png",
    price: 1499,
    status: "published",
    tags: ["uiux", "figma", "design"],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    studentsCount: 32,
    rating: 4.9,
  },
  {
    id: "course-t3",
    tutorId: "tutor-1",
    title: "Advanced React Context & Local Storage States",
    subtitle: "Dive deep into modern React state management.",
    description: "Learn advanced context state handlers, local storage caching, sync event listeners, and hooks.",
    category: "Programming",
    level: "advanced",
    language: "English",
    thumbnail: "/images/courses/coding.png",
    price: 499,
    status: "draft",
    tags: ["react", "context", "state"],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    studentsCount: 0,
    rating: 0,
  },
];

export class MockCourseManagementRepository implements ICourseManagementRepository {
  private getLocalCourses(): CourseManagementItem[] {
    if (typeof window === "undefined") return DEFAULT_COURSES;
    try {
      const saved = localStorage.getItem(STORAGE_KEY_COURSES);
      if (saved) return JSON.parse(saved);
    } catch {}
    localStorage.setItem(STORAGE_KEY_COURSES, JSON.stringify(DEFAULT_COURSES));
    return DEFAULT_COURSES;
  }

  private saveLocalCourses(courses: CourseManagementItem[]) {
    if (typeof window === "undefined") return;
    localStorage.setItem(STORAGE_KEY_COURSES, JSON.stringify(courses));
  }

  async getCourses(
    tutorId: string,
    options: { search?: string; category?: string; page: number; limit: number }
  ): Promise<CoursePaginationResult> {
    let list = this.getLocalCourses().filter((c) => c.tutorId === tutorId || c.tutorId === "tutor-1");

    // Search query matches title, subtitle, category
    if (options.search) {
      const q = options.search.toLowerCase();
      list = list.filter(
        (c) =>
          c.title.toLowerCase().includes(q) ||
          (c.subtitle && c.subtitle.toLowerCase().includes(q)) ||
          c.category.toLowerCase().includes(q)
      );
    }

    // Category filter matches exact or normalized text
    if (options.category && options.category !== "All") {
      const cat = options.category.toLowerCase();
      list = list.filter((c) => c.category.toLowerCase() === cat);
    }

    // Sort by updated_at descending
    list.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

    const total = list.length;
    const offset = (options.page - 1) * options.limit;
    const courses = list.slice(offset, offset + options.limit);
    const pages = Math.ceil(total / options.limit);

    return {
      courses,
      pagination: {
        page: options.page,
        limit: options.limit,
        total,
        pages,
      },
    };
  }

  async createCourse(
    tutorId: string,
    courseData: Omit<CourseManagementItem, "id" | "tutorId" | "createdAt" | "updatedAt" | "studentsCount" | "rating">
  ): Promise<CourseManagementItem> {
    const newCourse: CourseManagementItem = {
      ...courseData,
      id: `course-${Date.now()}`,
      tutorId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      studentsCount: 0,
      rating: 0,
    };
    const list = this.getLocalCourses();
    list.unshift(newCourse);
    this.saveLocalCourses(list);
    return newCourse;
  }

  async updateCourse(
    courseId: string,
    updates: Partial<CourseManagementItem>
  ): Promise<CourseManagementItem> {
    const list = this.getLocalCourses();
    const idx = list.findIndex((c) => c.id === courseId);
    if (idx === -1) {
      throw new Error("Course not found");
    }
    const updated: CourseManagementItem = {
      ...list[idx],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    list[idx] = updated;
    this.saveLocalCourses(list);
    return updated;
  }

  async deleteCourse(courseId: string): Promise<boolean> {
    const list = this.getLocalCourses();
    const filtered = list.filter((c) => c.id !== courseId);
    this.saveLocalCourses(filtered);
    return true;
  }
}
