import { Course } from './course';

export interface Enrollment {
  id: string;
  studentId: string;
  courseId: string;
  enrolledAt: string; // ISO date string
  status: 'active' | 'completed';
  lastLessonId?: string;
  progressPercent: number; // 0 to 100
  completedLessons: string[]; // array of completed lesson IDs
  completedAt?: string; // ISO date string
  course?: Partial<Course>; // Joined course details
}
