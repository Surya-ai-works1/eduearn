import { Enrollment } from '@/lib/types/enrollment';
import { EnrollmentRepository } from '@/lib/repositories/enrollment';

export const enrollmentService = {
  async enrollStudent(studentId: string, courseId: string): Promise<Enrollment> {
    return await EnrollmentRepository.enroll(studentId, courseId);
  },

  async getEnrollment(studentId: string, courseId: string): Promise<Enrollment | null> {
    return await EnrollmentRepository.getEnrollment(studentId, courseId);
  },

  async getEnrollments(studentId: string): Promise<Enrollment[]> {
    return await EnrollmentRepository.getEnrollments(studentId);
  },

  async updateProgress(
    studentId: string,
    courseId: string,
    lastLessonId: string,
    completedLessons: string[],
    progressPercent: number
  ): Promise<Enrollment> {
    return await EnrollmentRepository.updateProgress(
      studentId,
      courseId,
      lastLessonId,
      completedLessons,
      progressPercent
    );
  }
};
