// src/lib/types/lessonManagement.ts

export interface LessonManagementItem {
  id: string;
  courseId: string;
  title: string;
  description: string; // Saved in database
  lessonType: string; // Saved in Mock mode, default "Video" in Supabase mode
  videoUrl: string; // Saved in database (video_url)
  duration: number; // Saved in database (duration)
  order: number; // Saved in database (lesson_order)
  resources: string[]; // Saved in Mock mode, empty array in Supabase mode
  status: "published" | "draft"; // Saved in Mock mode, default "published" in Supabase mode
  createdAt: string;
}
