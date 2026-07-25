// src/lib/types/assignmentManagement.ts

export interface AssignmentItem {
  id: string;
  courseId: string;
  title: string;
  description: string; // Instructions
  fileUrl: string; // File attachments URL
  dueDate: string | null;
  status: "published" | "draft"; // Mock Mode only, default "published" in Supabase
  createdAt: string;
}

export interface AssignmentSubmissionItem {
  id: string;
  assignmentId: string;
  studentId: string;
  studentName?: string;
  studentEmail?: string;
  assignmentTitle?: string;
  courseTitle?: string;
  content: string;
  fileUrl: string;
  grade: string;
  feedback: string;
  createdAt: string;
}

export interface AssignmentPaginationResult {
  items: AssignmentItem[];
  total: number;
  page: number;
  pages: number;
}
