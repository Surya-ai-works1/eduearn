// src/lib/repositories/quizManagement/SupabaseQuizManagementRepository.ts

import { IQuizManagementRepository } from "./IQuizManagementRepository";
import { QuizItem, QuizAttemptItem, QuizPaginationResult } from "../../types/quizManagement";
import { createClient } from "../../supabase";

export class SupabaseQuizManagementRepository implements IQuizManagementRepository {
  async getQuizzes(
    courseId: string,
    search?: string,
    filterStatus?: string,
    page: number = 1,
    limit: number = 6
  ): Promise<QuizPaginationResult> {
    const supabase = createClient();

    let query = supabase
      .from("quizzes")
      .select("*", { count: "exact" })
      .eq("course_id", courseId);

    if (search && search.trim()) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
    }

    query = query.order("created_at", { ascending: false });

    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to);

    const { data, count, error } = await query;
    if (error) throw error;

    const items = (data || []).map((q: any) => ({
      id: q.id,
      courseId: q.course_id,
      title: q.title,
      description: q.description || "",
      passingScore: Number(q.passing_score || 60),
      // TODO: Add time_limit column to public.quizzes table in future database migration
      timeLimit: 30, // Default 30 mins
      questions: Array.isArray(q.questions) ? q.questions : [],
      status: "published" as const,
      createdAt: q.created_at,
    }));

    const total = count || 0;
    const pages = Math.ceil(total / limit) || 1;

    return {
      items,
      total,
      page,
      pages,
    };
  }

  async createQuiz(
    courseId: string,
    quizData: Omit<QuizItem, "id" | "courseId" | "createdAt">
  ): Promise<QuizItem> {
    const supabase = createClient();

    const { data, error } = await supabase
      .from("quizzes")
      .insert({
        course_id: courseId,
        title: quizData.title,
        description: quizData.description,
        passing_score: quizData.passingScore,
        questions: quizData.questions,
      })
      .select()
      .single();

    if (error || !data) {
      throw error || new Error("Failed to create quiz in database");
    }

    return {
      id: data.id,
      courseId: data.course_id,
      title: data.title,
      description: data.description || "",
      passingScore: Number(data.passing_score),
      timeLimit: 30,
      questions: Array.isArray(data.questions) ? data.questions : [],
      status: "published",
      createdAt: data.created_at,
    };
  }

  async updateQuiz(
    quizId: string,
    updates: Partial<QuizItem>
  ): Promise<QuizItem> {
    const supabase = createClient();

    const dbUpdates: any = {};
    if (updates.title !== undefined) dbUpdates.title = updates.title;
    if (updates.description !== undefined) dbUpdates.description = updates.description;
    if (updates.passingScore !== undefined) dbUpdates.passing_score = updates.passingScore;
    if (updates.questions !== undefined) dbUpdates.questions = updates.questions;

    const { data, error } = await supabase
      .from("quizzes")
      .update(dbUpdates)
      .eq("id", quizId)
      .select()
      .single();

    if (error || !data) {
      throw error || new Error("Failed to update quiz in database");
    }

    return {
      id: data.id,
      courseId: data.course_id,
      title: data.title,
      description: data.description || "",
      passingScore: Number(data.passing_score),
      timeLimit: 30,
      questions: Array.isArray(data.questions) ? data.questions : [],
      status: "published",
      createdAt: data.created_at,
    };
  }

  async deleteQuiz(quizId: string): Promise<boolean> {
    const supabase = createClient();
    const { error } = await supabase
      .from("quizzes")
      .delete()
      .eq("id", quizId);

    if (error) throw error;
    return true;
  }

  async getAttempts(tutorId: string): Promise<QuizAttemptItem[]> {
    const supabase = createClient();

    // 1. Fetch tutor courses
    const { data: coursesData, error: coursesError } = await supabase
      .from("courses")
      .select("id, title")
      .eq("tutor_id", tutorId);

    if (coursesError) throw coursesError;
    if (!coursesData || coursesData.length === 0) return [];

    const courseIds = coursesData.map((c: any) => c.id);
    const courseTitleMap = new Map<string, string>(coursesData.map((c: any) => [c.id, c.title]));

    // 2. Fetch tutor quizzes
    const { data: quizzesData, error: quizzesError } = await supabase
      .from("quizzes")
      .select("id, title, course_id")
      .in("course_id", courseIds);

    if (quizzesError) throw quizzesError;
    if (!quizzesData || quizzesData.length === 0) return [];

    const quizIds = quizzesData.map((q: any) => q.id);
    const quizTitleMap = new Map<string, string>(quizzesData.map((q: any) => [q.id, q.title]));
    const quizCourseMap = new Map<string, string>(quizzesData.map((q: any) => [q.id, q.course_id]));

    // 3. Fetch attempts
    const { data: attemptsData, error: attemptsError } = await supabase
      .from("quiz_attempts")
      .select("*")
      .in("quiz_id", quizIds);

    if (attemptsError) throw attemptsError;
    if (!attemptsData || attemptsData.length === 0) return [];

    // 4. Fetch profiles
    const studentIds = Array.from(new Set(attemptsData.map((a: any) => a.user_id)));
    const { data: profilesData, error: profilesError } = await supabase
      .from("profiles")
      .select("id, full_name, email")
      .in("id", studentIds);

    if (profilesError) throw profilesError;

    const studentProfileMap = new Map<string, { name: string; email: string }>(
      (profilesData || []).map((p: any) => [p.id, { name: p.full_name, email: p.email }])
    );

    // 5. Map
    return attemptsData.map((a: any) => {
      const quizTitle = quizTitleMap.get(a.quiz_id) || "Unknown Quiz";
      const courseId = quizCourseMap.get(a.quiz_id) || "";
      const courseTitle = courseTitleMap.get(courseId) || "Unknown Course";
      const profile = studentProfileMap.get(a.user_id);

      return {
        id: a.id,
        quizId: a.quiz_id,
        quizTitle,
        courseTitle,
        studentId: a.user_id,
        studentName: profile?.name || "Unknown Student",
        studentEmail: profile?.email || "",
        score: Number(a.score),
        passed: Boolean(a.passed),
        completedAt: a.completed_at,
      };
    });
  }
}
