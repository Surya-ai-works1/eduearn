// src/lib/types/assignment.ts

export interface Assignment {
  id: string;
  courseId: string;
  courseTitle?: string;
  title: string;
  description?: string;
  dueDate?: string; // ISO date string or formatted date
  maxMarks?: number;
  attachments?: string[]; // Array of file urls/guidelines
  createdAt: string;
}

export interface AssignmentSubmission {
  id: string;
  assignmentId: string;
  studentId: string;
  submittedAt: string;
  submissionType: "file" | "url" | "text";
  submissionUrl: string;
  status: "Pending" | "Submitted" | "Graded";
  grade?: string;
  feedback?: string;
}
