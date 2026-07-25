// src/lib/repositories/quizManagement/IQuizManagementRepository.ts

import { QuizItem, QuizAttemptItem, QuizPaginationResult } from "../../types/quizManagement";

export interface IQuizManagementRepository {
  getQuizzes(
    courseId: string,
    search?: string,
    filterStatus?: string,
    page?: number,
    limit?: number
  ): Promise<QuizPaginationResult>;

  createQuiz(
    courseId: string,
    quizData: Omit<QuizItem, "id" | "courseId" | "createdAt">
  ): Promise<QuizItem>;

  updateQuiz(
    quizId: string,
    updates: Partial<QuizItem>
  ): Promise<QuizItem>;

  deleteQuiz(quizId: string): Promise<boolean>;

  getAttempts(tutorId: string): Promise<QuizAttemptItem[]>;
}
