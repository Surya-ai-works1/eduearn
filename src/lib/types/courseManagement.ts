// src/lib/types/courseManagement.ts

export interface CourseManagementItem {
  id: string;
  tutorId: string;
  title: string;
  subtitle: string;
  description: string;
  category: string;
  level: string;
  language: string; // Saved in Mock mode, omitted or defaulted in Supabase mode
  thumbnail: string;
  price: number;
  status: "published" | "draft" | "archived" | "pending";
  tags: string[]; // Saved in Mock mode, omitted or empty in Supabase mode
  createdAt: string;
  updatedAt: string;
  studentsCount: number;
  rating: number;
}

export interface CoursePaginationResult {
  courses: CourseManagementItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}
