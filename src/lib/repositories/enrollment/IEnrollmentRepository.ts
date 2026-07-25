import { Enrollment } from '@/lib/types/enrollment';

export interface IEnrollmentRepository {
  enroll(studentId: string, courseId: string): Promise<Enrollment>;
  getEnrollment(studentId: string, courseId: string): Promise<Enrollment | null>;
  getEnrollments(studentId: string): Promise<Enrollment[]>;
  updateProgress(
    studentId: string,
    courseId: string,
    lastLessonId: string,
    completedLessons: string[],
    progressPercent: number
  ): Promise<Enrollment>;
}
