// src/lib/services/quizService.ts

import { QuizRepository } from "../repositories/quiz";
import { Quiz, QuizAttempt, Question } from "../types/quiz";

export class QuizService {
  async getStudentQuizzes(studentId: string): Promise<(Quiz & { latestAttempt?: QuizAttempt })[]> {
    const [quizzes, attempts] = await Promise.all([
      QuizRepository.getQuizzesByStudent(studentId),
      QuizRepository.getAttemptsByStudent(studentId)
    ]);

    return quizzes.map((quiz) => {
      // Find the latest attempt for this quiz
      const quizAttempts = attempts.filter((a) => a.quizId === quiz.id);
      const sorted = quizAttempts.sort((a, b) => new Date(b.submittedAt || b.startedAt).getTime() - new Date(a.submittedAt || a.startedAt).getTime());
      
      return {
        ...quiz,
        latestAttempt: sorted[0] || undefined
      };
    });
  }

  async getQuizDetails(id: string): Promise<Quiz | null> {
    return QuizRepository.getQuizById(id, false);
  }

  async submitQuiz(
    studentId: string,
    quizId: string,
    answers: Record<string, number | number[]>
  ): Promise<{ attempt: QuizAttempt; correctAnswers: Record<string, number | number[]> }> {
    // SECURITY: Pass includeAnswers = true for server-side grading ONLY
    const quiz = await QuizRepository.getQuizById(quizId, true);
    if (!quiz) throw new Error("Quiz not found");

    let totalMarks = 0;
    let earnedMarks = 0;
    const correctAnswers: Record<string, number | number[]> = {};

    quiz.questions.forEach((q) => {
      if (q.correctAnswer !== undefined) {
        correctAnswers[q.id] = q.correctAnswer;
      }
      const questionWeight = q.marks || 10;
      totalMarks += questionWeight;

      const studentAns = answers[q.id];
      if (studentAns !== undefined && q.correctAnswer !== undefined) {
        if (q.type === "multiple") {
          // Compare arrays of options selected
          const keyArray = Array.isArray(q.correctAnswer) ? q.correctAnswer : [q.correctAnswer as number];
          const ansArray = Array.isArray(studentAns) ? studentAns : [studentAns as number];

          // Check if both arrays have the same options
          const match =
            keyArray.length === ansArray.length &&
            keyArray.every((val) => ansArray.includes(val));
          if (match) earnedMarks += questionWeight;
        } else {
          // Single-choice comparison
          if (Number(studentAns) === Number(q.correctAnswer)) {
            earnedMarks += questionWeight;
          }
        }
      }
    });

    const percentage = totalMarks > 0 ? Math.round((earnedMarks / totalMarks) * 100) : 0;
    const passed = percentage >= quiz.passingScore;

    const attempt: QuizAttempt = {
      id: `att-${Date.now()}`,
      studentId,
      quizId,
      startedAt: new Date(Date.now() - 30000).toISOString(), // fallback guess
      submittedAt: new Date().toISOString(),
      answers,
      score: earnedMarks,
      percentage,
      status: "Submitted",
      passed,
    };

    const saved = await QuizRepository.saveAttempt(attempt);

    return {
      attempt: saved,
      correctAnswers,
    };
  }
}

export const quizService = new QuizService();
