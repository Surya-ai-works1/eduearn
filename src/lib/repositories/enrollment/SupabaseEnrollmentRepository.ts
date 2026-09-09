import { Enrollment } from '@/lib/types/enrollment';
import { IEnrollmentRepository } from './IEnrollmentRepository';
import { createClient as createBrowserClient } from '@/lib/supabase/client';

async function getSupabaseClient() {
  if (typeof window === 'undefined') {
    const { createClient: createServerClient } = await import('@/lib/supabase/server');
    const client = await createServerClient();
    return client; // may be null if unconfigured
  }
  return createBrowserClient();
}


export class SupabaseEnrollmentRepository implements IEnrollmentRepository {
  private async attachCourseDetails(supabase: any, enrollment: Enrollment): Promise<Enrollment> {
    try {
      const { data: dbCourse } = await supabase
        .from('courses')
        .select('id, title, category, thumbnail, tutor_id')
        .eq('id', enrollment.courseId)
        .maybeSingle();

      if (!dbCourse) return enrollment;

      let tutorName = 'Tutor Instructor';
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name, display_name')
        .eq('id', dbCourse.tutor_id)
        .maybeSingle();

      if (profile) {
        tutorName = profile.full_name || profile.display_name || tutorName;
      }

      // Fetch lessons for lesson list
      const { data: dbLessons } = await supabase
        .from('lessons')
        .select('id, title, lesson_order, position')
        .eq('course_id', dbCourse.id);

      const sortedLessons = (dbLessons || []).sort((a: any, b: any) => 
        (a.position ?? a.lesson_order ?? 0) - (b.position ?? b.lesson_order ?? 0)
      );

      const lessons = sortedLessons.map((l: any) => ({
        id: l.id,
        title: l.title,
        order: l.position ?? l.lesson_order ?? 0,
      }));

      return {
        ...enrollment,
        course: {
          id: dbCourse.id,
          title: dbCourse.title,
          instructor: tutorName,
          thumbnailUrl: dbCourse.thumbnail || 'https://api.dicebear.com/7.x/avataaars/svg?seed=course',
          category: dbCourse.category,
          lessons: lessons as any,
        },
      };
    } catch (err) {
      console.warn("Failed to attach course details to enrollment:", err);
      return enrollment;
    }
  }

  async enroll(studentId: string, courseId: string): Promise<Enrollment> {
    const supabase = await getSupabaseClient();
    
    // Check if already enrolled
    const { data: existing, error: findErr } = await supabase
      .from('enrollments')
      .select('*')
      .eq('learner_id', studentId)
      .eq('course_id', courseId)
      .maybeSingle();

    if (findErr) throw findErr;
    if (existing) {
      const enrollment = {
        id: existing.id,
        studentId: existing.learner_id,
        courseId: existing.course_id,
        enrolledAt: existing.created_at,
        status: ((existing.progress ?? 0) >= 100 ? 'completed' : 'active') as 'completed' | 'active',
        progressPercent: Number(existing.progress ?? 0),
        completedLessons: [],
      };
      return await this.attachCourseDetails(supabase, enrollment);
    }

    const { data: enrolled, error: enrollErr } = await supabase
      .from('enrollments')
      .insert({
        learner_id: studentId,
        course_id: courseId,
        progress: 0,
      })
      .select()
      .single();

    if (enrollErr) throw enrollErr;

    // Trigger enrollment email asynchronously (if profile exists)
    (async () => {
      try {
        const [{ data: profile }, { data: course }] = await Promise.all([
          supabase.from("profiles").select("email, full_name").eq("id", studentId).maybeSingle(),
          supabase.from("courses").select("title").eq("id", courseId).maybeSingle(),
        ]);

        if (profile?.email && course?.title) {
          const { emailClient } = await import("../../email/client");
          await emailClient.triggerEnrollmentEmail(
            profile.email,
            profile.full_name || "Student",
            course.title
          );
        }
      } catch (err) {
        console.warn("Failed to trigger enrollment confirmation email:", err);
      }
    })();

    const enrollment = {
      id: enrolled.id,
      studentId: enrolled.learner_id,
      courseId: enrolled.course_id,
      enrolledAt: enrolled.created_at,
      status: 'active' as const,
      progressPercent: 0,
      completedLessons: [],
    };
    return await this.attachCourseDetails(supabase, enrollment);
  }

