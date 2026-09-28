// src/lib/repositories/quiz/SupabaseQuizRepository.ts

import { IQuizRepository } from "./IQuizRepository";
import { Quiz, QuizAttempt, Question } from "../../types/quiz";
import { createClient } from "../../supabase";

export class SupabaseQuizRepository implements IQuizRepository {
  private async getSupabase() {
    if (typeof window === "undefined") {
      const { createClient } = await import("../../supabase/server");
      const client = await createClient();
      if (client) return client;
    }
    return createClient();
  }

  async getQuizzesByStudent(studentId: string): Promise<Quiz[]> {
    const supabase = await this.getSupabase();

    // 1. Fetch enrolled course IDs
    const { data: enrollments, error: enrollError } = await supabase
      .from("enrollments")
      .select("course_id")
      .eq("learner_id", studentId);

    if (enrollError) throw enrollError;
    if (!enrollments || enrollments.length === 0) return [];

    const courseIds = enrollments.map((e: any) => e.course_id);

    // 2. Fetch quizzes for these courses
    const { data: quizzes, error: quizError } = await supabase
      .from("quizzes")
      .select("*, courses(title)")
      .in("course_id", courseIds);

    if (quizError) throw quizError;
    if (!quizzes) return [];

    return quizzes.map((item: any) => {
      const rawQuestions: any[] = Array.isArray(item.questions) ? item.questions : [];
      const questions: Question[] = rawQuestions.map((q: any, index: number) => ({
        id: q.id || `q-${item.id}-${index}`,
        quizId: item.id,
        type: q.type || "single",
        question: q.question || "Practice question",
        options: Array.isArray(q.options) ? q.options : [],
        // SECURITY: correctAnswer excluded from student GET payload
        marks: q.marks || 10,
      }));

      return {
        id: item.id,
        courseId: item.course_id,
        courseTitle: item.courses?.title || "Enrolled Course",
        title: item.title,
        description: item.description || "",
        duration: item.duration || 5, // fallback to 5 minutes
        totalQuestions: questions.length,
        passingScore: Number(item.passing_score || 60),
        questions,
      };
    });
  }

  async getQuizById(id: string, includeAnswers = false): Promise<Quiz | null> {
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
    if (!isUuid) return null;

    const supabase = await this.getSupabase();
    const { data: item, error } = await supabase
      .from("quizzes")
      .select("*, courses(title)")
      .eq("id", id)
      .maybeSingle();

    if (error) throw error;
    if (!item) return null;

    const rawQuestions: any[] = Array.isArray(item.questions) ? item.questions : [];
    const questions: Question[] = rawQuestions.map((q: any, index: number) => {
      const qObj: Question = {
        id: q.id || `q-${item.id}-${index}`,
        quizId: item.id,
        type: q.type || "single",
        question: q.question || "Practice question",
        options: Array.isArray(q.options) ? q.options : [],
        marks: q.marks || 10,
      };
      // SECURITY: includeAnswers = true strictly for server-side grading / tutor management
      if (includeAnswers) {
        qObj.correctAnswer = q.correctAnswer !== undefined ? q.correctAnswer : (q.correctAnswerIdx !== undefined ? q.correctAnswerIdx : 0);
      }
      return qObj;
    });

    return {
      id: item.id,
      courseId: item.course_id,
      courseTitle: item.courses?.title || "Enrolled Course",
      title: item.title,
      description: item.description || "",
      duration: item.duration || 5,
      totalQuestions: questions.length,
      passingScore: Number(item.passing_score || 60),
      questions,
    };
  }

  async getAttemptsByStudent(studentId: string): Promise<QuizAttempt[]> {
    const supabase = await this.getSupabase();
    const { data, error } = await supabase
      .from("quiz_attempts")
      .select("*")
      .eq("user_id", studentId);

    if (error) throw error;
    if (!data) return [];

    return data.map((item: any) => ({
      id: item.id,
      studentId: item.user_id,
      quizId: item.quiz_id,
      startedAt: item.completed_at,
      submittedAt: item.completed_at,
      answers: {}, // DB doesn't store individual answers
      score: Number(item.score),
      percentage: Number(item.score),
      status: "Submitted",
      passed: item.passed,
    }));
  }

  async getAttempt(studentId: string, quizId: string): Promise<QuizAttempt | null> {
    const supabase = await this.getSupabase();
    const { data, error } = await supabase
      .from("quiz_attempts")
      .select("*")
      .eq("user_id", studentId)
      .eq("quiz_id", quizId);

    if (error) throw error;
    if (!data || data.length === 0) return null;

    // Sort by latest completed
    const sorted = data.sort((a: any, b: any) => new Date(b.completed_at).getTime() - new Date(a.completed_at).getTime());
    const latest = sorted[0];

    return {
      id: latest.id,
      studentId: latest.user_id,
      quizId: latest.quiz_id,
      startedAt: latest.completed_at,
      submittedAt: latest.completed_at,
      answers: {},
      score: Number(latest.score),
      percentage: Number(latest.score),
      status: "Submitted",
      passed: latest.passed,
    };
  }

  async saveAttempt(attempt: QuizAttempt): Promise<QuizAttempt> {
    const supabase = await this.getSupabase();

    // Only save to DB if it is submitted
    if (attempt.status !== "Submitted") {
      return attempt; // Skip transient in-progress saves in database
    }

    const insertPayload: any = {
      user_id: attempt.studentId,
      quiz_id: attempt.quizId,
      score: attempt.percentage, // save percentage as score
      passed: attempt.passed || false,
      completed_at: attempt.submittedAt || new Date().toISOString(),
    };
    if (attempt.id && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(attempt.id)) {
      insertPayload.id = attempt.id;
    }

    const { data, error } = await supabase
      .from("quiz_attempts")
      .insert(insertPayload)
      .select()
      .single();

    if (error) throw error;

    return {
      id: data.id,
      studentId: data.user_id,
      quizId: data.quiz_id,
      startedAt: data.completed_at,
      submittedAt: data.completed_at,
      answers: attempt.answers,
      score: Number(data.score),
      percentage: Number(data.score),
      status: "Submitted",
      passed: data.passed,
    };
  }
}
