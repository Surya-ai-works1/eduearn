export interface ICourseDetailsRepository {
  /**
   * Retrieve full course details including curriculum.
   */
  getCourseDetails(courseId: string): Promise<import('../../types/course').Course | null>;

  /**
   * Mark a lesson as completed for the given course.
   */
  markLessonComplete(courseId: string, lessonId: string): Promise<void>;
}