  async getEnrollment(studentId: string, courseId: string): Promise<Enrollment | null> {
    const supabase = await getSupabaseClient();
    const { data, error } = await supabase
      .from('enrollments')
      .select('*')
      .eq('learner_id', studentId)
      .eq('course_id', courseId)
      .maybeSingle();

    if (error) throw error;
    if (!data) return null;

    let completedLessons: string[] = [];
    if (typeof window !== 'undefined') {
      const key = `eduearn_progress_${courseId}`;
      try {
        const local = localStorage.getItem(key);
        if (local) completedLessons = JSON.parse(local);
      } catch {}
    }

    const enrollment = {
      id: data.id,
      studentId: data.learner_id,
      courseId: data.course_id,
      enrolledAt: data.created_at,
      status: ((data.progress ?? 0) >= 100 ? 'completed' : 'active') as 'completed' | 'active',
      progressPercent: Number(data.progress ?? 0),
      completedLessons,
    };
    return await this.attachCourseDetails(supabase, enrollment);
  }

  async getEnrollments(studentId: string): Promise<Enrollment[]> {
    const supabase = await getSupabaseClient();
    const { data, error } = await supabase
      .from('enrollments')
      .select('*')
      .eq('learner_id', studentId);

    if (error) throw error;
    if (!data) return [];

    const mapped = data.map((item: any) => {
      let completedLessons: string[] = [];
      if (typeof window !== 'undefined') {
        const key = `eduearn_progress_${item.course_id}`;
        try {
          const local = localStorage.getItem(key);
          if (local) completedLessons = JSON.parse(local);
        } catch {}
      }

      return {
        id: item.id,
        studentId: item.learner_id,
        courseId: item.course_id,
        enrolledAt: item.created_at,
        status: ((item.progress ?? 0) >= 100 ? 'completed' : 'active') as 'completed' | 'active',
        progressPercent: Number(item.progress ?? 0),
        completedLessons,
      };
    });

    return await Promise.all(mapped.map((e: any) => this.attachCourseDetails(supabase, e)));
  }

  async updateProgress(
    studentId: string,
    courseId: string,
    lastLessonId: string,
    completedLessons: string[],
    progressPercent: number
  ): Promise<Enrollment> {
    const supabase = await getSupabaseClient();
    const { data: enrollment, error: fetchErr } = await supabase
      .from('enrollments')
      .select('id')
      .eq('learner_id', studentId)
      .eq('course_id', courseId)
      .single();

    if (fetchErr) throw fetchErr;

    const { data: updated, error: updateErr } = await supabase
      .from('enrollments')
      .update({ progress: progressPercent })
      .eq('id', enrollment.id)
      .select()
      .single();

    if (updateErr) throw updateErr;

    // Update local storage too if on client side
    if (typeof window !== 'undefined') {
      const key = `eduearn_progress_${courseId}`;
      localStorage.setItem(key, JSON.stringify(completedLessons));
    }

    const res = {
      id: updated.id,
      studentId: updated.learner_id,
      courseId: updated.course_id,
      enrolledAt: updated.created_at,
      status: ((updated.progress ?? 0) >= 100 ? 'completed' : 'active') as 'completed' | 'active',
      progressPercent: Number(updated.progress ?? 0),
      completedLessons,
      lastLessonId,
      completedAt: (updated.progress ?? 0) >= 100 ? new Date().toISOString() : undefined,
    };
    return await this.attachCourseDetails(supabase, res);
  }
}
