// src/lib/repositories/studentDashboard/MockStudentDashboardRepository.ts

import { MOCK_COURSES } from '@/constants/mockData';
import { getCourseThumbnail } from '@/lib/courseThumbnailRegistry';

/**
 * Mock implementation of the Student Dashboard repository.
 * Returns static data derived from the existing mock data files.
 */
export class MockStudentDashboardRepository {
  async getDashboard(_userId: string) {
    // Selected mock courses for the dashboard (mirrors the previous hard‑coded defaults).
    const enrolledIds = [
      'course-python',
      'course-keyboard',
      'course-kuchipudi',
      'course-prompt',
      'course-drawing',
      'course-photography',
    ];

    const enrolledCourses = MOCK_COURSES.filter((c) => enrolledIds.includes(c.id))
      .map((c) => ({
        id: c.id,
        title: c.title,
        tutorName: c.tutorName,
        thumbnail: c.thumbnail,
        progress: 0,
        lessonsCount: c.lessonsCount ?? 0,
        completedLessons: 0,
        duration: c.duration,
        estimatedCompletion: 'In Progress',
        category: c.category,
        lastStudied: 'Never',
      }));

    // Wishlist – use the same items as the original UI defaults.
    const wishlist = [MOCK_COURSES[2], MOCK_COURSES[8]].map((c) => ({
      id: c.id,
      title: c.title,
      tutorId: c.tutorId,
      tutorName: c.tutorName,
      category: c.category,
      categoryId: c.category?.toLowerCase().replace(/\s+/g, '-') ?? '',
      subjectId: c.subjectId,
      subjectName: c.subjectName,
      price: Number(c.price),
      rating: 4.8,
      duration: c.duration,
      lessonsCount: c.lessonsCount ?? 0,
      studentsCount: 150,
      thumbnail: c.thumbnail,
      level: c.level || 'Beginner',
      language: 'English',
      createdAt: c.createdAt,
      description: c.description || '',
      status: c.status || 'published',
    }));

    // Minimal placeholder data for the remaining sections.
    const notifications: any[] = [];
    const certificates: any[] = [];
    const assignments: any[] = [];

    const weeklyQuizzes = [
      {
        id: "wq-math",
        title: "Derivatives & Calculus Challenge",
        subject: "Mathematics",
        difficulty: "Intermediate",
        questionsCount: 3,
        timeLimit: "3 mins",
        rewardCoins: 50,
        questions: [],
      },
      {
        id: "wq-python",
        title: "Python Control Flow & Loops",
        subject: "Python Programming",
        difficulty: "Beginner",
        questionsCount: 3,
        timeLimit: "2 mins",
        rewardCoins: 40,
        questions: [],
      },
      {
        id: "wq-ai",
        title: "AI & Prompt Engineering Basics",
        subject: "AI Prompt Engineering",
        difficulty: "Advanced",
        questionsCount: 3,
        timeLimit: "3 mins",
        rewardCoins: 60,
        questions: [],
      },
      {
        id: "wq-photo",
        title: "Camera Exposure & Composition",
        subject: "Photography",
        difficulty: "Intermediate",
        questionsCount: 3,
        timeLimit: "3 mins",
        rewardCoins: 50,
        questions: [],
      },
    ];

    return {
      enrolledCourses,
      wishlist,
      notifications,
      certificates,
      assignments,
      weeklyQuizzes,
    };
  }
}
