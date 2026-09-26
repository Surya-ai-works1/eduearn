// src/lib/repositories/courseDetails/SupabaseCourseDetailsRepository.ts

import { ICourseDetailsRepository } from './ICourseDetailsRepository';
import { Course } from '@/lib/types/course';
import { lmsDb } from '@/lib/lmsDb';

/**
 * Supabase implementation for Course Details.
 * Retrieves course data and lessons from database and manages authoritative DB lesson completion.
 */
export class SupabaseCourseDetailsRepository implements ICourseDetailsRepository {
  private async getSupabase() {
    if (typeof window === "undefined") {
      const { createClient } = await import("@/lib/supabase/server");
      const client = await createClient();
      if (client) return client;
    }
    const { createClient } = await import("@/lib/supabase/client");
    return createClient();
  }

  async getCourseDetails(courseId: string): Promise<Course | null> {
    const dbCourse = await lmsDb.getCourseById(courseId);
    if (!dbCourse) return null;

    const supabase = await this.getSupabase();
    let instructorName = "Tutor Instructor";
    let tutorAvatar = "";

    if (supabase) {
      try {
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name, display_name, avatar_url')
          .eq('id', dbCourse.tutor_id)
          .maybeSingle();

        if (profile) {
          instructorName = profile.full_name || profile.display_name || instructorName;
          tutorAvatar = profile.avatar_url || "";
        }
      } catch (err) {}
    }

    const lessons: any[] = (dbCourse.lessons || []).map((l: any) => ({
      id: l.id,
      title: l.title,
      description: l.description || "",
      duration: l.duration || 10,
      order: l.lesson_order ?? 0,
      type: "video",
      videoUrl: l.video_url || "",
      resources: [],
    }));

    const liveClasses: any[] = (dbCourse.live_classes || []).map((lc: any) => ({
      id: lc.id,
      title: lc.title,
      description: lc.description || "",
      scheduledAt: lc.scheduled_at,
      duration: lc.duration || 60,
      meetingLink: lc.meeting_link || "",
      provider: lc.provider || "google_meet",
      status: lc.status || "scheduled",
      createdAt: lc.created_at,
    }));

    return {
      id: dbCourse.id,
      title: dbCourse.title,
      description: dbCourse.description || dbCourse.subtitle || "",
      instructor: instructorName,
      thumbnailUrl: dbCourse.thumbnail || tutorAvatar || "",
      category: dbCourse.category,
      level: dbCourse.level,
      language: "English",
      duration: lessons.reduce((sum, l) => sum + (l.duration || 0), 0),
      rating: 4.8,
      totalLessons: lessons.length,
      enrolledCount: 150,
      lastUpdated: dbCourse.created_at,
      lessons,
      liveClasses,
    };
  }

  // Authoritative Lesson Completion: Records completed lesson ID in learning_progress and calculates exact progress
  async markLessonComplete(courseId: string, lessonId: string): Promise<void> {
    const supabase = await this.getSupabase();
    if (!supabase) {
      throw new Error("Supabase unconfigured");
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error("Unauthenticated user cannot complete lessons.");
    }

    // 1. Verify active enrollment
    const { data: enrollment, error: fetchErr } = await supabase
      .from('enrollments')
      .select('id, progress')
      .eq('learner_id', user.id)
      .eq('course_id', courseId)
      .maybeSingle();

    if (fetchErr || !enrollment) {
      throw new Error("Active enrollment required to complete lessons.");
    }

    // 2. Verify lesson belongs to specified course
    const { data: lesson, error: lessonErr } = await supabase
      .from('lessons')
      .select('id, course_id')
      .eq('id', lessonId)
      .maybeSingle();

    if (lessonErr || !lesson || lesson.course_id !== courseId) {
      throw new Error("Lesson does not belong to the specified course.");
    }

    // 3. Record lesson completion in database learning_progress (UNIQUE constraint on user_id, lesson_id prevents duplicate inflation)
    await supabase
      .from('learning_progress')
      .upsert({
        user_id: user.id,
        course_id: courseId,
        lesson_id: lessonId,
        completed: true,
        completed_at: new Date().toISOString(),
      }, { onConflict: 'user_id,lesson_id' });

    // 4. Count total lessons for course
    const { data: courseLessons } = await supabase
      .from('lessons')
      .select('id')
      .eq('course_id', courseId);

    const totalLessons = courseLessons?.length || 1;

    // 5. Count distinct completed lessons for user in this course
    const { data: completedProgress } = await supabase
      .from('learning_progress')
      .select('id')
      .eq('user_id', user.id)
      .eq('course_id', courseId)
      .eq('completed', true);

    const distinctCompleted = completedProgress?.length || 0;

    // 6. Calculate exact progress percentage
    const newProgress = distinctCompleted >= totalLessons
      ? 100
      : Math.min(100, Math.round((distinctCompleted / totalLessons) * 100));

    // 7. Update enrollments record with authoritative percentage
    const { error: updateErr } = await supabase
      .from('enrollments')
      .update({
        progress: newProgress,
        updated_at: new Date().toISOString(),
      })
      .eq('id', enrollment.id);

    if (updateErr) throw updateErr;
  }
}
