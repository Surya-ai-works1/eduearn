// src/lib/types/quizManagement.ts

export interface QuizQuestion {
  id: string;
  text: string;
  type: "single" | "multiple";
  options: string[];
  correctAnswers: number[]; // Index of correct option(s)
  explanation?: string;
}

export interface QuizItem {
  id: string;
  courseId: string;
  title: string;
  description: string;
  passingScore: number; // e.g. 60
  timeLimit: number; // in minutes (Saved in Mock, default 30 in Supabase)
  questions: QuizQuestion[];
  status: "published" | "draft"; // Saved in Mock, default "published" in Supabase
  createdAt: string;
}

export interface QuizAttemptItem {
  id: string;
  quizId: string;
  quizTitle: string;
  courseTitle: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  score: number;
  passed: boolean;
  completedAt: string;
}

export interface QuizPaginationResult {
  items: QuizItem[];
  total: number;
  page: number;
  pages: number;
}
