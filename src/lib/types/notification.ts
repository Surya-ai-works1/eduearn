// src/lib/types/notification.ts

export type NotificationType = "Course" | "Assignment" | "Quiz" | "Certificate" | "System" | "Live Class" | "Payment" | "Tutor" | "Admin";

export interface Notification {
  id: string;
  studentId: string;
  title: string;
  message: string;
  type: NotificationType;
  isRead: boolean;
  createdAt: string; // ISO date
  actionUrl?: string;
}

export type ActivityType =
  | "course_enrolled"
  | "lesson_completed"
  | "assignment_submitted"
  | "quiz_completed"
  | "certificate_earned";

export interface Activity {
  id: string;
  studentId: string;
  type: ActivityType;
  title: string;
  description: string;
  createdAt: string; // ISO date
}
