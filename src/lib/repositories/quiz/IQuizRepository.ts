// src/lib/repositories/quiz/IQuizRepository.ts

import { Quiz, QuizAttempt } from "../../types/quiz";

export interface IQuizRepository {
  getQuizzesByStudent(studentId: string): Promise<Quiz[]>;
  getQuizById(id: string): Promise<Quiz | null>;
  getAttemptsByStudent(studentId: string): Promise<QuizAttempt[]>;
  getAttempt(studentId: string, quizId: string): Promise<QuizAttempt | null>;
  saveAttempt(attempt: QuizAttempt): Promise<QuizAttempt>;
}
