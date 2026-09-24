import { Enrollment } from '@/lib/types/enrollment';
import { IEnrollmentRepository } from './IEnrollmentRepository';
import { MOCK_COURSES, MOCK_TUTORS } from '@/constants/mockData';

export class MockEnrollmentRepository implements IEnrollmentRepository {
  private getLocalEnrollments(): Enrollment[] {
    if (typeof window === 'undefined') {
      // Server-side fallback or default mock data
      return [
        {
          id: 'mock-enroll-1',
          studentId: 'student-1',
          courseId: '00000000-0000-4000-8000-000000000001',
          enrolledAt: new Date().toISOString(),
          status: 'active',
          progressPercent: 35,
          completedLessons: ['course-1-lesson-1'],
          lastLessonId: 'course-1-lesson-2',
        }
      ];
    }

    const saved = localStorage.getItem('eduearn_enrollments');
    if (!saved) {
      const defaults: Enrollment[] = [
        {
          id: 'mock-enroll-1',
          studentId: 'student-1',
          courseId: '00000000-0000-4000-8000-000000000001',
          enrolledAt: new Date().toISOString(),
          status: 'active',
          progressPercent: 35,
          completedLessons: ['course-1-lesson-1'],
          lastLessonId: 'course-1-lesson-2',
        }
      ];
      localStorage.setItem('eduearn_enrollments', JSON.stringify(defaults));
      return defaults;
    }
    try {
      return JSON.parse(saved);
    } catch {
      return [];
    }
  }

  private saveLocalEnrollments(list: Enrollment[]) {
    if (typeof window === 'undefined') return;
    localStorage.setItem('eduearn_enrollments', JSON.stringify(list));
  }

  private attachCourseDetails(enrollment: Enrollment): Enrollment {
    const course = MOCK_COURSES.find((c) => c.id === enrollment.courseId || (c as any).legacyId === enrollment.courseId);
    if (!course) return enrollment;

    const tutor = MOCK_TUTORS.find((t) => t.id === course.tutorId);
    const tutorName = tutor ? tutor.fullName : 'Tutor Instructor';

    // Generate mock lessons
    const lessons = Array.from({ length: 5 }).map((_, idx) => ({
      id: `${enrollment.courseId}-lesson-${idx + 1}`,
      title: `Lesson ${idx + 1}`,
      order: idx + 1,
    }));

    // Read completed lessons from local progress
    let completedLessons: string[] = [];
    if (typeof window !== 'undefined') {
      const key = `eduearn_progress_${enrollment.courseId}`;
      try {
        const local = localStorage.getItem(key);
        if (local) completedLessons = JSON.parse(local);
      } catch {}
    } else {
      completedLessons = enrollment.completedLessons || [];
    }

    const progressPercent = lessons.length > 0 
      ? Math.min(100, Math.round((completedLessons.length / lessons.length) * 100))
      : 0;

    return {
      ...enrollment,
      completedLessons,
      progressPercent,
      status: progressPercent >= 100 ? 'completed' : 'active',
      lastLessonId: completedLessons[completedLessons.length - 1] || undefined,
      course: {
        id: course.id,
        title: course.title,
        instructor: tutorName,
        thumbnailUrl: course.thumbnail || 'https://api.dicebear.com/7.x/avataaars/svg?seed=course',
        category: course.category,
        lessons: lessons as any,
      },
    };
  }

  async enroll(studentId: string, courseId: string): Promise<Enrollment> {
    const list = this.getLocalEnrollments();
    const existing = list.find((e) => e.studentId === studentId && e.courseId === courseId);
    if (existing) return this.attachCourseDetails(existing);

    const newEnroll: Enrollment = {
      id: `enroll-${Date.now()}`,
      studentId,
      courseId,
      enrolledAt: new Date().toISOString(),
      status: 'active',
      progressPercent: 0,
      completedLessons: [],
    };
    list.push(newEnroll);
    this.saveLocalEnrollments(list);
    return this.attachCourseDetails(newEnroll);
  }

  async getEnrollment(studentId: string, courseId: string): Promise<Enrollment | null> {
    const list = this.getLocalEnrollments();
    const found = list.find((e) => e.studentId === studentId && e.courseId === courseId) || null;
    return found ? this.attachCourseDetails(found) : null;
  }

  async getEnrollments(studentId: string): Promise<Enrollment[]> {
    const list = this.getLocalEnrollments();
    return list
      .filter((e) => e.studentId === studentId)
      .map((e) => this.attachCourseDetails(e));
  }

  async updateProgress(
    studentId: string,
    courseId: string,
    lastLessonId: string,
    completedLessons: string[],
    progressPercent: number
  ): Promise<Enrollment> {
    const list = this.getLocalEnrollments();
    const idx = list.findIndex((e) => e.studentId === studentId && e.courseId === courseId);
    if (idx === -1) {
      throw new Error('Enrollment not found');
    }

    const updated: Enrollment = {
      ...list[idx],
      lastLessonId,
      completedLessons,
      progressPercent,
      status: progressPercent >= 100 ? 'completed' : 'active',
      completedAt: progressPercent >= 100 ? new Date().toISOString() : undefined,
    };
    list[idx] = updated;
    this.saveLocalEnrollments(list);
    return this.attachCourseDetails(updated);
  }
}
