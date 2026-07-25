import { Course, Lesson } from '@/lib/types/course';
import { MOCK_COURSES } from '@/constants/mockData';
import { getCompletedLessonIds, addCompletedLessonId } from '@/lib/utils/localProgress';
import { ICourseDetailsRepository } from './ICourseDetailsRepository';

/**
 * Mock implementation for Course Details.
 * Returns a Course built from MOCK_COURSES and generates simple mock lessons.
 * Progress is stored in localStorage via the localProgress utility.
 */
export class MockCourseDetailsRepository implements ICourseDetailsRepository {
  async getCourseDetails(courseId: string): Promise<Course | null> {
    const course = MOCK_COURSES.find((c) => c.id === courseId);
    if (!course) return null;

    // Generate mock lessons (5 lessons per course for demo purposes)
    const lessons: Lesson[] = Array.from({ length: 5 }).map((_, idx) => {
      const lessonId = `${courseId}-lesson-${idx + 1}`;
      const completedIds = getCompletedLessonIds(courseId);
      return {
        id: lessonId,
        title: `Lesson ${idx + 1}`,
        description: `Description for lesson ${idx + 1}`,
        duration: 10 + idx * 5,
        order: idx + 1,
        type: 'video',
        videoUrl: `https://example.com/videos/${lessonId}.mp4`,
        resources: [],
        isCompleted: completedIds.includes(lessonId),
      } as Lesson;
    });

    return {
      id: course.id,
      title: course.title,
      description: course.description || "",
      instructor: course.tutorName || "Tutor Instructor",
      thumbnailUrl: course.thumbnail || "",
      category: course.category || "General",
      level: course.level || "Beginner",
      language: course.language || "English",
      duration: course.duration ? parseInt(course.duration) * 60 : 600,
      rating: course.rating || 5.0,
      totalLessons: course.lessonsCount || lessons.length,
      enrolledCount: course.studentsCount || 0,
      lastUpdated: course.createdAt || new Date().toISOString(),
      lessons,
    };
  }

  async markLessonComplete(courseId: string, lessonId: string): Promise<void> {
    // Persist in localStorage; no validation needed for mock mode
    addCompletedLessonId(courseId, lessonId);
  }
}
