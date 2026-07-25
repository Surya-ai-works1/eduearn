// src/lib/services/courseDetailsService.ts

import { Course } from '@/lib/types/course';
import { CourseDetailsRepository } from '@/lib/repositories/courseDetails';

/**
 * Service layer for Course Details.
 * Delegates data access to the appropriate repository based on IS_MOCK.
 */
export const courseDetailsService = {
  /** Retrieve full course details including lessons */
  async getCourseDetails(courseId: string): Promise<Course | null> {
    return await CourseDetailsRepository.getCourseDetails(courseId);
  },

  /** Mark a lesson as completed for the current learner */
  async markLessonComplete(courseId: string, lessonId: string): Promise<void> {
    await CourseDetailsRepository.markLessonComplete(courseId, lessonId);
  },
};
