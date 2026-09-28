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
  private async getCompletedLessonsFromDb(supabase: any, studentId: string, courseId: string): Promise<string[]> {
    try {
      const { data, error } = await supabase
        .from('learning_progress')
        .select('lesson_id')
        .eq('user_id', studentId)
        .eq('course_id', courseId)
        .eq('completed', true);

      if (error || !data) return [];
      return data.map((r: any) => r.lesson_id);
    } catch (err) {
      console.warn("Failed to fetch learning_progress from database:", err);
      return [];
    }
  }

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
      const completedLessons = await this.getCompletedLessonsFromDb(supabase, studentId, courseId);
      const enrollment = {
        id: existing.id,
        studentId: existing.learner_id,
        courseId: existing.course_id,
        enrolledAt: existing.created_at,
        status: ((existing.progress ?? 0) >= 100 ? 'completed' : 'active') as 'completed' | 'active',
        progressPercent: Number(existing.progress ?? 0),
        completedLessons,
      };
      return await this.attachCourseDetails(supabase, enrollment);
    }

    const insertClient = typeof window === 'undefined' && process.env.SUPABASE_SERVICE_ROLE_KEY
      ? (await import('@/lib/supabase/admin')).createAdminClient()
      : supabase;

    const { data: enrolled, error: enrollErr } = await insertClient
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

    // Authoritative lesson completion from learning_progress database table
    const completedLessons = await this.getCompletedLessonsFromDb(supabase, studentId, courseId);

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
    if (!data || data.length === 0) return [];

    // Batch fetch all learning_progress records for studentId
    const { data: allProgress } = await supabase
      .from('learning_progress')
      .select('course_id, lesson_id')
      .eq('user_id', studentId)
      .eq('completed', true);

    const progressByCourse: Record<string, string[]> = {};
    (allProgress || []).forEach((r: any) => {
      if (!progressByCourse[r.course_id]) progressByCourse[r.course_id] = [];
      progressByCourse[r.course_id].push(r.lesson_id);
    });

    const mapped = data.map((item: any) => {
      const completedLessons = progressByCourse[item.course_id] || [];
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
    _completedLessonsInput?: string[],
    _progressPercentInput?: number
  ): Promise<Enrollment> {
    const supabase = await getSupabaseClient();
    
    // 1. Verify active enrollment
    const { data: enrollment, error: fetchErr } = await supabase
      .from('enrollments')
      .select('id')
      .eq('learner_id', studentId)
      .eq('course_id', courseId)
      .single();

    if (fetchErr || !enrollment) throw new Error("Active enrollment required to update progress.");

    // 2. Authoritative lesson completion upsert in learning_progress
    if (lastLessonId) {
      const { data: lesson } = await supabase
        .from('lessons')
        .select('id, course_id')
        .eq('id', lastLessonId)
        .maybeSingle();

      if (lesson && lesson.course_id === courseId) {
        await supabase
          .from('learning_progress')
          .upsert({
            user_id: studentId,
            course_id: courseId,
            lesson_id: lastLessonId,
            completed: true,
            completed_at: new Date().toISOString(),
          }, { onConflict: 'user_id,lesson_id' });
      }
    }

    // 3. Count total course lessons from database
    const { data: courseLessons } = await supabase
      .from('lessons')
      .select('id')
      .eq('course_id', courseId);

    const totalLessons = courseLessons?.length || 1;

    // 4. Fetch authoritative completed lessons from DB
    const completedLessons = await this.getCompletedLessonsFromDb(supabase, studentId, courseId);
    const distinctCompleted = completedLessons.length;

    // 5. Calculate exact authoritative percentage
    const newProgress = distinctCompleted >= totalLessons
      ? 100
      : Math.min(100, Math.round((distinctCompleted / totalLessons) * 100));

    // 6. Update enrollments record with authoritative percentage
    const { data: updated, error: updateErr } = await supabase
      .from('enrollments')
      .update({
        progress: newProgress,
        updated_at: new Date().toISOString(),
      })
      .eq('id', enrollment.id)
      .select()
      .single();

    if (updateErr) throw updateErr;

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
