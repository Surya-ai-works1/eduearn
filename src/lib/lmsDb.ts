import { createClient } from "./supabase";

// Types
export interface Course {
  id: string;
  tutor_id: string;
  title: string;
  subtitle?: string;
  description?: string;
  category: string;
  level: string;
  thumbnail?: string;
  price: number;
  status: "published" | "draft";
  approval_status: "approved" | "pending" | "rejected";
  created_at: string;
  lessons?: Lesson[];
  assignments?: Assignment[];
  live_classes?: LiveClass[];
}

export interface Lesson {
  id: string;
  course_id: string;
  title: string;
  description?: string;
  video_url?: string;
  duration?: number;
  lesson_order: number;
  position?: number;
  created_at: string;
}

export interface Assignment {
  id: string;
  course_id: string;
  title: string;
  description?: string;
  file_url?: string;
  due_date?: string;
  created_at: string;
}

export interface LiveClass {
  id: string;
  course_id: string;
  tutor_id: string;
  title: string;
  description?: string;
  scheduled_at: string;
  duration: number;
  meeting_link: string;
  created_at: string;
}

export interface WithdrawalRequest {
  id: string;
  tutor_id: string;
  amount: number;
  status: "pending" | "approved" | "rejected";
  created_at: string;
}

export interface TutorEarnings {
  tutor_id: string;
  total_earnings: number;
  available_balance: number;
  withdrawn_amount: number;
  updated_at: string;
}

// Get the Supabase client
function getSupabase() {
  return createClient();
}

// ---------------------------------------------------------
// UNIFIED DATABASE SERVICE
// ---------------------------------------------------------
export const lmsDb = {
  // --- COURSES ---
  getCourses: async (tutorId: string): Promise<Course[]> => {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("courses")
      .select("*, lessons(*), assignments(*), live_classes(*)")
      .eq("tutor_id", tutorId);
    if (error) throw error;
    return data || [];
  },

  enrollStudent: async (learnerId: string, courseId: string): Promise<boolean> => {
    const supabase = getSupabase();
    const { error } = await supabase
      .from("enrollments")
      .insert({
        learner_id: learnerId,
        course_id: courseId,
        progress: 0,
      });
    if (error) throw error;

    // Fetch profile and course details for enrollment notification asynchronously
    (async () => {
      try {
        const [{ data: profile }, { data: course }] = await Promise.all([
          supabase.from("profiles").select("email, full_name").eq("id", learnerId).single(),
          supabase.from("courses").select("title").eq("id", courseId).single(),
        ]);

        if (profile?.email && course?.title) {
          const { emailClient } = await import("./email/client");
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

    return true;
  },

  getEnrolledCourses: async (learnerId: string): Promise<(Course & { progress?: number })[]> => {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("enrollments")
      .select("*, courses(*, lessons(*))")
      .eq("learner_id", learnerId);
    if (error) throw error;
    return (data || []).map((e: any) => ({
      ...e.courses,
      progress: e.progress || 0,
    }));
  },

  getAllPublishedCourses: async (): Promise<Course[]> => {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("courses")
      .select("*, lessons(*)")
      .eq("approval_status", "approved")
      .eq("status", "published");
    if (error) throw error;
    return data || [];
  },

  getCourseById: async (courseId: string): Promise<Course | null> => {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("courses")
      .select("*, lessons(*), assignments(*), live_classes(*)")
      .eq("id", courseId)
      .maybeSingle();
    if (error) throw error;
    if (data && data.lessons) {
      data.lessons.sort((a: any, b: any) => (a.position ?? a.lesson_order ?? 0) - (b.position ?? b.lesson_order ?? 0));
    }
    return data;
  },

  createCourse: async (tutorId: string, courseData: Omit<Course, "id" | "tutor_id" | "created_at" | "approval_status">): Promise<Course> => {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("courses")
      .insert({
        tutor_id: tutorId,
        ...courseData,
        approval_status: "approved", // auto-approve in dev/test environment
      })
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  updateCourse: async (courseId: string, updates: Partial<Course>): Promise<Course> => {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("courses")
      .update(updates)
      .eq("id", courseId)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  deleteCourse: async (courseId: string): Promise<boolean> => {
    const supabase = getSupabase();
    const { error } = await supabase.from("courses").delete().eq("id", courseId);
    if (error) throw error;
    return true;
  },

  // --- LESSONS (LECTURES) ---
  addLesson: async (courseId: string, lessonData: Omit<Lesson, "id" | "course_id" | "created_at">): Promise<Lesson> => {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("lessons")
      .insert({
        course_id: courseId,
        title: lessonData.title,
        description: lessonData.description || null,
        video_url: lessonData.video_url || null,
        duration: lessonData.duration || 0,
        lesson_order: lessonData.lesson_order || 0,
        position: lessonData.position || lessonData.lesson_order || 0,
      })
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  getCourseLessons: async (courseId: string): Promise<Lesson[]> => {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("lessons")
      .select("*")
      .eq("course_id", courseId)
      .order("position", { ascending: true });
    if (error) throw error;
    return data || [];
  },

  updateLesson: async (lessonId: string, updates: Partial<Lesson>): Promise<Lesson> => {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("lessons")
      .update(updates)
      .eq("id", lessonId)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  deleteLesson: async (lessonId: string): Promise<boolean> => {
    const supabase = getSupabase();
    const { error } = await supabase.from("lessons").delete().eq("id", lessonId);
    if (error) throw error;
    return true;
  },

  // --- ASSIGNMENTS ---
  addAssignment: async (courseId: string, assignData: Omit<Assignment, "id" | "course_id" | "created_at">): Promise<Assignment> => {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("assignments")
      .insert({
        course_id: courseId,
        ...assignData,
      })
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  // --- LIVE CLASSES ---
  addLiveClass: async (courseId: string, tutorId: string, liveData: Omit<LiveClass, "id" | "course_id" | "tutor_id" | "created_at">): Promise<LiveClass> => {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("live_classes")
      .insert({
        course_id: courseId,
        tutor_id: tutorId,
        ...liveData,
      })
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  // --- ANALYTICS & EARNINGS ---
  getTutorEarnings: async (tutorId: string): Promise<TutorEarnings> => {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("tutor_earnings")
      .select("*")
      .eq("tutor_id", tutorId)
      .maybeSingle();
    if (error) throw error;
    return data || { tutor_id: tutorId, total_earnings: 0, available_balance: 0, withdrawn_amount: 0, updated_at: new Date().toISOString() };
  },

  getWithdrawalRequests: async (tutorId: string): Promise<WithdrawalRequest[]> => {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("withdrawal_requests")
      .select("*")
      .eq("tutor_id", tutorId);
    if (error) throw error;
    return data || [];
  },

  requestWithdrawal: async (tutorId: string, amount: number): Promise<WithdrawalRequest> => {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("withdrawal_requests")
      .insert({ tutor_id: tutorId, amount })
      .select()
      .single();
    if (error) throw error;
    return data;
  },
};
