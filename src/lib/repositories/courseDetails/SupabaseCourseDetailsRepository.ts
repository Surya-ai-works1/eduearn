// src/lib/repositories/courseDetails/SupabaseCourseDetailsRepository.ts

import { ICourseDetailsRepository } from './ICourseDetailsRepository';
import { Course } from '@/lib/types/course';
import { lmsDb } from '@/lib/lmsDb';
import { createClient } from '@/lib/supabase';

/**
 * Supabase implementation for Course Details.
 * Retrieves course data and lessons from the database using the lmsDb abstraction.
 * Marking a lesson complete updates the enrollment progress for the current learner.
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
    };
  }

  // Mark a lesson as completed for the logged-in learner.
  async markLessonComplete(courseId: string, lessonId: string): Promise<void> {
    const supabase = await this.getSupabase();
    if (!supabase) return; // Supabase not configured — skip silently.

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return; // No authenticated user — silently ignore.

    // Fetch the current enrollment record for this learner and course.
    const { data: enrollment, error: fetchErr } = await supabase
      .from('enrollments')
      .select('id, progress')
      .eq('learner_id', user.id)
      .eq('course_id', courseId)
      .single();
    if (fetchErr) throw fetchErr;

    // Derive lesson progress dynamically based on total course lessons count, ensuring 100% on final lesson.
    const dbCourse = await lmsDb.getCourseById(courseId);
    const totalLessons = Math.max(1, dbCourse?.lessons?.length || 10);
    const step = 100 / totalLessons;
    const currentProgress = enrollment?.progress ?? 0;
    const rawProgress = currentProgress + step;
    const newProgress = rawProgress >= 100 - (step / 2) ? 100 : Math.min(100, Math.round(rawProgress));

    const { error: updateErr } = await supabase
      .from('enrollments')
      .update({ progress: newProgress })
      .eq('id', enrollment.id);
    if (updateErr) throw updateErr;
  }
}
